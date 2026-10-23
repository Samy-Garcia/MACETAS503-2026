import React, { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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

const dropzoneClass =
  'border-2 border-dashed border-[#B9D6C3] rounded-2xl p-6 text-center hover:border-[#8DBFA3] hover:bg-[#E6F2EA] transition-all cursor-pointer bg-[#F5FAF7]';

const ImageIcon = ({ className = 'w-10 h-10' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CloseIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 6l12 12M18 6L6 18" />
  </svg>
);

// Fila de "nombre + selector de color visual", con botón para quitarla.
// Está separado porque useFieldArray necesita llamarse en un componente propio.
const ColorListField = ({ control, name }) => {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-2">
          <Controller
            name={`${name}.${index}.hex`}
            control={control}
            render={({ field: hexField }) => (
              <input
                type="color"
                {...hexField}
                className="w-11 h-11 rounded-2xl border-2 border-[#EEF4F0] cursor-pointer shrink-0 bg-transparent p-0.5"
              />
            )}
          />
          <Controller
            name={`${name}.${index}.name`}
            control={control}
            render={({ field: nameField }) => (
              <input
                type="text"
                placeholder="Nombre del color (Ej: Terracota)"
                {...nameField}
                className={`${inputClass} flex-1`}
              />
            )}
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="shrink-0 w-8 h-8 flex items-center justify-center text-[#C65F5F] bg-[#FDF3F3] hover:bg-[#E08A8A] hover:text-white rounded-full transition-all"
            title="Quitar color"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ name: '', hex: '#000000' })}
        className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-semibold text-[#2F6B4D] bg-[#E6F2EA] hover:bg-[#D3E6DA] transition-all normal-case"
      >
        + Agregar color
      </button>
    </div>
  );
};

// Campo de "etiquetas" (chips): se escribe un valor, se presiona Enter o coma
// y queda como una etiqueta que se puede quitar. Reemplaza al antiguo campo de
// texto separado por comas, que era fácil de escribir mal.
const TagListField = ({ control, name, placeholder, maxTags = 12, maxLength = 30 }) => {
  const [draft, setDraft] = React.useState('');
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => {
        const tags = Array.isArray(value) ? value : [];
        const agregar = () => {
          const limpio = draft.trim().replace(/,+$/, '').trim();
          if (!limpio) return;
          const yaExiste = tags.some(t => t.toLowerCase() === limpio.toLowerCase());
          if (!yaExiste && tags.length < maxTags) {
            onChange([...tags, limpio]);
          }
          setDraft('');
        };
        return (
          <div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-[#1E3B2F] text-white text-xs font-semibold normal-case"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => onChange(tags.filter(t => t !== tag))}
                      className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-[10px] leading-none"
                      title="Quitar"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={draft}
                maxLength={maxLength}
                placeholder={tags.length >= maxTags ? `Máximo ${maxTags}` : placeholder}
                disabled={tags.length >= maxTags}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    agregar();
                  }
                }}
                onBlur={agregar}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={agregar}
                disabled={!draft.trim() || tags.length >= maxTags}
                className="shrink-0 px-4 rounded-2xl text-xs font-semibold text-[#2F6B4D] bg-[#E6F2EA] hover:bg-[#D3E6DA] disabled:opacity-40 transition-all normal-case"
              >
                Agregar
              </button>
            </div>
          </div>
        );
      }}
    />
  );
};

