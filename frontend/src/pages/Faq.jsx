import { useState, useEffect } from "react";
import {
    Search, Heart, User, ShoppingBag,
    ChevronDown, ChevronUp, ShoppingCart,
    FileText, UserCheck, CreditCard, Truck,
    MessageSquare, Phone, Mail
} from "lucide-react";
import logoMacetas from "../assets/logoMacetas.png";
import Footer from "../components/Footer";

export default function Faq() {

    useEffect(() => {
        document.title = "Preguntas Frecuentes | Macetas503";
    }, []);
    // Estado para la categoría activa de preguntas
    const [activeTab, setActiveTab] = useState("General");

    // Estado para controlar qué acordeón está abierto (guarda el ID de la pregunta)
    const [openAccordion, setOpenAccordion] = useState(1);

    // Lista de categorías idénticas a tu boceto
    const categories = ["General", "Envíos", "Cuidados", "Compras"];

    // Banco de preguntas y respuestas estructurado por categorías
    const faqData = {
        General: [
            { id: 1, icon: <ShoppingCart size={20} className="text-zinc-600" />, q: "¿Qué productos venden?", a: "¿Tienes alguna duda? Consulta nuestras preguntas frecuentes y encuentra respuestas rápidas sobre nuestros servicios." },
            { id: 2, icon: <FileText size={20} className="text-zinc-600" />, q: "¿Cómo puedo hacer un pedido?", a: "Para hacer un pedido, navega por nuestra tienda, añade tus macetas o productos favoritos al carrito, ve al checkout y completa la información de pago y envío de forma segura." },
            { id: 3, icon: <UserCheck size={20} className="text-zinc-600" />, q: "¿Necesito una cuenta para comprar?", a: "No es obligatorio, puedes realizar tu compra como invitado. Sin embargo, registrarte te permite guardar tu historial de pedidos y acumular puntos de recompensa." },
            { id: 4, icon: <CreditCard size={20} className="text-zinc-600" />, q: "¿Qué métodos de pago aceptan?", a: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias bancarias locales y pagos mediante billeteras digitales seguras." },
            { id: 5, icon: <Truck size={20} className="text-zinc-600" />, q: "¿Puedo cancelar mi pedido?", a: "Puedes solicitar la cancelación de tu pedido dentro de las primeras 12 horas posteriores a la compra, siempre y cuando el paquete no haya sido despachado por nuestro equipo de logística." }
        ],
        Envíos: [
            { id: 6, icon: <Truck size={20} className="text-zinc-600" />, q: "¿Cuánto tarda en llegar mi pedido?", a: "Los envíos estándar toman de 2 a 4 días hábiles dependiendo de tu zona geográfica." }
        ],
        Cuidados: [
            { id: 7, icon: <FileText size={20} className="text-zinc-600" />, q: "¿Cómo sé qué maceta es ideal para mi planta?", a: "En cada ficha de producto te indicamos el diámetro idóneo y si la maceta cuenta con agujero de drenaje óptimo para exteriores o interiores." }
        ],
        Compras: [
            { id: 8, icon: <CreditCard size={20} className="text-zinc-600" />, q: "¿Ofrecen facturación de crédito fiscal?", a: "Sí, puedes ingresar tus datos de registro tributario al momento de procesar tu pago para emitirte el documento legal correspondiente." }
        ]
    };

    const toggleAccordion = (id) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    return (
        <div className="w-full min-h-screen bg-page font-sans antialiased text-zinc-800">



            {/* ================= SECCIÓN PRINCIPAL: FAQS ================= */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center">

                {/* Título Principal */}
                <h1 className="text-[40px] font-bold text-zinc-900 tracking-tight text-center mb-2">
                    Preguntas Frecuentes
                </h1>

                {/* Subtítulo descriptivo */}
                <p className="text-sm text-zinc-500 text-center max-w-xl leading-relaxed mb-10 font-normal">
                    ¿Tienes alguna duda? Consulta nuestras preguntas frecuentes y encuentra respuestas rápidas sobre nuestros servicios.
                </p>

                {/* Botones de Categorías Ovaladas */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveTab(cat);
                                setOpenAccordion(faqData[cat][0]?.id || null);
                            }}
                            className={`px-6 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border tracking-wide
                ${activeTab === cat
                                    ? "bg-primary-700 text-white border-primary-700 shadow-xs"
                                    : "bg-surface text-zinc-700 border-zinc-300 hover:bg-zinc-50"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Contenedor de Acordeones */}
                <div className="w-full flex flex-col gap-4 mb-24">
                    {faqData[activeTab]?.map((item) => {
                        const isOpen = openAccordion === item.id;
                        return (
                            <div
                                key={item.id}
                                className="w-full bg-surface rounded-xl border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden transition-all duration-200"
                            >
                                {/* Encabezado del Acordeón */}
                                <button
                                    onClick={() => toggleAccordion(item.id)}
                                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-zinc-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Contenedor de Icono */}
                                        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                                            {item.icon}
                                        </div>
                                        <span className="text-base font-bold text-zinc-900 tracking-tight">
                                            {item.q}
                                        </span>
                                    </div>
                                    <div className="text-zinc-400 shrink-0">
                                        <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} />
                                    </div>
                                </button>

                                {/* Cuerpo de la Respuesta */}
                                <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden
                    ${isOpen ? "max-h-40 border-t border-zinc-50" : "max-h-0"}`}
                                >
                                    <p className="px-6 pb-6 pt-4 text-sm text-zinc-500 leading-relaxed pl-[64px] font-normal">
                                        {item.a}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ================= SECCIÓN CORREGIDA BANNER: ¿NECESITAS AYUDA? ================= */}
                <section className="w-full bg-[#eef1ee] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 border border-zinc-200/50 shadow-xs">
                    <div className="flex flex-col gap-2 max-w-sm text-left">
                        <h2 className="text-2xl font-bold text-primary-700 tracking-tight">¿Necesitas ayuda?</h2>
                        <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                            Tu confianza es nuestra prioridad. ¿No estás seguro de qué plantas funcionarán en tu hogar? ¿Nuevo en la jardinería o necesitas consejos? Contáctanos, estamos aquí para ayudarte.
                        </p>
                    </div>

                    {/* Contenedor agrupado y balanceado de las 3 tarjetas */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
                        <div className="flex flex-col items-center justify-center text-center bg-surface border border-zinc-200/60 rounded-xl px-5 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] w-full sm:w-[130px] min-h-[105px]">
                            <MessageSquare size={20} className="text-primary-700 mb-2" />
                            <span className="text-xs font-bold text-primary-700 mb-0.5">Chat</span>
                            <span className="text-[10px] text-zinc-400 font-normal leading-tight">Habla con un experto</span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center bg-surface border border-zinc-200/60 rounded-xl px-5 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] w-full sm:w-[130px] min-h-[105px]">
                            <Phone size={20} className="text-primary-700 mb-2" />
                            <span className="text-xs font-bold text-primary-700 mb-0.5">Llamada</span>
                            <span className="text-[10px] text-zinc-400 font-normal leading-tight">Llama a un especialista</span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center bg-surface border border-zinc-200/60 rounded-xl px-5 py-4 shadow-[0_2px_6px_rgba(0,0,0,0.02)] w-full sm:w-[130px] min-h-[105px]">
                            <Mail size={20} className="text-primary-700 mb-2" />
                            <span className="text-xs font-bold text-primary-700 mb-0.5">Email</span>
                            <span className="text-[10px] text-zinc-400 font-normal leading-tight">Envíanos un mensaje</span>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />


        </div>
    );
}
