/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import apiService from "./services/api";

// Create the context
export const AppContext = createContext();

// Provider component with auth and MongoDB integration
export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cleanupCallbacks, setCleanupCallbacks] = useState([]);

  // Check for existing token on load
  useEffect(() => {
    const token = apiService.getAuthToken();
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  // Fetch current user from /auth/me (MongoDB)
  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getCurrentUser();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      apiService.removeAuthToken();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login with /auth/login (MongoDB)
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(credentials);
      apiService.setAuthToken(response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, message: "Login successful!" };
    } catch (error) {
      return { success: false, message: error.message || "Login failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    apiService.removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage("home"); // Redirect to home on logout
  };

  // Register with /auth/register (MongoDB)
  const register = async (userData) => {
    setIsLoading(true);
    try {
      await apiService.register(userData);
      return { success: true, message: "Registration successful!" };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Global cleanup mechanism for media streams
  const registerCleanup = (cleanupFn) => {
    setCleanupCallbacks((prev) => [...prev, cleanupFn]);
  };

  const unregisterCleanup = (cleanupFn) => {
    setCleanupCallbacks((prev) => prev.filter((fn) => fn !== cleanupFn));
  };

  const runAllCleanups = () => {
    console.log("Running all registered cleanup functions");
    cleanupCallbacks.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.error("Error running cleanup function:", error);
      }
    });
  };

  // Enhanced setCurrentPage that runs cleanups before navigation
  const setCurrentPageWithCleanup = (page) => {
    if (currentPage === "video-meetup" && page !== "video-meetup") {
      console.log("Navigating away from video-meetup, running cleanups");
      runAllCleanups();
    }
    setCurrentPage(page);
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage: setCurrentPageWithCleanup,
        isMenuOpen,
        setIsMenuOpen,
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        isLoading,
        login,
        logout,
        register,
        registerCleanup,
        unregisterCleanup,
        runAllCleanups,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

export default AppContext;
