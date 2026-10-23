import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../hooks/useToast';
import { getPlants, updatePlant } from '../api/plantsApi';
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
  .m503-scroll::-webkit-scrollbar { width: 6px; }
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

const SproutIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 9v6a2 2 0 002 2h10a2 2 0 002-2V9m-7 8v-4" />
  </svg>
);

const EditIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SunIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="4" strokeWidth={2} />
    <path strokeLinecap="round" strokeWidth={2} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
  </svg>
);

const DropletIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
  </svg>
);

const SoilIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 14h18M5 18h14M12 14V8m0 0c0-2 1.5-4 4-4 0 2.5-1.5 4-4 4zm0 0c0-1.5-1-3-3-3 0 2 1 3 3 3z" />
  </svg>
);

const ThermometerIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 14.76V5a2 2 0 10-4 0v9.76a4 4 0 104 0z" />
  </svg>
);

const AlertIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

const CloseIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 6l12 12M18 6L6 18" />
  </svg>
);

// Los 4 aspectos de cuidado que el cliente ve por separado en la página de detalle
const CARE_SECTIONS = [
  { key: 'careLight', label: 'Luz', icon: SunIcon, placeholder: 'Ej: Luz indirecta brillante, evitar sol directo...' },
  { key: 'careWater', label: 'Riego', icon: DropletIcon, placeholder: 'Ej: Riego moderado cada 2 semanas...' },
  { key: 'careSoil', label: 'Suelo', icon: SoilIcon, placeholder: 'Ej: Sustrato con buen drenaje, arena gruesa...' },
  { key: 'careTemperature', label: 'Temperatura', icon: ThermometerIcon, placeholder: 'Ej: Entre 18°C y 24°C, evitar corrientes de aire frío...' }
];

const emptyDraft = { careLight: '', careWater: '', careSoil: '', careTemperature: '' };

/* ─────────────────────────────────────────────────────────────
   Piezas visuales
   ───────────────────────────────────────────────────────────── */
const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]';

