import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { getMyLists, toggleItemInList } from "../api/wishlistApi";
import { WishlistContext } from "../context/WishlistContext.jsx";

// Botón chevron junto al ❤️: abre un menú para elegir en cuál lista
// guardar (o quitar) este producto específico, en vez de solo la default.
export default function SaveToListMenu({ productId, productType }) {
    const navigate = useNavigate();
    const { refreshFavorites } = useContext(WishlistContext);
    const [open, setOpen] = useState(false);
    const [lists, setLists] = useState([]);
    const [loadingLists, setLoadingLists] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const openMenu = async () => {
        setOpen(true);
        setLoadingLists(true);
        try {
            const data = await getMyLists();
            setLists(data);
        } catch (err) {
            if (err.message?.includes('sesión')) {
                toast.error('Inicia sesión para guardar productos');
                navigate('/login');
            }
        } finally {
            setLoadingLists(false);
        }
    };

    const handleToggle = async (list) => {
        setTogglingId(list._id);
        try {
            const { inList } = await toggleItemInList(list._id, productId, productType);
            toast.success(inList ? `Agregado a "${list.name}"` : `Quitado de "${list.name}"`);
            await refreshFavorites();
        } catch (err) {
            toast.error(err.message || 'No se pudo actualizar la lista.');
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => (open ? setOpen(false) : openMenu())}
                className="h-full px-2 border border-l-0 rounded-r-md border-zinc-300 hover:bg-zinc-50 transition-colors"
                title="Elegir lista"
            >
                <ChevronDown size={16} className="text-zinc-500" />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-zinc-200 rounded-lg shadow-lg z-20 py-2">
                    <p className="px-3 pb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Guardar en...</p>
                    {loadingLists ? (
                        <p className="px-3 py-2 text-xs text-zinc-400">Cargando...</p>
                    ) : lists.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-zinc-400">No tienes listas todavía.</p>
                    ) : (
                        lists.map((list) => (
                            <button
                                key={list._id}
                                onClick={() => handleToggle(list)}
                                disabled={togglingId === list._id}
                                className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center justify-between disabled:opacity-50"
                            >
                                <span>{list.name}</span>
                                <span className="text-[10px] text-zinc-400">{list.count}</span>
                            </button>
                        ))
                    )}
                    <div className="border-t border-zinc-100 mt-1 pt-1">
                        <button
                            onClick={() => navigate('/wishlist')}
                            className="w-full text-left px-3 py-2 text-xs text-primary-700 hover:bg-zinc-50 font-medium"
                        >
                            + Crear nueva lista
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
