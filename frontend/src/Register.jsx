import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, RefreshCw, Loader2, CheckCircle, XCircle } from 'lucide-react';
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

const Register = ({ currentPage, setCurrentPage }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [captchaText, setCaptchaText] = useState(
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  
  const { register, isLoading } = useAppContext();
  const isVisible = useFadeIn(200);

  const validateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }

    return calculatedAge >= 18;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !dob) {
      setMessage({ text: 'Please fill in all required fields', type: 'error' });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ text: "Passwords don't match!", type: 'error' });
      return;
    }

    if (!validateAge(dob)) {
      setMessage({ text: 'You must be at least 18 years old to register', type: 'error' });
      return;
    }
    
    if (captcha !== captchaText) {
      setMessage({ text: 'Invalid CAPTCHA! Please try again.', type: 'error' });
      refreshCaptcha();
      return;
    }

    if (!termsAccepted) {
      setMessage({ text: 'Please accept the Terms of Service and Privacy Policy', type: 'error' });
      return;
    }

    try {
      const result = await register({
        firstName,
        lastName,
        email,
        password,
        dateOfBirth: dob
      });
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        // Navigate to login after successful registration
        setTimeout(() => {
          setCurrentPage('login');
        }, 2000);
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred during registration', type: 'error' });
    }
  };

  const refreshCaptcha = () => {
    setCaptchaText(Math.random().toString(36).substring(2, 8).toUpperCase());
    setCaptcha('');
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
      
      <div className="pt-16 min-h-screen flex items-center justify-center px-4 py-8">
        <div className={`bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 w-full max-w-md transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-300">
              Join OfficePulse today
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="First name"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  placeholder="Last name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address *
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

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <label className="block text-white text-sm font-medium mb-2">
                Password *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Create password (min 6 characters)"
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

            <div className="relative">
              <label className="block text-white text-sm font-medium mb-2">
                Confirm Password *
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Confirm password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
              <div className="flex-1">
                <div className="text-white font-mono text-lg tracking-widest bg-gray-800/50 p-2 rounded text-center">
                  {captchaText}
                </div>
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="text-blue-400 hover:text-blue-300 ml-2"
                disabled={isLoading}
              >
                <RefreshCw size={18} />
              </button>
              <div className="ml-4 flex-1">
                <input
                  type="text"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter CAPTCHA"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                I agree to the <a href="#" className="text-blue-400">Terms of Service</a> and <a href="#" className="text-blue-400">Privacy Policy</a> *
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => setCurrentPage('login')}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;