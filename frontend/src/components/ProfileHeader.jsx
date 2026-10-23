import Avatar from "./Avatar";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoMacetas from "../assets/logoMacetas.png";

export default function ProfileHeader({ avatar }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Función auxiliar para verificar si la ruta está activa
  const isActive = (path) =>
    location.pathname === path
      ? "text-primary-700 font-semibold border-b-2 border-primary-700"
      : "hover:text-primary-700";

  const isActiveMobile = (path) =>
    location.pathname === path
      ? "text-primary-700 font-semibold bg-primary-700/5"
      : "text-zinc-800 hover:text-primary-700 hover:bg-zinc-50";

  const links = [
    { to: "/perfil", label: "Perfil" },
    { to: "/pedidos", label: "Pedidos" },
    { to: "/wishlistPerfil", label: "Wishlist" },
    { to: "/resenas", label: "Reseñas" },
    { to: "/personalizaciones", label: "Personalizaciones" },
    { to: "/mis-cotizaciones", label: "Cotizaciones" },
  ];

  return (
    <header className="w-full bg-surface shadow-xs relative z-50">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-12 h-20 lg:h-24 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0" onClick={() => setMenuOpen(false)}>
          <img src={logoMacetas} alt="Macetas Logo" className="h-11 lg:h-14 object-contain" />
        </Link>

        {/* Menú de Navegación - Desktop */}
        <nav className="hidden lg:flex items-center gap-10 text-lg font-medium text-zinc-800">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={`pb-1 transition-all ${isActive(link.to)}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Lado derecho: avatar + botón hamburguesa */}
        <div className="flex items-center gap-3 lg:gap-0">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden border border-zinc-200 shrink-0">
            <Avatar src={avatar} alt="Foto de perfil" className="w-full h-full object-cover" />
          </div>

          {/* Botón hamburguesa - solo móvil/tablet */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden text-zinc-800 p-1 cursor-pointer"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Menú desplegable - Mobile */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-zinc-200 bg-surface flex flex-col px-4 py-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-3 rounded-md text-base font-medium transition-all ${isActiveMobile(link.to)}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}