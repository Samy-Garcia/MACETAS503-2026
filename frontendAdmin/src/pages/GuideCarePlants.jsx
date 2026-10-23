import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Importamos el hook de navegación
import { Search, Heart, User, ShoppingBag } from "lucide-react";
import logoMacetas from "../assets/logoMacetas.png";
import Footer from "../components/Footer";

export default function PlantCareGuide() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate(); // 2. Inicializamos el hook

  // Estructura de datos organizada por el abecedario con IDs legibles (Slugs)
  const plantDirectory = {
    A: [
      { id: "acanthus-mollis", name: "Acanthus mollis", img: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80" },
      { id: "aglaonema-commutatum", name: "Aglaonema commutatum", img: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80" },
      { id: "aloe-vera", name: "Aloe Vera", img: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=400&q=80" },
    ],
    B: [
      { id: "bamboo", name: "Bamboo", img: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=400&q=80" },
      { id: "begonia", name: "Begonia", img: "https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=400&q=80" },
      { id: "bougainvillea", name: "Bougainvillea", img: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80" },
    ],
    C: [
      { id: "cactus", name: "Cactus", img: "https://images.unsplash.com/photo-1508022159815-6db1b774ec26?auto=format&fit=crop&w=400&q=80" },
      { id: "calathea", name: "Calathea", img: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80" },
      { id: "chrysanthemum", name: "Chrysanthemum", img: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?auto=format&fit=crop&w=400&q=80" },
    ],
    D: [
      { id: "daisy", name: "Daisy", img: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80" },
      { id: "dahlia", name: "Dahlia", img: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80" },
      { id: "dracaena", name: "Dracaena", img: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=400&q=80" },
    ],
    E: [
      { id: "eucalyptus", name: "Eucalyptus", img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80" },
      { id: "echeveria", name: "Echeveria", img: "https://images.unsplash.com/photo-1520412098697-663f45ac555b?auto=format&fit=crop&w=400&q=80" },
      { id: "english-ivy", name: "English Ivy", img: "https://images.unsplash.com/photo-1492496913980-50134c7a52a0?auto=format&fit=crop&w=400&q=80" },
    ],
    F: [
      { id: "fern", name: "Fern", img: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80" },
      { id: "ficus", name: "Ficus", img: "https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=400&q=80" },
      { id: "freesia", name: "Freesia", img: "https://images.unsplash.com/photo-1567606993622-470402b59f05?auto=format&fit=crop&w=400&q=80" },
    ],
    G: [
      { id: "gardenia", name: "Gardenia", img: "https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=400&q=80" },
      { id: "geranium", name: "Geranium", img: "https://images.unsplash.com/photo-1507223391108-17cf7b378994?auto=format&fit=crop&w=400&q=80" },
      { id: "ginkgo", name: "Ginkgo", img: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&w=400&q=80" },
    ],
  };

  return (
    <div className="w-full min-h-screen bg-[#fcfdfc] font-sans antialiased text-zinc-800 selection:bg-[#064225]/10 selection:text-[#064225]">
      


      {/* ================= CONTENIDO DE LA GUÍA ================= */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-10">
        
        <div className="flex flex-col gap-5 text-left">
          <h1 className="text-4xl font-bold text-[#064225] tracking-tight">
            Guía de Cuidado de Plantas
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed font-normal">
            Bienvenido a nuestra biblioteca de información sobre el cuidado de plantas. Revisa la hoja de empaque incluida en tu pedido o el correo de confirmación de compra para conocer el nombre de tu planta y descubrir qué niveles de luz y agua necesita para crecer saludable.
          </p>
          <p className="text-sm text-zinc-600 leading-relaxed font-normal">
            ¿Necesitas ayuda? Haz clic en nuestro chat en vivo en la esquina inferior derecha (lunes a domingo, de 9 a.m. a 5 p.m.) o completa nuestro formulario de contacto. ¿Buscas atención personalizada? Agenda una consulta virtual con uno de nuestros expertos en plantas.
          </p>
        </div>

        {/* Barra de Búsqueda de Plantas */}
        <div className="w-full relative max-w-md mt-2">
          <input
            type="text"
            placeholder="Buscar Plantas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-zinc-300 py-2 pl-2 pr-10 text-sm font-normal text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#064225] transition-colors"
          />
          <Search size={16} className="absolute right-3 top-3 text-zinc-400 pointer-events-none" />
        </div>

        {/* Directorio Alfabético de Plantas */}
        <div className="flex flex-col gap-12 mt-6">
          {Object.entries(plantDirectory).map(([letter, plants]) => {
            const filteredPlants = plants.filter((plant) =>
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
                    
                    /* 3. AGREGAMOS EL NAVIGATE DINÁMICO AQUÍ */
                    <div 
                      key={plant.id} 
                      onClick={() => navigate(`/plantas-y-cuidados/${plant.id}`)} 
                      className="group flex flex-col gap-2 cursor-pointer"
                    >
                      <div className="w-full aspect-[4/3] bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 shadow-xs">
                        <img 
                          src={plant.img} 
                          alt={plant.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                      </div>
                      <span className="text-xs font-semibold text-zinc-600 transition-colors group-hover:text-[#064225] pl-1">
                        {plant.name}
                      </span>
                    </div>

                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
