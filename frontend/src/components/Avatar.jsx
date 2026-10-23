import { useEffect, useState } from "react";
import fotoPerfil from "../assets/profile.jpeg";

// Foto de perfil con respaldo: si el usuario no tiene foto, o la imagen no
// carga (enlace roto, foto de Google bloqueada, sin internet), se muestra la
// foto de perfil por defecto en vez de un ícono de imagen rota.
export default function Avatar({ src, alt = "Foto de perfil", className = "" }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setFallo(false);
  }, [src]);

  return (
    <img
      src={!src || fallo ? fotoPerfil : src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFallo(true)}
    />
  );
}
