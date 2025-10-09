import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAppContext } from './AppContext';

const useFadeIn = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return isVisible;
};

const Login = ({ currentPage, setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const { login, isLoading } = useAppContext();
  const isVisible = useFadeIn(200);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // Validation
    if (!email || !password) {
      setMessage({ text: 'Please fill in all fields', type: 'error' });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        // Navigate to home after successful login
        setTimeout(() => {
          setCurrentPage('home');
        }, 1500);
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ text: 'An unexpected error occurred', type: 'error' });
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="pt-16 min-h-screen flex items-center justify-center px-4">
        <div className={`bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 w-full max-w-md transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-300">
              Sign in to your account
            </p>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
                : 'bg-red-500/20 border border-red-500/50 text-red-300'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentPage('register')}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                disabled={isLoading}
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;