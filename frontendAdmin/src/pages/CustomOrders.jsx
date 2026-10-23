import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../hooks/useToast';
import usePageTitle from '../hooks/usePageTitle';
import { getAllCustomOrders, updateCustomOrderStatus, setCustomOrderPrice } from '../api/customOrdersAdminApi';

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
   Íconos
   ───────────────────────────────────────────────────────────── */
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

const BrushIcon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const ChevronDownIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Piezas visuales
   ───────────────────────────────────────────────────────────── */
const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]';

const inputClass =
  'w-full px-4 py-2.5 rounded-2xl border-2 border-transparent bg-[#F2F6F3] hover:bg-[#ECF3EE] focus:bg-white focus:border-[#8DBFA3] focus:ring-4 focus:ring-[#8DBFA3]/20 focus:outline-none transition-all text-gray-900 text-sm placeholder:text-gray-400';

const formatearFecha = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-SV', { year: 'numeric', month: 'short', day: 'numeric' });
};

const STATUS_OPTIONS = ['Pendiente', 'Aceptado', 'Rechazado', 'En proceso', 'Completo'];
// "En proceso" y "Completo" ya NO se pueden elegir a mano -- los pone el
// sistema solo (En proceso cuando el cliente lo agrega al carrito,
// Completo cuando se marca el PEDIDO real como entregado en Órdenes). Antes
// se podían forzar directo desde aquí, lo que dejaba solicitudes marcadas
// "Completo" sin ningún pedido real detrás -- por eso no aparecía el botón
// de reseña del lado del cliente.
const ESTADOS_MANUALES = ['Pendiente', 'Aceptado', 'Rechazado'];
const ESTADOS_AUTOMATICOS = ['En proceso', 'Completo'];

const getStatusColor = (status) => {
  switch (status) {
    case 'Aceptado': return 'bg-[#E6F2EA] text-[#2F6B4D]';
    case 'Pendiente': return 'bg-[#FBF1D6] text-[#7A5B12]';
    case 'En proceso': return 'bg-[#E3F0F4] text-[#2F6A7A]';
    case 'Completo': return 'bg-[#1E3B2F] text-white';
    case 'Rechazado': return 'bg-[#FDF3F3] text-[#A94A4A]';
    default: return 'bg-[#F3F4F6] text-gray-600';
  }
};

const getStatusDot = (status) => {
  switch (status) {
    case 'Aceptado': return '#4F8A6B';
    case 'Pendiente': return '#E7B95A';
    case 'En proceso': return '#5BA3B8';
    case 'Completo': return '#8DBFA3';
    case 'Rechazado': return '#E08A8A';
    default: return '#9CA3AF';
  }
};

// El teléfono/dirección "principal" del cliente están sueltos en el
// documento (phone/address), pero también puede tener varias direcciones
// guardadas (addresses[]) -- se muestra la principal primero, y si no hay,
// la primera dirección guardada como respaldo.
const obtenerContacto = (client) => {
  if (!client) return { telefono: null };
  if (client.phone) return { telefono: client.phone };
  const primera = client.addresses?.[0];
  return { telefono: primera?.phone || null };
};

