import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Filter, Search, CheckCircle, XCircle, AlertCircle, Wifi, Monitor, Coffee, Zap, Phone, ArrowLeft, Star, User, Building } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import apiService from './services/api';
import { useAppContext } from './AppContext';

// Mock data for desks
const mockDesks = [
  { id: 1, name: 'Desk A1', floor: 1, zone: 'North Wing', status: 'available', features: ['monitor', 'wifi', 'power'], rating: 4.8, lastCleaned: '2 hours ago', nextBooking: null },
  { id: 2, name: 'Desk A2', floor: 1, zone: 'North Wing', status: 'occupied', features: ['monitor', 'wifi', 'power', 'phone'], rating: 4.9, lastCleaned: '1 hour ago', currentUser: 'John Doe', untilTime: '3:30 PM' },
  { id: 3, name: 'Desk B1', floor: 1, zone: 'South Wing', status: 'available', features: ['wifi', 'power'], rating: 4.5, lastCleaned: '30 minutes ago', nextBooking: '2:00 PM' },
  { id: 4, name: 'Desk B2', floor: 1, zone: 'South Wing', status: 'maintenance', features: ['monitor', 'wifi', 'power', 'coffee'], rating: 4.7, lastCleaned: '4 hours ago', issue: 'Monitor repair in progress' },
  { id: 5, name: 'Desk C1', floor: 2, zone: 'East Wing', status: 'available', features: ['monitor', 'wifi', 'power', 'phone', 'coffee'], rating: 5.0, lastCleaned: '15 minutes ago', nextBooking: null },
  { id: 6, name: 'Desk C2', floor: 2, zone: 'East Wing', status: 'available', features: ['wifi', 'power'], rating: 4.3, lastCleaned: '1 hour ago', nextBooking: '4:00 PM' },
  { id: 7, name: 'Desk D1', floor: 2, zone: 'West Wing', status: 'occupied', features: ['monitor', 'wifi', 'power', 'coffee'], rating: 4.6, lastCleaned: '45 minutes ago', currentUser: 'Sarah Johnson', untilTime: '5:00 PM' },
  { id: 8, name: 'Desk D2', floor: 2, zone: 'West Wing', status: 'available', features: ['monitor', 'wifi', 'power', 'phone'], rating: 4.8, lastCleaned: '20 minutes ago', nextBooking: null }
];

const useFadeIn = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return isVisible;
};

