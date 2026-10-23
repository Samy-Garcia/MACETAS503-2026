import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useLoyalty } from "../hooks/useLoyalty.js";
import LevelProgressCard from "../components/LevelProgressCard.jsx";
import ActionCard from "../components/ActionCard.jsx";
import { CartIcon, ReferIcon, ReviewIcon, CakeIcon, GiftIcon } from "../components/Icons.jsx";
import Footer from "../components/Footer.jsx";
import { getEarnMethods } from "../api/loyaltyApi";

const ICON_BY_TYPE = {
  purchase: CartIcon,
  review: ReviewIcon,
  referral: ReferIcon,
  birthday: CakeIcon,
  custom: GiftIcon,
};

export default function Home() {
  useEffect(() => {
    document.title = "Programa de Fidelidad | Macetas503";
  }, []);

  const { userName } = useLoyalty();
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getEarnMethods();
        setMethods(data.slice(0, 3));
      } catch (err) {
        // silencioso: si falla, esta vista previa simplemente no se muestra
      }
    };
    cargar();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-page font-sans text-zinc-800">
      {/* flex-1 hace que el contenido ocupe todo el espacio disponible */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        {/* Saludo */}
        <div className="mb-6 border-b border-zinc-100 pb-4">
          <h1 className="text-3xl font-bold text-zinc-900">
            ¡Hola, {userName}!
          </h1>
          <p className="text-zinc-500 mt-1">
            Tu jardín está creciendo. Sigue cultivando beneficios.
          </p>
        </div>

        {/* Nivel y balance */}
        <LevelProgressCard />

        {/* Cómo ganar hojas (vista previa: las primeras 3, la lista completa está en /ganar-puntos) */}
        {methods.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary-700">¿Cómo ganar hojas?</h2>
              <Link to="/ganar-puntos" className="text-sm font-semibold text-primary-700 hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {methods.map((method) => (
                <ActionCard
                  key={method._id}
                  icon={ICON_BY_TYPE[method.actionType] || GiftIcon}
                  title={method.title}
                  description={method.description}
                  badge={method.actionType === 'purchase' ? `+${method.points} x $1` : `+${method.points} hojas`}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}