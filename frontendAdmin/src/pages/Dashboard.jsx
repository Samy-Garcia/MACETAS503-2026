import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useDashboardData } from '../hooks/useDashboardData';
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

  @media (prefers-reduced-motion: reduce) {
    .m503-fade-up { animation: none; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Íconos (ahora aceptan className para tamaño y color)
   ───────────────────────────────────────────────────────────── */
const TrendingUpIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const ChevronDownIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CalendarIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const PackageIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const BagIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);

const LeafIcon = ({ className = 'w-4 h-4' }) => (
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

/* ─────────────────────────────────────────────────────────────
   Paleta y piezas visuales
   ───────────────────────────────────────────────────────────── */

// Una sola paleta para leyenda, dona y barras (antes eran dos
// listas distintas y los colores no coincidían entre gráficos)
const CATEGORY_COLORS = ['#1E3B2F', '#4F8A6B', '#8DBFA3', '#E3CFA5', '#C9DDD0', '#B9A27A'];
const colorAt = (i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length];

const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)] hover:shadow-[0_26px_55px_-28px_rgba(30,59,47,0.5)] transition-shadow';

// Título de sección: parte en mayúsculas + palabra en serif itálica
const SectionTitle = ({ upper, serif }) => (
  <h3 className="flex items-baseline gap-2 text-gray-900">
    <span className="text-xs font-bold uppercase tracking-[0.18em]">{upper}</span>
    <span className="m503-serif text-2xl text-[#4F8A6B] leading-none">{serif}</span>
  </h3>
);

const ComparisonBadge = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#E6F2EA] rounded-full text-xs text-[#4F8A6B] font-medium">
    <span className="w-1.5 h-1.5 rounded-full bg-[#4F8A6B]"></span>
    {children}
  </span>
);

const StatCard = ({ label, value, icon: Icon, tint, iconColor, blob, delay, children }) => (
  <div className={`m503-fade-up relative overflow-hidden ${cardClass} p-5 sm:p-6`} style={{ animationDelay: delay }}>
    {/* Mancha suave en la esquina */}
    <div className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-70" style={{ background: blob }} />
    <div className="relative flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.18em]">{label}</p>
        <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 truncate">{value}</p>
      </div>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: tint, color: iconColor }}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="relative mt-4 flex items-center gap-2 flex-wrap">{children}</div>
  </div>
);

const toNumber = (v) => {
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

// Dona real a partir de los porcentajes que ya trae ventasCategoria
const CategoryDonut = ({ detalle = [], total }) => {
  let acc = 0;
  const stops = detalle.map((item, i) => {
    const start = acc;
    acc = Math.min(100, acc + toNumber(item.percentage));
    return `${colorAt(i)} ${start}% ${acc}%`;
  });
  if (acc < 100) stops.push(`#EEF4F0 ${acc}% 100%`);
  const background = stops.length ? `conic-gradient(${stops.join(', ')})` : '#EEF4F0';

  return (
    <div className="relative w-40 h-40 sm:w-48 sm:h-48">
      <div className="absolute -inset-3 rounded-full border border-dashed border-[#4F8A6B]/25" />
      <div className="w-full h-full rounded-full shadow-[0_18px_40px_-20px_rgba(30,59,47,0.5)]" style={{ background }} />
      <div className="absolute inset-[18px] sm:inset-[22px] rounded-full bg-white flex items-center justify-center shadow-inner">
        <div className="text-center">
          <p className="text-2xl sm:text-3xl font-black text-gray-900">{total || 0}</p>
          <p className="m503-serif text-base text-[#4F8A6B] -mt-0.5">total ventas</p>
        </div>
      </div>
    </div>
  );
};

const StatusPill = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#E6F2EA] text-[#1E3B2F] whitespace-nowrap">
    <span className="w-1.5 h-1.5 rounded-full bg-[#4F8A6B]" />
    {children}
  </span>
);

const thClass = 'px-4 sm:px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] whitespace-nowrap';

