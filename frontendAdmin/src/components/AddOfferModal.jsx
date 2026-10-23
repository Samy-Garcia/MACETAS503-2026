import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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

// Modal a medida para Ofertas: en vez de campos libres, el admin elige
// un producto real (Maceta, Vela u Otros) ya existente y le pone un % de descuento.
const AddOfferModal = ({
  isOpen,
  onClose,
  onSave,
  macetas = [],
  velas = [],
  otros = [],
  editingItem = null
}) => {
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm({
    defaultValues: { productType: 'maceta', productId: '', discountPercentage: '', status: true }
  });

  const productType = watch('productType');
  const options = productType === 'vela' ? velas : productType === 'otro' ? otros : macetas;
  const nombreTipoPlural = productType === 'vela' ? 'velas' : productType === 'otro' ? 'productos de la categoría Otros' : 'macetas';

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      reset({
        productType: editingItem.productType,
        productId: editingItem.productId,
        discountPercentage: editingItem.discountPercentage,
        status: editingItem.status
      });
    } else {
      reset({ productType: 'maceta', productId: '', discountPercentage: '', status: true });
    }
  }, [isOpen, editingItem, reset]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    onSave({
      productId: data.productId,
      productType: data.productType,
      discountPercentage: Number(data.discountPercentage),
      status: data.status
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

        <div className="m503-pop relative bg-white rounded-3xl border border-white shadow-[0_40px_80px_-30px_rgba(30,59,47,0.55)] w-full max-w-md pointer-events-auto">
          {/* Cabecera */}
          <div className="px-6 py-4 sticky top-0 bg-white/90 backdrop-blur-md z-10 rounded-t-3xl border-b border-[#EEF4F0] flex items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide text-gray-900">
              {editingItem ? 'EDITAR OFERTA' : 'AGREGAR OFERTA NUEVA'}
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
            {/* Tipo de producto */}
            <div>
              <label className={labelClass}>Tipo de producto</label>
              <Controller
                name="productType"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        // al cambiar de tipo, limpiamos el producto elegido (la lista cambia)
                        document.getElementById('productId-select').value = '';
                      }}
                      className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                    >
                      <option value="maceta">Maceta</option>
                      <option value="vela">Vela</option>
                      <option value="otro">Otros</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4F8A6B]">
                      <ChevronDownIcon />
                    </span>
                  </div>
                )}
              />
            </div>

            {/* Producto */}
            <div>
              <label className={labelClass}>
                Producto <span className="text-[#C65F5F] ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  id="productId-select"
                  className={`${inputClass} appearance-none pr-10 cursor-pointer`}
                  {...register('productId', { required: 'Selecciona un producto' })}
                >
                  <option value="">Selecciona un producto...</option>
                  {options.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (${Number(p.price).toFixed(2)})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4F8A6B]">
                  <ChevronDownIcon />
                </span>
              </div>
              {options.length === 0 && (
                <p className="text-gray-500 text-xs mt-1 normal-case">
                  No hay {nombreTipoPlural} registrados todavía.
                </p>
              )}
              {errors.productId && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.productId.message}</p>}
            </div>

            {/* Descuento */}
            <div>
              <label className={labelClass}>
                Descuento (%) <span className="text-[#C65F5F] ml-1">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                onKeyDown={blockNegative}
                placeholder="Ej: 20"
                className={inputClass}
                {...register('discountPercentage', {
                  required: 'El descuento es obligatorio',
                  min: { value: 1, message: 'Debe ser al menos 1%' },
                  max: { value: 100, message: 'No puede ser mayor a 100%' }
                })}
              />
              {errors.discountPercentage && <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors.discountPercentage.message}</p>}
            </div>

            {/* Activa */}
            <div className="flex items-center justify-between gap-3 p-4 bg-[#F5FAF7] rounded-2xl border border-[#EEF4F0]">
              <label htmlFor="offer-status" className="text-sm font-semibold text-gray-900 cursor-pointer normal-case">
                Oferta activa
              </label>
              <label className="relative inline-flex cursor-pointer shrink-0">
                <input
                  id="offer-status"
                  type="checkbox"
                  className="sr-only peer"
                  {...register('status')}
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
                {editingItem ? 'Guardar Cambios' : 'Guardar Oferta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOfferModal;