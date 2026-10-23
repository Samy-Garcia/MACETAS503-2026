import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { ShoppingBag, MapPin, CreditCard, ShieldCheck, Truck, PhoneCall } from "lucide-react";
import logoMacetas from "../assets/logoMacetas.png";
import { CartContext } from "../context/CartContext.jsx";
import MapaEnvio from "../components/ShippingMap"; // ajusta la ruta según donde lo guardes
import { phonePattern, blockNonPhoneChars } from "../utils/inputValidation";
import { getMyProfile } from "../api/profileApi";
import { getConfig } from "../api/configApi";
import { generarTokenWompi, tokenizarTarjeta, pagarTarjetaPrueba, pagarConTarjetaGuardada, iniciarPago3DS } from "../api/wompiApi.js";
import { CLAVE_CHECKOUT_3DS } from "./Pago3DSResultado.jsx";

// Respuesta real de POST /TransaccionCompra/TokenizadaSin3Ds (confirmado en el
// Swagger de Wompi): { idTransaccion, esReal, esAprobada, codigoAutorizacion, mensaje, monto }
function extraerResultadoPago(resp) {
    if (!resp) return { aprobada: false, mensaje: 'Sin respuesta del servidor.' };
    return {
        aprobada: Boolean(resp.esAprobada),
        idTransaccion: resp.idTransaccion,
        codigoAutorizacion: resp.codigoAutorizacion,
        mensaje: resp.mensaje,
    };
}

// Agrupa el número de tarjeta en bloques de 4, rellenando lo que falta con puntos
function formatearNumeroTarjeta(valor) {
    const digits = (valor || '').replace(/\D/g, '');
    const relleno = (digits + '••••••••••••••••').slice(0, 16);
    return relleno.match(/.{1,4}/g).join(' ');
}

