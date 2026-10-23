import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm.jsx';
import { getPosts, deletePost } from '../api/postApi';
import { getCandles, deleteCandle } from '../api/candlesApi';
import { getPlants, deletePlant } from '../api/plantsApi';
import { getOffers, deleteOffer } from '../api/offersApi';
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
const SearchIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const EditIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PackageIcon2 = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const AlertIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronLeftIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const WarnIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Piezas visuales
   ───────────────────────────────────────────────────────────── */
const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]';

const thClass = 'px-5 py-3 text-left text-[11px] font-semibold text-[#4F8A6B] uppercase tracking-[0.14em] whitespace-nowrap';

const StatCard = ({ label, value, icon: Icon, iconWrap, delay }) => (
  <div
    className={`m503-fade-up ${cardClass} p-5 flex items-center justify-between`}
    style={{ animationDelay: delay }}
  >
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-[#1E3B2F] leading-none">{value}</p>
    </div>
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconWrap}`}>
      <Icon />
    </div>
  </div>
);

const LOW_STOCK_THRESHOLD = 10;

const CATEGORY_CONFIG = [
  { tipo: 'Maceta', fetcher: getPosts, remover: deletePost, routePath: '/macetas', getNombre: (i) => i.name, getPrecio: (i) => i.price },
  { tipo: 'Vela', fetcher: getCandles, remover: deleteCandle, routePath: '/velas', getNombre: (i) => i.name, getPrecio: (i) => i.price },
  { tipo: 'Planta', fetcher: getPlants, remover: deletePlant, routePath: '/plantas', getNombre: (i) => i.name, getPrecio: (i) => i.price },
  { tipo: 'Oferta', fetcher: getOffers, remover: deleteOffer, routePath: '/ofertas', getNombre: (i) => i.title, getPrecio: (i) => i.ofert_price },
];

const getStatus = (stock) => {
  if (!stock || stock <= 0) return 'Fuera de Stock';
  if (stock < LOW_STOCK_THRESHOLD) return 'Stock Bajo';
  return 'En Stock';
};

// Mismos tres estados que usa el catálogo de plantas: verde / ámbar / rojo
const getStatusColor = (status) => {
  switch (status) {
    case 'En Stock': return 'bg-[#E6F2EA] text-[#2F6B4D]';
    case 'Stock Bajo': return 'bg-[#FBF1D6] text-[#7A5B12]';
    case 'Fuera de Stock': return 'bg-[#FDF3F3] text-[#A94A4A]';
    default: return 'bg-[#F3F4F6] text-gray-600';
  }
};

const getStatusDot = (status) => {
  switch (status) {
    case 'En Stock': return '#4F8A6B';
    case 'Stock Bajo': return '#E7B95A';
    case 'Fuera de Stock': return '#E08A8A';
    default: return '#9CA3AF';
  }
};

const FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'En Stock', label: 'En Stock' },
  { value: 'Stock Bajo', label: 'Stock Bajo' },
  { value: 'Fuera de Stock', label: 'Fuera de Stock' },
];

const InventoryPage = ({ onLogout }) => {
  usePageTitle();

  const navigate = useNavigate();
  const { toasts, showSuccess, showError } = useToast(3000);
  const { confirm, ConfirmDialog } = useConfirm();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchInventario = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        CATEGORY_CONFIG.map((cat) => cat.fetcher())
      );

      const merged = [];
      let algunaFallo = false;

      results.forEach((result, index) => {
        const cat = CATEGORY_CONFIG[index];
        if (result.status === 'fulfilled') {
          result.value.forEach((item) => {
            merged.push({
              _id: item._id,
              tipo: cat.tipo,
              nombre: cat.getNombre(item) || 'Sin nombre',
              precio: cat.getPrecio(item),
              stock: item.stock ?? 0,
              image: item.image,
              status: getStatus(item.stock),
              routePath: cat.routePath,
              remover: cat.remover,
            });
          });
        } else {
          algunaFallo = true;
          console.error(`Error al cargar ${cat.tipo}:`, result.reason);
        }
      });

      setProductos(merged);
      if (algunaFallo) {
        setError('Algunas categorías no se pudieron cargar.');
      }
    } catch (err) {
      setError(err.message || 'No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventario();
  }, [fetchInventario]);

  const totalProductos = productos.length;
  const stockBajo = productos.filter(p => p.status === 'Stock Bajo').length;
  const fueraStock = productos.filter(p => p.status === 'Fuera de Stock').length;
  const enStock = productos.filter(p => p.status === 'En Stock').length;

  const filteredData = useMemo(() => {
    return productos.filter(item => {
      const matchesSearch =
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tipo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'todos' || item.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [productos, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleEdit = (item) => {
    navigate(item.routePath);
  };

  const handleDelete = async (item) => {
    const ok = await confirm(`¿Eliminar "${item.nombre}" (${item.tipo})?`);
    if (!ok) {
      return;
    }
    try {
      await item.remover(item._id);
      showSuccess(`${item.tipo} eliminada exitosamente`);
      setProductos(prev => prev.filter(p => p._id !== item._id));
    } catch (err) {
      showError(err.message || `No se pudo eliminar ${item.tipo.toLowerCase()}`);
    }
  };

  const pageBtn = (active) =>
    `min-w-[2rem] h-8 px-2 text-xs font-semibold rounded-full transition-all ${
      active
        ? 'bg-[#1E3B2F] text-white shadow-[0_10px_22px_-12px_rgba(30,59,47,0.7)]'
        : 'text-gray-600 hover:bg-[#EEF4F0] hover:text-[#1E3B2F]'
    }`;

  const navBtn = (disabled) =>
    `inline-flex items-center gap-1 h-8 px-3 text-xs font-medium rounded-full transition-all ${
      disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-[#EEF4F0] hover:text-[#1E3B2F]'
    }`;

  const filterBtn = (active) =>
    `h-9 px-4 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
      active
        ? 'bg-[#1E3B2F] text-white shadow-[0_10px_22px_-12px_rgba(30,59,47,0.7)]'
        : 'bg-[#F2F6F3] text-gray-600 hover:bg-[#E6F2EA] hover:text-[#1E3B2F]'
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
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#8DBFA3] opacity-75 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-[#4F8A6B]" />
                </span>
                Actualizado
              </span>
              <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
                <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Control de</span>
                <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">inventario</span>
              </h1>
              <p className="mt-2 text-sm text-gray-500">Maneja y visualiza tu inventario</p>
            </div>
            <div className="self-start sm:self-auto shrink-0 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/70 border border-white">
              <span className="text-xs text-gray-500 font-medium">Última actualización</span>
              <span className="w-px h-4 bg-[#D3E6DA]"></span>
              <span className="text-xs font-bold text-[#1E3B2F]">Hoy, 14:30</span>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-5"></div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 p-3 bg-[#FFF7F7] text-[#8A3B3B] rounded-2xl border border-[#F2C9C9] text-sm">
            <WarnIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#C65F5F]" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <StatCard
            label="Productos totales"
            value={totalProductos}
            icon={PackageIcon2}
            iconWrap="bg-[#1E3B2F] text-white"
            delay=".04s"
          />
          <StatCard
            label="Stock bajo"
            value={stockBajo}
            icon={AlertIcon}
            iconWrap="bg-[#FBF1D6] text-[#7A5B12]"
            delay=".08s"
          />
          <StatCard
            label="Fuera de stock"
            value={fueraStock}
            icon={XIcon}
            iconWrap="bg-[#FDF3F3] text-[#C65F5F]"
            delay=".12s"
          />
          <StatCard
            label="En stock"
            value={enStock}
            icon={CheckIcon}
            iconWrap="bg-[#E6F2EA] text-[#4F8A6B]"
            delay=".16s"
          />
        </div>

        {/* Search and Filters */}
        <div className={`m503-fade-up ${cardClass} p-2.5 mb-4`} style={{ animationDelay: '.2s' }}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
            <div className="flex-1 relative w-full group">
              <input
                type="text"
                placeholder="Buscar por nombre o tipo..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-transparent bg-[#F2F6F3] hover:bg-[#ECF3EE] focus:bg-white focus:border-[#8DBFA3] focus:ring-4 focus:ring-[#8DBFA3]/20 focus:outline-none transition-all text-gray-900 text-sm placeholder:text-gray-400"
              />
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4F8A6B] transition-colors">
                <SearchIcon />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setFilterStatus(value); setCurrentPage(1); }}
                  className={filterBtn(filterStatus === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`m503-fade-up ${cardClass} overflow-hidden`} style={{ animationDelay: '.24s' }}>
          <div className="overflow-x-auto m503-scroll">
            <table className="w-full">
              <thead className="bg-[#F5FAF7]/80 border-b border-[#EEF4F0]">
                <tr>
                  <th className={thClass}>Imagen</th>
                  <th className={thClass}>Nombre</th>
                  <th className={thClass}>Tipo</th>
                  <th className={thClass}>Precio</th>
                  <th className={thClass}>Stock</th>
                  <th className={thClass}>Estatus</th>
                  <th className={thClass}>Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF4F0]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-gray-400 text-sm">
                      Cargando inventario...
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((item) => (
                    <tr key={`${item.tipo}-${item._id}`} className="hover:bg-[#F5FAF7] transition-colors">
                      <td className="px-5 py-3 text-sm">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.nombre}
                            className="w-12 h-12 object-cover rounded-2xl border border-[#EEF4F0]"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#E8F2EC] to-[#F5EFE3] text-[#8DBFA3]">
                            <PackageIcon2 className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-900">{item.nombre}</td>
                      <td className="px-5 py-3 text-sm">
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-[#F2F6F3] text-[#4F8A6B]">
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-base font-black text-[#1E3B2F]">
                        ${Number(item.precio ?? 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{item.stock} ud</td>
                      <td className="px-5 py-3 text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(item.status)}`}>
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: getStatusDot(item.status) }}
                          />
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            title="Editar"
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#4F8A6B] bg-[#F2F6F3] hover:bg-[#1E3B2F] hover:text-white transition-all"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Eliminar"
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#C65F5F] bg-[#FDF3F3] hover:bg-[#E08A8A] hover:text-white transition-all"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <PackageIcon2 className="w-7 h-7 mx-auto text-[#8DBFA3]" />
                      <p className="mt-2 m503-serif text-xl text-gray-500">No se encontraron productos</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-[#EEF4F0] bg-[#F5FAF7]/60">
              <div className="flex items-center flex-wrap gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={navBtn(currentPage === 1)}
                >
                  <ChevronLeftIcon />
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={pageBtn(currentPage === page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={navBtn(currentPage === totalPages)}
                >
                  Siguiente
                  <ChevronRightIcon />
                </button>
              </div>
              <span className="text-xs text-gray-500">
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
  );
};

export default InventoryPage;