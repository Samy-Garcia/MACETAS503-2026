import { useState, useEffect, useContext } from "react";
import { Search, X, ImageOff } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getListById, removeItemFromList } from "../api/wishlistApi";
import { CartContext } from "../context/CartContext.jsx";

export default function WishlistDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);

    const [list, setList] = useState(null);
    useEffect(() => {
        document.title = list?.name ? `${list.name} | Macetas503` : "Lista de deseos | Macetas503";
    }, [list]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [addingId, setAddingId] = useState(null);
    // Color elegido por producto (solo aplica a los que tienen colorOptions).
    // Antes no existía forma de elegir color desde la wishlist: siempre se
    // agregaba al carrito sin color, aunque el producto sí tuviera opciones.
    const [selectedColors, setSelectedColors] = useState({});

    const cargarLista = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getListById(id);
            setList(data);
            // Por defecto, cada producto con colores arranca con el primero
            // ya seleccionado (mismo comportamiento que en su página de detalle).
            const defaults = {};
            (data.items || []).forEach(item => {
                if (item.product?.colorOptions?.length > 0) {
                    defaults[item._id] = item.product.colorOptions[0].name;
                }
            });
            setSelectedColors(defaults);
        } catch (err) {
            setError(err.message || 'No se pudo cargar la lista.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarLista();
    }, [id]);

    const handleRemoveProduct = async (itemId) => {
        try {
            await removeItemFromList(id, itemId);
            setList(prev => ({ ...prev, items: prev.items.filter(i => i._id !== itemId) }));
        } catch (err) {
            toast.error(err.message || 'No se pudo eliminar el producto.');
        }
    };

    const handleAddToCart = async (item) => {
        setAddingId(item._id);
        try {
            const hasColors = item.product?.colorOptions?.length > 0;
            const color = hasColors ? (selectedColors[item._id] || item.product.colorOptions[0].name) : null;
            await addToCart(item.productId, item.productType, 1, color);
            toast.success('Producto agregado al carrito');
        } catch (err) {
            toast.error(err.message || 'No se pudo agregar al carrito.');
        } finally {
            setAddingId(null);
        }
    };

    const filteredItems = (list?.items || []).filter(item =>
        !searchTerm || item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="w-full min-h-screen flex items-center justify-center text-zinc-400">Cargando...</div>;
    }

    if (error || !list) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-500">
                <p>{error || 'Lista no encontrada.'}</p>
                <button onClick={() => navigate('/wishlist')} className="px-6 py-2 bg-primary-700 text-white rounded-md font-bold">
                    Volver a mis listas
                </button>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-page font-sans antialiased text-zinc-800 flex flex-col justify-between">
            <div>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
                            Listas Guardadas
                        </h1>
                        <div className="w-full border-b border-zinc-300 mt-6"></div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 font-medium">Lista</span>
                            <span className="font-bold text-zinc-900 text-lg md:text-xl">{list.name}</span>
                        </div>

                        <div className="flex items-center gap-4 text-zinc-800">
                            {showSearch && (
                                <input
                                    type="text"
                                    placeholder="Buscar en la lista..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border border-zinc-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary-700"
                                />
                            )}
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="cursor-pointer hover:text-primary-700 transition-colors"
                            >
                                <Search size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item._id}
                                className="bg-surface border border-zinc-200/80 rounded-xl p-4 shadow-xs flex flex-col justify-between relative hover:border-primary-700/30 transition-all"
                            >
                                <button
                                    onClick={() => handleRemoveProduct(item._id)}
                                    className="absolute top-3 right-3 text-zinc-500 hover:text-red-600 transition-colors cursor-pointer bg-white/80 rounded-full p-1 shadow-xs"
                                    title="Eliminar de la lista"
                                >
                                    <X size={16} />
                                </button>

                                <div>
                                    <div
                                        onClick={() => navigate(item.productType === 'maceta' ? `/detalleproducto/${item.productId}` : `/detallevela/${item.productId}`)}
                                        className="h-60 rounded-lg overflow-hidden bg-zinc-50 mb-4 border border-zinc-100 flex items-center justify-center cursor-pointer"
                                    >
                                        {item.product?.image ? (
                                            <img src={item.product.image} alt={item.product?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-zinc-300"><ImageOff size={32} /></div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Macetas503</p>
                                    <div className="flex items-center justify-between mt-1 mb-2">
                                        <h3 className="font-semibold text-zinc-900 text-sm">{item.product?.name || 'Producto eliminado'}</h3>
                                        <span className="font-bold text-zinc-900 text-sm">
                                            {item.product ? `$${Number(item.product.price).toFixed(2)}` : '—'}
                                        </span>
                                    </div>

                                    {item.product?.colorOptions?.length > 0 && (
                                        <div className="flex items-center gap-1.5 mb-4">
                                            {item.product.colorOptions.map(c => (
                                                <button
                                                    key={c.name}
                                                    type="button"
                                                    title={c.name}
                                                    onClick={() => setSelectedColors(prev => ({ ...prev, [item._id]: c.name }))}
                                                    style={{ backgroundColor: c.hex }}
                                                    className={`w-5 h-5 rounded-full cursor-pointer border-2 transition-all ${
                                                        (selectedColors[item._id] || item.product.colorOptions[0].name) === c.name
                                                            ? "border-primary-700 scale-110"
                                                            : "border-transparent"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleAddToCart(item)}
                                    disabled={!item.product || item.product.stock <= 0 || addingId === item._id}
                                    className="w-full bg-primary-700 text-white font-semibold py-2.5 rounded-lg text-xs hover:bg-primary-800 transition-all cursor-pointer text-center shadow-xs disabled:opacity-50"
                                >
                                    {addingId === item._id ? 'Agregando...' : (!item.product ? 'No disponible' : item.product.stock <= 0 ? 'Agotado' : 'Agregar')}
                                </button>
                            </div>
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="text-center py-16 text-zinc-400 text-sm">
                            No hay productos en esta lista de deseos.
                        </div>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
}
