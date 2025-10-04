import React, { useState, useEffect } from 'react';
import { Calendar, Users, BarChart3, Shield, Lock, BookOpen, MessageSquare, Video } from 'lucide-react';
import RealTimeDesk from './RealTimeDesk';
import Analytics from './Analytics';
import Security from './Security';
import StoredBookings from './StoredBookings';
import CommunityChat from './CommunityChat';
import VideoMeetup from './VideoMeetup';
import Chatbot from './Chatbot';
import Navbar from './Navbar';
import Footer from './Footer';
import About from './About';
import Login from './Login';
import Register from './Register';
import { useAppContext } from './AppContext';

const useFadeIn = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return isVisible;
};

// Hero Section
const HeroSection = () => {
  const isVisible = useFadeIn(200);
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/60 to-black/80"></div>
      </div>
      <div className={`relative z-10 text-center px-4 max-w-4xl mx-auto transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          The Intelligent
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent block">
            Hybrid Workplace
          </span>
          Orchestrator
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
          Streamline hybrid work with AI-driven insights, real-time desk booking, 
          intelligent space optimization, and community collaboration
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            Get Started
          </button>
          <button className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105">
            Watch Demo
          </button>
        </div>
      </div>
    </div>
  );
};

// Feature Card with Authentication Check
const FeatureCard = ({ icon: Icon, title, description, delay, onClick, isLocked }) => {
  const isVisible = useFadeIn(delay);
  
  return (
    <div 
      onClick={isLocked ? null : onClick}
      className={`bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 transition-all duration-500 group relative ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${
        isLocked 
          ? 'cursor-not-allowed opacity-60' 
          : 'hover:scale-125 hover:bg-white/20 cursor-pointer'
      }`}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="text-red-400 mx-auto mb-2" size={32} />
            <p className="text-red-300 text-sm font-medium">Login Required</p>
          </div>
        </div>
      )}
      
      <div className={`text-blue-400 mb-4 transition-colors duration-300 ${
        isLocked ? '' : 'group-hover:text-white'
      }`}>
        <Icon size={48} />
      </div>
      <h3 className={`text-xl font-bold text-white mb-3 transition-colors duration-300 ${
        isLocked ? '' : 'group-hover:text-blue-300'
      }`}>
        {title}
      </h3>
      <p className={`text-gray-300 transition-colors duration-300 ${
        isLocked ? '' : 'group-hover:text-white'
      }`}>
        {description}
      </p>
    </div>
  );
};

// Features Section with Authentication Logic
const FeaturesSection = ({ setCurrentPage }) => {
  const { isAuthenticated } = useAppContext();
  
  const features = [
    {
      icon: Calendar,
      title: "Real-Time Desk Booking",
      description: "Book desks and meeting rooms instantly with live availability updates and smart conflict resolution.",
      page: 'desk-booking'
    },
    {
      icon: BookOpen,
      title: "My Bookings",
      description: "View, manage and track all your desk bookings with real-time status updates and cancellation options.",
      page: 'stored-bookings'
    },
    {
      icon: Video,
      title: "Video Meetup",
      description: "Host and join secure video conferences with colleagues. Real-time collaboration with screen sharing.",
      page: 'video-meetup'
    },
    {
      icon: MessageSquare,
      title: "Community Chat",
      description: "Connect with colleagues, discuss workplace topics, share insights, and collaborate in real-time.",
      page: 'community-chat'
    },
    {
      icon: BarChart3,
      title: "AI-Powered Analytics",
      description: "Get intelligent insights on space utilization, employee patterns, and optimization recommendations.",
      page: 'analytics'
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with role-based access control and complete audit trails.",
      page: 'security'
    }
  ];

  const handleFeatureClick = (featurePage) => {
    if (isAuthenticated) {
      setCurrentPage(featurePage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="py-20 px-4 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose OfficePulse?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your workplace with cutting-edge technology designed for the modern hybrid office
          </p>
          {!isAuthenticated && (
            <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg max-w-2xl mx-auto">
              <p className="text-yellow-300 font-medium">
                Please login to access all features
              </p>
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 200}
              onClick={() => handleFeatureClick(feature.page)}
              isLocked={!isAuthenticated}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Home Page Component
const HomePage = ({ setCurrentPage }) => {
  return (
    <div className="pt-16">
      <HeroSection />
      <FeaturesSection setCurrentPage={setCurrentPage} />
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, redirectPage = 'login' }) => {
  const { isAuthenticated, setCurrentPage } = useAppContext();

  if (!isAuthenticated) {
    return (
      <>
        <Navbar currentPage={redirectPage} setCurrentPage={setCurrentPage} />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
          <div className="text-center">
            <Lock className="text-red-400 mx-auto mb-4" size={64} />
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-300 mb-6">Please login to access this feature</p>
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

  return children;
};

// App Renderer
const App = () => {
<<<<<<< HEAD
  const { currentPage, setCurrentPage, isAuthenticated, runAllCleanups } = useAppContext();

  // Cleanup when page changes
  useEffect(() => {
    // Run cleanup when navigating away from video-meetup
    return () => {
      if (currentPage === 'video-meetup') {
        console.log("App component cleanup - running video cleanups");
        runAllCleanups();
      }
    };
  }, [currentPage, runAllCleanups]);
=======
  const { currentPage, setCurrentPage, isAuthenticated } = useAppContext();
>>>>>>> 29dd9810b9516c35b5e1e01454f9da5e95185f83

  const renderPage = () => {
    switch (currentPage) {
      case 'home': 
        return (
          <>
            <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <HomePage setCurrentPage={setCurrentPage} />
            <Footer />
          </>
        );
      case 'about': 
        return <About currentPage={currentPage} setCurrentPage={setCurrentPage} />;
      case 'login': 
        return <Login currentPage={currentPage} setCurrentPage={setCurrentPage} />;
      case 'register': 
        return <Register currentPage={currentPage} setCurrentPage={setCurrentPage} />;
      case 'desk-booking': 
        return (
          <ProtectedRoute>
            <RealTimeDesk onBack={() => setCurrentPage('home')} />
          </ProtectedRoute>
        );
      case 'video-meetup':
        return (
          <ProtectedRoute>
            <VideoMeetup onBack={() => setCurrentPage('home')} />
          </ProtectedRoute>
        );
      case 'community-chat':
        return (
          <ProtectedRoute>
            <CommunityChat onBack={() => setCurrentPage('home')} />
          </ProtectedRoute>
        );
      case 'analytics': 
        return (
          <ProtectedRoute>
            <Analytics onBack={() => setCurrentPage('home')} />
          </ProtectedRoute>
        );
      case 'security': 
        return (
          <ProtectedRoute>
            <Security onBack={() => setCurrentPage('home')} />
          </ProtectedRoute>
        );
      case 'stored-bookings': 
        return (
          <ProtectedRoute>
            <StoredBookings onBack={() => setCurrentPage('home')} />
          </ProtectedRoute>
        );
      default: 
        return (
          <>
            <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <HomePage setCurrentPage={setCurrentPage} />
            <Footer />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {renderPage()}
      <Chatbot />
    </div>
  );
};

export default App;