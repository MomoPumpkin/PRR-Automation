import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Auto-login with default credentials
    const autoLogin = async () => {
      // Default credentials from backend/app/routers/auth.py
      await login('testuser', 'password');
    };
    
    autoLogin();
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      // Set the authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user profile
      const response = await axios.get('/api/users/me');
      setCurrentUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to authenticate user');
      // Clear token if it's invalid
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      
      // Get token from API
      const response = await axios.post('/api/token', new URLSearchParams({
        username,
        password,
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const { access_token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', access_token);
      
      // Fetch user profile
      await fetchUserProfile(access_token);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Failed to login');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    // Clear user data and token
    setCurrentUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Register user
      await axios.post('/api/users', userData);
      
      // Login with new credentials
      return await login(userData.username, userData.password);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Failed to register');
      setLoading(false);
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};