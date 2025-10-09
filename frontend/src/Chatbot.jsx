import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, Minimize2, Maximize2, X, Bot, User } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAppContext } from './AppContext';
import { getSocketUrl } from './config/environment';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const { user, isAuthenticated } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection once
  const initializeSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('Socket already connected');
      return; // Already connected
    }

    if (connectionAttempts > 5) {
      console.log('Max connection attempts reached');
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "I'm having trouble connecting to the server. Please refresh the page and try again.",
        sender: 'bot',
        timestamp: new Date()
      }]);
      return;
    }

    console.log(`🔌 Attempting to connect to chat server (attempt ${connectionAttempts + 1})`);

    try {
      const newSocket = io(getSocketUrl(), {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: false,
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 10,
        autoConnect: true
      });
      
      newSocket.on('connect', () => {
        console.log('✅ Connected to chat server:', newSocket.id);
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      newSocket.on('connect_error', (error) => {
        console.log('❌ Connection error:', error.message);
        setIsConnected(false);
        setConnectionAttempts(prev => prev + 1);
        
        // Show user-friendly error message
        if (connectionAttempts === 0) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: "Having trouble connecting to the AI service. Retrying...",
            sender: 'bot',
            timestamp: new Date()
          }]);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected:', reason);
        setIsConnected(false);
        setIsTyping(false);
        
        // Don't auto-reconnect if manually disconnected
        if (reason !== 'io client disconnect') {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!socketRef.current?.connected && connectionAttempts < 5) {
              initializeSocket();
            }
          }, 3000);
        }
      });

      newSocket.on('bot-message', (data) => {
        console.log('📨 Received bot message:', data.message);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: data.message,
          sender: 'bot',
          timestamp: new Date(data.timestamp)
        }]);
      });

      newSocket.on('error', (error) => {
        console.error('❌ Socket error:', error);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "I encountered an error. Please try sending your message again.",
          sender: 'bot',
          timestamp: new Date()
        }]);
      });

      socketRef.current = newSocket;

    } catch (error) {
      console.error('❌ Socket initialization error:', error);
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
    }
  }, [connectionAttempts]);

  // Connect when chat is opened
  useEffect(() => {
    if (isOpen && !socketRef.current?.connected) {
      initializeSocket();
    }
  }, [isOpen, initializeSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      console.log('Empty message, not sending');
      return;
    }

    if (!socketRef.current?.connected) {
      console.log('Socket not connected, attempting to reconnect...');
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "I'm not connected to the server. Let me try to reconnect...",
        sender: 'bot',
        timestamp: new Date()
      }]);
      initializeSocket();
      return;
    }

    const messageText = inputMessage.trim();
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    console.log('📤 Sending message:', messageText);
    setMessages(prev => [...prev, userMessage]);
    
    socketRef.current.emit('user-message', {
      message: messageText,
      userId: isAuthenticated ? user?.email : 'anonymous'
    });

    setInputMessage('');
    setIsTyping(true);

    // Timeout for typing indicator in case response fails
    setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "I'm taking longer than usual to respond. Please try sending your message again.",
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    }, 15000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsTyping(false);
    
    // Properly disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setConnectionAttempts(0);
    
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getConnectionStatus = () => {
    if (isConnected) return 'Online';
    if (connectionAttempts > 0) return 'Reconnecting...';
    return 'Connecting...';
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed top-20 right-4 sm:right-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 sm:p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-40 group"
          title="Open AI Assistant"
          style={{ top: '80px' }} // 64px navbar + 16px margin
        >
          <MessageCircle size={20} className="sm:w-6 sm:h-6" />
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-40 transition-all duration-300 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl
          ${isMinimized ? 'w-80 h-16' : 'w-full sm:w-96'}
          ${isMinimized 
            ? 'right-4 sm:right-6' 
            : 'right-0 left-0 sm:right-4 sm:left-auto sm:w-96'
          }`}
          style={{
            top: isMinimized ? '80px' : '80px', // 64px navbar + 16px margin
            height: isMinimized ? '64px' : 'calc(100vh - 96px)', // Full height minus navbar and margins
            maxHeight: isMinimized ? '64px' : '600px'
          }}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot size={20} className="sm:w-6 sm:h-6 text-white" />
                <div className={`absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">OfficePulse AI Assistant</h3>
                <p className="text-blue-100 text-xs">
                  {getConnectionStatus()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Only show minimize on larger screens */}
              <button
                onClick={minimizeChat}
                className="hidden sm:block text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={closeChat}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-800" 
                   style={{ height: 'calc(100% - 140px)' }}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 sm:gap-3 ${
                        message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                        message.sender === 'user' 
                          ? 'bg-blue-500' 
                          : 'bg-gray-600'
                      }`}>
                        {message.sender === 'user' ? (
                          <User size={14} className="sm:w-4 sm:h-4 text-white" />
                        ) : (
                          <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
                        )}
                      </div>
                      <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        <div className={`inline-block p-2 sm:p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-100'
                        }`}>
                          <p>{message.text}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-full bg-gray-600 flex-shrink-0">
                        <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
                      </div>
                      <div className="bg-gray-700 text-gray-100 p-2 sm:p-3 rounded-2xl">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 sm:p-4 border-t border-gray-700 bg-gray-900 rounded-b-2xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isConnected ? "Ask me anything! I specialize in business, corporate, and OfficePulse topics..." : "Connecting..."}
                    disabled={!isConnected}
                    className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    rows="1"
                    style={{ maxHeight: '60px', minHeight: '36px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || !isConnected}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white p-1.5 sm:p-2 rounded-lg transition-colors disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400 truncate max-w-[60%]">
                    {isAuthenticated 
                      ? `${user?.email}` 
                      : 'Anonymous user'
                    }
                  </p>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      isConnected ? 'bg-green-400' : connectionAttempts > 0 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-xs text-gray-400">
                      {getConnectionStatus()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;