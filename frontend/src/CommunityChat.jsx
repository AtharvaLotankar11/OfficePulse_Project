// frontend/src/CommunityChat.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Users,
  X,
  Minimize2,
  Maximize2,
  AlertCircle,
  Info,
} from "lucide-react";
import { io } from "socket.io-client";
import { useAppContext } from "./AppContext";
import { getSocketUrl } from "./config/environment";
import Navbar from "./Navbar";
import Footer from "./Footer";

const CommunityChat = ({ onBack, embedded = false }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [warning, setWarning] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { user, isAuthenticated, setCurrentPage } = useAppContext();

  // Fade in effect like RealTimeDesk
  const [isVisible, setIsVisible] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Scroll to top of page when component loads with slight delay
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, []);

  // Fade in effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = io(getSocketUrl('community'), {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
      timeout: 15000,
      forceNew: false,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to community chat");
      setIsConnected(true);

      // Join community chat
      socket.emit("join-community", {
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName || `${user.firstName} ${user.lastName}`,
      });
    });

    socket.on("connect_error", (error) => {
      console.error("Community chat connection error:", error);
      setIsConnected(false);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from community chat");
      setIsConnected(false);
    });

    socket.on("message-history", (data) => {
      setMessages(data.messages || []);
    });

    socket.on("new-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("active-users", (data) => {
      setActiveUsers(data.users || []);
    });

    socket.on("user-joined", (data) => {
      console.log("User joined:", data.user.name);
    });

    socket.on("user-left", (data) => {
      console.log("User left:", data.user.name);
    });

    socket.on("user-typing", (data) => {
      setTypingUsers((prev) => {
        if (!prev.find((u) => u.userName === data.userName)) {
          return [...prev, data];
        }
        return prev;
      });

      setTimeout(() => {
        setTypingUsers((prev) =>
          prev.filter((u) => u.userName !== data.userName)
        );
      }, 3000);
    });

    socket.on("user-stop-typing", (data) => {
      setTypingUsers((prev) =>
        prev.filter((u) => u.userName !== data.userName)
      );
    });

    socket.on("warning", (data) => {
      setWarning(data.message);
      setTimeout(() => setWarning(""), 5000);
    });

    socket.on("error", (data) => {
      console.error("Chat error:", data.message);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, isAuthenticated]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current?.connected) return;

    socketRef.current.emit("send-message", {
      message: inputMessage.trim(),
    });

    setInputMessage("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socketRef.current.emit("typing-stop");
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (!socketRef.current?.connected) return;

    socketRef.current.emit("typing-start");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("typing-stop");
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
        <Navbar currentPage="community-chat" setCurrentPage={setCurrentPage} />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <MessageSquare className="text-blue-400 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-white mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-300 mb-6">
              Please login to access the community chat
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const chatContent = (
    <div className={`flex flex-col ${embedded ? "h-full" : "h-screen"}`}>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageSquare size={24} className="text-white" />
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                isConnected ? "bg-green-400" : "bg-red-400"
              }`}
            ></div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">
              OfficePulse Community
            </h3>
            <p className="text-blue-100 text-xs">
              {isConnected ? `${activeUsers.length} online` : "Reconnecting..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!embedded && (
            <>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-2 rounded transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 size={18} />
                ) : (
                  <Minimize2 size={18} />
                )}
              </button>
              <button
                onClick={onBack}
                className="text-white hover:bg-white/20 p-2 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="bg-blue-500/20 border-b border-blue-500/30 p-3 flex items-start gap-2">
            <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-blue-300 text-sm">
              This community chat is for discussions about OfficePulse,
              workplace management, business topics, and collaboration. Please
              keep conversations professional and relevant.
            </p>
          </div>

          {warning && (
            <div className="bg-yellow-500/20 border-b border-yellow-500/30 p-3 flex items-start gap-2">
              <AlertCircle
                size={16}
                className="text-yellow-400 mt-0.5 flex-shrink-0"
              />
              <p className="text-yellow-300 text-sm">{warning}</p>
            </div>
          )}

          <div
            className="flex-1 overflow-y-auto bg-gray-800 p-4"
            style={{ maxHeight: embedded ? "500px" : "calc(100vh - 250px)" }}
          >
            <div className="space-y-6">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-600"></div>
                    <span className="text-gray-400 text-xs font-medium px-2">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-gray-600"></div>
                  </div>

                  {dateMessages.map((message) => {
                    const isOwnMessage = user && message.userId === user.id;

                    return (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 mb-4 ${
                          isOwnMessage ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                          style={{ backgroundColor: message.userColor }}
                          title={message.userName}
                        >
                          {message.userAvatar}
                        </div>

                        <div
                          className={`max-w-md ${
                            isOwnMessage ? "text-right" : "text-left"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-sm font-medium ${
                                isOwnMessage ? "text-blue-300" : "text-gray-300"
                              }`}
                            >
                              {isOwnMessage ? "You" : message.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>

                          <div
                            className={`inline-block p-3 rounded-2xl text-sm leading-relaxed ${
                              isOwnMessage
                                ? "bg-blue-500 text-white"
                                : "bg-gray-700 text-gray-100"
                            }`}
                          >
                            <p className="break-words">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {typingUsers.length > 0 && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: typingUsers[0].userColor }}
                  >
                    {typingUsers[0].userAvatar}
                  </div>
                  <div className="bg-gray-700 text-gray-100 p-3 rounded-2xl">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 border-t border-gray-700 bg-gray-900">
            <div className="flex items-center gap-3">
              <textarea
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={
                  isConnected
                    ? "Share your thoughts about workplace collaboration..."
                    : "Connecting..."
                }
                disabled={!isConnected}
                className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                rows="2"
                maxLength="500"
                style={{ maxHeight: "80px" }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !isConnected}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white p-3 rounded-lg transition-colors disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">
                {inputMessage.length}/500 characters
              </p>
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <span className="text-xs text-gray-400">
                  {isConnected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (embedded) {
    return chatContent;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <Navbar currentPage="community-chat" setCurrentPage={setCurrentPage} />

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div
            className={`mb-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-300 hover:translate-x-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Home
              </button>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-4">
                Community Connect Hub
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Connect, collaborate, and share ideas with your workplace
                community
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-300">
                <MessageSquare size={20} />
                <span className="font-medium">
                  Real-time conversations • Professional networking • Knowledge
                  sharing
                </span>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div
                className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl"
                style={{ height: "calc(100vh - 160px)" }}
              >
                {chatContent}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={20} />
                  Active Users ({activeUsers.length})
                </h3>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activeUsers.map((activeUser, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: activeUser.color }}
                      >
                        {activeUser.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {activeUser.id === user?.id ? "You" : activeUser.name}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CommunityChat;
