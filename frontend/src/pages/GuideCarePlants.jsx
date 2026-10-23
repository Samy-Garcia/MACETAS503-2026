import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ImageOff } from "lucide-react";
import Footer from "../components/Footer";
import { getPlants } from "../api/plantsApi";

export default function PlantCareGuide() {

  useEffect(() => {
    document.title = "Plantas y Cuidados | Macetas503";
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarPlantas = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPlants();
        setPlants(data);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar las plantas.');
      } finally {
        setLoading(false);
      }
    };
    cargarPlantas();
  }, []);

  // Agrupa las plantas reales por la primera letra de su nombre (A, B, C...)
  const plantDirectory = useMemo(() => {
    const directory = {};
    plants.forEach((plant) => {
      const letter = (plant.name || '?').trim().charAt(0).toUpperCase();
      if (!directory[letter]) directory[letter] = [];
      directory[letter].push(plant);
    });
    // orden alfabético de las letras que sí tienen plantas
    return Object.fromEntries(
      Object.entries(directory).sort(([a], [b]) => a.localeCompare(b))
    );
  }, [plants]);

  return (
    <div className="w-full min-h-screen bg-page font-sans antialiased text-zinc-800 selection:bg-primary-700/10 selection:text-primary-700">

      {/* ================= CONTENIDO DE LA GUÍA ================= */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-10">

        <div className="flex flex-col gap-5 text-left">
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
            Guía de Cuidado de Plantas
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed font-normal">
            Bienvenido a nuestra biblioteca de información sobre el cuidado de plantas. Revisa la hoja de empaque incluida en tu pedido o el correo de confirmación de compra para conocer el nombre de tu planta y descubrir qué cuidados necesita para crecer saludable.
          </p>
          <p className="text-sm text-zinc-600 leading-relaxed font-normal">
            ¿Necesitas ayuda? Haz clic en nuestro chat en vivo en la esquina inferior derecha (lunes a domingo, de 9 a.m. a 5 p.m.) o completa nuestro formulario de contacto.
          </p>
        </div>

        {/* Barra de Búsqueda de Plantas */}
        <div className="w-full relative max-w-md mt-2">
          <input
            type="text"
            placeholder="Buscar Plantas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-zinc-300 py-2 pl-2 pr-10 text-sm font-normal text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-primary-700 transition-colors"
          />
          <Search size={16} className="absolute right-3 top-3 text-zinc-400 pointer-events-none" />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-zinc-400 text-center py-10">Cargando plantas...</p>
        ) : (
          <>
            {/* Directorio Alfabético de Plantas */}
            <div className="flex flex-col gap-12 mt-6">
              {Object.entries(plantDirectory).map(([letter, letterPlants]) => {
                const filteredPlants = letterPlants.filter((plant) =>
                  plant.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredPlants.length === 0) return null;

                return (
                  <div key={letter} className="flex flex-col gap-4">
                    <h2 className="text-3xl font-bold text-zinc-800 tracking-tight border-b border-zinc-100 pb-2">
                      {letter}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {filteredPlants.map((plant) => (
                        <div
                          key={plant._id}
                          onClick={() => navigate(`/plantas-y-cuidados/${plant._id}`)}
                          className="group flex flex-col gap-2 cursor-pointer"
                        >
                          <div className="w-full aspect-[4/3] bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 shadow-xs flex items-center justify-center">
                            {plant.image ? (
                              <img
                                src={plant.image}
                                alt={plant.name}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling.style.display = 'flex';
                                }}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                              />
                            ) : null}
                            <div
                              className="w-full h-full items-center justify-center text-zinc-300"
                              style={{ display: plant.image ? 'none' : 'flex' }}
                            >
                              <ImageOff size={28} />
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-zinc-600 transition-colors group-hover:text-primary-700 pl-1">
                            {plant.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {!loading && plants.length === 0 && !error && (
              <p className="text-sm text-zinc-400 text-center py-10">
                Todavía no hay plantas registradas en el catálogo.
              </p>
            )}
          </>
        )}

      </main>

      <Footer />
    </div>
  );
}
