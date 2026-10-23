import { useLoyalty } from "../hooks/useLoyalty.js";
import LevelProgressCard from "../components/LevelProgressCard.jsx";
import ActionCard from "../components/ActionCard.jsx";
import { CartIcon, ReferIcon, ReviewIcon } from "../components/Icons.jsx";
import offerCandle from "../assets/product-flower-candle.png";
import offerPots from "../assets/product-geo-vases.png";
import Footer from "../components/Footer.jsx";

const HOW_TO_EARN = [
  {
    icon: CartIcon,
    title: "Compra",
    description: "Gana 1 hoja por cada $1 en compras de cualquier producto.",
  },
  {
    icon: ReferIcon,
    title: "Refiere",
    description: "Obtén 200 hojas cuando un amigo realice su primer pedido.",
  },
  {
    icon: ReviewIcon,
    title: "Reseña",
    description: "Comparte tu experiencia y gana 25 hojas por cada opinión.",
  },
];

export default function Home() {
  const { userName } = useLoyalty();

  return (
    <div className="w-full min-h-screen bg-[#fcfdfc] font-sans text-zinc-800">
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Saludo */}
        <div className="mb-6 border-b border-zinc-100 pb-4">
          <h1 className="text-3xl font-bold text-[#064225]">¡Hola, {userName}!</h1>
          <p className="text-zinc-500 mt-1">Tu jardín está creciendo. Sigue cultivando beneficios.</p>
        </div>

        {/* de nivel/ y balance con accesos rápidos */}
        <LevelProgressCard />

        {/* Ofertas activas */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-[#064225] mb-4">Ofertas Activas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="rounded-xl overflow-hidden relative h-40 bg-cover bg-center flex items-end p-5"
            style={{ backgroundImage: `url(${offerCandle})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative text-white">
              <p className="font-bold">Puntos dobles en velas</p>
              <p className="text-xs opacity-80">Válido hasta el 15 de este mes</p>
            </div>
          </div>
          <div
            className="rounded-xl overflow-hidden relative h-40 bg-cover bg-center flex items-end p-5"
            style={{ backgroundImage: `url(${offerPots})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative text-white">
              <p className="font-bold">10% OFF en macetas grandes</p>
              <p className="text-xs opacity-80">Válido por inventario limitado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo ganar hojas */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-[#064225] mb-4">¿Cómo ganar hojas?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_TO_EARN.map((item) => (
            <ActionCard key={item.title} {...item} />
          ))}
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
