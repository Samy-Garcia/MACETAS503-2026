import { useState, useEffect } from "react";
import { ImageOff } from "lucide-react";

// Muestra la galería de un producto: miniaturas apiladas a la izquierda +
// una imagen grande a la derecha que cambia al hacer click en una miniatura.
// Si el producto todavía no tiene "images" (productos de antes de este
// cambio), cae de vuelta a mostrar solo "coverImage" como imagen única.
export default function ProductGallery({ images, coverImage, name }) {
    const urls = images && images.length > 0
        ? images.map(img => img.url)
        : (coverImage ? [coverImage] : []);

    const [selected, setSelected] = useState(0);

    // Si cambia el producto (navegación entre productos), reiniciamos a la primera imagen
    useEffect(() => {
        setSelected(0);
    }, [images, coverImage]);

    const activeUrl = urls[selected];

    return (
        <div className="flex gap-4">
            {urls.length > 1 && (
                <div className="flex flex-col gap-3 shrink-0">
                    {urls.map((url, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setSelected(index)}
                            className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                                index === selected ? 'border-primary-700' : 'border-transparent hover:border-zinc-300'
                            }`}
                        >
                            <img
                                src={url}
                                alt={`${name} - vista ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            <div className="flex-grow h-[32rem] bg-neutral-100 rounded-md overflow-hidden flex items-center justify-center">
                {activeUrl ? (
                    <img
                        src={activeUrl}
                        alt={name}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                        className="w-full h-full object-cover"
                    />
                ) : null}
                <div
                    className="w-full h-full items-center justify-center text-neutral-300"
                    style={{ display: activeUrl ? 'none' : 'flex' }}
                >
                    <ImageOff size={64} />
                </div>
            </div>
        </div>
    );
}
