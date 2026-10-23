import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useToast } from '../hooks/useToast';
import { recoveryAdminRequest } from '../api/authApi';
import Logo from '../assets/Logo.png';
import usePageTitle from '../hooks/usePageTitle';

/* ─────────────────────────────────────────────────────────────
   Estilos locales (no requieren tocar tailwind.config)
   - Fuente serif itálica para los acentos "aesthetic"
   - Textura de grano suave
   - Animaciones
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

  @keyframes m503-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: none; }
  }
  .m503-fade-up { animation: m503-fade-up .6s cubic-bezier(.22,1,.36,1) both; }
  .m503-delay-1 { animation-delay: .08s; }
  .m503-delay-2 { animation-delay: .16s; }

  @keyframes m503-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-7px); }
    40% { transform: translateX(7px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  .m503-shake { animation: m503-shake .45s ease-in-out; }

  @keyframes m503-ring {
    from { stroke-dashoffset: 100; }
    to   { stroke-dashoffset: 0; }
  }
  .m503-ring { stroke-dashoffset: 0; animation: m503-ring 1.4s cubic-bezier(.65,0,.35,1) .25s both; }

  @keyframes m503-float {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-6px); }
  }
  .m503-float { animation: m503-float 6s ease-in-out infinite; }

  @keyframes m503-progress {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  .m503-progress { transform-origin: left; animation: m503-progress 1.5s linear both; }

  @keyframes m503-pop {
    0%   { opacity: 0; transform: scale(.6); }
    70%  { opacity: 1; transform: scale(1.06); }
    100% { opacity: 1; transform: scale(1); }
  }
  .m503-pop { animation: m503-pop .5s cubic-bezier(.22,1,.36,1) both; }

  @keyframes m503-spin { to { transform: rotate(360deg); } }
  .m503-orbit { animation: m503-spin 40s linear infinite; }

  @keyframes m503-sway {
    0%, 100% { transform: rotate(var(--r, 0deg)); }
    50%      { transform: rotate(calc(var(--r, 0deg) + 6deg)); }
  }
  .m503-sway { animation: m503-sway 7s ease-in-out infinite; }

  @media (prefers-reduced-motion: reduce) {
    .m503-fade-up, .m503-shake, .m503-ring, .m503-float, .m503-progress, .m503-pop, .m503-orbit, .m503-sway { animation: none; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Íconos de trazo lineal (mismo estilo que el sidebar)
   ───────────────────────────────────────────────────────────── */
