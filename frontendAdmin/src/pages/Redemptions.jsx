import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm.jsx';
import usePageTitle from '../hooks/usePageTitle';
import { getProductRedemptions, markRedemptionDelivered } from '../api/redemptionsAdminApi';

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

  @keyframes m503-pop {
    from { opacity: 0; transform: translateY(8px) scale(.98); }
    to   { opacity: 1; transform: none; }
  }
  .m503-pop { animation: m503-pop .3s cubic-bezier(.22,1,.36,1) both; }

  .m503-scroll { scrollbar-width: thin; scrollbar-color: #D3E6DA transparent; }
  .m503-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .m503-scroll::-webkit-scrollbar-thumb { background: #D3E6DA; border-radius: 9999px; }
  .m503-scroll::-webkit-scrollbar-track { background: transparent; }

  @media (prefers-reduced-motion: reduce) {
    .m503-fade-up, .m503-pop { animation: none; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Íconos (aceptan className)
   ───────────────────────────────────────────────────────────── */
const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PhoneIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MailIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PinIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LeafIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19c2-4 5-7 9-9" />
  </svg>
);

const BoxIcon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Piezas visuales
   ───────────────────────────────────────────────────────────── */
const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]';

const formatearFecha = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-SV', { year: 'numeric', month: 'short', day: 'numeric' });
};

// El teléfono/dirección "principal" del cliente están sueltos en el
// documento (phone/address), pero también puede tener varias direcciones
// guardadas (addresses[]) cada una con su propio teléfono -- se muestra la
// principal primero, y si no hay, la primera dirección guardada como
// respaldo, para que el admin siempre tenga algo con qué contactar.
const obtenerContacto = (client) => {
  if (!client) return { telefono: null, direccion: null };
  if (client.phone || client.address) {
    return { telefono: client.phone, direccion: client.address };
  }
  const primera = client.addresses?.[0];
  return {
    telefono: primera?.phone || null,
    direccion: primera ? `${primera.addressLine || ''}`.trim() : null
  };
};

const RedemptionsPage = ({ onLogout }) => {
  usePageTitle();

  const { toasts, showSuccess, showError } = useToast(3000);
  const { confirm, ConfirmDialog } = useConfirm();

  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('pendientes'); // 'pendientes' | 'todos'

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getProductRedemptions();
      setRedemptions(data);
    } catch (err) {
      showError(err.message || 'No se pudieron cargar los canjes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleMarcarEntregado = async (id) => {
    const ok = await confirm('¿Ya coordinaste y entregaste este producto al cliente?', { danger: false, confirmText: 'Sí, ya se entregó' });
    if (!ok) return;
    try {
      await markRedemptionDelivered(id);
      setRedemptions(prev => prev.map(r => r._id === id ? { ...r, delivered: true } : r));
      showSuccess('Marcado como entregado');
    } catch (err) {
      showError(err.message || 'No se pudo actualizar');
    }
  };

  const visibles = filtro === 'pendientes' ? redemptions.filter(r => !r.delivered) : redemptions;
  const pendientesCount = redemptions.filter(r => !r.delivered).length;

  const tabBtn = (active) =>
    `inline-flex items-center gap-2 h-9 px-4 rounded-full text-xs font-semibold transition-all ${
      active
        ? 'bg-[#1E3B2F] text-white shadow-[0_10px_22px_-12px_rgba(30,59,47,0.7)]'
        : 'text-gray-600 hover:bg-[#EEF4F0] hover:text-[#1E3B2F]'
    }`;

  const tabCount = (active) =>
    `min-w-[1.4rem] px-1.5 py-0.5 rounded-full text-[10px] font-bold text-center ${
      active ? 'bg-white/20 text-white' : 'bg-[#E6F2EA] text-[#4F8A6B]'
    }`;

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
      <style>{STYLES}</style>
      <Sidebar onLogout={onLogout} />
      {ConfirmDialog}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`m503-pop flex items-center gap-2.5 px-5 py-3 rounded-2xl backdrop-blur-md shadow-[0_18px_36px_-18px_rgba(30,59,47,0.6)] font-medium text-sm ${
              toast.type === 'success'
                ? 'bg-[#1E3B2F]/95 text-white'
                : toast.type === 'error'
                  ? 'bg-[#E08A8A]/95 text-white'
                  : 'bg-[#4F8A6B]/95 text-white'
            }`}
            style={{ minWidth: '280px' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: toast.type === 'success' ? '#8DBFA3' : '#FFFFFF' }}
            />
            {toast.message}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto m503-scroll p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">
        {/* Header */}
        <div className="mb-6 m503-fade-up">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#8DBFA3] opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[#4F8A6B]" />
            </span>
            Activo
          </span>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Canjes de</span>
            <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">productos</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Recompensas físicas canjeadas por clientes: coordina la entrega y márcalas cuando estén listas
          </p>
          <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-5"></div>
        </div>

        {/* Filtros */}
        <div className={`m503-fade-up ${cardClass} p-2 mb-4 inline-flex items-center gap-1`} style={{ animationDelay: '.06s' }}>
          <button onClick={() => setFiltro('pendientes')} className={tabBtn(filtro === 'pendientes')}>
            Pendientes
            <span className={tabCount(filtro === 'pendientes')}>{pendientesCount}</span>
          </button>
          <button onClick={() => setFiltro('todos')} className={tabBtn(filtro === 'todos')}>
            Todos
            <span className={tabCount(filtro === 'todos')}>{redemptions.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Cargando canjes...</div>
        ) : visibles.length === 0 ? (
          <div className={`m503-fade-up ${cardClass} py-16 text-center`} style={{ animationDelay: '.12s' }}>
            <BoxIcon className="w-7 h-7 mx-auto text-[#8DBFA3]" />
            <p className="mt-2 m503-serif text-xl text-gray-500">
              {filtro === 'pendientes'
                ? 'No hay canjes pendientes de entregar'
                : 'Todavía no hay ningún canje de producto'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {visibles.map((r, i) => {
              const { telefono, direccion } = obtenerContacto(r.client);
              return (
                <div
                  key={r._id}
                  className="m503-fade-up bg-white rounded-[1.4rem] border border-[#EEF4F0] p-5 shadow-[0_12px_28px_-22px_rgba(30,59,47,0.55)] hover:-translate-y-1 hover:shadow-[0_24px_45px_-26px_rgba(30,59,47,0.55)] transition-all flex flex-col"
                  style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{r.title}</p>
                      <div className="mt-1 flex items-center flex-wrap gap-x-2 gap-y-1">
                        <span className="text-xs text-gray-500">{formatearFecha(r.createdAt)}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E6F2EA] text-[#2F6B4D] text-[10px] font-bold">
                          <LeafIcon className="w-2.5 h-2.5" />
                          {r.cost} hojas
                        </span>
                      </div>
                    </div>
                    {r.delivered ? (
                      <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#E6F2EA] text-[#2F6B4D]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4F8A6B]" />
                        Entregado
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#FBF1D6] text-[#7A5B12]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E7B95A]" />
                        Pendiente
                      </span>
                    )}
                  </div>

                  <div className="border-t border-[#EEF4F0] pt-3 space-y-1.5 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{r.client?.name || 'Cliente'}</p>
                    {r.client?.email && (
                      <p className="text-xs text-gray-600 flex items-center gap-2 break-all">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#E6F2EA] text-[#4F8A6B]"><MailIcon /></span>
                        {r.client.email}
                      </p>
                    )}
                    {telefono && (
                      <p className="text-xs text-gray-600 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#E6F2EA] text-[#4F8A6B]"><PhoneIcon /></span>
                        {telefono}
                      </p>
                    )}
                    {direccion && (
                      <p className="text-xs text-gray-500 flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#F2F6F3] text-gray-400"><PinIcon /></span>
                        <span className="pt-0.5">{direccion}</span>
                      </p>
                    )}
                    {!telefono && !direccion && !r.client?.email && (
                      <p className="m503-serif text-sm text-gray-400">Sin datos de contacto guardados</p>
                    )}
                  </div>

                  {!r.delivered && (
                    <button
                      onClick={() => handleMarcarEntregado(r._id)}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1E3B2F] text-white text-sm font-semibold shadow-[0_16px_32px_-14px_rgba(30,59,47,0.75)] hover:bg-[#162E24] hover:-translate-y-0.5 transition-all"
                    >
                      <CheckIcon />
                      Marcar como entregado
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RedemptionsPage;