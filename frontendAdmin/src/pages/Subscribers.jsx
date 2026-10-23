import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm.jsx';
import usePageTitle from '../hooks/usePageTitle';
import { getAllSubscribers, deleteSubscriber, sendNewsletterBlast } from '../api/subscribersAdminApi';

/* ─────────────────────────────────────────────────────────────
   Estilos locales (misma serif, grano y animaciones del panel)
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
    opacity: .08;
    mix-blend-mode: multiply;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
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
   Íconos (ahora aceptan className)
   ───────────────────────────────────────────────────────────── */
const DeleteIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DownloadIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const SendIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const MailIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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
   Piezas visuales
   ───────────────────────────────────────────────────────────── */
const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]';

const fieldClass =
  'w-full px-4 py-3 rounded-2xl border-2 border-transparent bg-[#F2F6F3] hover:bg-[#ECF3EE] focus:bg-white focus:border-[#8DBFA3] focus:ring-4 focus:ring-[#8DBFA3]/20 focus:outline-none transition-all text-gray-900 placeholder:text-gray-400';

const SectionTitle = ({ upper, serif }) => (
  <h2 className="flex items-baseline gap-2 text-gray-900">
    <span className="text-xs font-bold uppercase tracking-[0.18em]">{upper}</span>
    <span className="m503-serif text-2xl text-[#4F8A6B] leading-none">{serif}</span>
  </h2>
);

const CharCount = ({ value, max }) => {
  const near = value.length > max * 0.9;
  return (
    <span className={`text-[11px] font-medium ${near ? 'text-[#B8892A]' : 'text-gray-400'}`}>
      {value.length}/{max}
    </span>
  );
};

const TOAST_ACCENT = {
  success: '#7FA392',
  error: '#E08A8A',
  warning: '#E7B95A',
  info: '#8E909C',
};

const formatearFecha = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-SV', { year: 'numeric', month: 'short', day: 'numeric' });
};

