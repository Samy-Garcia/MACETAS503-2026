import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ImageOff } from "lucide-react";
import ProfileHeader from "../components/ProfileHeader";
import { ProfileContext } from "../context/ProfileContext.jsx";
import { getMyLists } from "../api/wishlistApi";

export default function WishlistProfile() {

    useEffect(() => {
    document.title = "Mis Listas | Macetas503";
  }, []);

    const navigate = useNavigate();
    const { avatar } = useContext(ProfileContext);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getMyLists();
                setLists(data);
            } catch (err) {
                setError(err.message || 'No se pudieron cargar tus listas.');
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    return (
        <div className="w-full min-h-screen bg-[#f9f9f9] font-sans text-zinc-800 pb-12">
            <ProfileHeader avatar={avatar} />

            <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Wishlist</h1>
                        <p className="text-zinc-500 mt-1">Explora tus listas de deseos.</p>
                    </div>
                    <button
                        onClick={() => navigate("/wishlist")}
                        className="text-xs font-semibold text-primary-700 hover:underline"
                    >
                        Ver todas
                    </button>
                </div>

                {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                <section>
                    <h2 className="text-xl font-bold text-zinc-900 mb-4">Mis Wishlists ({lists.length})</h2>

                    {loading ? (
                        <div className="text-center text-zinc-400 py-10">Cargando...</div>
                    ) : lists.length === 0 ? (
                        <div className="text-center text-zinc-400 py-10 bg-surface rounded-lg border border-zinc-200">
                            Todavía no tienes ninguna lista guardada.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {lists.map((list) => (
                                <div key={list._id} className="bg-surface p-4 border border-zinc-200 rounded-lg flex items-center justify-between shadow-xs">
                                    <div className="flex gap-2">
                                        {list.previewImages.length > 0 ? (
                                            list.previewImages.slice(0, 2).map((img, idx) => (
                                                <div key={idx} className="w-16 h-16 rounded overflow-hidden bg-zinc-100">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="w-16 h-16 bg-zinc-100 rounded flex items-center justify-center text-zinc-300">
                                                <ImageOff size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <h3 className="font-semibold text-zinc-900">{list.name}</h3>
                                        <span className="text-xs text-zinc-500 mb-2">{list.count} Producto{list.count !== 1 ? 's' : ''}</span>
                                        <button
                                            onClick={() => navigate(`/wishlist/${list._id}`)}
                                            className="text-xs border border-zinc-300 px-4 py-1.5 rounded hover:bg-zinc-50 transition-colors"
                                        >
                                            Ver Lista
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}
