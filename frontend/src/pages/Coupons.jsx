import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useLoyalty } from "../hooks/useLoyalty.js";
import { usePagination } from "../hooks/usePagination.js";
import { formatNumber } from "../utils/constants.js";
import Tabs from "../components/Tabs.jsx";
import Pagination from "../components/Pagination.jsx";
import Button from "../components/Button.jsx";
import RedeemModal from "../components/RedeemModal.jsx";
import { LeafIcon, HistoryIcon } from "../components/Icons.jsx";
import Footer from "../components/Footer.jsx";
import { getMyRedemptions } from "../api/loyaltyApi";

const TABS = ["Todos", "Disponibles", "Usados"];

export default function Coupons() {

  useEffect(() => {
    document.title = "Cupones | Macetas503";
  }, []);


  const { points } = useLoyalty();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalRedemption, setModalRedemption] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await getMyRedemptions();
        setRedemptions(data);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const isExpired = (r) => r.status === "pending" && r.expiresAt && new Date() > new Date(r.expiresAt);

  const filtered = redemptions.filter((r) => {
    if (activeTab === "Disponibles") return r.status === "pending" && !isExpired(r);
    if (activeTab === "Usados") return r.status === "used" || isExpired(r);
    return true;
  });

  const { page, totalPages, currentItems, nextPage, prevPage, goToPage } = usePagination(filtered, 3);

  return (
    <div className="w-full min-h-screen bg-page font-sans text-zinc-800">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-zinc-900">Mis Cupones</h1>
        <p className="text-zinc-600 mt-2">Todo lo que ya canjeaste con tus hojas.</p>

        <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-between flex-wrap gap-4 mt-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center">
              <LeafIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs text-gray-500 block">Saldo Actual</span>
              <span className="text-xl font-bold text-primary-800">{formatNumber(points)} Hojas</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/recompensas">
              <Button variant="primary">Ir a Canjear</Button>
            </Link>
            <Link to="/historial">
              <Button variant="outline" className="flex items-center gap-2">
                <HistoryIcon className="w-4 h-4" /> Ver Historial
              </Button>
            </Link>
          </div>
        </div>

        <Tabs
          tabs={TABS}
          active={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            goToPage(1);
          }}
        />

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-10">Cargando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentItems.length > 0 ? (
              currentItems.map((redemption) => (
                <div key={redemption._id} className="bg-surface rounded-xl shadow-card overflow-hidden flex flex-col p-5">
                  <span className={`self-start text-[11px] font-bold px-2 py-1 rounded-full mb-3 ${
                    redemption.status === 'used' ? 'bg-gray-200 text-gray-500'
                      : isExpired(redemption) ? 'bg-red-100 text-red-600'
                      : 'bg-gold-500 text-primary-900'
                    }`}>
                    {redemption.status === 'used' ? 'Usado' : isExpired(redemption) ? 'Vencido' : 'Disponible'}
                  </span>
                  <h4 className="font-bold text-gray-800">{redemption.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 mb-1">
                    {redemption.cost} hojas · {new Date(redemption.createdAt).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {redemption.code && (
                    <p className="text-xs font-mono text-primary-700 mb-4">{redemption.code}</p>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setModalRedemption(redemption)}
                    className="w-full mt-auto"
                  >
                    Ver Detalle
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-10 col-span-full">
                No hay cupones en esta categoría todavía.
              </p>
            )}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPrev={prevPage} onNext={nextPage} onGoTo={goToPage} />

        <RedeemModal open={!!modalRedemption} redemption={modalRedemption} onClose={() => setModalRedemption(null)} />
      </main>
      <Footer />
    </div>
  );
}