const SubscribersPage = ({ onLogout }) => {
  usePageTitle();

  const { toasts, showSuccess, showError } = useToast(3000);
  const { confirm, ConfirmDialog } = useConfirm();

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getAllSubscribers();
      setSubscribers(data);
    } catch (err) {
      showError(err.message || 'No se pudieron cargar los suscriptores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleEliminar = async (id) => {
    const ok = await confirm('¿Estás seguro de quitar este correo de la lista? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      await deleteSubscriber(id);
      setSubscribers(prev => prev.filter(s => s._id !== id));
      showSuccess('Suscriptor eliminado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo eliminar el suscriptor');
    }
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!asunto.trim() || !mensaje.trim()) {
      showError('Escribe un asunto y un mensaje antes de enviar');
      return;
    }
    const ok = await confirm(`¿Enviar este correo a los ${subscribers.length} suscriptores? Esta acción no se puede deshacer.`);
    if (!ok) return;

    setEnviando(true);
    try {
      const resultado = await sendNewsletterBlast({ subject: asunto, message: mensaje });
      showSuccess(resultado.message || 'Correo enviado exitosamente');
      setAsunto('');
      setMensaje('');
    } catch (err) {
      showError(err.message || 'No se pudo enviar el correo');
    } finally {
      setEnviando(false);
    }
  };

  // Descarga la lista como un archivo .csv (se abre directo en Excel/Sheets)
  // -- no depende de ninguna librería, es texto plano separado por comas.
  const handleExportar = () => {
    if (subscribers.length === 0) return;

    const filas = [
      ['Correo', 'Fecha de suscripción'],
      ...subscribers.map(s => [s.email, formatearFecha(s.createdAt)])
    ];
    const csv = filas.map(fila => fila.map(campo => `"${String(campo).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `suscriptores-macetas503-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess('Lista exportada exitosamente');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
      <style>{STYLES}</style>
      <Sidebar onLogout={onLogout} />
      {ConfirmDialog}

      {/* Toast Notifications */}
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[60] space-y-2">
        {toasts.map((toast) => {
          const accent = TOAST_ACCENT[toast.type] || TOAST_ACCENT.info;
          return (
            <div
              key={toast.id}
              className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-white border-l-[3px] rounded-2xl px-4 sm:px-5 py-3 shadow-[0_12px_30px_-12px_rgba(30,59,47,0.3)] text-sm font-medium text-gray-800 transition-all transform"
              style={{ minWidth: '280px', borderLeftColor: accent }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
              {toast.message}
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">
          {/* Header */}
          <div className="mb-8 m503-fade-up">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
                  <MailIcon className="w-3 h-3" />
                  Newsletter
                </span>
                <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
                  <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Gestión de</span>
                  <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">suscriptores</span>
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-500">
                  Correos registrados desde el formulario del pie de página de la tienda
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-2 pl-2 pr-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white shadow-[0_12px_28px_-18px_rgba(30,59,47,0.6)]">
                  <span className="w-7 h-7 rounded-full bg-[#1E3B2F] text-white flex items-center justify-center text-xs font-bold">
                    {subscribers.length}
                  </span>
                  <span className="text-sm text-gray-600">suscriptor{subscribers.length !== 1 ? 'es' : ''}</span>
                </span>
                <button
                  onClick={handleExportar}
                  disabled={subscribers.length === 0}
                  className="group inline-flex items-center gap-2 pl-2 pr-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white shadow-[0_12px_28px_-18px_rgba(30,59,47,0.6)] hover:bg-white text-sm font-semibold text-[#1E3B2F] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="w-7 h-7 rounded-full bg-[#E6F2EA] text-[#4F8A6B] flex items-center justify-center transition-transform group-hover:translate-y-0.5">
                    <DownloadIcon className="w-3.5 h-3.5" />
                  </span>
                  Exportar CSV
                </button>
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-6"></div>
          </div>

          {/* Enviar anuncio a todos los suscriptores -- 100% manual, el
              admin escribe el mensaje y decide cuándo mandarlo. Nunca se
              dispara solo al agregar un producto o una oferta. */}
          <form
            onSubmit={handleEnviar}
            className={`m503-fade-up ${cardClass} p-2.5 mb-6`}
            style={{ animationDelay: '.08s' }}
          >
            <div className="grid lg:grid-cols-[1.15fr_1fr] gap-2.5">
              {/* Formulario */}
              <div className="p-4 sm:p-5">
                <SectionTitle upper="Enviar" serif="anuncio" />
                <p className="text-sm text-gray-500 mt-2">
                  Manda un aviso de producto nuevo, oferta, o lo que quieras a los {subscribers.length} suscriptores.
                </p>
                <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-[#4F8A6B] bg-[#E6F2EA] px-2.5 py-1 rounded-full">
                  <LockIcon />
                  Solo se envía cuando tú le des clic a "Enviar" — nunca automático
                </span>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Asunto</label>
                      <CharCount value={asunto} max={100} />
                    </div>
                    <input
                      type="text"
                      placeholder="Ej: ¡Llegaron macetas nuevas!"
                      maxLength={100}
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mensaje</label>
                      <CharCount value={mensaje} max={2000} />
                    </div>
                    <textarea
                      placeholder="Escribe el mensaje que verán tus suscriptores..."
                      rows={5}
                      maxLength={2000}
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      className={`${fieldClass} resize-none`}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={enviando || subscribers.length === 0}
                      className="group inline-flex items-center gap-3 pl-5 pr-2 py-2 rounded-2xl bg-[#1E3B2F] text-white text-sm font-semibold uppercase tracking-wide shadow-[0_16px_32px_-14px_rgba(30,59,47,0.75)] hover:bg-[#162E24] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {enviando ? 'Enviando...' : `Enviar a ${subscribers.length} suscriptores`}
                      <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                        {enviando ? <Spinner /> : <SendIcon className="w-4 h-4 rotate-90 transition-transform group-hover:translate-x-0.5" />}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Vista previa del texto (solo visual, refleja lo que escribes) */}
              <div className="m503-grain relative overflow-hidden rounded-[1.4rem] p-5 sm:p-6 bg-gradient-to-br from-[#D5E9DD] via-[#E8F2EC] to-[#F5EFE3] flex flex-col">
                <div className="pointer-events-none absolute -bottom-16 -right-12 w-48 h-48 rounded-full bg-[#F1E4C8] blur-3xl opacity-80" />
                <LeafIcon className="pointer-events-none absolute top-4 right-4 w-12 h-12 text-[#4F8A6B]/15 rotate-12" />

                <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600">Vista previa del texto</p>

                <div className="relative mt-4 flex-1 bg-white/85 backdrop-blur-md rounded-2xl border border-white shadow-[0_18px_40px_-24px_rgba(30,59,47,0.5)] overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#EEF4F0]">
                    <span className="w-8 h-8 rounded-full bg-[#1E3B2F] text-white flex items-center justify-center shrink-0">
                      <LeafIcon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900">Macetas503</p>
                      <p className="text-[11px] text-gray-400 truncate">Para: {subscribers.length} suscriptores</p>
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <p className={`text-base font-bold break-words ${asunto ? 'text-gray-900' : 'text-gray-300'}`}>
                      {asunto || 'Tu asunto aparecerá aquí'}
                    </p>
                    <p className={`mt-2 m503-serif text-[17px] leading-snug whitespace-pre-line break-words ${mensaje ? 'text-gray-700' : 'text-gray-300'}`}>
                      {mensaje || 'Y aquí el mensaje que verán tus suscriptores…'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Lista completa */}
          <div className={`m503-fade-up ${cardClass} overflow-hidden`} style={{ animationDelay: '.16s' }}>
            <div className="px-4 sm:px-6 py-5 border-b border-[#EEF4F0] flex items-center justify-between gap-3">
              <SectionTitle upper="Lista" serif="completa" />
              <span className="text-xs font-medium text-[#4F8A6B] bg-[#E6F2EA] px-3 py-1 rounded-full whitespace-nowrap">
                {subscribers.length} suscriptor{subscribers.length !== 1 ? 'es' : ''}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-16 text-gray-400">Cargando suscriptores...</div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-16">
                <MailIcon className="w-7 h-7 mx-auto text-[#8DBFA3]" />
                <p className="mt-2 m503-serif text-xl text-gray-500">Todavía no hay ningún correo suscrito.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left bg-[#F5FAF7]">
                      <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em]">Correo</th>
                      <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] whitespace-nowrap">Fecha de suscripción</th>
                      <th className="px-6 py-3.5 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF4F0]">
                    {subscribers.map((s) => (
                      <tr key={s._id} className="hover:bg-[#F5FAF7] transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-full bg-[#E6F2EA] text-[#1E3B2F] text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                              {(s.email || '?').charAt(0)}
                            </span>
                            <span className="text-gray-900 font-medium truncate">{s.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap">{formatearFecha(s.createdAt)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <button
                            onClick={() => handleEliminar(s._id)}
                            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#C65F5F] bg-[#FDF3F3] hover:bg-[#E08A8A] hover:text-white transition-all"
                            title="Eliminar suscriptor"
                          >
                            <DeleteIcon className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribersPage;