import React from 'react';
import Sidebar from '../components/Sidebar';
import AddProductModal from '../components/AddProductModal';
import { useCrud } from '../hooks/useCrud';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm.jsx';
import { getPlants, createPlant, updatePlant, deletePlant } from '../api/plantsApi';
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

  .m503-scroll { scrollbar-width: thin; scrollbar-color: #D3E6DA transparent; }
  .m503-scroll::-webkit-scrollbar { width: 6px; }
  .m503-scroll::-webkit-scrollbar-thumb { background: #D3E6DA; border-radius: 9999px; }
  .m503-scroll::-webkit-scrollbar-track { background: transparent; }

  @media (prefers-reduced-motion: reduce) {
    .m503-fade-up { animation: none; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Íconos (ahora aceptan className)
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

const SproutIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 9v6a2 2 0 002 2h10a2 2 0 002-2V9m-7 8v-4" />
  </svg>
);

const PlusIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14M5 12h14" />
  </svg>
);

const SunIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4" strokeWidth={2} />
    <path strokeLinecap="round" strokeWidth={2} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
  </svg>
);

const DropIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
  </svg>
);

const SoilIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 14h18M5 18h14M12 14V8m0 0c0-2 1.5-4 4-4 0 2.5-1.5 4-4 4zm0 0c0-1.5-1-3-3-3 0 2 1 3 3 3z" />
  </svg>
);

const ThermoIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 14.76V5a2 2 0 10-4 0v9.76a4 4 0 104 0z" />
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

// Existencias: verde si hay de sobra, ámbar si quedan pocas, rojo si se agotó.
// (Antes en Plantas el badge siempre era verde, aunque hubiera 0 unidades.)
const StockBadge = ({ stock }) => {
  const style =
    stock > 10
      ? 'bg-[#1E3B2F]/85 text-white'
      : stock > 0
        ? 'bg-[#FBF1D6]/95 text-[#7A5B12]'
        : 'bg-[#E08A8A]/95 text-white';
  const dot = stock > 10 ? '#8DBFA3' : stock > 0 ? '#E7B95A' : '#FFFFFF';
  return (
    <span className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      {stock > 0 ? `${stock} uds` : 'Agotado'}
    </span>
  );
};

// Los 4 cuidados de la planta: cada ícono muestra su texto al pasar el mouse
const CARE_ITEMS = [
  { key: 'careLight', label: 'Luz', icon: SunIcon },
  { key: 'careWater', label: 'Riego', icon: DropIcon },
  { key: 'careSoil', label: 'Suelo', icon: SoilIcon },
  { key: 'careTemperature', label: 'Temperatura', icon: ThermoIcon },
];

const CareIcons = ({ item }) => (
  <div className="flex items-center gap-1">
    {CARE_ITEMS.map(({ key, label, icon: Icon }) => (
      <span
        key={key}
        title={item[key] ? `${label}: ${item[key]}` : `${label}: sin información`}
        className={`w-5 h-5 rounded-full flex items-center justify-center ${
          item[key] ? 'bg-[#E6F2EA] text-[#4F8A6B]' : 'bg-[#F3F4F6] text-gray-300'
        }`}
      >
        <Icon />
      </span>
    ))}
  </div>
);