const DataTable = ({ title, serif, rows, loading, emptyText, dateLabel, amountLabel, delay }) => (
  <div className={`m503-fade-up ${cardClass} overflow-hidden`} style={{ animationDelay: delay }}>
    <div className="px-4 sm:px-6 py-5 border-b border-[#EEF4F0]">
      <SectionTitle upper={title} serif={serif} />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F5FAF7]">
            <th className={thClass}>#</th>
            <th className={thClass}>Producto</th>
            <th className={thClass}>{dateLabel}</th>
            <th className={thClass}>Estatus</th>
            <th className={thClass}>{amountLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF4F0]">
          {loading ? (
            <tr>
              <td colSpan="5" className="px-6 py-10 text-center text-gray-400">Cargando...</td>
            </tr>
          ) : rows?.length > 0 ? (
            rows.map((item, index) => (
              <tr key={item.id} className="hover:bg-[#F5FAF7] transition-colors">
                <td className="px-4 sm:px-6 py-3.5">
                  <span className="w-7 h-7 rounded-full bg-[#F2F6F3] text-[#4F8A6B] text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">{item.product}</td>
                <td className="px-4 sm:px-6 py-3.5 text-sm text-gray-500 whitespace-nowrap">{item.fecha}</td>
                <td className="px-4 sm:px-6 py-3.5">
                  <StatusPill>{item.estatus}</StatusPill>
                </td>
                <td className="px-4 sm:px-6 py-3.5 text-sm font-bold text-[#1E3B2F] whitespace-nowrap">${item.precio}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-10 text-center">
                <LeafIcon className="w-6 h-6 mx-auto text-[#8DBFA3]" />
                <p className="mt-2 m503-serif text-lg text-gray-500">{emptyText}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Dashboard
   ───────────────────────────────────────────────────────────── */
const Dashboard = ({ onLogout }) => {
  usePageTitle(); 

  const {
    topProducts,
    recentOrders,
    stats,
    ventasCategoria,
    timeRange,
    setTimeRange,
    rangeOptions,
    loading,
    error
  } = useDashboardData();

  const [rangeMenuOpen, setRangeMenuOpen] = useState(false);
  const rangeMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rangeMenuRef.current && !rangeMenuRef.current.contains(event.target)) {
        setRangeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRange = (option) => {
    setTimeRange(option);
    setRangeMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
      <style>{STYLES}</style>
      <Sidebar onLogout={onLogout} />

      <div className="flex-1 overflow-auto">
        <div className="p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">
          {/* Encabezado Principal */}
          <div className="mb-8 m503-fade-up">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
                  <LeafIcon className="w-3 h-3" />
                  Resumen
                </span>
                <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
                  <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Panel de</span>
                  <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">control</span>
                </h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <p className="text-gray-500 text-sm sm:text-base">Bienvenido de nuevo a Macetas503 </p>
                  {loading && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4F8A6B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4F8A6B] animate-pulse" />
                      Actualizando datos...
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative" ref={rangeMenuRef}>
                  <button
                    onClick={() => setRangeMenuOpen(prev => !prev)}
                    className="flex items-center gap-2 pl-2 pr-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white shadow-[0_12px_28px_-18px_rgba(30,59,47,0.6)] hover:bg-white transition-all text-sm text-gray-800"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#E6F2EA] text-[#4F8A6B] flex items-center justify-center">
                      <CalendarIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-medium">{timeRange}</span>
                    <ChevronDownIcon className={`w-4 h-4 text-[#4F8A6B] transition-transform ${rangeMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {rangeMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_24px_50px_-24px_rgba(30,59,47,0.5)] border border-white p-1.5 z-20">
                      {rangeOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSelectRange(option)}
                          className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                            option === timeRange
                              ? 'bg-[#E6F2EA] text-[#1E3B2F] font-semibold'
                              : 'text-gray-600 hover:bg-[#F5FAF7] hover:text-[#1E3B2F]'
                          }`}
                        >
                          {option}
                          {option === timeRange && <CheckIcon className="w-4 h-4 text-[#4F8A6B]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-6"></div>
          </div>

          {/* Los errores se mantienen en rojo suave para que se distingan */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-[#FFF7F7] text-[#8A3B3B] rounded-2xl border border-[#F2C9C9]">
              <AlertIcon className="w-5 h-5 shrink-0 text-[#C65F5F]" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Tarjetas de Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
            <StatCard
              label="Total Vendido"
              value={stats.totalVendido.value}
              icon={TrendingUpIcon}
              tint="#1E3B2F"
              iconColor="#FFFFFF"
              blob="#CFE6D8"
              delay=".05s"
            >
              <span className="text-sm font-semibold text-gray-900">{stats.totalVendido.percentage}</span>
              <ComparisonBadge>vs mes anterior</ComparisonBadge>
            </StatCard>

            <StatCard
              label="Total Órdenes"
              value={stats.totalOrdenes.value}
              icon={BagIcon}
              tint="#E6F2EA"
              iconColor="#4F8A6B"
              blob="#DCEDE3"
              delay=".1s"
            >
              <span className="text-sm font-semibold text-gray-900">{stats.totalOrdenes.percentage}</span>
              <ComparisonBadge>vs mes anterior</ComparisonBadge>
            </StatCard>

            <StatCard
              label="Total Productos"
              value={stats.totalProductos.value}
              icon={PackageIcon}
              tint="#F5EFE3"
              iconColor="#9A7F4E"
              blob="#F1E4C8"
              delay=".15s"
            >
              <ComparisonBadge>{stats.totalProductos.percentage}</ComparisonBadge>
            </StatCard>

            <StatCard
              label="Clientes"
              value={stats.totalClientes?.value || 0}
              icon={UsersIcon}
              tint="#EEF4F0"
              iconColor="#1E3B2F"
              blob="#E3F0E8"
              delay=".2s"
            >
              <span className="text-sm font-semibold text-gray-900">{stats.totalClientes?.percentage || 0}</span>
              <ComparisonBadge>vs mes anterior</ComparisonBadge>
            </StatCard>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-6">
            <div className={`m503-fade-up ${cardClass} p-5 sm:p-6`} style={{ animationDelay: '.25s' }}>
              <div className="mb-6">
                <SectionTitle upper="Ventas por" serif="categoría" />
              </div>
              <div className="flex items-center justify-center py-4">
                <CategoryDonut detalle={ventasCategoria?.detalle} total={ventasCategoria?.total} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-6">
                {ventasCategoria?.detalle?.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#F5FAF7] min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorAt(index) }}></div>
                    <span className="text-xs font-medium text-gray-800 truncate">{item.label}</span>
                    <span className="text-xs text-gray-500 ml-auto shrink-0">{item.percentage}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`m503-fade-up ${cardClass} p-5 sm:p-6`} style={{ animationDelay: '.3s' }}>
              <div className="mb-6">
                <SectionTitle upper="Desempeño por" serif="categoría" />
              </div>
              <div className="space-y-5">
                {ventasCategoria?.detalle?.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-800 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorAt(index) }} />
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-[#1E3B2F] shrink-0">{item.percentage}</span>
                    </div>
                    <div className="h-2.5 bg-[#EEF4F0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: item.width,
                          backgroundColor: colorAt(index)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tablas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <DataTable
              title="Top"
              serif="productos"
              rows={topProducts}
              loading={loading}
              emptyText="Todavía no hay ventas registradas"
              dateLabel="Últ. venta"
              amountLabel="Ingresos"
              delay=".35s"
            />
            <DataTable
              title="Órdenes"
              serif="recientes"
              rows={recentOrders}
              loading={loading}
              emptyText="Todavía no hay órdenes registradas"
              dateLabel="Fecha"
              amountLabel="Total"
              delay=".4s"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;