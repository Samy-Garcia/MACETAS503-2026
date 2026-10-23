import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit2, ImageOff } from "lucide-react";
import toast from "react-hot-toast";
import ProfileHeader from "../components/ProfileHeader";
import { ProfileContext } from "../context/ProfileContext.jsx";
import { getMyReviews, deleteReview } from "../api/reviewsApi";

export default function ReviewsProfile() {

    useEffect(() => {
    document.title = "Mis Reseñas | Macetas503";
  }, []);

    const navigate = useNavigate();
    const { avatar } = useContext(ProfileContext);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const cargarResenas = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getMyReviews();
            setReviews(data);
        } catch (err) {
            setError(err.message || 'No se pudieron cargar tus reseñas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarResenas();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta reseña?')) return;
        try {
            await deleteReview(id);
            setReviews(prev => prev.filter(r => r._id !== id));
            toast.success('Reseña eliminada');
        } catch (err) {
            toast.error(err.message || 'No se pudo eliminar la reseña.');
        }
    };

    return (
        <div className="w-full min-h-screen bg-page font-sans text-zinc-800 pb-12">
            <ProfileHeader avatar={avatar} />

            <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">

                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Reseñas</h1>
                        <p className="text-zinc-500 mt-1">Tu opinión hace crecer nuestro jardín.</p>
                    </div>
                    <button
                        onClick={() => navigate("/productoresena")}
                        className="flex items-center gap-2 bg-primary-700 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-primary-800 transition-colors cursor-pointer"
                    >
                        <span>+</span> Nueva Reseña
                    </button>
                </div>

                <h2 className="text-xl font-bold text-zinc-900 mt-4">Mis Reseñas ({reviews.length})</h2>

                {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                {loading ? (
                    <div className="text-center text-zinc-400 py-16">Cargando...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center text-zinc-400 py-16 bg-surface rounded-lg border border-zinc-200">
                        Todavía no has escrito ninguna reseña.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-surface border border-zinc-200 rounded-lg overflow-hidden flex shadow-sm">
                                {review.product?.image ? (
                                    <img src={review.product.image} alt={review.product?.name} className="w-1/3 object-cover" />
                                ) : (
                                    <div className="w-1/3 bg-zinc-100 flex items-center justify-center text-zinc-300">
                                        <ImageOff size={24} />
                                    </div>
                                )}
                                <div className="p-5 flex flex-col justify-between w-2/3">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-zinc-900">{review.product?.name || 'Producto eliminado'}</h3>
                                            <span className="text-[10px] text-zinc-400">
                                                {new Date(review.createdAt).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {review.isCustomized && (
                                            <span className="inline-block mt-1 text-[10px] font-semibold text-primary-700 bg-primary-700/5 px-1.5 py-0.5 rounded">✎ Personalizado</span>
                                        )}
                                        <div className="text-yellow-400 text-xs my-1">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                                        <p className="text-xs text-zinc-600 leading-relaxed mt-2">{review.comment}</p>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => navigate("/resenaform", { state: { review } })}
                                            className="flex-1 flex items-center justify-center gap-2 border border-zinc-300 py-1.5 rounded text-xs font-semibold hover:bg-zinc-50"
                                        >
                                            <Edit2 size={12} /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="flex-1 flex items-center justify-center gap-2 border border-zinc-300 py-1.5 rounded text-xs font-semibold hover:bg-red-50 text-red-600 hover:border-red-200"
                                        >
                                            <Trash2 size={12} /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
