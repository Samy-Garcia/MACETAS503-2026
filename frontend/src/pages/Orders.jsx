import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, CreditCard, MapPin, CheckCircle2, XCircle, Clock, Truck, Package, PackageCheck, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { getMyOrders } from "../api/cartApi";
import { CartContext } from "../context/CartContext.jsx";
import ProfileHeader from "../components/ProfileHeader";
import { ProfileContext } from "../context/ProfileContext.jsx";

// Los estados son EXACTAMENTE los mismos que ve la emprendedora en el panel
// administrativo (Pendiente, Aceptado, En proceso, Completo, Rechazado), para
// que cliente y admin hablen siempre de lo mismo. Antes la tienda los
// "traducía" (Confirmado, En Camino, Entregado, Cancelado) y no coincidían.
const STATUS_MAP = {
  Pendiente: { label: "Pendiente", group: "Pendiente", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
  Aceptado: { label: "Aceptado", group: "Aceptado", color: "bg-orange-50 text-orange-700 border-orange-200", icon: PackageCheck },
  "En proceso": { label: "En proceso", group: "En proceso", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Truck },
  Completo: { label: "Completo", group: "Completo", color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  Rechazado: { label: "Rechazado", group: "Rechazado", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "Pendiente", label: "Pendiente" },
  { key: "Aceptado", label: "Aceptado" },
  { key: "En proceso", label: "En proceso" },
  { key: "Completo", label: "Completo" },
  { key: "Rechazado", label: "Rechazado" },
];

export default function Pedidos() {

  useEffect(() => {
    document.title = "Mis Órdenes | Macetas503";
  }, []);

  const navigate = useNavigate();
  const { avatar } = useContext(ProfileContext);
  const { addToCart } = useContext(CartContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("todos");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [reordering, setReordering] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const cargarPedidos = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || "No se pudieron cargar tus pedidos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.Pendiente;

      const matchesFilter = activeFilter === "todos" || statusInfo.group === activeFilter;

      const matchesSearch =
        !searchTerm ||
        order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.some((item) => item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchTerm]);

  const handleReorder = async (order) => {
    setReordering(order._id);
    try {
      for (const item of order.products) {
        if (!item.product) continue; // el producto ya no existe, se omite
        await addToCart(item.product._id, item.productType, item.quantity);
      }
      toast.success("Productos agregados al carrito");
    } catch (err) {
      toast.error(err.message || "No se pudo repetir el pedido (revisa el stock disponible)");
    } finally {
      setReordering(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <ProfileHeader avatar={avatar} />
      <div className="px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-bold text-zinc-900">Pedidos</h1>
            <button
              onClick={() => cargarPedidos({ silent: true })}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
          <p className="text-neutral-500 text-sm mb-6">Consulta y da seguimiento a tus pedidos.</p>

          {/* Buscador + filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar pedido"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/20 bg-surface"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${activeFilter === f.key
                      ? "bg-primary-700 text-white"
                      : "bg-surface text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          {loading ? (
            <div className="text-center text-neutral-400 py-16">Cargando pedidos...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center text-neutral-400 py-16 bg-surface rounded-2xl border border-neutral-100">
              <Package size={40} className="mx-auto mb-3 text-neutral-300" />
              {orders.length === 0 ? (
                <>
                  <p className="font-medium">Todavía no tienes pedidos.</p>
                  <button onClick={() => navigate('/macetas')} className="mt-4 px-5 py-2 bg-primary-700 text-white rounded-lg text-sm font-semibold">
                    Ir a comprar
                  </button>
                </>
              ) : (
                <p className="font-medium">Ningún pedido coincide con esta búsqueda.</p>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {filteredOrders.map((order) => {
                const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.Pendiente;
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedOrder === order._id;

                return (
                  <div key={order._id} className="bg-surface rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-neutral-900">Pedido {order.orderCode}</h3>
                          <div className="flex items-center gap-4 text-xs text-neutral-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(order.createdAt).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <CreditCard size={12} />
                              Total: ${Number((order.total || 0) + (order.shippingCost || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                          <StatusIcon size={13} />
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Thumbnails de productos */}
                      <div
                        className="flex items-center gap-2 mb-4 cursor-pointer"
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      >
                        {order.products.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                            {item.product?.image ? (
                              <img src={item.product.image} alt={item.product?.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                <Package size={18} />
                              </div>
                            )}
                          </div>
                        ))}
                        <span className="text-sm text-neutral-500 ml-1">
                          {order.products.length} Producto{order.products.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Detalle expandido */}
                      {isExpanded && (
                        <div className="mb-4 space-y-2 bg-neutral-50 rounded-xl p-3">
                          {order.products.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-neutral-600">
                              <span>{item.product?.name || 'Producto eliminado'}{item.color ? ` (${item.color})` : ''}{item.customOrder ? ' ✎ Personalizado' : ''} x{item.quantity}</span>
                              <span className="font-semibold">${Number(item.subtotal).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Si la emprendedora no pudo llevar este pedido a domicilio (muy
                          lejos o el viaje era demasiado complicado), se le avisa al
                          cliente por qué ahora dice "recoges en" en vez de "te lo llevamos". */}
                      {order.deliveryChangedByAdmin && (
                        <div className="mb-3 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-xs">
                          <span className="font-semibold">Este pedido cambió a recogida en tienda.</span>{' '}
                          {order.deliveryChangeReason || 'No pudimos llevarlo a domicilio.'}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                        <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <MapPin size={13} />
                          {order.deliveryMethod === 'pickup'
                            ? `Recoges en: ${order.pickupLocation?.name || 'punto de recogida'}`
                            : `Dirección: ${order.shippingAddress || 'No especificada'}`}
                          {order.deliveryMethod === 'pickup' && order.pickupLocation?.lat && order.pickupLocation?.lng && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${order.pickupLocation.lat},${order.pickupLocation.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary-700 underline font-semibold ml-1"
                            >
                              Cómo llegar
                            </a>
                          )}
                        </span>

                        <div className="flex gap-2">
                          {order.status === 'Completo' && (
                            <button
                              onClick={() => navigate('/productoresena')}
                              className="px-4 py-2 border border-primary-700/30 text-primary-700 rounded-lg text-xs font-semibold hover:bg-primary-700/5"
                            >
                              Dejar Reseña
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                            className="px-4 py-2 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                          >
                            {isExpanded ? 'Ocultar detalle' : 'Ver Detalle'}
                          </button>
                          <button
                            onClick={() => handleReorder(order)}
                            disabled={reordering === order._id}
                            className="px-4 py-2 bg-primary-700 text-white rounded-lg text-xs font-semibold hover:bg-primary-800 disabled:opacity-50"
                          >
                            {reordering === order._id ? 'Agregando...' : 'Volver a comprar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
