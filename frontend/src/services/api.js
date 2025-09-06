const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Set auth token
  setAuthToken(token) {
    localStorage.setItem('token', token);
  }

  // Remove auth token
  removeAuthToken() {
    localStorage.removeItem('token');
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Generic API request method
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check if the server is running.');
      }
      
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.makeRequest('/auth/me');
  }

  // Booking endpoints
  async createBooking(bookingData) {
    return this.makeRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getUserBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/bookings/my-bookings?${queryString}` : '/bookings/my-bookings';
    return this.makeRequest(endpoint);
  }

  async getAllBookings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/bookings/all?${queryString}` : '/bookings/all';
    return this.makeRequest(endpoint);
  }

  async cancelBooking(bookingId) {
    return this.makeRequest(`/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    });
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }

  // Test connection
  async testConnection() {
    try {
      const response = await this.healthCheck();
      console.log('API Connection successful:', response);
      return true;
    } catch (error) {
      console.error('API Connection failed:', error);
      return false;
    }
  }
}

export default new ApiService();