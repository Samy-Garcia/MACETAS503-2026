import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, MessageSquare, Phone, Mail } from "lucide-react";
import Footer from "../components/Footer";
import Banner from "../assets/bannerMacetas.jpg"

export default function Home() {
  // Estado para los filtros de "Más vendidos"
  const [activeTab, setActiveTab] = useState("MACETAS");

  // Mock de productos para "Más vendidos"
  const bestSellers = [
    { id: 1, name: "Maceta redonda de arcilla", price: "$12.00", rating: "4.5", img: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80", type: "MACETAS" },
    { id: 2, name: "Maceta blanca de piso", price: "$18.00", rating: "4.8", img: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=500&q=80", type: "MACETAS" },
    { id: 3, name: "Maceta para interiores", price: "$10.00", rating: "4.2", img: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=500&q=80", type: "MACETAS" },
    { id: 4, name: "Maceta colgante minimalista", price: "$15.00", rating: "4.6", img: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=500&q=80", type: "MACETAS" }
  ];

  // Mock de productos para "Nuevos Productos"
  const newProducts = [
    { id: 5, name: "Digital Gift Card", price: "$25.00", rating: "5.0", img: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=500&q=80", isGiftCard: true },
    { id: 6, name: "Macetitas de Caritas", price: "$14.00", rating: "4.9", img: "https://images.unsplash.com/photo-1535134265089-2eb48215584e?auto=format&fit=crop&w=500&q=80" },
    { id: 7, name: "Macetas Estilo Cubo de Cristal", price: "$22.00", rating: "4.7", img: "https://images.unsplash.com/photo-1520412098697-663f45ac555b?auto=format&fit=crop&w=500&q=80" }
  ];

  // Mock de testimonios ("Clientes Felices")
  const testimonials = [
    { id: 1, name: "Mariela Martinez", date: "Hace 2 semanas", text: "Me encantó la maceta de arcilla, el empaque vino super protegido y llegó antes de tiempo a mi casa. Excelente servicio.", rating: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" },
    { id: 2, name: "Zulma Cruz", date: "Hace 1 mes", text: "Compré tres velas aromáticas y huelen riquísimo, el cuarto se impregna super rápido. Recomiendo al 100%.", rating: 5, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" },
    { id: 3, name: "Roberto Flores", date: "Hace 3 días", text: "Excelente atención al cliente, me resolvieron unas dudas sobre el cuidado de mis plantas de inmediato por WhatsApp.", rating: 5, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80" },
    { id: 4, name: "Jason Castro", date: "Hace 1 semana", text: "La Gift Card digital es un regalazo, se la mandé a mi madre por su cumpleaños y le fascinó poder elegir sus propias macetas.", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" }
  ];

  return (
    <div className="w-full min-h-screen bg-[#fcfdfc] font-sans antialiased text-zinc-800 selection:bg-[#064225]/10 selection:text-[#064225]">


      {/* ================= HERO BANNER PRINCIPAL ================= */}
      <div className="w-full h-[520px] relative overflow-hidden bg-zinc-200">
        <img
          src={Banner}
          alt="Estantería con Macetas y Plantas organizadas"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* ================= CONTENIDO CENTRAL ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-20">

        {/* 1. MÁS VENDIDOS */}
        <section className="w-full flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
            <h2 className="text-2xl font-bold text-[#064225] tracking-tight">Más vendidos</h2>
            <div className="flex flex-wrap items-center gap-2">
              {["MACETAS", "VELAS", "PA REGALOS", "COMBOS"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer tracking-wider
                    ${activeTab === tab ? "bg-[#064225] text-white shadow-md" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button className="p-2 rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-700 bg-white shadow-xs cursor-pointer"><ChevronLeft size={16} /></button>
              <button className="p-2 rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-700 bg-white shadow-xs cursor-pointer"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestSellers.map((prod) => (
              <div key={prod.id} className="group bg-white rounded-xl overflow-hidden flex flex-col transition-all duration-300">
                <div className="w-full aspect-[4/5] bg-zinc-50 relative rounded-xl overflow-hidden mb-3 shadow-xs border border-zinc-100">
                  <img src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold text-zinc-800 shadow-xs">
                    <Star size={10} className="fill-amber-400 text-amber-400" /> {prod.rating}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 px-1">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Macetas</span>
                  <h3 className="text-sm font-semibold text-[#064225] tracking-tight line-clamp-1 group-hover:underline">{prod.name}</h3>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">{prod.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. COLECCIONES */}
        <section className="w-full flex flex-col gap-6">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="text-2xl font-bold text-[#064225] tracking-tight">Colecciones</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "MACETAS", img: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80" },
              { title: "VELAS", img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80" },
              { title: "PLANTAS", img: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=400&q=80" },
              { title: "COMBOS", img: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=400&q=80" }
            ].map((col) => (
              <div key={col.title} className="w-full aspect-square relative rounded-xl overflow-hidden group cursor-pointer shadow-xs border border-zinc-100">
                <img src={col.img} alt={col.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="font-bold text-base tracking-widest uppercase">{col.title}</h3>
                  <span className="text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium tracking-wide">Ver más →</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. AYUDA */}
        <section className="w-full bg-[#eef1ee] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 border border-zinc-200/50 shadow-xs">
          <div className="flex flex-col gap-2 max-w-sm text-left">
            <h2 className="text-2xl font-bold text-[#064225] tracking-tight">¿Necesitas ayuda?</h2>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              Tu confianza es nuestra prioridad. ¿No estás seguro de qué plantas funcionarán en tu hogar? ¿Nuevo en la jardinería o necesitas consejos? Contáctanos, estamos aquí para ayudarte.
            </p>
          </div>

          {/* Contenedor agrupado y balanceado de las 3 tarjetas */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
            <div className="flex flex-col items-center justify-center text-center bg-white border border-zinc-200/60 rounded-xl px-5 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] w-full sm:w-[130px] min-h-[105px]">
              <MessageSquare size={20} className="text-[#064225] mb-2" />
              <span className="text-xs font-bold text-[#064225] mb-0.5">Chat</span>
              <span className="text-[10px] text-zinc-400 font-normal leading-tight">Habla con un experto</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center bg-white border border-zinc-200/60 rounded-xl px-5 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] w-full sm:w-[130px] min-h-[105px]">
              <Phone size={20} className="text-[#064225] mb-2" />
              <span className="text-xs font-bold text-[#064225] mb-0.5">Llamada</span>
              <span className="text-[10px] text-zinc-400 font-normal leading-tight">Llama a un especialista</span>
            </div>

            <div className="flex flex-col items-center justify-center text-center bg-white border border-zinc-200/60 rounded-xl px-5 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] w-full sm:w-[130px] min-h-[105px]">
              <Mail size={20} className="text-[#064225] mb-2" />
              <span className="text-xs font-bold text-[#064225] mb-0.5">Email</span>
              <span className="text-[10px] text-zinc-400 font-normal leading-tight">Envíanos un mensaje</span>
            </div>
          </div>
        </section>

        {/* 4. NUEVOS PRODUCTOS */}
        <section className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h2 className="text-2xl font-bold text-[#064225] tracking-tight">Nuevos Productos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newProducts.map((prod) => (
              <div key={prod.id} className="group bg-white rounded-xl overflow-hidden flex flex-col transition-all duration-300">
                <div className="w-full aspect-[4/5] bg-zinc-50 relative rounded-xl overflow-hidden mb-3 shadow-xs border border-zinc-100">
                  <img src={prod.img} alt={prod.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  {prod.isGiftCard && <div className="absolute top-3 left-3 bg-[#064225] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">Mas Venta</div>}
                </div>
                <div className="flex flex-col gap-0.5 px-1">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Macetas</span>
                  <h3 className="text-sm font-semibold text-[#064225] tracking-tight line-clamp-1">{prod.name}</h3>
                  <p className="text-xs font-bold text-zinc-900 mt-0.5">{prod.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CLIENTES FELICES */}
        <section className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h2 className="text-2xl font-bold text-[#064225] tracking-tight">Clientes Felices</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-5 flex flex-col gap-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-normal">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-zinc-100 pt-3 mt-auto">
                  <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#064225]">{t.name}</span>
                    <span className="text-[10px] text-zinc-400">{t.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
