import { useRef, useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { startStream, getStreamStatus, terminateStream } from '../integrations/gamelift/service'

export function PublicStream() {
   const videoRef = useRef<HTMLVideoElement>(null)
   const [sessionArn, setSessionArn] = useState<string | null>(null)
   const [webrtcConnection, setWebrtcConnection] = useState<RTCPeerConnection | null>(null)
  
   const mutate = useMutation({
    mutationFn: startStream,
    onSuccess: (data) => {
        setSessionArn(data.sessionArn || null)
    }
   })
   const terminateMutation = useMutation({
    mutationFn: terminateStream,
    onSuccess: () => {
        setSessionArn(null)
    }
   })

   // poll stream status
   const { data: streamStatus }  = useQuery({
    queryKey: ['stream-status', sessionArn],
    queryFn: () => getStreamStatus({ data: { sessionArn: sessionArn || '' } }),
    enabled: !!sessionArn,
    refetchInterval: (data) => {
        console.log('streamStatus', data)
      // Keep polling until status is ACTIVE or CONNECTED
      return data?.status === 'ACTIVE' || data?.status === 'CONNECTED' ? false : 2000
    },
    gcTime: 0 // don't cache, always refresh
   })

   // init webRTC when stream is active
   useEffect(() => {
       if (streamStatus?.status === 'ACTIVE' && streamStatus.signalResponse && !webrtcConnection) {
           setupWebRTCConnection(streamStatus.signalResponse)
       }
   }, [streamStatus, webrtcConnection])

   const generateWebRTCOffer = async (signalResponse: string) => {
       const pc = new RTCPeerConnection({
           iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
       })

       // Add transceiver for receiving video (required for GameLift Streams)
       pc.addTransceiver('video', { direction: 'recvonly' })
       
       // Add transceiver for receiving audio (optional but recommended)
       pc.addTransceiver('audio', { direction: 'recvonly' })

       // Create data channel for game input
       pc.createDataChannel('input', { ordered: true })

       // Create offer
       const offer = await pc.createOffer()
       await pc.setLocalDescription(offer)

       // Wait for ICE gathering to complete
       return new Promise((resolve) => {
           if (pc.iceGatheringState === 'complete') {
               resolve(JSON.stringify(offer))
           } else {
               pc.addEventListener('icegatheringstatechange', () => {
                   if (pc.iceGatheringState === 'complete') {
                       resolve(JSON.stringify(pc.localDescription))
                   }
               })
           }
       })
   }

   const setupWebRTCConnection = async (signalResponse: string) => {
       try {
           const pc = new RTCPeerConnection({
               iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
           })

           // Parse the signal response (WebRTC answer)
           const answer = JSON.parse(signalResponse)
           await pc.setRemoteDescription(answer)

           // Handle incoming video stream
           pc.ontrack = (event) => {
               if (videoRef.current && event.streams[0]) {
                   videoRef.current.srcObject = event.streams[0]
               }
           }

           // Handle connection state changes
           pc.onconnectionstatechange = () => {
               console.log('Connection state:', pc.connectionState)
           }

           // Handle data channel for input
           pc.ondatachannel = (event) => {
               const channel = event.channel
               channel.onopen = () => {
                   console.log('Data channel opened')
               }
               channel.onmessage = (event) => {
                   console.log('Received:', event.data)
               }
           }

           setWebrtcConnection(pc)
       } catch (error) {
           console.error('Failed to setup WebRTC connection:', error)
       }
   }

   const handleStartStream = async () => {
       try {
           const signalRequest = await generateWebRTCOffer()
           
           await mutate.mutateAsync({
               data: {
                   signalRequest,
                   userId: `player-${Date.now()}`
               }
           })
       } catch (error) {
           console.error('Failed to start stream:', error)
       }
   }

   const handleTerminateStream = async () => {
       await terminateMutation.mutateAsync({
           data: {
               sessionArn: sessionArn || ''
           }
       })
   }

   const getStatusDisplay = () => {
       if (!sessionArn) return 'Ready to start'
       if (mutate.isPending) return 'Starting...'
       if (!streamStatus) return 'Initializing...'
       
       const baseStatus = `Status: ${streamStatus.status}`
       const reason = streamStatus.statusReason ? ` (${streamStatus.statusReason})` : ''
       
       switch (streamStatus.status) {
       case 'ACTIVATING':
           return 'Preparing stream - Starting application...'
       case 'ACTIVE':
           return 'Stream active - Connecting to video...'
       case 'CONNECTED':
           return 'Connected and streaming!'
       case 'ERROR':
           return `Stream error${reason}`
       case 'TERMINATED':
           return 'Stream session ended'
       case 'PENDING':
           return 'Stream pending - Waiting for resources...'
       default:
           return `${baseStatus}${reason}`
       }
   }
   
   return (
       <div className="public-game-container">
       <div className="controls mb-4">
           <button
           onClick={handleStartStream}
           disabled={mutate.isPending || !!sessionArn}
           className="bg-slate-200 text-slate-800 px-4 py-2 rounded disabled:bg-gray-400"
           >
           {mutate.isPending ? 'Starting...' : 
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

       <div className="stream-area">
           <video
               ref={videoRef}
               autoPlay
               muted
               playsInline
               controls={false}
               className="w-full max-w-4xl bg-black"
           />
           
           <div className="status-display p-2 bg-gray-100 rounded mt-2">
               <p>{getStatusDisplay()}</p>
               {streamStatus && (
                   <div className="text-sm text-gray-600 space-y-1">
                       <p>Status: {streamStatus.status}</p>
                       {streamStatus.statusReason && (
                           <p>Reason: {streamStatus.statusReason}</p>
                       )}
                       {streamStatus.location && (
                           <p>Location: {streamStatus.location}</p>
                       )}
                       <p>Session ARN: {sessionArn}</p>
                   </div>
               )}
           </div>
       </div>
       </div>
   )
}