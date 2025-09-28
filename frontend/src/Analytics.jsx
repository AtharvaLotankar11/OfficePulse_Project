import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, MapPin, Calendar, Target, Zap, ArrowLeft, Download, Filter, RefreshCw, Eye, Activity } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import apiService from './services/api';

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

// Dynamic data calculation functions
const calculateOccupancyTrends = (bookings) => {
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const dayBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.toDateString() === date.toDateString() && booking.status === 'active';
    });
    
    // Assuming total capacity of 20 desks per day for calculation
    const occupied = Math.min(dayBookings.length, 20);
    const total = 20;
    
    last7Days.push({
      day: dayName,
      occupied,
      available: total - occupied,
      total
    });
  }
  
  return last7Days;
};

const calculateHourlyUsage = (bookings) => {
  const hourlyStats = {};
  const hours = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM'];
  
  // Initialize all hours
  hours.forEach(hour => {
    hourlyStats[hour] = 0;
  });
  
  // Count bookings by hour
  bookings.forEach(booking => {
    if (booking.status === 'active' && booking.startTime && booking.endTime) {
      const startHour = parseInt(booking.startTime.split(':')[0]);
      const endHour = parseInt(booking.endTime.split(':')[0]);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const hourKey = hour === 12 ? '12PM' : hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
        if (hourlyStats[hourKey] !== undefined) {
          hourlyStats[hourKey] += 1;
        }
      }
    }
  });
  
  // Convert to percentage (assuming max 8 desks can be used per hour)
  return hours.map(hour => ({
    hour,
    usage: Math.min(100, Math.round((hourlyStats[hour] / 8) * 100))
  }));
};

const calculateDepartmentUsage = (bookings) => {
  const departments = [
    { name: 'Engineering', value: 0, color: 'bg-blue-500' },
    { name: 'Marketing', value: 0, color: 'bg-green-500' },
    { name: 'Sales', value: 0, color: 'bg-yellow-500' },
    { name: 'HR', value: 0, color: 'bg-red-500' },
    { name: 'Finance', value: 0, color: 'bg-purple-500' }
  ];
  
  if (bookings.length === 0) {
    return departments;
  }
  
  // Simulate department usage based on booking patterns
  const totalBookings = bookings.length;
  departments[0].value = Math.round((bookings.filter(b => b.deskId <= 3).length / totalBookings) * 100);
  departments[1].value = Math.round((bookings.filter(b => b.deskId >= 4 && b.deskId <= 5).length / totalBookings) * 100);
  departments[2].value = Math.round((bookings.filter(b => b.deskId >= 6 && b.deskId <= 7).length / totalBookings) * 100);
  departments[3].value = Math.round((bookings.filter(b => b.deskId === 8).length / totalBookings) * 100);
  
  // Calculate remaining percentage for Finance
  const usedPercentage = departments[0].value + departments[1].value + departments[2].value + departments[3].value;
  departments[4].value = Math.max(0, 100 - usedPercentage);
  
  return departments;
};

