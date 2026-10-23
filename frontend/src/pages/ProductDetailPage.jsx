import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Star, Minus, Plus, Sparkles, X } from "lucide-react";
import toast from "react-hot-toast";
import { getPotById } from "../api/productsApi";
import { getOffers } from "../api/offersApi";
import { getProductReviews } from "../api/reviewsApi";
import { createCustomOrder } from "../api/customOrdersApi";
import { CartContext } from "../context/CartContext.jsx";
import { WishlistContext } from "../context/WishlistContext.jsx";
import SaveToListMenu from "../components/SaveToListMenu";
import ProductGallery from "../components/ProductGallery";
import Footer from "../components/Footer"

export default function DetalleProducto() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    useEffect(() => {
        document.title = product?.name ? `${product.name} | Macetas503` : "Maceta | Macetas503";
    }, [product]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [selectedCandle, setSelectedCandle] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [offer, setOffer] = useState(null);
    const [reviewsData, setReviewsData] = useState({ average: 0, count: 0, reviews: [] });
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const { addToCart } = useContext(CartContext);
    const { isFavorite, toggleFavorite } = useContext(WishlistContext);
    const [togglingFav, setTogglingFav] = useState(false);

    // Solicitud de personalización (solo aplica si product.isCustomizable)
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [customizeDescription, setCustomizeDescription] = useState('');
    const [customizeImage, setCustomizeImage] = useState(null);
    const [submittingCustomize, setSubmittingCustomize] = useState(false);

    useEffect(() => {
        const cargarProducto = async () => {
            setLoading(true);
            setError('');
            try {
                const [data, offersData, reviewsResult] = await Promise.all([getPotById(id), getOffers(), getProductReviews('maceta', id)]);
                setReviewsData(reviewsResult);
                setProduct(data);

                const matchingOffer = offersData.find(
                    o => o.productType === 'maceta' && o.status && String(o.productId) === String(id)
                );
                setOffer(matchingOffer || null);

                // Preseleccionamos la primera opción de cada variante, si existen
                if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
                // Planta y vela son opcionales: no se preselecciona ninguna.
                if (data.colorOptions && data.colorOptions.length > 0) setSelectedColor(data.colorOptions[0].name);
            } catch (err) {
                setError(err.message || 'No se pudo cargar el producto.');
            } finally {
                setLoading(false);
            }
        };

        if (id) cargarProducto();
    }, [id]);

    const handleEnviarPersonalizacion = async () => {
        if (!customizeDescription.trim()) {
            toast.error('Describe qué quieres que le pongamos');
            return;
        }
        setSubmittingCustomize(true);
        try {
            await createCustomOrder({
                productId: product._id,
                description: customizeDescription.trim(),
                referenceImageFile: customizeImage
            });
            toast.success('¡Solicitud enviada! Puedes ver su estado en Mi Perfil → Personalizaciones');
            setShowCustomizeModal(false);
            setCustomizeDescription('');
            setCustomizeImage(null);
        } catch (err) {
            if (err.message?.includes('sesión')) {
                toast.error('Inicia sesión para pedir una personalización');
                navigate('/login');
            } else {
                toast.error(err.message || 'No se pudo enviar la solicitud');
            }
        } finally {
            setSubmittingCustomize(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center text-zinc-500">
                Cargando producto...
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-500">
                <p>{error || 'Producto no encontrado.'}</p>
                <button
                    onClick={() => navigate('/macetas')}
                    className="px-6 py-2 bg-primary-700 text-white rounded-md font-bold"
                >
                    Volver a Macetas
                </button>
            </div>
        );
    }

    const hasSizes = product.sizes && product.sizes.length > 0;
    const hasPlantOptions = product.plantOptions && product.plantOptions.length > 0;
    const hasCandleOptions = product.candleOptions && product.candleOptions.length > 0;
    const hasColorOptions = product.colorOptions && product.colorOptions.length > 0;

    return (
        <div className="flex flex-col min-h-screen w-full bg-page font-sans text-zinc-800">

            <main className="flex-1 w-full">
                <div className="max-w-7xl mx-auto px-4 py-12">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <ProductGallery
                            images={product.images}
                            coverImage={product.image}
                            name={product.name}
                        />

                        <div>
                            <h1 className="text-4xl font-bold text-zinc-900">{product.name}</h1>
                            <div className="flex items-center gap-2 my-2 text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < Math.round(reviewsData.average) ? "currentColor" : "none"} className={i < Math.round(reviewsData.average) ? "" : "text-zinc-300"} />
                                ))}
                                {reviewsData.count > 0 ? (
                                    <span className="text-xs text-zinc-500">
                                        {reviewsData.average} · {reviewsData.count} reseña{reviewsData.count !== 1 ? 's' : ''}
                                    </span>
                                ) : (
                                    <span className="text-xs text-zinc-500">Sin reseñas todavía</span>
                                )}
                            </div>
                            {offer ? (
                                <div className="flex items-center gap-3">
                                    <p className="text-lg text-zinc-400 line-through">${Number(product.price).toFixed(2)}</p>
                                    <p className="text-2xl font-bold text-red-600">${Number(offer.discountedPrice).toFixed(2)}</p>
                                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">-{offer.discountPercentage}%</span>
                                </div>
                            ) : (
                                <p className="text-2xl font-bold">${Number(product.price).toFixed(2)}</p>
                            )}
                            <p className="text-sm text-zinc-500 mt-2">{product.description}</p>

                            {/* Detalles físicos del producto (solo aplica a macetas: no todas
                                las variantes de producto tienen dimensiones/peso, así que se
                                muestran nada más si el backend los trae) */}
                            {(product.dimensions || product.weight || product.drainageType) && (
                                <div className="flex gap-6 mt-3 text-sm text-zinc-600 flex-wrap">
                                    {product.dimensions && (
                                        <span><span className="font-semibold text-zinc-700">Dimensiones:</span> {product.dimensions}</span>
                                    )}
                                    {product.weight && (
                                        <span><span className="font-semibold text-zinc-700">Peso:</span> {product.weight}</span>
                                    )}
                                    {product.drainageType && (
                                        <span><span className="font-semibold text-zinc-700">Drenaje:</span> {product.drainageType}</span>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 space-y-6">
                                {/* Tamaño: solo se muestra si el admin definió opciones para este producto */}
                                {hasSizes && (
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Elige un tamaño:</p>
                                        <div className="flex gap-4 flex-wrap">
                                            {product.sizes.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSelectedSize(s)}
                                                    className={`px-8 py-2 border rounded ${selectedSize === s ? "border-primary-700 bg-primary-700 text-white" : "border-zinc-300"}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Planta: solo si el admin vinculó plantas reales del catálogo */}
                                {hasPlantOptions && (
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Elige una planta <span className="font-normal text-zinc-400">(opcional)</span>:</p>
                                        <div className="flex gap-4 flex-wrap">
                                            {product.plantOptions.map(p => (
                                                <button
                                                    key={p._id}
                                                    onClick={() => setSelectedPlant(prev => prev?._id === p._id ? null : p)}
                                                    disabled={p.stock <= 0}
                                                    title={p.stock <= 0 ? 'Sin existencias por el momento' : undefined}
                                                    className={`px-8 py-2 border rounded transition-colors ${selectedPlant?._id === p._id
                                                            ? "border-primary-700 bg-primary-700 text-white"
                                                            : "border-zinc-300"
                                                        } ${p.stock <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                                                >
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedPlant?._id && (
                                            <p className="text-xs text-zinc-500 mt-2">
                                                Se agregará por separado a tu carrito: {selectedPlant.name} (${Number(selectedPlant.price).toFixed(2)} c/u)
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Vela: solo si el admin vinculó velas reales del catálogo
                                    (ej. esta misma maceta también se vende con vela) */}
                                {hasCandleOptions && (
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Elige una vela <span className="font-normal text-zinc-400">(opcional)</span>:</p>
                                        <div className="flex gap-4 flex-wrap">
                                            {product.candleOptions.map(c => (
                                                <button
                                                    key={c._id}
                                                    onClick={() => setSelectedCandle(prev => prev?._id === c._id ? null : c)}
                                                    disabled={c.stock <= 0}
                                                    title={c.stock <= 0 ? 'Sin existencias por el momento' : undefined}
                                                    className={`px-8 py-2 border rounded transition-colors ${selectedCandle?._id === c._id
                                                            ? "border-primary-700 bg-primary-700 text-white"
                                                            : "border-zinc-300"
                                                        } ${c.stock <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                                                >
                                                    {c.name}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedCandle?._id && (
                                            <p className="text-xs text-zinc-500 mt-2">
                                                Se agregará por separado a tu carrito: {selectedCandle.name} (${Number(selectedCandle.price).toFixed(2)} c/u)
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Color: solo si el admin definió opciones */}
                                {hasColorOptions && (
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Elige un color:</p>
                                        <div className="flex gap-3">
                                            {product.colorOptions.map(c => (
                                                <div
                                                    key={c.name}
                                                    onClick={() => setSelectedColor(c.name)}
                                                    title={c.name}
                                                    style={{ backgroundColor: c.hex }}
                                                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${selectedColor === c.name ? "border-primary-700" : "border-transparent"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Selector de cantidad */}
                            {product.stock > 0 && (
                                <div className="mt-6 flex items-center gap-3">
                                    <span className="text-sm font-semibold">Cantidad:</span>
                                    <div className="flex items-center border border-zinc-300 rounded-md overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="px-4 font-semibold">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                            className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <span className="text-xs text-zinc-400">{product.stock} disponibles</span>
                                </div>
                            )}

                            {/* Acciones: Carrito + Wishlist */}
                            <div className="flex gap-4 mt-4">
                                <button
                                    disabled={product.stock <= 0 || addingToCart}
                                    onClick={async () => {
                                        setAddingToCart(true);
                                        try {
                                            await addToCart(product._id, 'maceta', quantity, hasColorOptions ? selectedColor : null);

                                            // Si el cliente eligió una planta y/o una vela real para
                                            // esta maceta, se agregan también como su propio producto
                                            // en el carrito (así sí cuentan en stock, en la orden y en
                                            // "más vendidos").
                                            const extrasElegidos = [];
                                            if (selectedPlant?._id) extrasElegidos.push({ item: selectedPlant, tipo: 'planta' });
                                            if (selectedCandle?._id) extrasElegidos.push({ item: selectedCandle, tipo: 'vela' });

                                            if (extrasElegidos.length > 0) {
                                                const nombresAgregados = [];
                                                const nombresFallidos = [];
                                                for (const { item, tipo } of extrasElegidos) {
                                                    try {
                                                        await addToCart(item._id, tipo, quantity);
                                                        nombresAgregados.push(item.name);
                                                    } catch (extraErr) {
                                                        nombresFallidos.push(item.name);
                                                    }
                                                }
                                                toast.success(`Maceta${nombresAgregados.length > 0 ? ' y ' + nombresAgregados.join(', ') : ''} agregado${nombresAgregados.length > 0 ? 's' : ''} al carrito`);
                                                if (nombresFallidos.length > 0) {
                                                    toast.error(`No se pudo agregar: ${nombresFallidos.join(', ')}`);
                                                }
                                            } else {
                                                toast.success('Producto agregado al carrito');
                                            }
                                        } catch (err) {
                                            if (err.message?.includes('sesión')) {
                                                toast.error('Inicia sesión para agregar al carrito');
                                                navigate('/login');
                                            } else {
                                                toast.error(err.message || 'No se pudo agregar al carrito');
                                            }
                                        } finally {
                                            setAddingToCart(false);
                                        }
                                    }}
                                    className="flex-grow bg-primary-700 text-white py-4 rounded-md font-bold hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {product.stock > 0 ? (addingToCart ? 'Agregando...' : 'Agregar al carrito') : 'Agotado'}
                                </button>
                                <div className="flex">
                                    <button
                                        disabled={togglingFav}
                                        onClick={async () => {
                                            setTogglingFav(true);
                                            try {
                                                await toggleFavorite(product._id, 'maceta');
                                            } catch (err) {
                                                if (err.message?.includes('sesión')) {
                                                    toast.error('Inicia sesión para guardar productos');
                                                    navigate('/login');
                                                } else {
                                                    toast.error(err.message || 'No se pudo actualizar tu wishlist');
                                                }
                                            } finally {
                                                setTogglingFav(false);
                                            }
                                        }}
                                        className={`p-4 border rounded-l-md transition-colors disabled:opacity-50 ${isFavorite('maceta', product._id) ? "border-red-500 bg-red-50" : "border-zinc-300 hover:bg-zinc-50"}`}
                                    >
                                        <Heart size={24} className={isFavorite('maceta', product._id) ? "fill-red-500 text-red-500" : "text-zinc-600"} />
                                    </button>
                                    <SaveToListMenu productId={product._id} productType="maceta" />
                                </div>
                            </div>

                            {/* Personalización -- solo si el admin marcó esta maceta como
                                personalizable (ej. texto o algo en la base) */}
                            {product.isCustomizable && (
                                <div className="mt-6 p-4 border border-primary-700/20 bg-primary-700/5 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Sparkles size={20} className="text-primary-700 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-primary-700">¿Quieres personalizarla?</p>
                                            <p className="text-xs text-zinc-600 mt-1">
                                                Esta maceta se puede personalizar (ej. un texto o un detalle en la base). Cuéntanos qué quieres y nos pondremos en contacto contigo.
                                            </p>
                                            <button
                                                onClick={() => setShowCustomizeModal(true)}
                                                className="mt-3 text-sm font-semibold text-primary-700 underline hover:no-underline"
                                            >
                                                Pedir personalización
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reseñas reales de clientes */}
                    {reviewsData.count > 0 && (
                        <div className="mt-16 max-w-3xl">
                            <h2 className="text-2xl font-bold text-primary-700 mb-6">
                                Reseñas ({reviewsData.count})
                            </h2>
                            <div className="space-y-4">
                                {reviewsData.reviews.map((r) => (
                                    <div key={r._id} className="border border-zinc-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-sm text-zinc-800">{r.clientName}</span>
                                            <span className="text-xs text-zinc-400">
                                                {new Date(r.createdAt).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {r.isCustomized && (
                                            <span className="inline-block mb-1 text-[10px] font-semibold text-primary-700 bg-primary-700/5 px-1.5 py-0.5 rounded">✎ Personalizado</span>
                                        )}
                                        <div className="text-yellow-400 text-xs mb-2">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                                        <p className="text-sm text-zinc-600">{r.comment}</p>
                                        {r.image && (
                                            <img src={r.image} alt="Foto de la reseña" className="w-24 h-24 object-cover rounded-md mt-3" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal para pedir la personalización */}
            {showCustomizeModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="min-h-screen flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-black/30"
                            onClick={() => !submittingCustomize && setShowCustomizeModal(false)}
                        />
                        <div className="relative bg-surface rounded-lg shadow-xl w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-primary-700">Pedir personalización</h3>
                                <button onClick={() => setShowCustomizeModal(false)} className="text-zinc-400 hover:text-zinc-700">
                                    <X size={20} />
                                </button>
                            </div>

                            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">¿Qué quieres que le pongamos?</label>
                            <textarea
                                value={customizeDescription}
                                onChange={(e) => setCustomizeDescription(e.target.value)}
                                placeholder="Ej: que diga 'Familia García' en la base, en letra cursiva"
                                rows={4}
                                maxLength={500}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-700/30 text-sm resize-none"
                            />

                            <label className="block text-sm font-semibold text-zinc-700 mt-4 mb-1.5">
                                Imagen de referencia <span className="text-zinc-400 font-normal">(opcional)</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCustomizeImage(e.target.files?.[0] || null)}
                                className="w-full text-sm text-zinc-600"
                            />

                            <button
                                onClick={handleEnviarPersonalizacion}
                                disabled={submittingCustomize}
                                className="w-full mt-6 bg-primary-700 text-white py-3 rounded-md font-bold hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingCustomize ? 'Enviando...' : 'Enviar solicitud'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
