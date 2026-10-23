import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm.jsx';
import usePageTitle from '../hooks/usePageTitle';
import logoMacetas from '../assets/logoMacetas.png';
import {
  getAllTestimonials,
  deleteTestimonial,
  getAllProductReviews,
  deleteProductReview
} from '../api/reviewsAdminApi';

/* ─────────────────────────────────────────────────────────────
   Estilos locales (misma serif, grano y animaciones del panel)
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

  .m503-grain::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: .08;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  }

  @keyframes m503-fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: none; }
  }
  .m503-fade-up { animation: m503-fade-up .55s cubic-bezier(.22,1,.36,1) both; }

  @keyframes m503-modal-in {
    from { opacity: 0; transform: translateY(16px) scale(.98); }
    to   { opacity: 1; transform: none; }
  }
  .m503-modal-in { animation: m503-modal-in .35s cubic-bezier(.22,1,.36,1) both; }

  @media (prefers-reduced-motion: reduce) {
    .m503-fade-up, .m503-modal-in { animation: none; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Íconos
   ───────────────────────────────────────────────────────────── */
// Estrellas en dorado cálido: el amarillo/dorado es lo que la gente
// reconoce como calificación, y combina con la arena de la paleta.
const StarIcon = ({ filled, className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 20 20" fill={filled ? '#D9A441' : 'none'} stroke="#D9A441" strokeWidth="1.5">
    <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1 1 5.8L10 14.9l-5.21 2.62 1-5.8-4.21-4.1 5.82-.85z" />
  </svg>
);

const Estrellas = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(n => <StarIcon key={n} filled={n <= rating} />)}
  </div>
);

const DeleteIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PinIcon = ({ className = 'w-3 h-3' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z" />
  </svg>
);

const ImageIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

/* ─────────────────────────────────────────────────────────────
   Piezas visuales
   ───────────────────────────────────────────────────────────── */
const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]';

const SectionTitle = ({ upper, serif, count }) => (
  <div className="flex items-end justify-between gap-3 mb-4">
    <h2 className="flex items-baseline gap-2 text-gray-900">
      <span className="text-sm font-bold uppercase tracking-[0.18em]">{upper}</span>
      <span className="m503-serif text-3xl text-[#4F8A6B] leading-none">{serif}</span>
    </h2>
    <span className="text-xs font-medium text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full whitespace-nowrap">
      {count}
    </span>
  </div>
);

const DeleteButton = ({ onClick, title }) => (
  <button
    onClick={onClick}
    className="w-8 h-8 rounded-full flex items-center justify-center text-[#C65F5F] bg-[#FDF3F3] hover:bg-[#E08A8A] hover:text-white transition-all shrink-0"
    title={title}
  >
    <DeleteIcon className="w-3.5 h-3.5" />
  </button>
);

const TOAST_ACCENT = {
  success: '#7FA392',
  error: '#E08A8A',
  warning: '#E7B95A',
  info: '#8E909C',
};

// Testimonio de referencia: siempre se muestra primero en "Clientes
// Felices", para que esa sección nunca se vea vacía (útil para
// demostraciones, ej. Expotécnica). No viene del backend, no se puede
// borrar, y usa el logo de la tienda como foto.
const TESTIMONIO_SEMILLA = {
  _id: 'semilla',
  clientName: 'Macetas503',
  clientPhoto: logoMacetas,
  rating: 5,
  text: 'Este espacio muestra lo que opinan nuestros clientes. ¡Gracias por confiar en Macetas503!',
  createdAt: null,
  esSemilla: true
};

