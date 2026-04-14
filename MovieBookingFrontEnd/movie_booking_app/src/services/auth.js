import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/signin', { email, password });
  console.log(response)
  return response.data;
};

export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.userId,
      email: payload.sub,
      role: payload.role,
      fullName: payload.fullName
    };
  } catch (error) {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};