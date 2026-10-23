import { useState, useEffect } from "react";
import logoMacetas from "../assets/logoMacetas.png";
import { useAuthForm } from "../hooks/useAuthForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import InteractiveGradient from "@/components/InteractiveGradient";

// ... (Tus imports se quedan igual)

export default function ForgotPassword() {

  useEffect(() => {
    document.title = "Recuperar Contraseña | Macetas503";
  }, []);

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
        <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight text-center mb-1">
          Ingresa tu correo
        </h1>

        {/* Subtítulo - Cambiado a tracking-normal (o quita cualquier tracking) para eliminar la separación */}
        <p className="text-xs text-[#2c4e3e] text-center mb-8 font-normal tracking-normal whitespace-nowrap">
          Ingresa tu correo para recibir un código de verificación.
        </p>

        <form onSubmit={handleSubmit(onRecovery)} className="w-full">
          {/* ... Todo el resto del formulario y el enlace inferior se quedan exactamente igual ... */}
          <div className="w-full flex flex-col items-start gap-2 mb-5">
            <label className="text-sm font-semibold text-primary-700 pl-0.5" htmlFor="fp-email">
              Correo Electrónico
            </label>
            <Input
              id="fp-email"
              type="email"
              className="h-11 w-full rounded-lg border border-zinc-400 bg-white/80 px-3.5 text-sm font-normal text-zinc-900 placeholder:text-zinc-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/20 focus-visible:border-primary-700 transition-all duration-200"
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
            className="w-full h-11 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm transition-all duration-150 active:scale-[0.99] shadow-md cursor-pointer"
          >
            Enviar Código
          </Button>
        </form>

        <p className="text-xs text-[#2c4e3e] mt-8 text-center font-normal">
          ¿Recordaste tu contraseña?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-primary-700 font-semibold hover:underline cursor-pointer transition-all"
          >
            Inicia sesión
          </span>
        </p>
      </div>
    </InteractiveGradient>
  );
}
