import React from 'react';
import Sidebar from '../components/Sidebar';
import { useReportsData } from '../hooks/useReportsData';
import { useChart } from '../hooks/useChart';
import usePageTitle from '../hooks/usePageTitle';

/* ─────────────────────────────────────────────────────────────
   Estilos locales (misma serif y animaciones del resto del panel)
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

  @keyframes m503-fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: none; }
  }
  .m503-fade-up { animation: m503-fade-up .55s cubic-bezier(.22,1,.36,1) both; }

  .m503-scroll { scrollbar-width: thin; scrollbar-color: #D3E6DA transparent; }
  .m503-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .m503-scroll::-webkit-scrollbar-thumb { background: #D3E6DA; border-radius: 9999px; }
  .m503-scroll::-webkit-scrollbar-track { background: transparent; }

  @media (prefers-reduced-motion: reduce) {
    .m503-fade-up { animation: none; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Íconos (aceptan className)
   ───────────────────────────────────────────────────────────── */
const TrendingUpIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
  </svg>
);

const ChevronDownIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const AlertIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Piezas visuales
   ───────────────────────────────────────────────────────────── */
const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]';

// Paleta de gráficos: verdes del panel con un toque ámbar y arena
const CHART_COLORS = ['#1E3B2F', '#4F8A6B', '#8DBFA3', '#E7B95A', '#B9D6C3', '#E3CFA5'];

const Tooltip = ({ children }) => (
  <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1E3B2F] text-white text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap pointer-events-none z-10">
    {children}
  </div>
);

const CardHeader = ({ title, children }) => (
  <div className="px-4 sm:px-6 py-4 border-b border-[#EEF4F0] bg-[#F5FAF7]/60">
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <h3 className="text-sm font-bold text-[#1E3B2F]">{title}</h3>
      {children}
    </div>
  </div>
);

