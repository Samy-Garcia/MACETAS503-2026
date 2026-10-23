import { useState, useEffect, useContext } from "react";
import ProfileHeader from "../components/ProfileHeader";
import { ProfileContext } from "../context/ProfileContext.jsx";
import { getMyQuotations } from "../api/quotationsApi";

const formatearFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const getEstadoClases = (status) => {
  switch (status) {
    case 'Pendiente': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'Cotizada': return 'bg-green-50 text-green-700 border-green-200';
    case 'Rechazada': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  }
};

export default function MyQuotations() {

  useEffect(() => {
    document.title = "Mis Cotizaciones | Macetas503";
  }, []);

  const { avatar } = useContext(ProfileContext);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMyQuotations();
        setQuotations(data);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar tus cotizaciones.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="w-full min-h-screen bg-page font-sans text-zinc-800 pb-12">
      <ProfileHeader avatar={avatar} />

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">

        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Cotizaciones</h1>
          <p className="text-zinc-500 mt-1">
            Solicitudes de cotización para eventos -- se piden desde la página de Cotizaciones.
          </p>
        </div>

        <h2 className="text-xl font-bold text-zinc-900 mt-4">Mis Solicitudes ({quotations.length})</h2>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {loading ? (
          <div className="text-center text-zinc-400 py-16">Cargando...</div>
        ) : quotations.length === 0 ? (
          <div className="text-center text-zinc-400 py-16 bg-surface rounded-lg border border-zinc-200">
            Todavía no has pedido ninguna cotización.
          </div>
        ) : (
          <div className="space-y-6">
            {quotations.map((q) => (
              <div key={q._id} className="bg-surface border border-zinc-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div>
                    <h3 className="font-bold text-zinc-900">{q.eventType} · {formatearFecha(q.eventDate)}</h3>
                    <p className="text-xs text-zinc-400">Solicitada el {formatearFecha(q.createdAt)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getEstadoClases(q.status)}`}>
                    {q.status}
                  </span>
                </div>

                <div className="mt-4 border-t border-zinc-100 pt-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Productos</p>
                  <ul className="space-y-1">
                    {q.items.map((it, i) => (
                      <li key={i} className="text-sm text-zinc-600 flex justify-between">
                        <span>{it.productName} x{it.quantity}</span>
                        <span>${(it.unitPrice * it.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm font-semibold text-zinc-700 mt-2 text-right">
                    Estimado: ${Number(q.estimatedTotal).toFixed(2)}
                  </p>
                </div>

                {q.status === 'Cotizada' && q.finalPrice != null && (
                  <div className="mt-4 p-4 bg-primary-700/5 border border-primary-700/20 rounded-lg">
                    <p className="text-sm font-semibold text-primary-700">Precio final: ${Number(q.finalPrice).toFixed(2)}</p>
                    {q.adminMessage && <p className="text-sm text-zinc-600 mt-1">{q.adminMessage}</p>}
                  </div>
                )}

                {q.status === 'Rechazada' && q.adminMessage && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{q.adminMessage}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
