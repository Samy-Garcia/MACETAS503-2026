import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm.jsx';
import usePageTitle from '../hooks/usePageTitle';
import { getAllQuotations, respondQuotation } from '../api/quotationsApi';

/* ─────────────────────────────────────────────────────────────
   Estilos locales (misma serif y animaciones del resto del panel)
   ───────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

  .m503-serif {
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
  }

  @keyframes m503-fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: none; }
  }
  .m503-fade-up { animation: m503-fade-up .55s cubic-bezier(.22,1,.36,1) both; }

  @media (prefers-reduced-motion: reduce) {
    .m503-fade-up { animation: none; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Íconos (ahora aceptan className)
   ───────────────────────────────────────────────────────────── */
const PhoneIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MailIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CalendarIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PinIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronDownIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const SendIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const XIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const LeafIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Piezas visuales
   ───────────────────────────────────────────────────────────── */
const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]';

const fieldClass =
  'w-full rounded-2xl border-2 border-transparent bg-[#F2F6F3] hover:bg-[#ECF3EE] focus:bg-white focus:border-[#8DBFA3] focus:ring-4 focus:ring-[#8DBFA3]/20 focus:outline-none transition-all text-gray-900 text-sm placeholder:text-gray-400';

// Cada estado conserva su propio tono para distinguirse de un vistazo:
// pendiente = ámbar (requiere acción), cotizada = verde, rechazada = rojo suave.
const ESTADOS = {
  Pendiente: { pill: 'bg-[#FBF1D6] text-[#7A5B12]', dot: '#E7B95A', active: 'bg-[#E7B95A] text-white' },
  Cotizada: { pill: 'bg-[#E6F2EA] text-[#2F6B4C]', dot: '#4F8A6B', active: 'bg-[#4F8A6B] text-white' },
  Rechazada: { pill: 'bg-[#FDECEC] text-[#A94442]', dot: '#E08A8A', active: 'bg-[#E08A8A] text-white' },
  Todas: { pill: 'bg-[#EEF4F0] text-[#1E3B2F]', dot: '#1E3B2F', active: 'bg-[#1E3B2F] text-white' },
};

const StatusPill = ({ status }) => {
  const s = ESTADOS[status] || ESTADOS.Todas;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full shrink-0 ${s.pill}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  );
};

const TOAST_ACCENT = {
  success: '#7FA392',
  error: '#E08A8A',
  warning: '#E7B95A',
  info: '#8E909C',
};

const formatearFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const QuotationsPage = ({ onLogout }) => {
  usePageTitle();

  const { toasts, showSuccess, showError } = useToast(3000);
  const { confirm, ConfirmDialog } = useConfirm();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Pendiente');

  const [respuestas, setRespuestas] = useState({}); // { [id]: { finalPrice, adminMessage } }
  const [enviando, setEnviando] = useState(null);
  const [detalleAbierto, setDetalleAbierto] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getAllQuotations();
      setQuotations(data);
    } catch (err) {
      showError(err.message || 'No se pudieron cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const getRespuesta = (id) => respuestas[id] || { finalPrice: '', adminMessage: '' };
  const setRespuesta = (id, campo, valor) => {
    setRespuestas(prev => ({ ...prev, [id]: { ...getRespuesta(id), [campo]: valor } }));
  };

  const handleResponder = async (id, status) => {
    const { finalPrice, adminMessage } = getRespuesta(id);

    if (status === 'Cotizada' && (!finalPrice || isNaN(finalPrice) || Number(finalPrice) < 0)) {
      showError('Escribe un precio final válido');
      return;
    }

    const ok = await confirm(
      status === 'Cotizada'
        ? `¿Enviar esta cotización al cliente por $${Number(finalPrice).toFixed(2)}?`
        : '¿Rechazar esta solicitud de cotización?',
      { danger: status !== 'Cotizada' }
    );
    if (!ok) return;

    setEnviando(id);
    try {
      await respondQuotation(id, { status, finalPrice: status === 'Cotizada' ? Number(finalPrice) : undefined, adminMessage });
      setQuotations(prev => prev.map(q => q._id === id ? { ...q, status, finalPrice: status === 'Cotizada' ? Number(finalPrice) : q.finalPrice, adminMessage } : q));
      showSuccess(status === 'Cotizada' ? 'Cotización enviada al cliente' : 'Solicitud rechazada');
    } catch (err) {
      showError(err.message || 'No se pudo responder la cotización');
    } finally {
      setEnviando(null);
    }
  };

  const visibles = filtro === 'Todas' ? quotations : quotations.filter(q => q.status === filtro);
  const contar = (estado) => (estado === 'Todas' ? quotations.length : quotations.filter(q => q.status === estado).length);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
      <style>{STYLES}</style>
      <Sidebar onLogout={onLogout} />
      {ConfirmDialog}

      {/* Toast Notifications */}
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[60] space-y-2">
        {toasts.map((toast) => {
          const accent = TOAST_ACCENT[toast.type] || TOAST_ACCENT.info;
          return (
            <div
              key={toast.id}
              className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-white border-l-[3px] rounded-2xl px-4 sm:px-5 py-3 shadow-[0_12px_30px_-12px_rgba(30,59,47,0.3)] text-sm font-medium text-gray-800 transition-all transform"
              style={{ minWidth: '280px', borderLeftColor: accent }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
              {toast.message}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">
          {/* Header */}
          <div className="mb-6 m503-fade-up">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
              <CalendarIcon className="w-3 h-3" />
              Eventos
            </span>
            <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
              <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Gestión de</span>
              <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">cotizaciones</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Solicitudes de cotización para eventos — revisa y responde con un precio final
            </p>
            <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-6"></div>
          </div>

          {/* Filtros por estado */}
          <div className="flex items-center gap-2 mb-5 flex-wrap m503-fade-up" style={{ animationDelay: '.06s' }}>
            {['Pendiente', 'Cotizada', 'Rechazada', 'Todas'].map(estado => {
              const s = ESTADOS[estado];
              const activo = filtro === estado;
              return (
                <button
                  key={estado}
                  onClick={() => setFiltro(estado)}
                  className={`inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activo
                      ? `${s.active} shadow-[0_10px_22px_-12px_rgba(30,59,47,0.6)]`
                      : 'bg-white/80 border border-white text-gray-700 hover:bg-white'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: activo ? 'rgba(255,255,255,0.9)' : s.dot }}
                  />
                  {estado}
                  <span
                    className={`min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                      activo ? 'bg-white/25 text-white' : 'bg-[#F2F6F3] text-gray-600'
                    }`}
                  >
                    {contar(estado)}
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className={`${cardClass} text-center py-16 text-gray-400`}>Cargando cotizaciones...</div>
          ) : visibles.length === 0 ? (
            <div className={`${cardClass} p-16 text-center`}>
              <LeafIcon className="w-7 h-7 mx-auto text-[#8DBFA3]" />
              <p className="mt-2 m503-serif text-xl text-gray-500">No hay cotizaciones en estado "{filtro}".</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibles.map((q, idx) => {
                const abierto = detalleAbierto === q._id;
                const respuesta = getRespuesta(q._id);
                const estimado = Number(q.estimatedTotal) || 0;
                const precio = Number(respuesta.finalPrice);
                const hayPrecio = respuesta.finalPrice !== '' && !isNaN(precio);
                const diferencia = hayPrecio ? precio - estimado : 0;

                return (
                  <div
                    key={q._id}
                    className={`m503-fade-up ${cardClass} p-2`}
                    style={{ animationDelay: `${0.1 + Math.min(idx, 6) * 0.04}s` }}
                  >
                    {/* Encabezado de la tarjeta */}
                    <div className="p-3 sm:p-4 flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-11 h-11 rounded-2xl bg-[#1E3B2F] text-white text-base font-bold flex items-center justify-center shrink-0">
                          {(q.client?.name || '?').charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-baseline gap-x-2 text-gray-900">
                            <span className="text-base font-bold">{q.client?.name || 'Cliente'}</span>
                            <span className="m503-serif text-lg text-[#4F8A6B]">{q.eventType}</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                            {q.client?.email && (
                              <span className="inline-flex items-center gap-1.5"><MailIcon className="w-3.5 h-3.5 text-[#8DBFA3]" /> {q.client.email}</span>
                            )}
                            {q.client?.phone && (
                              <span className="inline-flex items-center gap-1.5"><PhoneIcon className="w-3.5 h-3.5 text-[#8DBFA3]" /> {q.client.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <StatusPill status={q.status} />
                        <span className="text-[11px] text-gray-400">Pedida el {formatearFecha(q.createdAt)}</span>
                      </div>
                    </div>

                    {/* Datos rápidos */}
                    <div className="px-3 sm:px-4 pb-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-[#F5FAF7] px-3 py-1.5 rounded-full">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#4F8A6B]" />
                        {formatearFecha(q.eventDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-[#F5FAF7] px-3 py-1.5 rounded-full">
                        <LeafIcon className="w-3.5 h-3.5 text-[#4F8A6B]" />
                        {q.items.length} producto{q.items.length !== 1 ? 's' : ''}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-[#F5FAF7] px-3 py-1.5 rounded-full">
                        Est. <span className="font-bold text-[#1E3B2F]">${estimado.toFixed(2)}</span>
                      </span>
                      {q.guestCount && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-[#F5FAF7] px-3 py-1.5 rounded-full">
                          <UsersIcon className="w-3.5 h-3.5 text-[#4F8A6B]" />
                          {q.guestCount} invitados
                        </span>
                      )}
                    </div>

                    <div className="px-3 sm:px-4">
                      <button
                        onClick={() => setDetalleAbierto(abierto ? null : q._id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#4F8A6B] hover:text-[#1E3B2F] transition-colors"
                      >
                        {abierto ? 'Ocultar detalle' : 'Ver detalle'}
                        <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${abierto ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Detalle */}
                    {abierto && (
                      <div className="mx-2 sm:mx-3 mt-3 rounded-2xl bg-[#F5FAF7] border border-[#EEF4F0] p-4 space-y-4">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2">Productos solicitados</p>
                          <ul className="divide-y divide-[#E7EFEA]">
                            {q.items.map((it, i) => (
                              <li key={i} className="py-2 text-sm text-gray-800 flex items-center justify-between gap-3">
                                <span className="min-w-0">
                                  <span className="font-medium">{it.productName}</span>{' '}
                                  <span className="m503-serif text-[#4F8A6B]">{it.productType}</span>{' '}
                                  <span className="text-xs font-semibold text-gray-500 bg-white px-1.5 py-0.5 rounded-md">x{it.quantity}</span>
                                </span>
                                <span className="font-semibold text-[#1E3B2F] shrink-0">${(it.unitPrice * it.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex justify-between text-sm font-bold text-gray-900 border-t-2 border-dashed border-[#D3E6DA] mt-2 pt-3">
                            <span>Total estimado</span>
                            <span className="text-[#1E3B2F]">${estimado.toFixed(2)}</span>
                          </div>
                        </div>

                        {q.location && (
                          <p className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                            <PinIcon className="w-4 h-4 text-[#4F8A6B]" />
                            <span className="font-semibold">Lugar:</span> {q.location}
                            {q.locationLat && q.locationLng && (
                              <a
                                href={`https://www.google.com/maps?q=${q.locationLat},${q.locationLng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-semibold text-[#4F8A6B] bg-white px-2.5 py-1 rounded-full hover:bg-[#1E3B2F] hover:text-white transition-colors"
                              >
                                Ver en el mapa
                              </a>
                            )}
                          </p>
                        )}

                        {q.specialRequirements && (
                          <div>
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-1">Requerimientos especiales</p>
                            <p className="m503-serif text-[17px] text-gray-700 leading-snug">“{q.specialRequirements}”</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Respuesta */}
                    {q.status === 'Pendiente' ? (
                      <div className="mx-2 sm:mx-3 mt-3 mb-2 pt-4 border-t border-[#EEF4F0] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="relative flex-1 group">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold group-focus-within:text-[#4F8A6B]">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Precio final"
                              value={respuesta.finalPrice}
                              onChange={(e) => setRespuesta(q._id, 'finalPrice', e.target.value)}
                              className={`${fieldClass} pl-8 pr-4 py-2.5`}
                            />
                          </div>
                          {/* Solo visual: compara el precio escrito con el estimado */}
                          {hayPrecio && estimado > 0 && (
                            <span
                              className={`self-start sm:self-auto shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${
                                diferencia === 0
                                  ? 'bg-[#EEF4F0] text-gray-600'
                                  : diferencia > 0
                                    ? 'bg-[#E6F2EA] text-[#2F6B4C]'
                                    : 'bg-[#FBF1D6] text-[#7A5B12]'
                              }`}
                            >
                              {diferencia === 0
                                ? 'Igual al estimado'
                                : `${diferencia > 0 ? '+' : '−'}$${Math.abs(diferencia).toFixed(2)} vs estimado`}
                            </span>
                          )}
                        </div>
                        <textarea
                          placeholder="Mensaje para el cliente (opcional)"
                          rows={2}
                          value={respuesta.adminMessage}
                          onChange={(e) => setRespuesta(q._id, 'adminMessage', e.target.value)}
                          className={`${fieldClass} px-4 py-2.5 resize-none`}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResponder(q._id, 'Rechazada')}
                            disabled={enviando === q._id}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border-2 border-[#F2D6D6] bg-white text-[#C65F5F] hover:bg-[#E08A8A] hover:border-[#E08A8A] hover:text-white transition-all text-sm font-semibold disabled:opacity-50"
                          >
                            <XIcon className="w-4 h-4" />
                            Rechazar
                          </button>
                          <button
                            onClick={() => handleResponder(q._id, 'Cotizada')}
                            disabled={enviando === q._id}
                            className="group flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1E3B2F] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_16px_32px_-14px_rgba(30,59,47,0.75)] hover:bg-[#162E24] transition-all disabled:opacity-50"
                          >
                            {enviando === q._id ? (
                              <>
                                <Spinner />
                                Enviando...
                              </>
                            ) : (
                              <>
                                Enviar cotización
                                <SendIcon className="w-4 h-4 rotate-90 transition-transform group-hover:translate-x-0.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mx-2 sm:mx-3 mt-3 mb-2 pt-4 border-t border-[#EEF4F0]">
                        {q.status === 'Cotizada' && (
                          <p className="flex items-baseline gap-2 text-sm text-gray-600">
                            Precio enviado
                            <span className="text-xl font-black text-[#1E3B2F]">${Number(q.finalPrice).toFixed(2)}</span>
                          </p>
                        )}
                        {q.adminMessage && (
                          <p className="m503-serif text-[17px] text-gray-600 mt-1 leading-snug">“{q.adminMessage}”</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationsPage;