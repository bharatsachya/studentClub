import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WebRTCService, WebRTCUser } from '../services/webrtc';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'localhost:3000';

interface VideoCallProps {
  username?: string;
  userId?: string;
}

export default function VideoCall({ username = "Student", userId = "demo-user" }: VideoCallProps) {
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcService = useRef<WebRTCService | null>(null);
  
  const [isConnecting, setIsConnecting] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [connectedUser, setConnectedUser] = useState<WebRTCUser | null>(null);
  const [error, setError] = useState<string>('');
  
  // Call controls
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isPeerVideoEnabled, setIsPeerVideoEnabled] = useState(true);
  const [isPeerAudioEnabled, setIsPeerAudioEnabled] = useState(true);

  useEffect(() => {
    initializeWebRTC();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      // Initialize WebRTC service
      webrtcService.current = new WebRTCService(`http://${BACKEND_URL}`);
      
      // Set up callbacks
      webrtcService.current.setCallbacks({
        onRoomJoined: (data) => {
          console.log('Room joined:', data);
          setIsWaiting(false);
          setIsInCall(true);
          
          const otherUser = data.users.find(u => u.socketId !== webrtcService.current?.socket?.id);
          if (otherUser) {
            setConnectedUser(otherUser);
          }
          
          // Set up remote stream
          setTimeout(() => {
            const remoteStream = webrtcService.current?.getRemoteStream();
            if (remoteStream && remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          }, 1000);
        },
        
        onUserLeft: (data) => {
          console.log('User left:', data);
          setConnectedUser(null);
          setIsInCall(false);
          setIsWaiting(false);
          setError('The other user has left the call');
        },
        
        onWaitingForMatch: () => {
          console.log('Waiting for match...');
          setIsWaiting(true);
          setIsConnecting(false);
        },
        
        onError: (error) => {
          console.error('WebRTC error:', error);
          setError(error.message);
          setIsConnecting(false);
        },
        
        onPeerVideoToggle: (data) => {
          setIsPeerVideoEnabled(data.enabled);
        },
        
        onPeerAudioToggle: (data) => {
          setIsPeerAudioEnabled(data.enabled);
        }
      });

      // Connect to WebRTC server
      await webrtcService.current.connect(userId, username);
      
      // Initialize media
      const localStream = await webrtcService.current.initializeMedia();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      
      setIsConnecting(false);
      
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      setError('Failed to access camera/microphone or connect to server');
      setIsConnecting(false);
    }
  };

  const joinRandomRoom = () => {
    if (webrtcService.current) {
      try {
        webrtcService.current.joinRandomRoom();
        setError('');
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const toggleVideo = () => {
    if (webrtcService.current) {
      const enabled = webrtcService.current.toggleVideo();
      setIsVideoEnabled(enabled);
    }
  };

  const toggleAudio = () => {
    if (webrtcService.current) {
      const enabled = webrtcService.current.toggleAudio();
      setIsAudioEnabled(enabled);
    }
  };

  const leaveCall = () => {
    if (webrtcService.current) {
      webrtcService.current.leaveRoom();
    }
    setIsInCall(false);
    setIsWaiting(false);
    setConnectedUser(null);
  };

  const goBack = () => {
    cleanup();
    navigate('/dashboard');
  };

  const cleanup = () => {
    if (webrtcService.current) {
      webrtcService.current.disconnect();
      webrtcService.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={goBack}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">StudentConnect Video Call</h1>
        </div>
        
        {connectedUser && (
          <div className="text-sm text-gray-300">
            Connected to: {connectedUser.username}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {/* Connecting State */}
          {isConnecting && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
              <p className="text-gray-400">Setting up your camera and microphone</p>
            </motion.div>
          )}

          {/* Waiting State */}
          {isWaiting && !isInCall && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="animate-pulse rounded-full h-12 w-12 bg-green-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Waiting for someone to join...</h2>
              <p className="text-gray-400 mb-6">You'll be matched with a random student soon!</p>
              
              <div className="relative w-64 h-48 mx-auto bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  You
                </div>
              </div>
            </motion.div>
          )}

          {/* Ready to Call State */}
          {!isConnecting && !isWaiting && !isInCall && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold mb-4">Ready to meet new students?</h2>
              <p className="text-gray-400 mb-8">Click below to be matched with a random student for video chat</p>
              
              <div className="relative w-64 h-48 mx-auto mb-8 bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  You
                </div>
              </div>
              
              <motion.button
                onClick={joinRandomRoom}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Random Chat
              </motion.button>
            </motion.div>
          )}

          {/* In Call State */}
          {isInCall && (
            <motion.div
              key="call"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-6xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[70vh]">
                {/* Remote Video */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded text-sm">
                    {connectedUser?.username || 'Other Student'}
                  </div>
                  {!isPeerVideoEnabled && (
                    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-300">Camera off</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Local Video */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded text-sm">
                    You
                  </div>
                  {!isVideoEnabled && (
                    <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-300">Camera off</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Call Controls */}
      {isInCall && (
        <div className="bg-gray-800 p-4">
          <div className="flex justify-center space-x-4">
            <motion.button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'} transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isVideoEnabled ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 18M5.636 5.636L6 6" />
                )}
              </svg>
            </motion.button>

            <motion.button
              onClick={toggleAudio}
              className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'} transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isAudioEnabled ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                )}
              </svg>
            </motion.button>

            <motion.button
              onClick={leaveCall}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}