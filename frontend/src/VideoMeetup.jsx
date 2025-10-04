import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Users,
  Copy,
  Check,
  UserPlus,
  ArrowLeft,
} from "lucide-react";
import { useAppContext } from "./AppContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { io } from "socket.io-client";

const VideoMeetup = ({ onBack }) => {
  const [currentView, setCurrentView] = useState("lobby"); // 'lobby', 'meeting'
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [localStream, setLocalStream] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const {
    user,
    isAuthenticated,
    setCurrentPage,
    registerCleanup,
    unregisterCleanup,
  } = useAppContext();
  
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef({});

  // Fade in effect
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const cleanupMediaStream = () => {
    console.log("🧹 Starting media stream cleanup...");
    
    if (localStream) {
      console.log("Stopping local stream tracks...");
      localStream.getTracks().forEach((track) => {
        console.log(`Stopping ${track.kind} track:`, track.label);
        track.stop();
      });
      setLocalStream(null);
    }

    if (localVideoRef.current) {
      console.log("Clearing video element srcObject...");
      localVideoRef.current.srcObject = null;
    }

    Object.values(peerConnectionsRef.current).forEach((pc) => {
      console.log("Closing peer connection...");
      pc.close();
    });
    peerConnectionsRef.current = {};

    setRemoteStreams({});
    console.log("✅ Media cleanup completed - camera light should be OFF now");
  };

  const initializeMediaDevices = async () => {
    try {
      cleanupMediaStream();
      console.log("Requesting camera and microphone access...");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      setLocalStream(stream);
      console.log("✅ Camera and microphone access granted!");
      console.log("Media stream created:", stream);
      console.log("Video tracks:", stream.getVideoTracks().length);
      console.log("Audio tracks:", stream.getAudioTracks().length);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log("Stream attached to video element");
      } else {
        console.log("Video element not available yet - will attach when ready");
      }

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack) {
        setIsVideoEnabled(videoTrack.enabled);
        console.log("Video track enabled:", videoTrack.enabled);
      }
      if (audioTrack) {
        setIsAudioEnabled(audioTrack.enabled);
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setMessage({
        text: "Could not access camera/microphone. Please check permissions and try again.",
        type: "error",
      });
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      setMessage({ text: "Please enter a room name", type: "error" });
      return;
    }

    // Initialize camera when creating room
    setMessage({ text: "Initializing camera...", type: "info" });
    await initializeMediaDevices();
    
    // Wait a bit for stream to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!localStream) {
      setMessage({
        text: "Camera initialization failed. Please try again.",
        type: "error",
      });
      return;
    }

    const newRoomId = Math.random().toString(36).substring(2, 15);
    setRoomId(newRoomId);
    setCurrentView("meeting");
    setMessage({ text: "Room created successfully!", type: "success" });
  };

  const joinRoom = async () => {
    if (!roomId.trim()) {
      setMessage({ text: "Please enter a room ID", type: "error" });
      return;
    }

    // Initialize camera when joining room
    setMessage({ text: "Initializing camera...", type: "info" });
    await initializeMediaDevices();
    
    // Wait a bit for stream to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!localStream) {
      setMessage({
        text: "Camera initialization failed. Please try again.",
        type: "error",
      });
      return;
    }

    setCurrentView("meeting");
    setMessage({ text: "Joined room successfully!", type: "success" });
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveMeeting = () => {
    console.log("Leaving meeting - cleaning up meeting resources");

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Clean up peer connections
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      pc.close();
    });
    peerConnectionsRef.current = {};

    // Clean up media streams
    cleanupMediaStream();

    // Reset meeting states
    setCurrentView("lobby");
    setRoomId("");
    setRoomName("");
    setParticipants([]);
    setConnectionStatus("disconnected");

    console.log("Meeting left - camera turned off");
  };

  // Cleanup on component unmount
  useEffect(() => {
    const cleanup = () => {
      console.log("VideoMeetup component unmounting - cleaning up...");
      cleanupMediaStream();
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };

    registerCleanup(cleanup);

    return () => {
      unregisterCleanup(cleanup);
      cleanup();
    };
  }, [registerCleanup, unregisterCleanup]);

  if (!isAuthenticated) {
    return (
      <>
        <Navbar currentPage="video-meetup" setCurrentPage={setCurrentPage} />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
            <p className="text-gray-300 mb-6">You need to be logged in to access video meetup</p>
            <button
              onClick={() => setCurrentPage('login')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar currentPage="video-meetup" setCurrentPage={setCurrentPage} />
      <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 pt-20 transition-all duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          {currentView === "lobby" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ArrowLeft size={20} />
                    Back to Home
                  </button>
                </div>

                <div className="text-center mb-8">
                  <Video className="text-blue-400 mx-auto mb-4" size={64} />
                  <h1 className="text-3xl font-bold text-white mb-2">Video Meetup</h1>
                  <p className="text-gray-300">Connect with your team through secure video calls</p>
                </div>

                {message.text && (
                  <div className={`p-4 rounded-lg mb-6 ${
                    message.type === 'error' ? 'bg-red-500/20 border border-red-500/50 text-red-300' :
                    message.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-300' :
                    'bg-blue-500/20 border border-blue-500/50 text-blue-300'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video mb-4">
                    {localStream && isVideoEnabled ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          {!localStream ? (
                            <>
                              <Video className="text-gray-400 mx-auto mb-2" size={48} />
                              <p className="text-gray-400">Camera not initialized</p>
                              <button
                                onClick={initializeMediaDevices}
                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                Start Camera
                              </button>
                            </>
                          ) : (
                            <>
                              <VideoOff className="text-gray-400 mx-auto mb-2" size={48} />
                              <p className="text-gray-400">Camera is off</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {localStream && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        <button
                          onClick={toggleVideo}
                          className={`p-3 rounded-full transition-colors ${
                            isVideoEnabled
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                        </button>
                        <button
                          onClick={toggleAudio}
                          className={`p-3 rounded-full transition-colors ${
                            isAudioEnabled
                              ? 'bg-gray-700 hover:bg-gray-600 text-white'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-center text-gray-400 text-sm">
                    {localStream 
                      ? "Your camera preview is ready. You can now create or join a meeting."
                      : "Click 'Start Camera' to preview your video before joining a meeting"}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Create Meeting</h3>
                      <input
                        type="text"
                        placeholder="Enter room name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={createRoom}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <UserPlus size={20} />
                        Create Room
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Join Meeting</h3>
                      <input
                        type="text"
                        placeholder="Enter room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={joinRoom}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Video size={20} />
                        Join Room
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === "meeting" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-white">Meeting Room</h1>
                  <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">Connected</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Room ID:</span>
                  <code className="bg-gray-800 px-2 py-1 rounded text-blue-300">{roomId}</code>
                  <button
                    onClick={copyRoomId}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-300" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-gray-800 rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Users size={20} />
                      Participants ({participants.length + 1})
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-white">{user?.name || 'You'} (You)</span>
                      </div>
                      {participants.map((participant, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-800 rounded-lg">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {participant.name?.charAt(0) || 'P'}
                          </div>
                          <span className="text-white">{participant.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    isVideoEnabled
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
                <button
                  onClick={toggleAudio}
                  className={`p-4 rounded-full transition-colors ${
                    isAudioEnabled
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                </button>
                <button
                  onClick={leaveMeeting}
                  className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                  <Phone size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VideoMeetup;