const DeskCard = ({ desk, onBook, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'border-green-500 bg-green-500/10';
      case 'occupied': return 'border-red-500 bg-red-500/10';
      case 'maintenance': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <CheckCircle className="text-green-400" size={20} />;
      case 'occupied': return <XCircle className="text-red-400" size={20} />;
      case 'maintenance': return <AlertCircle className="text-yellow-400" size={20} />;
      default: return null;
    }
  };

  const getFeatureIcon = (feature) => {
    switch (feature) {
      case 'monitor': return <Monitor size={16} />;
      case 'wifi': return <Wifi size={16} />;
      case 'power': return <Zap size={16} />;
      case 'phone': return <Phone size={16} />;
      case 'coffee': return <Coffee size={16} />;
      default: return null;
    }
  };

  return (
    <div className={`p-6 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl ${getStatusColor(desk.status)}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{desk.name}</h3>
          <p className="text-gray-300 text-sm flex items-center gap-1">
            <Building size={14} />
            Floor {desk.floor} - {desk.zone}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(desk.status)}
          <span className="text-sm font-medium text-white capitalize">{desk.status}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-3">
        <Star className="text-yellow-400 fill-current" size={16} />
        <span className="text-white font-medium">{desk.rating}</span>
        <span className="text-gray-400 text-sm">rating</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {desk.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-1 bg-blue-500/20 px-2 py-1 rounded-md">
            {getFeatureIcon(feature)}
            <span className="text-blue-300 text-xs capitalize">{feature}</span>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-400 mb-4">
        <p>🧼 Cleaned: {desk.lastCleaned}</p>
        {desk.status === 'occupied' && (
          <p className="text-red-300">👤 {desk.currentUser} until {desk.untilTime}</p>
        )}
        {desk.nextBooking && (
          <p className="text-yellow-300">📅 Next booking: {desk.nextBooking}</p>
        )}
        {desk.issue && (
          <p className="text-yellow-300">⚠️ {desk.issue}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(desk)}
          className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-300"
        >
          View Details
        </button>
        {desk.status === 'available' && (
          <button
            onClick={() => onBook(desk)}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
};

const BookingModal = ({ desk, isOpen, onClose, onConfirm, isLoading }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [purpose, setPurpose] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  if (!isOpen || !desk) return null;

  const handleConfirm = async () => {
    // Validation
    if (!selectedDate || !startTime || !endTime) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    if (startTime >= endTime) {
      showMessage('End time must be after start time', 'error');
      return;
    }

    const bookingData = {
      deskId: desk.id,
      deskName: desk.name,
      floor: desk.floor,
      zone: desk.zone,
      date: selectedDate,
      startTime,
      endTime,
      purpose: purpose.trim()
    };
    
    try {
      await onConfirm(bookingData);
    } catch (error) {
      showMessage('Failed to create booking. Please try again.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-blue-500/20">
        <h2 className="text-2xl font-bold text-white mb-6">Book {desk.name}</h2>
        
        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg border flex items-center gap-2 ${
            messageType === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-300' 
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span className="text-sm">{message}</span>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().split('T')[0]}
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">Purpose (Optional)</label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Meeting, focused work, collaboration..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterPanel = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Filter size={20} />
        Filters
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">Floor</label>
          <select
            value={filters.floor}
            onChange={(e) => onFilterChange({ ...filters, floor: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
          </select>
        </div>
        
        <div>
          <label className="block text-white text-sm font-medium mb-2">Zone</label>
          <select
            value={filters.zone}
            onChange={(e) => onFilterChange({ ...filters, zone: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Zones</option>
            <option value="North Wing">North Wing</option>
            <option value="South Wing">South Wing</option>
            <option value="East Wing">East Wing</option>
            <option value="West Wing">West Wing</option>
          </select>
        </div>
        
        <div>
          <label className="block text-white text-sm font-medium mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        
        <div>
          <label className="block text-white text-sm font-medium mb-2">Features</label>
          <div className="space-y-2">
            {['monitor', 'wifi', 'power', 'phone', 'coffee'].map((feature) => (
              <label key={feature} className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={filters.features.includes(feature)}
                  onChange={(e) => {
                    const updatedFeatures = e.target.checked
                      ? [...filters.features, feature]
                      : filters.features.filter(f => f !== feature);
                    onFilterChange({ ...filters, features: updatedFeatures });
                  }}
                  className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                />
                <span className="capitalize">{feature}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingHistory = ({ bookings, isLoading }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'completed': return 'text-gray-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Calendar size={20} />
        Booking History
      </h3>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="text-gray-300">Loading bookings...</div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-gray-400">No bookings found</div>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking._id || booking.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium">{booking.deskName}</h4>
                  <p className="text-gray-300 text-sm">{new Date(booking.date).toLocaleDateString()}</p>
                  <p className="text-gray-400 text-sm">{booking.startTime} - {booking.endTime}</p>
                  {booking.purpose && (
                    <p className="text-gray-500 text-xs mt-1">{booking.purpose}</p>
                  )}
                </div>
                <span className={`text-sm font-medium capitalize ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RealTimeDesk = ({ onBack }) => {
  const [desks, setDesks] = useState(mockDesks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [filters, setFilters] = useState({
    floor: '',
    zone: '',
    status: '',
    features: []
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState('desk-booking');
  
  const isVisible = useFadeIn(200);
  
  // Get user from context
  const { user, isAuthenticated } = useAppContext();

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load user bookings
  useEffect(() => {
    const loadUserBookings = async () => {
      if (!user || !isAuthenticated) {
        setIsBookingsLoading(false);
        return;
      }
      
      try {
        const response = await apiService.getUserBookings();
        setUserBookings(response.data.bookings || []);
      } catch (error) {
        console.error('Failed to load bookings:', error);
        showMessage('Failed to load booking history', 'error');
      } finally {
        setIsBookingsLoading(false);
      }
    };

    loadUserBookings();
  }, [user, isAuthenticated]);

  const filteredDesks = desks.filter(desk => {
    const matchesSearch = desk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         desk.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFloor = !filters.floor || desk.floor.toString() === filters.floor;
    const matchesZone = !filters.zone || desk.zone === filters.zone;
    const matchesStatus = !filters.status || desk.status === filters.status;
    const matchesFeatures = filters.features.length === 0 || 
                           filters.features.every(feature => desk.features.includes(feature));
    
    return matchesSearch && matchesFloor && matchesZone && matchesStatus && matchesFeatures;
  });

  const handleBookDesk = (desk) => {
    if (!isAuthenticated) {
      showMessage('Please login to book a desk', 'error');
      return;
    }
    setSelectedDesk(desk);
    setIsBookingModalOpen(true);
  };

  const handleViewDetails = (desk) => {
    const details = `Detailed view for ${desk.name}\n\nFeatures: ${desk.features.join(', ')}\nRating: ${desk.rating}/5\nLast cleaned: ${desk.lastCleaned}`;
    alert(details);
  };

  const handleConfirmBooking = async (bookingData) => {
    if (!isAuthenticated || !user) {
      showMessage('Please login to create a booking', 'error');
      return;
    }

    setIsBookingLoading(true);
    
    try {
      const response = await apiService.createBooking(bookingData);
      
      // Update desk status optimistically
      setDesks(prev => prev.map(desk => 
        desk.id === selectedDesk.id 
          ? { 
              ...desk, 
              status: 'occupied', 
              currentUser: `${user.firstName} ${user.lastName}`, 
              untilTime: bookingData.endTime 
            }
          : desk
      ));
      
      // Add to user bookings
      setUserBookings(prev => [response.data.booking, ...prev]);
      
      showMessage(`Booking confirmed for ${bookingData.deskName} on ${new Date(bookingData.date).toLocaleDateString()} from ${bookingData.startTime} to ${bookingData.endTime}`, 'success');
      
      setIsBookingModalOpen(false);
      setSelectedDesk(null);
    } catch (error) {
      console.error('Booking error:', error);
      showMessage('Failed to create booking: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setIsBookingLoading(false);
    }
  };

  const availableDesks = desks.filter(d => d.status === 'available').length;
  const occupiedDesks = desks.filter(d => d.status === 'occupied').length;
  const maintenanceDesks = desks.filter(d => d.status === 'maintenance').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className={`mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
              <h1 className="text-5xl font-bold text-white mb-4">Real-Time Desk Booking</h1>
              <p className="text-xl text-gray-300 mb-6">Find and book your perfect workspace instantly</p>
              <div className="text-blue-300 font-mono text-lg">
                Current Time: {currentTime.toLocaleTimeString()}
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg border flex items-center gap-2 max-w-md mx-auto ${
                messageType === 'success' 
                  ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                  : 'bg-red-500/20 border-red-500/30 text-red-300'
              }`}>
                {messageType === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span className="text-sm">{message}</span>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-400">{availableDesks}</div>
                <div className="text-green-300">Available</div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-red-400">{occupiedDesks}</div>
                <div className="text-red-300">Occupied</div>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-yellow-400">{maintenanceDesks}</div>
                <div className="text-yellow-300">Maintenance</div>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-400">{desks.length}</div>
                <div className="text-blue-300">Total Desks</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search desks by name or zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <FilterPanel filters={filters} onFilterChange={setFilters} />
              <div className="mt-6">
                <BookingHistory bookings={userBookings} isLoading={isBookingsLoading} />
              </div>
            </div>

            {/* Desk Grid */}
            <div className="lg:col-span-3">
              <div className="mb-4">
                <p className="text-gray-300">
                  Showing {filteredDesks.length} of {desks.length} desks
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDesks.map((desk, index) => (
                  <div
                    key={desk.id}
                    className={`transition-all duration-1000 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <DeskCard
                      desk={desk}
                      onBook={handleBookDesk}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
              </div>

              {filteredDesks.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-xl mb-4">No desks found</div>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        <BookingModal
          desk={selectedDesk}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedDesk(null);
          }}
          onConfirm={handleConfirmBooking}
          isLoading={isBookingLoading}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default RealTimeDesk;