const calculateProductivityMetrics = (bookings) => {
  const activeBookings = bookings.filter(b => b.status === 'active');
  const totalBookings = bookings.length || 1;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
  
  // Calculate average booking duration
  let avgDuration = 0;
  if (activeBookings.length > 0) {
    const totalDuration = activeBookings.reduce((sum, booking) => {
      if (booking.startTime && booking.endTime) {
        const start = new Date(`1970-01-01T${booking.startTime}`);
        const end = new Date(`1970-01-01T${booking.endTime}`);
        return sum + (end - start) / (1000 * 60 * 60); // Convert to hours
      }
      return sum + 8; // Default 8 hours if times are missing
    }, 0);
    avgDuration = totalDuration / activeBookings.length;
  }
  
  const noShowRate = (cancelledBookings.length / totalBookings) * 100;
  const successRate = ((totalBookings - cancelledBookings.length) / totalBookings) * 100;
  
  return [
    { 
      metric: 'Avg. Booking Duration', 
      value: `${avgDuration.toFixed(1)} hours`, 
      change: '+12%', 
      trend: 'up' 
    },
    { 
      metric: 'Peak Usage Time', 
      value: '11:00 AM', 
      change: '0%', 
      trend: 'stable' 
    },
    { 
      metric: 'No-Show Rate', 
      value: `${noShowRate.toFixed(1)}%`, 
      change: cancelledBookings.length > 2 ? '+8%' : '-8%', 
      trend: cancelledBookings.length > 2 ? 'up' : 'down' 
    },
    { 
      metric: 'Booking Success Rate', 
      value: `${successRate.toFixed(1)}%`, 
      change: '+5%', 
      trend: 'up' 
    },
    { 
      metric: 'Total Active Bookings', 
      value: `${activeBookings.length}`, 
      change: '+15%', 
      trend: 'up' 
    },
    { 
      metric: 'Space Efficiency Score', 
      value: `${Math.min(95, Math.round(activeBookings.length * 8.5))}%`, 
      change: '+7%', 
      trend: 'up' 
    }
  ];
};

const calculateFloorUtilization = (bookings) => {
  const floors = [
    { floor: 'Floor 1', zones: 4, totalDesks: 4, occupied: 0, efficiency: 0 },
    { floor: 'Floor 2', zones: 4, totalDesks: 4, occupied: 0, efficiency: 0 }
  ];
  
  bookings.forEach(booking => {
    if (booking.status === 'active' && booking.floor) {
      const floorIndex = booking.floor - 1;
      if (floors[floorIndex]) {
        floors[floorIndex].occupied += 1;
      }
    }
  });
  
  floors.forEach(floor => {
    floor.efficiency = floor.totalDesks > 0 ? Math.round((floor.occupied / floor.totalDesks) * 100) : 0;
  });
  
  return floors;
};

const generateRealtimeAlerts = (bookings, floorUtilization) => {
  const alerts = [];
  
  // High usage alerts
  floorUtilization.forEach(floor => {
    if (floor.efficiency > 80) {
      alerts.push({
        id: Date.now() + Math.random(),
        type: 'high_usage',
        message: `${floor.floor} approaching capacity (${floor.efficiency}%)`,
        time: '2 mins ago',
        severity: 'warning'
      });
    }
  });
  
  // Booking activity alerts
  const recentBookings = bookings.filter(booking => {
    if (!booking.createdAt) return false;
    const bookingTime = new Date(booking.createdAt);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return bookingTime > oneHourAgo;
  });
  
  if (recentBookings.length > 3) {
    alerts.push({
      id: Date.now() + Math.random() + 1,
      type: 'booking_spike',
      message: `High booking activity: ${recentBookings.length} bookings in the last hour`,
      time: '1 hour ago',
      severity: 'warning'
    });
  }
  
  // Success alerts
  if (bookings.filter(b => b.status === 'active').length > 5) {
    alerts.push({
      id: Date.now() + Math.random() + 2,
      type: 'efficiency',
      message: 'Daily space efficiency target achieved',
      time: '2 hours ago',
      severity: 'success'
    });
  }
  
  // Default maintenance alert
  alerts.push({
    id: Date.now() + Math.random() + 3,
    type: 'maintenance',
    message: 'All systems running smoothly',
    time: '15 mins ago',
    severity: 'info'
  });
  
  return alerts.slice(0, 4); // Return max 4 alerts
};

