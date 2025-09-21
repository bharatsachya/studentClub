import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

interface User {
  id: string;
  socketId: string;
  username: string;
  isInCall: boolean;
  roomId?: string;
}

interface Room {
  id: string;
  users: User[];
  createdAt: Date;
}

// Store active users and rooms
const activeUsers = new Map<string, User>();
const waitingQueue: User[] = [];
const activeRooms = new Map<string, Room>();

// Generate room ID
const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Initialize WebSocket server
export const initializeWebRTC = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user registration
    socket.on('register-user', (userData: { username: string, userId: string }) => {
      const user: User = {
        id: userData.userId,
        socketId: socket.id,
        username: userData.username,
        isInCall: false
      };
      
      activeUsers.set(socket.id, user);
      console.log(`User registered: ${userData.username} (${socket.id})`);
      
      socket.emit('user-registered', { success: true, user });
    });

    // Handle joining random room
    socket.on('join-random-room', () => {
      const user = activeUsers.get(socket.id);
      if (!user || user.isInCall) {
        socket.emit('error', { message: 'User not available for matching' });
        return;
      }

      // Check if there's someone waiting in queue
      if (waitingQueue.length > 0) {
        // Match with waiting user
        const waitingUser = waitingQueue.shift()!;
        const roomId = generateRoomId();
        
        // Create room
        const room: Room = {
          id: roomId,
          users: [user, waitingUser],
          createdAt: new Date()
        };
        
        // Update users
        user.isInCall = true;
        user.roomId = roomId;
        waitingUser.isInCall = true;
        waitingUser.roomId = roomId;
        
        activeRooms.set(roomId, room);
        
        // Join socket rooms
        socket.join(roomId);
        io.sockets.sockets.get(waitingUser.socketId)?.join(roomId);
        
        // Notify both users
        io.to(roomId).emit('room-joined', {
          roomId,
          users: [
            { username: user.username, socketId: user.socketId },
            { username: waitingUser.username, socketId: waitingUser.socketId }
          ]
        });
        
        console.log(`Room created: ${roomId} with users ${user.username} and ${waitingUser.username}`);
        
      } else {
        // Add to waiting queue
        waitingQueue.push(user);
        socket.emit('waiting-for-match', { message: 'Waiting for another user...' });
        console.log(`User ${user.username} added to waiting queue`);
      }
    });

    // Handle WebRTC signaling
    socket.on('webrtc-offer', (data: { roomId: string, offer: RTCSessionDescriptionInit }) => {
      socket.to(data.roomId).emit('webrtc-offer', {
        offer: data.offer,
        from: socket.id
      });
    });

    socket.on('webrtc-answer', (data: { roomId: string, answer: RTCSessionDescriptionInit }) => {
      socket.to(data.roomId).emit('webrtc-answer', {
        answer: data.answer,
        from: socket.id
      });
    });

    socket.on('webrtc-ice-candidate', (data: { roomId: string, candidate: RTCIceCandidateInit }) => {
      socket.to(data.roomId).emit('webrtc-ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      });
    });

    // Handle leaving room
    socket.on('leave-room', () => {
      const user = activeUsers.get(socket.id);
      if (user && user.roomId) {
        const room = activeRooms.get(user.roomId);
        if (room) {
          // Notify other user
          socket.to(user.roomId).emit('user-left', {
            username: user.username,
            socketId: socket.id
          });
          
          // Clean up room
          socket.leave(user.roomId);
          user.isInCall = false;
          delete user.roomId;
          
          // Remove room if both users left
          const remainingUsers = room.users.filter(u => u.socketId !== socket.id);
          if (remainingUsers.length === 0) {
            activeRooms.delete(user.roomId!);
          } else {
            room.users = remainingUsers;
            remainingUsers[0].isInCall = false;
            delete remainingUsers[0].roomId;
          }
        }
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      const user = activeUsers.get(socket.id);
      if (user) {
        // Remove from waiting queue
        const queueIndex = waitingQueue.findIndex(u => u.socketId === socket.id);
        if (queueIndex > -1) {
          waitingQueue.splice(queueIndex, 1);
        }
        
        // Handle room cleanup
        if (user.roomId) {
          const room = activeRooms.get(user.roomId);
          if (room) {
            socket.to(user.roomId).emit('user-left', {
              username: user.username,
              socketId: socket.id
            });
            
            // Clean up room
            const remainingUsers = room.users.filter(u => u.socketId !== socket.id);
            if (remainingUsers.length === 0) {
              activeRooms.delete(user.roomId!);
            } else {
              room.users = remainingUsers;
              remainingUsers[0].isInCall = false;
              delete remainingUsers[0].roomId;
            }
          }
        }
        
        activeUsers.delete(socket.id);
      }
    });

    // Handle call controls
    socket.on('toggle-video', (data: { roomId: string, enabled: boolean }) => {
      socket.to(data.roomId).emit('peer-video-toggle', {
        from: socket.id,
        enabled: data.enabled
      });
    });

    socket.on('toggle-audio', (data: { roomId: string, enabled: boolean }) => {
      socket.to(data.roomId).emit('peer-audio-toggle', {
        from: socket.id,
        enabled: data.enabled
      });
    });

    // Get room statistics
    socket.on('get-stats', (callback) => {
      callback({
        activeUsers: activeUsers.size,
        waitingQueue: waitingQueue.length,
        activeRooms: activeRooms.size
      });
    });
  });

  return io;
};