const ReviewsPage = ({ onLogout }) => {
  usePageTitle();

  const { toasts, showSuccess, showError } = useToast(3000);
  const { confirm, ConfirmDialog } = useConfirm();

  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const cargarTodo = async () => {
    setLoadingTestimonials(true);
    setLoadingReviews(true);
    try {
      const data = await getAllTestimonials();
      setTestimonials(data);
    } catch (err) {
      showError(err.message || 'No se pudieron cargar los testimonios');
    } finally {
      setLoadingTestimonials(false);
    }

    try {
      const data = await getAllProductReviews();
      setReviews(data);
    } catch (err) {
      showError(err.message || 'No se pudieron cargar las reseñas de producto');
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const handleEliminarTestimonio = async (id) => {
    const ok = await confirm('¿Estás seguro de eliminar este testimonio? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      await deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t._id !== id));
      showSuccess('Testimonio eliminado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo eliminar el testimonio');
    }
  };

  const handleEliminarReseña = async (id) => {
    const ok = await confirm('¿Estás seguro de eliminar esta reseña? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      await deleteProductReview(id);
      setReviews(prev => prev.filter(r => r._id !== id));
      // Si era la última reseña del producto abierto en el modal, lo cerramos
      setProductoSeleccionado(prev => {
        if (!prev) return prev;
        const restantes = reviews.filter(r => r._id !== id && r.productId === prev.productId);
        return restantes.length > 0 ? prev : null;
      });
      showSuccess('Reseña eliminada exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo eliminar la reseña');
    }
  };

  // Agrupa las reseñas planas que vienen del backend en una tarjeta por
  // producto (nombre, imagen, promedio, cantidad), para mostrarlas como
  // catálogo -- el detalle real de cada reseña se ve en el modal.
  const productosConReseñas = React.useMemo(() => {
    const grupos = {};
    reviews.forEach(r => {
      const key = `${r.productType}-${r.productId}`;
      if (!grupos[key]) {
        grupos[key] = {
          productId: r.productId,
          productType: r.productType,
          productName: r.productName,
          productImage: r.productImage,
          reseñas: []
        };
      }
      grupos[key].reseñas.push(r);
    });
    return Object.values(grupos).map(g => ({
      ...g,
      promedio: Number((g.reseñas.reduce((sum, r) => sum + r.rating, 0) / g.reseñas.length).toFixed(1))
    }));
  }, [reviews]);

  const testimoniosCompletos = [TESTIMONIO_SEMILLA, ...testimonials];

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
      <style>{STYLES}</style>
      <Sidebar onLogout={onLogout} />
      {ConfirmDialog}

      {/* Toast Notifications */}
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[60] space-y-2">
        {toasts.map((toast) => {
          const accent = TOAST_ACCENT[toast.type] || TOAST_ACCENT.info;
          return (
            <div
              key={toast.id}
              className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-white border-l-[3px] rounded-2xl px-4 sm:px-5 py-3 shadow-[0_12px_30px_-12px_rgba(30,59,47,0.3)] text-sm font-medium text-gray-800 transition-all transform"
              style={{ minWidth: '280px', borderLeftColor: accent }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
              {toast.message}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">
          {/* Header */}
          <div className="mb-8 m503-fade-up">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
              <LeafIcon className="w-3 h-3" />
              Opiniones
            </span>
            <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
              <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Gestión de</span>
              <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">reseñas</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Administra los testimonios del inicio y las reseñas de cada producto
            </p>
            <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-6"></div>
          </div>

          {/* Clientes Felices (testimonios del inicio) -- fijada primero */}
          <section className="mb-10 m503-fade-up" style={{ animationDelay: '.08s' }}>
            <SectionTitle
              upper="Clientes"
              serif="felices"
              count={`${testimonials.length} testimonio${testimonials.length !== 1 ? 's' : ''} de clientes`}
            />

            {loadingTestimonials ? (
              <div className={`${cardClass} text-center py-12 text-gray-400`}>Cargando testimonios...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {testimoniosCompletos.map((t) =>
                  t.esSemilla ? (
                    /* Testimonio fijado: mismo look que el panel de marca */
                    <div
                      key={t._id}
                      className="m503-grain relative overflow-hidden rounded-3xl p-5 flex flex-col gap-3 bg-gradient-to-br from-[#D5E9DD] via-[#E8F2EC] to-[#F5EFE3] border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]"
                    >
                      <div className="pointer-events-none absolute -bottom-16 -right-10 w-40 h-40 rounded-full bg-[#F1E4C8] blur-2xl opacity-80" />
                      <span className="m503-serif pointer-events-none absolute top-0 right-5 text-[90px] leading-none text-[#4F8A6B]/15 select-none">”</span>

                      <div className="relative flex items-center gap-3">
                        <img
                          src={t.clientPhoto || logoMacetas}
                          alt={t.clientName}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-[0_8px_18px_-8px_rgba(30,59,47,0.6)]"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900">{t.clientName}</p>
                          <Estrellas rating={t.rating} />
                        </div>
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1E3B2F] bg-white/70 px-2 py-1 rounded-full">
                          <PinIcon />
                          Fijado
                        </span>
                      </div>
                      <p className="relative m503-serif text-lg text-gray-800 leading-snug">“{t.text}”</p>
                    </div>
                  ) : (
                    <div key={t._id} className={`relative overflow-hidden ${cardClass} p-5 flex flex-col gap-3`}>
                      <span className="m503-serif pointer-events-none absolute top-0 right-5 text-[90px] leading-none text-[#4F8A6B]/10 select-none">”</span>

                      <div className="relative flex items-center gap-3">
                        <img
                          src={t.clientPhoto || logoMacetas}
                          alt={t.clientName}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-[0_8px_18px_-8px_rgba(30,59,47,0.5)]"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{t.clientName}</p>
                          <Estrellas rating={t.rating} />
                        </div>
                      </div>
                      <p className="relative m503-serif text-lg text-gray-700 leading-snug flex-1">“{t.text}”</p>
                      <div className="relative flex justify-end">
                        <DeleteButton onClick={() => handleEliminarTestimonio(t._id)} title="Eliminar testimonio" />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* Reseñas de producto, agrupadas por producto */}
          <section className="m503-fade-up" style={{ animationDelay: '.16s' }}>
            <SectionTitle
              upper="Reseñas por"
              serif="producto"
              count={`${reviews.length} reseña${reviews.length !== 1 ? 's' : ''} en total`}
            />

            {loadingReviews ? (
              <div className={`${cardClass} text-center py-12 text-gray-400`}>Cargando reseñas...</div>
            ) : productosConReseñas.length === 0 ? (
              <div className={`${cardClass} p-12 text-center`}>
                <LeafIcon className="w-7 h-7 mx-auto text-[#8DBFA3]" />
                <p className="mt-2 m503-serif text-xl text-gray-500">Todavía no hay reseñas de productos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                {productosConReseñas.map((p) => (
                  <button
                    key={`${p.productType}-${p.productId}`}
                    onClick={() => setProductoSeleccionado(p)}
                    className={`group ${cardClass} p-2 text-left hover:-translate-y-1 hover:shadow-[0_28px_55px_-28px_rgba(30,59,47,0.55)] transition-all`}
                  >
                    <div className="relative aspect-square rounded-[1.25rem] overflow-hidden bg-gradient-to-br from-[#E8F2EC] to-[#F5EFE3]">
                      {p.productImage ? (
                        <img
                          src={p.productImage}
                          alt={p.productName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#8DBFA3]">
                          <ImageIcon />
                          <span className="text-xs text-gray-400">Sin imagen</span>
                        </div>
                      )}
                      {/* Promedio sobre la imagen */}
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-xs font-bold text-gray-900 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm">
                        <StarIcon filled className="w-3 h-3" />
                        {p.promedio}
                      </span>
                    </div>
                    <div className="px-2 pt-3 pb-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.productName}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <Estrellas rating={Math.round(p.promedio)} />
                        <span className="text-[11px] font-medium text-[#4F8A6B] bg-[#E6F2EA] px-2 py-0.5 rounded-full">
                          {p.reseñas.length} {p.reseñas.length === 1 ? 'reseña' : 'reseñas'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal con el detalle de las reseñas de un producto */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-[#1E3B2F]/30 backdrop-blur-sm"
              onClick={() => setProductoSeleccionado(null)}
            />
            <div className="m503-modal-in relative bg-white/95 backdrop-blur-xl rounded-[2rem] border border-white shadow-[0_40px_90px_-40px_rgba(30,59,47,0.6)] w-full max-w-lg max-h-[85vh] overflow-y-auto">
              {/* Encabezado del modal */}
              <div className="sticky top-0 z-10 p-2 bg-white/95 backdrop-blur-xl rounded-t-[2rem]">
                <div className="m503-grain relative overflow-hidden rounded-[1.5rem] px-4 py-4 flex items-center gap-3 bg-gradient-to-br from-[#D5E9DD] via-[#E8F2EC] to-[#F5EFE3]">
                  {productoSeleccionado.productImage ? (
                    <img
                      src={productoSeleccionado.productImage}
                      alt=""
                      className="relative w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-[0_8px_18px_-8px_rgba(30,59,47,0.6)]"
                    />
                  ) : (
                    <span className="relative w-14 h-14 rounded-2xl bg-white/70 text-[#8DBFA3] flex items-center justify-center">
                      <ImageIcon />
                    </span>
                  )}
                  <div className="relative min-w-0 flex-1">
                    <h2 className="text-lg font-black text-gray-900 truncate">{productoSeleccionado.productName}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="m503-serif text-base text-[#4F8A6B] capitalize">{productoSeleccionado.productType}</span>
                      <span className="w-1 h-1 rounded-full bg-[#8DBFA3]" />
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-800">
                        <StarIcon filled className="w-3 h-3" />
                        {productoSeleccionado.promedio}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setProductoSeleccionado(null)}
                    className="relative w-9 h-9 rounded-full bg-white/70 text-[#1E3B2F] hover:bg-white flex items-center justify-center transition-colors shrink-0"
                    aria-label="Cerrar"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-6 pt-3 pb-4 space-y-3">
                {reviews
                  .filter(r => r.productId === productoSeleccionado.productId && r.productType === productoSeleccionado.productType)
                  .map((r) => (
                    <div key={r._id} className="rounded-2xl bg-[#F5FAF7] border border-[#EEF4F0] p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-full bg-[#1E3B2F] text-white text-sm font-bold flex items-center justify-center shrink-0">
                            {(r.clientName || '?').charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{r.clientName}</p>
                            <Estrellas rating={r.rating} />
                            {r.isCustomized && (
                              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-[#1E3B2F] bg-[#E6F2EA] px-2 py-0.5 rounded-full">
                                ✎ Personalizado
                              </span>
                            )}
                          </div>
                        </div>
                        <DeleteButton onClick={() => handleEliminarReseña(r._id)} title="Eliminar reseña" />
                      </div>
                      <p className="m503-serif text-[17px] text-gray-700 mt-3 leading-snug">“{r.comment}”</p>
                      {r.image && (
                        <img
                          src={r.image}
                          alt="Foto de la reseña"
                          className="mt-3 w-24 h-24 rounded-2xl object-cover ring-2 ring-white shadow-[0_8px_18px_-10px_rgba(30,59,47,0.5)]"
                        />
                      )}
                    </div>
                  ))}
              </div>

              <div className="px-6 pb-6">
                <button
                  onClick={() => setProductoSeleccionado(null)}
                  className="w-full px-6 py-3 rounded-2xl border-2 border-[#E7EFEA] bg-white text-sm text-gray-700 font-semibold uppercase tracking-wide hover:border-[#C9E0D2] hover:bg-[#F5FAF7] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;