const PlantCarePage = ({ onLogout }) => {
  usePageTitle();

  const { toasts, showSuccess, showError } = useToast(3000);

  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [editingPlant, setEditingPlant] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);

  const cargarPlantas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlants();
      setPlants(data);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las plantas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPlantas();
  }, []);

  const filteredPlants = plants.filter(p =>
    !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditor = (plant) => {
    setEditingPlant(plant);
    setDraft({
      careLight: plant.careLight || '',
      careWater: plant.careWater || '',
      careSoil: plant.careSoil || '',
      careTemperature: plant.careTemperature || ''
    });
  };

  const closeEditor = () => {
    setEditingPlant(null);
    setDraft(emptyDraft);
  };

  const handleGuardar = async () => {
    const faltante = CARE_SECTIONS.find(s => !draft[s.key].trim());
    if (faltante) {
      showError(`El campo "${faltante.label}" no puede quedar vacío`);
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('careLight', draft.careLight.trim());
      fd.append('careWater', draft.careWater.trim());
      fd.append('careSoil', draft.careSoil.trim());
      fd.append('careTemperature', draft.careTemperature.trim());

      const result = await updatePlant(editingPlant._id, fd);
      const updated = result.plants || result;

      setPlants(prev => prev.map(p => (p._id === editingPlant._id ? { ...p, ...updated } : p)));
      showSuccess('Cuidados actualizados exitosamente');
      closeEditor();
    } catch (err) {
      showError(err.message || 'No se pudo guardar el cambio');
    } finally {
      setSaving(false);
    }
  };

  // Preview corto para la card: el primer aspecto de cuidado que tenga texto
  const previewCare = (plant) => {
    const primero = CARE_SECTIONS.find(s => plant[s.key]);
    return primero ? `${primero.label}: ${plant[primero.key]}` : null;
  };

  // Cuántos de los 4 cuidados ya tienen texto (para el indicador de la tarjeta)
  const careCount = (plant) => CARE_SECTIONS.filter(s => plant[s.key]).length;

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
      <style>{STYLES}</style>
      <Sidebar onLogout={onLogout} />

      {/* Toasts */}
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`m503-pop flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl backdrop-blur-md shadow-[0_18px_36px_-18px_rgba(30,59,47,0.6)] font-medium text-sm ${
              toast.type === 'success'
                ? 'bg-[#1E3B2F]/95 text-white'
                : toast.type === 'error'
                  ? 'bg-[#E08A8A]/95 text-white'
                  : 'bg-[#4F8A6B]/95 text-white'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: toast.type === 'success' ? '#8DBFA3' : '#FFFFFF' }}
            />
            {toast.message}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0 p-4 pt-20 sm:p-6 sm:pt-20 lg:p-6">
        {/* Header */}
        <div className="mb-5 flex-shrink-0 m503-fade-up">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#8DBFA3] opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[#4F8A6B]" />
            </span>
            Activo
          </span>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Cuidado de</span>
            <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">plantas</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Edita las instrucciones de cuidado que ven tus clientes en cada planta
          </p>
          <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-5"></div>
        </div>

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
                placeholder="Buscar planta por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-transparent bg-[#F2F6F3] hover:bg-[#ECF3EE] focus:bg-white focus:border-[#8DBFA3] focus:ring-4 focus:ring-[#8DBFA3]/20 focus:outline-none transition-all text-gray-900 text-sm placeholder:text-gray-400"
              />
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4F8A6B] transition-colors">
                <SearchIcon />
              </div>
            </div>
            <span className="self-start sm:self-auto shrink-0 text-xs font-medium text-[#4F8A6B] bg-[#E6F2EA] px-3 py-1.5 rounded-full">
              {filteredPlants.length} planta{filteredPlants.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Grid de plantas */}
        <div
          className={`m503-fade-up ${cardClass} overflow-hidden flex-1 flex flex-col min-h-0`}
          style={{ animationDelay: '.12s' }}
        >
          <div className="m503-scroll overflow-y-auto flex-1 p-3 sm:p-4">
            {loading ? (
              <div className="text-center text-gray-400 text-sm py-16">Cargando plantas...</div>
            ) : filteredPlants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredPlants.map((plant) => (
                  <div
                    key={plant._id}
                    className="group bg-white rounded-[1.4rem] border border-[#EEF4F0] p-1.5 shadow-[0_12px_28px_-22px_rgba(30,59,47,0.55)] hover:-translate-y-1 hover:shadow-[0_24px_45px_-26px_rgba(30,59,47,0.55)] transition-all flex flex-col"
                  >
                    <div className="relative aspect-[4/3] w-full rounded-[1.1rem] overflow-hidden bg-gradient-to-br from-[#E8F2EC] to-[#F5EFE3]">
                      {plant.image ? (
                        <img
                          src={plant.image}
                          alt={plant.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8DBFA3]">
                          <SproutIcon className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md bg-white/90 text-[#1E3B2F]">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: careCount(plant) === 4 ? '#4F8A6B' : '#E7B95A' }}
                        />
                        {careCount(plant)}/4 cuidados
                      </span>
                    </div>

                    <div className="px-2 pt-2.5 pb-1.5 flex flex-col flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 capitalize truncate" title={plant.name}>
                        {plant.name}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500 flex-1 line-clamp-3 mb-3">
                        {previewCare(plant) || (
                          <span className="m503-serif text-sm text-gray-400">Sin instrucciones de cuidado todavía</span>
                        )}
                      </p>
                      <button
                        onClick={() => openEditor(plant)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#F2F6F3] text-[#1E3B2F] text-xs font-semibold hover:bg-[#1E3B2F] hover:text-white transition-all"
                      >
                        <EditIcon />
                        Editar cuidados
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <SproutIcon className="w-7 h-7 mx-auto text-[#8DBFA3]" />
                <p className="mt-2 m503-serif text-xl text-gray-500">
                  {plants.length === 0
                    ? 'Todavía no hay plantas registradas en el catálogo'
                    : 'Ninguna planta coincide con esa búsqueda'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edición: los 4 aspectos de cuidado, cada uno en su propio textbox */}
      {editingPlant && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div
              className="fixed inset-0 pointer-events-auto bg-[#1E3B2F]/30 backdrop-blur-sm"
              onClick={closeEditor}
            />

            <div className="m503-pop m503-scroll relative bg-white rounded-3xl border border-white shadow-[0_40px_80px_-30px_rgba(30,59,47,0.55)] w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Cabecera del modal */}
              <div className="px-4 sm:px-6 py-4 flex items-center gap-3 sticky top-0 bg-white/90 backdrop-blur-md z-10 rounded-t-3xl border-b border-[#EEF4F0]">
                {editingPlant.image ? (
                  <img
                    src={editingPlant.image}
                    alt={editingPlant.name}
                    className="w-12 h-12 rounded-2xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center bg-gradient-to-br from-[#E8F2EC] to-[#F5EFE3] text-[#8DBFA3]">
                    <SproutIcon />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Editando cuidados de</p>
                  <h2 className="m503-serif text-2xl sm:text-3xl text-[#4F8A6B] capitalize truncate leading-tight">
                    {editingPlant.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-gray-500 bg-[#F2F6F3] hover:bg-[#1E3B2F] hover:text-white transition-all disabled:opacity-50"
                  title="Cerrar"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {CARE_SECTIONS.map(({ key, label, icon: Icon, placeholder }) => (
                  <div key={key}>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1.5">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center bg-[#E6F2EA] text-[#4F8A6B]">
                        <Icon />
                      </span>
                      {label} <span className="text-[#C65F5F]">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={draft[key]}
                      onChange={(e) => setDraft(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 rounded-2xl border-2 border-transparent bg-[#F2F6F3] hover:bg-[#ECF3EE] focus:bg-white focus:border-[#8DBFA3] focus:ring-4 focus:ring-[#8DBFA3]/20 focus:outline-none transition-all text-gray-900 text-sm placeholder:text-gray-400 resize-none"
                    />
                  </div>
                ))}

                <p className="text-xs text-gray-500">
                  Esto es exactamente lo que ve el cliente en la página de detalle de esta planta.
                </p>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[#EEF4F0]">
                  <button
                    type="button"
                    onClick={closeEditor}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-sm font-medium text-gray-700 bg-[#F2F6F3] hover:bg-[#E6F2EA] hover:text-[#1E3B2F] transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardar}
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#1E3B2F] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_16px_32px_-14px_rgba(30,59,47,0.75)] hover:bg-[#162E24] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantCarePage;