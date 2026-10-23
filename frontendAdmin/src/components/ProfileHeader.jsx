import { Link, useLocation } from "react-router-dom";
import logoMacetas from "../assets/logoMacetas.png";

export default function ProfileHeader({ avatar }) {
  const location = useLocation();

  // Función auxiliar para verificar si la ruta está activa
  const isActive = (path) => location.pathname === path ? "text-[#064225] font-semibold border-b-2 border-[#064225]" : "hover:text-[#064225]";

  return (
    <header className="w-full bg-white h-24 flex items-center shadow-xs">
      <div className="max-w-6xl w-full mx-auto px-12 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logoMacetas} alt="Macetas Logo" className="h-14 object-contain" />
        </Link>

        {/* Menú de Navegación */}
        <nav className="flex items-center gap-10 text-lg font-medium text-zinc-800">
          <Link to="/perfil" className={`pb-1 transition-all ${isActive("/perfil")}`}>Perfil</Link>
          <Link to="/pedidos" className={`pb-1 transition-all ${isActive("/pedidos")}`}>Pedidos</Link>
          <Link to="/wishlistPerfil" className={`pb-1 transition-all ${isActive("/wishlistPerfil")}`}>Wishlist</Link>
          <Link to="/resenas" className={`pb-1 transition-all ${isActive("/resenas")}`}>Reseñas</Link>
        </nav>

        {/* Mini avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200">
          <img src={avatar} alt="User mini" className="w-full h-full object-cover" />
        </div>

      </div>
    </header>
  );
}