export default function Checkout() {

    useEffect(() => {
        document.title = "Checkout | Macetas503";
    }, []);
    const navigate = useNavigate();
    const { cart, isAuthenticated, loading, checkout } = useContext(CartContext);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [shipping, setShipping] = useState(0);
    const [shippingCoords, setShippingCoords] = useState(null);
    const [esEnvioGratis, setEsEnvioGratis] = useState(false);
    const [destinoSeleccionado, setDestinoSeleccionado] = useState(false);

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [modoUbicacion, setModoUbicacion] = useState('mapa'); // 'mapa' | 'guardada'
    const [ubicacionForzada, setUbicacionForzada] = useState(null);
    const [direccionGuardadaSeleccionada, setDireccionGuardadaSeleccionada] = useState(null);

    // Método de entrega: "shipping" (a domicilio, como siempre) o "pickup"
    // (el cliente pasa a recogerlo él mismo en una dirección que guardó la
    // emprendedora -- para cuando ella no puede llevarlo a domicilio). En
    // pickup el envío siempre es gratis y no se pide dirección ni mapa.
    const [deliveryMethod, setDeliveryMethod] = useState('shipping');
    const [pickupLocations, setPickupLocations] = useState([]);
    const [selectedPickupId, setSelectedPickupId] = useState(null);

    // Estado del pago de prueba con Wompi
    const [pagoAprobado, setPagoAprobado] = useState(false);
    const [pagoInfo, setPagoInfo] = useState(null); // { idTransaccion, codigoAutorizacion, mensaje }
    const [paymentError, setPaymentError] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    // Tarjeta guardada en el perfil del cliente (si tiene una) y qué método
    // de pago está usando: "guardada" (la del perfil, sin re-tokenizar) o
    // "nueva" (digitar los datos de la tarjeta, como siempre).
    const [savedCard, setSavedCard] = useState(null);
    const [metodoPago, setMetodoPago] = useState('nueva');

    // Estado del giro de la tarjeta visual (click para ver el reverso / CVV)
    const [isCardFlipped, setIsCardFlipped] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            shippingAddress: '',
            contactPhone: '',
            couponCode: '',
            cardNumber: '',
            cardMonth: '',
            cardYear: '',
            cardCvv: '',
            cardHolderName: '',
            cardHolderLastName: '',
            cardEmail: '',
        }
    });

    const direccionActual = watch('shippingAddress');
    const telefonoActual = watch('contactPhone');

    // Valores en vivo para dibujar la tarjeta visual
    const cardNumberValue = watch('cardNumber');
    const cardHolderNameValue = watch('cardHolderName');
    const cardHolderLastNameValue = watch('cardHolderLastName');
    const cardMonthValue = watch('cardMonth');
    const cardYearValue = watch('cardYear');
    const cardCvvValue = watch('cardCvv');

    const nombreEnTarjetaVisual = `${cardHolderNameValue || 'NOMBRE'} ${cardHolderLastNameValue || 'APELLIDO'}`.trim().toUpperCase();
    const vencimientoEnTarjeta = `${(cardMonthValue || 'MM').toString().padStart(2, '0')}/${(cardYearValue || 'AAAA').toString().slice(-2)}`;

    useEffect(() => {
        const cargarDirecciones = async () => {
            try {
                const profile = await getMyProfile();
                setSavedAddresses(profile.addresses || []);
                if (profile.savedCard) {
                    setSavedCard(profile.savedCard);
                    setMetodoPago('guardada');
                }
            } catch (err) {
                console.error("No se pudieron cargar las direcciones guardadas:", err);
            }
        };
        cargarDirecciones();

        const cargarPuntosDeRecogida = async () => {
            try {
                const config = await getConfig();
                setPickupLocations((config?.pickupLocations || []).filter(loc => loc.isActive));
            } catch (err) {
                console.error("No se pudieron cargar los puntos de recogida:", err);
            }
        };
        cargarPuntosDeRecogida();
    }, []);

    const seleccionarPickup = (locationId) => {
        setSelectedPickupId(locationId);
        setShipping(0);
        setEsEnvioGratis(true);
        setDestinoSeleccionado(true);
    };

    const cambiarMetodoEntrega = (metodo) => {
        setDeliveryMethod(metodo);
        if (metodo === 'pickup') {
            setShipping(0);
            setEsEnvioGratis(true);
            setDestinoSeleccionado(!!selectedPickupId);
        } else {
            // Volver a "a domicilio": el envío se vuelve a calcular con el
            // mapa, así que hasta que no se marque de nuevo, no hay destino.
            setSelectedPickupId(null);
            setEsEnvioGratis(false);
            setDestinoSeleccionado(false);
        }
    };

    const direccionesConUbicacion = savedAddresses.filter(addr => addr.lat && addr.lng);

    const normalizarTelefonoLocal = (phone) => {
        if (!phone) return '';
        let digits = phone.replace(/\D/g, '');
        if (digits.length > 8 && digits.startsWith('503')) {
            digits = digits.slice(3);
        }
        return digits;
    };

    const seleccionarDireccionGuardada = (addr) => {
        setDireccionGuardadaSeleccionada(addr._id);
        setValue('contactPhone', normalizarTelefonoLocal(addr.phone), { shouldValidate: true });
        setUbicacionForzada({
            lat: addr.lat,
            lng: addr.lng,
            texto: [addr.addressLine, addr.municipality, addr.department].filter(Boolean).join(', ')
        });
    };

    const cartItems = cart.products || [];
    const subtotal = cart.total || 0;
    const total = subtotal + shipping;

    // Flujo real confirmado contra el Swagger de Wompi:
    // 1) token OAuth -> 2) tokenizar tarjeta (POST /Tokenizacion, devuelve { token }) ->
    // 3) TokenizadaSin3Ds solo necesita { monto, emailCliente, nombreCliente, tokenTarjeta }.
    // Ningún paso cobra dinero real mientras el aplicativo esté en modo Desarrollo.
    const pagarConTarjetaPrueba = async (data) => {
        const token = await generarTokenWompi();
        const nombreCompleto = `${data.cardHolderName} ${data.cardHolderLastName}`.trim();

        const resultadoTokenizacion = await tokenizarTarjeta({
            token,
            numeroTarjeta: data.cardNumber.replace(/\s+/g, ''),
            cvv: data.cardCvv,
            mesVencimiento: Number(data.cardMonth),
            anioVencimiento: Number(data.cardYear),
            nombreEnTarjeta: nombreCompleto,
        });

        return pagarTarjetaPrueba({
            tokenTarjeta: resultadoTokenizacion.token,
            monto: Number(total.toFixed(2)),
            emailCliente: data.cardEmail,
            nombreCliente: nombreCompleto,
        });
    };

    // Si el cliente eligió pagar con su tarjeta guardada, no se pide ni se
    // vuelve a tokenizar número/mes/año/cvv -- el backend usa el token que
    // ya tiene guardado. Si no, sigue el flujo de siempre (tokeniza y paga).
    const procesarPago = async (data) => {
        if (metodoPago === 'guardada' && savedCard) {
            const nombreCompleto = `${data.cardHolderName} ${data.cardHolderLastName}`.trim();
            return pagarConTarjetaGuardada({
                monto: Number(total.toFixed(2)),
                emailCliente: data.cardEmail,
                nombreCliente: nombreCompleto,
            });
        }
        return pagarConTarjetaPrueba(data);
    };

    const onSubmit = async (data) => {
        const result = await Swal.fire({
            title: "¿Confirmar compra?",
            text: `Se procesará el pago por $${total.toFixed(2)}. ¿Deseas continuar?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, pagar y confirmar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "var(--color-primary-700)",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        setSubmitError('');
        setPaymentError('');
        setSubmitting(true);
        setProcessingPayment(true);

        try {
            // Tarjeta nueva => pago con 3D Secure: se guarda lo necesario para
            // terminar el pedido al volver del banco y se lleva al cliente a
            // la página de verificación de Wompi. (La tarjeta guardada sigue
            // cobrándose directo con su token.)
            if (!(metodoPago === 'guardada' && savedCard)) {
                const nombre = data.cardHolderName.trim();
                const apellido = data.cardHolderLastName.trim();
                const { idTransaccion: idPendiente, urlCompletarPago3Ds } = await iniciarPago3DS({
                    numeroTarjeta: data.cardNumber.replace(/\s+/g, ''),
                    cvv: data.cardCvv,
                    mesVencimiento: Number(data.cardMonth),
                    anioVencimiento: Number(data.cardYear),
                    monto: Number(total.toFixed(2)),
                    nombre,
                    apellido,
                    email: data.cardEmail,
                    telefono: data.contactPhone,
                    direccion: data.shippingAddress,
                });

                try {
                    sessionStorage.setItem(CLAVE_CHECKOUT_3DS, JSON.stringify({
                        idTransaccion: idPendiente,
                        checkout: {
                            shippingAddress: data.shippingAddress,
                            contactPhone: data.contactPhone,
                            couponCode: data.couponCode,
                            shippingCost: deliveryMethod === 'pickup' ? 0 : shipping,
                            shippingLat: shippingCoords?.lat,
                            shippingLng: shippingCoords?.lng,
                            deliveryMethod,
                            pickupLocationId: deliveryMethod === 'pickup' ? selectedPickupId : undefined,
                        },
                    }));
                } catch {
                    throw new Error('Tu navegador no permite continuar con el pago seguro. Desactiva el modo privado e intenta de nuevo.');
                }

                window.location.href = urlCompletarPago3Ds;
                return; // se queda en "procesando" mientras el navegador cambia de página
            }

            const resultadoPago = await procesarPago(data);
            setProcessingPayment(false);

            const { aprobada, idTransaccion, codigoAutorizacion, mensaje } = extraerResultadoPago(resultadoPago);

            if (!aprobada) {
                setPagoAprobado(false);
                setPaymentError(mensaje || 'La transacción de prueba fue rechazada.');
                setSubmitting(false);
                return;
            }

            setPagoAprobado(true);
            setPagoInfo({ idTransaccion, codigoAutorizacion, mensaje });

            const order = await checkout({
                ...data,
                shippingCost: deliveryMethod === 'pickup' ? 0 : shipping,
                shippingLat: shippingCoords?.lat,
                shippingLng: shippingCoords?.lng,
                deliveryMethod,
                pickupLocationId: deliveryMethod === 'pickup' ? selectedPickupId : undefined,
                wompiTransaccionId: idTransaccion,
            });

            await Swal.fire({
                title: "¡Compra hecha con éxito!",
                text: "Tu pedido fue confirmado y el pago quedó registrado.",
                icon: "success",
                confirmButtonText: "Ver mi pedido",
                confirmButtonColor: "var(--color-primary-700)",
            });

            navigate("/confirmacion-orden", { state: { order } });
        } catch (err) {
            setPaymentError(err.message || 'No se pudo procesar el pago de prueba.');
            setSubmitError(err.message || 'No se pudo confirmar el pedido.');
        } finally {
            setSubmitting(false);
            setProcessingPayment(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-500 bg-page">
                <p>Debes iniciar sesión para continuar con tu pedido.</p>
                <button onClick={() => navigate('/login')} className="px-6 py-2 bg-primary-700 text-white rounded-md font-bold">
                    Iniciar sesión
                </button>
            </div>
        );
    }

    if (!loading && cartItems.length === 0) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-500 bg-page">
                <ShoppingBag size={40} className="text-zinc-300" />
                <p>Tu carrito está vacío.</p>
                <button onClick={() => navigate('/macetas')} className="px-6 py-2 bg-primary-700 text-white rounded-md font-bold">
                    Ver productos
                </button>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-page font-sans antialiased text-zinc-800 flex flex-col justify-between">
            {/* ENCABEZADO SIMPLE */}
            <header className="w-full bg-[#e8e8e8] border-b border-zinc-300/60 px-8 py-5 flex items-center justify-between">
                <Link to="/" className="flex items-center cursor-pointer">
                    <img src={logoMacetas} alt="Macetas Logo" className="h-10 object-contain" />
                </Link>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl w-full mx-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2">

                    {/* COLUMNA IZQUIERDA: DATOS DE ENVÍO */}
                    <div className="p-6 sm:p-10 lg:border-r border-zinc-300/70">
                        <h2 className="text-base font-bold text-zinc-900 mb-1 tracking-tight">Datos de Envío</h2>
                        <p className="text-xs text-zinc-500 mb-6">
                            El pago se procesa con Wompi y tu banco te pedirá autorizarlo (3D Secure).
                        </p>

                        {/* Método de entrega: a domicilio o recoger en tienda */}
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => cambiarMetodoEntrega('shipping')}
                                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                                    deliveryMethod === 'shipping'
                                        ? 'bg-primary-700 text-white border-transparent'
                                        : 'bg-surface text-zinc-600 border-zinc-300 hover:bg-zinc-100'
                                }`}
                            >
                                Envío a domicilio
                            </button>
                            <button
                                type="button"
                                onClick={() => cambiarMetodoEntrega('pickup')}
                                disabled={pickupLocations.length === 0}
                                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                    deliveryMethod === 'pickup'
                                        ? 'bg-primary-700 text-white border-transparent'
                                        : 'bg-surface text-zinc-600 border-zinc-300 hover:bg-zinc-100'
                                }`}
                            >
                                Recoger en tienda
                            </button>
                        </div>

                        {deliveryMethod === 'pickup' ? (
                            <div className="mb-5 space-y-2">
                                <p className="text-[11px] text-zinc-500 mb-1">
                                    Elige el lugar donde vas a pasar a recoger tu pedido. El envío queda gratis.
                                </p>
                                {pickupLocations.map(location => (
                                    <div
                                        key={location._id}
                                        className={`w-full flex items-start gap-2.5 bg-surface border rounded-xl p-3 transition-all ${
                                            selectedPickupId === location._id
                                                ? 'border-primary-700 ring-1 ring-primary-700'
                                                : 'border-zinc-200/70 hover:border-primary-700/40'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => seleccionarPickup(location._id)}
                                            className="flex items-start gap-2.5 text-left flex-1 min-w-0"
                                        >
                                            <MapPin size={16} className="text-primary-700 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-zinc-900">{location.name}</p>
                                                <p className="text-[11px] text-zinc-500">{location.address}</p>
                                            </div>
                                        </button>
                                        {location.lat && location.lng && (
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-[10px] font-semibold text-primary-700 underline shrink-0 whitespace-nowrap mt-0.5"
                                            >
                                                Cómo llegar
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setModoUbicacion('mapa')}
                                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                                    modoUbicacion === 'mapa'
                                        ? 'bg-primary-700 text-white border-transparent'
                                        : 'bg-surface text-zinc-600 border-zinc-300 hover:bg-zinc-100'
                                }`}
                            >
                                Usar el mapa
                            </button>
                            <button
                                type="button"
                                onClick={() => setModoUbicacion('guardada')}
                                className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                                    modoUbicacion === 'guardada'
                                        ? 'bg-primary-700 text-white border-transparent'
                                        : 'bg-surface text-zinc-600 border-zinc-300 hover:bg-zinc-100'
                                }`}
                            >
                                Usar dirección guardada
                            </button>
                        </div>
                        )}

                        {deliveryMethod === 'shipping' && modoUbicacion === 'guardada' && (
                            <div className="mb-5 space-y-2">
                                {direccionesConUbicacion.length === 0 ? (
                                    <div className="bg-surface border border-zinc-200/70 rounded-xl p-4 text-xs text-zinc-500">
                                        Todavía no tienes direcciones guardadas con ubicación en el mapa.
                                        Agrega una desde <Link to="/perfil" className="text-primary-700 font-semibold underline">tu perfil</Link>,
                                        o usa el mapa aquí abajo por esta vez.
                                    </div>
                                ) : (
                                    direccionesConUbicacion.map(addr => (
                                        <button
                                            key={addr._id}
                                            type="button"
                                            onClick={() => seleccionarDireccionGuardada(addr)}
                                            className={`w-full text-left flex items-start gap-2.5 bg-surface border rounded-xl p-3 transition-all ${
                                                direccionGuardadaSeleccionada === addr._id
                                                    ? 'border-primary-700 ring-1 ring-primary-700'
                                                    : 'border-zinc-200/70 hover:border-primary-700/40'
                                            }`}
                                        >
                                            <MapPin size={16} className="text-primary-700 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                                                    {addr.fullName}
                                                    {addr.isDefault && (
                                                        <span className="text-[9px] font-semibold text-primary-700 bg-primary-700/10 px-1.5 py-0.5 rounded-full">Predeterminada</span>
                                                    )}
                                                </p>
                                                <p className="text-[11px] text-zinc-500 truncate">
                                                    {[addr.addressLine, addr.municipality, addr.department].filter(Boolean).join(', ')}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        {deliveryMethod === 'shipping' && (
                        <div className="mb-5 bg-surface border border-zinc-200/70 rounded-xl p-3">
                            <MapaEnvio
                                subtotal={subtotal}
                                ubicacionForzada={ubicacionForzada}
                                onDireccionSeleccionada={(texto, coords) => {
                                    setValue('shippingAddress', texto, { shouldValidate: true });
                                    if (coords) setShippingCoords(coords);
                                }}
                                onCostoEnvioCalculado={(costoEnvio, distanciaMetros, duracionSegundos, esGratis) => {
                                    setShipping(costoEnvio);
                                    setEsEnvioGratis(!!esGratis);
                                    setDestinoSeleccionado(true);
                                }}
                            />
                        </div>
                        )}

                        <div className="space-y-4">
                            {deliveryMethod === 'shipping' && (
                            <div>
                                <label className="text-[10px] text-zinc-500 font-medium">Dirección de envío</label>
                                <textarea
                                    rows={3}
                                    placeholder="Ej: Res. Las Flores, calle 3, casa #12, San Salvador"
                                    className="w-full bg-surface border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-700/30"
                                    {...register('shippingAddress', { required: deliveryMethod === 'shipping' && 'La dirección es obligatoria' })}
                                />
                                {errors.shippingAddress && (
                                    <p className="text-red-500 text-[10px] mt-1">{errors.shippingAddress.message}</p>
                                )}
                            </div>
                            )}

                            <div>
                                <label className="text-[10px] text-zinc-500 font-medium">Teléfono de contacto</label>
                                <input
                                    type="tel"
                                    placeholder="7000-0000"
                                    onKeyDown={blockNonPhoneChars}
                                    className="w-full bg-surface border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary-700/30"
                                    {...register('contactPhone', { required: 'El teléfono es obligatorio', pattern: phonePattern })}
                                />
                                {errors.contactPhone && (
                                    <p className="text-red-500 text-[10px] mt-1">{errors.contactPhone.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] text-zinc-500 font-medium">
                                    Código de envío gratis o descuento <span className="text-zinc-400">(opcional)</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: M503-A1B2C3"
                                    className="w-full bg-surface border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-800 uppercase focus:outline-none focus:ring-2 focus:ring-primary-700/30"
                                    {...register('couponCode')}
                                />
                                <p className="text-[10px] text-zinc-400 mt-1">
                                    Se valida al confirmar tu pedido. Consigue códigos canjeando tus hojas en el programa de fidelidad.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO + PAGO CON TARJETA */}
                    <div className="p-6 sm:p-10 bg-[#f3f3f1] flex flex-col">
                        <h2 className="text-base font-bold text-zinc-900 mb-4 tracking-tight">Resumen del pedido</h2>

                        <div className="space-y-3 mb-6">
                            {cartItems.map((item) => (
                                <div key={item._id} className="flex items-center gap-3 bg-surface rounded-xl p-3 border border-zinc-200/70">
                                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0">
                                        {item.product?.image ? (
                                            <img src={item.product.image} alt={item.product?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                <ShoppingBag size={18} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-zinc-900 truncate">{item.product?.name || 'Producto eliminado'}</p>
                                        <p className="text-[10px] text-zinc-400">Cantidad: {item.quantity}</p>
                                        {item.color && (
                                            <p className="text-[10px] text-zinc-400">Color: <span className="capitalize">{item.color}</span></p>
                                        )}
                                        {item.customOrder && (
                                            <p className="text-[10px] text-primary-700 font-semibold">✎ Personalizado: {item.customOrder.description}</p>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-zinc-900">${Number(item.subtotal).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-1.5 text-xs text-zinc-600 bg-surface rounded-xl p-4 border border-zinc-200/70">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Envío</span>
                                <span>
                                    {!destinoSeleccionado
                                        ? (deliveryMethod === 'pickup' ? 'Elige dónde recoger' : 'Marca tu ubicación en el mapa')
                                        : esEnvioGratis
                                            ? <span className="text-primary-700 font-semibold">Gratis</span>
                                            : `$${shipping.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-zinc-900 pt-2 border-t border-zinc-100 mt-2">
                                <span>Total</span>
                                <span className="text-primary-700">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* CONFIRMACIÓN DE ENTREGA */}
                        <div className="mt-5 bg-surface rounded-xl p-4 border border-zinc-200/70">
                            <div className="flex items-center gap-2 mb-2">
                                <Truck size={16} className="text-primary-700" />
                                <h3 className="text-xs font-bold text-zinc-900">
                                    {deliveryMethod === 'pickup' ? 'Recogerás en' : 'Se entregará en'}
                                </h3>
                            </div>
                            {deliveryMethod === 'pickup' ? (
                                selectedPickupId ? (
                                    <div className="text-[11px] text-zinc-600 space-y-1">
                                        <p>{pickupLocations.find(l => l._id === selectedPickupId)?.name}</p>
                                        <p className="text-zinc-400">{pickupLocations.find(l => l._id === selectedPickupId)?.address}</p>
                                        {telefonoActual && <p className="text-zinc-400">Contacto: {telefonoActual}</p>}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-zinc-400">Elige arriba dónde vas a recoger tu pedido.</p>
                                )
                            ) : destinoSeleccionado && direccionActual ? (
                                <div className="text-[11px] text-zinc-600 space-y-1">
                                    <p>{direccionActual}</p>
                                    {telefonoActual && <p className="text-zinc-400">Contacto: {telefonoActual}</p>}
                                </div>
                            ) : (
                                <p className="text-[11px] text-zinc-400">
                                    Marca tu ubicación en el mapa para confirmar la dirección de entrega.
                                </p>
                            )}
                        </div>

                        {/* --- BLOQUE DE PAGO DE PRUEBA CON WOMPI --- */}
                        <div className="mt-5 bg-surface rounded-xl p-4 border border-zinc-200/70">
                            <div className="flex items-center gap-2 mb-3">
                                <CreditCard size={16} className="text-primary-700" />
                                <h3 className="text-xs font-bold text-zinc-900">Pago con tarjeta</h3>
                            </div>

                            {/* Si el cliente tiene una tarjeta guardada en su perfil, puede
                                elegir entre usarla directamente o pagar con una tarjeta nueva. */}
                            {savedCard && (
                                <div className="flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setMetodoPago('guardada')}
                                        className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${metodoPago === 'guardada'
                                            ? 'bg-primary-700 text-white border-primary-700'
                                            : 'bg-surface text-zinc-600 border-zinc-300'
                                            }`}
                                    >
                                        Tarjeta guardada
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMetodoPago('nueva')}
                                        className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${metodoPago === 'nueva'
                                            ? 'bg-primary-700 text-white border-primary-700'
                                            : 'bg-surface text-zinc-600 border-zinc-300'
                                            }`}
                                    >
                                        Otra tarjeta
                                    </button>
                                </div>
                            )}

                            {metodoPago === 'guardada' && savedCard ? (
                                <div className="bg-surface border border-zinc-200 rounded-md p-6 flex justify-center shadow-xs mb-4">
                                    <div className="w-72 h-44 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-xl p-5 flex flex-col justify-between text-white shadow-md select-none">
                                        <div className="flex">
                                            <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-xs"></div>
                                            <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-xs -ml-3.5"></div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 w-full font-mono">
                                            <span className="text-lg tracking-widest opacity-95">
                                                {savedCard.maskedNumber || "**** **** **** ****"}
                                            </span>
                                            <span className="text-[11px] font-sans uppercase tracking-wider font-semibold opacity-80 w-full text-left mt-1">
                                                {savedCard.cardHolderName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* TARJETA VISUAL — click para girar y ver el reverso (CVV) */}
                                    <div className="bg-surface border border-zinc-200 rounded-md p-6 flex justify-center shadow-xs mb-4">
                                        <div
                                            onClick={() => setIsCardFlipped(prev => !prev)}
                                            className="w-72 h-44 cursor-pointer [perspective:1000px] select-none"
                                            title="Click para ver el reverso"
                                        >
                                            <div
                                                className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
                                                style={{ transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                                            >
                                                {/* FRENTE */}
                                                <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-xl p-5 flex flex-col justify-between text-white shadow-md overflow-hidden">
                                                    <div className="flex items-center justify-between">
                                                        <div className="w-9 h-7 rounded-md bg-gradient-to-br from-yellow-200/80 to-yellow-400/60" />
                                                        <div className="flex">
                                                            <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-xs"></div>
                                                            <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-xs -ml-3.5"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-3 w-full font-mono">
                                                        <span className="text-lg tracking-widest opacity-95">
                                                            {formatearNumeroTarjeta(cardNumberValue)}
                                                        </span>
                                                        <div className="flex items-end justify-between w-full">
                                                            <span className="text-[11px] font-sans uppercase tracking-wider font-semibold opacity-80 truncate max-w-[65%]">
                                                                {nombreEnTarjetaVisual}
                                                            </span>
                                                            <span className="text-[11px] font-mono opacity-80">
                                                                {vencimientoEnTarjeta}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* REVERSO */}
                                                <div
                                                    className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 rounded-xl flex flex-col text-white shadow-md overflow-hidden"
                                                    style={{ transform: 'rotateY(180deg)' }}
                                                >
                                                    <div className="w-full h-9 bg-black mt-5" />
                                                    <div className="px-5 mt-4">
                                                        <div className="w-full h-8 bg-zinc-200/90 rounded-sm flex items-center justify-end pr-3">
                                                            <span className="text-zinc-800 text-xs font-mono font-bold tracking-widest">
                                                                {cardCvvValue || '•••'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="px-5 mt-3 text-[9px] text-white/50 leading-snug">
                                                        Este es el código de seguridad de tu tarjeta. No lo compartas con nadie.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={19}
                                        placeholder="Número de tarjeta"
                                        className="w-full bg-surface border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-800 mb-3"
                                        {...register('cardNumber', { required: 'Requerido' })}
                                    />

                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={2}
                                            placeholder="MM"
                                            className="bg-surface border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-800"
                                            {...register('cardMonth', { required: 'Requerido' })}
                                        />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={4}
                                            placeholder="AAAA"
                                            className="bg-surface border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-800"
                                            {...register('cardYear', { required: 'Requerido' })}
                                        />
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={3}
                                            placeholder="CVV"
                                            onFocus={() => setIsCardFlipped(true)}
                                            onBlur={() => setIsCardFlipped(false)}
                                            className="bg-surface border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-800"
                                            {...register('cardCvv', { required: 'Requerido' })}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <input
                                    type="text"
                                    placeholder="Nombres del titular"
                                    className="bg-surface border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-800"
                                    {...register('cardHolderName', { required: 'Requerido' })}
                                />
                                <input
                                    type="text"
                                    placeholder="Apellidos del titular"
                                    className="bg-surface border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-800"
                                    {...register('cardHolderLastName', { required: 'Requerido' })}
                                />
                            </div>

                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                className="w-full bg-surface border border-zinc-300 rounded-lg p-2.5 text-xs text-zinc-800 mb-3"
                                {...register('cardEmail', { required: 'Requerido' })}
                            />

                            {paymentError && (
                                <div className="p-2.5 bg-red-50 text-red-700 text-[11px] rounded-lg mt-3">{paymentError}</div>
                            )}
                            {pagoAprobado && pagoInfo && (
                                <div className="p-2.5 bg-green-50 text-green-700 text-[11px] rounded-lg mt-3">
                                    Pago de prueba aprobado (transacción {pagoInfo.idTransaccion}).
                                </div>
                            )}
                        </div>

                        {/* SELLO DE COMPRA SEGURA */}
                        <div className="mt-5 bg-surface rounded-xl p-4 border border-zinc-200/70">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck size={16} className="text-primary-700" />
                                <h3 className="text-xs font-bold text-zinc-900">Compra segura</h3>
                            </div>
                            <p className="text-[11px] text-zinc-500">
                                Tus datos viajan cifrados y el pago se verifica con 3D Secure a través de Wompi.
                            </p>
                        </div>

                        {submitError && (
                            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg mt-5">{submitError}</div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !destinoSeleccionado}
                            className="w-full bg-primary-700 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-5"
                        >
                            {processingPayment
                                ? 'Procesando pago de prueba...'
                                : submitting
                                    ? 'Confirmando pedido...'
                                    : `Pagar y confirmar pedido — $${total.toFixed(2)}`}
                        </button>

                        <div className="mt-5 bg-surface rounded-xl p-4 border border-zinc-200/70">
                            <div className="flex items-center gap-2 mb-2">
                                <PhoneCall size={16} className="text-primary-700" />
                                <h3 className="text-xs font-bold text-zinc-900">¿Necesitas ayuda?</h3>
                            </div>
                            <p className="text-[11px] text-zinc-500">
                                Escríbenos si tienes dudas con tu pedido antes de confirmarlo.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}