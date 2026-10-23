import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AddOfferModal from '../components/AddOfferModal';
import { useCrud } from '../hooks/useCrud';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm.jsx';
import { getOffers, createOffer, updateOffer, deleteOffer } from '../api/offersApi';
import { getPosts } from '../api/postApi';
import { getCandles } from '../api/candlesApi';
import { getOthers } from '../api/othersApi';
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

const TagIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlusIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14M5 12h14" />
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

const AlertIcon = ({ className = 'w-4 h-4' }) => (
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

// Cómo se muestra cada tipo de producto en la tabla de ofertas
const TIPO_PRODUCTO_LABEL = { maceta: 'Maceta', vela: 'Vela', otro: 'Otros' };

const offersApi = {
  getAll: getOffers,
  create: createOffer,
  update: updateOffer,
  remove: deleteOffer
};

const OffersPage = ({ onLogout }) => {
  usePageTitle();

  const { toasts, showSuccess, showError } = useToast(3000);
  const { confirm, ConfirmDialog } = useConfirm();

  const {
    data,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    showModal,
    editingItem,
    addItem,
    updateItem,
    deleteItem,
    openModal,
    closeModal
  } = useCrud(offersApi);

  const itemsPerPage = 4;

  // Filtro propio: el buscador genérico de useCrud no puede leer item.product.name
  // (es un objeto anidado), así que buscamos nosotros por nombre y tipo de producto.
  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.product?.name?.toLowerCase().includes(term) ||
      item.productType?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(Math.ceil(filteredData.length / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const totalOfertas = data.length;
  const ofertasActivas = data.filter(item => item.status).length;
  const ofertasInactivas = data.filter(item => !item.status).length;

  // Listas de productos reales para que el modal pueda armar el dropdown
  const [macetas, setMacetas] = useState([]);
  const [velas, setVelas] = useState([]);
  const [otros, setOtros] = useState([]);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const [posts, candles, others] = await Promise.all([getPosts(), getCandles(), getOthers()]);
        setMacetas(posts);
        setVelas(candles);
        setOtros(others);
      } catch (err) {
        showError('No se pudieron cargar los productos para vincular ofertas');
      }
    };
    cargarProductos();
  }, []);

  const handleSaveOferta = async (payload) => {
    try {
      if (editingItem) {
        await updateItem(editingItem._id, payload);
        showSuccess('Oferta actualizada exitosamente');
      } else {
        await addItem(payload);
        showSuccess('Oferta agregada exitosamente');
      }
    } catch (err) {
      showError(err.message || 'No se pudo guardar la oferta');
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm('¿Estás seguro de eliminar esta oferta?');
    if (!ok) return;
    try {
      await deleteItem(id);
      showSuccess('Oferta eliminada exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo eliminar la oferta');
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
                Activo
              </span>
              <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
                <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Gestión de</span>
                <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">ofertas</span>
              </h1>
              <p className="mt-2 text-sm text-gray-500">Administra los descuentos activos en tus productos</p>
            </div>
            <button
              onClick={() => openModal(null)}
              className="group self-start sm:self-auto shrink-0 inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-2xl bg-[#1E3B2F] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_16px_32px_-14px_rgba(30,59,47,0.75)] hover:bg-[#162E24] hover:-translate-y-0.5 transition-all"
            >
              <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center transition-transform group-hover:rotate-90">
                <PlusIcon />
              </span>
              Agregar oferta
            </button>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-5"></div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 p-3 bg-[#FFF7F7] text-[#8A3B3B] rounded-2xl border border-[#F2C9C9] text-sm">
            <AlertIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#C65F5F]" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <StatCard
            label="Ofertas totales"
            value={totalOfertas}
            icon={TagIcon}
            iconWrap="bg-[#1E3B2F] text-white"
            delay=".04s"
          />
          <StatCard
            label="Activas"
            value={ofertasActivas}
            icon={CheckIcon}
            iconWrap="bg-[#E6F2EA] text-[#4F8A6B]"
            delay=".08s"
          />
          <StatCard
            label="Inactivas"
            value={ofertasInactivas}
            icon={XIcon}
            iconWrap="bg-[#F3F4F6] text-gray-400"
            delay=".12s"
          />
        </div>

        {/* Search */}
        <div className={`m503-fade-up ${cardClass} p-2.5 mb-4`} style={{ animationDelay: '.16s' }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex-1 relative w-full group">
              <input
                type="text"
                placeholder="Buscar oferta por producto..."
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
            <span className="self-start sm:self-auto shrink-0 text-xs font-medium text-[#4F8A6B] bg-[#E6F2EA] px-3 py-1.5 rounded-full">
              {filteredData.length} oferta{filteredData.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className={`m503-fade-up ${cardClass} overflow-hidden`} style={{ animationDelay: '.2s' }}>
          <div className="overflow-x-auto m503-scroll">
            <table className="w-full">
              <thead className="bg-[#F5FAF7]/80 border-b border-[#EEF4F0]">
                <tr>
                  <th className={thClass}>Producto</th>
                  <th className={thClass}>Tipo</th>
                  <th className={thClass}>Precio original</th>
                  <th className={thClass}>Descuento</th>
                  <th className={thClass}>Precio final</th>
                  <th className={thClass}>Estado</th>
                  <th className={thClass}>Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF4F0]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-gray-400 text-sm">Cargando ofertas...</td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((item) => (
                    <tr key={item._id} className="hover:bg-[#F5FAF7] transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                        <div className="flex items-center gap-3">
                          {item.product?.image && (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-2xl border border-[#EEF4F0]"
                            />
                          )}
                          {item.product?.name || <span className="m503-serif text-base text-[#C65F5F]">Producto eliminado</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{TIPO_PRODUCTO_LABEL[item.productType] || item.productType}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-400 line-through">
                        {item.product ? `$${Number(item.product.price).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBF1D6] text-[#7A5B12]">
                          -{item.discountPercentage}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-base font-black text-[#1E3B2F]">
                        {item.discountedPrice !== null ? `$${Number(item.discountedPrice).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status ? 'bg-[#E6F2EA] text-[#2F6B4D]' : 'bg-[#F3F4F6] text-gray-500'
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: item.status ? '#4F8A6B' : '#9CA3AF' }}
                          />
                          {item.status ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openModal(item)}
                            title="Editar"
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#4F8A6B] bg-[#F2F6F3] hover:bg-[#1E3B2F] hover:text-white transition-all"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
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
                      <TagIcon className="w-7 h-7 mx-auto text-[#8DBFA3]" />
                      <p className="mt-2 m503-serif text-xl text-gray-500">No se encontraron ofertas</p>
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

      <AddOfferModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleSaveOferta}
        macetas={macetas}
        velas={velas}
        otros={otros}
        editingItem={editingItem}
      />
    </div>
  );
};

export default OffersPage;