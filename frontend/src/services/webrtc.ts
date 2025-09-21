import { io, Socket } from 'socket.io-client';

export interface WebRTCUser {
  username: string;
  socketId: string;
}

export interface WebRTCCallbacks {
  onRoomJoined?: (data: { roomId: string; users: WebRTCUser[] }) => void;
  onUserLeft?: (data: { username: string; socketId: string }) => void;
  onWaitingForMatch?: () => void;
  onError?: (error: { message: string }) => void;
  onPeerVideoToggle?: (data: { from: string; enabled: boolean }) => void;
  onPeerAudioToggle?: (data: { from: string; enabled: boolean }) => void;
}

export class WebRTCService {
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentRoomId: string | null = null;
  private callbacks: WebRTCCallbacks = {};

  constructor(private backendUrl: string) {}

  // Initialize socket connection
  connect(userId: string, username: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.backendUrl, {
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebRTC server');
        
        // Register user
        this.socket!.emit('register-user', { userId, username });
      });

      this.socket.on('user-registered', (data) => {
        console.log('User registered successfully:', data);
        this.setupSocketListeners();
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      // Set timeout for connection
      setTimeout(() => {
        if (!this.socket?.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 5000);
    });
  }

  // Setup socket event listeners
  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('room-joined', (data) => {
      console.log('Room joined:', data);
      this.currentRoomId = data.roomId;
      this.callbacks.onRoomJoined?.(data);
      
      // Start WebRTC connection as the second user (caller)
      const otherUser = data.users.find(u => u.socketId !== this.socket?.id);
      if (otherUser) {
        this.startCall();
      }
    });

    this.socket.on('waiting-for-match', (data) => {
      console.log('Waiting for match:', data);
      this.callbacks.onWaitingForMatch?.();
    });

    this.socket.on('user-left', (data) => {
      console.log('User left:', data);
      this.callbacks.onUserLeft?.(data);
      this.endCall();
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.callbacks.onError?.(error);
    });

    // WebRTC signaling
    this.socket.on('webrtc-offer', async (data) => {
      console.log('Received offer from:', data.from);
      await this.handleOffer(data.offer);
    });

    this.socket.on('webrtc-answer', async (data) => {
      console.log('Received answer from:', data.from);
      await this.handleAnswer(data.answer);
    });

    this.socket.on('webrtc-ice-candidate', async (data) => {
      console.log('Received ICE candidate from:', data.from);
      await this.handleIceCandidate(data.candidate);
    });

    // Call controls
    this.socket.on('peer-video-toggle', (data) => {
      this.callbacks.onPeerVideoToggle?.(data);
    });

    this.socket.on('peer-audio-toggle', (data) => {
      this.callbacks.onPeerAudioToggle?.(data);
    });
  }

  // Set callbacks
  setCallbacks(callbacks: WebRTCCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Join random room
  joinRandomRoom() {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('join-random-room');
  }

  // Initialize local media stream
  async initializeMedia(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  // Create peer connection
  private async createPeerConnection(): Promise<RTCPeerConnection> {
    // Get ICE servers from backend
    const iceServersResponse = await fetch(`http://${this.backendUrl}/api/v1/webrtc/ice-servers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    let iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
    
    if (iceServersResponse.ok) {
      const data = await iceServersResponse.json();
      iceServers = data.data.iceServers;
    }

    this.peerConnection = new RTCPeerConnection({ iceServers });

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket && this.currentRoomId) {
        this.socket.emit('webrtc-ice-candidate', {
          roomId: this.currentRoomId,
          candidate: event.candidate.toJSON()
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote stream');
      this.remoteStream = event.streams[0];
    };

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    return this.peerConnection;
  }

  // Start call (caller side)
  private async startCall() {
    try {
      await this.createPeerConnection();
      
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      if (this.socket && this.currentRoomId) {
        this.socket.emit('webrtc-offer', {
          roomId: this.currentRoomId,
          offer: offer
        });
      }
    } catch (error) {
      console.error('Error starting call:', error);
    }
  }

  // Handle incoming offer (receiver side)
  private async handleOffer(offer: RTCSessionDescriptionInit) {
    try {
      await this.createPeerConnection();
      
      await this.peerConnection!.setRemoteDescription(offer);
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);

      if (this.socket && this.currentRoomId) {
        this.socket.emit('webrtc-answer', {
          roomId: this.currentRoomId,
          answer: answer
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  // Handle incoming answer
  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection!.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  // Handle ICE candidate
  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.peerConnection!.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  // Toggle video
  toggleVideo(): boolean {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      
      if (this.socket && this.currentRoomId) {
        this.socket.emit('toggle-video', {
          roomId: this.currentRoomId,
          enabled: videoTrack.enabled
        });
      }
      
      return videoTrack.enabled;
    }
    return false;
  }

  // Toggle audio
  toggleAudio(): boolean {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      
      if (this.socket && this.currentRoomId) {
        this.socket.emit('toggle-audio', {
          roomId: this.currentRoomId,
          enabled: audioTrack.enabled
        });
      }
      
      return audioTrack.enabled;
    }
    return false;
  }

  // Leave room
  leaveRoom() {
    if (this.socket) {
      this.socket.emit('leave-room');
    }
    this.endCall();
  }

  // End call and cleanup
  endCall() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    this.remoteStream = null;
    this.currentRoomId = null;
  }

  // Get streams
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Disconnect
  disconnect() {
    this.endCall();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}