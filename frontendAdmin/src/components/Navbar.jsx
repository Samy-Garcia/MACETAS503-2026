import { Search, Heart, User, ShoppingBag } from "lucide-react";
import logoMacetas from "../assets/logoMacetas.png";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Rutas de perfil donde NO debe mostrarse este Navbar (se usará el ProfileHeader)
    const profileRoutes = [
        "/perfil", 
        "/editarperfil", 
        "/agregardireccion", 
        "/pedidos", 
        "/agregarmetododepago",
        "/wishlist",
        "/resenas",
        "/resenaform"
    ];

    if (profileRoutes.includes(location.pathname)) {
        return null;
    }

    // Función para manejar la búsqueda
    const handleSearch = () => {
        navigate("/buscar");
    };

    const menuItems = [
        { name: "Lo más Vendido", path: "/masvendidos" },
        { name: "Macetas", path: "/macetas" },
        { name: "Velas", path: "/velas" },
        { name: "Plantas y Cuidados", path: "/plantas-y-cuidados" },
        { name: "Ofertas", path: "/ofertas" },
        { name: "Nosotros", path: "/nosotros" },
        { name: "Programa de Fidelidad", path: "/programa-de-fidelidad" }
    ];

    return (
        <header className="w-full bg-white border-b border-zinc-100 sticky top-0 z-50 shadow-xs">
            {/* Banner Superior */}
            <div className="w-full bg-[#064225] text-white text-center py-2 text-xs font-medium tracking-wide">
                Envío gratis a compras mayores de $15.00
            </div>

            {/* Barra Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <button
                    onClick={handleSearch}
                    className="text-zinc-700 hover:text-[#064225] transition-colors cursor-pointer p-2"
                >
                    <Search size={20} />
                </button>

                <Link to="/" className="flex items-center justify-center cursor-pointer">
                    <img src={logoMacetas} alt="Macetas Logo" className="h-12 object-contain" />
                </Link>

                <div className="flex items-center gap-4 text-zinc-700">
                    <Link to="/favoritos" className="hover:text-[#064225] transition-colors cursor-pointer p-1">
                        <Heart size={20} />
                    </Link>
                    <Link to="/perfil" className="hover:text-[#064225] transition-colors cursor-pointer p-1">
                        <User size={20} />
                    </Link>
                    <Link to="/carrito" className="hover:text-[#064225] transition-colors cursor-pointer p-1">
                        <ShoppingBag size={20} />
                    </Link>
                </div>
            </div>

            {/* Menú de Navegación */}
            <nav className="w-full border-t border-zinc-100 bg-white hidden sm:block">
                <ul className="flex items-center justify-center gap-8 py-3 text-xs font-semibold text-[#064225]/90 tracking-wide uppercase">
                    {menuItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                to={item.path}
                                className="hover:text-[#032d18] cursor-pointer transition-colors relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#064225] hover:after:w-full after:transition-all"
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}