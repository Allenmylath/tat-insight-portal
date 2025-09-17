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
  type: 'timer_update' | 'session_complete' | 'error' | 'session_recovered';
  timeRemaining?: number;
  sessionId?: string;
  message?: string;
  recoveredSession?: {
    sessionId: string;
    timeRemaining: number;
    status: string;
  };
}

interface TimerState {
  timeRemaining: number;
  isActive: boolean;
  sessionId: string | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isRecovering: boolean;
  lastConnectionType: 'initial' | 'reconnect' | 'recovery' | null;
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
    connectionStatus: 'disconnected',
    isRecovering: false,
    lastConnectionType: null
  });
  
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const currentStateRef = useRef(timerState);

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

  // Keep current state ref in sync
  useEffect(() => {
    currentStateRef.current = timerState;
  }, [timerState]);

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

      // Check if session is still valid (not expired)
      const sessionStartTime = new Date(data.started_at).getTime();
      const sessionDuration = data.session_duration_seconds * 1000;
      const now = Date.now();
      const elapsed = now - sessionStartTime;

      if (elapsed >= sessionDuration) {
        // Session expired, update status
        await updateSessionStatus(data.id, 'abandoned');
        return null;
      }

      // Use time_remaining from database instead of calculating
      const timeRemaining = data.time_remaining || 0;
      return {
        sessionId: data.id,
        timeRemaining: Math.floor(timeRemaining),
        status: data.status
      };
    } catch (err) {
      console.error('Failed to recover session:', err);
      return null;
    }
  }, [userData, tatTestId, durationMinutes]);

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

  const connectWebSocket = useCallback((sessionId: string, connectionType: 'initial' | 'reconnect' | 'recovery' = 'initial') => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setTimerState(prev => ({ ...prev, connectionStatus: 'connecting', lastConnectionType: connectionType }));

    // Note: Replace with actual Modal Labs WebSocket URL when available
    const wsUrl = `wss://your-modal-service.com/timer/${sessionId}`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log(`Timer WebSocket connected (${connectionType})`);
        setTimerState(prev => ({ ...prev, connectionStatus: 'connected' }));
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Send appropriate message based on connection type
        const currentState = currentStateRef.current;
        let message;

        if (connectionType === 'initial') {
          message = {
            type: 'start_timer',
            sessionId,
            durationSeconds: durationMinutes * 60
          };
        } else if (connectionType === 'reconnect') {
          message = {
            type: 'resume_timer',
            sessionId,
            timeRemaining: currentState.timeRemaining,
            lastKnownTime: currentState.timeRemaining
          };
        } else if (connectionType === 'recovery') {
          message = {
            type: 'session_recovery',
            sessionId,
            timeRemaining: currentState.timeRemaining
          };
        }

        wsRef.current?.send(JSON.stringify(message));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: TimerMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'timer_update':
              if (message.timeRemaining !== undefined) {
                setTimerState(prev => ({
                  ...prev,
                  timeRemaining: message.timeRemaining!,
                  isActive: message.timeRemaining! > 0
                }));

                if (message.timeRemaining === 0) {
                  onTimeUp?.();
                }
              }
              break;
              
            case 'session_complete':
              setTimerState(prev => ({
                ...prev,
                isActive: false,
                timeRemaining: 0
              }));
              onSessionEnd?.();
              break;

            case 'session_recovered':
              if (message.recoveredSession) {
                setTimerState(prev => ({
                  ...prev,
                  sessionId: message.recoveredSession!.sessionId,
                  timeRemaining: message.recoveredSession!.timeRemaining,
                  isActive: message.recoveredSession!.status === 'active',
                  isRecovering: false
                }));
              }
              break;
              
            case 'error':
              setError(message.message || 'Timer service error');
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Timer WebSocket disconnected');
        setTimerState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
        
        // Attempt reconnection with exponential backoff
        const currentState = currentStateRef.current;
        if (currentState.isActive && reconnectAttemptsRef.current < 5) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connectWebSocket(sessionId, 'reconnect');
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Timer WebSocket error:', error);
        setTimerState(prev => ({ ...prev, connectionStatus: 'error' }));
        setError('Connection to timer service failed');
      };

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to timer service');
    }
  }, [durationMinutes, onTimeUp, onSessionEnd]);

  const startTimer = useCallback(async () => {
    if (!userData || timerState.isActive) return;

    // First try to recover existing session
    setTimerState(prev => ({ ...prev, isRecovering: true }));
    const recoveredSession = await recoverSession();
    
    if (recoveredSession) {
      // Resume existing session
      setTimerState(prev => ({
        ...prev,
        sessionId: recoveredSession.sessionId,
        isActive: true,
        timeRemaining: recoveredSession.timeRemaining,
        isRecovering: false
      }));
      connectWebSocket(recoveredSession.sessionId, 'recovery');
      return;
    }

    // Create new session
    const sessionId = await createSession();
    if (!sessionId) {
      setTimerState(prev => ({ ...prev, isRecovering: false }));
      return;
    }

    setTimerState(prev => ({
      ...prev,
      sessionId,
      isActive: true,
      timeRemaining: durationMinutes * 60,
      isRecovering: false
    }));

    connectWebSocket(sessionId, 'initial');
  }, [userData, timerState.isActive, createSession, recoverSession, connectWebSocket, durationMinutes]);

  const completeSession = useCallback(async () => {
    if (!timerState.sessionId) return;

    await updateSessionStatus(timerState.sessionId, 'completed');
    
    setTimerState(prev => ({
      ...prev,
      isActive: false
    }));

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'complete_session',
        sessionId: timerState.sessionId
      }));
      wsRef.current.close();
    }

    onSessionEnd?.();
  }, [timerState.sessionId, updateSessionStatus, onSessionEnd]);

  const abandonSession = useCallback(async () => {
    if (!timerState.sessionId) return;

    await updateSessionStatus(timerState.sessionId, 'abandoned');
    
    setTimerState(prev => ({
      ...prev,
      isActive: false
    }));

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'abandon_session',
        sessionId: timerState.sessionId
      }));
      wsRef.current.close();
    }
  }, [timerState.sessionId, updateSessionStatus]);

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

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // Timer state
    timeRemaining: timerState.timeRemaining,
    timeFormatted: formatTime(timerState.timeRemaining),
    isActive: timerState.isActive,
    connectionStatus: timerState.connectionStatus,
    sessionId: timerState.sessionId,
    error,

    // Actions
    startTimer,
    completeSession,
    abandonSession,

    // Status checks
    isConnected: timerState.connectionStatus === 'connected',
    isExpired: timerState.timeRemaining === 0,
    canStart: !timerState.isActive && !timerState.isRecovering && !!userData,
    isRecovering: timerState.isRecovering,
    connectionType: timerState.lastConnectionType
  };
};