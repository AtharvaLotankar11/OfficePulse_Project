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

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Don't initialize camera automatically - only when user requests it

  // Cleanup on component unmount
  useEffect(() => {
    // Register cleanup function with global context
    const cleanup = () => {
      console.log("Global cleanup triggered for VideoMeetup");
      cleanupMediaStream();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };

    registerCleanup(cleanup);

    return () => {
      console.log(
        "VideoMeetup component unmounting - cleaning up media streams"
      );
      unregisterCleanup(cleanup);
      cleanup();
    };
  }, [registerCleanup, unregisterCleanup]);

  // Additional cleanup when component is about to unmount or page changes
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      console.log("Page unloading - cleaning up media streams");
      cleanupMediaStream();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Page hidden - cleaning up media streams");
        cleanupMediaStream();
      }
    };

    const handlePageHide = () => {
      console.log("Page hide event - cleaning up media streams");
      cleanupMediaStream();
    };

    // Multiple event listeners to catch all navigation scenarios
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Ensure video element gets stream when available
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log("Local stream attached to video element");
    }
  }, [localStream, currentView]);

  const cleanupMediaStream = () => {
    console.log("🧹 Starting media stream cleanup...");

    // Stop local stream tracks
    if (localStream) {
      console.log("Stopping local media tracks...");
      localStream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          track.stop();
          console.log(
            `✅ Stopped ${track.kind} track - readyState: ${track.readyState}`
          );
        }
      });
      setLocalStream(null);
      console.log("Local stream cleared");
    } else {
      console.log("No local stream to clean up");
    }

    // Clean up video element and force it to release the stream
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
      localVideoRef.current.load(); // Force reload to release resources
      console.log("Video element cleared and reloaded");
    }

    // Clean up remote streams
    const remoteStreamCount = Object.keys(remoteStreams).length;
    if (remoteStreamCount > 0) {
      console.log(`Cleaning up ${remoteStreamCount} remote streams...`);
      Object.values(remoteStreams).forEach((stream) => {
        if (stream) {
          stream.getTracks().forEach((track) => {
            if (track.readyState === "live") {
              track.stop();
              console.log(`Stopped remote ${track.kind} track`);
            }
          });
        }
      });
      setRemoteStreams({});
    }

    // Clean up peer connections
    const peerConnectionCount = Object.keys(peerConnectionsRef.current).length;
    if (peerConnectionCount > 0) {
      console.log(`Closing ${peerConnectionCount} peer connections...`);
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        if (pc.connectionState !== "closed") {
          pc.close();
        }
      });
      peerConnectionsRef.current = {};
    }

    // Force garbage collection hint (not guaranteed but helps)
    if (window.gc) {
      window.gc();
    }

    console.log("✅ Media cleanup completed - camera light should be OFF now");
  };

  const initializeMediaDevices = async () => {
    try {
      // Clean up existing stream first
      cleanupMediaStream();

      console.log("Requesting camera and microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setLocalStream(stream);
      console.log("✅ Camera and microphone access granted!");
      console.log("Media stream created:", stream);
      console.log("Video tracks:", stream.getVideoTracks().length);
      console.log("Audio tracks:", stream.getAudioTracks().length);

      // Attach stream to video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        console.log("Stream attached to video element");
      } else {
        console.log("Video element not available yet - will attach when ready");
      }

      // Update track states
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) {
        setIsVideoEnabled(videoTrack.enabled);
        console.log("Video track enabled:", videoTrack.enabled);
      }
      if (audioTrack) {
        setIsAudioEnabled(audioTrack.enabled);
        console.log("Audio track enabled:", audioTrack.enabled);
      }

      // Clear any error messages
      setMessage({ text: "", type: "" });
    } catch (error) {
      console.error("❌ Error accessing media devices:", error);
      setMessage({
        text: "Could not access camera/microphone. Please check permissions and try again.",
        type: "error",
      });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);

        // Update all peer connections with the new track state
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender && sender.track) {
            sender.track.enabled = videoTrack.enabled;
          }
        });
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);

        // Update all peer connections with the new track state
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track && s.track.kind === "audio");
          if (sender && sender.track) {
            sender.track.enabled = audioTrack.enabled;
          }
        });
      }
    }
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
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
        text: "Camera access required to create a room",
        type: "error",
      });
      return;
    }

    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    joinMeeting(newRoomId, true);
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
        text: "Camera access required to join a room",
        type: "error",
      });
      return;
    }

    joinMeeting(roomId, false);
  };

  const createPeerConnection = (userId) => {
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => ({
        ...prev,
        [userId]: remoteStream,
      }));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", {
          targetUserId: userId,
          candidate: event.candidate,
        });
      }
    };

    return peerConnection;
  };

  const joinMeeting = (meetingRoomId, isHost) => {
    setConnectionStatus("connecting");

    // Ensure we have media stream before joining
    if (!localStream) {
      setMessage({
        text: "Please wait for camera to initialize...",
        type: "error",
      });
      return;
    }

    // Initialize socket connection
    socketRef.current = io("http://localhost:5000/video", {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      setConnectionStatus("connected");
      console.log("Connected to video server");
    });

    socketRef.current.on("disconnect", () => {
      setConnectionStatus("disconnected");
      console.log("Disconnected from video server");
    });

    socketRef.current.on("error", (error) => {
      console.error("Socket error:", error);
      setMessage({
        text: "Connection error. Please try again.",
        type: "error",
      });
    });

    socketRef.current.emit("join-room", {
      roomId: meetingRoomId,
      userId: user.id,
      userName: user.fullName || `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      isHost,
    });

    socketRef.current.on("user-connected", async (data) => {
      setParticipants((prev) => [...prev, data]);

      // Create peer connection for new user
      const peerConnection = createPeerConnection(data.userId);
      peerConnectionsRef.current[data.userId] = peerConnection;

      // Create and send offer
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socketRef.current.emit("offer", {
          targetUserId: data.userId,
          offer: offer,
        });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    });

    socketRef.current.on("user-disconnected", (data) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));

      // Clean up peer connection and remote stream
      if (peerConnectionsRef.current[data.userId]) {
        peerConnectionsRef.current[data.userId].close();
        delete peerConnectionsRef.current[data.userId];
      }

      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[data.userId];
        return newStreams;
      });
    });

    socketRef.current.on("room-participants", (data) => {
      setParticipants(data.participants);
    });

    // Handle WebRTC signaling
    socketRef.current.on("offer", async (data) => {
      const peerConnection = createPeerConnection(data.fromUserId);
      peerConnectionsRef.current[data.fromUserId] = peerConnection;

      try {
        await peerConnection.setRemoteDescription(data.offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socketRef.current.emit("answer", {
          targetUserId: data.fromUserId,
          answer: answer,
        });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    });

    socketRef.current.on("answer", async (data) => {
      const peerConnection = peerConnectionsRef.current[data.fromUserId];
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(data.answer);
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      }
    });

    socketRef.current.on("ice-candidate", async (data) => {
      const peerConnection = peerConnectionsRef.current[data.fromUserId];
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(data.candidate);
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    setCurrentView("meeting");
    setMessage({ text: "", type: "" });

    // Ensure video element gets the stream when switching to meeting view
    setTimeout(() => {
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
        console.log("Video stream attached to meeting view");
      }
    }, 100);
  };

  const leaveMeeting = () => {
    console.log("Leaving meeting - cleaning up meeting resources");

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.emit("leave-room");
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Clean up peer connections
    Object.values(peerConnectionsRef.current).forEach((pc) => {
      if (pc.connectionState !== "closed") {
        pc.close();
      }
    });
    peerConnectionsRef.current = {};

    // Clean up remote streams
    Object.values(remoteStreams).forEach((stream) => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          if (track.readyState === "live") {
            track.stop();
            console.log(`Stopped remote ${track.kind} track`);
          }
        });
      }
    });
    setRemoteStreams({});

    // Clean up local stream as well when leaving meeting
    cleanupMediaStream();

    // Reset meeting states
    setCurrentView("lobby");
    setRoomId("");
    setRoomName("");
    setParticipants([]);
    setConnectionStatus("disconnected");

    console.log("Meeting left - camera turned off");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
        <Navbar currentPage="video-meetup" setCurrentPage={setCurrentPage} />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Video className="text-blue-400 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-white mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-300 mb-6">
              Please login to access video meetings
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <Navbar currentPage="video-meetup" setCurrentPage={setCurrentPage} />

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div
            className={`mb-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => {
                  console.log(
                    "Back to Home clicked - cleaning up camera and leaving Video Meetup"
                  );
                  // Clean up everything when leaving Video Meetup
                  cleanupMediaStream();
                  if (socketRef.current) {
                    socketRef.current.emit("leave-room");
                    socketRef.current.disconnect();
                    socketRef.current = null;
                  }
                  onBack();
                }}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Home
              </button>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-4">
                Video Meetup
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Secure video conferencing for your team
              </p>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`p-4 rounded-lg mb-6 flex items-center gap-2 max-w-2xl mx-auto ${
                message.type === "success"
                  ? "bg-green-500/20 border border-green-500/50 text-green-300"
                  : message.type === "info"
                  ? "bg-blue-500/20 border border-blue-500/50 text-blue-300"
                  : "bg-red-500/20 border border-red-500/50 text-red-300"
              }`}
            >
              <span>{message.text}</span>
            </div>
          )}

          {/* Lobby View */}
          {currentView === "lobby" && (
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Video Preview */}
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Preview
                  </h3>

                  <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video mb-4">
                    {localStream && isVideoEnabled ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        controls={false}
                        className="w-full h-full object-cover mirror"
                        style={{ transform: "scaleX(-1)" }}
                        onLoadedMetadata={() =>
                          console.log("Video metadata loaded")
                        }
                        onCanPlay={() => console.log("Video can play")}
                        onError={(e) => console.error("Video error:", e)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          {!localStream ? (
                            <>
                              <Video
                                className="text-gray-400 mx-auto mb-2"
                                size={48}
                              />
                              <p className="text-gray-400 mb-4">
                                Camera Preview
                              </p>
                              <button
                                onClick={initializeMediaDevices}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                Start Camera
                              </button>
                            </>
                          ) : (
                            <>
                              <VideoOff
                                className="text-gray-400 mx-auto mb-2"
                                size={48}
                              />
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
                              ? "bg-gray-700 hover:bg-gray-600"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {isVideoEnabled ? (
                            <Video className="text-white" size={20} />
                          ) : (
                            <VideoOff className="text-white" size={20} />
                          )}
                        </button>

                        <button
                          onClick={toggleAudio}
                          className={`p-3 rounded-full transition-colors ${
                            isAudioEnabled
                              ? "bg-gray-700 hover:bg-gray-600"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {isAudioEnabled ? (
                            <Mic className="text-white" size={20} />
                          ) : (
                            <MicOff className="text-white" size={20} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm text-center">
                    {localStream
                      ? "Adjust your camera and microphone before joining"
                      : "Click 'Start Camera' to preview your video before joining a meeting"}
                  </p>
                </div>

                {/* Join Options */}
                <div className="space-y-6">
                  {/* Create Room */}
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Create Meeting
                    </h3>

                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter meeting name"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    />

                    <button
                      onClick={createRoom}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Video size={20} />
                      Create Meeting Room
                    </button>
                  </div>

                  {/* Join Room */}
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Join Meeting
                    </h3>

                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      placeholder="Enter Room ID"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    />

                    <button
                      onClick={joinRoom}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <UserPlus size={20} />
                      Join Meeting
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meeting View */}
          {currentView === "meeting" && (
            <div>
              {/* Meeting Header */}
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-white font-semibold">
                      Room: {roomName || roomId}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users size={16} />
                      <span className="text-sm">
                        {participants.length + 1} participant(s)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          connectionStatus === "connected"
                            ? "bg-green-500"
                            : connectionStatus === "connecting"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-300 capitalize">
                        {connectionStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyRoomId}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? "Copied!" : "Copy Room ID"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Local Video */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
                  {isVideoEnabled ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      controls={false}
                      className="w-full h-full object-cover"
                      style={{ transform: "scaleX(-1)" }}
                      onLoadedMetadata={() =>
                        console.log("Meeting video metadata loaded")
                      }
                      onCanPlay={() => console.log("Meeting video can play")}
                      onError={(e) => console.error("Meeting video error:", e)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-white text-xl font-bold">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white font-medium">You</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded">
                    <span className="text-white text-sm">You</span>
                  </div>
                </div>

                {/* Remote Participants */}
                {participants.map((participant, index) => {
                  const remoteStream = remoteStreams[participant.userId];
                  return (
                    <div
                      key={participant.userId || index}
                      className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video"
                    >
                      {remoteStream ? (
                        <video
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                          ref={(videoElement) => {
                            if (videoElement && remoteStream) {
                              videoElement.srcObject = remoteStream;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                              <span className="text-white text-xl font-bold">
                                {participant.userEmail.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <p className="text-white font-medium">
                              {participant.userName}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded">
                        <span className="text-white text-sm">
                          {participant.userName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-colors ${
                      isVideoEnabled
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    title={
                      isVideoEnabled ? "Turn off camera" : "Turn on camera"
                    }
                  >
                    {isVideoEnabled ? (
                      <Video className="text-white" size={24} />
                    ) : (
                      <VideoOff className="text-white" size={24} />
                    )}
                  </button>

                  <button
                    onClick={toggleAudio}
                    className={`p-4 rounded-full transition-colors ${
                      isAudioEnabled
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    title={
                      isAudioEnabled ? "Mute microphone" : "Unmute microphone"
                    }
                  >
                    {isAudioEnabled ? (
                      <Mic className="text-white" size={24} />
                    ) : (
                      <MicOff className="text-white" size={24} />
                    )}
                  </button>

                  <button
                    onClick={leaveMeeting}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                    title="Leave meeting"
                  >
                    <Phone
                      className="text-white transform rotate-135"
                      size={24}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VideoMeetup;
