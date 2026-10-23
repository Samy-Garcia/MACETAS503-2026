import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sun, Droplet, Sprout, Thermometer, ImageOff } from "lucide-react";
import { getPlantById } from "../api/plantsApi";
import Footer from "../components/Footer";

export default function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plant, setPlant] = useState(null);
    useEffect(() => {
        document.title = plant?.name ? `${plant.name} | Macetas503` : "Planta | Macetas503";
    }, [plant]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarPlanta = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPlantById(id);
        setPlant(data);
      } catch (err) {
        setError(err.message || 'No se pudo cargar la planta.');
      } finally {
        setLoading(false);
      }
    };

    if (id) cargarPlanta();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-page">
        <p className="text-sm font-medium text-zinc-500 animate-pulse">Cargando planta...</p>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-page gap-4">
        <p className="text-zinc-600 font-medium">{error || 'Planta no encontrada'}</p>
        <button
          onClick={() => navigate("/plantas-y-cuidados")}
          className="text-sm text-primary-700 font-semibold underline hover:text-primary-800"
        >
          Volver a la guía
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-page font-sans antialiased text-zinc-800 selection:bg-primary-700/10 selection:text-primary-700">

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumbs */}
        <nav className="text-xs text-zinc-500 mb-8 flex items-center gap-2">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/")}>Inicio</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/plantas-y-cuidados")}>Plantas y Cuidado</span>
          <span>/</span>
          <span className="text-zinc-800 font-medium">{plant.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mt-4">

          {/* Imagen */}
          <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-xs flex items-center justify-center">
            {plant.image ? (
              <img
                src={plant.image}
                alt={plant.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
                className="w-full h-full object-cover"
              />
            ) : null}
            <div
              className="w-full h-full items-center justify-center text-zinc-300"
              style={{ display: plant.image ? 'none' : 'flex' }}
            >
              <ImageOff size={64} />
            </div>
          </div>

          {/* Información */}
          <div className="flex flex-col gap-8 pt-2">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2">
                {plant.name}
              </h1>
              {plant.size && (
                <p className="text-xs text-zinc-500 mb-3">Tamaño: {plant.size}</p>
              )}
              <p className="text-2xl font-bold text-primary-700">${Number(plant.price).toFixed(2)}</p>
            </div>

            {/* Cuidados reales, escritos por el admin al registrar la planta */}
            <div className="flex flex-col gap-6">
              {!plant.careLight && !plant.careWater && !plant.careSoil && !plant.careTemperature && (
                <p className="text-xs text-zinc-400 italic">
                  Todavía no hay instrucciones de cuidado cargadas para esta planta.
                </p>
              )}
              {plant.careLight && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-700 shrink-0">
                    <Sun size={20} className="stroke-[1.5]" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-semibold text-zinc-800">Luz</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">{plant.careLight}</p>
                  </div>
                </div>
              )}
              {plant.careWater && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-700 shrink-0">
                    <Droplet size={20} className="stroke-[1.5]" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-semibold text-zinc-800">Riego</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">{plant.careWater}</p>
                  </div>
                </div>
              )}
              {plant.careSoil && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-700 shrink-0">
                    <Sprout size={20} className="stroke-[1.5]" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-semibold text-zinc-800">Suelo</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">{plant.careSoil}</p>
                  </div>
                </div>
              )}
              {plant.careTemperature && (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-700 shrink-0">
                    <Thermometer size={20} className="stroke-[1.5]" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-sm font-semibold text-zinc-800">Temperatura</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">{plant.careTemperature}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Esta planta ya no se compra sola: se elige como parte de una
                maceta compatible. Va al final, después de toda la info de
                cuidados, para no distraer de lo importante primero. */}
            <div className="bg-[#f4f7f4] border border-zinc-200 rounded-lg p-4 mt-2">
              <p className="text-sm text-zinc-700 leading-relaxed">
                Esta planta se elige al comprar una <strong>maceta compatible</strong>, no se vende por separado.
              </p>
              <button
                onClick={() => navigate('/macetas')}
                className="mt-3 text-sm font-semibold text-primary-700 hover:underline"
              >
                Ver macetas disponibles →
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
