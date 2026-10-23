import { useState, useEffect, useContext } from "react";
import { ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileHeader from "../components/ProfileHeader";
import { ProfileContext } from "../context/ProfileContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { getMyCustomOrders } from "../api/customOrdersApi";

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' });

const getEstadoClases = (status) => {
  switch (status) {
    case 'Aceptado': return 'bg-green-50 text-green-700 border-green-200';
    case 'Pendiente': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'En proceso': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Completo': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Rechazado': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  }
};

export default function CustomOrdersProfile() {

  useEffect(() => {
    document.title = "Mis Personalizaciones | Macetas503";
  }, []);

  const { avatar } = useContext(ProfileContext);
  const { addCustomOrderToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cantidades, setCantidades] = useState({});
  const [agregando, setAgregando] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyCustomOrders();
      setCustomOrders(data);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar tus personalizaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const getCantidad = (id) => cantidades[id] ?? 1;
  const setCantidad = (id, valor) => setCantidades(prev => ({ ...prev, [id]: Math.max(1, valor) }));

  const handleAgregarAlCarrito = async (co) => {
    setAgregando(co._id);
    try {
      await addCustomOrderToCart(co._id, getCantidad(co._id));
      toast.success('¡Agregado al carrito!');
      setCustomOrders(prev => prev.map(item => item._id === co._id ? { ...item, status: 'En proceso' } : item));
      navigate('/carrito');
    } catch (err) {
      toast.error(err.message || 'No se pudo agregar al carrito');
    } finally {
      setAgregando(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-page font-sans text-zinc-800 pb-12">
      <ProfileHeader avatar={avatar} />

      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">

        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Personalizaciones</h1>
          <p className="text-zinc-500 mt-1">
            Solicitudes de personalización que has pedido sobre macetas -- se piden directo desde la página del producto.
          </p>
        </div>

        <h2 className="text-xl font-bold text-zinc-900 mt-4">Mis Solicitudes ({customOrders.length})</h2>

        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {loading ? (
          <div className="text-center text-zinc-400 py-16">Cargando...</div>
        ) : customOrders.length === 0 ? (
          <div className="text-center text-zinc-400 py-16 bg-surface rounded-lg border border-zinc-200">
            Todavía no has pedido ninguna personalización. Si una maceta se puede personalizar, verás la opción en su página de producto.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customOrders.map((co) => (
              <div key={co._id} className="bg-surface border border-zinc-200 rounded-lg overflow-hidden flex shadow-sm">
                {co.productImage ? (
                  <img src={co.productImage} alt={co.productName} className="w-1/3 object-cover" />
                ) : (
                  <div className="w-1/3 bg-zinc-100 flex items-center justify-center text-zinc-300">
                    <ImageOff size={24} />
                  </div>
                )}
                <div className="p-5 flex flex-col justify-between w-2/3">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-zinc-900">{co.productName}</h3>
                      <span className="text-[10px] text-zinc-400 shrink-0">
                        {formatearFecha(co.createdAt)}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-primary-700 bg-primary-700/5 px-2 py-0.5 rounded">
                      ✎ Personalizado
                    </span>
                    <span className={`inline-block mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getEstadoClases(co.status)}`}>
                      {co.status}
                    </span>
                    <p className="text-xs text-zinc-600 leading-relaxed mt-3">{co.description}</p>
                    {co.price != null && (
                      <p className="text-sm font-bold text-primary-700 mt-2">${Number(co.price).toFixed(2)} c/u</p>
                    )}
                  </div>
                  {co.referenceImage && (
                    <img src={co.referenceImage} alt="Tu referencia" className="mt-3 w-16 h-16 rounded object-cover border border-zinc-200" />
                  )}

                  {/* Solo se puede agregar al carrito cuando el admin ya
                      aceptó la solicitud y definió un precio */}
                  {co.status === 'Aceptado' && co.price != null && (
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={getCantidad(co._id)}
                        onChange={(e) => setCantidad(co._id, Number(e.target.value) || 1)}
                        className="w-16 px-2 py-1.5 border border-zinc-300 rounded-md text-sm text-center"
                      />
                      <button
                        onClick={() => handleAgregarAlCarrito(co)}
                        disabled={agregando === co._id}
                        className="flex-1 bg-primary-700 text-white py-1.5 rounded-md text-xs font-semibold hover:bg-primary-800 disabled:opacity-50"
                      >
                        {agregando === co._id ? 'Agregando...' : 'Agregar al carrito'}
                      </button>
                    </div>
                  )}

                  {/* Igual que con productos normales: solo se puede
                      reseñar una vez que el pedido llegó (Completo), y solo
                      si no se ha dejado ya una reseña de este producto */}
                  {co.status === 'Completo' && co.orderId && (
                    co.reviewed ? (
                      <span className="mt-4 pt-3 border-t border-zinc-100 block text-center bg-zinc-100 text-zinc-400 py-1.5 rounded text-xs font-semibold">
                        Ya reseñado
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate("/resenaform", { state: { item: {
                          orderId: co.orderId,
                          productId: co.productId,
                          productType: 'maceta',
                          productName: co.productName,
                          productImage: co.productImage
                        } } })}
                        className="mt-4 pt-3 border-t border-zinc-100 w-full bg-primary-700 text-white py-1.5 rounded text-xs font-semibold hover:bg-primary-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>✎</span> Escribir Reseña
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
