'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { startStream, getStreamStatus, terminateStream } from '../integrations/gamelift/service'

import * as gameliftstreamssdk from '../gamelift-streams-websdk/gameliftstreams-1.0.0'

export default function PublicStream() {
   const videoRef = useRef<HTMLVideoElement>(null);
   const audioRef = useRef<HTMLAudioElement>(null);
   const [sessionArn, setSessionArn] = useState<string | null>(null);
   const [streamGroupId, setStreamGroupId] = useState<string | null>(null);

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

   // init SDK
   useEffect(() => {
    if (!videoRef.current || !audioRef.current) return;

    try {
        gameliftstreamssdk.setLogLevel('debug');

        const streamConfig: gameliftstreamssdk.GameLiftStreamsArgs = {
            videoElement: videoRef.current,
            audioElement: audioRef.current,
            clientConnection: {
                connectionState: (state: string) => {
                    console.log('Connection state changed:', state)
                    setConnectionState(state);
                    if (state === 'disconnected') {
                        handleDisconnect();
                    }
                },
                channelError: (error: any) => {
                    console.error('Channel error:', error);
                    handleDisconnect();
                },
                serverDisconnect: (reason: string) => {
                    console.log('Server disconnected:', reason);
                    if (reason === 'terminated') {
                        setSessionArn(null);
                        setStreamGroupId(null);
                    }
                    handleDisconnect();
                },
                applicationMessage: (message: Uint8Array) => {
                    console.log('Application message received:', message);
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
        console.log('GameLift Streams initialized successfully');
    } catch (error) {
        console.error('Error initializing GameLift Streams:', error);
        handleDisconnect();
    }

    // cleanup
    return () => {
        console.log('🧹 Cleaning up GameLift Streams...');
        if (gameStream) {
            try {
                gameStream.close();
            } catch (error) {
                console.error('Error closing GameLift Streams:', error);
            }
        }
    };
   }, [handleDisconnect])
  
   const startMutation = useMutation({
    mutationFn: startStream,
    onSuccess: (data) => {
        setSessionArn(data.sessionArn || null);
        setStreamGroupId(data.streamGroupId || null);
        setIsInputAttached(true);
        gameStream?.attachInput();
    }
   })

   const terminateMutation = useMutation({
    mutationFn: terminateStream,
    onSuccess: () => {
        setSessionArn(null);
        setStreamGroupId(null);
        handleDisconnect();
    }
   })

   // poll stream status
   const { data: streamStatus }  = useQuery({
    queryKey: ['stream-status', sessionArn, streamGroupId],
    queryFn: () => getStreamStatus({ 
        data: { 
            sessionArn: sessionArn || '', 
            streamGroupId: streamGroupId || '' 
        } 
    }),
    enabled: !!sessionArn && !!streamGroupId && !!gameStream,
    refetchInterval: (data) => {
        console.log('streamStatus', data);

        const status = data?.state?.data?.status || data?.status;

        // poll until status is ACTIVE (ready for WebRTC) or CONNECTED
        if (status === 'ACTIVE' || status === 'CONNECTED') {
            console.log('✅ stream ready, stopping poll');
            return false;
        }
    },
    gcTime: 0 // don't cache, always refresh
   })

   // init webRTC when stream is active
   useEffect(() => {
       if (
        streamStatus?.status === 'ACTIVE' && 
        streamStatus.signalResponse && 
        gameStream &&
        connectionState !== 'connected'
       ) {
            console.log('🎯 Stream is ACTIVE, processing signal response...');
            processSignalResponse(streamStatus.signalResponse);
       }
   }, [streamStatus, gameStream, connectionState])

   const processSignalResponse = async (signalResponse: string) => {
    if (!gameStream) return;
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
    } catch (error) {
        console.error('Error processing signal response:', error);
        handleDisconnect();
    }
   }

   const handleStartStream = async () => {
    if (!gameStream) {
        console.error('GameLift Streams not initialized')
        return;
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
    if (!sessionArn || !streamGroupId) return;

    try {
        await terminateMutation.mutateAsync({
            data: { sessionArn, streamGroupId }
       })
       console.log('Stream terminated successfully');
   } catch (error) {
       console.error('Failed to terminate stream:', error);
   }
   }


  const toggleInput = () => {
    if (!gameStream) return;
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

   const getStatusDisplay = () => {
    if (!gameStream) return '⚙️ Initializing SDK...';
    if (!sessionArn) return '🎮 Ready to start';
    if (!streamStatus) return '📡 Loading stream status...';
       
    const reason = streamStatus?.statusReason ? ` (${streamStatus.statusReason})` : '';
       
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
            return `📊 Status: ${streamStatus?.status}${reason}`;
    }
   }

   return (
       <div className="public-game-container p-4">
       <div className="controls mb-4 space-x-2">
           <button
           onClick={handleStartStream}
           disabled={startMutation.isPending || !!sessionArn}
           className="bg-slate-200 text-slate-800 px-4 py-2 rounded disabled:bg-gray-400"
           >
           {startMutation.isPending ? 'Starting...' : 
           sessionArn ? 'Stream Started' : 'Play Game'}
           </button>
           {sessionArn && (
               <button
               onClick={handleTerminateStream}
               disabled={terminateMutation.isPending}
               className="bg-red-200 text-red-800 px-4 py-2 rounded disabled:bg-gray-400"
           >
               {terminateMutation.isPending ? 'Terminating...' : 'Terminate Stream'}
               </button>
           )}
       </div>

       <button
        onClick={toggleInput}
        className="bg-red-200 text-red-800 px-4 py-2 rounded mb-4"
       >
        {isInputAttached ? 'Detach Input' : 'Attach Input'}
       </button>

       <button
        onClick={toggleFullscreen}
        className="bg-red-200 text-red-800 px-4 py-2 rounded mb-4"
       >
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
       </button>

       <div className="stream-area">
           <video
               ref={videoRef}
               autoPlay
               muted
               playsInline
               controls={false}
               className="w-full max-w-4xl bg-black"
           />
           {/* Hidden Audio Element (required by GameLift Streams) */}
            <audio
                ref={audioRef}
                autoPlay
                muted={false}
                style={{ display: 'none' }}
            />

            {/* Status Display */}
            <div className="status-display p-4 bg-gray-100 rounded mt-4">
                <p className="text-lg font-medium">{getStatusDisplay()}</p>
                
                {streamStatus && (
                    <div className="text-sm text-gray-600 mt-2">
                    <p>Stream Status: {streamStatus.status}</p>
                    <p>Connection: {connectionState}</p>
                    {isInputAttached && <p>Input: Enabled</p>}
                    {streamStatus.location && <p>Location: {streamStatus.location}</p>}
                    </div>
                )}

                {sessionArn && streamStatus?.status === 'ACTIVATING' && (
                    <div className="mt-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-100"></div>
                        <p className="text-sm mt-2">
                            Starting stream... May take up to 5 minutes.
                        </p>
                    </div>
                )}
            </div>

        {/* Error Display */}
        {(startMutation.error || terminateMutation.error) && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {startMutation.error?.message || terminateMutation.error?.message}
          </div>
        )}
       </div>
       </div>
   )
}