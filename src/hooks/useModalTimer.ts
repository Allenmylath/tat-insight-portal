import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserData } from './useUserData';

interface UseModalTimerParams {
  tatTestId: string;
  durationMinutes: number;
  onTimeUp?: () => void;
  onSessionEnd?: () => void;
}

interface TimerMessage {
  type: 'connection_success' | 'timer_update' | 'timer_complete' | 'timer_stopped';
  timeRemaining?: number;
  sessionId?: string;
  containerId?: string;
  message?: string;
}

interface TimerState {
  timeRemaining: number;
  isActive: boolean;
  sessionId: string | null;
  containerId: string | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isRecovering: boolean;
}

export const useModalTimer = ({ 
  tatTestId, 
  durationMinutes, 
  onTimeUp, 
  onSessionEnd 
}: UseModalTimerParams) => {
  const { userData } = useUserData();
  const [timerState, setTimerState] = useState<TimerState>({
    timeRemaining: durationMinutes * 60,
    isActive: false,
    sessionId: null,
    containerId: null,
    connectionStatus: 'disconnected',
    isRecovering: false
  });
  
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const createSession = useCallback(async () => {
    if (!userData) return null;

    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .insert({
          user_id: userData.id,
          tattest_id: tatTestId,
          status: 'active',
          session_duration_seconds: durationMinutes * 60,
          time_remaining: durationMinutes * 60,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to create test session');
      return null;
    }
  }, [userData, tatTestId, durationMinutes]);

  const recoverSession = useCallback(async () => {
    if (!userData) return null;

    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('user_id', userData.id)
        .eq('tattest_id', tatTestId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      const timeRemaining = data.time_remaining || 0;
      if (timeRemaining <= 0) {
        await updateSessionStatus(data.id, 'abandoned');
        return null;
      }

      return {
        sessionId: data.id,
        timeRemaining: Math.floor(timeRemaining),
        status: data.status
      };
    } catch (err) {
      console.error('Failed to recover session:', err);
      return null;
    }
  }, [userData, tatTestId]);

  const updateSessionStatus = useCallback(async (sessionId: string, status: 'completed' | 'abandoned') => {
    try {
      await supabase
        .from('test_sessions')
        .update({
          status,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    } catch (err) {
      console.error('Failed to update session status:', err);
    }
  }, []);

  const connectToContainer = useCallback((sessionId: string, action: 'start' | 'resume', actionData: any) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setTimerState(prev => ({ 
      ...prev, 
      connectionStatus: 'connecting',
      sessionId 
    }));

    const wsUrl = `wss://manjujayamurali--simple-timer-service-create-timer.modal.run/timer/${sessionId}`;
    
    console.log(`Connecting to container for session ${sessionId}`);
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log(`WebSocket opened for session ${sessionId}`);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: TimerMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connection_success':
              console.log(`Connection success: ${message.message}`);
              setTimerState(prev => ({ 
                ...prev, 
                connectionStatus: 'connected',
                containerId: message.containerId 
              }));
              setError(null);
              
              // Now send the action command
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                const command = action === 'start' 
                  ? { type: 'start_timer', sessionId, durationSeconds: actionData.duration }
                  : { type: 'resume_timer', sessionId, timeRemaining: actionData.timeRemaining };
                
                wsRef.current.send(JSON.stringify(command));
                console.log(`Sent ${action} command`);
              }
              break;
              
            case 'timer_update':
              if (message.timeRemaining !== undefined) {
                setTimerState(prev => ({
                  ...prev,
                  timeRemaining: message.timeRemaining!,
                  isActive: message.timeRemaining! > 0,
                  isRecovering: false
                }));

                // Update database every 10 seconds
                if (message.timeRemaining % 10 === 0) {
                  supabase
                    .from('test_sessions')
                    .update({ time_remaining: message.timeRemaining })
                    .eq('id', sessionId);
                }

                if (message.timeRemaining === 0) {
                  onTimeUp?.();
                }
              }
              break;
              
            case 'timer_complete':
              console.log(`Timer completed for session ${sessionId}`);
              setTimerState(prev => ({
                ...prev,
                isActive: false,
                timeRemaining: 0,
                connectionStatus: 'disconnected'
              }));
              
              updateSessionStatus(sessionId, 'completed');
              onSessionEnd?.();
              break;

            case 'timer_stopped':
              console.log(`Timer stopped for session ${sessionId}`);
              setTimerState(prev => ({
                ...prev,
                isActive: false,
                connectionStatus: 'disconnected'
              }));
              break;
          }
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      wsRef.current.onclose = () => {
        console.log(`WebSocket closed for session ${sessionId}`);
        setTimerState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setTimerState(prev => ({ ...prev, connectionStatus: 'error' }));
        setError('Connection failed');
      };

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to timer service');
    }
  }, [onTimeUp, onSessionEnd, updateSessionStatus]);

  const startTimer = useCallback(async () => {
    if (!userData || timerState.isActive) return;

    setTimerState(prev => ({ ...prev, isRecovering: true }));
    
    // Try to recover existing session
    const recoveredSession = await recoverSession();
    
    if (recoveredSession) {
      console.log(`Recovering session ${recoveredSession.sessionId}`);
      setTimerState(prev => ({
        ...prev,
        timeRemaining: recoveredSession.timeRemaining
      }));
      connectToContainer(recoveredSession.sessionId, 'resume', { 
        timeRemaining: recoveredSession.timeRemaining 
      });
    } else {
      // Create new session
      const sessionId = await createSession();
      if (!sessionId) {
        setTimerState(prev => ({ ...prev, isRecovering: false }));
        return;
      }

      console.log(`Starting new session ${sessionId}`);
      connectToContainer(sessionId, 'start', { 
        duration: durationMinutes * 60 
      });
    }
  }, [userData, timerState.isActive, createSession, recoverSession, connectToContainer, durationMinutes]);

  const stopTimer = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && timerState.sessionId) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_timer',
        sessionId: timerState.sessionId
      }));
    }
  }, [timerState.sessionId]);

  const completeSession = useCallback(async () => {
    if (timerState.sessionId) {
      // Stop the timer via WebSocket if connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'stop_timer',
          sessionId: timerState.sessionId
        }));
      }

      // Update session status in Supabase
      await updateSessionStatus(timerState.sessionId, 'completed');

      // Clean up WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Update timer state
      setTimerState(prev => ({
        ...prev,
        isActive: false,
        connectionStatus: 'disconnected'
      }));

      // Call the callback
      onSessionEnd?.();
    }
  }, [timerState.sessionId, updateSessionStatus, onSessionEnd]);

  const abandonSession = useCallback(async () => {
    if (timerState.sessionId) {
      // Stop the timer via WebSocket if connected
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'stop_timer',
          sessionId: timerState.sessionId
        }));
      }

      // Update session status in Supabase
      await updateSessionStatus(timerState.sessionId, 'abandoned');

      // Clean up WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Update timer state
      setTimerState(prev => ({
        ...prev,
        isActive: false,
        connectionStatus: 'disconnected'
      }));

      // Call the callback
      onSessionEnd?.();
    }
  }, [timerState.sessionId, updateSessionStatus, onSessionEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (timerState.sessionId && timerState.isActive) {
        updateSessionStatus(timerState.sessionId, 'abandoned');
      }
    };
  }, [timerState.sessionId, timerState.isActive, updateSessionStatus]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeRemaining: timerState.timeRemaining,
    timeFormatted: formatTime(timerState.timeRemaining),
    isActive: timerState.isActive,
    connectionStatus: timerState.connectionStatus,
    sessionId: timerState.sessionId,
    containerId: timerState.containerId,
    error,

    startTimer,
    stopTimer,
    completeSession,
    abandonSession,

    isConnected: timerState.connectionStatus === 'connected',
    isExpired: timerState.timeRemaining === 0,
    canStart: !timerState.isActive && !timerState.isRecovering && !!userData,
    isRecovering: timerState.isRecovering
  };
};