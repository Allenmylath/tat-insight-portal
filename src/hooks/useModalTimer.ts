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

// Connection states for clear state machine
type ConnectionState = 
  | 'idle'           // Not connected, not trying
  | 'checking'       // Checking for existing session
  | 'connecting'     // Establishing WebSocket connection
  | 'connected'      // WebSocket connected, waiting for command
  | 'timer_running'  // Timer actively counting down
  | 'completed'      // Timer finished
  | 'error';         // Connection or timer error

interface TimerState {
  connectionState: ConnectionState;
  timeRemaining: number;
  sessionId: string | null;
  containerId: string | null;
  isRecoveredSession: boolean;
  isCompleting: boolean;
}

const INITIAL_STATE: TimerState = {
  connectionState: 'idle',
  timeRemaining: 0,
  sessionId: null,
  containerId: null,
  isRecoveredSession: false,
  isCompleting: false,
};

export const useModalTimer = ({ 
  tatTestId, 
  durationMinutes, 
  onTimeUp, 
  onSessionEnd 
}: UseModalTimerParams) => {
  const { userData } = useUserData();
  const [timerState, setTimerState] = useState<TimerState>({
    ...INITIAL_STATE,
    timeRemaining: durationMinutes * 60
  });
  const [error, setError] = useState<string | null>(null);
  
  // Refs for WebSocket and cleanup
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef<boolean>(true);
  const initializationStartedRef = useRef<boolean>(false);
  const timeUpCalledRef = useRef<boolean>(false); // Track if onTimeUp was already called

  // Track component mount status
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Helper function to safely update state
  const safeSetState = useCallback((updater: (prev: TimerState) => TimerState) => {
    if (mountedRef.current) {
      setTimerState(updater);
    }
  }, []);

  // Helper function to safely set error
  const safeSetError = useCallback((errorMessage: string | null) => {
    if (mountedRef.current) {
      setError(errorMessage);
    }
  }, []);

  // Session management functions
  const checkExistingSession = useCallback(async (): Promise<{sessionId: string, timeRemaining: number} | null> => {
    if (!userData?.id) return null;

    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('user_id', userData.id)
        .eq('tattest_id', tatTestId)
        .in('status', ['active', 'paused'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      const timeRemaining = data.time_remaining || 0;
      if (timeRemaining <= 0) {
        // Session expired, mark as abandoned
        await supabase
          .from('test_sessions')
          .update({ status: 'abandoned' })
          .eq('id', data.id);
        return null;
      }

      console.log('Found existing session:', data.id, 'Status:', data.status, 'Time remaining:', timeRemaining);
      return { sessionId: data.id, timeRemaining: Math.floor(timeRemaining) };
    } catch (err) {
      console.error('Error checking existing session:', err);
      return null;
    }
  }, [userData?.id, tatTestId]);

  const createNewSession = useCallback(async (): Promise<string | null> => {
    if (!userData?.id) return null;

    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .insert({
          user_id: userData.id,
          user_email: userData.email,
          tattest_id: tatTestId,
          status: 'active',
          session_duration_seconds: durationMinutes * 60,
          time_remaining: durationMinutes * 60,
        })
        .select()
        .single();

      if (error) throw error;
      console.log('Created new session:', data.id);
      return data.id;
    } catch (err) {
      console.error('Failed to create session:', err);
      safeSetError('Failed to create test session');
      return null;
    }
  }, [userData?.id, tatTestId, durationMinutes, safeSetError]);

  // WebSocket connection function
  const connectToModal = useCallback((sessionId: string, isResume: boolean, timeRemaining: number) => {
    if (!mountedRef.current) return;

    // Clean up any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Reset the timeUpCalled flag for new connections
    timeUpCalledRef.current = false;

    safeSetState(prev => ({ 
      ...prev, 
      connectionState: 'connecting',
      sessionId 
    }));

    const wsUrl = `wss://manjujayamurali--simple-timer-service-create-timer.modal.run/timer/${sessionId}`;
    console.log(`Connecting to Modal for session ${sessionId} (${isResume ? 'resume' : 'start'})`);
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        if (!mountedRef.current) return;
        console.log(`WebSocket opened for session ${sessionId}`);
      };

      wsRef.current.onmessage = (event) => {
        if (!mountedRef.current) return;
        
        try {
          const message: TimerMessage = JSON.parse(event.data);
          console.log(`Received:`, message);
          
          switch (message.type) {
            case 'connection_success':
              console.log(`Connection success: ${message.message}`);
              safeSetState(prev => ({ 
                ...prev, 
                connectionState: 'connected',
                containerId: message.containerId,
              }));
              safeSetError(null);
              
              // Send the appropriate command
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                const command = isResume 
                  ? { type: 'resume_timer', sessionId, timeRemaining }
                  : { type: 'start_timer', sessionId, durationSeconds: durationMinutes * 60 };
                
                wsRef.current.send(JSON.stringify(command));
                console.log(`Sent ${isResume ? 'resume' : 'start'} command:`, command);
              }
              break;
              
            case 'timer_update':
              if (message.timeRemaining !== undefined) {
                safeSetState(prev => ({
                  ...prev,
                  timeRemaining: message.timeRemaining!,
                  connectionState: 'timer_running'
                }));

                // Update database every 10 seconds
                if (message.timeRemaining % 10 === 0) {
                  supabase
                    .from('test_sessions')
                    .update({ time_remaining: message.timeRemaining })
                    .eq('id', sessionId)
                    .then(() => console.log(`Updated DB time remaining: ${message.timeRemaining}`));
                }

                // Call onTimeUp when timer reaches 0 (backup mechanism)
                if (message.timeRemaining === 0 && !timeUpCalledRef.current) {
                  console.log('⏰ Timer reached 0 via timer_update - triggering onTimeUp');
                  timeUpCalledRef.current = true;
                  onTimeUp?.();
                }
              }
              break;
              
            case 'timer_complete':
              console.log(`Timer completed for session ${sessionId}`);
              safeSetState(prev => ({
                ...prev,
                connectionState: 'completed',
                timeRemaining: 0
              }));
              
              // CRITICAL FIX: Call onTimeUp BEFORE onSessionEnd
              // Check if onTimeUp hasn't been called yet to avoid double-calling
              if (!timeUpCalledRef.current) {
                console.log('⏰ Timer completed - triggering onTimeUp from timer_complete');
                timeUpCalledRef.current = true;
                onTimeUp?.();
              }
              
              // Then call onSessionEnd for cleanup
              console.log('🚫 Calling onSessionEnd after timer completion');
              onSessionEnd?.();
              break;

            case 'timer_stopped':
              console.log(`Timer stopped for session ${sessionId}`);
              safeSetState(prev => ({
                ...prev,
                connectionState: 'completed'
              }));
              break;
          }
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        if (!mountedRef.current) return;
        
        console.log(`WebSocket closed for session ${sessionId}`, event.code, event.reason);
        
        // Only show error if it's an unexpected close and we're not completing
        const isIntentionalClose = event.code === 1000 || timerState.isCompleting;
        
        if (!isIntentionalClose) {
          // Unexpected close
          safeSetError('Connection lost unexpectedly');
          safeSetState(prev => ({ ...prev, connectionState: 'error' }));
        }
      };

      wsRef.current.onerror = (error) => {
        if (!mountedRef.current) return;
        
        console.error('WebSocket error:', error);
        safeSetError('Connection failed');
        safeSetState(prev => ({ ...prev, connectionState: 'error' }));
      };

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      safeSetError('Failed to connect to timer service');
      safeSetState(prev => ({ ...prev, connectionState: 'error' }));
    }
  }, [durationMinutes, onTimeUp, onSessionEnd, safeSetState, safeSetError]);

  // Main initialization function - called only once
  const initializeTimer = useCallback(async (): Promise<string | null> => {
    if (!userData?.id || initializationStartedRef.current) {
      return null;
    }

    initializationStartedRef.current = true;
    console.log('Initializing timer for test:', tatTestId);
    
    safeSetState(prev => ({ ...prev, connectionState: 'checking' }));
    safeSetError(null);

    try {
      // Step 1: Check for existing active session
      const existingSession = await checkExistingSession();
      
      if (existingSession) {
        // Resume existing session
        console.log('Resuming existing session:', existingSession.sessionId);
        safeSetState(prev => ({
          ...prev,
          sessionId: existingSession.sessionId,
          timeRemaining: existingSession.timeRemaining,
          isRecoveredSession: true
        }));
        connectToModal(existingSession.sessionId, true, existingSession.timeRemaining);
        return existingSession.sessionId;
      } else {
        // Create new session
        console.log('Creating new session');
        const sessionId = await createNewSession();
        
        if (sessionId && mountedRef.current) {
          safeSetState(prev => ({
            ...prev,
            sessionId,
            timeRemaining: durationMinutes * 60,
            isRecoveredSession: false
          }));
          connectToModal(sessionId, false, durationMinutes * 60);
          return sessionId;
        }
        return null;
      }
    } catch (err) {
      console.error('Timer initialization failed:', err);
      safeSetError(err instanceof Error ? err.message : 'Timer initialization failed');
      safeSetState(prev => ({ ...prev, connectionState: 'error' }));
      return null;
    }
  }, [userData?.id, tatTestId, checkExistingSession, createNewSession, connectToModal, durationMinutes, safeSetState, safeSetError]);

  // Auto-start timer when component mounts and user is available
  useEffect(() => {
    if (userData?.id && timerState.connectionState === 'idle') {
      initializeTimer();
    }
  }, [userData?.id]); // Only depend on userData.id - prevents re-triggering

  // Manual control functions
  const startTimer = useCallback(async (): Promise<string | null> => {
    if (timerState.connectionState === 'idle' && !initializationStartedRef.current) {
      return await initializeTimer();
    }
    return timerState.sessionId;
  }, [timerState.connectionState, timerState.sessionId, initializeTimer]);

  const stopTimer = useCallback(() => {
    console.log('Stopping timer...');
    
    // Mark as completing to prevent error messages
    safeSetState(prev => ({ ...prev, isCompleting: true }));
    
    if (wsRef.current?.readyState === WebSocket.OPEN && timerState.sessionId) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_timer',
        sessionId: timerState.sessionId
      }));
    }
    
    if (wsRef.current) {
      // Close with normal close code to prevent error handling
      wsRef.current.close(1000, 'Timer stopped');
      wsRef.current = null;
    }
    
    safeSetState(prev => ({ ...prev, connectionState: 'completed', isCompleting: false }));
  }, [timerState.sessionId, safeSetState]);

  const pauseSession = useCallback(async (sessionId: string, timeRemaining: number, storyContent?: string) => {
    console.log('Pausing session...');
    try {
      await supabase
        .from('test_sessions')
        .update({
          status: 'paused',
          time_remaining: timeRemaining,
          story_content: storyContent || null,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      console.log('Session paused successfully');
    } catch (error) {
      console.error('Error pausing session:', error);
    }
    stopTimer();
  }, [stopTimer]);

  const completeSession = useCallback(async () => {
    console.log('Completing session...');
    // Only stop the timer, don't update the session status
    // The session status should already be updated by submitStory
    stopTimer();
  }, [stopTimer]);

  const abandonSession = useCallback(async () => {
    console.log('Abandoning session...');
    if (timerState.sessionId) {
      await supabase
        .from('test_sessions')
        .update({
          status: 'abandoned',
          time_remaining: timerState.timeRemaining,
          completed_at: new Date().toISOString()
        })
        .eq('id', timerState.sessionId);
    }
    stopTimer();
  }, [timerState.sessionId, timerState.timeRemaining, stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('useModalTimer cleanup');
      mountedRef.current = false;
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Helper function to format time
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Computed properties
  const isActive = timerState.connectionState === 'timer_running';
  const isConnected = ['connected', 'timer_running'].includes(timerState.connectionState);
  const isConnecting = timerState.connectionState === 'connecting';
  const canStart = timerState.connectionState === 'idle' && !!userData?.id;

  return {
    // State
    timeRemaining: timerState.timeRemaining,
    timeFormatted: formatTime(timerState.timeRemaining),
    isActive,
    connectionStatus: timerState.connectionState,
    sessionId: timerState.sessionId,
    containerId: timerState.containerId,
    error,
    isRecoveredSession: timerState.isRecoveredSession,

    // Actions
    startTimer,
    stopTimer,
    completeSession,
    abandonSession,
    pauseSession,

    // Computed flags
    isConnected,
    isConnecting,
    isExpired: timerState.timeRemaining === 0,
    canStart,
    isRecovering: timerState.connectionState === 'checking'
  };
};