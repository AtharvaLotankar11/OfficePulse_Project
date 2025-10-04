// backend/services/videoMeetupService.js
const User = require('../models/User');

// In-memory storage for active rooms and participants
const activeRooms = new Map();
const roomParticipants = new Map();

// Setup video meetup socket handlers
const setupVideoMeetupSocket = (io) => {
  const videoNamespace = io.of('/video');
  
  videoNamespace.on('connection', (socket) => {
    console.log(`User connected to video service: ${socket.id}`);
    
    let currentRoom = null;
    let currentUser = null;
    
    // Handle joining a room
    socket.on('join-room', async (data) => {
      const { roomId, userId, userName, userEmail, isHost } = data;
      
      if (!roomId || !userId) {
        socket.emit('error', { message: 'Invalid room or user data' });
        return;
      }
      
      // Create user profile
      const userProfile = {
        userId,
        userName,
        userEmail,
        socketId: socket.id,
        isHost,
        joinedAt: new Date()
      };
      
      // Join the socket room
      socket.join(roomId);
      currentRoom = roomId;
      currentUser = userProfile;
      
      // Initialize room if it doesn't exist
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
          roomId,
          roomName: data.roomName || roomId,
          createdAt: new Date(),
          hostId: isHost ? userId : null
        });
        roomParticipants.set(roomId, []);
      }
      
      // Add user to room participants
      const participants = roomParticipants.get(roomId);
      participants.push(userProfile);
      roomParticipants.set(roomId, participants);
      
      // Notify others in the room about new participant
      socket.to(roomId).emit('user-connected', {
        userId: userProfile.userId,
        userName: userProfile.userName,
        userEmail: userProfile.userEmail,
        joinedAt: userProfile.joinedAt
      });
      
      // Send current participants list to the new user
      socket.emit('room-participants', {
        participants: participants.filter(p => p.userId !== userId)
      });
      
      console.log(`User ${userName} joined room ${roomId}. Total participants: ${participants.length}`);
    });
    
    // Handle WebRTC offer
    socket.on('offer', (data) => {
      const { targetUserId, offer } = data;
      
      if (!currentRoom || !currentUser) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }
      
      // Find target user's socket
      const participants = roomParticipants.get(currentRoom);
      const targetUser = participants?.find(p => p.userId === targetUserId);
      
      if (targetUser) {
        videoNamespace.to(targetUser.socketId).emit('offer', {
          fromUserId: currentUser.userId,
          fromUserName: currentUser.userName,
          offer
        });
      }
    });
    
    // Handle WebRTC answer
    socket.on('answer', (data) => {
      const { targetUserId, answer } = data;
      
      if (!currentRoom || !currentUser) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }
      
      // Find target user's socket
      const participants = roomParticipants.get(currentRoom);
      const targetUser = participants?.find(p => p.userId === targetUserId);
      
      if (targetUser) {
        videoNamespace.to(targetUser.socketId).emit('answer', {
          fromUserId: currentUser.userId,
          fromUserName: currentUser.userName,
          answer
        });
      }
    });
    
    // Handle ICE candidate
    socket.on('ice-candidate', (data) => {
      const { targetUserId, candidate } = data;
      
      if (!currentRoom || !currentUser) {
        socket.emit('error', { message: 'Not in a room' });
        return;
      }
      
      // Find target user's socket
      const participants = roomParticipants.get(currentRoom);
      const targetUser = participants?.find(p => p.userId === targetUserId);
      
      if (targetUser) {
        videoNamespace.to(targetUser.socketId).emit('ice-candidate', {
          fromUserId: currentUser.userId,
          candidate
        });
      }
    });

    // Handle leaving room explicitly
    socket.on('leave-room', () => {
      if (currentRoom && currentUser) {
        // Remove user from room participants
        const participants = roomParticipants.get(currentRoom);
        if (participants) {
          const updatedParticipants = participants.filter(
            p => p.socketId !== socket.id
          );
          
          if (updatedParticipants.length === 0) {
            // Remove room if empty
            activeRooms.delete(currentRoom);
            roomParticipants.delete(currentRoom);
            console.log(`Room ${currentRoom} deleted (empty)`);
          } else {
            roomParticipants.set(currentRoom, updatedParticipants);
            
            // Notify others about user leaving
            socket.to(currentRoom).emit('user-disconnected', {
              userId: currentUser.userId,
              userName: currentUser.userName
            });
          }
        }
        
        socket.leave(currentRoom);
        console.log(`User ${currentUser.userName} left room ${currentRoom}`);
        currentRoom = null;
        currentUser = null;
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      if (currentRoom && currentUser) {
        // Remove user from room participants
        const participants = roomParticipants.get(currentRoom);
        if (participants) {
          const updatedParticipants = participants.filter(
            p => p.socketId !== socket.id
          );
          
          if (updatedParticipants.length === 0) {
            // Remove room if empty
            activeRooms.delete(currentRoom);
            roomParticipants.delete(currentRoom);
            console.log(`Room ${currentRoom} deleted (empty)`);
          } else {
            roomParticipants.set(currentRoom, updatedParticipants);
            
            // Notify others about user leaving
            socket.to(currentRoom).emit('user-disconnected', {
              userId: currentUser.userId,
              userName: currentUser.userName
            });
          }
        }
        
        console.log(`User ${currentUser.userName} left room ${currentRoom}`);
      }
      
      console.log(`User disconnected from video service: ${socket.id}`);
    });
  });
  
  console.log('Video meetup namespace initialized');
};

// Get active rooms count
const getActiveRoomsCount = () => {
  return activeRooms.size;
};

// Get room participants
const getRoomParticipants = (roomId) => {
  return roomParticipants.get(roomId) || [];
};

module.exports = {
  setupVideoMeetupSocket,
  getActiveRoomsCount,
  getRoomParticipants
};