import { createContext, useState, useEffect, useCallback } from "react";
import { getMyProfile } from "../api/profileApi";
import fotoPerfil from "../assets/profile.jpeg";

export const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Importante: solo tratamos un 401 real como "no hay sesión". Cualquier
  // otro error (backend recién reiniciado, MongoDB reconectando, un hiccup
  // de red) es un problema TEMPORAL del servidor, no significa que la
  // sesión sea inválida — reintentamos un par de veces antes de mostrar al
  // usuario como deslogueado.
  const refreshProfile = useCallback(async (attempt = 0) => {
    if (attempt === 0) setLoading(true);
    try {
      const data = await getMyProfile();
      setProfile(data);
      setLoading(false);
    } catch (err) {
      if (err.status === 401) {
        // Esto sí es real: no hay cookie, o el token ya no es válido.
        setProfile(null);
        setLoading(false);
        return;
      }

      if (attempt < 3) {
        setTimeout(() => refreshProfile(attempt + 1), 700);
        return;
      }

      // Se agotaron los reintentos sin poder confirmar nada con el backend.
      // No forzamos setProfile(null): si ya había un perfil cargado, lo
      // dejamos como está en vez de "desloguear" por un error temporal.
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const avatar = profile?.photo || fotoPerfil;

  return (
    <ProfileContext.Provider value={{ profile, loading, avatar, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