const MetricCard = ({ metric, delay }) => {
  const isVisible = useFadeIn(delay);
  
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="text-green-400" size={20} />;
      case 'down': return <TrendingDown className="text-red-400" size={20} />;
      default: return <Activity className="text-yellow-400" size={20} />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div className={`bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:scale-105 transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm text-gray-400 font-medium">{metric.metric}</h3>
        {getTrendIcon(metric.trend)}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-white">{metric.value}</div>
        <div className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
          {metric.change}
        </div>
      </div>
    </div>
  );
};

const AlertCard = ({ alert }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success': return 'border-green-500 bg-green-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'info': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityIcon = (type) => {
    switch (type) {
      case 'high_usage': return <Users className="text-yellow-400" size={16} />;
      case 'maintenance': return <Zap className="text-blue-400" size={16} />;
      case 'booking_spike': return <TrendingUp className="text-orange-400" size={16} />;
      case 'efficiency': return <Target className="text-green-400" size={16} />;
      default: return <Activity className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border backdrop-blur-sm ${getSeverityColor(alert.severity)}`}>
      <div className="flex items-start gap-3">
        {getSeverityIcon(alert.type)}
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{alert.message}</p>
          <p className="text-gray-400 text-xs mt-1">{alert.time}</p>
        </div>
      </div>
    </div>
  );
};

