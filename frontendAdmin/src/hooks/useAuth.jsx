import { API_BASE_URL } from '../config/api.js';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginAdminRequest, registerAdminRequest } from '../api/authApi';

const API = `${API_BASE_URL}/api`;

export const useAuth = () => {
  const navigate = useNavigate();
  const { admin, isAuthenticated, setAuthenticatedAdmin, logout: contextLogout } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      await loginAdminRequest(email, password);

      // el login no devuelve los datos del admin, así que los pedimos con /me
      // para que el AuthContext quede actualizado de inmediato
      const meResponse = await fetch(`${API}/loginAdmin/me`, { credentials: 'include' });
      const meData = await meResponse.json();
      if (meResponse.ok) {
        setAuthenticatedAdmin(meData);
      }

      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
      setLoading(false);
      throw err;
    }
  };

  const register = async (data) => {
    setLoading(true);
    setError('');
    try {
      const result = await registerAdminRequest(data);

      localStorage.setItem('verifyEmail', data.email);
      localStorage.setItem('verifyContext', 'register');

      setLoading(false);
      navigate('/verificar');
      return result;
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro');
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    await contextLogout();
    navigate('/login');
  };

  return {
    admin,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    setError
  };
};