const CustomOrdersPage = ({ onLogout }) => {
  usePageTitle();

  const { toasts, showSuccess, showError } = useToast(3000);

  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [precios, setPrecios] = useState({});
  const [guardandoPrecio, setGuardandoPrecio] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getAllCustomOrders();
      setCustomOrders(data);
    } catch (err) {
      showError(err.message || 'No se pudieron cargar las solicitudes de personalización');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleCambiarEstado = async (id, status) => {
    try {
      await updateCustomOrderStatus(id, status);
      setCustomOrders(prev => prev.map(co => co._id === id ? { ...co, status } : co));
      showSuccess('Estado actualizado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo actualizar el estado');
    }
  };

  const getPrecio = (co) => precios[co._id] ?? (co.price ?? '');

  const handleGuardarPrecio = async (id) => {
    const valor = Number(precios[id]);
    if (!precios[id] || isNaN(valor) || valor < 0) {
      showError('Escribe un precio válido');
      return;
    }
    setGuardandoPrecio(id);
    try {
      await setCustomOrderPrice(id, valor);
      setCustomOrders(prev => prev.map(co => co._id === id ? { ...co, price: valor } : co));
      showSuccess('Precio guardado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo guardar el precio');
    } finally {
      setGuardandoPrecio(null);
    }
  };

  const visibles = filtro === 'todos' ? customOrders : customOrders.filter(co => co.status === filtro);

  const tabBtn = (active) =>
    `inline-flex items-center gap-2 h-9 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
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
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Órdenes</span>
            <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">personalizadas</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Solicitudes de personalización de macetas (texto, detalles en la base, etc.): coordina con el cliente y actualiza el estado
          </p>
          <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-5"></div>
        </div>

        {/* Filtros por estado */}
        <div className={`m503-fade-up ${cardClass} p-2 mb-4 flex items-center gap-1 overflow-x-auto m503-scroll`} style={{ animationDelay: '.06s' }}>
          <button onClick={() => setFiltro('todos')} className={tabBtn(filtro === 'todos')}>
            Todos
            <span className={tabCount(filtro === 'todos')}>{customOrders.length}</span>
          </button>
          {STATUS_OPTIONS.map(estado => (
            <button key={estado} onClick={() => setFiltro(estado)} className={tabBtn(filtro === estado)}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: filtro === estado ? '#FFFFFF' : getStatusDot(estado) }}
              />
              {estado}
              <span className={tabCount(filtro === estado)}>
                {customOrders.filter(co => co.status === estado).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Cargando solicitudes...</div>
        ) : visibles.length === 0 ? (
          <div className={`m503-fade-up ${cardClass} py-16 text-center`} style={{ animationDelay: '.12s' }}>
            <BrushIcon className="w-7 h-7 mx-auto text-[#8DBFA3]" />
            <p className="mt-2 m503-serif text-xl text-gray-500">
              {filtro === 'todos'
                ? 'Todavía no hay ninguna solicitud de personalización'
                : `No hay solicitudes en estado "${filtro}"`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {visibles.map((co, i) => {
              const { telefono } = obtenerContacto(co.client);
              return (
                <div
                  key={co._id}
                  className="m503-fade-up bg-white rounded-[1.4rem] border border-[#EEF4F0] p-5 shadow-[0_12px_28px_-22px_rgba(30,59,47,0.55)] flex flex-col"
                  style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {co.productImage && (
                      <img
                        src={co.productImage}
                        alt={co.productName}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-[#EEF4F0]"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{co.productName}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-[#4F8A6B] bg-[#E6F2EA] px-2 py-0.5 rounded-full">
                        ✎ Personalizado
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatearFecha(co.createdAt)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${getStatusColor(co.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: getStatusDot(co.status) }} />
                      {co.status}
                    </span>
                  </div>

                  <div className="border-t border-[#EEF4F0] pt-3 space-y-3">
                    <div className="p-3 rounded-2xl bg-[#F5FAF7]">
                      <p className="text-[11px] font-semibold text-[#4F8A6B] uppercase tracking-[0.14em] mb-1">Pide</p>
                      <p className="text-sm text-gray-900 leading-relaxed">{co.description}</p>
                    </div>

                    {co.referenceImage && (
                      <img
                        src={co.referenceImage}
                        alt="Referencia"
                        className="w-20 h-20 rounded-2xl object-cover border border-[#EEF4F0]"
                      />
                    )}

                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-gray-900">{co.client?.name || 'Cliente'}</p>
                      {co.client?.email && (
                        <p className="text-xs text-gray-600 flex items-center gap-2 break-all">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#E6F2EA] text-[#4F8A6B]"><MailIcon /></span>
                          {co.client.email}
                        </p>
                      )}
                      {telefono && (
                        <p className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-[#E6F2EA] text-[#4F8A6B]"><PhoneIcon /></span>
                          {telefono}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-[11px] font-semibold text-[#4F8A6B] uppercase tracking-[0.14em] mb-1.5">
                      Precio de esta unidad personalizada
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={getPrecio(co)}
                          onChange={(e) => setPrecios(prev => ({ ...prev, [co._id]: e.target.value }))}
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                      <button
                        onClick={() => handleGuardarPrecio(co._id)}
                        disabled={guardandoPrecio === co._id}
                        className="px-5 py-2.5 rounded-2xl bg-[#1E3B2F] text-white text-sm font-semibold shadow-[0_12px_24px_-14px_rgba(30,59,47,0.75)] hover:bg-[#162E24] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 shrink-0"
                      >
                        {guardandoPrecio === co._id ? '...' : 'Guardar'}
                      </button>
                    </div>
                    {co.price == null && (
                      <p className="text-[11px] text-[#7A5B12] mt-1.5">
                        El cliente no podrá agregarlo al carrito hasta que definas un precio.
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-[11px] font-semibold text-[#4F8A6B] uppercase tracking-[0.14em] mb-1.5">Estado</label>
                    {ESTADOS_AUTOMATICOS.includes(co.status) ? (
                      <div className={`px-4 py-3 rounded-2xl text-sm font-semibold ${getStatusColor(co.status)}`}>
                        {co.status}
                        <p className={`text-[11px] font-normal mt-1 ${co.status === 'Completo' ? 'text-white/70' : 'text-gray-600'}`}>
                          {co.status === 'En proceso'
                            ? 'Ya se agregó al carrito del cliente. Pasará a "Completo" solo cuando marques el PEDIDO (no esta solicitud) como entregado en Órdenes.'
                            : 'El pedido que contiene esta unidad ya se marcó como entregado.'}
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={co.status}
                          onChange={(e) => handleCambiarEstado(co._id, e.target.value)}
                          className={`${inputClass} appearance-none pr-10 cursor-pointer font-medium`}
                        >
                          {ESTADOS_MANUALES.map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4F8A6B]">
                          <ChevronDownIcon />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomOrdersPage;