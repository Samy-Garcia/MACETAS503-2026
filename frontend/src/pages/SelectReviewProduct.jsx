import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ImageOff } from "lucide-react";
import ProfileHeader from "../components/ProfileHeader";
import { ProfileContext } from "../context/ProfileContext.jsx";
import { getReviewableItems } from "../api/reviewsApi";

export default function SelectReviewProduct() {

    useEffect(() => {
        document.title = "Mis reseñas | Macetas503";
    }, []);
    const navigate = useNavigate();
    const { avatar } = useContext(ProfileContext);
    const [filter, setFilter] = useState("Sin Reseñar");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getReviewableItems();
                setItems(data);
            } catch (err) {
                setError(err.message || 'No se pudieron cargar tus productos.');
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    const filteredItems = filter === "Sin Reseñar" ? items.filter(i => !i.reviewed) : items;

    return (
        <div className="w-full min-h-screen bg-page font-sans text-zinc-800 pb-12">
            <ProfileHeader avatar={avatar} />

            <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">

                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Selecciona un Producto para Reseña</h1>
                    <p className="text-zinc-500 mt-2">Selecciona uno de tus productos ya entregados para compartir tu experiencia.</p>
                </div>

                <div className="flex gap-4 justify-center mt-2">
                    {["Recientes", "Sin Reseñar"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-8 py-2 rounded-full text-sm font-semibold transition-all ${filter === f ? "bg-primary-700 text-white" : "bg-zinc-300 text-zinc-700 hover:bg-zinc-400"}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                {loading ? (
                    <div className="text-center text-zinc-400 py-16">Cargando...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center text-zinc-400 py-16 bg-surface rounded-lg border border-zinc-200">
                        {items.length === 0
                            ? 'Todavía no tienes pedidos entregados para reseñar.'
                            : '¡Ya dejaste reseña en todos tus productos entregados!'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        {filteredItems.map((item) => (
                            <div key={`${item.orderId}-${item.productId}`} className="bg-surface p-4 border border-zinc-200 rounded-lg shadow-sm flex flex-col">
                                <div className="relative">
                                    {item.productImage ? (
                                        <img src={item.productImage} alt={item.productName} className="w-full h-48 object-cover rounded-md" />
                                    ) : (
                                        <div className="w-full h-48 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-300">
                                            <ImageOff size={32} />
                                        </div>
                                    )}
                                    <span className="absolute top-2 left-2 bg-white/90 text-[10px] px-2 py-1 rounded font-medium text-zinc-600">
                                        Entregado: {new Date(item.deliveredAt).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>

                                <div className="mt-4 flex-grow">
                                    <h3 className="font-bold text-zinc-900">{item.productName}</h3>
                                    <p className="text-[11px] text-zinc-500 mt-1 capitalize">{item.productType}</p>
                                </div>

                                {item.reviewed ? (
                                    <span className="mt-4 w-full text-center bg-zinc-100 text-zinc-400 py-2 rounded text-xs font-semibold">
                                        Ya reseñado
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => navigate("/resenaform", { state: { item } })}
                                        className="mt-4 w-full bg-primary-700 text-white py-2 rounded text-xs font-semibold hover:bg-primary-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>✎</span> Escribir Reseña
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
