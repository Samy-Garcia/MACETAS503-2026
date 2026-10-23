import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm.jsx';
import usePageTitle from '../hooks/usePageTitle';
import { getPendingAdmins, approveAdmin, rejectAdmin } from '../api/adminApi';

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

  @keyframes m503-pop {
    from { opacity: 0; transform: translateY(8px) scale(.98); }
    to   { opacity: 1; transform: none; }
  }
  .m503-pop { animation: m503-pop .3s cubic-bezier(.22,1,.36,1) both; }

  .m503-scroll { scrollbar-width: thin; scrollbar-color: #D3E6DA transparent; }
  .m503-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .m503-scroll::-webkit-scrollbar-thumb { background: #D3E6DA; border-radius: 9999px; }
  .m503-scroll::-webkit-scrollbar-track { background: transparent; }

  @media (prefers-reduced-motion: reduce) {
    .m503-fade-up, .m503-pop { animation: none; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Íconos (aceptan className)
   ───────────────────────────────────────────────────────────── */
const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ShieldIcon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Piezas visuales
   ───────────────────────────────────────────────────────────── */
const cardClass =
  'bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-[0_20px_45px_-30px_rgba(30,59,47,0.45)]';

const thClass = 'px-5 py-3 text-left text-[11px] font-semibold text-[#4F8A6B] uppercase tracking-[0.14em] whitespace-nowrap';

const formatearFecha = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-SV', { year: 'numeric', month: 'short', day: 'numeric' });
};

const AdminApprovalsPage = ({ onLogout }) => {
  usePageTitle();

  const { toasts, showSuccess, showError } = useToast(3000);
  const { confirm, ConfirmDialog } = useConfirm();

  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await getPendingAdmins();
      setPendingAdmins(data || []);
    } catch (err) {
      showError(err.message || 'No se pudo cargar la lista de administradores pendientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleAprobar = async (admin) => {
    const ok = await confirm(`¿Darle acceso a ${admin.name} (${admin.email})? Podrá iniciar sesión en el panel de inmediato.`, { confirmText: 'Aprobar acceso' });
    if (!ok) return;

    setProcessingId(admin._id);
    try {
      await approveAdmin(admin._id);
      setPendingAdmins(prev => prev.filter(a => a._id !== admin._id));
      showSuccess(`${admin.name} ya puede iniciar sesión`);
    } catch (err) {
      showError(err.message || 'No se pudo aprobar al administrador');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRechazar = async (admin) => {
    const ok = await confirm(`¿Rechazar el registro de ${admin.name} (${admin.email})? Se eliminará su cuenta y tendría que registrarse de nuevo.`, { confirmText: 'Rechazar y eliminar' });
    if (!ok) return;

    setProcessingId(admin._id);
    try {
      await rejectAdmin(admin._id);
      setPendingAdmins(prev => prev.filter(a => a._id !== admin._id));
      showSuccess('Registro rechazado exitosamente');
    } catch (err) {
      showError(err.message || 'No se pudo rechazar al administrador');
    } finally {
      setProcessingId(null);
    }
  };

  // Iniciales para el avatar (solo presentación)
  const iniciales = (name) =>
    (name || '?')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
      <style>{STYLES}</style>
      <Sidebar onLogout={onLogout} />
      {ConfirmDialog}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`m503-pop flex items-center gap-2.5 px-5 py-3 rounded-2xl backdrop-blur-md shadow-[0_18px_36px_-18px_rgba(30,59,47,0.6)] font-medium text-sm ${
              toast.type === 'success'
                ? 'bg-[#1E3B2F]/95 text-white'
                : toast.type === 'error'
                  ? 'bg-[#E08A8A]/95 text-white'
                  : 'bg-[#4F8A6B]/95 text-white'
            }`}
            style={{ minWidth: '280px' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: toast.type === 'success' ? '#8DBFA3' : '#FFFFFF' }}
            />
            {toast.message}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto m503-scroll p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">
        {/* Header */}
        <div className="mb-6 m503-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-white/70 border border-white px-3 py-1 rounded-full">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#8DBFA3] opacity-75 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-[#4F8A6B]" />
                </span>
                Activo
              </span>
              <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
                <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Administradores</span>
                <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">pendientes</span>
              </h1>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                Por seguridad, quien se registre debe esperar a que un administrador ya aprobado le dé acceso antes de poder iniciar sesión.
              </p>
            </div>
            {!loading && pendingAdmins.length > 0 && (
              <span className="self-start sm:self-auto shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FBF1D6] text-[#7A5B12] font-semibold text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E7B95A]" />
                {pendingAdmins.length} pendiente{pendingAdmins.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="h-px w-full bg-gradient-to-r from-[#8DBFA3]/70 via-[#E3CFA5]/60 to-transparent mt-5"></div>
        </div>

        <div className={`m503-fade-up ${cardClass} overflow-hidden`} style={{ animationDelay: '.08s' }}>
          <div className="px-5 py-4 border-b border-[#EEF4F0] bg-[#F5FAF7]/60 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#1E3B2F]">Solicitudes de acceso</h2>
            <span className="text-xs font-medium text-[#4F8A6B] bg-[#E6F2EA] px-3 py-1 rounded-full">
              {pendingAdmins.length} registro{pendingAdmins.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Cargando...</div>
          ) : pendingAdmins.length === 0 ? (
            <div className="text-center py-16">
              <ShieldIcon className="w-7 h-7 mx-auto text-[#8DBFA3]" />
              <p className="mt-2 m503-serif text-xl text-gray-500">No hay registros pendientes de aprobación</p>
            </div>
          ) : (
            <div className="overflow-x-auto m503-scroll">
              <table className="w-full text-sm">
                <thead className="bg-[#F5FAF7]/80 border-b border-[#EEF4F0]">
                  <tr>
                    <th className={thClass}>Nombre</th>
                    <th className={thClass}>Correo</th>
                    <th className={thClass}>Se registró</th>
                    <th className={`${thClass} text-right`}>Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF4F0]">
                  {pendingAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-[#F5FAF7] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold bg-gradient-to-br from-[#E8F2EC] to-[#F5EFE3] text-[#1E3B2F]">
                            {iniciales(admin.name)}
                          </span>
                          <span className="font-semibold text-gray-900">{admin.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{admin.email}</td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatearFecha(admin.createdAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleRechazar(admin)}
                            disabled={processingId === admin._id}
                            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-[#C65F5F] bg-[#FDF3F3] hover:bg-[#E08A8A] hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-[#FDF3F3] disabled:hover:text-[#C65F5F]"
                            title="Rechazar y eliminar"
                          >
                            <XIcon />
                          </button>
                          <button
                            onClick={() => handleAprobar(admin)}
                            disabled={processingId === admin._id}
                            className="inline-flex items-center gap-1.5 px-4 h-8 rounded-full bg-[#1E3B2F] text-white text-xs font-semibold shadow-[0_10px_22px_-12px_rgba(30,59,47,0.7)] hover:bg-[#162E24] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0 whitespace-nowrap"
                            title="Aprobar acceso"
                          >
                            <CheckIcon className="w-3.5 h-3.5" />
                            {processingId === admin._id ? 'Procesando...' : 'Aprobar'}
                          </button>
                        </div>
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
  );
};

export default AdminApprovalsPage;