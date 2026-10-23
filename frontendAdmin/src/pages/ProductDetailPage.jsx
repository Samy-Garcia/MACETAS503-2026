import React, { useState } from "react";
import { Search, Heart, User, ShoppingBag, Star } from "lucide-react";
import logoMacetas from "../assets/logoMacetas.png";

export default function DetalleProducto() {
    const [selectedSize, setSelectedSize] = useState("Pequeña");
    const [selectedPlant, setSelectedPlant] = useState("Suculenta");
    const [isWishlisted, setIsWishlistegiod] = useState(false); // Estado para el corazón

    return (
        <div className="w-full min-h-screen bg-[#fcfdfc] font-sans text-zinc-800">



            <main className="max-w-7xl mx-auto px-4 py-12">
                {/* Producto Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="w-20 h-20 bg-zinc-200 rounded-md" />)}
                        </div>
                        <div className="flex-grow h-96 bg-zinc-200 rounded-md" />
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold text-[#064225]">Maceta Hexagonal</h1>
                        <div className="flex items-center gap-2 my-2 text-yellow-400">
                            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                            <span className="text-xs text-zinc-500 underline">6 reseñas</span>
                        </div>
                        <p className="text-2xl font-bold">$3.00</p>

                        <div className="mt-6 space-y-6">
                            {/* Selectores (Size, Plant, Color) */}
                            <div>
                                <p className="text-sm font-semibold mb-2">Elige un tamaño:</p>
                                <div className="flex gap-4">
                                    {["Pequeña", "Mediana"].map(s => (
                                        <button key={s} onClick={() => setSelectedSize(s)} className={`px-8 py-2 border rounded ${selectedSize === s ? "border-[#064225] bg-[#064225] text-white" : "border-zinc-300"}`}>{s}</button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-2">Elige una planta:</p>
                                <div className="flex gap-4">
                                    {["Cactus", "Suculenta"].map(p => (
                                        <button key={p} onClick={() => setSelectedPlant(p)} className={`px-8 py-2 border rounded ${selectedPlant === p ? "border-[#064225] bg-[#064225] text-white" : "border-zinc-300"}`}>{p}</button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-2">Elige un color:</p>
                                <div className="flex gap-3">
                                    {["bg-black", "bg-zinc-400", "bg-[#064225]"].map(c => <div key={c} className={`w-8 h-8 rounded-full ${c} cursor-pointer border`} />)}
                                </div>
                            </div>
                        </div>

                        {/* Acciones: Carrito + Wishlist */}
                        <div className="flex gap-4 mt-8">
                            <button className="flex-grow bg-[#064225] text-white py-4 rounded-md font-bold hover:bg-[#032d18]">
                                Agregar al carrito
                            </button>
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className={`p-4 border rounded-md transition-colors ${isWishlisted ? "border-red-500 bg-red-50" : "border-zinc-300 hover:bg-zinc-50"}`}
                            >
                                <Heart size={24} className={isWishlisted ? "fill-red-500 text-red-500" : "text-zinc-600"} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Te podría interesar */}
                <section className="mt-20">
                    <h2 className="text-2xl font-bold mb-8">Te podría interesar</h2>
                    <div className="grid grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-2">
                                <div className="w-full h-64 bg-zinc-200 rounded-md" />
                                <p className="font-bold">Maceta Producto {i}</p>
                                <p>$3.00</p>
                                <button className="w-full bg-[#064225] text-white py-2 rounded">Agregar</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Reseñas Completas */}
                <section className="mt-20 border-t pt-10">
                    <h2 className="text-2xl font-bold mb-6">Reseñas de clientes</h2>
                    <div className="flex items-center gap-8 mb-10">
                        <div className="text-center"><span className="text-5xl font-bold text-[#064225]">5.0</span><p className="text-xs text-zinc-500">Basada en 20 reseñas</p></div>
                        <div className="flex-grow max-w-sm space-y-2">
                            {[5, 4, 3, 2, 1].map(n => <div key={n} className="flex items-center gap-3"><span className="text-xs w-3">{n}</span><div className="flex-grow h-3 bg-zinc-200 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 w-[80%]" /></div></div>)}
                        </div>
                    </div>
                    <div className="space-y-8">
                        {[1, 2].map((i) => (
                            <div key={i} className="border-b border-zinc-100 pb-8">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-300" />
                                    <div><p className="font-bold text-sm">Cliente Feliz {i}</p><div className="flex text-yellow-400">{[...Array(5)].map((_, j) => <Star key={j} size={12} fill="currentColor" />)}</div></div>
                                </div>
                                <p className="text-sm text-zinc-600">"El diseño es increíble, llegó en perfecto estado. Definitivamente volveré a comprar."</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="w-full bg-[#e9ebe9] mt-16 pt-16 pb-6 text-zinc-700 text-xs">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-10 mb-16">
                    <div><h4 className="font-bold text-[#064225] uppercase mb-5">Servicio al Cliente</h4><ul className="flex flex-col gap-3"><li>Preguntas frecuentes</li><li>Contactanos</li><li>Reembolsos</li></ul></div>
                    <div><h4 className="font-bold text-[#064225] uppercase mb-5">Macetas503</h4><ul className="flex flex-col gap-3"><li>Mi Cuenta</li><li>Nosotros</li></ul></div>
                    <div><h4 className="font-bold text-[#064225] uppercase mb-5">Recursos</h4><ul className="flex flex-col gap-3"><li>Mis Pedidos</li><li>Guía de cuidado</li></ul></div>
                    <div><h4 className="font-bold text-[#064225] mb-5">Mantente al Tanto</h4><input className="w-full p-2 mb-2 border rounded" placeholder="Correo..." /><button className="w-full bg-[#064225] text-white py-2 rounded">Suscribirse</button></div>
                </div>
            </footer>
        </div>
    );
}
