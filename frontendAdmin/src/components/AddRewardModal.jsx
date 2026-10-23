import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { blockNegative } from '../utils/inputValidation';
import { todayISO } from '../utils/dateUtils';

/* ─────────────────────────────────────────────────────────────
   Estilos locales (misma animación y scrollbar del resto del panel)
   ───────────────────────────────────────────────────────────── */
const STYLES = `
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
    .m503-pop { animation: none; }
  }
`;

const inputClass =
  'w-full px-4 py-2.5 rounded-2xl border-2 border-transparent bg-[#F2F6F3] hover:bg-[#ECF3EE] focus:bg-white focus:border-[#8DBFA3] focus:ring-4 focus:ring-[#8DBFA3]/20 focus:outline-none transition-all text-gray-900 text-sm normal-case placeholder:text-gray-400';

const labelClass = 'block text-xs font-semibold text-[#4F8A6B] uppercase tracking-[0.14em] mb-1.5';

const CloseIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const ChevronDownIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Interruptor deslizante. Es una función (no un componente) a propósito: así el
// `ref` que devuelve register() llega intacto al <input> nativo.
const renderSwitchRow = (id, label, registerProps) => (
  <div className="flex items-center justify-between gap-3 p-4 bg-[#F5FAF7] rounded-2xl border border-[#EEF4F0]">
    <label htmlFor={id} className="text-sm font-semibold text-gray-900 cursor-pointer normal-case">
      {label}
    </label>
    <label className="relative inline-flex cursor-pointer shrink-0">
      <input id={id} type="checkbox" className="sr-only peer" {...registerProps} />
      <span className="w-14 h-7 rounded-full bg-[#D3E6DA] transition-colors duration-300 peer-checked:bg-[#4F8A6B] peer-focus-visible:ring-4 peer-focus-visible:ring-[#8DBFA3]/30 after:content-[''] after:absolute after:top-1 after:left-1 after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow-sm after:transition-transform after:duration-300 peer-checked:after:translate-x-7" />
    </label>
  </div>
);

const CATEGORIES = ["Cupones", "Productos", "Envíos Gratis"];
const CATEGORY_TO_TYPE = { "Cupones": "coupon", "Productos": "product", "Envíos Gratis": "shipping" };

