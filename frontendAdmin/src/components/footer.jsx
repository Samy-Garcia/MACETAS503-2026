import logoMacetas from "../assets/logoMacetas.png";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-[#e9ebe9] border-t border-zinc-200/80 pt-16 pb-6 text-zinc-700 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-16">

        {/* Servicio al Cliente */}
        <div>
          <h4 className="font-bold text-[#064225] uppercase tracking-wider mb-5">
            Servicio al Cliente
          </h4>

          <ul className="flex flex-col gap-3 text-zinc-600 font-medium">
            <li>
              <Link
                to="/preguntas-frecuentes"
                className="hover:underline hover:text-[#064225]"
              >
                Preguntas Frecuentes
              </Link>
            </li>

            <li>
              <Link
                to="/contacto"
                className="hover:underline hover:text-[#064225]"
              >
                Contáctanos
              </Link>
            </li>

            <li>
              <Link
                to="/reembolsos"
                className="hover:underline hover:text-[#064225]"
              >
                Reembolsos
              </Link>
            </li>

            <li>
              <Link
                to="/politicas-envio"
                className="hover:underline hover:text-[#064225]"
              >
                Políticas de Envío
              </Link>
            </li>
          </ul>
        </div>

        {/* Información */}
        <div>
          <h4 className="font-bold text-[#064225] uppercase tracking-wider mb-5">
            Información
          </h4>

          <ul className="flex flex-col gap-3 text-zinc-600 font-medium">
            <li>
              <Link
                to="/mi-cuenta"
                className="hover:underline hover:text-[#064225]"
              >
                Mi Cuenta
              </Link>
            </li>

            <li>
              <Link
                to="/tiendas"
                className="hover:underline hover:text-[#064225]"
              >
                Tiendas
              </Link>
            </li>

            <li>
              <Link
                to="/sobre-nosotros"
                className="hover:underline hover:text-[#064225]"
              >
                Sobre Nosotros
              </Link>
            </li>
          </ul>
        </div>

        {/* Mi Cuenta */}
        <div>
          <h4 className="font-bold text-[#064225] uppercase tracking-wider mb-5">
            Mi Cuenta
          </h4>

          <ul className="flex flex-col gap-3 text-zinc-600 font-medium">
            <li>
              <Link
                to="/mis-pedidos"
                className="hover:underline hover:text-[#064225]"
              >
                Ver Pedidos
              </Link>
            </li>

            <li>
              <Link
                to="/cupones"
                className="hover:underline hover:text-[#064225]"
              >
                Cupones de Descuento
              </Link>
            </li>

            <li>
              <Link
                to="/preguntas-clientes"
                className="hover:underline hover:text-[#064225]"
              >
                Preguntas de Clientes
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-[#064225] text-sm tracking-tight">
            Mantente al Tanto
          </h4>

          <p className="text-zinc-600 leading-relaxed font-normal">
            Recibe un cupón de descuento en tu primera compra y entérate de
            lanzamientos y promociones especiales.
          </p>

          <div className="flex flex-col gap-2 mt-2">
            <input
              type="email"
              placeholder="Ingresa tu correo"
              className="w-full h-11 px-4 rounded-md bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#064225] focus:border-[#064225] transition-all"
            />

            <button className="w-full h-11 rounded-md bg-[#064225] text-white font-semibold hover:bg-[#032d18] transition-colors cursor-pointer shadow-sm tracking-wide">
              Suscribirse
            </button>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-300/70 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <img
          src={logoMacetas}
          alt="Macetas Mini"
          className="h-8 object-contain opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
        />

        <p className="text-zinc-500 text-[11px] font-normal">
          &copy; 2026 Macetas S.A. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}