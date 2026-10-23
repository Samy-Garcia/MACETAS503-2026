import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import { Trash2, Edit2 } from "lucide-react";
import ProfileHeader from "../components/ProfileHeader";
import fotoPerfil from "../assets/profile.jpeg";
import macetaImg from "../assets/maceta-hexagonal.jpg";

export default function ReviewsProfile() {
    const navigate = useNavigate(); 

    // Datos simulados de reseñas
    const [reviews] = useState([
        { id: 1, product: "Maceta Hexagonal", date: "5 Mayo 2026", text: "Compré esta maceta y le dio otro flow al cuarto, se ve clean y la planta resalta brutal; si quieres subirle el nivel a tu espacio fácil, esta es la que es..." },
        { id: 2, product: "Maceta Hexagonal", date: "5 Mayo 2026", text: "Compré esta maceta y le dio otro flow al cuarto, se ve clean y la planta resalta brutal..." },
        { id: 3, product: "Maceta Hexagonal", date: "5 Mayo 2026", text: "Compré esta maceta y le dio otro flow al cuarto, se ve clean y la planta resalta brutal..." },
        { id: 4, product: "Maceta Hexagonal", date: "5 Mayo 2026", text: "Compré esta maceta y le dio otro flow al cuarto, se ve clean y la planta resalta brutal..." },
    ]);

    return (
        <div className="w-full min-h-screen bg-[#f1f1f1] font-sans text-zinc-800 pb-12">
            <ProfileHeader avatar={fotoPerfil} />

            <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">

                {/* Cabecera de Reseñas */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-[#064225] tracking-tight">Reseñas</h1>
                        <p className="text-zinc-500 mt-1">Tu opinión hace crecer nuestro jardín.</p>
                    </div>
                    {/* Botón con la navegación añadida */}
                    <button
                        onClick={() => navigate("/productoresena")}
                        className="flex items-center gap-2 bg-[#064225] text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[#04331c] transition-colors cursor-pointer"
                    >
                        <span>+</span> Nueva Reseña
                    </button>
                </div>

                {/* Contador de Mis Reseñas */}
                <h2 className="text-xl font-bold text-zinc-900 mt-4">Mis Reseñas ({reviews.length})</h2>

                {/* Grid de Reseñas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white border border-zinc-200 rounded-lg overflow-hidden flex shadow-sm">
                            <img src={macetaImg} alt={review.product} className="w-1/3 object-cover" />
                            <div className="p-5 flex flex-col justify-between w-2/3">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-zinc-900">{review.product}</h3>
                                        <span className="text-[10px] text-zinc-400">{review.date}</span>
                                    </div>
                                    <div className="text-yellow-400 text-xs my-1">★★★★★</div>
                                    <p className="text-xs text-zinc-600 leading-relaxed mt-2">
                                        {review.text} <span className="text-[#064225] font-semibold underline cursor-pointer">Ver más</span>
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button className="flex-1 flex items-center justify-center gap-2 border border-zinc-300 py-1.5 rounded text-xs font-semibold hover:bg-zinc-50">
                                        <Edit2 size={12} /> Editar
                                    </button>
                                    <button className="flex-1 flex items-center justify-center gap-2 border border-zinc-300 py-1.5 rounded text-xs font-semibold hover:bg-red-50 text-red-600 hover:border-red-200">
                                        <Trash2 size={12} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Paginación */}
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-full hover:bg-zinc-200">&lt;</button>
                    <button className="w-8 h-8 flex items-center justify-center bg-[#064225] text-white rounded-full font-semibold">1</button>
                    <button className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-full hover:bg-zinc-200">2</button>
                    <button className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-full hover:bg-zinc-200">&gt;</button>
                </div>

            </main>
        </div>
    );
}