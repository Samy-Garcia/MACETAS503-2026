import { useState, useEffect } from "react";
import { Plus, ImageOff, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getMyLists, createList } from "../api/wishlistApi";

export default function Wishlist() {

    useEffect(() => {
        document.title = "Lista de Deseos | Macetas503";
    }, []);


    const navigate = useNavigate();
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [creating, setCreating] = useState(false);

    const cargarListas = async () => {
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

    useEffect(() => {
        cargarListas();
    }, []);

    const handleCreateNewList = async () => {
        if (!newListName.trim()) return;
        setCreating(true);
        try {
            await createList(newListName.trim());
            setNewListName('');
            setShowCreateModal(false);
            toast.success('Lista creada');
            cargarListas();
        } catch (err) {
            toast.error(err.message || 'No se pudo crear la lista.');
        } finally {
            setCreating(false);
        }
    };

    const handleViewList = (listId) => {
        navigate(`/wishlist/${listId}`);
    };

    return (
        <div className="w-full min-h-screen bg-page font-sans antialiased text-zinc-800 flex flex-col justify-between">
            <div>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-zinc-200/60 pb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
                                Listas Guardadas
                            </h1>
                            <p className="text-xs text-zinc-400 font-medium mt-1">
                                Organiza y consulta tus colecciones preferidas.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary-700 text-white text-xs font-semibold px-5 py-2.5 rounded-md hover:bg-primary-800 transition-colors cursor-pointer shadow-sm tracking-wide flex items-center gap-2 w-fit"
                        >
                            <Plus size={16} />
                            Crear Nueva Lista
                        </button>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

                    {loading ? (
                        <div className="text-center text-zinc-400 py-16">Cargando...</div>
                    ) : lists.length === 0 ? (
                        <div className="text-center text-zinc-400 py-16 border border-zinc-200 rounded-xl">
                            Todavía no tienes ninguna lista. Guarda un producto con el ❤️ o crea una lista nueva.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {lists.map((list) => (
                                <div
                                    key={list._id}
                                    className="bg-surface border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-primary-700/30 transition-all"
                                >
                                    <div>
                                        <h3 className="font-bold text-zinc-900 text-base mb-1">
                                            {list.name} {list.isDefault && <span className="text-[10px] text-zinc-400 font-normal">(principal)</span>}
                                        </h3>
                                        <p className="text-xs text-zinc-400 mb-4">{list.count} producto{list.count !== 1 ? 's' : ''}</p>

                                        <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100 mb-6 min-h-[112px]">
                                            {list.previewImages.length > 0 ? (
                                                list.previewImages.map((img, idx) => (
                                                    <div key={idx} className="h-24 rounded-md overflow-hidden bg-surface shadow-xs">
                                                        <img src={img} alt="Producto miniatura" className="w-full h-full object-cover" />
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 h-24 rounded-md bg-surface flex items-center justify-center text-zinc-300">
                                                    <ImageOff size={24} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleViewList(list._id)}
                                        className="w-full bg-[#183d29]/10 text-primary-700 font-semibold py-2 rounded text-xs hover:bg-primary-700 hover:text-white transition-all cursor-pointer text-center"
                                    >
                                        Ver Lista
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreateModal(false)} />
                    <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-zinc-900">Nueva lista</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-zinc-700">
                                <X size={18} />
                            </button>
                        </div>
                        <input
                            type="text"
                            autoFocus
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateNewList()}
                            placeholder="Ej: Regalos para Mamá"
                            className="w-full border border-zinc-300 rounded-lg p-3 text-sm focus:outline-none focus:border-primary-700 mb-4"
                        />
                        <button
                            onClick={handleCreateNewList}
                            disabled={creating || !newListName.trim()}
                            className="w-full bg-primary-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-800 disabled:opacity-50"
                        >
                            {creating ? 'Creando...' : 'Crear lista'}
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
