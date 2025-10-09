import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, User, ArrowLeft, CheckCircle, XCircle, AlertCircle, Trash2, Eye, Building, Star, RefreshCw } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import apiService from './services/api';
import { useAppContext } from './AppContext';

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

const BookingCard = ({ booking, onCancel, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'border-green-500 bg-green-500/10';
      case 'completed': return 'border-gray-500 bg-gray-500/10';
      case 'cancelled': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="text-green-400" size={20} />;
      case 'completed': return <CheckCircle className="text-gray-400" size={20} />;
      case 'cancelled': return <XCircle className="text-red-400" size={20} />;
      default: return <AlertCircle className="text-gray-400" size={20} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString, startTime) => {
    const bookingDateTime = new Date(`${dateString.split('T')[0]}T${startTime}`);
    return bookingDateTime > new Date();
  };

  const canCancel = booking.status === 'active' && isUpcoming(booking.date, booking.startTime);

  return (
    <div className={`p-6 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl ${getStatusColor(booking.status)}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{booking.deskName}</h3>
          <p className="text-gray-300 text-sm flex items-center gap-1">
            <Building size={14} />
            Floor {booking.floor} - {booking.zone}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(booking.status)}
          <span className="text-sm font-medium text-white capitalize">{booking.status}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-300">
          <Calendar size={16} />
          <span className="text-sm">{formatDate(booking.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Clock size={16} />
          <span className="text-sm">{booking.startTime} - {booking.endTime}</span>
        </div>
        {booking.purpose && (
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle size={16} />
            <span className="text-sm">{booking.purpose}</span>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500 mb-4">
        <p>Booked: {new Date(booking.createdAt).toLocaleString()}</p>
        {booking.updatedAt !== booking.createdAt && (
          <p>Updated: {new Date(booking.updatedAt).toLocaleString()}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(booking)}
          className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-300 flex items-center justify-center gap-1"
        >
          <Eye size={16} />
          Details
        </button>
        {canCancel && (
          <button
            onClick={() => onCancel(booking)}
            className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center gap-1"
          >
            <Trash2 size={16} />
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { key: '', label: 'All', count: 0 },
    { key: 'active', label: 'Active', count: 0 },
    { key: 'completed', label: 'Completed', count: 0 },
    { key: 'cancelled', label: 'Cancelled', count: 0 }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            activeFilter === filter.key
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-blue-500/20">
        <h2 className="text-2xl font-bold text-white mb-6">Booking Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Desk</label>
            <p className="text-white font-medium">{booking.deskName}</p>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Location</label>
            <p className="text-white">Floor {booking.floor} - {booking.zone}</p>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Date</label>
            <p className="text-white">{formatDate(booking.date)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Start Time</label>
              <p className="text-white">{booking.startTime}</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">End Time</label>
              <p className="text-white">{booking.endTime}</p>
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Status</label>
            <p className={`capitalize font-medium ${
              booking.status === 'active' ? 'text-green-400' :
              booking.status === 'completed' ? 'text-gray-400' :
              'text-red-400'
            }`}>
              {booking.status}
            </p>
          </div>
          
          {booking.purpose && (
            <div>
              <label className="block text-gray-400 text-sm mb-1">Purpose</label>
              <p className="text-white">{booking.purpose}</p>
            </div>
          )}
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Booking ID</label>
            <p className="text-gray-400 text-sm font-mono">{booking._id}</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const CancelConfirmModal = ({ booking, isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-red-500/20">
        <h2 className="text-2xl font-bold text-white mb-6">Cancel Booking</h2>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Are you sure you want to cancel this booking?
          </p>
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
            <h4 className="text-red-400 font-medium mb-2">{booking.deskName}</h4>
            <p className="text-red-300 text-sm">
              {new Date(booking.date).toLocaleDateString()} • {booking.startTime} - {booking.endTime}
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            disabled={isLoading}
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Cancelling...
              </>
            ) : (
              'Cancel Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const StoredBookings = ({ onBack }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  
  const isVisible = useFadeIn(200);
  const { user, isAuthenticated, setCurrentPage } = useAppContext();

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const loadBookings = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.getUserBookings();
      setBookings(response.data.bookings || []);
      setFilteredBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      showMessage('Failed to load bookings: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadBookings();
  }, [user, isAuthenticated, loadBookings]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (activeFilter) {
      setFilteredBookings(bookings.filter(booking => booking.status === activeFilter));
    } else {
      setFilteredBookings(bookings);
    }
  }, [activeFilter, bookings]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return;

    try {
      setIsCancelling(true);
      await apiService.cancelBooking(selectedBooking._id);
      
      // Update the booking status in local state
      setBookings(prev => prev.map(booking => 
        booking._id === selectedBooking._id 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));
      
      showMessage('Booking cancelled successfully', 'success');
      setIsCancelModalOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Cancel booking error:', error);
      showMessage('Failed to cancel booking: ' + error.message, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      active: bookings.filter(b => b.status === 'active').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
    return stats;
  };

  const stats = getBookingStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <Navbar currentPage="stored-bookings" setCurrentPage={setCurrentPage} />
      
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
              <h1 className="text-5xl font-bold text-white mb-4">My Bookings</h1>
              <p className="text-xl text-gray-300 mb-6">View and manage all your desk bookings</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={loadBookings}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  disabled={isLoading}
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
                <div className="text-blue-300">Total</div>
              </div>
              <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-400">{stats.active}</div>
                <div className="text-green-300">Active</div>
              </div>
              <div className="bg-gray-500/20 border border-gray-500/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-gray-400">{stats.completed}</div>
                <div className="text-gray-300">Completed</div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-red-400">{stats.cancelled}</div>
                <div className="text-red-300">Cancelled</div>
              </div>
            </div>

            {/* Filter Tabs */}
            <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* Main Content */}
          <div className="mb-4">
            <p className="text-gray-300">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-gray-300 text-xl">Loading your bookings...</div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="text-gray-400 mx-auto mb-4" size={64} />
              <div className="text-gray-400 text-xl mb-4">
                {bookings.length === 0 ? 'No bookings found' : 'No bookings match your filter'}
              </div>
              <p className="text-gray-500 mb-6">
                {bookings.length === 0 
                  ? 'Book your first desk to see it here'
                  : 'Try selecting a different filter'
                }
              </p>
              {bookings.length === 0 && (
                <button
                  onClick={() => onBack()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Book a Desk
                </button>
              )}
            </div>
          )}

          {/* Bookings Grid */}
          {!isLoading && filteredBookings.length > 0 && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBookings.map((booking, index) => (
                <div
                  key={booking._id}
                  className={`transition-all duration-1000 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <BookingCard
                    booking={booking}
                    onCancel={handleCancelClick}
                    onViewDetails={handleViewDetails}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedBooking(null);
          }}
        />

        {/* Cancel Confirmation Modal */}
        <CancelConfirmModal
          booking={selectedBooking}
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setSelectedBooking(null);
          }}
          onConfirm={handleCancelConfirm}
          isLoading={isCancelling}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default StoredBookings;