import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MessageSquare, HelpCircle, Phone, Mail, ImageOff, X } from "lucide-react";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import HeroCarousel from "../components/HeroCarousel";
import Banner from "../assets/bannerMacetas.jpg"
import { getBestSellers, getNewestProducts } from "../api/productsApi";
import { getOffers } from "../api/offersApi";
import { getTestimonials, getMyTestimonial, submitTestimonial } from "../api/testimonialsApi";
import { getConfig } from "../api/configApi";
import { ProfileContext } from "../context/ProfileContext.jsx";

const detailPathFor = (product) => {
  if (product.productType === 'vela') return `/detallevela/${product._id}`;
  if (product.productType === 'planta') return `/plantas-y-cuidados/${product._id}`;
  return `/detalleproducto/${product._id}`;
};

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useContext(ProfileContext);

  // Estado para los filtros de "Más vendidos" (tabs reales: son los únicos
  // 3 tipos de producto que existen de verdad en el catálogo)
  const [activeTab, setActiveTab] = useState("TODOS");

  const [bestSellers, setBestSellers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loadingBestSellers, setLoadingBestSellers] = useState(true);

  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  const [newProducts, setNewProducts] = useState([]);
  const [loadingNewProducts, setLoadingNewProducts] = useState(true);

  const [heroImages, setHeroImages] = useState([]);

  // Modal de "Deja tu reseña"
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [myTestimonial, setMyTestimonial] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    document.title = "Inicio | Macetas503";
  }, []);

  useEffect(() => {
    const cargarMasVendidos = async () => {
      setLoadingBestSellers(true);
      try {
        const [data, offersData] = await Promise.all([getBestSellers(12), getOffers()]);
        setBestSellers(data);
        setOffers(offersData);
      } catch (err) {
        // silencioso: si falla, simplemente no se muestra la sección de más vendidos
        setBestSellers([]);
      } finally {
        setLoadingBestSellers(false);
      }
    };
    cargarMasVendidos();
  }, []);

  const cargarTestimonios = async () => {
    setLoadingTestimonials(true);
    try {
      const data = await getTestimonials(8);
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTestimonials(sorted.slice(0, 4));
    } catch (err) {
      setTestimonials([]);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  useEffect(() => {
    cargarTestimonios();
  }, []);

  useEffect(() => {
    const cargarNuevos = async () => {
      setLoadingNewProducts(true);
      try {
        const data = await getNewestProducts(6);
        setNewProducts(data);
      } catch (err) {
        setNewProducts([]);
      } finally {
        setLoadingNewProducts(false);
      }
    };
    cargarNuevos();
  }, []);

  useEffect(() => {
    const cargarHeroImages = async () => {
      try {
        const config = await getConfig();
        setHeroImages(config?.heroImages || []);
      } catch (err) {
        // silencioso: si falla, el carrusel cae en la imagen fija de siempre
        setHeroImages([]);
      }
    };
    cargarHeroImages();
  }, []);

  const openReviewModal = async () => {
    if (!profile) {
      toast.error('Inicia sesión para dejar una reseña');
      navigate('/login');
      return;
    }

    setShowReviewModal(true);
    try {
      const mine = await getMyTestimonial();
      if (mine) {
        setMyTestimonial(mine);
        setReviewRating(mine.rating);
        setReviewText(mine.text);
      }
    } catch (err) {
      // sin reseña previa: el formulario simplemente arranca vacío
    }
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setMyTestimonial(null);
    setReviewRating(0);
    setReviewText('');
  };

  const handleSubmitReview = async () => {
    if (reviewRating < 1) {
      toast.error('Selecciona una calificación');
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error('Cuéntanos un poco más (mínimo 10 caracteres)');
      return;
    }

    setSubmittingReview(true);
    try {
      await submitTestimonial(reviewRating, reviewText.trim());
      toast.success(myTestimonial ? 'Reseña actualizada, ¡gracias!' : '¡Gracias por tu reseña!');
      closeReviewModal();
      cargarTestimonios();
    } catch (err) {
      toast.error(err.message || 'No se pudo enviar tu reseña');
    } finally {
      setSubmittingReview(false);
    }
  };

  const offersByKey = new Map();
  offers.forEach(o => {
    if (o.status && o.product) {
      offersByKey.set(`${o.productType}-${String(o.productId)}`, o);
    }
  });

  const bestSellersFiltrados = (
    activeTab === "TODOS"
      ? bestSellers
      : bestSellers.filter(p => p.productType === activeTab.toLowerCase().slice(0, -1)) // "MACETAS" -> "maceta", "VELAS" -> "vela", "PLANTAS" -> "planta"
  ).slice(0, 4);



  return (
    <div className="w-full min-h-screen bg-page font-sans antialiased text-zinc-800 selection:bg-primary-700/10 selection:text-primary-700">


      {/* ================= HERO BANNER PRINCIPAL ================= */}
      <HeroCarousel images={heroImages} fallbackImage={Banner} altText="Macetas y plantas Macetas503" />

      {/* ================= CONTENIDO CENTRAL ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-20">

        {/* 1. MÁS VENDIDOS */}
        <section className="w-full flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Más vendidos</h2>
            <div className="flex flex-wrap items-center gap-2">
              {["TODOS", "MACETAS", "VELAS", "PLANTAS"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer tracking-wider
                    ${activeTab === tab ? "bg-primary-700 text-white shadow-md" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/masvendidos')}
                className="px-4 py-2 rounded-full border border-zinc-200 text-xs font-medium text-zinc-600 hover:text-primary-700 hover:border-primary-700/30 bg-surface shadow-xs cursor-pointer transition-colors"
              >
                Ver todos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loadingBestSellers ? (
              <div className="col-span-full text-center text-zinc-400 py-10 text-sm">Cargando...</div>
            ) : bestSellersFiltrados.length > 0 ? (
              bestSellersFiltrados.map((prod) => {
                const offer = offersByKey.get(`${prod.productType}-${String(prod._id)}`);
                return (
                  <div
                    key={`${prod.productType}-${prod._id}`}
                    onClick={() => navigate(detailPathFor(prod))}
                    className="group bg-surface rounded-xl overflow-hidden flex flex-col transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-full aspect-[4/5] bg-zinc-50 relative rounded-xl overflow-hidden mb-3 shadow-xs border border-zinc-100 flex items-center justify-center">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                      ) : null}
                      <div
                        className="w-full h-full items-center justify-center text-zinc-300"
                        style={{ display: prod.image ? 'none' : 'flex' }}
                      >
                        <ImageOff size={32} />
                      </div>
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold text-zinc-800 shadow-xs">
                        {prod.sold} vendidos
                      </div>
                      {offer && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                          -{offer.discountPercentage}%
                        </div>
                      )}
                      {prod.rating != null && (
                        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold text-zinc-800 shadow-xs">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          {prod.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 px-1">
                      <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{prod.productType}s</span>
                      <h3 className="text-sm font-semibold text-primary-700 tracking-tight line-clamp-1 group-hover:underline">{prod.name}</h3>
                      {offer ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[11px] text-zinc-400 line-through">${Number(prod.price).toFixed(2)}</p>
                          <p className="text-xs font-bold text-red-600">${Number(offer.discountedPrice).toFixed(2)}</p>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-zinc-900 mt-0.5">${Number(prod.price).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-zinc-400 py-10 text-sm">
                Todavía no hay ventas registradas en esta categoría.
              </div>
            )}
          </div>
        </section>

        {/* 2. COLECCIONES */}
        <section className="w-full flex flex-col gap-6">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Colecciones</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "MACETAS", img: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80", path: "/macetas" },
              { title: "VELAS", img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80", path: "/velas" },
              { title: "PLANTAS", img: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=400&q=80", path: "/plantas-y-cuidados" },
              { title: "COMBOS", img: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=400&q=80", path: "/combos" }
            ].map((col) => (
              <div
                key={col.title}
                onClick={() => col.path && navigate(col.path)}
                className={`w-full aspect-square relative rounded-xl overflow-hidden group shadow-xs border border-zinc-100 ${col.path ? "cursor-pointer" : "cursor-default"}`}
              >
                <img
                  src={col.img}
                  alt={col.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${col.path ? "group-hover:scale-105" : "grayscale opacity-60"}`}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="font-bold text-base tracking-widest uppercase">{col.title}</h3>
                  {col.path ? (
                    <span className="text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium tracking-wide">Ver más →</span>
                  ) : (
                    <span className="text-[10px] mt-1 font-semibold tracking-wide bg-white/20 px-2 py-0.5 rounded-full">Próximamente</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. AYUDA */}
        <section className="w-full bg-[#eef1ee] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 border border-zinc-200/50 shadow-xs">
          <div className="flex flex-col gap-2 max-w-sm text-left">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">¿Necesitas ayuda?</h2>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              Tu confianza es nuestra prioridad. ¿No estás seguro de qué plantas funcionarán en tu hogar? ¿Nuevo en la jardinería o necesitas consejos? Contáctanos, estamos aquí para ayudarte.
            </p>
          </div>

          {/* Contenedor agrupado y balanceado de las 3 tarjetas */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
            <button
              onClick={() => window.open('https://api.whatsapp.com/send?phone=50366863788&text=Hola,%20quisiera%20solicitar%20informaci%C3%B3n%20y%20ayuda%20sobre%20sus%20productos.', '_blank')}
              className="flex flex-col items-center justify-center text-center bg-surface border border-zinc-200/60 rounded-xl px-5 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] w-full sm:w-[130px] h-[105px] hover:border-primary-700/30 hover:shadow-md transition-all cursor-pointer"
            >
              <MessageSquare size={20} className="text-primary-700 mb-2" />
              <span className="text-xs font-bold text-primary-700 mb-0.5">WhatsApp</span>
              <span className="text-[10px] text-zinc-400 font-normal leading-tight">Habla con un experto</span>
            </button>

            <button
              onClick={() => navigate('/preguntas-frecuentes')}
              className="flex flex-col items-center justify-center text-center bg-surface border border-zinc-200/60 rounded-xl px-5 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] w-full sm:w-[130px] h-[105px] hover:border-primary-700/30 hover:shadow-md transition-all cursor-pointer"
            >
              <HelpCircle size={20} className="text-primary-700 mb-2" />
              <span className="text-xs font-bold text-primary-700 mb-0.5">Preguntas</span>
              <span className="text-[10px] text-zinc-400 font-normal leading-tight">Resuelve tus dudas</span>
            </button>


            <a href="mailto:noreply.macetas503@gmail.com"
              className="flex flex-col items-center justify-center text-center bg-surface border border-zinc-200/60 rounded-xl px-5 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] w-full sm:w-[130px] h-[105px] hover:border-primary-700/30 hover:shadow-md transition-all cursor-pointer"
            >
              <Mail size={20} className="text-primary-700 mb-2" />
              <span className="text-xs font-bold text-primary-700 mb-0.5">Email</span>
              <span className="text-[10px] text-zinc-400 font-normal leading-tight">Envíanos un mensaje</span>
            </a>
          </div>
        </section>

        {/* 4. NUEVOS PRODUCTOS */}
        <section className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Nuevos Productos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingNewProducts ? (
              <div className="col-span-full text-center text-zinc-400 py-10 text-sm">Cargando...</div>
            ) : newProducts.length > 0 ? (
              newProducts.map((prod) => {
                const offer = offersByKey.get(`${prod.productType}-${String(prod._id)}`);
                return (
                  <div
                    key={`${prod.productType}-${prod._id}`}
                    onClick={() => navigate(detailPathFor(prod))}
                    className="group bg-surface rounded-xl overflow-hidden flex flex-col transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-full aspect-[4/5] bg-zinc-50 relative rounded-xl overflow-hidden mb-3 shadow-xs border border-zinc-100 flex items-center justify-center">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      ) : null}
                      <div
                        className="w-full h-full items-center justify-center text-zinc-300"
                        style={{ display: prod.image ? 'none' : 'flex' }}
                      >
                        <ImageOff size={32} />
                      </div>
                      <div className="absolute top-3 left-3 bg-primary-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">Nuevo</div>
                      {offer && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                          -{offer.discountPercentage}%
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 px-1">
                      <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{prod.productType}s</span>
                      <h3 className="text-sm font-semibold text-primary-700 tracking-tight line-clamp-1 group-hover:underline">{prod.name}</h3>
                      {offer ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[11px] text-zinc-400 line-through">${Number(prod.price).toFixed(2)}</p>
                          <p className="text-xs font-bold text-red-600">${Number(offer.discountedPrice).toFixed(2)}</p>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-zinc-900 mt-0.5">${Number(prod.price).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-zinc-400 py-10 text-sm">
                Todavía no hay productos registrados.
              </div>
            )}
          </div>
        </section>

        {/* 5. CLIENTES FELICES */}
        <section className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Clientes Felices</h2>
            <button
              onClick={openReviewModal}
              className="px-4 py-2 rounded-full border border-primary-700/20 text-xs font-semibold text-primary-700 hover:bg-primary-700 hover:text-white transition-colors cursor-pointer"
            >
              Deja tu reseña
            </button>
          </div>

          {loadingTestimonials ? (
            <p className="text-sm text-zinc-400 text-center py-10">Cargando testimonios...</p>
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {testimonials.map((t) => (
                <div key={t._id} className="bg-surface rounded-xl border border-zinc-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">"{t.text}"</p>
                  <div className="flex items-center gap-3 border-t border-zinc-100 pt-3 mt-auto">
                    {t.clientPhoto ? (
                      <img src={t.clientPhoto} alt={t.clientName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-700/10 flex items-center justify-center text-primary-700 text-xs font-bold">
                        {t.clientName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-primary-700">{t.clientName}</span>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(t.createdAt).toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-zinc-400">Todavía no hay reseñas. ¡Sé el primero en dejar una!</p>
            </div>
          )}
        </section>

      </main>

      {/* Modal "Deja tu reseña" */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={closeReviewModal} />
          <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900">
                {myTestimonial ? 'Edita tu reseña' : '¿Qué te ha parecido Macetas503?'}
              </h3>
              <button onClick={closeReviewModal} className="text-zinc-400 hover:text-zinc-700">
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setReviewRating(n)} className="cursor-pointer">
                  <Star
                    size={26}
                    className={n <= reviewRating ? "fill-amber-400 text-amber-400" : "text-zinc-300"}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={300}
              placeholder="Cuéntanos sobre tu experiencia con nosotros..."
              className="w-full border border-zinc-200 rounded-lg p-3 text-sm text-zinc-700 focus:outline-none focus:border-primary-700 resize-none"
            />
            <p className="text-[10px] text-zinc-400 text-right mt-1">{reviewText.length}/300</p>

            <button
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className="w-full bg-primary-700 text-white py-3 rounded-lg font-bold text-sm hover:bg-primary-800 disabled:opacity-50 transition-colors mt-2"
            >
              {submittingReview ? 'Enviando...' : myTestimonial ? 'Actualizar reseña' : 'Enviar reseña'}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
