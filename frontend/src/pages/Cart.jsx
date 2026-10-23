import { useContext } from "react";
import { Plus, Minus, Trash2, ShoppingBag, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext.jsx";

// isOpen/onClose son opcionales: si no vienen (por ejemplo, al entrar directo
// a la ruta /carrito), este componente se comporta como una página completa.
export default function CartDrawer({ isOpen = true, onClose }) {
    const navigate = useNavigate();
    const { cart, loading, isAuthenticated, updateQuantity, removeItem } = useContext(CartContext);

    const handleClose = onClose || (() => navigate(-1));

    const handleUpdateQuantity = async (itemId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty <= 0) return;
        try {
            await updateQuantity(itemId, newQty);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await removeItem(itemId);
        } catch (err) {
            alert(err.message);
        }
    };

    const cartItems = cart.products || [];
    const subtotal = cart.total || 0;
    const shipping = cartItems.length > 0 ? 2.00 : 0.00;
    const total = subtotal + (cartItems.length > 0 ? shipping : 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            {/* Fondo oscuro transparente que cierra el panel al hacer clic */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                onClick={handleClose}
            />

            {/* Contenedor del panel lateral derecho */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-page shadow-2xl flex flex-col justify-between border-l border-zinc-200/60 transform transition-transform duration-300 ease-in-out">

                    {/* ENCABEZADO DEL CARRITO */}
                    <div className="p-6 border-b border-zinc-200/80 flex items-center justify-between bg-surface">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Carrito</h2>
                            <span className="text-sm text-zinc-400 font-medium">
                                ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
                            </span>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* CUERPO DEL CONTENIDO SCROLLABLE */}
                    <div className="p-6 overflow-y-auto flex-1">
                        {!isAuthenticated ? (
                            <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                                <div className="w-14 h-14 bg-primary-700/10 text-primary-700 rounded-full flex items-center justify-center mb-3">
                                    <ShoppingBag size={28} />
                                </div>
                                <h3 className="text-base font-bold text-zinc-900 mb-1">Inicia sesión para ver tu carrito</h3>
                                <p className="text-xs text-zinc-400 max-w-xs mb-6">
                                    Necesitas una cuenta para agregar productos y hacer pedidos.
                                </p>
                                <button
                                    onClick={() => { handleClose(); navigate("/login"); }}
                                    className="bg-primary-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-800 transition-colors cursor-pointer shadow-xs"
                                >
                                    Iniciar sesión
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="text-center py-16 text-zinc-400 text-sm">Cargando carrito...</div>
                        ) : cartItems.length === 0 ? (
                            /* ESTADO VACÍO */
                            <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                                <div className="w-14 h-14 bg-primary-700/10 text-primary-700 rounded-full flex items-center justify-center mb-3">
                                    <ShoppingBag size={28} />
                                </div>
                                <h3 className="text-base font-bold text-zinc-900 mb-1">Tu carrito de compras está vacío</h3>
                                <p className="text-xs text-zinc-400 max-w-xs mb-6">
                                    Aún no has agregado productos a tu carrito. ¡Explora y encuentra tu favorito!
                                </p>
                                <button
                                    onClick={() => { handleClose(); navigate("/masvendidos"); }}
                                    className="bg-primary-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-800 transition-colors cursor-pointer shadow-xs"
                                >
                                    Ver Productos
                                </button>
                            </div>
                        ) : (
                            /* ESTADO CON PRODUCTOS */
                            <div>
                                {/* LISTA DE PRODUCTOS */}
                                <div className="space-y-4 mb-8">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="bg-surface border border-zinc-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0">
                                                    {item.product?.image ? (
                                                        <img src={item.product.image} alt={item.product?.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                            <ShoppingBag size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 text-xs line-clamp-1">
                                                        {item.product?.name || "Producto eliminado"}
                                                    </h4>
                                                    <p className="text-[10px] text-zinc-400 mt-0.5 capitalize">{item.productType}</p>
                                                    {item.color && (
                                                        <p className="text-[10px] text-zinc-400 mt-0.5">Color: <span className="capitalize">{item.color}</span></p>
                                                    )}
                                                    {item.customOrder && (
                                                        <p className="text-[10px] text-primary-700 mt-0.5 font-semibold">✎ Personalizado: {item.customOrder.description}</p>
                                                    )}
                                                    {item.product && item.unitPrice !== undefined && item.unitPrice < item.product.price ? (
                                                        <div className="flex items-center gap-1.5 mt-1.5">
                                                            <p className="text-[10px] text-zinc-400 line-through">
                                                                ${Number(item.product.price).toFixed(2)}
                                                            </p>
                                                            <p className="font-bold text-red-600 text-xs">
                                                                ${Number(item.unitPrice).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="font-bold text-zinc-900 text-xs mt-1.5">
                                                            ${item.unitPrice !== undefined ? Number(item.unitPrice).toFixed(2) : (item.product ? Number(item.product.price).toFixed(2) : '—')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <button
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    className="text-zinc-300 hover:text-red-600 transition-colors cursor-pointer"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                                <div className="flex items-center border border-zinc-300 rounded-md overflow-hidden bg-zinc-50 text-[10px]">
                                                    <button onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)} className="px-2 py-0.5 text-zinc-600 hover:bg-zinc-200 cursor-pointer">
                                                        <Minus size={10} />
                                                    </button>
                                                    <span className="px-2 font-semibold text-zinc-900">{item.quantity}</span>
                                                    <button onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)} className="px-2 py-0.5 text-zinc-600 hover:bg-zinc-200 cursor-pointer">
                                                        <Plus size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PIE DEL PANEL / TOTALES Y CHECKOUT (Solo si hay productos) */}
                    {isAuthenticated && cartItems.length > 0 && (
                        <div className="p-6 border-t border-zinc-200/80 bg-surface space-y-4">
                            <div className="space-y-1.5 text-xs text-zinc-500">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Envío</span>
                                    <span>${shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-zinc-900 pt-2 border-t border-zinc-100">
                                    <span>Total</span>
                                    <span className="text-primary-700">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => { handleClose(); navigate("/checkout"); }}
                                className="w-full bg-primary-700 text-white font-bold py-3 rounded-xl text-xs hover:bg-primary-800 transition-all cursor-pointer text-center shadow-sm tracking-wide"
                            >
                                Checkout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
