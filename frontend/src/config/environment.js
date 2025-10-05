// Environment configuration for different deployment environments
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000',
    SOCKET_URL: 'http://localhost:5000',
  },
  production: {
    API_BASE_URL: 'https://officepulse-backend.onrender.com',
    SOCKET_URL: 'https://officepulse-backend.onrender.com',
  }
};

const environment = import.meta.env.MODE || 'development';

export const ENV_CONFIG = config[environment] || config.development;

export const getSocketUrl = (namespace = '') => {
  const baseUrl = ENV_CONFIG.SOCKET_URL;
  return namespace ? `${baseUrl}/${namespace}` : baseUrl;
};

export const getApiUrl = (endpoint = '') => {
  const baseUrl = ENV_CONFIG.API_BASE_URL;
  return endpoint ? `${baseUrl}/api/${endpoint}` : `${baseUrl}/api`;
};