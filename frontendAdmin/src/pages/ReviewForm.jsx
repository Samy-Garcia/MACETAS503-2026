import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // 1. Importamos useNavigate
import Swal from "sweetalert2";
import { Camera } from "lucide-react";
import ProfileHeader from "../components/ProfileHeader";
import fotoPerfil from "../assets/profile.jpeg";
import macetaImg from "../assets/maceta-hexagonal.jpg";

export default function ReviewForm() {
    const navigate = useNavigate(); // 2. Inicializamos el hook
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState(""); // Estado para el comentario
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handlePublish = async () => {
        // 3. Validación de campos vacíos
        if (rating === 0 || comment.trim() === "" || !selectedImage) {
            Swal.fire({
                title: "Campos incompletos",
                text: "Por favor, asegúrate de calificar, escribir un comentario y subir una foto antes de publicar.",
                icon: "warning",
                confirmButtonText: 'Aceptar', confirmButtonColor: "#064225",
            });
            return;
        }

        // 4. Lanzar alerta y redirigir al cerrar
        const result = await Swal.fire({
            title: "¡Reseña publicada!",
            text: "Gracias por compartir tu experiencia con nuestra comunidad.",
            icon: "success",
            confirmButtonColor: "#064225",
            confirmButtonText: "Aceptar"
        });

        if (result.isConfirmed) {
            navigate("/resenas"); // Ajusta esta ruta a tu sección principal de reseñas
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#f1f1f1] font-sans text-zinc-800 pb-12">
            <ProfileHeader avatar={fotoPerfil} />

            <main className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#064225] tracking-tight">Selecciona un Producto para Reseña</h1>
                    <p className="text-zinc-500 mt-2">Tu opinión ayuda a nuestra comunidad a crecer.</p>
                </div>

                <div className="bg-white p-4 border border-zinc-200 rounded-lg flex items-center gap-4 shadow-sm">
                    <img src={macetaImg} alt="Producto" className="w-20 h-20 object-cover rounded" />
                    <div>
                        <h3 className="font-bold text-zinc-900">Maceta Hexagonal</h3>
                        <p className="text-xs text-zinc-500">Comprado: 8 Mayo 2026</p>
                    </div>
                </div>

                <div className="bg-white p-6 border border-zinc-200 rounded-lg text-center shadow-sm">
                    <h3 className="font-semibold text-zinc-900 mb-4">¿Cómo calificarías este producto?</h3>
                    <div className="flex justify-center gap-2 text-3xl cursor-pointer">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} onClick={() => setRating(star)} className={star <= rating ? "text-yellow-400" : "text-zinc-300"}>
                                ★
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">Tu comentario</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full h-32 p-4 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#064225]"
                        placeholder="¿Qué es lo que mas te gusta de tu nueva adquisición?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">Subir foto</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="w-40 h-40 border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center text-zinc-400 hover:border-[#064225] cursor-pointer bg-white overflow-hidden"
                    >
                        {selectedImage ? (
                            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <Camera className="mb-2" size={32} />
                                <span className="text-xs font-semibold">Añadir</span>
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={handlePublish}
                    className="w-full bg-[#064225] text-white py-4 rounded-lg font-bold hover:bg-[#04331c] transition-colors"
                >
                    Publicar Reseña
                </button>
            </main>
        </div>
    );
}