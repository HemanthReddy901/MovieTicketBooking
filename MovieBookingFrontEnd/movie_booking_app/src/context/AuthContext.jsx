import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, signup as apiSignup } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token && !user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [token, user]);

  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await apiLogin(email, password);

      const { token: newToken, roles, ...userData } = response;

 
      localStorage.setItem('token', newToken);
      setToken(newToken);

 
      const userObj = {
        ...userData,
        role: roles?.[0] || null 
      };

    
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const signup = async (userData) => {
    const response = await apiSignup(userData);
    return response;
  };

  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user, 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};