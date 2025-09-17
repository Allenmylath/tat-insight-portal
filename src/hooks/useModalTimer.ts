import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserData } from './useUserData';

interface UseModalTimerParams {
  tatTestId: string;
  durationMinutes: number;
  onTimeUp?: () => void;
  onSessionEnd?: () => void;
}

interface CommandAck {
  type: 'command_ack';
  commandType: string;
  sessionId: string;
  containerId: string;
  success: boolean;
  message: string;
  sequence: number;
  timestamp: number;
  [key: string]: any; // For additional data
}

interface TimerMessage {
  type: 'container_ready' | 'command_ack' | 'timer_update' | 'session_complete' | 'timer_error' | 'container_error';
  timeRemaining?: number;
  sessionId?: string;
  containerId?: string;
  message?: string;
  timestamp?: number;
  reason?: string;
  maxInputs?: number;
  commandType?: string;
  success?: boolean;
  sequence?: number;
}

interface TimerState {
  timeRemaining: number;
  isActive: boolean;
  sessionId: string | null;
  containerId: string | null;
  connectionStatus: 'disconnected' | 'connecting' | 'container_ready' | 'waiting_ack' | 'timer_running' | 'error';
  isRecovering: boolean;
  lastCommandSent: string | null;
  commandSequence: number;
}

