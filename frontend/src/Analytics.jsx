import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, MapPin, Calendar, Target, Zap, ArrowLeft, Download, Filter, RefreshCw, Eye, Activity } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// Mock data for analytics
const occupancyData = [
  { day: 'Mon', occupied: 85, available: 15, total: 100 },
  { day: 'Tue', occupied: 92, available: 8, total: 100 },
  { day: 'Wed', occupied: 78, available: 22, total: 100 },
  { day: 'Thu', occupied: 88, available: 12, total: 100 },
  { day: 'Fri', occupied: 95, available: 5, total: 100 },
  { day: 'Sat', occupied: 45, available: 55, total: 100 },
  { day: 'Sun', occupied: 30, available: 70, total: 100 }
];

const hourlyData = [
  { hour: '8AM', usage: 25 },
  { hour: '9AM', usage: 65 },
  { hour: '10AM', usage: 85 },
  { hour: '11AM', usage: 90 },
  { hour: '12PM', usage: 70 },
  { hour: '1PM', usage: 60 },
  { hour: '2PM', usage: 85 },
  { hour: '3PM', usage: 88 },
  { hour: '4PM', usage: 82 },
  { hour: '5PM', usage: 45 },
  { hour: '6PM', usage: 25 },
  { hour: '7PM', usage: 15 }
];

const departmentData = [
  { name: 'Engineering', value: 35, color: 'bg-blue-500' },
  { name: 'Marketing', value: 25, color: 'bg-green-500' },
  { name: 'Sales', value: 20, color: 'bg-yellow-500' },
  { name: 'HR', value: 12, color: 'bg-red-500' },
  { name: 'Finance', value: 8, color: 'bg-purple-500' }
];

const productivityMetrics = [
  { metric: 'Avg. Booking Duration', value: '6.5 hours', change: '+12%', trend: 'up' },
  { metric: 'Peak Usage Time', value: '11:00 AM', change: '0%', trend: 'stable' },
  { metric: 'No-Show Rate', value: '3.2%', change: '-8%', trend: 'down' },
  { metric: 'Booking Success Rate', value: '94.7%', change: '+5%', trend: 'up' },
  { metric: 'Avg. Daily Occupancy', value: '78%', change: '+15%', trend: 'up' },
  { metric: 'Space Efficiency Score', value: '87.3', change: '+7%', trend: 'up' }
];

const floorUtilization = [
  { floor: 'Floor 1', zones: 4, totalDesks: 40, occupied: 32, efficiency: 80 },
  { floor: 'Floor 2', zones: 4, totalDesks: 38, occupied: 28, efficiency: 74 },
  { floor: 'Floor 3', zones: 3, totalDesks: 30, occupied: 25, efficiency: 83 },
  { floor: 'Floor 4', zones: 2, totalDesks: 20, occupied: 16, efficiency: 80 }
];

const realtimeAlerts = [
  { id: 1, type: 'high_usage', message: 'Floor 2 East Wing approaching capacity', time: '2 mins ago', severity: 'warning' },
  { id: 2, type: 'maintenance', message: 'Desk A4 requires cleaning attention', time: '15 mins ago', severity: 'info' },
  { id: 3, type: 'booking_spike', message: 'Unusual booking activity detected in South Wing', time: '1 hour ago', severity: 'warning' },
  { id: 4, type: 'efficiency', message: 'Daily space efficiency target achieved', time: '2 hours ago', severity: 'success' }
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
  const utilizationPercent = (floor.occupied / floor.totalDesks) * 100;
  
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
                className={`h-2 rounded-full ${item.color}`}
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
  const isVisible = useFadeIn(200);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const handleExport = () => {
    alert('Exporting analytics data...');
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
                <p className="text-xl text-gray-300">Real-time insights and intelligent workspace optimization</p>
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
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Detailed Occupancy Analytics</h2>
              <p className="text-gray-300">Advanced occupancy patterns and utilization metrics</p>
              <div className="mt-6">
                <DataTable 
                  data={floorUtilization} 
                  title="Floor Utilization Details" 
                  columns={['Floor', 'Zones', 'Total Desks', 'Occupied', 'Efficiency']} 
                />
              </div>
            </div>
          )}

          {selectedView === 'productivity' && (
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Productivity Insights</h2>
              <p className="text-gray-300">Employee productivity metrics and workspace optimization recommendations</p>
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                {productivityMetrics.map((metric, index) => (
                  <MetricCard key={index} metric={metric} delay={0} />
                ))}
              </div>
            </div>
          )}

          {selectedView === 'predictions' && (
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">AI Predictions</h2>
              <p className="text-gray-300">Demand forecasting and capacity planning insights</p>
              <div className="mt-6">
                <ProgressBar 
                  data={[
                    { name: 'Predicted Peak Usage', value: 85, color: 'bg-blue-500' },
                    { name: 'Recommended Capacity', value: 75, color: 'bg-green-500' },
                    { name: 'Optimal Staffing', value: 68, color: 'bg-purple-500' }
                  ]} 
                  title="Next Week Forecast" 
                />
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