const ReportsPage = ({ onLogout }) => {
  usePageTitle();

  const {
    stats,
    ventasPorCategoria,
    totalVentasCategoria,
    datosGrafico,
    productoMasVendido,
    totalVentas,
    patronesPorHora,
    periodo,
    setPeriodo,
    loading,
    error
  } = useReportsData();

  const { datosConAltura } = useChart(datosGrafico, 'value', 'label');
  const { datosConAltura: patronesConAltura } = useChart(patronesPorHora, 'value', 'label');

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
      <style>{STYLES}</style>
      <Sidebar onLogout={onLogout} />

      <div className="flex-1 overflow-auto m503-scroll p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">
        {/* Header */}
        <div className="mb-6 m503-fade-up">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
            <span className="relative flex w-2 h-2">
              {loading && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#8DBFA3] opacity-75 animate-ping" />
              )}
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[#4F8A6B]" />
            </span>
            {loading ? 'Actualizando...' : 'Actualizado'}
          </span>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Reportes y</span>
            <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">análisis</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">Visualiza el rendimiento de tu negocio</p>
          <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-5"></div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 p-3 bg-[#FFF7F7] text-[#8A3B3B] rounded-2xl border border-[#F2C9C9] text-sm">
            <AlertIcon className="w-4 h-4 shrink-0 mt-0.5 text-[#C65F5F]" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`m503-fade-up ${cardClass} p-4 sm:p-5`}
              style={{ animationDelay: `${0.04 + index * 0.04}s` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl sm:text-3xl font-black text-[#1E3B2F] leading-none truncate">{stat.value}</p>
                </div>
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0 text-xs font-semibold ${
                    stat.trend === 'up' ? 'bg-[#E6F2EA] text-[#2F6B4D]' : 'bg-[#FDF3F3] text-[#A94A4A]'
                  }`}
                >
                  {stat.trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                  {stat.percentage}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">{stat.period}</p>
            </div>
          ))}
        </div>

        {/* Resumen De Ventas y Producto Más Vendido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
          {/* Resumen De Ventas - Gráfico de Barras */}
          <div className={`m503-fade-up ${cardClass} overflow-hidden`} style={{ animationDelay: '.2s' }}>
            <CardHeader title="Resumen de ventas">
              <div className="relative">
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="appearance-none text-xs font-semibold text-[#1E3B2F] rounded-full pl-3.5 pr-8 py-1.5 border-2 border-transparent bg-[#F2F6F3] hover:bg-[#ECF3EE] focus:bg-white focus:border-[#8DBFA3] focus:ring-4 focus:ring-[#8DBFA3]/20 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Mes">Mes</option>
                  <option value="Semana">Semana</option>
                  <option value="Año">Año</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4F8A6B]">
                  <ChevronDownIcon />
                </span>
              </div>
            </CardHeader>
            <div className="p-4 sm:p-6">
              <div className="text-center mb-6">
                <p className="text-3xl sm:text-4xl font-black text-[#1E3B2F] leading-none">${totalVentas}</p>
                <p className="mt-1 text-xs text-gray-500">Total en ventas</p>
              </div>
              <div className="h-44 sm:h-56 flex items-end justify-between gap-1 sm:gap-2">
                {datosConAltura.map((item, index) => {
                  const color = CHART_COLORS[index % CHART_COLORS.length];

                  return (
                    <div
                      key={index}
                      className="flex-1 rounded-t-xl transition-all duration-500 hover:opacity-80 relative group"
                      style={{
                        height: `${item.altura}%`,
                        minHeight: '20px',
                        background: `linear-gradient(180deg, ${color} 0%, ${color}CC 100%)`
                      }}
                    >
                      <Tooltip>${item.value}</Tooltip>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-start justify-between gap-1 sm:gap-2 mt-2">
                {datosConAltura.map((item, index) => (
                  <span key={index} className="flex-1 text-center text-[9px] sm:text-[10px] font-medium text-gray-500">
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Producto Más Vendido */}
          <div className={`m503-fade-up ${cardClass} overflow-hidden`} style={{ animationDelay: '.24s' }}>
            <CardHeader title="Producto más vendido">
              <span className="text-xs font-medium text-[#4F8A6B] bg-[#E6F2EA] px-3 py-1 rounded-full truncate max-w-[160px]">
                {productoMasVendido.nombre}
              </span>
            </CardHeader>
            <div className="p-4 sm:p-6">
              {productoMasVendido.datos.length > 0 ? (
                <div className="space-y-4">
                  {productoMasVendido.datos.map((item, index) => {
                    const color = CHART_COLORS[index % CHART_COLORS.length];
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between text-sm gap-2">
                          <span className="font-semibold text-gray-900 truncate">{item.valor}</span>
                          <span className="text-xs text-gray-400 shrink-0">{item.dia}</span>
                        </div>
                        <div className="mt-1.5 h-2 bg-[#EEF4F0] rounded-full overflow-hidden">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${item.porcentaje}%`,
                              background: `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center m503-serif text-xl text-gray-500 py-8">
                  Todavía no hay ventas en este periodo
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ventas Por Categoría y Patrones De Venta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Ventas Por Categoría - Gráfico Circular */}
          <div className={`m503-fade-up ${cardClass} overflow-hidden`} style={{ animationDelay: '.28s' }}>
            <CardHeader title="Ventas por categoría" />
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-36 h-36 sm:w-48 sm:h-48">
                  <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full border-8 sm:border-[10px] border-[#1E3B2F] flex items-center justify-center bg-white shadow-[inset_0_8px_24px_-12px_rgba(30,59,47,0.25)]">
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-black text-[#1E3B2F]">{totalVentasCategoria}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ventasPorCategoria.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#F2F6F3] min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    ></div>
                    <span className="text-xs font-medium text-gray-800 truncate">{item.name}</span>
                    <span className="text-xs font-semibold text-[#4F8A6B] ml-auto shrink-0">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Patrones De Venta Por Hora */}
          <div className={`m503-fade-up ${cardClass} overflow-hidden`} style={{ animationDelay: '.32s' }}>
            <CardHeader title="Patrones de venta por hora" />
            <div className="p-4 sm:p-6">
              <div className="overflow-x-auto m503-scroll">
                <div className="min-w-[420px] sm:min-w-0">
                  <div className="h-40 sm:h-48 flex items-end justify-between gap-1.5">
                    {patronesConAltura.map((item, index) => {
                      const color = CHART_COLORS[index % CHART_COLORS.length];
                      return (
                        <div
                          key={index}
                          className="flex-1 rounded-t-xl transition-all duration-500 hover:opacity-80 relative group"
                          style={{
                            height: `${Math.max(item.altura * 0.7, item.value > 0 ? 8 : 2)}%`,
                            minHeight: '4px',
                            background: `linear-gradient(180deg, ${color} 0%, ${color}66 100%)`
                          }}
                        >
                          <Tooltip>${item.value}</Tooltip>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-start justify-between gap-1.5 mt-1.5">
                    {patronesConAltura.map((item, index) => (
                      <span key={index} className="flex-1 text-center text-[8px] font-medium text-gray-500">
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4F8A6B]"></div>
                  <span className="text-[10px] text-gray-500">Ventas por bloque de 2 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;