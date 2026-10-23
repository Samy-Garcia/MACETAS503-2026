import React, { useState } from 'react';
import { getConfig } from '../api/config.js';

const STATUS_COLORS = {
  Pendiente: 'bg-[#F7DC6F] text-black',
  Aceptado: 'bg-[#A8D5BA] text-white',
  'En proceso': 'bg-[#AED6F1] text-black',
  Completo: 'bg-[#85C1E9] text-white',
  Rechazado: 'bg-[#F5B7B1] text-white'
};

// Una vez que la orden llegó a estos estados, ya no tiene caso ofrecer
// cambiarla a recogida en tienda (ya se entregó o ya se canceló).
const ESTADOS_FINALES = ['Completo', 'Rechazado'];

const OrderDetailModal = ({ order, onClose, onForcePickup }) => {
  // --- Formulario para pasar la orden a recogida en tienda ---
  const [showPickupForm, setShowPickupForm] = useState(false);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!order) return null;

  const puedeCambiarARecogida =
    order.deliveryMethod !== 'pickup' && !ESTADOS_FINALES.includes(order.status);

  const abrirFormularioPickup = async () => {
    setShowPickupForm(true);
    setFormError('');
    setLoadingLocations(true);
    try {
      const config = await getConfig();
      const activas = (config?.pickupLocations || []).filter(loc => loc.isActive);
      setPickupLocations(activas);
      if (activas.length === 1) setSelectedLocationId(activas[0]._id);
    } catch (err) {
      setFormError(err.message || 'No se pudieron cargar los puntos de recogida');
    } finally {
      setLoadingLocations(false);
    }
  };

  const cancelarFormularioPickup = () => {
    setShowPickupForm(false);
    setSelectedLocationId('');
    setReason('');
    setFormError('');
  };

  const confirmarCambioAPickup = async () => {
    if (!selectedLocationId) {
      setFormError('Elige un punto de recogida');
      return;
    }
    if (!reason.trim()) {
      setFormError('Indica el motivo (ej: la dirección queda fuera de la zona de cobertura)');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await onForcePickup(order._id, { pickupLocationId: selectedLocationId, reason: reason.trim() });
      cancelarFormularioPickup();
    } catch (err) {
      setFormError(err.message || 'No se pudo cambiar el método de entrega');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="border-b border-[#DCEIDA]/40 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-xl font-bold text-black">Orden {order.orderCode}</h2>
              <p className="text-xs text-black/50">
                {order.createdAt ? new Date(order.createdAt).toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-black'}`}>
              {order.status}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Cliente */}
            <div>
              <h3 className="text-sm font-bold text-black mb-2">Cliente</h3>
              <div className="bg-[#FBE0D9]/10 rounded-xl p-4 text-sm text-black/80 space-y-1">
                <p><span className="font-medium">Nombre:</span> {order.client?.name || 'Cliente eliminado'}</p>
                <p><span className="font-medium">Correo:</span> {order.client?.email || '—'}</p>
                <p><span className="font-medium">Tipo:</span> {order.clientType}</p>
              </div>
            </div>

            {/* Envío / Recogida */}
            <div>
              <h3 className="text-sm font-bold text-black mb-2">
                {order.deliveryMethod === 'pickup' ? 'Recogida en tienda' : 'Envío'}
              </h3>
              <div className="bg-[#FBE0D9]/10 rounded-xl p-4 text-sm text-black/80 space-y-1">
                {order.deliveryMethod === 'pickup' ? (
                  <>
                    <p>
                      <span className="font-medium">Punto de recogida:</span> {order.pickupLocation?.name || 'No especificado'}
                    </p>
                    <p>
                      <span className="font-medium">Dirección:</span> {order.pickupLocation?.address || 'No especificada'}
                      {order.pickupLocation?.lat && order.pickupLocation?.lng && (
                        <a
                          href={`https://www.google.com/maps?q=${order.pickupLocation.lat},${order.pickupLocation.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-[#5f7568] underline hover:text-[#3f4f45]"
                        >
                          Ver en el mapa
                        </a>
                      )}
                    </p>
                    <p className="text-xs text-[#5f7568]">El cliente pasará a recoger este pedido, no requiere envío a domicilio.</p>
                  </>
                ) : (
                  <p>
                    <span className="font-medium">Dirección:</span> {order.shippingAddress || 'No especificada'}
                    {order.shippingLat && order.shippingLng && (
                      <a
                        href={`https://www.google.com/maps?q=${order.shippingLat},${order.shippingLng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-[#5f7568] underline hover:text-[#3f4f45]"
                      >
                        Ver en el mapa
                      </a>
                    )}
                  </p>
                )}
                <p><span className="font-medium">Teléfono:</span> {order.contactPhone || 'No especificado'}</p>
              </div>

              {/* Aviso de que esta orden ya fue cambiada de envío a recogida */}
              {order.deliveryChangedByAdmin && (
                <div className="mt-2 bg-[#F7DC6F]/20 border border-[#F7DC6F]/40 rounded-xl p-3 text-xs text-black/70">
                  <span className="font-semibold">Cambiada a recogida en tienda.</span> Motivo: {order.deliveryChangeReason || 'No especificado'}
                </div>
              )}

              {/* Botón / formulario para pasar la orden a recogida en tienda
                  -- para cuando la dirección queda muy lejos o el viaje es
                  demasiado complicado. */}
              {puedeCambiarARecogida && !showPickupForm && (
                <button
                  type="button"
                  onClick={abrirFormularioPickup}
                  className="mt-2 text-xs font-medium text-[#5f7568] hover:underline"
                >
                  No se puede llevar a domicilio · Cambiar a recogida en tienda
                </button>
              )}

              {showPickupForm && (
                <div className="mt-2 border border-[#DCEIDA]/40 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-black/70 uppercase tracking-wider">Cambiar a recogida en tienda</p>

                  {loadingLocations ? (
                    <p className="text-xs text-black/40">Cargando puntos de recogida...</p>
                  ) : pickupLocations.length === 0 ? (
                    <p className="text-xs text-[#C65F5F]">
                      No hay ningún punto de recogida activo. Agrega uno en Ajustes antes de hacer este cambio.
                    </p>
                  ) : (
                    <>
                      <select
                        value={selectedLocationId}
                        onChange={(e) => setSelectedLocationId(e.target.value)}
                        className="w-full px-3 py-2 border border-[#DCEIDA]/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A4B8AC]"
                      >
                        <option value="">Elige un punto de recogida...</option>
                        {pickupLocations.map((loc) => (
                          <option key={loc._id} value={loc._id}>{loc.name}</option>
                        ))}
                      </select>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Motivo (ej: la dirección queda fuera de la zona de cobertura)"
                        rows={2}
                        className="w-full px-3 py-2 border border-[#DCEIDA]/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A4B8AC] resize-none"
                      />
                    </>
                  )}

                  {formError && <p className="text-xs text-[#C65F5F]">{formError}</p>}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelarFormularioPickup}
                      disabled={submitting}
                      className="px-4 py-1.5 text-xs font-medium text-black border border-[#DCEIDA]/40 rounded-lg hover:bg-[#FBE0D9] transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    {pickupLocations.length > 0 && (
                      <button
                        type="button"
                        onClick={confirmarCambioAPickup}
                        disabled={submitting}
                        className="px-4 py-1.5 text-xs font-medium text-white bg-[#A4B8AC] rounded-lg hover:bg-[#8E929B] transition-all disabled:opacity-50"
                      >
                        {submitting ? 'Guardando...' : 'Confirmar cambio'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Productos */}
            <div>
              <h3 className="text-sm font-bold text-black mb-2">Productos ({order.items} items)</h3>
              <div className="space-y-2">
                {(order.products || []).map((item) => (
                  <div key={item._id} className="flex items-center gap-3 bg-white border border-[#DCEIDA]/40 rounded-xl p-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#FBE0D9]/20 shrink-0">
                      {item.product?.image ? (
                        <img src={item.product.image} alt={item.product?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/20 text-xs">Sin img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black truncate">
                        {item.product?.name || 'Producto eliminado'}
                      </p>
                      <p className="text-xs text-black/50 capitalize">{item.productType} · Cantidad: {item.quantity}</p>
                      {item.color && (
                        <p className="text-xs text-black/50">Color: <span className="capitalize">{item.color}</span></p>
                      )}
                      {item.customOrder && (
                        <p className="text-xs text-[#064225] font-semibold mt-0.5">✎ Personalizado: {item.customOrder.description}</p>
                      )}
                    </div>
                    <p className="text-sm font-bold text-black">${Number(item.subtotal).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-[#DCEIDA]/40">
              <span className="text-sm font-bold text-black">Total del pedido</span>
              <span className="text-xl font-bold text-black">${Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-[#DCEIDA]/40 px-6 py-4 flex justify-end sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#A4B8AC] text-white rounded-xl font-medium hover:bg-[#8ba394] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
