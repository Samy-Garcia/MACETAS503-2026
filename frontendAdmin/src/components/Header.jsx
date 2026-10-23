import { Link, useLocation, useNavigate } from "react-router";
import logo from "../assets/logo-monstera.png";
import { NAV_LINKS } from "../utils/constants.js";
import { SearchIcon, HeartIcon, UserIcon, BagIcon, ArrowLeftIcon } from "./Icons.jsx";

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === "/";

  return (
    <header>
      {/* Aqui esta la Barra de envío gratis*/}
      <div className="bg-gradient-to-r from-primary-900 via-primary-600 to-primary-900 text-white text-center text-sm py-2">
        Envío gratis a compras mayores de 19.99$
      </div>

      {/*Aqui se pueden vericonos, logo y menú de navegación */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Flecha de regreso: solo se muestra fuera del Home */}
            {!isHome && (
              <button
                onClick={() => navigate(-1)}
                aria-label="Regresar"
                className="text-gray-700 hover:text-primary-700 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <SearchIcon className="w-5 h-5 text-gray-700" />
          </div>

          <Link to="/" className="flex items-center">
            <img src={logo} alt="Macetas503" className="w-9 h-9" />
          </Link>

          <div className="flex items-center gap-4">
            <HeartIcon className="w-5 h-5 text-gray-700 cursor-pointer" />
            <UserIcon className="w-5 h-5 text-gray-700 cursor-pointer" />
            <BagIcon className="w-5 h-5 text-gray-700 cursor-pointer" />
          </div>
        </div>

        <nav className="max-w-7xl mx-auto px-6 pb-3">
          <ul className="flex flex-wrap justify-center gap-6 text-sm font-medium text-primary-700">
            {NAV_LINKS.map((link) =>
              link.to ? (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-primary-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ) : (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-primary-500 transition-colors">
                    {link.label}
                  </a>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
