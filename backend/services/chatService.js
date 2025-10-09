// chatService.js - Backend Chat Service with Groq AI Integration
const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are an intelligent AI assistant for OfficePulse, a modern workplace management platform. You can answer any type of question, but you specialize in:

- Business and corporate operations
- OfficePulse platform features (desk booking, analytics, security)
- Workplace management and hybrid work strategies
- HR and employee relations
- Economics and finance
- Technology and innovation

When responding:
1. Be helpful, professional, and conversational
2. Provide accurate and detailed information
3. If asked about OfficePulse specifically, highlight features like real-time desk booking, AI-powered analytics, enterprise security, and booking management
4. For general questions outside your specialty, still provide helpful answers but mention your expertise areas
5. Keep responses concise but informative
6. Always maintain a friendly and supportive tone

Remember: You can answer ANY type of question, but your specialty is in business, corporate, and OfficePulse domain-related topics.`;

// Generate AI response using Groq
const generateChatResponse = async (message) => {
  try {
    console.log('🤖 Generating response for message:', message);
    
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
      stream: false
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response content received from Groq API');
    }

    console.log('✅ Groq API response generated successfully');
    return response;
    
  } catch (error) {
    console.error('❌ Groq API Error:', error.message);
    console.error('Error details:', error);
    
    // More specific error handling
    if (error.message?.includes('API key')) {
      return "I'm experiencing authentication issues with my AI service. Please contact support if this persists.";
    } else if (error.message?.includes('rate limit')) {
      return "I'm currently receiving too many requests. Please wait a moment and try again.";
    } else if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      return "I'm having network connectivity issues. Please check your internet connection and try again.";
    }
    
    // Fallback response if API fails
    return "I can answer any business, corporate, or OfficePulse domain-related questions. I'm currently experiencing some technical difficulties, but I'm here to help with workplace management, HR matters, business operations, and our platform features. Could you please try asking your question again?";
  }
};

// Socket.io integration for server.js
const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected to chat: ${socket.id}`);
    
    // Send welcome message with delay to ensure connection is stable
    setTimeout(() => {
      socket.emit('bot-message', {
        message: "Hello! I'm your OfficePulse AI assistant. I can answer any type of question, but I specialize in business, corporate, and OfficePulse domain-related topics including workplace management, HR matters, business operations, and our platform features. How can I help you today?",
        timestamp: new Date().toISOString()
      });
    }, 500);
    
    // Handle incoming messages
    socket.on('user-message', async (data) => {
      const { message, userId } = data;
      console.log(`💬 Message from ${userId}: ${message}`);
      
      if (!message || !message.trim()) {
        socket.emit('bot-message', {
          message: "I didn't receive your message properly. Could you please try sending it again?",
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      try {
        // Generate AI response
        const response = await generateChatResponse(message.trim());
        
        // Add small delay to make it feel more natural
        setTimeout(() => {
          socket.emit('bot-message', {
            message: response,
            timestamp: new Date().toISOString()
          });
        }, 1000);
        
      } catch (error) {
        console.error('❌ Error generating response:', error);
        socket.emit('bot-message', {
          message: "I apologize for the technical difficulty. I can answer any business, corporate, or OfficePulse domain-related questions. Please try asking again.",
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.broadcast.emit('user-typing', data);
    });
    
    socket.on('stop-typing', (data) => {
      socket.broadcast.emit('user-stop-typing', data);
    });
    
    // Handle connection errors
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
    
    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected from chat: ${socket.id}, reason: ${reason}`);
    });
  });
  
  console.log('✅ Chat socket service initialized');
};

module.exports = {
  setupChatSocket,
  generateChatResponse
};