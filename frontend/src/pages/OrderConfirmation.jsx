import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Check, Package, ShoppingBag } from "lucide-react";
import logoMacetas from "../assets/logoMacetas.png";

export default function OrderConfirmation() {

    useEffect(() => {
        document.title = "Pedido confirmado | Macetas503";
    }, []);
    const navigate = useNavigate();
    const location = useLocation();
    const order = location.state?.order;

    // Si alguien entra directo a esta URL sin haber acabado de pagar, no hay
    // datos de orden que mostrar (no vamos a inventar una).
    if (!order) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 text-zinc-500 bg-page">
                <Package size={40} className="text-zinc-300" />
                <p>No hay ningún pedido reciente para mostrar.</p>
                <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary-700 text-white rounded-md font-bold">
                    Volver a la tienda
                </button>
            </div>
        );
    }

    const subtotal = order.products.reduce((sum, item) => sum + item.subtotal, 0);
    // El envío real (por distancia) y el total ya vienen calculados y
    // validados por el backend; no se recalculan aquí para evitar que
    // se desincronicen (antes se mostraba un $2.00 fijo inventado).
    const shipping = order.freeShipping ? 0 : (order.shippingCost || 0);
    const total = order.total + shipping;

    return (
        <div className="w-full min-h-screen bg-page font-sans text-zinc-800">
            <header className="w-full border-b border-zinc-200/70 px-8 py-5 flex items-center justify-center">
                <Link to="/" className="flex items-center cursor-pointer">
                    <img src={logoMacetas} alt="Macetas Logo" className="h-10 object-contain" />
                </Link>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-14">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-primary-700/10 text-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 mb-1">¡Pedido confirmado!</h1>
                    <p className="text-sm text-zinc-500">
                        Código de tu pedido: <span className="font-bold text-primary-700">{order.orderCode}</span>
                    </p>
                </div>

                <div className="bg-surface border border-zinc-200/80 rounded-xl p-6 mb-6">
                    <h2 className="text-sm font-bold text-zinc-900 mb-4">Productos</h2>
                    <div className="space-y-3">
                        {order.products.map((item) => (
                            <div key={item._id} className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0">
                                    {item.product?.image ? (
                                        <img src={item.product.image} alt={item.product?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                            <ShoppingBag size={16} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-zinc-900">{item.product?.name || 'Producto eliminado'}</p>
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

                    <div className="mt-4 pt-4 border-t border-zinc-100 space-y-1.5 text-xs text-zinc-600">
                        <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Envío</span><span>{order.freeShipping ? <span className="text-green-600 font-semibold">Gratis</span> : `$${shipping.toFixed(2)}`}</span></div>
                        {order.couponCode && (
                            <div className="flex justify-between text-[11px] text-zinc-400"><span>Cupón aplicado</span><span className="font-mono">{order.couponCode}</span></div>
                        )}
                        <div className="flex justify-between text-sm font-bold text-zinc-900 pt-1">
                            <span>Total</span><span className="text-primary-700">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-surface border border-zinc-200/80 rounded-xl p-6 mb-8">
                    <h2 className="text-sm font-bold text-zinc-900 mb-2">
                        {order.deliveryMethod === 'pickup' ? 'Recogerás en' : 'Envío a'}
                    </h2>
                    {order.deliveryMethod === 'pickup' ? (
                        <>
                            <p className="text-xs text-zinc-600 font-semibold">{order.pickupLocation?.name}</p>
                            <p className="text-xs text-zinc-600">{order.pickupLocation?.address}</p>
                            {order.pickupLocation?.lat && order.pickupLocation?.lng && (
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${order.pickupLocation.lat},${order.pickupLocation.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-primary-700 underline font-semibold"
                                >
                                    Cómo llegar
                                </a>
                            )}
                        </>
                    ) : (
                        <p className="text-xs text-zinc-600">{order.shippingAddress}</p>
                    )}
                    <p className="text-xs text-zinc-600 mt-1">Tel: {order.contactPhone}</p>
                    <p className="text-[11px] text-zinc-400 mt-3">
                        Estado del pedido: <span className="font-semibold text-zinc-600">{order.status}</span>
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/pedidos')}
                        className="flex-1 bg-primary-700 text-white font-bold py-3 rounded-xl text-sm hover:bg-primary-800 transition-all"
                    >
                        Ver mis pedidos
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 border border-zinc-300 text-zinc-700 font-bold py-3 rounded-xl text-sm hover:bg-zinc-50 transition-all"
                    >
                        Seguir comprando
                    </button>
                </div>
            </main>
        </div>
    );
}
