import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import fotoPerfil from '../assets/Logo.png';

/* ─────────────────────────────────────────────────────────────
   Estilos locales: misma serif itálica y grano que las
   pantallas de acceso (no requieren tocar tailwind.config)
   ───────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

  .m503-serif {
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: none;
  }

  .m503-grain::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: .09;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  }

  .m503-nav-scroll { scrollbar-width: thin; scrollbar-color: #D3E6DA transparent; }
  .m503-nav-scroll::-webkit-scrollbar { width: 6px; }
  .m503-nav-scroll::-webkit-scrollbar-thumb { background: #D3E6DA; border-radius: 9999px; }
  .m503-nav-scroll::-webkit-scrollbar-track { background: transparent; }
`;

/* ─────────────────────────────────────────────────────────────
   Íconos (ahora aceptan className para poder cambiar su tamaño)
   ───────────────────────────────────────────────────────────── */
const HomeIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ShoppingBagIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const Flower2Icon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L4 6l8 4 8-4-8-4z M12 10v8 M4 14l8 4 8-4 M4 18l8 4 8-4" />
  </svg>
);

const CandleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v6m0 0l-2-2m2 2l2-2m-2 10v6m-6-6h12M6 10h12" />
  </svg>
);

const OtherIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ComboIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12V8H6a2 2 0 010-4h12v4M4 6v14a2 2 0 002 2h14v-4M6 6h14M6 18h14" />
  </svg>
);

const QuotationIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m-6 4h4M5 3h14a2 2 0 012 2v14l-4-3-3 3-3-3-3 3-4-3V5a2 2 0 012-2z" />
  </svg>
);

const SproutIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9v6a2 2 0 002 2h10a2 2 0 002-2V9m-7 8v-4" />
  </svg>
);

const DropletIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
  </svg>
);

const PackageIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const BarChartIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ShieldCheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
  </svg>
);

const SettingsIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogOutIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const TagIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const StarIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const GiftIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12v10H4V12M2 7h20v5H2V7zm10 15V7m0 0a2.5 2.5 0 015 0c0 1.5-2.5 3-5 3zm0 0a2.5 2.5 0 10-5 0c0 1.5 2.5 3 5 3z" />
  </svg>
);

const MessageStarIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
);

const MailIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PackageCheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.27 6.96L12 12l8.73-5.04M12 22.08V12" />
  </svg>
);

const MenuIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const XIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FloraIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const LeafIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

/* Clases compartidas por los ítems del menú */
const itemClass = (active) =>
  `w-full flex items-center px-3 py-1.5 rounded-2xl text-sm transition-all duration-300 ${
    active
      ? 'bg-[#E6F2EA] text-[#1E3B2F] shadow-[0_10px_24px_-16px_rgba(30,59,47,0.6)]'
      : 'text-gray-700 hover:bg-[#F2F6F3] hover:text-[#1E3B2F]'
  }`;

