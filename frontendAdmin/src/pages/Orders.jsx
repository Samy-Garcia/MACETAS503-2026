import React, { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import OrderDetailModal from '../components/OrderDetailModal';
import { useCrud } from '../hooks/useCrud';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm.jsx';
import { getOrders, updateOrderStatus, deleteOrder, forceOrderPickup } from '../api/ordersApi';
import usePageTitle from '../hooks/usePageTitle';

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
   Íconos (ahora aceptan className para tamaño y color)
   ───────────────────────────────────────────────────────────── */
const SearchIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const EyeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const DeleteIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PackageIcon2 = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ClockIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronDownIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronLeftIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const AlertIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
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

const STATUS_OPTIONS = ['Pendiente', 'Aceptado', 'En proceso', 'Completo', 'Rechazado'];

/* ─────────────────────────────────────────────────────────────
   Colores por estatus: cada estado mantiene su propio tono para
   distinguirse de un vistazo, pero suavizados para que combinen
   con la paleta verde/arena del sistema.
   ───────────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  todos: {
    pill: 'bg-[#EEF4F0] text-[#1E3B2F]',
    active: 'bg-[#1E3B2F] text-white shadow-[0_10px_22px_-12px_rgba(30,59,47,0.7)]',
    dot: '#4F8A6B',
  },
  Pendiente: {
    pill: 'bg-[#FBF1D6] text-[#7A5B12]',
    active: 'bg-[#E7B95A] text-white shadow-[0_10px_22px_-12px_rgba(231,185,90,0.8)]',
    dot: '#E7B95A',
  },
  Aceptado: {
    pill: 'bg-[#E6F2EA] text-[#2F6B4C]',
    active: 'bg-[#8DBFA3] text-white shadow-[0_10px_22px_-12px_rgba(141,191,163,0.9)]',
    dot: '#8DBFA3',
  },
  'En proceso': {
    pill: 'bg-[#E4EEF5] text-[#2E5C7A]',
    active: 'bg-[#7FA7C4] text-white shadow-[0_10px_22px_-12px_rgba(127,167,196,0.9)]',
    dot: '#7FA7C4',
  },
  Completo: {
    pill: 'bg-[#1E3B2F] text-white',
    active: 'bg-[#4F8A6B] text-white shadow-[0_10px_22px_-12px_rgba(79,138,107,0.9)]',
    dot: '#4F8A6B',
  },
  Rechazado: {
    pill: 'bg-[#FDECEC] text-[#A94442]',
    active: 'bg-[#E08A8A] text-white shadow-[0_10px_22px_-12px_rgba(224,138,138,0.9)]',
    dot: '#E08A8A',
  },
};

const FILTERS = [
  { value: 'todos', label: 'Todas' },
  ...STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
];

const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]';

const ordersApi = {
  getAll: getOrders,
  remove: deleteOrder
};

const OrdersPage = ({ onLogout }) => {
  usePageTitle();

  const { showSuccess, showError } = useToast(3000);
  const { confirm, ConfirmDialog } = useConfirm();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const {
    data,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    currentPage,
    setCurrentPage,
    filteredData,
    currentData,
    totalPages,
    startIndex,
    itemsPerPage,
    deleteItem,
    setData
  } = useCrud(ordersApi);

  const getStatusStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.todos;

  const handleDelete = async (id) => {
    const ok = await confirm('¿Estás seguro de eliminar esta orden?');
    if (!ok) return;
    try {
      await deleteItem(id);
      showSuccess('Orden eliminada exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo eliminar la orden');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      setData(prev => prev.map(order => order._id === id ? { ...order, status: newStatus } : order));
      showSuccess('Estatus actualizado');
    } catch (err) {
      showError(err.message || 'No se pudo actualizar el estatus');
    }
  };

  // Pasa una orden de envío a domicilio a recogida en tienda (ej: la
  // dirección queda muy lejos o el viaje es demasiado complicado). Se
  // relanza el error para que el modal lo muestre en su propio formulario;
  // aquí solo actualizamos la lista y el detalle abierto cuando sí funciona.
  const handleForcePickup = async (id, { pickupLocationId, reason }) => {
    try {
      const result = await forceOrderPickup(id, { pickupLocationId, reason });
      const cambios = {
        deliveryMethod: result.deliveryMethod,
        pickupLocation: result.pickupLocation,
        deliveryChangedByAdmin: result.deliveryChangedByAdmin,
        deliveryChangeReason: result.deliveryChangeReason
      };
      setData(prev => prev.map(order => order._id === id ? { ...order, ...cambios } : order));
      setSelectedOrder(prev => (prev && prev._id === id ? { ...prev, ...cambios } : prev));
      showSuccess('Orden cambiada a recogida en tienda');
    } catch (err) {
      throw err;
    }
  };

  const stats = useMemo(() => ([
    { label: 'Nuevas Ordenes', value: data.length, icon: PackageIcon2, tint: '#1E3B2F', iconColor: '#FFFFFF', blob: '#CFE6D8' },
    { label: 'Ordenes Pendientes', value: data.filter(o => o.status === 'Pendiente').length, icon: ClockIcon, tint: '#FBF1D6', iconColor: '#B8892A', blob: '#F6E6BD' },
    { label: 'Ordenes Completas', value: data.filter(o => o.status === 'Completo').length, icon: CheckIcon, tint: '#E6F2EA', iconColor: '#4F8A6B', blob: '#DCEDE3' },
    { label: 'Ordenes Rechazadas', value: data.filter(o => o.status === 'Rechazado').length, icon: XIcon, tint: '#FDECEC', iconColor: '#C65F5F', blob: '#F8DADA' }
  ]), [data]);

  const pageBtn = (active) =>
    `min-w-[2.25rem] h-9 px-3 text-sm font-semibold rounded-full transition-all ${
      active
        ? 'bg-[#1E3B2F] text-white shadow-[0_10px_22px_-12px_rgba(30,59,47,0.7)]'
        : 'text-gray-600 hover:bg-[#EEF4F0] hover:text-[#1E3B2F]'
    }`;

  const navBtn = (disabled) =>
    `inline-flex items-center gap-1 h-9 px-3 text-sm font-medium rounded-full transition-all ${
      disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-[#EEF4F0] hover:text-[#1E3B2F]'
    }`;

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
      <style>{STYLES}</style>
      <Sidebar onLogout={onLogout} />
      {ConfirmDialog}

      <div className="flex-1 overflow-auto">
        <div className="p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">
          {/* Header */}
          <div className="mb-8 m503-fade-up">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#8DBFA3] opacity-75 animate-ping" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-[#4F8A6B]" />
                  </span>
                  Activo
                </span>
                <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
                  <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Gestión de</span>
                  <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">órdenes</span>
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-500">Maneja y visualiza el registro de órdenes</p>
              </div>
              <div className="flex items-center gap-2 pl-2 pr-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white shadow-[0_12px_28px_-18px_rgba(30,59,47,0.6)] self-start md:self-auto">
                <span className="w-7 h-7 rounded-full bg-[#E6F2EA] text-[#4F8A6B] flex items-center justify-center">
                  <ClockIcon className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs text-gray-500 font-medium">Última actualización</span>
                <span className="w-px h-4 bg-[#D3E6DA]"></span>
                <span className="text-xs font-bold text-[#1E3B2F]">Hoy, 14:30</span>
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-6"></div>
          </div>

          {/* Los errores se mantienen en rojo suave para que se distingan */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-[#FFF7F7] text-[#8A3B3B] rounded-2xl border border-[#F2C9C9]">
              <AlertIcon className="w-5 h-5 shrink-0 text-[#C65F5F]" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`m503-fade-up relative overflow-hidden ${cardClass} hover:shadow-[0_26px_55px_-28px_rgba(30,59,47,0.5)] transition-shadow p-5 sm:p-6`}
                  style={{ animationDelay: `${0.05 + index * 0.05}s` }}
                >
                  <div className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-70" style={{ background: stat.blob }} />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.18em]">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: stat.tint, color: stat.iconColor }}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className={`m503-fade-up ${cardClass} p-3 sm:p-4 mb-5`} style={{ animationDelay: '.25s' }}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex-1 relative w-full group">
                <input
                  type="text"
                  placeholder="Buscar orden..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-transparent bg-[#F2F6F3] hover:bg-[#ECF3EE] focus:bg-white focus:border-[#8DBFA3] focus:ring-4 focus:ring-[#8DBFA3]/20 focus:outline-none transition-all text-gray-900 placeholder:text-gray-400"
                />
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4F8A6B] transition-colors">
                  <SearchIcon className="w-[18px] h-[18px]" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {FILTERS.map(({ value, label }) => {
                  const style = getStatusStyle(value);
                  const isActive = filter === value;
                  return (
                    <button
                      key={value}
                      onClick={() => { setFilter(value); setCurrentPage(1); }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isActive ? style.active : 'bg-white/70 border border-[#E7EFEA] text-gray-700 hover:bg-white hover:border-[#D3E6DA]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: isActive ? 'rgba(255,255,255,0.9)' : style.dot }}
                      />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className={`m503-fade-up ${cardClass} overflow-hidden`} style={{ animationDelay: '.3s' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5FAF7]">
                  <tr>
                    {['Producto', 'Cliente', 'Orden', 'Monto', 'Estatus', 'Acción'].map((h) => (
                      <th key={h} className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF4F0]">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                        Cargando órdenes...
                      </td>
                    </tr>
                  ) : currentData.length > 0 ? (
                    currentData.map((item) => {
                      const style = getStatusStyle(item.status);
                      return (
                        <tr key={item._id} className="hover:bg-[#F5FAF7] transition-colors">
                          <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedOrder(item)}>
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-2xl bg-[#EEF4F0] text-[#4F8A6B] flex items-center justify-center shrink-0">
                                <LeafIcon className="w-4 h-4" />
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{item.product}</p>
                                <p className="text-xs text-gray-500">{item.items} items</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-gray-800">{item.client?.name || 'Cliente eliminado'}</p>
                              <p className="text-xs text-gray-500">{item.clientType}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono font-medium text-[#1E3B2F] bg-[#F2F6F3] px-2.5 py-1 rounded-lg">
                              {item.orderCode}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-[#1E3B2F] whitespace-nowrap">${item.total?.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <div className="relative inline-flex items-center">
                              <span
                                className="pointer-events-none absolute left-3 w-1.5 h-1.5 rounded-full"
                                style={{ background: item.status === 'Completo' ? '#8DBFA3' : style.dot }}
                              />
                              <select
                                value={item.status}
                                onChange={(e) => handleStatusChange(item._id, e.target.value)}
                                className={`appearance-none pl-6 pr-8 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#8DBFA3]/25 ${style.pill}`}
                              >
                                {STATUS_OPTIONS.map(status => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                              <ChevronDownIcon className="pointer-events-none absolute right-2.5 w-3.5 h-3.5 opacity-70" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedOrder(item)}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-[#4F8A6B] bg-[#F2F6F3] hover:bg-[#1E3B2F] hover:text-white transition-all"
                                title="Ver detalle"
                              >
                                <EyeIcon />
                              </button>
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-[#C65F5F] bg-[#FDF3F3] hover:bg-[#E08A8A] hover:text-white transition-all"
                                title="Eliminar"
                              >
                                <DeleteIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <LeafIcon className="w-6 h-6 mx-auto text-[#8DBFA3]" />
                        <p className="mt-2 m503-serif text-lg text-gray-500">No se encontraron órdenes</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-[#EEF4F0] bg-[#F5FAF7]/60">
                <div className="flex items-center flex-wrap gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={navBtn(currentPage === 1)}
                  >
                    <ChevronLeftIcon />
                    Anterior
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={pageBtn(currentPage === page)}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 5 && (
                    <>
                      <span className="px-1 text-gray-300">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={pageBtn(currentPage === totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={navBtn(currentPage === totalPages)}
                  >
                    Siguiente
                    <ChevronRightIcon />
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  <span className="font-semibold text-[#1E3B2F]">
                    {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)}
                  </span>{' '}
                  de {filteredData.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onForcePickup={handleForcePickup} />
    </div>
  );
};

export default OrdersPage;