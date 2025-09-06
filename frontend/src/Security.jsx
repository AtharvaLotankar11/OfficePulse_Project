import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, Users, AlertTriangle, CheckCircle, XCircle, Key, Fingerprint, Smartphone, Wifi, Camera, ArrowLeft, Download, RefreshCw, Clock, MapPin, User, Activity, Database, Globe, Server } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

// Mock security data
const securityMetrics = [
  { metric: 'Active Sessions', value: '247', change: '+8%', trend: 'up', status: 'normal' },
  { metric: 'Failed Login Attempts', value: '12', change: '-15%', trend: 'down', status: 'good' },
  { metric: 'Security Score', value: '96.8%', change: '+2%', trend: 'up', status: 'excellent' },
  { metric: 'Compliance Level', value: '100%', change: '0%', trend: 'stable', status: 'excellent' },
  { metric: 'Active Threats', value: '0', change: '0%', trend: 'stable', status: 'excellent' },
  { metric: 'Data Integrity', value: '99.9%', change: '0%', trend: 'stable', status: 'excellent' }
];

const recentSecurityEvents = [
  { id: 1, type: 'login_success', user: 'john.doe@company.com', action: 'Successful login', location: 'New York Office', time: '2 mins ago', severity: 'info' },
  { id: 2, type: 'access_denied', user: 'unknown@external.com', action: 'Access denied - Invalid credentials', location: 'External IP', time: '15 mins ago', severity: 'warning' },
  { id: 3, type: 'permission_granted', user: 'admin@company.com', action: 'Admin access granted to Floor 3', location: 'London Office', time: '1 hour ago', severity: 'info' },
  { id: 4, type: 'security_scan', user: 'system', action: 'Automated security scan completed', location: 'All Locations', time: '2 hours ago', severity: 'success' },
  { id: 5, type: 'data_backup', user: 'system', action: 'Daily backup completed successfully', location: 'Cloud Storage', time: '3 hours ago', severity: 'success' }
];

const accessControlRules = [
  { id: 1, name: 'Executive Floor Access', description: 'Restricts access to executive floors to C-level employees only', status: 'active', users: 12 },
  { id: 2, name: 'After Hours Security', description: 'Enhanced security protocols for after-hours access', status: 'active', users: 45 },
  { id: 3, name: 'Visitor Management', description: 'Temporary access rules for visitors and contractors', status: 'active', users: 8 },
  { id: 4, name: 'Emergency Override', description: 'Emergency access protocols for critical situations', status: 'standby', users: 5 },
  { id: 5, name: 'Maintenance Access', description: 'Scheduled access for maintenance and cleaning staff', status: 'active', users: 23 }
];

const complianceFrameworks = [
  { name: 'SOC 2 Type II', status: 'compliant', lastAudit: '2024-06-15', nextAudit: '2025-06-15', score: 100 },
  { name: 'ISO 27001', status: 'compliant', lastAudit: '2024-03-20', nextAudit: '2025-03-20', score: 98 },
  { name: 'GDPR', status: 'compliant', lastAudit: '2024-01-10', nextAudit: '2024-07-10', score: 100 },
  { name: 'HIPAA', status: 'compliant', lastAudit: '2024-04-05', nextAudit: '2024-10-05', score: 97 },
  { name: 'PCI DSS', status: 'compliant', lastAudit: '2024-02-28', nextAudit: '2024-08-28', score: 99 }
];

const securityFeatures = [
  {
    icon: Lock,
    title: 'Multi-Factor Authentication',
    description: 'Advanced MFA with biometric support, TOTP, and hardware tokens for secure access control.',
    status: 'active',
    coverage: '100%'
  },
  {
    icon: Eye,
    title: 'Real-time Monitoring',
    description: 'Continuous monitoring of all access points with AI-powered anomaly detection.',
    status: 'active',
    coverage: '24/7'
  },
  {
    icon: Database,
    title: 'End-to-End Encryption',
    description: 'AES-256 encryption for data at rest and in transit with automatic key rotation.',
    status: 'active',
    coverage: '100%'
  },
  {
    icon: Shield,
    title: 'Advanced Threat Detection',
    description: 'ML-powered threat detection with behavioral analysis and real-time alerts.',
    status: 'active',
    coverage: '99.9%'
  },
  {
    icon: Users,
    title: 'Role-Based Access Control',
    description: 'Granular permissions system with dynamic role assignment and inheritance.',
    status: 'active',
    coverage: '100%'
  },
  {
    icon: Activity,
    title: 'Audit Trail & Compliance',
    description: 'Comprehensive logging with tamper-proof audit trails and compliance reporting.',
    status: 'active',
    coverage: '100%'
  }
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

const SecurityMetricCard = ({ metric, delay }) => {
  const isVisible = useFadeIn(delay);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'border-green-500 bg-green-500/10';
      case 'good': return 'border-blue-500 bg-blue-500/10';
      case 'normal': return 'border-yellow-500 bg-yellow-500/10';
      case 'warning': return 'border-orange-500 bg-orange-500/10';
      case 'critical': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
      case 'good': return <CheckCircle className="text-green-400" size={20} />;
      case 'normal': return <AlertTriangle className="text-yellow-400" size={20} />;
      case 'warning': return <AlertTriangle className="text-orange-400" size={20} />;
      case 'critical': return <XCircle className="text-red-400" size={20} />;
      default: return <Activity className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className={`p-6 rounded-xl border backdrop-blur-sm hover:scale-105 transition-all duration-500 ${getStatusColor(metric.status)} ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm text-gray-400 font-medium">{metric.metric}</h3>
        {getStatusIcon(metric.status)}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-white">{metric.value}</div>
        <div className="text-sm font-medium text-blue-400">{metric.change}</div>
      </div>
    </div>
  );
};

const SecurityEventCard = ({ event }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success': return 'border-green-500 bg-green-500/10';
      case 'info': return 'border-blue-500 bg-blue-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'error': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'login_success': return <CheckCircle className="text-green-400" size={16} />;
      case 'access_denied': return <XCircle className="text-red-400" size={16} />;
      case 'permission_granted': return <Key className="text-blue-400" size={16} />;
      case 'security_scan': return <Shield className="text-purple-400" size={16} />;
      case 'data_backup': return <Database className="text-green-400" size={16} />;
      default: return <Activity className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border backdrop-blur-sm ${getSeverityColor(event.severity)}`}>
      <div className="flex items-start gap-3">
        {getEventIcon(event.type)}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <p className="text-white text-sm font-medium">{event.action}</p>
            <span className="text-xs text-gray-400">{event.time}</span>
          </div>
          <p className="text-gray-400 text-xs">{event.user}</p>
          <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
            <MapPin size={10} />
            {event.location}
          </p>
        </div>
      </div>
    </div>
  );
};

const AccessControlCard = ({ rule }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      case 'standby': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${rule.status === 'active' ? 'bg-green-400' : rule.status === 'standby' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
          <span className={`text-sm font-medium capitalize ${getStatusColor(rule.status)}`}>
            {rule.status}
          </span>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm mb-4">{rule.description}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-400">
          <Users size={16} />
          <span className="text-sm">{rule.users} users</span>
        </div>
        <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          Configure →
        </button>
      </div>
    </div>
  );
};

const ComplianceCard = ({ framework }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'border-green-500 bg-green-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'non-compliant': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 95) return 'text-green-400';
    if (score >= 85) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`p-6 rounded-xl border backdrop-blur-sm ${getStatusColor(framework.status)}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white">{framework.name}</h3>
        <div className={`text-2xl font-bold ${getScoreColor(framework.score)}`}>
          {framework.score}%
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Last Audit:</span>
          <span className="text-white">{new Date(framework.lastAudit).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Next Audit:</span>
          <span className="text-white">{new Date(framework.nextAudit).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              framework.score >= 95 ? 'bg-green-400' : 
              framework.score >= 85 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${framework.score}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const SecurityFeatureCard = ({ feature, delay }) => {
  const isVisible = useFadeIn(delay);
  const Icon = feature.icon;

  return (
    <div className={`bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:scale-105 hover:bg-white/15 transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    }`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-blue-500/20 rounded-lg">
          <Icon className="text-blue-400" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-green-400 text-sm font-medium">{feature.status}</span>
            <span className="text-gray-400 text-sm">• {feature.coverage}</span>
          </div>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
    </div>
  );
};

const Security = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState('security');
  const isVisible = useFadeIn(200);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const handleExport = () => {
    alert('Exporting security report...');
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
                <h1 className="text-5xl font-bold text-white mb-4">Enterprise Security</h1>
                <p className="text-xl text-gray-300">Advanced security monitoring and compliance management</p>
              </div>
              
              <div className="flex items-center gap-4 mt-6 lg:mt-0">
                <button
                  onClick={handleRefresh}
                  className={`p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 ${
                    isRefreshing ? 'animate-spin' : 'hover:scale-105'
                  }`}
                >
                  <RefreshCw size={20} />
                </button>
                
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <Download size={16} />
                  Security Report
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8">
              {['overview', 'access-control', 'compliance', 'monitoring'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-3 rounded-lg transition-all duration-300 capitalize ${
                    selectedTab === tab
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {selectedTab === 'overview' && (
            <>
              {/* Security Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
                {securityMetrics.map((metric, index) => (
                  <SecurityMetricCard key={index} metric={metric} delay={index * 100} />
                ))}
              </div>

              {/* Security Features */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-8">Security Features</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {securityFeatures.map((feature, index) => (
                    <SecurityFeatureCard key={index} feature={feature} delay={index * 150} />
                  ))}
                </div>
              </div>

              {/* Recent Security Events */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity size={20} />
                    Recent Security Events
                  </h2>
                  <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                    View All →
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recentSecurityEvents.map((event) => (
                    <SecurityEventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedTab === 'access-control' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Access Control Rules</h2>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  Add New Rule
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accessControlRules.map((rule) => (
                  <AccessControlCard key={rule.id} rule={rule} />
                ))}
              </div>

              {/* Access Statistics */}
              <div className="mt-12 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6">Access Statistics (Last 30 Days)</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">15,847</div>
                    <div className="text-gray-400 text-sm">Successful Access</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-400 mb-2">23</div>
                    <div className="text-gray-400 text-sm">Access Denied</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">98.5%</div>
                    <div className="text-gray-400 text-sm">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">1.2s</div>
                    <div className="text-gray-400 text-sm">Avg Response Time</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'compliance' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Compliance Dashboard</h2>
                <p className="text-gray-300">Monitor compliance status across all regulatory frameworks</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {complianceFrameworks.map((framework, index) => (
                  <ComplianceCard key={index} framework={framework} />
                ))}
              </div>

              {/* Compliance Actions */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6">Upcoming Compliance Actions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">GDPR Data Protection Review</h4>
                      <p className="text-gray-400 text-sm">Quarterly data processing audit</p>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-medium">Due in 15 days</div>
                      <div className="text-gray-400 text-sm">July 18, 2025</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">SOC 2 Security Assessment</h4>
                      <p className="text-gray-400 text-sm">Annual Type II audit preparation</p>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 font-medium">Due in 45 days</div>
                      <div className="text-gray-400 text-sm">August 17, 2025</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'monitoring' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Security Monitoring</h2>
                <p className="text-gray-300">Real-time security monitoring and threat detection</p>
              </div>

              {/* Monitoring Dashboard */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Eye size={20} />
                    Active Monitoring Systems
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Network Security</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Endpoint Protection</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Access Point Monitoring</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Data Loss Prevention</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Threat Detection Status
                  </h3>
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-green-400 mb-2">ALL CLEAR</div>
                    <p className="text-gray-300 mb-4">No active threats detected</p>
                    <div className="text-sm text-gray-400">
                      Last scan: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Logs */}
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock size={20} />
                    Security Event Log
                  </h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                    Export Logs →
                  </button>
                </div>
                
                <div className="space-y-3">
                  {recentSecurityEvents.slice(0, 8).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          event.severity === 'success' ? 'bg-green-400' :
                          event.severity === 'warning' ? 'bg-yellow-400' :
                          event.severity === 'info' ? 'bg-blue-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-white text-sm">{event.action}</span>
                      </div>
                      <span className="text-gray-400 text-xs">{event.time}</span>
                    </div>
                  ))}
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

export default Security;