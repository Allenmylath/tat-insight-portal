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

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

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
  const retryCountRef = useRef<number>(0);
  const isConnectingRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  // Track component mount status
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const createSession = useCallback(async () => {
    if (!userData || !mountedRef.current) return null;

    try {
      console.log('Creating new session...');
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
      console.log('Session created:', data.id);
      return data.id;
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to create test session');
      return null;
    }
  }, [userData, tatTestId, durationMinutes]);

  const recoverSession = useCallback(async () => {
    if (!userData || !mountedRef.current) return null;

    try {
      console.log('Attempting to recover session...');
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('user_id', userData.id)
        .eq('tattest_id', tatTestId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        console.log('No recoverable session found');
        return null;
      }

      const timeRemaining = data.time_remaining || 0;
      if (timeRemaining <= 0) {
        console.log('Session expired, abandoning...');
        await updateSessionStatus(data.id, 'abandoned');
        return null;
      }

      console.log('Session recovered:', data.id, 'Time remaining:', timeRemaining);
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
    if (!mountedRef.current) return;
    
    try {
      console.log(`Updating session ${sessionId} status to:`, status);
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

  const cleanupConnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    
    isConnectingRef.current = false;
  }, []);

  const connectToContainer = useCallback((sessionId: string, action: 'start' | 'resume', actionData: any) => {
    if (!mountedRef.current || isConnectingRef.current) {
      console.log('Connection blocked: component unmounted or already connecting');
      return;
    }

    // Clean up any existing connection
    cleanupConnection();
    isConnectingRef.current = true;

    setTimerState(prev => ({ 
      ...prev, 
      connectionStatus: 'connecting',
      sessionId 
    }));

    // FIXED: Removed "-app" from URL
    const wsUrl = `wss://manjujayamurali--simple-timer-service-create-timer.modal.run/timer/${sessionId}`;
    
    console.log(`Connecting to container for session ${sessionId}`);
    console.log(`WebSocket URL: ${wsUrl}`);
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        if (!mountedRef.current) return;
        
        console.log(`WebSocket opened for session ${sessionId}`);
        retryCountRef.current = 0; // Reset retry count on successful connection
        isConnectingRef.current = false;
      };

      wsRef.current.onmessage = (event) => {
        if (!mountedRef.current) return;
        
        try {
          const message: TimerMessage = JSON.parse(event.data);
          console.log(`Received message:`, message);
          
          switch (message.type) {
            case 'connection_success':
              console.log(`Connection success: ${message.message}`);
              setTimerState(prev => ({ 
                ...prev, 
                connectionStatus: 'connected',
                containerId: message.containerId 
              }));
              setError(null);
              
              // Send the action command
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                const command = action === 'start' 
                  ? { type: 'start_timer', sessionId, durationSeconds: actionData.duration }
                  : { type: 'resume_timer', sessionId, timeRemaining: actionData.timeRemaining };
                
                wsRef.current.send(JSON.stringify(command));
                console.log(`Sent ${action} command:`, command);
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
                    .eq('id', sessionId)
                    .then(() => console.log(`Updated DB time remaining: ${message.timeRemaining}`))
                    .catch(err => console.error('DB update error:', err));
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
              cleanupConnection();
              onSessionEnd?.();
              break;

            case 'timer_stopped':
              console.log(`Timer stopped for session ${sessionId}`);
              setTimerState(prev => ({
                ...prev,
                isActive: false,
                connectionStatus: 'disconnected'
              }));
              cleanupConnection();
              break;
          }
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        if (!mountedRef.current) return;
        
        console.log(`WebSocket closed for session ${sessionId}`, event.code, event.reason);
        isConnectingRef.current = false;
        
        setTimerState(prev => ({ 
          ...prev, 
          connectionStatus: 'disconnected' 
        }));

        // Only attempt retry if it wasn't a clean close and we haven't exceeded max retries
        if (event.code !== 1000 && retryCountRef.current < MAX_RETRY_ATTEMPTS) {
          const retryDelay = RETRY_DELAY_BASE * Math.pow(2, retryCountRef.current);
          console.log(`Scheduling retry ${retryCountRef.current + 1}/${MAX_RETRY_ATTEMPTS} in ${retryDelay}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!mountedRef.current) return;
            
            retryCountRef.current++;
            console.log(`Retry attempt ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS}`);
            connectToContainer(sessionId, action, actionData);
          }, retryDelay);
        } else if (retryCountRef.current >= MAX_RETRY_ATTEMPTS) {
          console.log(`Max retry attempts reached for session ${sessionId}`);
          setError('Connection failed after multiple attempts');
          setTimerState(prev => ({ 
            ...prev, 
            connectionStatus: 'error',
            isRecovering: false 
          }));
        }
      };

      wsRef.current.onerror = (error) => {
        if (!mountedRef.current) return;
        
        console.error('WebSocket error:', error);
        isConnectingRef.current = false;
        
        setTimerState(prev => ({ 
          ...prev, 
          connectionStatus: 'error' 
        }));
        
        // Don't set permanent error here, let onclose handle retries
      };

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      isConnectingRef.current = false;
      setError('Failed to connect to timer service');
      setTimerState(prev => ({ 
        ...prev, 
        connectionStatus: 'error',
        isRecovering: false 
      }));
    }
  }, [onTimeUp, onSessionEnd, updateSessionStatus, cleanupConnection]);

  const startTimer = useCallback(async () => {
    if (!userData || timerState.isActive || isConnectingRef.current) {
      console.log('Start timer blocked:', { 
        hasUserData: !!userData, 
        isActive: timerState.isActive,
        isConnecting: isConnectingRef.current 
      });
      return;
    }

    console.log('Starting timer...');
    setTimerState(prev => ({ ...prev, isRecovering: true }));
    setError(null);
    retryCountRef.current = 0;
    
    try {
      // Try to recover existing session first
      const recoveredSession = await recoverSession();
      
      if (recoveredSession && mountedRef.current) {
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
        if (!sessionId || !mountedRef.current) {
          setTimerState(prev => ({ ...prev, isRecovering: false }));
          return;
        }

        console.log(`Starting new session ${sessionId}`);
        connectToContainer(sessionId, 'start', { 
          duration: durationMinutes * 60 
        });
      }
    } catch (err) {
      console.error('Error in startTimer:', err);
      setError('Failed to start timer');
      setTimerState(prev => ({ ...prev, isRecovering: false }));
    }
  }, [userData, timerState.isActive, createSession, recoverSession, connectToContainer, durationMinutes]);

  const stopTimer = useCallback(() => {
    console.log('Stopping timer...');
    if (wsRef.current?.readyState === WebSocket.OPEN && timerState.sessionId) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_timer',
        sessionId: timerState.sessionId
      }));
    }
    cleanupConnection();
  }, [timerState.sessionId, cleanupConnection]);

  const completeSession = useCallback(async () => {
    console.log('Completing session...');
    if (timerState.sessionId) {
      await updateSessionStatus(timerState.sessionId, 'completed');
    }
    cleanupConnection();
    setTimerState(prev => ({
      ...prev,
      isActive: false,
      connectionStatus: 'disconnected'
    }));
  }, [timerState.sessionId, updateSessionStatus, cleanupConnection]);

  const abandonSession = useCallback(async () => {
    console.log('Abandoning session...');
    if (timerState.sessionId) {
      await updateSessionStatus(timerState.sessionId, 'abandoned');
    }
    cleanupConnection();
    setTimerState(prev => ({
      ...prev,
      isActive: false,
      connectionStatus: 'disconnected'
    }));
  }, [timerState.sessionId, updateSessionStatus, cleanupConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('useModalTimer cleanup');
      mountedRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      // Note: We don't update session status here to avoid race conditions
      // The session will be marked as abandoned when the user navigates away
    };
  }, []); // Empty dependency array to run only on mount/unmount

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
    canStart: !timerState.isActive && !timerState.isRecovering && !!userData && !isConnectingRef.current,
    isRecovering: timerState.isRecovering
  };
};