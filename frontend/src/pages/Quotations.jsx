import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Flower2, Sprout, Flame, Package, Calendar, ImageOff } from "lucide-react";
import Footer from "../components/Footer";
import AddressLocationPicker from "../components/AddressLocationPicker";
import { todayISO, isPastDate } from "../utils/dateUtils";
import { getPots } from "../api/productsApi";
import { getCandles } from "../api/candlesApi";
import { getPlants } from "../api/plantsApi";
import { getOthers } from "../api/othersApi";
import { createQuotation } from "../api/quotationsApi";

const CATEGORIAS = [
  { key: 'maceta', nombre: 'Macetas', icon: Flower2, loader: getPots },
  { key: 'vela', nombre: 'Velas', icon: Flame, loader: getCandles },
  { key: 'planta', nombre: 'Plantas', icon: Sprout, loader: getPlants },
  { key: 'otro', nombre: 'Otros', icon: Package, loader: getOthers }
];

const TIPOS_EVENTO = ['Boda', 'Cumpleaños', 'Bautizo', 'Baby Shower', 'Graduación', 'Corporativo', 'Otro'];

export default function Quotations() {

  useEffect(() => {
    document.title = "Cotizaciones | Macetas503";
  }, []);

  const navigate = useNavigate();

  const [categoriaActiva, setCategoriaActiva] = useState('maceta');
  const [catalogo, setCatalogo] = useState({});
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);

  // Cada renglón elegido: { productType, productId, productName, productImage, unitPrice, quantity }
  const [itemsElegidos, setItemsElegidos] = useState([]);
  const [cantidadesTemp, setCantidadesTemp] = useState({});

  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState(null); // { lat, lng } del lugar del evento (se manda al backend y el admin lo ve con "Ver en el mapa")
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarCatalogo = async () => {
      setLoadingCatalogo(true);
      try {
        const resultados = await Promise.all(CATEGORIAS.map(c => c.loader()));
        const nuevo = {};
        CATEGORIAS.forEach((c, i) => { nuevo[c.key] = resultados[i]; });
        setCatalogo(nuevo);
      } catch (err) {
        toast.error('No se pudo cargar el catálogo de productos');
      } finally {
        setLoadingCatalogo(false);
      }
    };
    cargarCatalogo();
  }, []);

  const getCantidadTemp = (id) => cantidadesTemp[id] ?? 1;
  const ajustarCantidadTemp = (id, delta) => {
    setCantidadesTemp(prev => ({ ...prev, [id]: Math.max(1, getCantidadTemp(id) + delta) }));
  };

  const agregarItem = (producto, productType) => {
    const cantidad = getCantidadTemp(producto._id);
    setItemsElegidos(prev => {
      const existente = prev.find(it => it.productId === producto._id && it.productType === productType);
      if (existente) {
        return prev.map(it =>
          (it.productId === producto._id && it.productType === productType)
            ? { ...it, quantity: it.quantity + cantidad }
            : it
        );
      }
      return [...prev, {
        productType,
        productId: producto._id,
        productName: producto.name,
        productImage: producto.image,
        unitPrice: Number(producto.price),
        quantity: cantidad
      }];
    });
    toast.success(`${producto.name} agregado a tu cotización`);
  };

  const quitarItem = (productId, productType) => {
    setItemsElegidos(prev => prev.filter(it => !(it.productId === productId && it.productType === productType)));
  };

  const subtotal = useMemo(() => itemsElegidos.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0), [itemsElegidos]);

  const handleSolicitarCotizacion = async () => {
    if (itemsElegidos.length === 0) {
      toast.error('Agrega al menos un producto a tu cotización');
      return;
    }
    if (!eventType || !eventDate) {
      toast.error('El tipo de evento y la fecha son obligatorios');
      return;
    }
    if (isPastDate(eventDate)) {
      toast.error('La fecha del evento no puede ser una fecha pasada');
      return;
    }

    setEnviando(true);
    try {
      await createQuotation({
        eventType,
        eventDate,
        guestCount: guestCount ? Number(guestCount) : undefined,
        location,
        locationLat: locationCoords?.lat,
        locationLng: locationCoords?.lng,
        specialRequirements,
        items: itemsElegidos
      });
      toast.success('¡Solicitud enviada! Te contactaremos pronto con el precio final.');
      navigate('/mis-cotizaciones');
    } catch (err) {
      if (err.message?.includes('sesión')) {
        toast.error('Inicia sesión para pedir una cotización');
        navigate('/login');
      } else {
        toast.error(err.message || 'No se pudo enviar la solicitud');
      }
    } finally {
      setEnviando(false);
    }
  };

  const productosCategoria = catalogo[categoriaActiva] || [];

  return (
    <div className="w-full min-h-screen bg-page font-sans text-zinc-800">

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-zinc-900 mb-2">Cotiza tu evento</h1>
        <p className="text-zinc-600 mb-8 max-w-lg">
          Personaliza la atmósfera de tu celebración con nuestro catálogo. Selecciona tus favoritos y recibe una propuesta detallada.
        </p>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-grow">
            {/* Categorías */}
            <div className="flex gap-4 mb-10 flex-wrap">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoriaActiva(cat.key)}
                  className={`w-32 py-6 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                    categoriaActiva === cat.key ? "bg-primary-700 text-white shadow-lg" : "border-zinc-200 hover:border-primary-700"
                  }`}
                >
                  <cat.icon size={28} />
                  <span className="font-semibold text-sm">{cat.nombre}</span>
                </button>
              ))}
            </div>

            {/* Grid Productos */}
            {loadingCatalogo ? (
              <div className="text-center text-zinc-400 py-12">Cargando catálogo...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {productosCategoria.map((p) => (
                  <div key={p._id} className="border border-zinc-200 rounded-lg p-3 bg-surface">
                    <div className="h-64 bg-zinc-100 rounded mb-4 relative overflow-hidden flex items-center justify-center">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageOff size={40} className="text-zinc-300" />
                      )}
                      {p.rating != null && (
                        <div className="absolute top-3 right-3 bg-surface px-2 py-1 rounded text-xs flex items-center gap-1 font-semibold">
                          ★ {p.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-primary-700 font-bold mb-4">${Number(p.price).toFixed(2)} / unidad</p>

                    <div className="flex gap-2">
                      <div className="flex border border-zinc-300 rounded overflow-hidden">
                        <button onClick={() => ajustarCantidadTemp(p._id, -1)} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200">-</button>
                        <span className="px-6 py-2 border-x border-zinc-300 font-bold">{getCantidadTemp(p._id)}</span>
                        <button onClick={() => ajustarCantidadTemp(p._id, 1)} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200">+</button>
                      </div>
                      <button
                        onClick={() => agregarItem(p, categoriaActiva)}
                        className="flex-grow bg-primary-700 text-white py-2 rounded font-bold hover:bg-primary-800 transition-colors"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                ))}

                {productosCategoria.length === 0 && (
                  <div className="col-span-full text-center text-zinc-400 py-8">
                    No hay productos en esta categoría todavía.
                  </div>
                )}
              </div>
            )}

            {/* Formulario */}
            <div className="border border-zinc-200 rounded-xl p-8 bg-surface">
              <h2 className="text-2xl font-bold text-primary-700 mb-6 flex items-center gap-2">
                <Calendar className="text-primary-700" /> Detalles del Evento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="date"
                  min={todayISO()}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="p-3 border rounded bg-zinc-50"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Cantidad de invitados (Ej: 50)"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="p-3 border rounded bg-zinc-50"
                />
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="p-3 border rounded bg-zinc-50 text-zinc-700"
                >
                  <option value="">Tipo de evento</option>
                  {TIPOS_EVENTO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Lugar del evento</label>
                  <AddressLocationPicker
                    descripcion="Marca en el mapa dónde será tu evento, busca el lugar por nombre o usa tu ubicación actual."
                    lat={locationCoords?.lat}
                    lng={locationCoords?.lng}
                    onUbicacionSeleccionada={(coords, direccionTexto) => {
                      setLocationCoords(coords);
                      setLocation(direccionTexto);
                    }}
                  />
                  <input
                    placeholder="El lugar se llena solo al marcar el mapa (puedes editarlo)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-3 w-full p-3 border rounded bg-zinc-50"
                  />
                </div>
                <textarea
                  placeholder="¿Tienes algún requerimiento especial?"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  className="col-span-1 md:col-span-2 p-3 border rounded bg-zinc-50 h-24"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80">
            <div className="border border-zinc-200 rounded-xl p-6 sticky top-24 bg-surface shadow-sm">
              <h3 className="font-bold mb-4 text-lg">
                Tu Cotización <span className="text-sm font-normal text-zinc-500">({itemsElegidos.length} item{itemsElegidos.length !== 1 ? 's' : ''})</span>
              </h3>

              {itemsElegidos.length === 0 ? (
                <p className="text-sm text-zinc-400 mb-6">Todavía no has agregado ningún producto.</p>
              ) : (
                <div className="space-y-3 mb-6 text-sm">
                  {itemsElegidos.map((it) => (
                    <div key={`${it.productType}-${it.productId}`} className="flex justify-between items-start gap-2">
                      <div>
                        <p>{it.productName}</p>
                        <p className="text-xs text-zinc-400">x{it.quantity} · ${it.unitPrice.toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span>${(it.unitPrice * it.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => quitarItem(it.productId, it.productType)}
                          className="text-zinc-400 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total Est.</span> <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Este total es solo una referencia -- el precio final (con posibles descuentos por volumen y logística) te lo confirmamos por correo.
                  </p>
                </div>
              )}

              <button
                onClick={handleSolicitarCotizacion}
                disabled={enviando}
                className="w-full bg-primary-700 text-white py-3 rounded font-bold hover:bg-primary-800 transition-colors disabled:opacity-50"
              >
                {enviando ? 'Enviando...' : 'Solicitar Cotización'}
              </button>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
