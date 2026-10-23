import { useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import fotoPerfil from "../assets/profile.jpeg";

export default function WishlistProfile() {
    // Datos simulados para las listas
    const [wishlists] = useState([
        { id: 1, name: "Regalos para Mamá", count: 2, images: ["/path-a-img1.jpg", "/path-a-img2.jpg"] },
        { id: 2, name: "Regalos para Papá", count: 2, images: ["/path-b-img1.jpg", "/path-b-img2.jpg"] },
    ]);

    // Datos simulados para vistos recientemente
    const [recentItems] = useState([
        { id: 1, name: "Velas de árbol de Navidad", price: "$2.00", image: "/path-vela.jpg" },
        { id: 2, name: "Velas de Luna", price: "$2.50", image: "/path-luna.jpg" },
        { id: 3, name: "Macetas de Calabaza", price: "$3.00", image: "/path-calabaza.jpg" },
    ]);

    return (
        <div className="w-full min-h-screen bg-[#f9f9f9] font-sans text-zinc-800 pb-12">
            <ProfileHeader avatar={fotoPerfil} />

            <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

                {/* Cabecera Wishlist */}
                <div>
                    <h1 className="text-3xl font-bold text-[#064225] tracking-tight">Wishlist</h1>
                    <p className="text-zinc-500 mt-1">Explora tus listas de deseos.</p>
                </div>

                {/* Sección Mis Wishlists */}
                <section>
                    <h2 className="text-xl font-bold text-zinc-900 mb-4">Mis Wishlists ({wishlists.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {wishlists.map((list) => (
                            <div key={list.id} className="bg-white p-4 border border-zinc-200 rounded-lg flex items-center justify-between shadow-xs">
                                <div className="flex gap-2">
                                    {/* Espacio para miniaturas de productos */}
                                    <div className="w-16 h-16 bg-zinc-100 rounded"></div>
                                    <div className="w-16 h-16 bg-zinc-100 rounded"></div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <h3 className="font-semibold text-zinc-900">{list.name}</h3>
                                    <span className="text-xs text-zinc-500 mb-2">{list.count} Productos</span>
                                    <button className="text-xs border border-zinc-300 px-4 py-1.5 rounded hover:bg-zinc-50 transition-colors">
                                        Ver Lista
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sección Vistos Recientemente */}
                <section>
                    <h2 className="text-2xl font-bold text-[#064225] mb-6">Vistos Recientemente</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recentItems.map((item) => (
                            <div key={item.id} className="bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col">
                                <div className="h-48 bg-zinc-100 w-full"></div> {/* Imagen producto */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-zinc-900 text-sm">{item.name}</h3>
                                    <p className="text-zinc-600 text-sm mb-4">{item.price}</p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 text-sm border border-zinc-300 py-2 rounded hover:bg-zinc-50">Ver Producto</button>
                                        <button className="bg-[#064225] text-white px-3 py-2 rounded hover:bg-[#05351d]">+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}