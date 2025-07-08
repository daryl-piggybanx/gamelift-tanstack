'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { startStream, getStreamStatus, terminateStream } from '../integrations/gamelift/service'
import { useSessionManager } from '~/hooks/session-manager'
import { GameSession } from '~/integrations/gamelift/types'
import { TouchToMouse, VirtualGamepadJoystick, VirtualButton, StreamControlButtons } from './Controls'
import { LoadingScreen, OrientationHandler } from './StreamView'


import * as gameliftstreamssdk from '../gamelift-streams-websdk/gameliftstreams-1.0.0'

export default function PublicStream() {
    const queryClient = useQueryClient();

   const videoRef = useRef<HTMLVideoElement>(null);
   const audioRef = useRef<HTMLAudioElement>(null);
//    const [sessionArn, setSessionArn] = useState<string | null>(null);
//    const [streamGroupId, setStreamGroupId] = useState<string | null>(null);
    const {
        currentSession,
        setCurrentSession,
        streamConnected,
        setStreamConnected,
        saveSession,
        clearSession,
        loadSession
    } = useSessionManager();
   const [gameStream, setGameStream] = useState<gameliftstreamssdk.GameLiftStreams | null>(null);
   const [isInputAttached, setIsInputAttached] = useState(false);
//    const [isInputEnabled, setIsInputEnabled] = useState(false);
//    const [isInputDetached, setIsInputDetached] = useState(false);
//    const [isInputReset, setIsInputReset] = useState(false);
//    const [isInputTracked, setIsInputTracked] = useState(false);
//    const [isInputTrackedWindowFocus, setIsInputTrackedWindowFocus] = useState(false);
   const [connectionState, setConnectionState] = useState<string>('disconnected');
//    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
//    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
//    const [isHapticFeedbackEnabled, setIsHapticFeedbackEnabled] = useState(true);
//    const [isCursorEnabled, setIsCursorEnabled] = useState(true);
//    const [isPointerLockEnabled, setIsPointerLockEnabled] = useState(true);
//    const [isAutoPointerLockEnabled, setIsAutoPointerLockEnabled] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [sdkInitialized, setSdkInitialized] = useState(false);
    const [isStreamStarted, setIsStreamStarted] = useState(false);

    const [showLoadingScreen, setShowLoadingScreen] = useState(true);
    const [mobileControlsVisible, setMobileControlsVisible] = useState(true);

    const isMobile = () => {
        return window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
    };


    // track fullscreen state
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        // set initial state
        setIsFullscreen(!!document.fullscreenElement);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        }
    }, [])

    useEffect(() => {
        console.log('🔍 Debugging session loading...');
        console.log('🔍 sessionStorage contents:', sessionStorage.getItem('gameSessionData'));
        console.log('🔍 currentSession state:', currentSession);
        
        const sessionData = sessionStorage.getItem('gameSessionData');
        if (!sessionData) {
            console.log('📭 No session data in storage');
            return;
        }
    
        try {
            const parsed = JSON.parse(sessionData) as GameSession;
            console.log('🔍 Parsed session:', parsed);
            
            const now = Date.now();
            const sessionAge = now - parsed.timestamp;
            const maxAge = 3600000; // 1 hour
    
            console.log('🔍 Session age:', Math.round(sessionAge / 1000), 'seconds');
            console.log('🔍 Max age:', Math.round(maxAge / 1000), 'seconds');
    
            if (sessionAge > maxAge) {
                console.log('⏰ Session expired (would clear in other effect)');
                // DON'T actually clear here - let the other effect handle it
                return;
            }
    
            console.log('✅ Valid session found (will be loaded by other effect)');
            // DON'T call setCurrentSession here - let loadSession() handle it
        } catch (error) {
            console.error('❌ Failed to parse session:', error);
            // DON'T clear sessionStorage here either
        }
    }, []); // ✅ Run only once on mount for debugging

    // Load existing session on mount
    useEffect(() => {
        const existingSession = loadSession();
        if (existingSession) {
            console.log('🔄 Resuming existing session:', existingSession.sessionArn);
            setCurrentSession(existingSession);
        }
    }, [loadSession]);

    /*
    const handleDisconnect = useCallback(() => {
        if (gameStream) {
            try {
                gameStream.close()
            } catch (error) {
                console.error('Error closing GameLift Streams:', error);
            }
        }
        setIsInputAttached(false)
        setConnectionState('disconnected')
    }, [gameStream]);
    */

    // session-based disconnect handler
    const handleDisconnect = useCallback(() => {
        console.log('🔌 Disconnecting...');
        setIsInputAttached(false);
        setConnectionState('disconnected');
        setStreamConnected(false);
        setIsStreamStarted(false);
        
        // Update session status but don't clear it (for reconnection)
        if (currentSession) {
            const updatedSession: GameSession = { 
                ...currentSession, 
                status: 'terminated' 
            };
            saveSession(updatedSession);
        }
    }, [currentSession, saveSession, setStreamConnected]);


   // init SDK (session-based)
   useEffect(() => {
    if (sdkInitialized || !videoRef.current || !audioRef.current) return;

    const videoElement = videoRef.current;
    const audioElement = audioRef.current;

    if (!videoElement.isConnected || !audioElement.isConnected) {
        console.log('⏳ Elements not yet connected...');
        return;
    }

    console.log('🎮 Initializing GameLift Streams SDK...');

    try {
        gameliftstreamssdk.setLogLevel('debug');

        const streamConfig: gameliftstreamssdk.GameLiftStreamsArgs = {
            videoElement: videoRef.current,
            audioElement: audioRef.current,
            clientConnection: {
                connectionState: (state: string) => {
                    console.log('Connection state changed:', state)
                    setConnectionState(state);
                    if (state === 'connected') {
                        setStreamConnected(true);
                        const current = JSON.parse(sessionStorage.getItem('gameSessionData') || 'null');
                        if (current) {
                            const updatedSession: GameSession = { ...current, status: 'active' };
                            saveSession(updatedSession);
                        }
                    } else if (state === 'disconnected') {
                        handleDisconnect();
                    }
                },
                channelError: (error: any) => {
                    console.error('📡 Channel error:', error);
                    handleDisconnect();
                },
                serverDisconnect: (reason: string) => {
                    console.log('🔴 Server disconnected:', reason);
                    if (reason === 'terminated') {
                        clearSession(); // Clear session on termination
                    } else {
                        handleDisconnect(); // Keep session for reconnection
                    }
                },
                applicationMessage: (message: Uint8Array) => {
                    console.log('📨 Application message received:', message);
                }
            },
            inputConfiguration: {
                setCursor: 'visibility',
                autoPointerLock: 'fullscreen',
                autoKeyboard: true,
                autoMouse: true,
                autoGamepad: true,
                resetOnDetach: true,
                trackWindowFocus: true,
            },
            streamConfiguration: {
                enableAudio: true,
                maximumKbps: 19000,
            }
        }

        const gameStream = new gameliftstreamssdk.GameLiftStreams(streamConfig);
        setGameStream(gameStream);
        setSdkInitialized(true);
        console.log('✅ GameLift Streams initialized successfully');
    } catch (error) {
        console.error('Error initializing GameLift Streams:', error);
        handleDisconnect();
    }

    // cleanup on unmount
    return () => {
        console.log('🧹 Cleaning up GameLift Streams...');
        if (gameStream) {
            try {
                gameStream.close();
            } catch (error) {
                console.error('Error closing GameLift Streams:', error);
            }
        }
        // SdkInitialized(false);
    };
   }, [sdkInitialized])
  
   const startMutation = useMutation({
    mutationFn: startStream,
    onSuccess: (data) => {
        console.log('🚀 Stream started successfully:', data)

        // prevent stale data from multiple instances
        queryClient.removeQueries({ queryKey: ['stream-status'] });

        const newSession: GameSession = {
            sessionArn: data.sessionArn!,
            streamGroupId: data.streamGroupId!,
            userId: data.userId!,
            applicationId: data.applicationIdentifier!,
            location: data.location || 'us-west-2',
            timestamp: Date.now(),
            status: 'connecting'
        };
        
        saveSession(newSession);
        setIsStreamStarted(true);
        // setIsInputAttached(true);
        // gameStream?.attachInput();

            // TEMPORARY DEBUG:
        setTimeout(() => {
            console.log('🔍 POST-START DEBUG:', {
                isStreamStarted,
                currentSession: currentSession?.sessionArn?.slice(-8),
                gameStream: !!gameStream,
                sdkInitialized
            });
        }, 100);
    }
   })

   const terminateMutation = useMutation({
    mutationFn: terminateStream,
    onSuccess: () => {
        clearSession();
        handleDisconnect();

        // for stale session data
        queryClient.invalidateQueries({ queryKey: ['stream-status'] });
    }
   })

   // poll stream status
   const { data: streamStatus, error: streamStatusError } = useQuery({
    queryKey: ['stream-status', currentSession?.sessionArn, currentSession?.streamGroupId],
    queryFn: () => getStreamStatus({ 
        data: { 
            sessionArn: currentSession!.sessionArn, 
            streamGroupId: currentSession!.streamGroupId,
        } 
    }),
    enabled:!!currentSession?.sessionArn && !!currentSession?.streamGroupId && !!gameStream && !!sdkInitialized && isStreamStarted,
    refetchInterval: (query) => {
        console.log('refetchInterval query: ', query);
        // console.log('refetchInterval data: ', data);
        // console.log('📊 refetchInterval called');

        // check if query is for the current session
        const currentSessionArn = currentSession?.sessionArn;
        const querySessionArn = query.queryKey[1];
        
        if (currentSessionArn && querySessionArn && currentSessionArn !== querySessionArn) {
            console.log('📊 STOP - Stale query (different session)');
            return false;
        }
        
        // console.log('📊 Query enabled:', query?.options?.enabled);
        console.log('📊 Current session ARN:', currentSession?.sessionArn);

        const data = query.state.data;
        const status = data?.status;

        console.log('refetchInterval streamStatus: ', status);

        // poll until status is ACTIVE (ready for WebRTC) or CONNECTED
        if (status === 'ACTIVE' || status === 'CONNECTED' || streamConnected) {
            return false; // stop polling
        }

        if (status === 'ACTIVATING' || !data) {
            console.log('📊 CONTINUE - activating or no data yet');
            return 2000;
        }

        if (status === 'ERROR' || status === 'TERMINATED') {
            console.log('📊 Stop - terminal state');
            return false;
        }

        // Default: stop
        console.log('📊 STOP - default');
        return false;
    },
    gcTime: 0 // don't cache, always refresh
   })

   // init webRTC when stream is active
   useEffect(() => {
       if (
        streamStatus?.status === 'ACTIVE' && 
        streamStatus.signalResponse && 
        gameStream &&
        !streamConnected && // Only process once per session
        currentSession
       ) {
            console.log('🎯 Stream is ACTIVE, processing signal response...');
            processSignalResponse(streamStatus.signalResponse);
       }
   }, [streamStatus, gameStream, streamConnected, currentSession])

   const processSignalResponse = async (signalResponse: string) => {
    if (!gameStream || streamConnected) {
        console.log('⚠️ Skipping signal processing - already connected or no SDK');
        return;
    }

    if (!videoRef.current || !audioRef.current) {
        console.error('❌ Video/Audio elements not available during signal processing');
        return;
    }

    try {
        console.log('Processing signal response...', signalResponse);

        const parsedSignal = JSON.parse(signalResponse);
        console.log('📡 Signal type:', parsedSignal.type);
        console.log('🌐 WebSDK Protocol URL:', parsedSignal.webSdkProtocolUrl);

        await gameStream.processSignalResponse(signalResponse);
        console.log('Signal response processed successfully');

        setStreamConnected(true);
    } catch (error) {
        console.error('Error processing signal response:', error);
        handleDisconnect();
    }
   }

   const handleStartStream = async () => {
    if (!gameStream || !sdkInitialized) {
        console.error('❌ GameLift Streams not initialized');
        return;
    }

    // if an existing session, terminate it first
    if (currentSession) {
        console.log('🔄 Terminating existing session before starting new one...');
        try {
            await terminateMutation.mutateAsync({
                data: { 
                    sessionArn: currentSession.sessionArn, 
                    streamGroupId: currentSession.streamGroupId 
                }
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.warn('⚠️ Failed to terminate existing session, continuing anyway');
            clearSession();
        }
    }  

    try {
        console.log('📡Generating signal request...')
        const signalRequest = await gameStream.generateSignalRequest();
        console.log('✅ Signal request generated successfully');
        await startMutation.mutateAsync({
            data: {
                SignalRequest: signalRequest,
                UserId: `player-${Date.now()}`
               }
           })
       } catch (error) {
           console.error('Failed to start stream:', error)
       }
   }

   const handleTerminateStream = async () => {
    if (!currentSession) {
        console.log('⚠️ No active session to terminate');
        return;
    }
    try {
        await terminateMutation.mutateAsync({
            data: { 
                sessionArn: currentSession.sessionArn, 
                streamGroupId: currentSession.streamGroupId 
            }
       })
       console.log('Stream terminated successfully');
   } catch (error) {
       console.error('Failed to terminate stream:', error);
       clearSession();
   }
   }

   const handleReconnectSession = async () => {
    if (!currentSession || !gameStream) {
        console.log('⚠️ No session to reconnect or SDK not ready');
        return;
    }

    console.log('🔄 Attempting to reconnect to existing session...');
    setIsStreamStarted(true);
    
    // force refresh the stream status to check if session is still valid
    try {
        await queryClient.invalidateQueries({ 
            queryKey: ['stream-status', currentSession.sessionArn, currentSession.streamGroupId] 
        });
        console.log('🔄 Reconnection attempt initiated via status refresh');
    } catch (error) {
        console.error('❌ Reconnection failed:', error);
        setIsStreamStarted(false);
        clearSession();
    }
   };

  const toggleInput = () => {
    if (!gameStream || !sdkInitialized) return;

    try {
        if (isInputAttached) {
            gameStream.detachInput();
            setIsInputAttached(false);
            console.log('🎮 Input detached');
        } else {
            gameStream.attachInput();
            setIsInputAttached(true);
            console.log('🎮 Input attached');
        }
    } catch (error) {
        console.error('❌ Error toggling input:', error);
    }
  }

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    try {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            if (isInputAttached) {
                gameStream?.detachInput();
                setIsInputAttached(false);
            }
        } else {
            videoRef.current.requestFullscreen();
            if (gameStream && connectionState === 'connected') {
                gameStream.attachInput();
                setIsInputAttached(true);
            }
        }
    } catch (error) {
        console.error('Failed to toggle fullscreen:', error);
    }
  }

    const handleLoadingScreenInteraction = () => {
        console.log('Loading screen interaction detected');
        setShowLoadingScreen(false);
    };

   const getStatusDisplay = () => {
    if (!sdkInitialized) return '⚙️ Initializing SDK...';
    if (!gameStream) return '⚙️ Setting up SDK...';
    console.log('streamStatus: ', streamStatus);
    const reason = streamStatus?.statusReason ? ` (${streamStatus.statusReason})` : '';
    console.log('streamStatus?.status: ', streamStatus?.status);
    
    switch (streamStatus?.status) {
        case 'ACTIVATING':
            return '🚀 Preparing stream - Starting application...';
        case 'ACTIVE':
            return connectionState === 'connected' ? '✅ Connected and streaming!' : '🔄 Connecting...';
        case 'CONNECTED':
            return '✅ Connected and streaming!';
        case 'ERROR':
            return `❌ Stream error${reason}`;
        case 'TERMINATED':
            return '🛑 Stream session ended';
        case 'TERMINATING':
            return '⏹️ Terminating stream session...';
        case 'PENDING_CLIENT_RECONNECTION':
            return '⏳ Waiting for client to reconnect...';
        case 'RECONNECTING':
            return '🔄 Reconnecting to stream...';
        default:
            return ``;
    }
   }


   const canStartNewSession = sdkInitialized && gameStream && !streamConnected;
   const hasActiveSession = currentSession && currentSession.status !== 'terminated';
   const canReconnect = hasActiveSession && !streamConnected;

    const buttonConfigs = [
        // D-pad buttons
        { svgName: 'dPadUp', x: 24, y: 26, keyCode: 'ArrowUp', keyCodeNum: 38, direction: 'up' as const },
        { svgName: 'dPadDown', x: 24, y: 11, keyCode: 'ArrowDown', keyCodeNum: 40, direction: 'down' as const },
        { svgName: 'dPadLeft', x: 18, y: 23.5, keyCode: 'ArrowLeft', keyCodeNum: 37, direction: 'left' as const },
        { svgName: 'dPadRight', x: 26.5, y: 23.5, keyCode: 'ArrowRight', keyCodeNum: 39, direction: 'right' as const },

        // Face buttons
        { svgName: 'buttonA', x: 63.6, y: 9.15, keyCode: 'KeyA', keyCodeNum: 65 },
        { svgName: 'buttonB', x: 68, y: 18.7, keyCode: 'KeyB', keyCodeNum: 66 },
        { svgName: 'buttonX', x: 58.7, y: 18.8, keyCode: 'KeyX', keyCodeNum: 88 },
        { svgName: 'buttonY', x: 63.3, y: 29.5, keyCode: 'KeyY', keyCodeNum: 89 },
    ];

   return (
    <OrientationHandler forceOrientation={isMobile() ? 'landscape' : 'auto'}>
        <div className="p-4 bg-[#313033] text-white min-h-screen font-arial">
            {/* Stream Control Buttons - Mobile & Fullscreen Only */}
            {streamConnected && (isMobile() || isFullscreen) && (
                <StreamControlButtons
                    onTerminate={handleTerminateStream}
                    onViewControls={() => console.log('View controls clicked')}
                    onToggleTouch={() => setMobileControlsVisible(!mobileControlsVisible)}
                    onEditControls={() => console.log('Edit controls clicked')}
                    visible={true}
                />
            )}

            {/* Session Debug Info */}
            <div className="mb-4 p-2 bg-slate-100 text-slate-800 rounded text-xs">
                <p><strong>SDK:</strong> {sdkInitialized ? '✅ Ready' : '❌ Not Ready'}</p>
                <p><strong>Session:</strong> {hasActiveSession ? `✅ ${currentSession?.sessionArn?.slice(-8)}` : '❌ None'}</p>
                <p><strong>Connection:</strong> {connectionState} | Stream: {streamConnected ? '✅' : '❌'}</p>
            </div>

            {/* Stream controls */}
            <div className="mb-4 space-x-2 flex flex-wrap">
                <button
                    onClick={handleStartStream}
                    disabled={startMutation.isPending || (!canStartNewSession && !canReconnect)}
                    className="bg-slate-800 text-slate-100 px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-slate-700"
                >
                    {startMutation.isPending ? 'Starting...' : 
                    canStartNewSession ? '🔄 Start New Session' : '🎮 Start Session'}
                </button>

                {canReconnect && (
                    <button
                        onClick={handleReconnectSession}
                        disabled={startMutation.isPending}
                        className="bg-blue-200 text-blue-800 px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-blue-300"
                    >
                        🔄 Reconnect
                    </button>
                )}

                {hasActiveSession && (
                    <button
                        onClick={handleTerminateStream}
                        disabled={terminateMutation.isPending}
                        className="bg-red-200 text-red-800 px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-red-300"
                    >
                        {terminateMutation.isPending ? 'Terminating...' : 'Terminate Stream'}
                    </button>
                )}
            </div>

            {/* Gamepad/Fullscreen Controls */}
            <div className="mb-4 space-x-2 flex flex-wrap">
                <button
                    onClick={toggleInput}
                    disabled={!gameStream || !streamConnected}
                    className="bg-blue-200 text-blue-800 px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-blue-300"
                >
                    {isInputAttached ? '🎮 Detach Input' : '🎮 Attach Input'}
                </button>

                <button
                    onClick={toggleFullscreen}
                    disabled={!gameStream}
                    className="bg-green-200 text-green-800 px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 hover:bg-green-300"
                >
                    {isFullscreen ? '🔽 Exit Fullscreen' : '🔲 Fullscreen'}
                </button>

                {isMobile() && (
                    <button
                        onClick={() => setMobileControlsVisible(!mobileControlsVisible)}
                        className="bg-purple-200 text-purple-800 px-4 py-2 rounded transition-colors duration-200 hover:bg-purple-300"
                    >
                        {mobileControlsVisible ? '📱 Hide Controls' : '📱 Show Controls'}
                    </button>
                )}
            </div>

            {/* Stream Area */}
            <div className="relative">
                <TouchToMouse enabled={streamConnected} allowedElement={videoRef.current}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        controls={false}
                        className="w-full max-w-full bg-black rounded-lg"
                    />
                </TouchToMouse>

                {/* Loading Screen Overlay */}
                {showLoadingScreen && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-lg">
                        <LoadingScreen 
                            visible={showLoadingScreen}
                            onInteraction={handleLoadingScreenInteraction}
                        />
                    </div>
                )}

                {/* Mobile Virtual Controls */}
                {isMobile() && mobileControlsVisible && streamConnected && (
                    <div className="fixed inset-0 pointer-events-none z-[30000]">
                        {/* Virtual Joysticks */}
                        <VirtualGamepadJoystick
                            x={1.3}
                            y={2.3}
                            type="left"
                            onMove={(event) => console.log('Left joystick move:', event)}
                            onStart={(event) => console.log('Left joystick start:', event)}
                            onStop={(event) => console.log('Left joystick stop:', event)}
                        />
                        <VirtualGamepadJoystick
                            x={84.8}
                            y={2.9}
                            type="right"
                            onMove={(event) => console.log('Right joystick move:', event)}
                            onStart={(event) => console.log('Right joystick start:', event)}
                            onStop={(event) => console.log('Right joystick stop:', event)}
                        />

                        {/* Virtual Buttons */}
                        {buttonConfigs.map((config) => (
                            <VirtualButton
                                key={config.svgName}
                                svgName={config.svgName}
                                x={config.x}
                                y={config.y}
                                keyCode={config.keyCode}
                                keyCodeNum={config.keyCodeNum}
                                direction={config.direction}
                                onPress={() => console.log(`${config.svgName} pressed`)}
                                onRelease={() => console.log(`${config.svgName} released`)}
                                visible={mobileControlsVisible}
                            />
                        ))}
                    </div>
                )}

                {/* Hidden Audio Element */}
                <audio
                    ref={audioRef}
                    autoPlay
                    muted={false}
                    className="hidden"
                />

                {/* Status Display */}
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <p className="text-lg font-medium text-white">{getStatusDisplay()}</p>
                    
                    {streamStatus && (
                        <div className="text-sm text-gray-400 mt-2 space-y-1">
                            <p>Stream Status: <span className="text-white">{streamStatus.status}</span></p>
                            <p>Connection: <span className="text-white">{connectionState}</span></p>
                            {isInputAttached && <p className="text-green-400">Input: Enabled</p>}
                            {streamStatus.location && <p>Location: <span className="text-white">{streamStatus.location}</span></p>}
                            {currentSession && <p><strong>Session Age:</strong> <span className="text-white">{Math.round((Date.now() - currentSession.timestamp) / 1000)}s</span></p>}
                        </div>
                    )}

                    {currentSession && streamStatus?.status === 'ACTIVATING' && (
                        <div className="mt-4 flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-100"></div>
                            <p className="text-sm text-gray-300">
                                Starting stream... May take up to 5 minutes.
                            </p>
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {(startMutation.error || terminateMutation.error || streamStatus?.statusReason) && (
                    <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <strong>⚠️ Error:</strong> {
                            startMutation.error?.message || 
                            terminateMutation.error?.message || 
                            streamStatus?.statusReason
                        }
                    </div>
                )}
            </div>
        </div>
    </OrientationHandler>
   )
}