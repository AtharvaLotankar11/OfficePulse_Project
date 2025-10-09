import React, { useState } from 'react';
import { Home, Info, LogIn, LogOut, Menu, X, User, MessageSquare } from 'lucide-react';
import { useAppContext } from './AppContext';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAppContext();
  
  const handleLogout = () => {
    logout();
    setCurrentPage('home');
    setIsMenuOpen(false);
  };

  const navItems = isAuthenticated ? [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: Info },
  ] : [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: Info },
    { id: 'login', label: 'Login', icon: LogIn },
  ];

  return (
    <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md z-50 border-b border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1
              className="text-2xl font-bold text-white hover:text-blue-400 hover:scale-110 transform transition-all duration-300 cursor-pointer"
              onClick={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onMouseEnter={(e) => { e.target.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))'; }}
              onMouseLeave={(e) => { e.target.style.filter = 'none'; }}
            >
              🚀 OfficePulse
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-baseline space-x-4">
              {/* eslint-disable-next-line no-unused-vars */}
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setCurrentPage(id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                    currentPage === id ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
            
            {/* User Info and Logout for Desktop */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-600">
                <div className="flex items-center gap-2 text-gray-300">
                  <div 
                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm"
                    title={user.email}
                  >
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[150px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-md"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* eslint-disable-next-line no-unused-vars */}
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setCurrentPage(id);
                  setIsMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-2 ${
                  currentPage === id ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
            
            {/* User Info and Logout for Mobile */}
            {isAuthenticated && user && (
              <>
                <div className="px-3 py-2 border-t border-gray-600 mt-2">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <div 
                      className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm"
                    >
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;