interface PendingCommand {
  type: string;
  data: any;
  timestamp: number;
  timeoutId: NodeJS.Timeout;
  resolve: (success: boolean, message?: string, data?: any) => void;
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
    isRecovering: false,
    lastCommandSent: null,
    commandSequence: 0
  });
  
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;
  const pendingCommandRef = useRef<PendingCommand | null>(null);
  const commandTimeoutMs = 10000; // 10 seconds timeout for command acknowledgments

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

      // Check if session is still valid
      const sessionStartTime = new Date(data.started_at).getTime();
      const sessionDuration = data.session_duration_seconds * 1000;
      const now = Date.now();
      const elapsed = now - sessionStartTime;

      if (elapsed >= sessionDuration) {
        await updateSessionStatus(data.id, 'abandoned');
        return null;
      }

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

  const sendCommandWithAck = useCallback(async (command: any): Promise<{ success: boolean; message?: string; data?: any }> => {
    return new Promise((resolve) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        resolve({ success: false, message: 'WebSocket not connected' });
        return;
      }

      // Clear any existing pending command
      if (pendingCommandRef.current) {
        clearTimeout(pendingCommandRef.current.timeoutId);
        pendingCommandRef.current.resolve(false, 'Command superseded by new command');
      }

      // Set up timeout for acknowledgment
      const timeoutId = setTimeout(() => {
        console.error(`Command acknowledgment timeout for: ${command.type}`);
        pendingCommandRef.current = null;
        setTimerState(prev => ({ ...prev, connectionStatus: 'error', lastCommandSent: null }));
        resolve({ success: false, message: 'Command acknowledgment timeout' });
      }, commandTimeoutMs);

      // Store pending command
      pendingCommandRef.current = {
        type: command.type,
        data: command,
        timestamp: Date.now(),
        timeoutId,
        resolve: (success: boolean, message?: string, data?: any) => {
          clearTimeout(timeoutId);
          pendingCommandRef.current = null;
          resolve({ success, message, data });
        }
      };

      // Update state to waiting for acknowledgment
      setTimerState(prev => ({ 
        ...prev, 
        connectionStatus: 'waiting_ack',
        lastCommandSent: command.type,
        commandSequence: prev.commandSequence + 1
      }));

      // Send command
      try {
        wsRef.current.send(JSON.stringify(command));
        console.log(`Command sent: ${command.type} (waiting for acknowledgment)`);
      } catch (err) {
        clearTimeout(timeoutId);
        pendingCommandRef.current = null;
        console.error(`Failed to send command ${command.type}:`, err);
        resolve({ success: false, message: 'Failed to send command' });
      }
    });
  }, []);

  const connectToFreshContainer = useCallback((sessionId: string) => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear any pending commands
    if (pendingCommandRef.current) {
      clearTimeout(pendingCommandRef.current.timeoutId);
      pendingCommandRef.current.resolve(false, 'Connection reset');
      pendingCommandRef.current = null;
    }

    setTimerState(prev => ({ 
      ...prev, 
      connectionStatus: 'connecting',
      sessionId,
      lastCommandSent: null
    }));

    // Each connection gets a completely fresh container (max_inputs=1)
    const wsUrl = `wss://manjujayamurali--timer-service-acknowledge-create-dedicated-timer.modal.run/timer/${sessionId}`;
    
    console.log(`Connecting to fresh container for session ${sessionId}`);
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log(`Connected to fresh container for session ${sessionId}`);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: TimerMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'container_ready':
              console.log(`Fresh container ready: ${message.containerId}`);
              setTimerState(prev => ({ 
                ...prev, 
                connectionStatus: 'container_ready',
                containerId: message.containerId 
              }));
              break;

            case 'command_ack':
              console.log(`Command acknowledgment received: ${message.commandType} - ${message.success ? 'SUCCESS' : 'FAILED'}`);
              
              // Handle pending command acknowledgment
              if (pendingCommandRef.current && pendingCommandRef.current.type === message.commandType) {
                const commandData = message.success ? {
                  durationSeconds: message.durationSeconds,
                  timeRemaining: message.timeRemaining,
                  startTime: message.startTime,
                  resumedAt: message.resumedAt,
                  completedAt: message.completedAt,
                  abandonedAt: message.abandonedAt
                } : undefined;
                
                pendingCommandRef.current.resolve(message.success, message.message, commandData);
                
                // Update state based on acknowledgment
                if (message.success) {
                  if (message.commandType === 'start_timer' || message.commandType === 'resume_timer') {
                    setTimerState(prev => ({
                      ...prev,
                      connectionStatus: 'timer_running',
                      isActive: true,
                      isRecovering: false,
                      lastCommandSent: null
                    }));
                  } else if (message.commandType === 'complete_session' || message.commandType === 'abandon_session') {
                    setTimerState(prev => ({
                      ...prev,
                      connectionStatus: 'disconnected',
                      isActive: false,
                      lastCommandSent: null
                    }));
                  } else {
                    setTimerState(prev => ({
                      ...prev,
                      connectionStatus: 'container_ready',
                      lastCommandSent: null
                    }));
                  }
                } else {
                  // Command failed
                  setError(`Command failed: ${message.message}`);
                  setTimerState(prev => ({
                    ...prev,
                    connectionStatus: 'error',
                    lastCommandSent: null
                  }));
                }
              }
              break;
              
            case 'timer_update':
              if (message.timeRemaining !== undefined) {
                setTimerState(prev => ({
                  ...prev,
                  timeRemaining: message.timeRemaining!,
                  isActive: message.timeRemaining! > 0
                }));

                // Update database periodically (every 10 seconds)
                if (message.timeRemaining % 10 === 0 && timerState.sessionId) {
                  supabase
                    .from('test_sessions')
                    .update({ time_remaining: message.timeRemaining })
                    .eq('id', timerState.sessionId)
                    .then(() => {
                      console.log(`Updated DB: ${message.timeRemaining}s remaining`);
                    });
                }

                if (message.timeRemaining === 0) {
                  onTimeUp?.();
                }
              }
              break;
              
            case 'session_complete':
              console.log(`Session completed in container ${message.containerId}: ${message.reason}`);
              setTimerState(prev => ({
                ...prev,
                isActive: false,
                timeRemaining: 0,
                connectionStatus: 'disconnected'
              }));
              
              if (timerState.sessionId) {
                updateSessionStatus(timerState.sessionId, 'completed');
              }
              
              onSessionEnd?.();
              break;

            case 'timer_error':
            case 'container_error':
              console.error('Container error:', message.message);
              setError(message.message || 'Container error');
              setTimerState(prev => ({ ...prev, connectionStatus: 'error' }));
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log(`Fresh container disconnected (code: ${event.code})`);
        setTimerState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
        
        // Clear pending commands on disconnect
        if (pendingCommandRef.current) {
          pendingCommandRef.current.resolve(false, 'Connection closed');
          pendingCommandRef.current = null;
        }
        
        // For max_inputs=1, container closes after processing
        // Only reconnect if session is still active and we haven't exceeded attempts
        if (timerState.isActive && reconnectAttemptsRef.current < maxReconnectAttempts) {
          console.log(`Container closed, attempting reconnection ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connectToFreshContainer(sessionId);
          }, 2000);
          
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log('Max reconnection attempts reached for fresh containers');
          setError('Connection failed after multiple attempts');
          setTimerState(prev => ({ ...prev, isActive: false }));
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Fresh container WebSocket error:', error);
        setTimerState(prev => ({ ...prev, connectionStatus: 'error' }));
        setError('Failed to connect to fresh container');
        
        // Clear pending commands on error
        if (pendingCommandRef.current) {
          pendingCommandRef.current.resolve(false, 'WebSocket error');
          pendingCommandRef.current = null;
        }
      };

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to timer service');
    }
  }, [timerState.isActive, timerState.sessionId, onTimeUp, onSessionEnd, updateSessionStatus]);

  const startTimer = useCallback(async () => {
    if (!userData || timerState.isActive || timerState.connectionStatus === 'waiting_ack') return;

    // First try to recover existing session
    setTimerState(prev => ({ ...prev, isRecovering: true }));
    const recoveredSession = await recoverSession();
    
    let sessionId: string;
    let commandType: string;
    let commandData: any;

    if (recoveredSession) {
      // Resume existing session
      console.log(`Recovering session ${recoveredSession.sessionId} in fresh container`);
      sessionId = recoveredSession.sessionId;
      commandType = 'resume_timer';
      commandData = {
        type: 'resume_timer',
        sessionId: recoveredSession.sessionId,
        timeRemaining: recoveredSession.timeRemaining
      };
      
      setTimerState(prev => ({
        ...prev,
        timeRemaining: recoveredSession.timeRemaining
      }));
    } else {
      // Create new session
      sessionId = await createSession();
      if (!sessionId) {
        setTimerState(prev => ({ ...prev, isRecovering: false }));
        return;
      }

      console.log(`Starting new session ${sessionId} in fresh container`);
      commandType = 'start_timer';
      commandData = {
        type: 'start_timer',
        sessionId: sessionId,
        durationSeconds: durationMinutes * 60
      };
    }

    // Connect to fresh container
    connectToFreshContainer(sessionId);

    // Wait for container to be ready, then send command with acknowledgment
    const checkContainerReady = () => {
      if (timerState.connectionStatus === 'container_ready') {
        sendCommandWithAck(commandData).then(result => {
          if (result.success) {
            console.log(`${commandType} command acknowledged successfully`);
          } else {
            console.error(`${commandType} command failed:`, result.message);
            setError(`Failed to ${commandType.replace('_', ' ')}: ${result.message}`);
          }
        });
      } else {
        // Keep checking until container is ready
        setTimeout(checkContainerReady, 100);
      }
    };

    // Start checking for container ready state
    setTimeout(checkContainerReady, 100);
    
  }, [userData, timerState.isActive, timerState.connectionStatus, createSession, recoverSession, connectToFreshContainer, durationMinutes, sendCommandWithAck]);

  const completeSession = useCallback(async () => {
    if (!timerState.sessionId || timerState.connectionStatus === 'waiting_ack') return;

    const command = {
      type: 'complete_session',
      sessionId: timerState.sessionId
    };

    const result = await sendCommandWithAck(command);
    if (result.success) {
      console.log('Session completion acknowledged successfully');
    } else {
      console.error('Session completion failed:', result.message);
      setError(`Failed to complete session: ${result.message}`);
    }
  }, [timerState.sessionId, timerState.connectionStatus, sendCommandWithAck]);

  const abandonSession = useCallback(async () => {
    if (!timerState.sessionId || timerState.connectionStatus === 'waiting_ack') return;

    const command = {
      type: 'abandon_session',
      sessionId: timerState.sessionId
    };

    const result = await sendCommandWithAck(command);
    if (result.success) {
      console.log('Session abandonment acknowledged successfully');
      await updateSessionStatus(timerState.sessionId, 'abandoned');
    } else {
      console.error('Session abandonment failed:', result.message);
      setError(`Failed to abandon session: ${result.message}`);
      // Still try to update status in database
      await updateSessionStatus(timerState.sessionId, 'abandoned');
    }

    // Close connection after acknowledgment
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, [timerState.sessionId, timerState.connectionStatus, sendCommandWithAck, updateSessionStatus]);

  const sendPing = useCallback(async () => {
    if (!timerState.sessionId || timerState.connectionStatus === 'waiting_ack') return;

    const command = {
      type: 'ping',
      sessionId: timerState.sessionId
    };

    const result = await sendCommandWithAck(command);
    if (result.success) {
      console.log('Ping acknowledged successfully:', result.data);
      return result.data;
    } else {
      console.error('Ping failed:', result.message);
      return null;
    }
  }, [timerState.sessionId, timerState.connectionStatus, sendCommandWithAck]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pendingCommandRef.current) {
        clearTimeout(pendingCommandRef.current.timeoutId);
        pendingCommandRef.current.resolve(false, 'Component unmounting');
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
    containerId: timerState.containerId,
    error,

    // Actions
    startTimer,
    completeSession,
    abandonSession,
    sendPing,

    // Status checks
    isConnected: timerState.connectionStatus === 'timer_running',
    isExpired: timerState.timeRemaining === 0,
    canStart: !timerState.isActive && !timerState.isRecovering && !!userData && timerState.connectionStatus !== 'waiting_ack',
    isRecovering: timerState.isRecovering,
    containerReady: timerState.connectionStatus === 'container_ready',
    waitingForAck: timerState.connectionStatus === 'waiting_ack',
    lastCommandSent: timerState.lastCommandSent,
    commandSequence: timerState.commandSequence,

    // Debug info
    debugInfo: {
      connectionStatus: timerState.connectionStatus,
      lastCommandSent: timerState.lastCommandSent,
      commandSequence: timerState.commandSequence,
      containerId: timerState.containerId,
      reconnectAttempts: reconnectAttemptsRef.current,
      hasPendingCommand: !!pendingCommandRef.current
    }
  };
};