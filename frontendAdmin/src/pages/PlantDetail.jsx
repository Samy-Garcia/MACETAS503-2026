import { useParams, useNavigate } from "react-router-dom"; // 1. Cambiamos useState por los hooks de rutas
import { Sun, Droplet, Sprout, Thermometer, ArrowRight, Heart, User, ShoppingBag, Search } from "lucide-react";
import { usePlantCare } from "../hooks/usePlantCare"; // 2. Importamos tu hook personalizado
import logoMacetas from "../assets/logoMacetas.png";
import Footer from "../components/Footer";

export default function PlantDetail() {
  const { id } = useParams(); // 3. Obtenemos el ID ("aloe-vera") directamente desde la URL
  const navigate = useNavigate();

  // 4. Consumimos tu hook pasando el ID dinámico
  const { plant, loading } = usePlantCare(id);

  // Pantalla de carga mientras el hook procesa los datos
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#fcfdfc]">
        <p className="text-sm font-medium text-zinc-500 animate-pulse">Cargando cuidados...</p>
      </div>
    );
  }

  // Manejo de error si el ID de la planta no existe en tu base de datos o archivo local
  if (!plant) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#fcfdfc] gap-4">
        <p className="text-zinc-600 font-medium">Planta no encontrada</p>
        <button 
          onClick={() => navigate("/plantas-y-cuidados")} 
          className="text-sm text-[#064225] font-semibold underline hover:text-[#032d18]"
        >
          Volver a la guía
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fcfdfc] font-sans antialiased text-zinc-800 selection:bg-[#064225]/10 selection:text-[#064225]">
      


      {/* ================= SECCIÓN PRINCIPAL DE DETALLE ================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumbs (Migas de pan) */}
        <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/")}>Inicio</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/plantas-y-cuidados")}>Plantas y Cuidado</span>
          <span>/</span>
          <span className="text-zinc-800 font-medium">{plant.name}</span>
        </nav>

        {/* Grid de 2 Columnas: Imagen izquierda, Detalles derecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mt-4">
          
          {/* Contenedor de Imagen */}
          <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-xs">
            <img 
              src={plant.img} 
              alt={plant.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Información de Cuidados */}
          <div className="flex flex-col gap-8 pt-2">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-3">
                {plant.name}
              </h1>
              <button className="inline-flex items-center gap-2 text-xs font-semibold text-[#064225] hover:underline cursor-pointer group">
                Comprar esta planta 
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Fichas de Características */}
            <div className="flex flex-col gap-6">
              
              {/* Luz */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-700 shrink-0">
                  <Sun size={22} className="stroke-[1.5]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-zinc-800">Condiciones de Luz</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">{plant.light}</p>
                </div>
              </div>

              {/* Riego */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-700 shrink-0">
                  <Droplet size={22} className="stroke-[1.5]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-zinc-800">Condiciones de Riego</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">{plant.water}</p>
                </div>
              </div>

              {/* Suelo */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-700 shrink-0">
                  <Sprout size={22} className="stroke-[1.5]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-zinc-800">Tipo de Suelo</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">{plant.soil}</p>
                </div>
              </div>

              {/* Temperatura */}
              <div className="flex items-start gap-4">
                <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-700 shrink-0">
                  <Thermometer size={22} className="stroke-[1.5]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-semibold text-zinc-800">Temperatura y Ambiente</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">{plant.temperature}</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ================= FOOTER COMPONENTE ================= */}
      <Footer />

    </div>
  );
}
