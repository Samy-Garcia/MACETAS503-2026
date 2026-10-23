import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

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

const colorSwatchClass =
  'w-11 h-11 rounded-2xl border-2 border-[#EEF4F0] cursor-pointer shrink-0 bg-transparent p-0.5';

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

const ANIMATION_LABELS = {
  none: 'Sin animación',
  marquee: 'Texto deslizante',
  pulse: 'Pulso',
  fadeIn: 'Aparece suave',
  bounce: 'Rebote'
};

const AddBannerModal = ({ isOpen, onClose, onSave, editingItem = null }) => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      text: '',
      backgroundColor: '#064225',
      textColor: '#FFFFFF',
      animation: 'none',
      active: false
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      reset({
        text: editingItem.text,
        backgroundColor: editingItem.backgroundColor || '#064225',
        textColor: editingItem.textColor || '#FFFFFF',
        animation: editingItem.animation || 'none',
        active: editingItem.active
      });
    } else {
      reset({ text: '', backgroundColor: '#064225', textColor: '#FFFFFF', animation: 'none', active: false });
    }
  }, [isOpen, editingItem, reset]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave(data);
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
              {editingItem ? 'EDITAR BANNER' : 'AGREGAR BANNER NUEVO'}
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
            {/* Vista previa en vivo, con los colores/animación ya aplicados */}
            <div>
              <label className={labelClass}>Vista previa</label>
              <div className="p-3 rounded-2xl bg-[#F5FAF7] border border-[#EEF4F0]">
                <div
                  className={`w-full text-center py-2 px-2 text-xs font-medium rounded-xl overflow-hidden ${
                    watchedValues.animation !== 'none' ? `anim-${watchedValues.animation}` : ''
                  }`}
                  style={{ backgroundColor: watchedValues.backgroundColor, color: watchedValues.textColor }}
                >
                  <span className={watchedValues.animation === 'marquee' ? 'inline-block whitespace-nowrap' : ''}>
                    {watchedValues.text || 'Así se va a ver tu banner'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Texto <span className="text-[#C65F5F] ml-1">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Envío gratis a compras mayores de $15.00"
                maxLength={200}
                className={`${inputClass} resize-none`}
                {...register('text', { required: 'El texto es obligatorio' })}
              />
              {errors.text && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.text.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Color de fondo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    {...register('backgroundColor')}
                    className={colorSwatchClass}
                  />
                  <input
                    type="text"
                    {...register('backgroundColor')}
                    className={`${inputClass} flex-1 min-w-0 uppercase`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Color de texto</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    {...register('textColor')}
                    className={colorSwatchClass}
                  />
                  <input
                    type="text"
                    {...register('textColor')}
                    className={`${inputClass} flex-1 min-w-0 uppercase`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Animación</label>
              <div className="relative">
                <select
                  className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                  {...register('animation')}
                >
                  {Object.entries(ANIMATION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4F8A6B]">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            {/* Activar */}
            <div className="flex items-center justify-between gap-3 p-4 bg-[#F5FAF7] rounded-2xl border border-[#EEF4F0]">
              <div className="min-w-0">
                <label htmlFor="banner-active" className="text-sm font-semibold text-gray-900 cursor-pointer normal-case">
                  Activar este banner
                </label>
                <p className="text-xs text-gray-500 normal-case">
                  Al activarlo, se desactiva automáticamente cualquier otro banner activo.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer shrink-0">
                <input
                  id="banner-active"
                  type="checkbox"
                  className="sr-only peer"
                  {...register('active')}
                />
                <span className="w-14 h-7 rounded-full bg-[#D3E6DA] transition-colors duration-300 peer-checked:bg-[#4F8A6B] peer-focus-visible:ring-4 peer-focus-visible:ring-[#8DBFA3]/30 after:content-[''] after:absolute after:top-1 after:left-1 after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow-sm after:transition-transform after:duration-300 peer-checked:after:translate-x-7" />
              </label>
            </div>

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
                {editingItem ? 'Guardar Cambios' : 'Guardar Banner'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBannerModal;