import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useLoyalty } from "../hooks/useLoyalty.js";
import { formatNumber } from "../utils/constants.js";
import { HistoryIcon, CartIcon, CakeIcon, ReviewIcon, ReferIcon, ShareIcon } from "../components/Icons.jsx";
import ActionCard from "../components/ActionCard.jsx";
import Button from "../components/Button.jsx";
import ReferralModal from "../components/ReferralModal.jsx";
import leafIcon from "../assets/icon-leaf-simple.png";
import Footer from "../components/Footer.jsx";

export default function EarnPoints() {
  const { points, addPoints } = useLoyalty();
  const navigate = useNavigate();
  const [birthdayAdded, setBirthdayAdded] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);

  const handleBirthday = () => {
    if (birthdayAdded) return;
    addPoints(100, "Bono de Cumpleaños");
    setBirthdayAdded(true);
  };

  const handleReview = () => {
    if (reviewSent) return;
    addPoints(25, "Reseña de producto");
    setReviewSent(true);
  };

  // Abre el modal de "Referido "y el botón puede usarse todas las veces que quieras,
  // cada wue abre hace un código  nuevo
  const handleReferConfirm = () => {
    addPoints(200, "Referido de amigo");
  };

  const handleFollow = () => {
    if (followed) return;
    addPoints(50, "Seguir en Redes Sociales");
    setFollowed(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#fcfdfc] font-sans text-zinc-800">
      <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero verde */}
      <div className="bg-[#064225] text-white rounded-xl overflow-hidden mb-10">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard
          icon={CartIcon}
          title="Compra"
          description="Gana 1 hoja por cada $1 en compras de cualquier producto."
          badge="+1 x $1"
          actionLabel="Ir a Tienda"
          onAction={() => navigate("/")}
        />

        <ActionCard
          icon={CakeIcon}
          title="Cumpleaños"
          description="Recibe 100 hojas en tu día especial como regalo de nuestra parte."
          badge="+100 hojas"
          actionLabel={birthdayAdded ? "Fecha Añadida" : "Añadir Fecha"}
          onAction={handleBirthday}
        />

        <ActionCard
          icon={ReviewIcon}
          title="Reseñas"
          description="Comparte tu experiencia y gana 25 hojas por cada reseña verificada."
          badge="+25 hojas"
          actionLabel={reviewSent ? "Reseña Enviada" : "Escribir Reseña"}
          onAction={handleReview}
        />

        <ActionCard
          icon={ReferIcon}
          title="Refiere a un amigo"
          description="Comparte la alegría de la botánica. Gana 200 hojas cuando tu referido realice su primera compra superior a $15."
          badge="+200 hojas"
          actionLabel="Copiar Código"
          onAction={() => setReferralOpen(true)}
        />

        <ActionCard
          icon={ShareIcon}
          title="Redes Sociales"
          description="Síguenos en redes y gana 50 hojas. Mantente al día con nuevas promociones."
          badge="+50 hojas"
          actionLabel={followed ? "¡Gracias!" : "Seguir"}
          onAction={handleFollow}
        />
      </div>

      <ReferralModal
        open={referralOpen}
        onClose={() => setReferralOpen(false)}
        onConfirm={handleReferConfirm}
      />
      </main>
      <Footer />
    </div>
  );
}
