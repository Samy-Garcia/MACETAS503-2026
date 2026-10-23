import { useState } from "react";
import { Link } from "react-router";
import { useLoyalty } from "../hooks/useLoyalty.js";
import { usePagination } from "../hooks/usePagination.js";
import { formatNumber } from "../utils/constants.js";
import Tabs from "../components/Tabs.jsx";
import Pagination from "../components/Pagination.jsx";
import Button from "../components/Button.jsx";
import RedeemModal from "../components/RedeemModal.jsx";
import rewardPot from "../assets/product-succulent-pot.png";
import rewardMiniPots from "../assets/product-heart-mold.png";
import rewardBox from "../assets/product-flower-candle.png";
import leafIcon from "../assets/icon-leaf.png";
import historyIcon from "../assets/icon-history.png";
import Footer from "../components/Footer.jsx";
import Swal from "sweetalert2";

const TABS = ["Todos", "Canjeados", "Expirados"];

const ALL_COUPONS = [
  { id: 1, title: "10% OFF en macetas", description: "Aplica para cualquier maceta de nuestra colección artesanal.", cost: 300, image: rewardPot, status: "active" },
  { id: 2, title: "Molde de Corazón Premium", description: "Molde de silicona para velas o jabones artesanales en forma de corazón.", cost: 800, image: rewardMiniPots, status: "active" },
  { id: 3, title: "Vela Flor de Temporada", description: "Vela decorativa con soporte tallado, ideal para centros de mesa.", cost: 200, image: rewardBox, status: "redeemed" },
];

export default function Coupons() {
  const { points, redeemPoints } = useLoyalty();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [redeemedIds, setRedeemedIds] = useState(
    ALL_COUPONS.filter((c) => c.status === "redeemed").map((c) => c.id)
  );
  const [modalReward, setModalReward] = useState(null);

  const filtered = ALL_COUPONS.filter((c) => {
    if (activeTab === "Canjeados") return redeemedIds.includes(c.id);
    if (activeTab === "Expirados") return c.status === "expired";
    return true;
  });

  const { page, totalPages, currentItems, nextPage, prevPage, goToPage } = usePagination(filtered, 3);

  // Canjear un cupón ya que  si ya estaba canjeado, solo vuelve a mostrar el Ver Cupón
  const handleAction = async (coupon) => {
  const alreadyRedeemed = redeemedIds.includes(coupon.id);

  // Si ya fue canjeado, solo abre el modal
  if (alreadyRedeemed) {
    setModalReward(coupon);
    return;
  }

  // Confirmación antes del canje
  const result = await Swal.fire({
    title: "¿Canjear cupón?",
    html: `
      <div style="margin-top: 10px;">
        <p>Estás a punto de canjear el siguiente cupón:</p>
        <h3 style="margin: 12px 0; color: #064225; font-weight: 700;">
          ${coupon.title}
        </h3>
        <p>Se descontarán <strong>${coupon.cost} hojas</strong> de tu saldo.</p>
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, canjear",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
    confirmButtonColor: "#064225",
    cancelButtonColor: "#9ca3af",
  });

  if (!result.isConfirmed) return;

  const ok = redeemPoints(coupon.cost, coupon.title);

  if (ok) {
    setRedeemedIds((prev) => [...prev, coupon.id]);

    // Abre el modal del cupón
    setModalReward(coupon);

    // Mensaje de éxito
    await Swal.fire({
      title: "¡Cupón canjeado!",
      text: "Tu cupón ha sido agregado correctamente.",
      icon: "success",
      confirmButtonText: "Continuar",
      confirmButtonColor: "#064225",
    });
  } else {
    Swal.fire({
      title: "Hojas insuficientes",
      text: "No tienes suficientes hojas para canjear este cupón.",
      icon: "error",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#064225",
    });
  }
};

  return (
    <div className="w-full min-h-screen bg-[#fcfdfc] font-sans text-zinc-800">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#064225]">Mis Cupones</h1>
        <p className="text-zinc-600 mt-2">Tu jardín está creciendo. Sigue cultivando beneficios.</p>

        {/* Resumen de saldo */}
        <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-between flex-wrap gap-4 mt-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center">
              <img src={leafIcon} alt="" className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Saldo Actual</span>
              <span className="text-xl font-bold text-primary-800">{formatNumber(points)} Hojas</span>
            </div>
          </div>
          <Link to="/historial">
            <Button variant="outline" className="flex items-center gap-2">
              <img src={historyIcon} alt="" className="w-4 h-4" /> Ver Historial
            </Button>
          </Link>
        </div>

        <Tabs
          tabs={TABS}
          active={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            goToPage(1);
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentItems.length > 0 ? (
            currentItems.map((coupon) => {
              const isRedeemed = redeemedIds.includes(coupon.id);
              return (
                <div key={coupon.id} className="bg-white rounded-xl shadow-card overflow-hidden flex flex-col">
                  <div className="relative">
                    <img src={coupon.image} alt={coupon.title} className="w-full h-40 object-cover" />
                    <span className="absolute top-3 left-3 bg-gold-500 text-primary-900 text-[11px] font-bold px-2 py-1 rounded-full">
                      {isRedeemed ? "Canjeado" : "Disponible"}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-bold text-gray-800">{coupon.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-4 flex-1">{coupon.description}</p>
                    <Button
                      variant={isRedeemed ? "outline" : "primary"}
                      onClick={() => handleAction(coupon)}
                      className="w-full"
                    >
                      {isRedeemed ? "Ver Cupón" : "Canjear"}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400 text-center py-10 col-span-full">
              No hay cupones en esta categoría.
            </p>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPrev={prevPage} onNext={nextPage} onGoTo={goToPage} />

        <RedeemModal open={!!modalReward} reward={modalReward} onClose={() => setModalReward(null)} />
      </main>
      <Footer />
    </div>
  );
}
