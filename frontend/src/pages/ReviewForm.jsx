import { useState, useRef, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { Camera, ImageOff } from "lucide-react";
import ProfileHeader from "../components/ProfileHeader";
import { ProfileContext } from "../context/ProfileContext.jsx";
import { createReview, updateReview } from "../api/reviewsApi";

export default function ReviewForm() {

    useEffect(() => {
        document.title = "Escribir reseña | Macetas503";
    }, []);
    const navigate = useNavigate();
    const location = useLocation();
    const { avatar } = useContext(ProfileContext);

    // Dos formas de llegar aquí: creando una reseña nueva (item) o editando una existente (review)
    const item = location.state?.item || null;
    const editingReview = location.state?.review || null;
    const isEditing = !!editingReview;

    const [rating, setRating] = useState(editingReview?.rating || 0);
    const [comment, setComment] = useState(editingReview?.comment || "");
    const [selectedImage, setSelectedImage] = useState(editingReview?.image || null);
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    const productName = isEditing ? editingReview.product?.name : item?.productName;
    const productImage = isEditing ? editingReview.product?.image : item?.productImage;

    if (!item && !editingReview) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-500 bg-page">
                <p>Elige primero un producto para reseñar.</p>
                <button onClick={() => navigate('/productoresena')} className="px-6 py-2 bg-primary-700 text-white rounded-md font-bold">
                    Elegir producto
                </button>
            </div>
        );
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setSelectedImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handlePublish = async () => {
        if (rating === 0 || comment.trim() === "") {
            Swal.fire({
                title: "Campos incompletos",
                text: "Por favor, califica y escribe un comentario antes de publicar.",
                icon: "warning",
                confirmButtonText: 'Aceptar', confirmButtonColor: "var(--color-primary-700)",
            });
            return;
        }

        setSaving(true);
        try {
            if (isEditing) {
                await updateReview(editingReview._id, { rating, comment, imageFile });
            } else {
                await createReview({
                    orderId: item.orderId,
                    productId: item.productId,
                    productType: item.productType,
                    rating,
                    comment,
                    imageFile
                });
            }

            const result = await Swal.fire({
                title: isEditing ? "¡Reseña actualizada!" : "¡Reseña publicada!",
                text: "Gracias por compartir tu experiencia con nuestra comunidad.",
                icon: "success",
                confirmButtonColor: "var(--color-primary-700)",
                confirmButtonText: "Aceptar"
            });

            if (result.isConfirmed) {
                navigate("/resenas");
            }
        } catch (err) {
            Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonText: 'Aceptar', confirmButtonColor: '#064225' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-page font-sans text-zinc-800 pb-12">
            <ProfileHeader avatar={avatar} />

            <main className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                        {isEditing ? 'Editar Reseña' : 'Escribe tu Reseña'}
                    </h1>
                    <p className="text-zinc-500 mt-2">Tu opinión ayuda a nuestra comunidad a crecer.</p>
                </div>

                <div className="bg-surface p-4 border border-zinc-200 rounded-lg flex items-center gap-4 shadow-sm">
                    {productImage ? (
                        <img src={productImage} alt="Producto" className="w-20 h-20 object-cover rounded" />
                    ) : (
                        <div className="w-20 h-20 rounded bg-zinc-100 flex items-center justify-center text-zinc-300">
                            <ImageOff size={24} />
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-zinc-900">{productName}</h3>
                        {!isEditing && (
                            <p className="text-xs text-zinc-500">Entregado: {new Date(item.deliveredAt).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        )}
                    </div>
                </div>

                <div className="bg-surface p-6 border border-zinc-200 rounded-lg text-center shadow-sm">
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
                        className="w-full h-32 p-4 border border-zinc-300 rounded-lg focus:outline-none focus:border-primary-700"
                        placeholder="¿Qué es lo que mas te gusta de tu nueva adquisición?"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">Subir foto (opcional)</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="w-40 h-40 border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center text-zinc-400 hover:border-primary-700 cursor-pointer bg-surface overflow-hidden"
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
                    disabled={saving}
                    className="w-full bg-primary-700 text-white py-4 rounded-lg font-bold hover:bg-primary-800 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Publicar Reseña')}
                </button>
            </main>
        </div>
    );
}
