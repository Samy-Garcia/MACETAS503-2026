import { useState, useEffect } from "react";
import logoMacetas from "../assets/logoMacetas.png";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { subscribeToNewsletter } from "../api/newsletterApi";
import { getConfig } from "../api/configApi";
import { useTheme } from "../context/ThemeContext.jsx";

// lucide-react no trae íconos de Instagram/Facebook/TikTok (son logos de
// marca, no íconos genéricos de interfaz -- de hecho Facebook ni siquiera
// existe ya en esta versión de la librería), así que los 3 se dibujan a
// mano con el mismo tamaño/estilo.
const IconoInstagram = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconoFacebook = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
  </svg>
);

const IconoTikTok = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/>
  </svg>
);

export default function Footer() {
  const { logoUrl } = useTheme();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [socialMedia, setSocialMedia] = useState(null);

  useEffect(() => {
    const cargarRedesSociales = async () => {
      try {
        const config = await getConfig();
        setSocialMedia(config?.socialMedia || null);
      } catch (err) {
        // Silencioso: si falla, simplemente no se muestran los íconos
      }
    };
    cargarRedesSociales();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }

    setSubmitting(true);
    try {
      const data = await subscribeToNewsletter(email.trim());
      toast.success(data.message);
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'No se pudo completar la suscripción');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-[#e9ebe9] border-t border-zinc-200/80 pt-16 pb-6 text-zinc-700 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-16">

        {/* Servicio al Cliente */}
        <div>
          <h4 className="font-bold text-primary-700 uppercase tracking-wider mb-5">
            Servicio al Cliente
          </h4>

          <ul className="flex flex-col gap-3 text-zinc-600 font-medium">
            <li>
              <Link
                to="/preguntas-frecuentes"
                className="hover:underline hover:text-primary-700"
              >
                Preguntas Frecuentes
              </Link>
            </li>

            <li>
              <Link
                to="/contacto"
                className="hover:underline hover:text-primary-700"
              >
                Contáctanos
              </Link>
            </li>

            <li>
              <Link
                to="/preguntas-frecuentes"
                className="hover:underline hover:text-primary-700"
              >
                Reembolsos
              </Link>
            </li>

            <li>
              <Link
                to="/preguntas-frecuentes"
                className="hover:underline hover:text-primary-700"
              >
                Políticas de Envío
              </Link>
            </li>
          </ul>
        </div>

        {/* Información */}
        <div>
          <h4 className="font-bold text-primary-700 uppercase tracking-wider mb-5">
            Información
          </h4>

          <ul className="flex flex-col gap-3 text-zinc-600 font-medium">
            <li>
              <Link
                to="/perfil"
                className="hover:underline hover:text-primary-700"
              >
                Mi Cuenta
              </Link>
            </li>

            <li>
              <Link
                to="/nosotros"
                className="hover:underline hover:text-primary-700"
              >
                Sobre Nosotros
              </Link>
            </li>

            <li>
              <Link
                to="/terminos-y-condiciones"
                className="hover:underline hover:text-primary-700"
              >
                Términos y Condiciones
              </Link>
            </li>


          </ul>
        </div>

        {/* Mi Cuenta */}
        <div>
          <h4 className="font-bold text-primary-700 uppercase tracking-wider mb-5">
            Mi Cuenta
          </h4>

          <ul className="flex flex-col gap-3 text-zinc-600 font-medium">
            <li>
              <Link
                to="/pedidos"
                className="hover:underline hover:text-primary-700"
              >
                Ver Pedidos
              </Link>
            </li>

            <li>
              <Link
                to="/cupones"
                className="hover:underline hover:text-primary-700"
              >
                Cupones de Descuento
              </Link>
            </li>

            <li>
              <Link
                to="/resenas"
                className="hover:underline hover:text-primary-700"
              >
                Mis Reseñas
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-primary-700 text-sm tracking-tight">
            Mantente al Tanto
          </h4>

          <p className="text-zinc-600 leading-relaxed font-normal">
            Entérate de lanzamientos y promociones especiales antes que nadie.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              className="w-full h-11 px-4 rounded-md bg-surface border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:border-primary-700 transition-all"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-md bg-primary-700 text-white font-semibold hover:bg-primary-800 transition-colors cursor-pointer shadow-sm tracking-wide disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Suscribirse'}
            </button>
          </form>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-300/70 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <img
            src={logoUrl || logoMacetas}
            alt="Macetas Mini"
            className="h-8 object-contain opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
          />

          {/* Íconos de redes sociales -- solo se muestran los que el admin
              configuró con una URL; si no hay ninguno, esta sección
              desaparece por completo en vez de mostrarse vacía. */}
          {socialMedia && (socialMedia.instagram || socialMedia.facebook || socialMedia.tiktok) && (
            <div className="flex items-center gap-4">
              {socialMedia.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-zinc-400 hover:text-[#E4405F] transition-colors"
                >
                  <IconoInstagram size={18} />
                </a>
              )}
              {socialMedia.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-zinc-400 hover:text-[#1877F2] transition-colors"
                >
                  <IconoFacebook size={18} />
                </a>
              )}
              {socialMedia.tiktok && (
                <a
                  href={socialMedia.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="text-zinc-400 hover:text-black transition-colors"
                >
                  <IconoTikTok size={18} />
                </a>
              )}
            </div>
          )}
        </div>

        <p className="text-zinc-500 text-[11px] font-normal">
          &copy; 2026 Macetas S.A. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