const plantaFields = [
  { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Ej: Suculenta Echeveria', required: true, minLength: 3, maxLength: 50, column: 'left' },
  { name: 'careLight', label: 'Cuidado — Luz', type: 'textarea', placeholder: 'Ej: Luz indirecta brillante...', required: true, maxLength: 300, column: 'left', rows: 2 },
  { name: 'careWater', label: 'Cuidado — Riego', type: 'textarea', placeholder: 'Ej: Riego moderado cada 2 semanas...', required: true, maxLength: 300, column: 'left', rows: 2 },
  { name: 'careSoil', label: 'Cuidado — Suelo', type: 'textarea', placeholder: 'Ej: Sustrato con buen drenaje...', required: true, maxLength: 300, column: 'left', rows: 2 },
  { name: 'careTemperature', label: 'Cuidado — Temperatura', type: 'textarea', placeholder: 'Ej: Entre 18°C y 24°C...', required: true, maxLength: 300, column: 'left', rows: 2 },
  { name: 'size', label: 'Tamaño', type: 'text', placeholder: 'Ej: 15cm de alto', required: true, maxLength: 40, column: 'right' },
  { name: 'price', label: 'Precio', type: 'number', placeholder: '0.00', required: true, min: 0.01, max: 99999, column: 'right' },
  { name: 'stock', label: 'Existencias', type: 'number', placeholder: '0', required: true, integer: true, max: 100000, column: 'right' },
  { name: 'image', label: 'Imagen del producto', type: 'file', column: 'right' }
];

const plantsApi = {
  getAll: getPlants,
  create: createPlant,
  update: updatePlant,
  remove: deletePlant
};

const PlantsPage = ({ onLogout }) => {
  usePageTitle();

  const { showSuccess, showError } = useToast(3000);
  const { confirm, ConfirmDialog } = useConfirm();

  const {
    loading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    showModal,
    editingItem,
    filteredData,
    currentData,
    totalPages,
    startIndex,
    itemsPerPage,
    addItem,
    updateItem,
    deleteItem,
    openModal,
    closeModal
  } = useCrud(plantsApi, { itemsPerPage: 12 });

  const buildFormData = (values) => {
    const fd = new FormData();
    fd.append('name', values.name);
    fd.append('careLight', values.careLight);
    fd.append('careWater', values.careWater);
    fd.append('careSoil', values.careSoil);
    fd.append('careTemperature', values.careTemperature);
    fd.append('size', values.size);
    fd.append('price', values.price);
    fd.append('stock', values.stock);
    if (values.image instanceof File) {
      fd.append('image', values.image);
    }
    return fd;
  };

  const handleSavePlanta = async (formValues) => {
    try {
      const fd = buildFormData(formValues);
      if (editingItem) {
        await updateItem(editingItem._id, fd);
        showSuccess('Planta actualizada exitosamente');
      } else {
        await addItem(fd);
        showSuccess('Planta agregada exitosamente');
      }
    } catch (err) {
      showError(err.message || 'No se pudo guardar la planta');
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm('¿Estás seguro de eliminar esta planta?');
    if (!ok) return;
    try {
      await deleteItem(id);
      showSuccess('Planta eliminada exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo eliminar la planta');
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

      <div className="flex-1 flex flex-col h-full min-w-0 p-4 pt-20 sm:p-6 sm:pt-20 lg:p-6">
        {/* Header */}
        <div className="mb-5 flex-shrink-0 m503-fade-up">
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
                <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Catálogo de</span>
                <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">plantas</span>
              </h1>
              <p className="mt-2 text-sm text-gray-500">Gestiona el inventario de plantas</p>
            </div>
            <button
              onClick={() => openModal(null)}
              className="group self-start sm:self-auto shrink-0 inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-2xl bg-[#1E3B2F] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_16px_32px_-14px_rgba(30,59,47,0.75)] hover:bg-[#162E24] hover:-translate-y-0.5 transition-all"
            >
              <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center transition-transform group-hover:rotate-90">
                <PlusIcon />
              </span>
              Agregar planta
            </button>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-5"></div>
        </div>

        {/* Los errores se mantienen en rojo suave para que se distingan */}
        {error && (
          <div className="mb-4 flex items-start gap-3 p-3 bg-[#FFF7F7] text-[#8A3B3B] rounded-2xl border border-[#F2C9C9] text-sm flex-shrink-0">
            <AlertIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#C65F5F]" />
            <span>{error}</span>
          </div>
        )}

        {/* Search */}
        <div className={`m503-fade-up ${cardClass} p-2.5 mb-4 flex-shrink-0`} style={{ animationDelay: '.06s' }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex-1 relative w-full group">
              <input
                type="text"
                placeholder="Buscar planta..."
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
              {filteredData.length} planta{filteredData.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Tarjetas */}
        <div
          className={`m503-fade-up ${cardClass} overflow-hidden flex-1 flex flex-col min-h-0`}
          style={{ animationDelay: '.12s' }}
        >
          <div className="m503-scroll overflow-y-auto flex-1 p-3 sm:p-4">
            {loading ? (
              <div className="text-center text-gray-400 text-sm py-16">Cargando plantas...</div>
            ) : currentData.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {currentData.map((item) => (
                  <div
                    key={item._id}
                    className="group bg-white rounded-[1.4rem] border border-[#EEF4F0] p-1.5 shadow-[0_12px_28px_-22px_rgba(30,59,47,0.55)] hover:-translate-y-1 hover:shadow-[0_24px_45px_-26px_rgba(30,59,47,0.55)] transition-all flex flex-col"
                  >
                    <div className="relative aspect-square w-full rounded-[1.1rem] overflow-hidden bg-gradient-to-br from-[#E8F2EC] to-[#F5EFE3]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8DBFA3]">
                          <SproutIcon />
                        </div>
                      )}
                      <StockBadge stock={item.stock} />
                    </div>
                    <div className="px-2 pt-2.5 pb-1.5 flex flex-col flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate" title={item.name}>{item.name}</h3>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-[11px] text-gray-500 truncate" title={item.size}>{item.size}</p>
                        <CareIcons item={item} />
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-2.5">
                        <span className="text-base font-black text-[#1E3B2F]">${item.price}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openModal(item)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#4F8A6B] bg-[#F2F6F3] hover:bg-[#1E3B2F] hover:text-white transition-all"
                            title="Editar"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[#C65F5F] bg-[#FDF3F3] hover:bg-[#E08A8A] hover:text-white transition-all"
                            title="Eliminar"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <SproutIcon className="w-7 h-7 mx-auto text-[#8DBFA3]" />
                <p className="mt-2 m503-serif text-xl text-gray-500">No se encontraron plantas</p>
              </div>
            )}
          </div>

          {/* Paginación */}
          {filteredData.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-[#EEF4F0] bg-[#F5FAF7]/60 flex-shrink-0">
              <div className="flex items-center flex-wrap gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={navBtn(currentPage === 1)}
                >
                  <ChevronLeftIcon />
                  Anterior
                </button>
                {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={pageBtn(currentPage === page)}
                  >
                    {page}
                  </button>
                ))}
                {totalPages > 4 && (
                  <>
                    <span className="px-1 text-gray-300 text-xs">...</span>
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

      <AddProductModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleSavePlanta}
        title={editingItem ? 'EDITAR PLANTA' : 'AGREGAR PLANTA NUEVA'}
        buttonText={editingItem ? 'Guardar Cambios' : 'Guardar Planta'}
        fields={plantaFields}
        initialValues={editingItem}
      />
    </div>
  );
};

export default PlantsPage;