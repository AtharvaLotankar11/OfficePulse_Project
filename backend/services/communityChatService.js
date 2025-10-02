// backend/services/communityChatService.js
const User = require('../models/User');

// In-memory storage for active users and messages (consider using Redis for production)
const activeUsers = new Map();
const chatMessages = [];
const MAX_MESSAGES = 100;

// Business/OfficePulse related keywords for content filtering
const allowedTopics = [
  'desk', 'booking', 'workspace', 'office', 'meeting', 'collaboration',
  'hybrid work', 'remote', 'productivity', 'team', 'schedule', 'analytics',
  'security', 'access', 'facility', 'amenities', 'floor', 'zone',
  'business', 'project', 'deadline', 'management', 'strategy'
];

// Function to check if message is relevant to domain
const isRelevantToDomain = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Allow greetings and basic communication
  const basicPhrases = ['hello', 'hi', 'hey', 'thanks', 'thank you', 'welcome', 'good morning', 'good afternoon'];
  if (basicPhrases.some(phrase => lowerMessage.includes(phrase))) {
    return true;
  }
  
  // Check for business/OfficePulse keywords
  return allowedTopics.some(topic => lowerMessage.includes(topic));
};

// Generate user avatar based on email
const generateUserAvatar = (email) => {
  if (!email) return '?';
  
  // Extract first letter of name before @
  const name = email.split('@')[0];
  
  // Get first letter or first two letters
  if (name.length >= 2) {
    return name.substring(0, 2).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

// Generate color based on email (consistent color for same user)
const generateUserColor = (email) => {
  const colors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B',
    '#EF4444', '#06B6D4', '#6366F1', '#84CC16', '#F97316'
  ];
  
  // Simple hash function for consistent color
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Setup community chat socket handlers
const setupCommunityChatSocket = (io) => {
  const communityNamespace = io.of('/community');
  
  communityNamespace.on('connection', async (socket) => {
    console.log(`User connected to community chat: ${socket.id}`);
    
    let currentUser = null;
    
    // Handle user join
    socket.on('join-community', async (data) => {
      const { userId, userEmail, userName } = data;
      
      if (!userId || !userEmail) {
        socket.emit('error', { message: 'Invalid user data' });
        return;
      }
      
      // Create user profile
      const userProfile = {
        id: userId,
        email: userEmail,
        name: userName,
        avatar: generateUserAvatar(userEmail),
        color: generateUserColor(userEmail),
        socketId: socket.id,
        joinedAt: new Date()
      };
      
      activeUsers.set(socket.id, userProfile);
      currentUser = userProfile;
      
      // Send recent messages to new user
      socket.emit('message-history', {
        messages: chatMessages.slice(-50) // Last 50 messages
      });
      
      // Notify all users about new user
      communityNamespace.emit('user-joined', {
        user: {
          avatar: userProfile.avatar,
          color: userProfile.color,
          name: userProfile.name
        },
        timestamp: new Date().toISOString(),
        activeCount: activeUsers.size
      });
      
      // Send active users list
      const activeUsersList = Array.from(activeUsers.values()).map(u => ({
        avatar: u.avatar,
        color: u.color,
        name: u.name,
        id: u.id
      }));
      
      communityNamespace.emit('active-users', { users: activeUsersList });
      
      console.log(`User ${userEmail} joined community chat. Active users: ${activeUsers.size}`);
    });
    
    // Handle new message
    socket.on('send-message', (data) => {
      if (!currentUser) {
        socket.emit('error', { message: 'User not authenticated' });
        return;
      }
      
      const { message } = data;
      
      if (!message || message.trim().length === 0) {
        socket.emit('error', { message: 'Message cannot be empty' });
        return;
      }
      
      if (message.length > 500) {
        socket.emit('error', { message: 'Message too long (max 500 characters)' });
        return;
      }
      
      // Check if message is relevant to domain
      if (!isRelevantToDomain(message)) {
        socket.emit('warning', {
          message: 'Please keep conversations related to OfficePulse, business, or workplace topics.'
        });
        return;
      }
      
      // Create message object
      const chatMessage = {
        id: Date.now() + Math.random(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        userColor: currentUser.color,
        message: message.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Store message
      chatMessages.push(chatMessage);
      
      // Keep only last MAX_MESSAGES
      if (chatMessages.length > MAX_MESSAGES) {
        chatMessages.shift();
      }
      
      // Broadcast to all users
      communityNamespace.emit('new-message', chatMessage);
      
      console.log(`Message from ${currentUser.email}: ${message.substring(0, 50)}...`);
    });
    
    // Handle typing indicator
    socket.on('typing-start', () => {
      if (!currentUser) return;
      
      socket.broadcast.emit('user-typing', {
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        userColor: currentUser.color
      });
    });
    
    socket.on('typing-stop', () => {
      if (!currentUser) return;
      
      socket.broadcast.emit('user-stop-typing', {
        userName: currentUser.name
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      if (currentUser) {
        activeUsers.delete(socket.id);
        
        // Notify all users
        communityNamespace.emit('user-left', {
          user: {
            avatar: currentUser.avatar,
            color: currentUser.color,
            name: currentUser.name
          },
          timestamp: new Date().toISOString(),
          activeCount: activeUsers.size
        });
        
        // Update active users list
        const activeUsersList = Array.from(activeUsers.values()).map(u => ({
          avatar: u.avatar,
          color: u.color,
          name: u.name,
          id: u.id
        }));
        
        communityNamespace.emit('active-users', { users: activeUsersList });
        
        console.log(`User ${currentUser.email} left community chat. Active users: ${activeUsers.size}`);
      }
      
      console.log(`User disconnected from community chat: ${socket.id}`);
    });
  });
  
  console.log('Community chat namespace initialized');
};

// Get active users count
const getActiveUsersCount = () => {
  return activeUsers.size;
};

// Get recent messages
const getRecentMessages = (count = 50) => {
  return chatMessages.slice(-count);
};

module.exports = {
  setupCommunityChatSocket,
  getActiveUsersCount,
  getRecentMessages
};