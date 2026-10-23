import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuthForm } from "../hooks/useAuthForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import InteractiveGradient from "@/components/InteractiveGradient";
import logoMacetas from "../assets/logoMacetas.png";

export default function ResetPassword() {

  useEffect(() => {
      document.title = "Recuperar Contraseña | Macetas503";
    }, []);

    
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Extraemos lo necesario de tu hook (asumiendo que manejas onResetPassword u onUpdatePassword allí)
  const { register, handleSubmit, errors, onResetPassword, navigate, watch } = useAuthForm();

  // Monitoreamos la contraseña nueva para validar que la confirmación coincida exactamente
  const newPasswordValue = watch("password");

  const onSubmit = (data) => {
    // data.password contiene la nueva contraseña verificada
    if (onResetPassword) {
      onResetPassword(data);
    } else {
      // Simulación por si aún estás ajustando el hook
      console.log("Nueva contraseña enviada:", data.password);
      navigate("/login");
    }
  };

  return (
    <InteractiveGradient>
      {/* Tarjeta flotante con desenfoque de fondo idéntica al boceto */}
      <div className="w-full max-w-[480px] bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] p-10 flex flex-col items-center">
        
        {/* Logo superior */}
        <div className="mb-6 flex justify-center">
          <img src={logoMacetas} alt="Macetas Logo" className="w-14 h-14 object-contain" />
        </div>

        {/* Título Principal */}
        <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight text-center mb-1">
          Nueva contraseña
        </h1>
        
        {/* Subtítulo */}
        <p className="text-xs text-[#2c4e3e] text-center mb-8 font-normal tracking-normal">
          Crea una contraseña nueva para mantener tu cuenta segura.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
          
          {/* Campo Contraseña Nueva */}
          <div className="w-full flex flex-col items-start gap-1.5">
            <label className="text-sm font-semibold text-primary-700 pl-0.5 tracking-tight" htmlFor="password">
              Contraseña Nueva
            </label>
            <div className="w-full relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="h-11 w-full rounded-lg border border-zinc-400 bg-white/80 pl-3.5 pr-11 text-sm font-normal text-zinc-900 placeholder:text-zinc-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/20 focus-visible:border-primary-700 transition-all duration-200"
                style={errors.password ? { borderColor: '#ef4444' } : {}}
                placeholder="Crea una contraseña"
                {...register("password", { 
                  required: "La contraseña es obligatoria.",
                  minLength: { value: 6, message: "Debe tener al menos 6 caracteres." }
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-800 hover:text-zinc-900 transition-colors p-1 cursor-pointer"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-600 text-[11px] font-medium mt-0.5 pl-1">{errors.password.message}</span>
            )}
          </div>

          {/* Campo Confirmar Contraseña Nueva */}
          <div className="w-full flex flex-col items-start gap-1.5">
            <label className="text-sm font-semibold text-primary-700 pl-0.5 tracking-tight" htmlFor="confirmPassword">
              Confirmar Contraseña Nueva
            </label>
            <div className="w-full relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="h-11 w-full rounded-lg border border-zinc-400 bg-white/80 pl-3.5 pr-11 text-sm font-normal text-zinc-900 placeholder:text-zinc-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/20 focus-visible:border-primary-700 transition-all duration-200"
                style={errors.confirmPassword ? { borderColor: '#ef4444' } : {}}
                placeholder="Confirma tu nueva contraseña"
                {...register("confirmPassword", { 
                  required: "La confirmación es obligatoria.",
                  validate: (value) => value === newPasswordValue || "Las contraseñas no coinciden."
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-800 hover:text-zinc-900 transition-colors p-1 cursor-pointer"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-red-600 text-[11px] font-medium mt-0.5 pl-1">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Botón Principal - Crear Nueva Contraseña */}
          <Button 
            type="submit" 
            className="w-full h-11 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm tracking-tight transition-all duration-150 active:scale-[0.99] shadow-md mt-2 cursor-pointer"
          >
            Crear Nueva Contraseña
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