const Icon = ({ children, className = 'w-5 h-5', ...rest }) => (
  <svg
    {...rest}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const MailIcon = (p) => (
  <Icon {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
);
const MailCheckIcon = (p) => (
  <Icon {...p}>
    <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    <path d="m16 19 2 2 4-4" />
  </Icon>
);
const ArrowIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Icon>
);
const ArrowLeftIcon = (p) => (
  <Icon {...p}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </Icon>
);
const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);
const AlertIcon = (p) => (
  <Icon {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </Icon>
);
const ShieldIcon = (p) => (
  <Icon {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);
const LeafIcon = (p) => (
  <Icon {...p}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </Icon>
);
const CalendarIcon = (p) => (
  <Icon {...p}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </Icon>
);
const ClockIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);
const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   Piezas visuales
   ───────────────────────────────────────────────────────────── */

const VersionTag = () => (
  <p className="flex items-center justify-center gap-2 text-[11px] tracking-[0.15em] text-gray-500">
    <span className="w-1 h-1 rounded-full bg-[#8DBFA3]" />
    v2.0.1 • Macetas503
    <span className="w-1 h-1 rounded-full bg-[#8DBFA3]" />
  </p>
);

// Logo dentro de un anillo que se dibuja al cargar, con una
// órbita punteada que gira muy lento alrededor
const LogoRing = () => (
  <div className="m503-float relative w-36 h-36 sm:w-44 sm:h-44 xl:w-52 xl:h-52">
    <div className="m503-orbit absolute -inset-4 sm:-inset-5 rounded-full border border-dashed border-[#4F8A6B]/30">
      <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-[#4F8A6B] ring-4 ring-white/70" />
      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#E3CFA5] ring-4 ring-white/60" />
    </div>
    <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
      <circle cx="60" cy="60" r="55" fill="none" stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="4" />
      <circle
        cx="60"
        cy="60"
        r="55"
        fill="none"
        stroke="#8DBFA3"
        strokeWidth="4"
        strokeLinecap="round"
        pathLength="100"
        strokeDasharray="100"
        className="m503-ring"
      />
    </svg>
    <div className="absolute inset-3 sm:inset-[14px] rounded-full overflow-hidden bg-white shadow-[0_20px_40px_-14px_rgba(30,59,47,0.45)]">
      <img src={Logo} alt="Macetas503" className="w-full h-full object-cover" />
    </div>
  </div>
);

const getGreeting = (hour) => {
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

// Saludo + fecha/hora en vivo. Aislado para que el reloj
// no vuelva a renderizar el formulario.
const LiveGreeting = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  const fechaRaw = now.toLocaleDateString('es-SV', { weekday: 'long', day: 'numeric', month: 'long' });
  // Solo la primera letra en mayúscula: "Sábado, 10 de octubre"
  const fecha = fechaRaw.charAt(0).toUpperCase() + fechaRaw.slice(1);
  const hora = now.toLocaleTimeString('es-SV', { hour: 'numeric', minute: '2-digit' });

  const [primera, ...resto] = getGreeting(now.getHours()).split(' ');

  const chip =
    'inline-flex items-center gap-1.5 text-xs text-gray-600 bg-white/60 backdrop-blur-md border border-white/80 px-3 py-1.5 rounded-full shadow-[0_6px_16px_-10px_rgba(30,59,47,0.35)]';

  return (
    <div className="text-center">
      <h2 className="flex items-baseline justify-center gap-2.5 text-gray-900">
        <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide">{primera}</span>
        <span className="m503-serif text-4xl sm:text-5xl text-[#4F8A6B]">{resto.join(' ')}</span>
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        <span className={chip}>
          <CalendarIcon className="w-3.5 h-3.5 text-[#4F8A6B]" />
          {fecha}
        </span>
        <span className={chip}>
          <ClockIcon className="w-3.5 h-3.5 text-[#4F8A6B]" />
          {hora}
        </span>
      </div>
    </div>
  );
};

// Pasos de la recuperación. `current` es el índice del paso actual;
// los anteriores se muestran como completados.
const STEPS = [
  { n: '01', title: 'Ingresa tu correo', desc: 'El correo de tu cuenta de administrador.' },
  { n: '02', title: 'Escribe el código', desc: 'Te llegará un código de verificación.' },
  { n: '03', title: 'Crea tu nueva contraseña', desc: 'Y vuelve a entrar a tu panel.' },
];

const StepsCard = ({ current }) => (
  <div className="w-full max-w-md bg-white/55 backdrop-blur-md rounded-3xl border border-white/80 px-6 py-5 text-left shadow-[0_18px_40px_-24px_rgba(30,59,47,0.45)]">
    <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
      <span className="w-6 h-6 rounded-full bg-[#4F8A6B]/10 flex items-center justify-center">
        <LeafIcon className="w-3.5 h-3.5 text-[#4F8A6B]" />
      </span>
      Recupera tu <span className="m503-serif text-lg text-[#4F8A6B] -my-1">acceso</span>
    </p>
    <ol className="mt-4 flex flex-col">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const isLast = i === STEPS.length - 1;
        return (
          <li key={step.n} className="relative flex items-start gap-3 pb-4 last:pb-0">
            {/* Línea que conecta los pasos: sólida si ya se completó */}
            {!isLast && (
              <span
                className={`absolute left-4 top-9 bottom-1 w-px border-l ${
                  done ? 'border-solid border-[#8DBFA3]' : 'border-dashed border-[#4F8A6B]/30'
                }`}
              />
            )}
            <span
              className={`relative w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                done
                  ? 'bg-[#8DBFA3] text-white'
                  : active
                  ? 'bg-[#1E3B2F] text-white ring-4 ring-[#4F8A6B]/15'
                  : 'bg-white/80 text-[#4F8A6B] border border-[#D3E6DA]'
              }`}
            >
              {done ? <CheckIcon className="w-4 h-4" /> : step.n}
            </span>
            <div className="leading-snug pt-1">
              <p
                className={`text-sm font-semibold ${
                  done ? 'text-gray-400 line-through decoration-[#8DBFA3]' : active ? 'text-gray-900' : 'text-gray-700'
                }`}
              >
                {step.title}
                {active && (
                  <span className="ml-2 align-middle text-[10px] font-semibold uppercase tracking-[0.15em] text-[#4F8A6B] bg-[#E6F2EA] px-2 py-0.5 rounded-full">
                    Ahora
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
            </div>
          </li>
        );
      })}
    </ol>
  </div>
);

const FieldError = ({ message }) =>
  message ? (
    <p className="flex items-center gap-1.5 text-xs text-[#C65F5F]">
      <AlertIcon className="w-3.5 h-3.5" />
      {message}
    </p>
  ) : null;

// Los errores se mantienen en rojo suave: si fueran verdes
// se confundirían con un estado de éxito.
const inputClass = (hasError) =>
  `w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 text-gray-900 placeholder:text-gray-400/70 transition-all focus:outline-none ${
    hasError
      ? 'border-[#E8A9A9] bg-[#FFF7F7] focus:ring-4 focus:ring-[#E8A9A9]/20'
      : 'border-transparent bg-[#F2F6F3] hover:bg-[#ECF3EE] focus:bg-white focus:border-[#8DBFA3] focus:ring-4 focus:ring-[#8DBFA3]/20'
  }`;

const TOAST_ACCENT = {
  success: '#7FA392',
  error: '#E08A8A',
  warning: '#E7B95A',
  info: '#8E909C',
};

// Marco compartido por los dos estados (formulario y "enviado")
const AuthShell = ({ toasts = [], currentStep, children }) => (
  <div className="min-h-screen flex p-3 sm:p-5 lg:p-6 bg-gradient-to-br from-[#F6F2E9] via-[#EEF4F0] to-[#E1EDE5]">
    <style>{STYLES}</style>

    {/* Toast Notifications */}
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const accent = TOAST_ACCENT[toast.type] || TOAST_ACCENT.info;
        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-white border-l-[3px] rounded-2xl px-4 sm:px-5 py-3 shadow-[0_12px_30px_-12px_rgba(30,59,47,0.3)] text-sm font-medium text-gray-800 transition-all transform animate-slide-in"
            style={{ minWidth: '0', borderLeftColor: accent }}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
            {toast.message}
          </div>
        );
      })}
    </div>

    {/* Tarjeta tipo bento: panel de marca + contenido */}
    <div className="m503-fade-up w-full grid lg:grid-cols-[1.05fr_1fr] gap-2.5 p-2.5 rounded-[2rem] bg-white/75 backdrop-blur-xl border border-white shadow-[0_40px_90px_-45px_rgba(30,59,47,0.45)]">
      {/* Lado de marca */}
      <section className="m503-grain relative overflow-hidden flex flex-col rounded-[1.6rem] px-6 py-6 sm:px-10 sm:py-8 bg-gradient-to-br from-[#D5E9DD] via-[#E8F2EC] to-[#F5EFE3]">
        {/* Manchas difuminadas de fondo */}
        <div className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#B7D8C5] blur-3xl opacity-70" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-[#F1E4C8] blur-3xl opacity-70" />
        <div className="pointer-events-none absolute top-1/3 right-10 w-40 h-40 rounded-full bg-white blur-2xl opacity-60" />

        {/* Hojas decorativas */}
        <LeafIcon
          className="m503-sway hidden sm:block pointer-events-none absolute top-16 right-10 w-16 h-16 text-[#4F8A6B]/20"
          style={{ '--r': '18deg' }}
        />
        <LeafIcon className="m503-sway hidden sm:block pointer-events-none absolute bottom-20 left-8 w-24 h-24 text-[#4F8A6B]/10" />

        <div className="relative z-10 flex flex-col flex-1">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F8A6B]" />
            Macetas503 · Panel de Control
          </p>

          <div className="flex-1 flex flex-col items-center justify-center gap-8 py-10">
            <LogoRing />
            <LiveGreeting />
            <div className="hidden sm:flex w-full justify-center m503-fade-up m503-delay-2">
              <StepsCard current={currentStep} />
            </div>
          </div>

          <div className="hidden lg:block">
            <VersionTag />
          </div>
        </div>
      </section>

      {/* Lado del contenido */}
      <section className="relative overflow-hidden flex flex-col px-6 py-6 sm:px-10 sm:py-8 rounded-[1.6rem]">
        <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#E3F0E8] blur-3xl opacity-80" />

        <div className="relative z-10 flex justify-end">
          <span className="inline-flex items-center gap-2 text-sm text-gray-700 bg-white/70 border border-[#DCE9E0] rounded-full px-3 sm:px-4 py-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#A7BFB3] opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[#7FA392]" />
            </span>
            <ShieldIcon className="w-4 h-4 text-[#4F8A6B]" />
            <span className="hidden sm:inline">Conexión segura</span>
          </span>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center py-8">{children}</div>

        <div className="relative z-10 lg:hidden">
          <VersionTag />
        </div>
      </section>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   RecoverPassword
   ───────────────────────────────────────────────────────────── */
