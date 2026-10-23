import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Importamos useNavigate
import ProfileHeader from "../components/ProfileHeader";
import fotoPerfil from "../assets/profile.jpeg";
import macetaImg from "../assets/maceta-hexagonal.jpg";

export default function SelectReviewProduct() {
    const navigate = useNavigate(); // 2. Inicializamos el hook
    const [filter, setFilter] = useState("Recientes");
    const [products] = useState([1, 2, 3, 4, 5, 6]); // Simulando productos

    return (
        <div className="w-full min-h-screen bg-[#f1f1f1] font-sans text-zinc-800 pb-12">
            <ProfileHeader avatar={fotoPerfil} />

            <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">

                {/* Cabecera */}
                <div>
                    <h1 className="text-3xl font-bold text-[#064225] tracking-tight">Selecciona un Producto para Reseña</h1>
                    <p className="text-zinc-500 mt-2">Selecciona uno de tus productos comprados recientemente para compartir tu experiencia.</p>
                </div>

                {/* Filtros */}
                <div className="flex gap-4 justify-center mt-2">
                    {["Recientes", "Sin Reseñar"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-8 py-2 rounded-full text-sm font-semibold transition-all ${filter === f ? "bg-[#064225] text-white" : "bg-zinc-300 text-zinc-700 hover:bg-zinc-400"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Grid de Productos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    {products.map((item) => (
                        <div key={item} className="bg-white p-4 border border-zinc-200 rounded-lg shadow-sm flex flex-col">
                            <div className="relative">
                                <img src={macetaImg} alt="Producto" className="w-full h-48 object-cover rounded-md" />
                                <span className="absolute top-2 left-2 bg-white/90 text-[10px] px-2 py-1 rounded font-medium text-zinc-600">
                                    Comprado: 8 Mayo 2026
                                </span>
                            </div>

                            <div className="mt-4 flex-grow">
                                <h3 className="font-bold text-zinc-900">Maceta Hexagonal</h3>
                                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                                    Esta maceta hexagonal de concreto minimalista es el toque moderno y elegante que tus suculentas necesitan...
                                </p>
                            </div>

                            {/* 3. Agregamos el onClick aquí */}
                            <button
                                onClick={() => navigate("/resenaform")}
                                className="mt-4 w-full bg-[#064225] text-white py-2 rounded text-xs font-semibold hover:bg-[#04331c] transition-colors flex items-center justify-center gap-2"
                            >
                                <span>✎</span> Escribir Reseña
                            </button>
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