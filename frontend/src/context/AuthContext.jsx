import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  );
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`;

      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/auth/me`
      );

      setUser(res.data);
    } catch (error) {
      console.error('Auth fetch error:', error);

      localStorage.removeItem('token');
      setToken(null);
      setUser(null);

      delete axios.defaults.headers.common[
        'Authorization'
      ];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post(
      `${API_URL}/auth/login`,
      {
        email,
        password,
      }
    );

    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);

    navigate('/');
  };

  const register = async (userData) => {
    const res = await axios.post(
      `${API_URL}/auth/register`,
      userData
    );

    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);

    navigate('/');
  };

  const loginWithGoogle = async (googleToken) => {
    console.log(
      'Sending Google token to:',
      `${API_URL}/auth/google`
    );

    const res = await axios.post(
      `${API_URL}/auth/google`,
      {
        token: googleToken,
      }
    );

    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);

    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('token');

    setToken(null);
    setUser(null);

    delete axios.defaults.headers.common[
      'Authorization'
    ];

    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        loginWithGoogle,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}