import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Star, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { getCandleById } from "../api/candlesApi";
import { getOffers } from "../api/offersApi";
import { getProductReviews } from "../api/reviewsApi";
import { CartContext } from "../context/CartContext.jsx";
import { WishlistContext } from "../context/WishlistContext.jsx";
import SaveToListMenu from "../components/SaveToListMenu";
import ProductGallery from "../components/ProductGallery";
import Footer from "../components/Footer";

export default function DetalleVela() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    useEffect(() => {
        document.title = product?.name ? `${product.name} | Macetas503` : "Vela | Macetas503";
    }, [product]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedScent, setSelectedScent] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [offer, setOffer] = useState(null);
    const [reviewsData, setReviewsData] = useState({ average: 0, count: 0, reviews: [] });
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const { addToCart } = useContext(CartContext);
    const { isFavorite, toggleFavorite } = useContext(WishlistContext);
    const [togglingFav, setTogglingFav] = useState(false);

    useEffect(() => {
        const cargarProducto = async () => {
            setLoading(true);
            setError('');
            try {
                const [data, offersData, reviewsResult] = await Promise.all([getCandleById(id), getOffers(), getProductReviews('vela', id)]);
                setReviewsData(reviewsResult);
                setProduct(data);

                const matchingOffer = offersData.find(
                    o => o.productType === 'vela' && o.status && String(o.productId) === String(id)
                );
                setOffer(matchingOffer || null);

                if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
                if (data.scents && data.scents.length > 0) setSelectedScent(data.scents[0]);
                if (data.colorOptions && data.colorOptions.length > 0) setSelectedColor(data.colorOptions[0].name);
            } catch (err) {
                setError(err.message || 'No se pudo cargar el producto.');
            } finally {
                setLoading(false);
            }
        };

        if (id) cargarProducto();
    }, [id]);

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
                    onClick={() => navigate('/velas')}
                    className="px-6 py-2 bg-primary-700 text-white rounded-md font-bold"
                >
                    Volver a Velas
                </button>
            </div>
        );
    }

    const hasSizes = product.sizes && product.sizes.length > 0;
    const hasScents = product.scents && product.scents.length > 0;
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

                            <div className="mt-6 space-y-6">
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

                                {hasScents && (
                                    <div>
                                        <p className="text-sm font-semibold mb-2">Elige un aroma:</p>
                                        <div className="flex gap-4 flex-wrap">
                                            {product.scents.map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSelectedScent(s)}
                                                    className={`px-8 py-2 border rounded ${selectedScent === s ? "border-primary-700 bg-primary-700 text-white" : "border-zinc-300"}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

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

                            <div className="flex gap-4 mt-4">
                                <button
                                    disabled={product.stock <= 0 || addingToCart}
                                    onClick={async () => {
                                        setAddingToCart(true);
                                        try {
                                            await addToCart(product._id, 'vela', quantity, hasColorOptions ? selectedColor : null);
                                            toast.success('Producto agregado al carrito');
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
                                                await toggleFavorite(product._id, 'vela');
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
                                        className={`p-4 border rounded-l-md transition-colors disabled:opacity-50 ${isFavorite('vela', product._id) ? "border-red-500 bg-red-50" : "border-zinc-300 hover:bg-zinc-50"}`}
                                    >
                                        <Heart size={24} className={isFavorite('vela', product._id) ? "fill-red-500 text-red-500" : "text-zinc-600"} />
                                    </button>
                                    <SaveToListMenu productId={product._id} productType="vela" />
                                </div>
                            </div>
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

            <Footer />
        </div>
    );
}
