import { useState, useEffect } from "react";
import { useAuthForm } from "../hooks/useAuthForm";
import { Button } from "@/components/ui/Button";
import InteractiveGradient from "@/components/InteractiveGradient";
import logoMacetas from "../assets/logoMacetas.png";

export default function VerifyCode() {

  useEffect(() => {
    document.title = "Verificar Código | Macetas503";
  }, []);


  const { register, handleSubmit, errors, onVerifyCode, navigate, setValue, watch } = useAuthForm();
  const codeValue = watch("code", "");

  const handleOtpChange = (e) => {
    const val = e.target.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);
    setValue("code", val, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    onVerifyCode(data);
  };

  return (
    <InteractiveGradient>
      <div className="w-full max-w-[440px] bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-10 flex flex-col items-center">

        {/* Logo superior */}
        <div className="mb-6 flex justify-center">
          <img src={logoMacetas} alt="Macetas Logo" className="w-14 h-14 object-contain" />
        </div>

        {/* Título Principal */}
        <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight text-center mb-1">
          Ingresa el código
        </h1>

        {/* Subtítulo */}
        <p className="text-xs text-[#2c4e3e] text-center mb-8 font-normal tracking-normal whitespace-nowrap">
          Te mandamos un código de verificación a tu correo.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col items-center">
          <div className="w-full flex flex-col items-start gap-2 mb-6">
            <label className="text-sm font-semibold text-primary-700 pl-0.5 tracking-tight self-start" htmlFor="otp-input">
              Código de Verificación
            </label>

            {/* CONTENEDOR DE CÓDIGO MEJORADO */}
            <div className="w-full relative flex items-center justify-between gap-2 mt-1">

              {[0, 1, 2, 3, 4, 5].map((index) => {
                const char = codeValue[index] || "";
                // Detecta si este cuadro específico es el que actualmente espera la escritura
                const isCurrentFocus = index === codeValue.length;

                return (
                  <div
                    key={index}
                    className={`w-11 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200 border-2 select-none
                      ${char
                        ? "border-primary-700 bg-surface text-zinc-900 shadow-md scale-105"
                        : isCurrentFocus
                          ? "border-primary-700 bg-surface text-zinc-400 ring-4 ring-primary-700/10"
                          : "border-zinc-400/50 bg-zinc-300 text-zinc-900"
                      }
                    `}
                  >
                    {char}
                  </div>
                );
              })}

              {/* Input nativo invisible superpuesto */}
              <input
                id="otp-input"
                type="text"
                pattern="[a-zA-Z0-9]*"
                inputMode="text"
                autoCapitalize="characters"
                maxLength={6}
                value={codeValue}
                onChange={handleOtpChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-center"
                {...register("code", {
                  required: "El código de verificación es obligatorio.",
                  minLength: { value: 6, message: "Debes ingresar los 6 caracteres." }
                })}
              />
            </div>

            {/* Manejo de Errores */}
            {errors.code && (
              <span className="text-red-600 text-[11px] text-left block mt-1 pl-1 font-medium">
                {errors.code.message}
              </span>
            )}
          </div>

          {/* Botón de Acción Sólido Verde */}
          <Button
            type="submit"
            className="w-full h-11 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm tracking-tight transition-all duration-150 active:scale-[0.99] shadow-md cursor-pointer"
          >
            Enviar Código
          </Button>
        </form>

        {/* Enlace Inferior de retorno */}
        <p className="text-xs text-[#2c4e3e] mt-8 text-center font-normal">
          ¿Recordaste tu contraseña?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-primary-700 font-semibold hover:underline cursor-pointer transition-all"
          >
            Iniciar sesión
          </span>
        </p>

      </div>
    </InteractiveGradient>
  );
}
