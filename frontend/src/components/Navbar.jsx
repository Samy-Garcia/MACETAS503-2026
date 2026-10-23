import { useState, useEffect, useContext } from "react";
import { Search, Heart, User, ShoppingBag, X, Menu } from "lucide-react";
import logoMacetas from "../assets/logoMacetas.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CartDrawer from "@/pages/Cart";
import { CartContext } from "../context/CartContext.jsx";
import { WishlistContext } from "../context/WishlistContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { getActiveAnnouncementBar } from "../api/announcementBarApi.js";

// Mensaje de respaldo por si todavía no hay ningún banner activo guardado
// en el backend, o mientras se está cargando, para que la franja nunca se
// vea vacía.
const DEFAULT_ANNOUNCEMENT = {
    text: "Envío gratis a compras mayores de $15.00",
    backgroundColor: "var(--color-primary-700)",
    textColor: "#FFFFFF",
    animation: "none"
};

export default function Navbar() {
    const { logoUrl, emoji } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { itemCount } = useContext(CartContext);
    const { favoriteKeys } = useContext(WishlistContext);

    const [banner, setBanner] = useState(DEFAULT_ANNOUNCEMENT);

    useEffect(() => {
        const cargarAnuncio = async () => {
            try {
                const activo = await getActiveAnnouncementBar();
                if (activo) {
                    setBanner({
                        text: activo.text,
                        backgroundColor: activo.backgroundColor || DEFAULT_ANNOUNCEMENT.backgroundColor,
                        textColor: activo.textColor || DEFAULT_ANNOUNCEMENT.textColor,
                        animation: activo.animation || "none"
                    });
                }
            } catch (err) {
                // Silencioso: si falla, se queda con el mensaje de respaldo
            }
        };
        cargarAnuncio();
    }, []);

    // Estados para controlar el panel lateral del carrito y la barra de búsqueda desplegable
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Rutas de perfil donde NO debe mostrarse este Navbar
    const profileRoutes = [
        "/perfil",
        "/editarperfil",
        "/agregardireccion",
        "/pedidos",
        "/agregarmetododepago",
        "/wishlistPerfil",
        "/resenas",
        "/resenaform",
        "/checkout",
        "/confirmacion-orden",
        "/pago-3ds"
    ];

    if (profileRoutes.includes(location.pathname)) {
        return null;
    }

    // Manejar el submit del formulario de búsqueda
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false); // Cierra el buscador tras enviar
        }
    };

    const toggleSearch = () => {
        setIsMenuOpen(false);
        setIsSearchOpen((v) => !v);
    };

    const toggleMenu = () => {
        setIsSearchOpen(false);
        setIsMenuOpen((v) => !v);
    };

    const menuItems = [
        { name: "Lo más Vendido", path: "/masvendidos" },
        { name: "Macetas", path: "/macetas" },
        { name: "Velas", path: "/velas" },
        { name: "Otros", path: "/otros" },
        { name: "Combos", path: "/combos" },
        { name: "Cotizaciones", path: "/cotizaciones" },
        { name: "Plantas y Cuidados", path: "/plantas-y-cuidados" },
        { name: "Nosotros", path: "/nosotros" },
        { name: "Programa de Fidelidad", path: "/programa-de-fidelidad" }
    ];

    return (
        <>
            <header className="w-full bg-surface border-b border-zinc-100 sticky top-0 z-50 shadow-xs">
                {/* Banner Superior */}
                <div
                    className={`w-full text-center py-2 px-2 text-[11px] sm:text-xs font-medium tracking-wide overflow-hidden ${
                        banner.animation !== "none" ? `anim-${banner.animation}` : ""
                    }`}
                    style={{ backgroundColor: banner.backgroundColor, color: banner.textColor }}
                >
                    <span className={banner.animation === "marquee" ? "inline-block whitespace-nowrap" : ""}>
                        {emoji ? `${emoji} ${banner.text} ${emoji}` : banner.text}
                    </span>
                </div>

                {/* Barra Principal */}
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between relative">

                    {/* Botones izquierda: Menú (móvil) + Lupa */}
                    <div className="flex items-center gap-1 z-10">
                        <button
                            onClick={toggleMenu}
                            className="sm:hidden text-zinc-700 hover:text-primary-700 transition-colors cursor-pointer p-2"
                            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <button
                            onClick={toggleSearch}
                            className="text-zinc-700 hover:text-primary-700 transition-colors cursor-pointer p-2"
                            aria-label="Abrir buscador"
                        >
                            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                        </button>
                    </div>

                    <Link to="/" className="flex items-center justify-center cursor-pointer" onClick={() => { setIsMenuOpen(false); setIsSearchOpen(false); }}>
                        <img src={logoUrl || logoMacetas} alt="Macetas Logo" className="h-9 sm:h-12 object-contain" />
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4 text-zinc-700 z-10">
                        <Link to="/wishlist" className="relative hover:text-primary-700 transition-colors cursor-pointer p-1">
                            <Heart size={20} />
                            {favoriteKeys.size > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {favoriteKeys.size > 9 ? '9+' : favoriteKeys.size}
                                </span>
                            )}
                        </Link>
                        <Link to="/perfil" className="hover:text-primary-700 transition-colors cursor-pointer p-1">
                            <User size={20} />
                        </Link>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative hover:text-primary-700 transition-colors cursor-pointer p-1"
                            aria-label="Abrir carrito"
                        >
                            <ShoppingBag size={20} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {itemCount > 9 ? '9+' : itemCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Espacio desplegable de búsqueda (Aparece sobre la barra al activar la lupa) */}
                    {isSearchOpen && (
                        <div className="absolute inset-0 bg-surface px-4 sm:px-8 flex items-center z-20 border-b border-zinc-200 animate-fadeIn">
                            <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl mx-auto flex items-center gap-2">
                                <Search size={18} className="text-zinc-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Buscar macetas, velas, plantas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full bg-transparent text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="bg-primary-700 text-white text-[11px] font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-800 transition-colors cursor-pointer shrink-0"
                                >
                                    Buscar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsSearchOpen(false)}
                                    className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer shrink-0 ml-1"
                                >
                                    <X size={18} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Menú de Navegación - Desktop */}
                <nav className="w-full border-t border-zinc-100 bg-surface hidden sm:block">
                    <ul className="flex items-center justify-center gap-8 py-3 text-xs font-semibold text-primary-700/90 tracking-wide uppercase">
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className="hover:text-primary-800 cursor-pointer transition-colors relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary-700 hover:after:w-full after:transition-all"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Menú de Navegación - Mobile (desplegable) */}
                {isMenuOpen && (
                    <nav className="sm:hidden w-full border-t border-zinc-100 bg-surface">
                        <ul className="flex flex-col py-2">
                            {menuItems.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-4 py-3 text-sm font-semibold text-primary-700/90 tracking-wide uppercase hover:bg-primary-700/5 transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </header>

            {/* Panel Lateral del Carrito (Drawer) */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}