const iconCircleClass = (active) =>
  `w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
    active
      ? 'bg-[#1E3B2F] text-white shadow-[0_6px_14px_-6px_rgba(30,59,47,0.7)]'
      : 'bg-[#F2F6F3] text-[#4F8A6B] group-hover:bg-white'
  }`;

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navRef = React.useRef(null);

  // Restaura la posición de scroll del sidebar al montar/re-renderizar
  React.useEffect(() => {
    const savedScroll = sessionStorage.getItem('sidebarScrollPos');
    if (navRef.current && savedScroll !== null) {
      navRef.current.scrollTop = Number(savedScroll);
    }
  }, []);

  // Guarda la posición de scroll cada vez que el usuario scrollea el sidebar
  const handleNavScroll = (e) => {
    sessionStorage.setItem('sidebarScrollPos', e.target.scrollTop);
  };

  const menuItems = [
    { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
    { 
      icon: ShoppingBagIcon, 
      label: 'Órdenes', 
      path: '/ordenes',
      submenu: [
        { label: 'Órdenes Personalizadas', path: '/ordenespersonalizadas' }
      ]
    },
    { icon: MessageStarIcon, label: 'Reseñas', path: '/resenas' },
    { icon: MailIcon, label: 'Suscriptores', path: '/suscriptores' },
    { icon: Flower2Icon, label: 'Macetas', path: '/macetas' },
    { icon: CandleIcon, label: 'Velas', path: '/velas' },
    { icon: OtherIcon, label: 'Otros', path: '/otros' },
    { icon: ComboIcon, label: 'Combos', path: '/combos' },
    { icon: QuotationIcon, label: 'Cotizaciones', path: '/cotizaciones' },
    { icon: SproutIcon, label: 'Plantas', path: '/plantas' },
    { icon: DropletIcon, label: 'Cuidado de Plantas', path: '/cuidado-plantas' },
    { icon: TagIcon, label: 'Ofertas', path: '/ofertas' },
    { icon: GiftIcon, label: 'Recompensas', path: '/recompensas' },
    { icon: PackageCheckIcon, label: 'Canjes de Productos', path: '/canjes' },
    { icon: StarIcon, label: 'Formas de Ganar', path: '/formas-de-ganar' },
    { icon: PackageIcon, label: 'Inventario', path: '/inventario' },
    { icon: BarChartIcon, label: 'Reportes', path: '/reportes' },
    { icon: FloraIcon, label: 'FLORA IA', path: '/flora' },
    { icon: ShieldCheckIcon, label: 'Administradores', path: '/administradores' },
    { icon: SettingsIcon, label: 'Ajustes', path: '/ajustes' },
  ];

  const handleNavigation = (path) => {
    if (path === '/ordenes') {
      setOpenSubmenu(!openSubmenu);
      navigate(path);
    } else {
      setOpenSubmenu(false);
      navigate(path);
      setIsMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      await logout();
    }
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* Botón hamburguesa flotante - solo móvil/tablet */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-[0_12px_28px_-12px_rgba(30,59,47,0.5)] flex items-center justify-center text-[#1E3B2F]"
        aria-label="Abrir menú"
      >
        <MenuIcon />
      </button>

      {/* Overlay detrás del drawer - solo móvil/tablet */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-[#1E3B2F]/40 backdrop-blur-sm z-40"
        />
      )}

      <div
        className={`
          w-72 bg-white/80 backdrop-blur-xl flex flex-col rounded-[1.75rem] border border-white
          shadow-[0_30px_70px_-35px_rgba(30,59,47,0.5)]
          fixed top-4 bottom-4 left-4 z-50 transition-transform duration-300
          lg:static lg:ml-4 lg:h-[calc(100vh-2.5rem)] lg:my-auto lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)]'}
        `}
      >
        {/* Header */}
        <div className="m503-grain relative overflow-hidden m-2 mb-0 p-4 rounded-[1.4rem] bg-gradient-to-br from-[#D5E9DD] via-[#E8F2EC] to-[#F5EFE3] flex-shrink-0">
          <div className="pointer-events-none absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[#B7D8C5] blur-2xl opacity-70" />
          <div className="pointer-events-none absolute -bottom-12 -right-8 w-32 h-32 rounded-full bg-[#F1E4C8] blur-2xl opacity-80" />
          <LeafIcon className="pointer-events-none absolute -right-2 top-2 w-14 h-14 text-[#4F8A6B]/15 rotate-12" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 shrink-0">
                <div className="absolute -inset-1 rounded-full border border-dashed border-[#4F8A6B]/35" />
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white ring-2 ring-white shadow-[0_10px_22px_-10px_rgba(30,59,47,0.6)]">
                  <img src={fotoPerfil} alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="leading-none">
                <h1 className="flex items-baseline gap-0.5 text-gray-900">
                  <span className="text-lg font-black tracking-tight">Macetas</span>
                  <span className="m503-serif text-2xl text-[#4F8A6B]">503</span>
                </h1>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                  Panel de control
                </p>
              </div>
            </div>
            {/* Botón cerrar - solo móvil/tablet */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-[#1E3B2F] bg-white/60 hover:bg-white transition-colors"
              aria-label="Cerrar menú"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navegación - con scroll si no cabe */}
        <nav
          ref={navRef}
          onScroll={handleNavScroll}
          className="m503-nav-scroll flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto"
        >
          <div className="px-3 py-1.5 mb-1">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              <LeafIcon className="w-3 h-3 text-[#4F8A6B]" />
              Navegación
            </p>
            <div className="h-px bg-gradient-to-r from-[#8DBFA3]/60 via-[#E3CFA5]/60 to-transparent mt-2"></div>
          </div>

          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuActive = hasSubmenu && item.submenu.some(sub => location.pathname === sub.path);

            if (hasSubmenu) {
              const highlighted = isActive || isSubmenuActive || openSubmenu;
              return (
                <div key={index} className="space-y-0.5">
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`group justify-between ${itemClass(highlighted)}`}
                  >
                    <div className="flex items-center">
                      <div className={iconCircleClass(highlighted)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`ml-3 text-sm ${highlighted ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                    </div>
                    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${openSubmenu ? 'rotate-180' : ''} text-[#4F8A6B]/70`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openSubmenu && (
                    <div className="ml-7 space-y-0.5 border-l border-dashed border-[#8DBFA3]/60 pl-3 py-0.5">
                      {item.submenu.map((sub, subIndex) => {
                        const subActive = location.pathname === sub.path;
                        return (
                          <button
                            key={subIndex}
                            onClick={() => {
                              setOpenSubmenu(true);
                              navigate(sub.path);
                              setIsMobileOpen(false);
                            }}
                            className={`w-full flex items-center px-3 py-1.5 rounded-xl text-xs transition-all duration-300 ${
                              subActive
                                ? 'bg-[#E6F2EA] text-[#1E3B2F] font-semibold'
                                : 'text-gray-600 font-medium hover:bg-[#F2F6F3] hover:text-[#1E3B2F]'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${subActive ? 'bg-[#4F8A6B]' : 'bg-[#D3E6DA]'}`} />
                            <span className="ml-2">{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className={`group ${itemClass(isActive)}`}
              >
                <div className={iconCircleClass(isActive)}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`ml-3 text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4F8A6B] ring-4 ring-[#4F8A6B]/15"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer - Cerrar Sesión y Versión DENTRO del menú */}
        <div className="m503-grain relative overflow-hidden m-2 mt-0 p-2.5 rounded-[1.4rem] bg-gradient-to-br from-[#F5EFE3] via-[#E8F2EC] to-[#D5E9DD] flex-shrink-0">
          <div className="relative z-10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 rounded-2xl text-sm font-medium text-gray-800 bg-white/70 backdrop-blur-sm border border-white shadow-[0_10px_24px_-16px_rgba(30,59,47,0.6)] hover:bg-white transition-all duration-300 group"
            >
              {/* Al pasar el mouse se pone en rojo suave: es una acción de salida */}
              <div className="w-8 h-8 rounded-full bg-[#F2F6F3] text-[#4F8A6B] flex items-center justify-center group-hover:bg-[#E08A8A] group-hover:text-white transition-all duration-300">
                <LogOutIcon className="w-4 h-4" />
              </div>
              <span className="ml-3 font-medium group-hover:text-[#C65F5F] transition-colors">Cerrar Sesión</span>
              <span className="ml-auto text-xs text-gray-400 group-hover:text-[#C65F5F] transition-colors">⌘</span>
            </button>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[#8DBFA3]"></span>
              <p className="text-[9px] font-medium text-gray-500 tracking-[0.2em]">v2.0.1 • Macetas503</p>
              <span className="w-1 h-1 rounded-full bg-[#E3CFA5]"></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;