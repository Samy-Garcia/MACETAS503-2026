import logoMacetas from "../assets/logoMacetas.png";
import { useAuthForm } from "../hooks/useAuthForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import InteractiveGradient from "@/components/InteractiveGradient";

// ... (Tus imports se quedan igual)

export default function ForgotPassword() {
  const { register, handleSubmit, errors, onRecovery, navigate } = useAuthForm();

  return (
    <InteractiveGradient>
      {/* 1. Ampliamos el max-w de la tarjeta a 440px para albergar cómodamente el texto estirado */}
      <div className="w-full max-w-[440px] bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-10 flex flex-col items-center">

        {/* Logo central */}
        <div className="mb-6 flex justify-center">
          <img src={logoMacetas} alt="Macetas" className="w-14 h-14 object-contain" />
        </div>

        {/* Título Principal - Cambiado a tracking-tight para juntar las letras */}
        <h1 className="text-[28px] font-bold text-[#064225] tracking-tight text-center mb-1">
          Ingresa tu correo
        </h1>

        {/* Subtítulo - Cambiado a tracking-normal (o quita cualquier tracking) para eliminar la separación */}
        <p className="text-xs text-[#2c4e3e] text-center mb-8 font-normal tracking-normal whitespace-nowrap">
          Ingresa tu correo para recibir un código de verificación.
        </p>

        <form onSubmit={handleSubmit(onRecovery)} className="w-full">
          {/* ... Todo el resto del formulario y el enlace inferior se quedan exactamente igual ... */}
          <div className="w-full flex flex-col items-start gap-2 mb-5">
            <label className="text-sm font-semibold text-[#0a3620] pl-0.5" htmlFor="fp-email">
              Correo Electrónico
            </label>
            <Input
              id="fp-email"
              type="email"
              className="h-11 w-full rounded-lg border border-zinc-400 bg-white/80 px-3.5 text-sm font-normal text-zinc-900 placeholder:text-zinc-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064225]/20 focus-visible:border-[#064225] transition-all duration-200"
              style={errors.email ? { borderColor: '#ef4444' } : {}}
              placeholder="jeancarloaraniva@gmail.com"
              {...register("email", {
                required: "Ingresa tu correo para recibir el código.",
                pattern: { value: /^\S+@\S+$/i, message: "El formato de correo no es válido." }
              })}
            />
            {errors.email && (
              <span className="text-red-600 text-[11px] text-left block mt-0.5 pl-1 font-medium">
                {errors.email.message}
              </span>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-lg bg-[#053d22] hover:bg-[#032d18] text-white font-medium text-sm transition-all duration-150 active:scale-[0.99] shadow-md cursor-pointer"
          >
            Enviar Código
          </Button>
        </form>

        <p className="text-xs text-[#2c4e3e] mt-8 text-center font-normal">
          ¿Recordaste tu contraseña?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-[#053d22] font-semibold hover:underline cursor-pointer transition-all"
          >
            Inicia sesión
          </span>
        </p>
      </div>
    </InteractiveGradient>
  );
}