const RecoverPassword = () => {
  usePageTitle();

  const navigate = useNavigate();
  const { toasts, showSuccess, showError } = useToast(4000);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: ''
    }
  });

  // Estado solo visual
  const [shake, setShake] = useState(false);
  const triggerShake = () => setShake(true);

  const onSubmit = async (formData) => {
    try {
      await recoveryAdminRequest(formData.email);
      localStorage.setItem('verifyEmail', formData.email);
      localStorage.setItem('verifyContext', 'recovery');
      setSuccess(true);
      showSuccess(`Código enviado a ${formData.email}`);
      setTimeout(() => {
        navigate('/verificar');
      }, 1500);
    } catch (err) {
      showError(err.message || 'No se pudo enviar el código.');
      triggerShake();
    }
  };

  // Se ejecuta solo cuando la validación falla (no cambia la lógica)
  const onInvalid = () => triggerShake();

  const emailField = register('email', {
    required: 'El correo es requerido',
    pattern: {
      value: /\S+@\S+\.\S+/,
      message: 'Correo electrónico inválido'
    }
  });

  /* ───────── Estado: correo enviado ───────── */
  if (success) {
    return (
      <AuthShell toasts={toasts} currentStep={1}>
        <div className="w-full max-w-lg text-center">
          <div className="relative w-24 h-24 mx-auto">
            {/* Halo suave detrás del ícono */}
            <div className="absolute -inset-6 rounded-full bg-[#CFE6D8] blur-2xl opacity-70" />
            <div className="m503-pop relative w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E6F2EA] to-white text-[#4F8A6B] ring-8 ring-white/80 shadow-[0_18px_40px_-14px_rgba(30,59,47,0.45)]">
              <MailCheckIcon className="w-10 h-10" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 mt-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-[#E6F2EA] px-3 py-1 rounded-full">
            <LeafIcon className="w-3 h-3" />
            Enviado
          </span>
          <h1 className="mt-5 flex flex-wrap items-baseline justify-center gap-x-3 text-gray-900 leading-none">
            <span className="text-3xl sm:text-4xl font-black uppercase tracking-wide">¡Correo</span>
            <span className="m503-serif text-5xl sm:text-6xl text-[#4F8A6B]">enviado!</span>
          </h1>
          <p className="mt-4 text-gray-500">Hemos enviado un código de verificación a:</p>
          <p className="mt-3 inline-flex items-center gap-2.5 text-sm font-semibold text-gray-900 bg-white/80 border border-[#DCE9E0] rounded-full pl-1.5 pr-4 py-1.5 shadow-[0_8px_24px_-16px_rgba(30,59,47,0.4)] break-all">
            <span className="w-7 h-7 rounded-full bg-[#E6F2EA] flex items-center justify-center shrink-0">
              <MailIcon className="w-3.5 h-3.5 text-[#4F8A6B]" />
            </span>
            {getValues('email')}
          </p>

          {/* Barra que acompaña los 1.5 s antes de ir a /verificar */}
          <div className="mt-8">
            <div className="h-1.5 w-full rounded-full bg-[#E7EFEA] overflow-hidden">
              <div className="m503-progress h-full w-full rounded-full bg-gradient-to-r from-[#8DBFA3] to-[#1E3B2F]" />
            </div>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs uppercase tracking-wide text-gray-400">
              <span className="text-[#4F8A6B]">
                <Spinner />
              </span>
              Llevándote a la verificación...
            </p>
          </div>
        </div>
      </AuthShell>
    );
  }

  /* ───────── Estado: formulario ───────── */
  return (
    <AuthShell toasts={toasts} currentStep={0}>
      <div
        className={`w-full max-w-lg ${shake ? 'm503-shake' : ''}`}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) setShake(false);
        }}
      >
        {/* Encabezado */}
        <div className="pb-6 mb-6 border-b border-[#E7EFEA] m503-fade-up m503-delay-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F8A6B] bg-[#E6F2EA] px-3 py-1 rounded-full">
            <LeafIcon className="w-3 h-3" />
            Recuperación
          </span>
          <h1 className="mt-5 flex flex-wrap items-baseline gap-x-3 text-gray-900 leading-none">
            <span className="text-3xl sm:text-4xl font-black uppercase tracking-wide">Recupera tu</span>
            <span className="m503-serif text-5xl sm:text-6xl text-[#4F8A6B]">contraseña</span>
          </h1>
          <p className="mt-3 text-gray-500">Ingresa tu correo electrónico y te enviaremos un código de verificación.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-5">
          {/* Correo */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-gray-500 font-semibold text-xs uppercase tracking-wide">
              Correo electrónico
            </label>
            <div className="relative group">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#4F8A6B]">
                <MailIcon className="w-[18px] h-[18px]" />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                className={inputClass(!!errors.email)}
                placeholder="admin@macetas503.com"
                {...emailField}
              />
            </div>
            <FieldError message={errors.email?.message} />
          </div>

          {/* Botón principal: verde bosque, a juego con el logo */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group mt-2 w-full inline-flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-[#1E3B2F] text-white font-semibold uppercase tracking-wide shadow-[0_16px_32px_-14px_rgba(30,59,47,0.75)] hover:bg-[#162E24] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                Enviando...
              </>
            ) : (
              <>
                Enviar código
                <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowIcon className="w-4 h-4" />
                </span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E7EFEA]" />
            <span className="m503-serif text-gray-400 text-base">o</span>
            <div className="flex-1 h-px bg-[#E7EFEA]" />
          </div>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="group w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-[#E7EFEA] bg-white/60 text-sm text-gray-500 uppercase tracking-wide hover:border-[#C9E0D2] hover:bg-[#F5FAF7] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 text-[#4F8A6B] transition-transform group-hover:-translate-x-1" />
            ¿Recuerdas tu contraseña? <span className="font-semibold text-[#4F8A6B]">Inicia sesión</span>
          </button>
        </form>
      </div>
    </AuthShell>
  );
};

export default RecoverPassword;