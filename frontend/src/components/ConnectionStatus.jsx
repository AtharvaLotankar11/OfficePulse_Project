import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { testBackendConnection } from '../utils/connectionTest';

const ConnectionStatus = ({ isConnected, showDetails = false }) => {
  const [backendStatus, setBackendStatus] = useState('checking');
  
  useEffect(() => {
    const checkConnection = async () => {
      const result = await testBackendConnection();
      setBackendStatus(result.success ? 'connected' : 'disconnected');
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isConnected && backendStatus === 'connected') return 'text-green-400';
    if (backendStatus === 'checking') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = () => {
    if (isConnected && backendStatus === 'connected') return <Wifi size={16} />;
    if (backendStatus === 'checking') return <AlertCircle size={16} />;
    return <WifiOff size={16} />;
  };

  const getStatusText = () => {
    if (isConnected && backendStatus === 'connected') return 'Connected';
    if (backendStatus === 'checking') return 'Checking...';
    return 'Disconnected';
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <div className={getStatusColor()}>
          {getStatusIcon()}
        </div>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          Connection Status
        </span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Real-time:</span>
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Backend:</span>
          <span className={
            backendStatus === 'connected' ? 'text-green-400' : 
            backendStatus === 'checking' ? 'text-yellow-400' : 'text-red-400'
          }>
            {backendStatus === 'connected' ? 'Online' : 
             backendStatus === 'checking' ? 'Checking...' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;