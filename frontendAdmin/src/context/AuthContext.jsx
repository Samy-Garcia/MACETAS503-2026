import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getMeRequest, logoutAdminRequest } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);       // { id, name, email } o null
  const [loading, setLoading] = useState(true);   // true mientras se verifica la sesión al cargar la app
  const [checked, setChecked] = useState(false);

  // Consulta al backend si la cookie authCookie sigue siendo válida.
  //
  // Importante: solo tratamos un 401 real como "no hay sesión". Cualquier
  // otro error (backend recién reiniciado por nodemon, MongoDB todavía
  // reconectando, un hiccup de red) es un problema TEMPORAL del servidor,
  // no significa que la sesión sea inválida — así que reintentamos un par
  // de veces antes de rendirnos, en vez de cerrar sesión de inmediato.
  const checkAuth = useCallback(async (attempt = 0) => {
    try {
      const data = await getMeRequest();
      setAdmin(data);
      setLoading(false);
      setChecked(true);
    } catch (err) {
      if (err.status === 401) {
        // Esto sí es un cierre de sesión real: no hay cookie, o el token
        // ya no es válido.
        setAdmin(null);
        setLoading(false);
        setChecked(true);
        return;
      }

      if (attempt < 3) {
        setTimeout(() => checkAuth(attempt + 1), 700);
        return;
      }

      // Se agotaron los reintentos y seguimos sin poder confirmar nada con
      // el backend. No forzamos setAdmin(null) aquí: si ya había una sesión
      // reconocida, la dejamos como está en vez de cerrarla por un error
      // que podría ser temporal.
      setLoading(false);
      setChecked(true);
    }
  }, []);

  // Se ejecuta una sola vez, al montar la app (recarga de página, entrar directo a una URL, etc.)
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Se llama justo después de un login exitoso, para no tener que esperar otra petición
  const setAuthenticatedAdmin = (adminData) => {
    setAdmin(adminData);
  };

  const logout = async () => {
    try {
      await logoutAdminRequest();
    } catch (err) {
      // aunque falle la petición, igual limpiamos la sesión localmente
      console.log(err);
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        loading,
        checked,
        setAuthenticatedAdmin,
        checkAuth,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
