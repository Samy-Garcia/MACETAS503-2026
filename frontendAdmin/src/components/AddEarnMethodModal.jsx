import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { blockNegative } from '../utils/inputValidation';

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

const LockIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ACTION_LABELS = {
  purchase: 'Compra (sistema)',
  review: 'Reseñas (sistema)',
  referral: 'Referidos (sistema)',
  birthday: 'Cumpleaños (sistema)',
  custom: 'Personalizada',
};

const AddEarnMethodModal = ({ isOpen, onClose, onSave, editingItem = null }) => {
  const isCore = editingItem && editingItem.actionType !== 'custom';

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { title: '', description: '', points: '', linkTo: '', isActive: true }
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      reset({
        title: editingItem.title,
        description: editingItem.description,
        points: editingItem.points,
        linkTo: editingItem.linkTo || '',
        isActive: editingItem.isActive,
      });
    } else {
      reset({ title: '', description: '', points: '', linkTo: '', isActive: true });
    }
  }, [isOpen, editingItem, reset]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      title: data.title,
      description: data.description,
      points: Number(data.points),
      linkTo: !isCore ? data.linkTo : undefined,
      isActive: data.isActive,
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
              {editingItem ? 'EDITAR FORMA DE GANAR' : 'AGREGAR FORMA DE GANAR'}
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
            {/* Aviso para las formas del sistema */}
            {isCore && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F5FAF7] border border-[#EEF4F0]">
                <span className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-[#E6F2EA] text-[#4F8A6B]">
                  <LockIcon />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 normal-case">{ACTION_LABELS[editingItem.actionType]}</p>
                  <p className="text-xs text-gray-500 mt-0.5 normal-case">
                    Solo puedes editar el texto, las hojas y activarla/desactivarla. No se puede eliminar porque está ligada a la lógica real del sistema.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>
                Título <span className="text-[#C65F5F] ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Síguenos en Instagram"
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
                placeholder="Explica en qué consiste esta forma de ganar hojas..."
                className={`${inputClass} resize-none`}
                {...register('description', { required: 'La descripción es obligatoria' })}
              />
              {errors.description && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.description.message}</p>}
            </div>

            <div>
              <label className={labelClass}>
                Hojas {editingItem?.actionType === 'purchase' ? '(por cada $1 en compras)' : ''} <span className="text-[#C65F5F] ml-1">*</span>
              </label>
              <input
                type="number"
                min="1"
                onKeyDown={blockNegative}
                placeholder="Ej: 25"
                className={inputClass}
                {...register('points', { required: 'Las hojas son obligatorias', min: { value: 1, message: 'Debe ser mayor a 0' } })}
              />
              {errors.points && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.points.message}</p>}
            </div>

            {!isCore && (
              <div>
                <label className={labelClass}>
                  A dónde lleva el botón <span className="text-gray-500 font-normal normal-case tracking-normal">(opcional, ej: /macetas)</span>
                </label>
                <input
                  type="text"
                  placeholder="/macetas"
                  className={inputClass}
                  {...register('linkTo')}
                />
                <p className="text-xs text-gray-500 mt-1 normal-case">
                  Esta entrada es informativa: no otorga hojas automáticamente al hacer clic (no hay forma de verificarlo).
                </p>
              </div>
            )}

            {/* Activa */}
            <div className="flex items-center justify-between gap-3 p-4 bg-[#F5FAF7] rounded-2xl border border-[#EEF4F0]">
              <label htmlFor="earn-active" className="text-sm font-semibold text-gray-900 cursor-pointer normal-case">
                Activa
              </label>
              <label className="relative inline-flex cursor-pointer shrink-0">
                <input
                  id="earn-active"
                  type="checkbox"
                  className="sr-only peer"
                  {...register('isActive')}
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
                {editingItem ? 'Guardar Cambios' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEarnMethodModal;
//componentes de modal para agregar o editar formas de ganar hojas, con validación de formulario y estilos personalizados.