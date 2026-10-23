import { useState, useEffect } from "react";
import { useLoyalty } from "../hooks/useLoyalty.js";
import { usePagination } from "../hooks/usePagination.js";
import { formatNumber } from "../utils/constants.js";
import Tabs from "../components/Tabs.jsx";
import HistoryItem from "../components/HistoryItem.jsx";
import Pagination from "../components/Pagination.jsx";
import { LeafIcon } from "../components/Icons.jsx";
import Footer from "../components/Footer.jsx";

const TABS = ["Todos", "Ganados", "Canjeados"];

export default function History() {

useEffect(() => {
    document.title = "Historial | Macetas503";
  }, []);

  const { points, currentLevel, history } = useLoyalty();
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const filtered = history.filter((item) => {
    if (activeTab === "Ganados") return item.type === "earned";
    if (activeTab === "Canjeados") return item.type === "redeemed";
    return true;
  });

  const { page, totalPages, currentItems, nextPage, prevPage, goToPage } = usePagination(filtered, 4);

  return (
    <div className="w-full min-h-screen bg-page font-sans text-zinc-800">
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-zinc-900">Historial de Puntos</h1>
        <p className="text-zinc-600 mt-2 max-w-xl">
          Consulta el flujo de tus puntos acumulados y canjeados. Cada acción en tu jardín digital
          te acerca a nuevos recompensas exclusivas.
        </p>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mt-8">
        <Tabs
          tabs={TABS}
          active={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            goToPage(1);
          }}
        />

        <div className="bg-surface rounded-xl shadow-card px-6 py-4 flex items-center gap-6">
          <div>
            <span className="text-xs text-gray-400 block">Balance Actual</span>
            <span className="text-xl font-bold text-primary-700 inline-flex items-center gap-1">
              <LeafIcon className="w-4 h-4" /> {formatNumber(points)} Hojas
            </span>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-400 block">Nivel</span>
            <span className="text-sm font-semibold text-gold-600">{currentLevel.name}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {currentItems.length > 0 ? (
          currentItems.map((item) => <HistoryItem key={item.id} item={item} />)
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">No hay movimientos en esta categoría.</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPrev={prevPage} onNext={nextPage} onGoTo={goToPage} />
      </main>
      <Footer />
    </div>
  );
}
