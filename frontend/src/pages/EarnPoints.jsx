import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useLoyalty } from "../hooks/useLoyalty.js";
import { formatNumber } from "../utils/constants.js";
import { HistoryIcon, CartIcon, ReviewIcon, ReferIcon, CakeIcon, GiftIcon } from "../components/Icons.jsx";
import ActionCard from "../components/ActionCard.jsx";
import Button from "../components/Button.jsx";
import ReferralModal from "../components/ReferralModal.jsx";
import leafIcon from "../assets/icon-leaf-simple.png";
import Footer from "../components/Footer.jsx";
import { claimBirthday, getEarnMethods } from "../api/loyaltyApi";

const ICON_BY_TYPE = {
  purchase: CartIcon,
  review: ReviewIcon,
  referral: ReferIcon,
  birthday: CakeIcon,
  custom: GiftIcon,
};

export default function EarnPoints() {

  useEffect(() => {
          document.title = "Ganar Puntos | Macetas503";
      }, []);

  const { points, referralCode, birthdayStatus, refreshLoyalty } = useLoyalty();
  const navigate = useNavigate();
  const [referralOpen, setReferralOpen] = useState(false);
  const [claimingBirthday, setClaimingBirthday] = useState(false);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await getEarnMethods();
        setMethods(data);
      } catch (err) {
        // silencioso: si falla, simplemente no se muestran tarjetas extra
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const birthdayCopy = {
    "no-date": {
      description: "Agrega tu fecha de nacimiento en tu perfil para poder reclamar tu bono cada año.",
      actionLabel: "Agregar Fecha",
    },
    "waiting": {
      description: "Ya tenemos tu fecha guardada. Vuelve el día de tu cumpleaños para reclamar tus hojas.",
      actionLabel: "Ver mi Perfil",
    },
    "available": {
      description: "¡Hoy es tu cumpleaños! Reclama tus hojas de regalo.",
      actionLabel: "Reclamar Bono",
    },
    "claimed": {
      description: "Ya reclamaste tu bono de cumpleaños este año. ¡Nos vemos el próximo!",
      actionLabel: null,
    },
  };

  const handleBirthdayAction = async () => {
    if (birthdayStatus === "no-date" || birthdayStatus === "waiting") {
      navigate("/editarperfil");
      return;
    }
    if (birthdayStatus === "available") {
      setClaimingBirthday(true);
      try {
        const result = await claimBirthday();
        toast.success(result.message || "¡Feliz cumpleaños!");
        await refreshLoyalty();
      } catch (err) {
        toast.error(err.message || "No se pudo reclamar el bono.");
      } finally {
        setClaimingBirthday(false);
      }
    }
  };

  // Configuración de interacción para cada mecanismo real (el admin controla
  // el texto y las hojas, pero la ACCIÓN del botón sigue ligada a la lógica real)
  const buildCardProps = (method) => {
    const base = {
      key: method._id,
      icon: ICON_BY_TYPE[method.actionType] || GiftIcon,
      title: method.title,
      description: method.description,
      badge: method.actionType === 'purchase' ? `+${method.points} x $1` : `+${method.points} hojas`,
    };

    switch (method.actionType) {
      case 'purchase':
        return { ...base, actionLabel: "Ir a Tienda", onAction: () => navigate("/") };
      case 'review':
        return { ...base, actionLabel: "Escribir Reseña", onAction: () => navigate("/productoresena") };
      case 'referral':
        return { ...base, actionLabel: "Ver mi Código", onAction: () => setReferralOpen(true) };
      case 'birthday':
        return {
          ...base,
          description: birthdayCopy[birthdayStatus].description,
          actionLabel: claimingBirthday ? "Reclamando..." : birthdayCopy[birthdayStatus].actionLabel,
          onAction: handleBirthdayAction,
        };
      default:
        // Personalizada: solo informativa, no otorga hojas al hacer clic (no verificable)
        return {
          ...base,
          actionLabel: method.linkTo ? "Ver más" : null,
          onAction: method.linkTo ? () => navigate(method.linkTo) : undefined,
        };
    }
  };

  return (
    <div className="w-full min-h-screen bg-page font-sans text-zinc-800">
      <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero verde */}
      <div className="bg-primary-700 text-white rounded-xl overflow-hidden mb-10">
        <div className="px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Maneras de ganar hojas</h1>
            <p className="text-white/70 mt-2 max-w-md">
              Transforma cada acción en crecimiento para tu jardín. Acumula hojas y desbloquea
              recompensas exclusivas que celebran tu compromiso con la naturaleza.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <Link to="/historial">
                <Button variant="outline" className="!bg-transparent !border-white/40 !text-white hover:!bg-white/10">
                  <span className="flex items-center gap-2">
                    <HistoryIcon className="w-4 h-4" /> Ver Historial
                  </span>
                </Button>
              </Link>
              <span className="bg-primary-700 px-4 py-2.5 rounded-md text-sm font-semibold">
                {formatNumber(points)} Hojas Actuales
              </span>
            </div>
          </div>
          <div className="w-28 h-28 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
            <div className="w-20 h-20 rounded-full border border-white/15 bg-white/5 flex items-center justify-center">
              <img src={leafIcon} alt="" className="w-9 h-9" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-zinc-400 py-10">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {methods.map((method) => (
            <ActionCard {...buildCardProps(method)} />
          ))}
        </div>
      )}

      <ReferralModal
        open={referralOpen}
        onClose={() => setReferralOpen(false)}
        code={referralCode}
      />
      </main>
      <Footer />
    </div>
  );
}
