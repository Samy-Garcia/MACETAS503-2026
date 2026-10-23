import { useState } from "react";
import {
    Search, Heart, User, ShoppingBag,
    Heart as PassionIcon, ShieldCheck, Smile
} from "lucide-react";
import logoMacetas from "../assets/logoMacetas.png";
import Footer from "@/components/Footer";


export default function Nosotros() {
    // Estado para controlar la pestaña activa de la sección informativa inferior
    const [activeTab, setActiveTab] = useState("Misión");

    // Datos de las estadísticas del negocio
    const stats = [
        { value: "5 años", label: "Creando espacios verdes en hogares y oficinas" },
        { value: "+1,200", label: "Clientes satisfechos en todo el país" },
        { value: "4.8/5.0", label: "Calificación promedio en atención al cliente" },
        { value: "100%", label: "De clientes recomiendan nuestra tienda" }
    ];

    // Datos de los valores de el emprendimiento
    const values = [
        {
            title: "Pasión",
            desc: "Nos mueve el amor por la botánica y el diseño. Esa energía se nota en la selección de nuestras plantas y en el acabado único de cada maceta.",
            icon: <PassionIcon size={22} className="text-[#064225]" />
        },
        {
            title: "Dedicación",
            desc: "Nos aseguramos de que lo que llega a tu casa sea de calidad, duradero y saludable. Nos hacemos responsables de la confianza que pones en nosotros.",
            icon: <ShieldCheck size={22} className="text-[#064225]" />
        },
        {
            title: "Cariño",
            desc: "Atendemos, empacamos y cultivamos con amor. Creemos que las plantas que crecen con buena energía hacen que los hogares se sientan mejor.",
            icon: <Smile size={22} className="text-[#064225]" />
        }
    ];

    // Diccionario de textos para el conmutador de Misión, Visión e Historia
    const tabContent = {
        Misión: {
            title: "Llevar Vida y Frescura a tu Hogar, sin importar en qué lugar del mapa estés.",
            text: "En Macetas seleccionamos las mejores plantas y macetas de diseño para transformar tus espacios en refugios llenos de paz. Nos encargamos de que cada pieza llegue perfecta a tu puerta, uniendo nuestra pasión botánica con hogares de todo el mundo."
        },
        Visión: {
            title: "Convertirnos en el referente ecológico y de diseño de interiores favorito del país.",
            text: "Buscamos inspirar a las personas a reconectar con la naturaleza desde la comodidad de su entorno urbano, expandiendo nuestro catálogo con productos artesanales, sostenibles y de un valor estético excepcional que promuevan el bienestar diario."
        },
        Historia: {
            title: "Un proyecto que nació en el jardín de nuestra casa y creció gracias a ti.",
            text: "Iniciamos en 2021 como un pequeño taller experimental buscando la combinación perfecta entre concreto texturizado y plantas de interior. Hoy, gracias a una comunidad de más de mil plant-lovers, diseñamos y distribuimos vida a nivel nacional con la misma dedicación del primer día."
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#fcfdfc] font-sans antialiased text-zinc-800">



            {/* ================= HERO: DISEÑO NATURAL ================= */}
            <main className="w-full">
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col gap-6 text-left">
                        <h1 className="text-[42px] font-bold text-[#064225] leading-[1.1] tracking-tight">
                            Diseño natural para<br />cada rincón de tu hogar
                        </h1>
                        <p className="text-sm text-zinc-500 leading-relaxed max-w-xl font-normal">
                            Rodea tu espacio con macetas de concreto, souvenirs y productos de jardinería hechos con creatividad salvadoreña. En Macetas, llevamos diseño, naturaleza y comodidad hasta tu puerta.
                        </p>
                        <div>
                            <button className="bg-[#064225] text-white text-xs font-semibold px-6 py-3 rounded-md hover:bg-[#032d18] transition-colors cursor-pointer shadow-sm tracking-wide">
                                Compra ahora
                            </button>
                        </div>

                        {/* Tarjetas informativas de beneficios en fila */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 max-w-xl">
                            <div className="bg-zinc-100/70 p-5 rounded-xl border border-zinc-200/20">
                                <h4 className="text-xs font-bold text-zinc-900 mb-1">Clientes 100% Satisfechos</h4>
                                <p className="text-[11px] text-zinc-500 leading-normal font-normal">Nuestros clientes confían en nosotros y garantizamos una satisfacción del 100% en cada compra.</p>
                            </div>
                            <div className="bg-[#1e4631] text-white p-5 rounded-xl">
                                <h4 className="text-xs font-bold mb-1">Tarjetas de regalos</h4>
                                <p className="text-[11px] text-zinc-200/80 leading-normal font-normal">Regala naturaleza: una opción perfecta para cualquier amante de las plantas.</p>
                            </div>
                        </div>
                    </div>

                    {/* Imagen de la ventana rústica con flores */}
                    <div className="w-full flex justify-center lg:justify-end">
                        <div className="w-full max-w-md h-[450px] rounded-2xl overflow-hidden shadow-xs bg-zinc-100">
                            <img
                                src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80"
                                alt="Diseño de hogar rústico con plantas"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* ================= SECCIÓN ESTADÍSTICAS ================= */}
                <section className="w-full border-t border-b border-zinc-200/60 bg-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex flex-col gap-1 items-center px-2">
                                <span className="text-3xl font-extrabold text-[#064225] tracking-tight">{stat.value}</span>
                                <span className="text-[11px] text-zinc-400 font-medium max-w-[160px] leading-snug">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ================= SECCIÓN NUESTROS VALORES ================= */}
                <section className="w-full bg-[#1c3d2a] text-white py-20 text-center">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Nuestros Valores</h2>
                        <p className="text-xs text-zinc-300 font-light tracking-wide mb-14">Los pilares que guían todo lo que hacemos.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {values.map((val, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 text-left border border-zinc-800/10 shadow-sm flex flex-col gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                                        {val.icon}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <h3 className="text-base font-bold text-zinc-900 tracking-tight">{val.title}</h3>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-normal">{val.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ================= SECCIÓN MISIÓN, VISIÓN E HISTORIA ================= */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="flex flex-col gap-6 text-left">
                        <span className="text-[11px] font-bold text-[#064225] uppercase tracking-wider">Nuestra Misión</span>

                        {/* Conmutador Ovalado de Pestañas */}
                        <div className="flex items-center gap-2 bg-zinc-100/80 p-1 rounded-full w-fit border border-zinc-200/40">
                            {["Misión", "Visión", "Historia"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer tracking-wide
                    ${activeTab === tab
                                            ? "bg-[#064225] text-white shadow-xs"
                                            : "text-zinc-500 hover:text-zinc-800"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Contenido Cambiante Dinámico */}
                        <div className="flex flex-col gap-4 mt-2 min-h-[160px]">
                            <h3 className="text-2xl md:text-3xl font-bold text-[#064225] leading-snug tracking-tight italic">
                                "{tabContent[activeTab].title}"
                            </h3>
                            <p className="text-sm text-zinc-500 leading-relaxed font-normal">
                                {tabContent[activeTab].text}
                            </p>
                        </div>
                    </div>

                    {/* Imagen lateral de composición botánica */}
                    <div className="w-full flex justify-center lg:justify-end">
                        <div className="w-full max-w-md h-[400px] rounded-2xl overflow-hidden shadow-xs bg-zinc-100">
                            <img
                                src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80"
                                alt="Composición botánica y macetas de diseño"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />

        </div>
    );
}
