import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useLoyalty } from "../hooks/useLoyalty.js";
import { usePagination } from "../hooks/usePagination.js";
import { formatNumber } from "../utils/constants.js";
import Tabs from "../components/Tabs.jsx";
import RewardCard from "../components/RewardCard.jsx";
import Pagination from "../components/Pagination.jsx";
import Button from "../components/Button.jsx";
import RedeemModal from "../components/RedeemModal.jsx";
import Footer from "../components/Footer.jsx";
import Swal from "sweetalert2";
import { getRewardsCatalog, redeemReward } from "../api/loyaltyApi";

const TABS = ["Cupones", "Productos", "Envíos Gratis"];

export default function Rewards() {

useEffect(() => {
    document.title = "Recompensas | Macetas503";
  }, []);

  const { points, currentLevel, refreshLoyalty } = useLoyalty();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalRedemption, setModalRedemption] = useState(null);
  const [redeemingId, setRedeemingId] = useState(null);

  const cargarCatalogo = async () => {
    setLoading(true);
    try {
      const data = await getRewardsCatalog();
      setCatalog(data);
    } catch (err) {
      Swal.fire({ title: 'Error', text: err.message, icon: 'error', confirmButtonText: 'Aceptar', confirmButtonColor: '#064225' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCatalogo();
  }, []);

  const rewards = catalog.filter(r => r.category === activeTab);

  const { page, totalPages, currentItems, nextPage, prevPage, goToPage } = usePagination(rewards, 3);

  const handleRedeem = async (reward) => {
    const result = await Swal.fire({
      title: "¿Canjear recompensa?",
      html: `
        <p>Estás a punto de canjear:</p>
        <h3 style="margin:10px 0;color:#064225;font-weight:bold;">
          ${reward.title}
        </h3>
        <p>Se descontarán <strong>${reward.cost} hojas</strong> de tu saldo.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, canjear",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      confirmButtonColor: "var(--color-primary-700)",
      cancelButtonColor: "#9ca3af",
    });

    if (!result.isConfirmed) return;

    setRedeemingId(reward.id);
    try {
      const redemption = await redeemReward(reward.id);
      await refreshLoyalty();
      await cargarCatalogo();
      setModalRedemption(redemption);
    } catch (err) {
      Swal.fire({
        title: "No se pudo canjear",
        text: err.message,
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "var(--color-primary-700)",
      });
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-page font-sans text-zinc-800">
      <main className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero verde con nivel actual */}
      <div className="bg-primary-700 text-white rounded-xl overflow-hidden mb-10">
        <div className="px-6 py-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-white/60 text-sm">Puntos de Lealtad</span>
            <h1 className="text-3xl font-bold">Recompensas</h1>
            <p className="text-white/70 mt-1">
              Estás en el nivel {currentLevel.name}. Tienes {rewards.length} recompensas disponibles.
            </p>
          </div>
          <Link to="/historial">
            <Button variant="gold">Ver Historial</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-zinc-500 mb-4">
          Saldo actual: <span className="font-bold text-primary-700">{formatNumber(points)} hojas</span>
        </p>

        <Tabs
          tabs={TABS}
          active={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            goToPage(1);
          }}
        />

        {loading ? (
          <p className="text-center text-zinc-400 py-10">Cargando recompensas...</p>
        ) : currentItems.length === 0 ? (
          <p className="text-center text-zinc-400 py-10">Todavía no hay recompensas en esta categoría.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentItems.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onRedeem={handleRedeem}
                redeemed={reward.redeemed}
                redeeming={redeemingId === reward.id}
              />
            ))}
          </div>
        )}

        <div className="bg-primary-50 border border-dashed border-primary-200 rounded-xl mt-6 p-6 text-center">
          <p className="font-semibold text-primary-800"> ¡Próximamente más sorpresas!</p>
          <p className="text-sm text-primary-600 mt-1">
            Estamos trabajando para traerte más recompensas únicas cada mes.
          </p>
        </div>

        <Pagination page={page} totalPages={totalPages} onPrev={prevPage} onNext={nextPage} onGoTo={goToPage} />
      </div>

      <RedeemModal open={!!modalRedemption} redemption={modalRedemption} onClose={() => setModalRedemption(null)} />
      </main>
      <Footer />
    </div>
  );
}