const AddProductModal = ({
  isOpen,
  onClose,
  onSave,
  title = 'AGREGAR PRODUCTO NUEVO',
  buttonText = 'Guardar Producto',
  fields = [],
  initialValues = null
}) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {}
  });

  useEffect(() => {
    if (!isOpen) return;

    const initialData = {};
    fields.forEach(field => {
      if (field.type === 'file') {
        initialData[field.name] = null;
      } else if (field.type === 'multifile') {
        initialData[field.name] = [];
      } else if (field.type === 'multiselect' || field.type === 'taglist') {
        initialData[field.name] = initialValues?.[field.name] ?? [];
      } else if (field.type === 'colorlist') {
        initialData[field.name] = initialValues?.[field.name] ?? [];
      } else if (field.type === 'checkbox') {
        initialData[field.name] = initialValues?.[field.name] ?? false;
      } else {
        initialData[field.name] = initialValues?.[field.name] ?? '';
      }
    });
    reset(initialData);
  }, [isOpen, initialValues, fields]);

  if (!isOpen) return null;

  const onSubmit = (formData) => {
    if (onSave) {
      onSave(formData);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text': {
        // Restricción de caracteres en tiempo real (bloquea teclas inválidas
        // mientras escribe) + validación de respaldo con react-hook-form,
        // solo para los campos que la configuración marque explícitamente.
        const restrictPatterns = {
          letters: {
            value: /^[A-Za-zÀ-ÿñÑ\s'-]*$/,
            message: 'Este campo solo acepta letras'
          },
          numbers: {
            value: /^[0-9]*$/,
            message: 'Este campo solo acepta números'
          }
        };
        const restrictKeyTests = {
          letters: /[A-Za-zÀ-ÿñÑ\s'-]/,
          numbers: /[0-9]/
        };

        const handleKeyDown = (e) => {
          if (!field.restrict) return;
          // Deja pasar teclas de control (borrar, flechas, tab, copiar/pegar
          // con Ctrl/Cmd, etc.), solo filtra teclas de un solo carácter.
          if (e.ctrlKey || e.metaKey || e.key.length > 1) return;
          const test = restrictKeyTests[field.restrict];
          if (test && !test.test(e.key)) {
            e.preventDefault();
          }
        };

        return (
          <input
            type="text"
            placeholder={field.placeholder}
            onKeyDown={handleKeyDown}
            className={inputClass}
            maxLength={field.maxLength}
            {...register(field.name, {
              required: field.required ? `${field.label} es requerido` : false,
              // Un campo obligatorio no puede quedar solo con espacios
              validate: (v) =>
                !field.required || String(v ?? '').trim() !== '' || `${field.label} es requerido`,
              ...(field.minLength
                ? { minLength: { value: field.minLength, message: `${field.label} debe tener al menos ${field.minLength} caracteres` } }
                : {}),
              ...(field.maxLength
                ? { maxLength: { value: field.maxLength, message: `${field.label} no puede superar ${field.maxLength} caracteres` } }
                : {}),
              ...(field.restrict && restrictPatterns[field.restrict]
                ? { pattern: restrictPatterns[field.restrict] }
                : {})
            })}
          />
        );
      }

      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder}
            step={field.integer ? '1' : '0.01'}
            min={field.min ?? 0}
            max={field.max}
            onKeyDown={(e) => {
              blockNegative(e);
              // Los campos enteros (existencias) no aceptan punto decimal
              if (field.integer && (e.key === '.' || e.key === ',')) e.preventDefault();
            }}
            className={inputClass}
            {...register(field.name, {
              required: field.required ? `${field.label} es requerido` : false,
              min: {
                value: field.min ?? 0,
                message: field.min > 0
                  ? `${field.label} debe ser mayor o igual a ${field.min}`
                  : `${field.label} no puede ser negativo`
              },
              ...(field.max !== undefined
                ? { max: { value: field.max, message: `${field.label} no puede ser mayor a ${field.max}` } }
                : {}),
              ...(field.integer
                ? { validate: (v) => v === '' || Number.isInteger(Number(v)) || `${field.label} debe ser un número entero` }
                : {})
            })}
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            rows={field.rows || 4}
            maxLength={field.maxLength}
            className={`${inputClass} resize-none`}
            {...register(field.name, {
              required: field.required ? `${field.label} es requerido` : false,
              validate: (v) =>
                !field.required || String(v ?? '').trim() !== '' || `${field.label} es requerido`,
              ...(field.minLength
                ? { minLength: { value: field.minLength, message: `${field.label} debe tener al menos ${field.minLength} caracteres` } }
                : {}),
              ...(field.maxLength
                ? { maxLength: { value: field.maxLength, message: `${field.label} no puede superar ${field.maxLength} caracteres` } }
                : {})
            })}
          />
        );

      case 'file':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { value, onChange } }) => (
              <div className={dropzoneClass}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files[0] || null)}
                  className="hidden"
                  id={`image-upload-${field.name}`}
                />
                <label htmlFor={`image-upload-${field.name}`} className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <span className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#4F8A6B] mb-3 shadow-[0_12px_24px_-16px_rgba(30,59,47,0.5)]">
                      <ImageIcon />
                    </span>
                    <p className="text-sm text-gray-600 normal-case">Arrastra y suelta o haz clic para subir una imagen</p>
                    {value && (
                      <p className="text-sm text-[#2F6B4D] font-semibold mt-2 normal-case">✓ {value.name}</p>
                    )}
                    {!value && initialValues?.image && (
                      <p className="text-xs text-gray-500 mt-2 normal-case">Ya tiene una imagen; sube una nueva solo si quieres reemplazarla</p>
                    )}
                  </div>
                </label>
              </div>
            )}
          />
        );

      case 'multifile':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { value = [], onChange } }) => {
              const MAX_IMAGES = 6;
              const existentes = initialValues?.images?.length ? initialValues.images : [];

              const handleAddFiles = (fileList) => {
                const nuevos = Array.from(fileList).slice(0, MAX_IMAGES - value.length);
                onChange([...value, ...nuevos]);
              };

              const handleRemove = (index) => {
                onChange(value.filter((_, i) => i !== index));
              };

              return (
                <div>
                  <div className={dropzoneClass}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        handleAddFiles(e.target.files);
                        e.target.value = '';
                      }}
                      className="hidden"
                      id={`images-upload-${field.name}`}
                    />
                    <label htmlFor={`images-upload-${field.name}`} className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <span className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#4F8A6B] mb-3 shadow-[0_12px_24px_-16px_rgba(30,59,47,0.5)]">
                          <ImageIcon />
                        </span>
                        <p className="text-sm text-gray-600 normal-case">Arrastra y suelta o haz clic para subir hasta {MAX_IMAGES} imágenes</p>
                        {existentes.length > 0 && value.length === 0 && (
                          <p className="text-xs text-gray-500 mt-2 normal-case">
                            Ya tiene {existentes.length} imagen{existentes.length > 1 ? 'es' : ''}; sube nuevas solo si quieres reemplazarlas todas
                          </p>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Previsualización de las imágenes nuevas seleccionadas */}
                  {value.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {value.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Imagen ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-2xl border border-[#EEF4F0]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#E08A8A] text-white rounded-full flex items-center justify-center text-xs shadow-sm hover:bg-[#C65F5F] transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Imágenes actuales (solo se muestran si todavía no se seleccionó ninguna nueva) */}
                  {value.length === 0 && existentes.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {existentes.map((img, index) => (
                        <img
                          key={index}
                          src={img.url}
                          alt={`Imagen actual ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-2xl border border-[#EEF4F0] opacity-70"
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }}
          />
        );

      case 'multiselect':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { value = [], onChange } }) => (
              <div className="flex flex-wrap gap-2">
                {(field.options || []).map((rawOption) => {
                  // Las opciones pueden ser un string simple (Ej: sizes: "Pequeña")
                  // o un objeto {label, value} cuando el valor real que hay que
                  // guardar es distinto de lo que se muestra (Ej: plantas reales,
                  // donde se guarda el _id pero se muestra el nombre).
                  const optionValue = typeof rawOption === 'object' ? rawOption.value : rawOption;
                  const optionLabel = typeof rawOption === 'object' ? rawOption.label : rawOption;
                  const isChecked = value.includes(optionValue);
                  return (
                    <label
                      key={optionValue}
                      className={`px-4 py-2 rounded-full cursor-pointer text-xs font-semibold normal-case transition-all select-none ${
                        isChecked
                          ? 'bg-[#1E3B2F] text-white shadow-[0_10px_22px_-12px_rgba(30,59,47,0.7)]'
                          : 'bg-[#F2F6F3] text-gray-600 hover:bg-[#E6F2EA] hover:text-[#1E3B2F]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          onChange(
                            isChecked
                              ? value.filter((v) => v !== optionValue)
                              : [...value, optionValue]
                          );
                        }}
                        className="hidden"
                      />
                      {optionLabel}
                    </label>
                  );
                })}
                {(field.options || []).length === 0 && field.emptyText && (
                  <p className="text-gray-500 text-xs normal-case">{field.emptyText}</p>
                )}
              </div>
            )}
          />
        );

      case 'colorlist':
        return <ColorListField control={control} name={field.name} />;

      case 'taglist':
        return (
          <TagListField
            control={control}
            name={field.name}
            placeholder={field.placeholder}
            maxTags={field.maxTags}
            maxLength={field.maxLength}
          />
        );

      case 'select': {
        // Si el producto ya guardado tiene un valor que no está en la lista
        // (datos anteriores a este cambio), se agrega como opción para no
        // perderlo ni dejar el campo en blanco al editar.
        const opciones = field.options.map(opt => (typeof opt === 'string' ? { value: opt, label: opt } : opt));
        const valorActual = initialValues?.[field.name];
        if (valorActual && !opciones.some(o => o.value === valorActual)) {
          opciones.push({ value: valorActual, label: valorActual });
        }
        return (
          <select
            className={`${inputClass} cursor-pointer`}
            {...register(field.name, {
              required: field.required ? `Selecciona ${field.label.toLowerCase()}` : false
            })}
          >
            <option value="" disabled>{field.placeholder || 'Selecciona una opción'}</option>
            {opciones.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      }

      case 'checkbox':
        return (
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register(field.name)}
              className="w-4 h-4 rounded border-[#B9D6C3] accent-[#1E3B2F] focus:ring-2 focus:ring-[#8DBFA3] cursor-pointer"
            />
            <span className="text-sm text-gray-700 normal-case">{field.checkboxLabel || 'Sí'}</span>
          </label>
        );

      default:
        return null;
    }
  };

  const leftFields = fields.filter(f => f.column === 'left');
  const rightFields = fields.filter(f => f.column === 'right');

  // Etiqueta + campo + ayuda + error (misma estructura para ambas columnas)
  const renderFieldBlock = (field) => (
    <div key={field.name}>
      <label className="block text-xs font-semibold text-[#4F8A6B] uppercase tracking-[0.14em] mb-1.5">
        {field.label}
        {field.required && <span className="text-[#C65F5F] ml-1">*</span>}
      </label>
      {renderField(field)}
      {field.helpText && (
        <p className="text-gray-500 text-xs mt-1 normal-case">{field.helpText}</p>
      )}
      {errors[field.name] && (
        <p className="text-[#C65F5F] text-xs mt-1 normal-case">{errors[field.name].message}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-y-auto">
      <style>{STYLES}</style>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="fixed inset-0 pointer-events-auto bg-[#1E3B2F]/30 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="m503-pop m503-scroll relative bg-white rounded-3xl border border-white shadow-[0_40px_80px_-30px_rgba(30,59,47,0.55)] w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Cabecera */}
          <div className="px-6 py-4 sticky top-0 bg-white/90 backdrop-blur-md z-10 rounded-t-3xl border-b border-[#EEF4F0] flex items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-gray-500 bg-[#F2F6F3] hover:bg-[#1E3B2F] hover:text-white transition-all"
              title="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {leftFields.map(renderFieldBlock)}
              </div>

              <div className="space-y-4">
                {rightFields.map(renderFieldBlock)}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6 pt-4 border-t border-[#EEF4F0]">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-sm font-medium text-gray-700 bg-[#F2F6F3] hover:bg-[#E6F2EA] hover:text-[#1E3B2F] transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#1E3B2F] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_16px_32px_-14px_rgba(30,59,47,0.75)] hover:bg-[#162E24] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {buttonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;