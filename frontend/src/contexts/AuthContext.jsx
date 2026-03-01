import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const u = response.data.user;
      setUser(u ? { ...u, id: u.id ?? u._id } : null);
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password }, { timeout: 35000 });
      const { token, user: u } = response.data;
      const user = u ? { ...u, id: u.id ?? u._id } : null;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success('Login successful!');
      return user;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      const status = error.response?.status;
      const is504 = status === 504;
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      const hint = is504
        ? ' Server timed out. In Vercel set MONGODB_URI and JWT_SECRET (Settings → Environment Variables), allow 0.0.0.0/0 in MongoDB Atlas Network Access, then redeploy.'
        : isTimeout
          ? ' The server may be waking up (cold start). Please try again in a few seconds. If it keeps failing, check Vercel: MONGODB_URI, JWT_SECRET, and Atlas Network Access (0.0.0.0/0).'
          : !error.response
            ? ' (Network error – check if the API is reachable)'
            : status === 503
              ? ' Check Vercel: MONGODB_URI, JWT_SECRET, and MongoDB Atlas Network Access (allow 0.0.0.0/0).'
              : status >= 500
                ? ' Check Vercel Function logs and env vars.'
                : '';
      toast.error(msg + hint);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user: u } = response.data;
      const user = u ? { ...u, id: u.id ?? u._id } : null;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success('Registration successful!');
      return user;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
