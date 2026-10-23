import React from 'react';
import MenuLateral from '../components/Sidebar';
import FloraChat from '../components/FloraChat';
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

const Flora = ({ onLogout }) => {
  usePageTitle();
  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
      <style>{STYLES}</style>
      <MenuLateral onLogout={onLogout} />

      <div className="flex-1 flex flex-col h-full min-w-0 p-4 pt-20 sm:p-6 sm:pt-20 lg:p-6">
        {/* Header */}
        <div className="mb-4 flex-shrink-0 m503-fade-up">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#8DBFA3] opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[#4F8A6B]" />
            </span>
            Activo
          </span>
          <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
            <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">Flora</span>
            <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Asistente IA</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">Asistente virtual para tu negocio</p>
          <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-4"></div>
        </div>

        {/* Contenido del chat */}
        <div
          className="flex-1 min-h-0 m503-fade-up bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)] overflow-hidden"
          style={{ animationDelay: '.08s' }}
        >
          <FloraChat />
        </div>
      </div>
    </div>
  );
};

export default Flora;