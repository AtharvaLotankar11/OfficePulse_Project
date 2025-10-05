import { getApiUrl } from '../config/environment';

export const testBackendConnection = async () => {
  try {
    const response = await fetch(getApiUrl('health'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Backend connection test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return { success: false, error: error.message };
  }
};

export const testSocketConnection = async () => {
  try {
    const response = await fetch(getApiUrl('socket-health'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Socket connection test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Socket connection test failed:', error);
    return { success: false, error: error.message };
  }
};