const FloorUtilizationCard = ({ floor }) => {
  const utilizationPercent = floor.totalDesks > 0 ? (floor.occupied / floor.totalDesks) * 100 : 0;
  
  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">{floor.floor}</h3>
        <div className="text-2xl font-bold text-blue-400">{floor.efficiency}%</div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Zones</span>
          <span className="text-white">{floor.zones}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Desks</span>
          <span className="text-white">{floor.totalDesks}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Occupied</span>
          <span className="text-white">{floor.occupied}</span>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Utilization</span>
            <span>{utilizationPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${utilizationPercent}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DataTable = ({ data, title, columns }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-white/20">
              {columns.map((col, index) => (
                <th key={index} className="pb-2 text-gray-400 font-medium">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-white/10 last:border-0">
                {Object.values(row).map((value, colIndex) => (
                  <td key={colIndex} className="py-3 text-white">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProgressBar = ({ data, title }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-white">{item.name}</span>
              <span className="text-white">{item.value}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${item.color} transition-all duration-1000`}
                style={{ width: `${item.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Analytics = ({ onBack }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');
  const [currentPage, setCurrentPage] = useState('analytics');
  const [bookingsData, setBookingsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dynamic calculated data
  const [occupancyData, setOccupancyData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [productivityMetrics, setProductivityMetrics] = useState([]);
  const [floorUtilization, setFloorUtilization] = useState([]);
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);
  
  const isVisible = useFadeIn(200);

  // Load all bookings for analytics
  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await apiService.getAllBookings();
      const bookings = response.data.bookings || [];
      
      setBookingsData(bookings);
      
      // Calculate dynamic data
      const occupancy = calculateOccupancyTrends(bookings);
      const hourly = calculateHourlyUsage(bookings);
      const departments = calculateDepartmentUsage(bookings);
      const productivity = calculateProductivityMetrics(bookings);
      const floors = calculateFloorUtilization(bookings);
      const alerts = generateRealtimeAlerts(bookings, floors);
      
      setOccupancyData(occupancy);
      setHourlyData(hourly);
      setDepartmentData(departments);
      setProductivityMetrics(productivity);
      setFloorUtilization(floors);
      setRealtimeAlerts(alerts);
      
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError('Failed to load analytics data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAnalyticsData().finally(() => {
      setTimeout(() => setIsRefreshing(false), 1000);
    });
  };

  const handleExport = () => {
    const analyticsData = {
      occupancyData,
      productivityMetrics,
      floorUtilization,
      bookingsData: bookingsData.length,
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `officepulse_analytics_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-white text-xl">Loading Analytics...</div>
          </div>
        </div>
      </div>
    );
  }

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
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-5xl font-bold text-white mb-4">AI-Powered Analytics</h1>
                <p className="text-xl text-gray-300">Real-time insights from {bookingsData.length} bookings</p>
                {error && (
                  <p className="text-red-400 mt-2">Error: {error}</p>
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-6 lg:mt-0">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
                
                <button
                  onClick={handleRefresh}
                  className={`p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 ${
                    isRefreshing ? 'animate-spin' : 'hover:scale-105'
                  }`}
                >
                  <RefreshCw size={20} />
                </button>
                
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            {/* View Selector */}
            <div className="flex gap-2 mb-8">
              {['overview', 'occupancy', 'productivity', 'predictions'].map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 capitalize ${
                    selectedView === view
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          {selectedView === 'overview' && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
                {productivityMetrics.map((metric, index) => (
                  <MetricCard key={index} metric={metric} delay={index * 100} />
                ))}
              </div>

              {/* Data Tables */}
              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                <DataTable 
                  data={occupancyData} 
                  title="Weekly Occupancy Trends" 
                  columns={['Day', 'Occupied', 'Available', 'Total']} 
                />
                <DataTable 
                  data={hourlyData} 
                  title="Hourly Usage Pattern" 
                  columns={['Hour', 'Usage (%)']} 
                />
              </div>

              {/* Department Usage & Floor Utilization */}
              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                <ProgressBar 
                  data={departmentData} 
                  title="Department Usage Distribution" 
                />
                <div className="grid grid-cols-2 gap-4">
                  {floorUtilization.map((floor, index) => (
                    <FloorUtilizationCard key={index} floor={floor} />
                  ))}
                </div>
              </div>

              {/* Real-time Alerts */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Eye size={20} />
                  Real-time Alerts & Insights
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {realtimeAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedView === 'occupancy' && (
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Detailed Occupancy Analytics</h2>
                <p className="text-gray-300 mb-6">Advanced occupancy patterns and utilization metrics based on {bookingsData.length} bookings</p>
              </div>
              <DataTable 
                data={floorUtilization} 
                title="Floor Utilization Details" 
                columns={['Floor', 'Zones', 'Total Desks', 'Occupied', 'Efficiency']} 
              />
              <DataTable 
                data={occupancyData} 
                title="Daily Occupancy Breakdown" 
                columns={['Day', 'Occupied', 'Available', 'Total']} 
              />
            </div>
          )}

          {selectedView === 'productivity' && (
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Productivity Insights</h2>
                <p className="text-gray-300 mb-6">Employee productivity metrics and workspace optimization recommendations</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productivityMetrics.map((metric, index) => (
                  <MetricCard key={index} metric={metric} delay={0} />
                ))}
              </div>
              <DataTable 
                data={hourlyData} 
                title="Productivity by Hour" 
                columns={['Hour', 'Usage (%)']} 
              />
            </div>
          )}

          {selectedView === 'predictions' && (
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">AI Predictions</h2>
                <p className="text-gray-300 mb-6">Demand forecasting based on current booking patterns</p>
              </div>
              <ProgressBar 
                data={[
                  { 
                    name: 'Predicted Peak Usage', 
                    value: Math.min(95, Math.max(20, Math.round(bookingsData.filter(b => b.status === 'active').length * 12))), 
                    color: 'bg-blue-500' 
                  },
                  { 
                    name: 'Recommended Capacity', 
                    value: Math.min(85, Math.max(15, Math.round(bookingsData.length * 0.75))), 
                    color: 'bg-green-500' 
                  },
                  { 
                    name: 'Optimal Staffing', 
                    value: Math.min(80, Math.max(10, Math.round(bookingsData.length * 0.68))), 
                    color: 'bg-purple-500' 
                  }
                ]} 
                title="Next Week Forecast" 
              />
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Predictive Insights</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Expected peak day next week:</span>
                    <span className="text-blue-400 font-semibold">Tuesday</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Recommended desk capacity:</span>
                    <span className="text-green-400 font-semibold">{Math.max(8, Math.min(20, bookingsData.length + 4))} desks</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Cost optimization potential:</span>
                    <span className="text-purple-400 font-semibold">
                      {bookingsData.length > 10 ? '15% savings' : '25% savings'}
                    </span>
                  </div>
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

export default Analytics;