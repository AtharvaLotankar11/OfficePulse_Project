const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const { setupChatSocket } = require('./services/chatService');
const { setupCommunityChatSocket } = require('./services/communityChatService');
const { setupVideoMeetupSocket } = require('./services/videoMeetupService');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'https://officepulse-frontend.onrender.com'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://officepulse-frontend.onrender.com'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'OfficePulse API is running!',
    timestamp: new Date().toISOString(),
    features: {
      realTimeChat: true,
      communityChat: true,
      videoMeetup: true,
      analytics: true,
      websockets: true
    }
  });
});

// Setup socket handlers
setupChatSocket(io); // AI Chatbot
setupCommunityChatSocket(io); // Community Chat
setupVideoMeetupSocket(io); // Video Meetup

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💬 AI Chatbot: Enabled`);
  console.log(`👥 Community Chat: Enabled`);
  console.log(`🎥 Video Meetup: Enabled`);
});