const AddRewardModal = ({ isOpen, onClose, onSave, editingItem = null }) => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: '', description: '', cost: '', category: 'Cupones', discountPercent: '',
      isActive: true, hasLimitedTime: false, startDate: '', endDate: ''
    }
  });

  const category = watch('category');
  const hasLimitedTime = watch('hasLimitedTime');
  const startDateValue = watch('startDate');

  // No se pueden elegir fechas pasadas. Al editar una recompensa que ya había
  // empezado, se respeta su fecha de inicio original para no obligar a cambiarla.
  const hoy = todayISO();
  const originalStart = editingItem?.startDate ? editingItem.startDate.slice(0, 10) : '';
  const originalEnd = editingItem?.endDate ? editingItem.endDate.slice(0, 10) : '';
  const minStart = originalStart && originalStart < hoy ? originalStart : hoy;
  const minEnd = startDateValue && startDateValue > hoy ? startDateValue : (originalEnd && originalEnd < hoy ? originalEnd : hoy);

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      reset({
        title: editingItem.title,
        description: editingItem.description,
        cost: editingItem.cost,
        category: editingItem.category,
        discountPercent: editingItem.discountPercent || '',
        isActive: editingItem.isActive,
        hasLimitedTime: !!(editingItem.startDate || editingItem.endDate),
        startDate: editingItem.startDate ? editingItem.startDate.slice(0, 10) : '',
        endDate: editingItem.endDate ? editingItem.endDate.slice(0, 10) : '',
        image: null
      });
    } else {
      reset({
        title: '', description: '', cost: '', category: 'Cupones', discountPercent: '',
        isActive: true, hasLimitedTime: false, startDate: '', endDate: '', image: null
      });
    }
  }, [isOpen, editingItem, reset]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      title: data.title,
      description: data.description,
      cost: Number(data.cost),
      category: data.category,
      type: CATEGORY_TO_TYPE[data.category],
      discountPercent: data.category === 'Cupones' ? Number(data.discountPercent) : undefined,
      isActive: data.isActive,
      startDate: data.hasLimitedTime ? data.startDate || undefined : undefined,
      endDate: data.hasLimitedTime ? data.endDate || undefined : undefined,
      image: data.image?.[0]
    });
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-y-auto">
      <style>{STYLES}</style>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="fixed inset-0 pointer-events-auto bg-[#1E3B2F]/30 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="m503-pop m503-scroll relative bg-white rounded-3xl border border-white shadow-[0_40px_80px_-30px_rgba(30,59,47,0.55)] w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto">
          {/* Cabecera */}
          <div className="px-6 py-4 sticky top-0 bg-white/90 backdrop-blur-md z-10 rounded-t-3xl border-b border-[#EEF4F0] flex items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide text-gray-900">
              {editingItem ? 'EDITAR RECOMPENSA' : 'AGREGAR RECOMPENSA NUEVA'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-gray-500 bg-[#F2F6F3] hover:bg-[#1E3B2F] hover:text-white transition-all"
              title="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className={labelClass}>
                Título <span className="text-[#C65F5F] ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: 10% OFF en macetas"
                className={inputClass}
                {...register('title', { required: 'El título es obligatorio' })}
              />
              {errors.title && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.title.message}</p>}
            </div>

            <div>
              <label className={labelClass}>
                Descripción <span className="text-[#C65F5F] ml-1">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Explica en qué consiste la recompensa..."
                className={`${inputClass} resize-none`}
                {...register('description', { required: 'La descripción es obligatoria' })}
              />
              {errors.description && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Costo (hojas) <span className="text-[#C65F5F] ml-1">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  onKeyDown={blockNegative}
                  placeholder="Ej: 300"
                  className={inputClass}
                  {...register('cost', { required: 'El costo es obligatorio', min: { value: 1, message: 'Debe ser mayor a 0' } })}
                />
                {errors.cost && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.cost.message}</p>}
              </div>

              <div>
                <label className={labelClass}>Categoría</label>
                <div className="relative">
                  <select
                    className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                    {...register('category')}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4F8A6B]">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            </div>

            {category === 'Cupones' && (
              <div>
                <label className={labelClass}>
                  Porcentaje de descuento <span className="text-[#C65F5F] ml-1">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  onKeyDown={blockNegative}
                  placeholder="Ej: 10"
                  className={inputClass}
                  {...register('discountPercent', {
                    required: category === 'Cupones' ? 'El descuento es obligatorio para un cupón' : false,
                    min: { value: 1, message: 'Mínimo 1%' },
                    max: { value: 100, message: 'Máximo 100%' }
                  })}
                />
                {errors.discountPercent && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.discountPercent.message}</p>}
              </div>
            )}

            <div>
              <label className={labelClass}>
                Imagen {editingItem && <span className="text-gray-500 font-normal normal-case tracking-normal">(déjalo vacío para conservar la actual)</span>}
                {!editingItem && <span className="text-[#C65F5F] ml-1">*</span>}
              </label>
              <div className="border-2 border-dashed border-[#B9D6C3] rounded-2xl p-4 text-center hover:border-[#8DBFA3] hover:bg-[#E6F2EA] transition-all bg-[#F5FAF7]">
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-600 normal-case file:mr-3 file:rounded-full file:border-0 file:bg-[#E6F2EA] file:text-[#2F6B4D] file:px-4 file:py-1.5 file:text-xs file:font-semibold hover:file:bg-[#D3E6DA] file:cursor-pointer file:transition-all"
                  {...register('image', { required: !editingItem ? 'La imagen es obligatoria' : false })}
                />
              </div>
              {errors.image && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.image.message}</p>}
            </div>

            {renderSwitchRow('hasLimitedTime', 'Disponible por tiempo limitado', register('hasLimitedTime'))}

            {hasLimitedTime && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Desde</label>
                  <input
                    type="date"
                    min={minStart}
                    className={inputClass}
                    {...register('startDate', {
                      validate: (v) => !v || v >= minStart || 'La fecha de inicio no puede ser pasada'
                    })}
                  />
                  {errors.startDate && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Hasta</label>
                  <input
                    type="date"
                    min={minEnd}
                    className={inputClass}
                    {...register('endDate', {
                      validate: (v) => {
                        if (!v) return true;
                        if (v < minEnd) return 'La fecha final no puede ser pasada ni anterior al inicio';
                        return true;
                      }
                    })}
                  />
                  {errors.endDate && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.endDate.message}</p>}
                </div>
              </div>
            )}

            {renderSwitchRow('isActive', 'Recompensa activa', register('isActive'))}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[#EEF4F0]">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-sm font-medium text-gray-700 bg-[#F2F6F3] hover:bg-[#E6F2EA] hover:text-[#1E3B2F] transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#1E3B2F] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_16px_32px_-14px_rgba(30,59,47,0.75)] hover:bg-[#162E24] hover:-translate-y-0.5 transition-all"
              >
                {editingItem ? 'Guardar Cambios' : 'Guardar Recompensa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRewardModal;