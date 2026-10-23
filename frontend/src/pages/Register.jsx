import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Controller } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import es from "react-phone-number-input/locale/es.json";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import logoMacetas from "../assets/logoMacetas.png";
import GoogleIcon from "../assets/GoogleIcon";
import { useAuthForm } from "../hooks/useAuthForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { lettersPattern, blockNonLetters } from "../utils/inputValidation";

export default function Register() {

  useEffect(() => {
            document.title = "Registrarse | Macetas503";
        }, []);

  const [showPassword, setShowPassword] = useState(false);
  const { register, control, handleSubmit, errors, onRegister, navigate } = useAuthForm();
  
  // Referencia para limitar el movimiento del ratón únicamente al panel verde
  const leftPanelRef = useRef(null);

  // MotionValues para capturar las coordenadas x e y
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Filtro de resorte para suavizar los movimientos brutos del cursor
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 25 });

  // Mapeo dinámico a porcentajes para desplazar la luz de fondo
  const lightPositionX = useTransform(smoothX, [0, 1], ["10%", "90%"]);
  const lightPositionY = useTransform(smoothY, [0, 1], ["10%", "90%"]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!leftPanelRef.current) return;
      
      const rect = leftPanelRef.current.getBoundingClientRect();
      const xPercentage = (event.clientX - rect.left) / rect.width;
      const yPercentage = (event.clientY - rect.top) / rect.height;

      if (xPercentage >= 0 && xPercentage <= 1 && yPercentage >= 0 && yPercentage <= 1) {
        mouseX.set(xPercentage);
        mouseY.set(yPercentage);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row select-none">
      
      {/* SECCIÓN IZQUIERDA: Gradiente Verde Interactivo */}
      <div 
        ref={leftPanelRef}
        className="hidden md:flex md:w-1/2 relative bg-[#042a16] p-16 flex-col justify-end overflow-hidden"
      >
        {/* Haz de luz interactivo */}
        <motion.div
          className="absolute w-[45vw] h-[45vw] rounded-full bg-surface opacity-[0.12] blur-[100px] pointer-events-none z-0"
          style={{
            left: lightPositionX,
            top: lightPositionY,
            translateX: "-50%",
            translateY: "-50%",
          }}
        />

        {/* Ambientación de fondo fija */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#2a5c3a] opacity-40 blur-[130px] z-0" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#609973] opacity-25 blur-[110px] z-0" />
        
        <h1 className="text-white text-[56px] font-bold leading-[1.1] tracking-tight relative z-10 font-sans">
          Tu jardín<br />empieza aquí.
        </h1>
      </div>

      {/* SECCIÓN DERECHA: Formulario de Registro */}
      <div className="w-full md:w-1/2 bg-page flex items-center justify-center p-8 sm:p-12 lg:p-16 relative z-10">
        <div className="w-full max-w-[420px] flex flex-col items-center">
          
          {/* Logo superior */}
          <div className="mb-5 flex justify-center">
            <img src={logoMacetas} alt="Macetas Logo" className="w-16 h-16 object-contain" />
          </div>

          {/* Encabezados compactos */}
          <h2 className="text-[32px] font-bold text-zinc-900 tracking-tight text-center mb-1">
            ¡Bienvenido a Macetas!
          </h2>
          <p className="text-sm text-zinc-400 font-normal tracking-normal text-center mb-6">
            Crea tu cuenta.
          </p>

          <form onSubmit={handleSubmit(onRegister)} className="w-full flex flex-col gap-4">
            
            {/* Campo Nombre */}
            <div className="w-full flex flex-col items-start gap-1.5">
              <label className="text-sm font-semibold text-zinc-700 pl-0.5 tracking-tight" htmlFor="nombre">
                Nombre
              </label>
              <Input
                id="nombre"
                type="text"
                className="h-11 w-full rounded-lg border border-zinc-400 bg-white/90 px-3.5 text-sm font-normal text-zinc-900 placeholder:text-zinc-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/20 focus-visible:border-primary-700 transition-all duration-200 shadow-inner"
                style={errors.nombre ? { borderColor: '#ef4444' } : {}}
                placeholder="Ingresa tu nombre"
                onKeyDown={blockNonLetters}
                {...register("nombre", {
                  required: "El nombre es obligatorio.",
                  pattern: lettersPattern,
                  minLength: { value: 2, message: "El nombre debe tener al menos 2 caracteres." },
                  maxLength: { value: 50, message: "El nombre no puede tener más de 50 caracteres." },
                  validate: (v) => v.trim().length >= 2 || "El nombre no puede estar vacío."
                })}
              />
              {errors.nombre && (
                <span className="text-red-600 text-[11px] font-medium mt-0.5 pl-1">{errors.nombre.message}</span>
              )}
            </div>

            {/* Campo Apellido */}
            <div className="w-full flex flex-col items-start gap-1.5">
              <label className="text-sm font-semibold text-zinc-700 pl-0.5 tracking-tight" htmlFor="lastName">
                Apellido
              </label>
              <Input
                id="lastName"
                type="text"
                className="h-11 w-full rounded-lg border border-zinc-400 bg-white/90 px-3.5 text-sm font-normal text-zinc-900 placeholder:text-zinc-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/20 focus-visible:border-primary-700 transition-all duration-200 shadow-inner"
                style={errors.lastName ? { borderColor: '#ef4444' } : {}}
                placeholder="Ingresa tu apellido"
                onKeyDown={blockNonLetters}
                {...register("lastName", {
                  required: "El apellido es obligatorio.",
                  pattern: lettersPattern,
                  minLength: { value: 2, message: "El apellido debe tener al menos 2 caracteres." },
                  maxLength: { value: 50, message: "El apellido no puede tener más de 50 caracteres." },
                  validate: (v) => v.trim().length >= 2 || "El apellido no puede estar vacío."
                })}
              />
              {errors.lastName && (
                <span className="text-red-600 text-[11px] font-medium mt-0.5 pl-1">{errors.lastName.message}</span>
              )}
            </div>

            {/* Campo Teléfono */}
            <div className="w-full flex flex-col items-start gap-1.5">
              <label className="text-sm font-semibold text-zinc-700 pl-0.5 tracking-tight" htmlFor="phone">
                Teléfono
              </label>
              {/* Selector de prefijo internacional: +503 (El Salvador) por defecto */}
              <Controller
                name="phone"
                control={control}
                defaultValue=""
                rules={{
                  required: "El teléfono es obligatorio.",
                  validate: (v) => !v || isValidPhoneNumber(v) || "Número de teléfono inválido para ese país."
                }}
                render={({ field: { onChange, value } }) => (
                  <PhoneInput
                    id="phone"
                    international
                    defaultCountry="SV"
                    countryCallingCodeEditable={false}
                    labels={es}
                    placeholder="7000-0000"
                    value={value}
                    onChange={onChange}
                    className={`flex w-full h-11 rounded-lg border bg-white/90 px-3.5 shadow-inner transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-700/20 focus-within:border-primary-700 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-zinc-900 [&_.PhoneInputInput]:focus:outline-none ${errors.phone ? "border-red-500" : "border-zinc-400"}`}
                  />
                )}
              />
              {errors.phone && (
                <span className="text-red-600 text-[11px] font-medium mt-0.5 pl-1">{errors.phone.message}</span>
              )}
            </div>

            {/* Campo Dirección */}
            <div className="w-full flex flex-col items-start gap-1.5">
              <label className="text-sm font-semibold text-zinc-700 pl-0.5 tracking-tight" htmlFor="address">
                Dirección
              </label>
              <Input
                id="address"
                type="text"
                className="h-11 w-full rounded-lg border border-zinc-400 bg-white/90 px-3.5 text-sm font-normal text-zinc-900 placeholder:text-zinc-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/20 focus-visible:border-primary-700 transition-all duration-200 shadow-inner"
                style={errors.address ? { borderColor: '#ef4444' } : {}}
                placeholder="Ingresa tu dirección"
                {...register("address", {
                  required: "La dirección es obligatoria.",
                  minLength: { value: 5, message: "La dirección debe tener al menos 5 caracteres." },
                  maxLength: { value: 150, message: "La dirección no puede tener más de 150 caracteres." }
                })}
              />
              {errors.address && (
                <span className="text-red-600 text-[11px] font-medium mt-0.5 pl-1">{errors.address.message}</span>
              )}
            </div>

            {/* Campo Email */}
            <div className="w-full flex flex-col items-start gap-1.5">
              <label className="text-sm font-semibold text-zinc-700 pl-0.5 tracking-tight" htmlFor="email">
                Correo Electrónico
              </label>
              <Input
                id="email"
                type="email"
                className="h-11 w-full rounded-lg border border-zinc-400 bg-white/90 px-3.5 text-sm font-normal text-zinc-900 placeholder:text-zinc-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/20 focus-visible:border-primary-700 transition-all duration-200 shadow-inner"
                style={errors.email ? { borderColor: '#ef4444' } : {}}
                placeholder="Ingresa tu correo electrónico"
                {...register("email", { 
                  required: "El correo electrónico es obligatorio.",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "El formato de correo no es válido." }
                })}
              />
              {errors.email && (
                <span className="text-red-600 text-[11px] font-medium mt-0.5 pl-1">{errors.email.message}</span>
              )}
            </div>

            {/* Campo Password */}
            <div className="w-full flex flex-col items-start gap-1.5">
              <label className="text-sm font-semibold text-zinc-700 pl-0.5 tracking-tight" htmlFor="password">
                Contraseña
              </label>
              <div className="w-full relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="h-11 w-full rounded-lg border border-zinc-400 bg-white/90 pl-3.5 pr-11 text-sm font-normal text-zinc-900 placeholder:text-zinc-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/20 focus-visible:border-primary-700 transition-all duration-200 shadow-inner"
                  style={errors.password ? { borderColor: '#ef4444' } : {}}
                  placeholder="Crea una contraseña"
                  {...register("password", { 
                    required: "La contraseña es obligatoria.",
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-])[A-Za-z\d@$!%*?&#._-]{8,20}$/,
                      message: "Debe tener de 8 a 20 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&#._-)."
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-800 hover:text-zinc-900 transition-colors p-1"
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

            {/* Campo Código de Referido (opcional) */}
            <div className="w-full flex flex-col items-start gap-1.5">
              <label className="text-sm font-semibold text-zinc-700 pl-0.5 tracking-tight" htmlFor="referralCode">
                Código de referido <span className="text-zinc-400 font-normal">(opcional)</span>
              </label>
              <Input
                id="referralCode"
                type="text"
                className="h-11 w-full rounded-lg border border-zinc-400 bg-white/90 px-3.5 text-sm font-normal text-zinc-900 placeholder:text-zinc-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700/20 focus-visible:border-primary-700 transition-all duration-200 shadow-inner uppercase"
                placeholder="M503-XXXXXX"
                {...register("referralCode")}
              />
              <span className="text-zinc-400 text-[11px] mt-0.5 pl-1">
                ¿Un amigo te invitó? Escribe su código y él ganará hojas cuando hagas tu primera compra.
              </span>
            </div>

            {/* Botón Principal */}
            <Button 
              type="submit" 
              className="w-full h-11 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm tracking-tight transition-all duration-150 active:scale-[0.99] shadow-md mt-3 cursor-pointer"
            >
              Registrarse
            </Button>
          </form>

          {/* Divisor */}
          <div className="w-full flex items-center justify-between my-5 px-1">
            <span className="w-[42%] h-[1px] bg-zinc-400/70" />
            <span className="text-xs text-zinc-500 font-medium tracking-normal">o</span>
            <span className="w-[42%] h-[1px] bg-zinc-400/70" />
          </div>

          {/* Botón de Google */}
          <Button 
            type="button" 
            variant="outline"
            className="w-full h-11 rounded-lg border border-zinc-400 bg-transparent text-zinc-800 font-medium text-sm tracking-tight hover:bg-zinc-200/50 transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <GoogleIcon />
            Regístrate con Google
          </Button>

          {/* Enlace inferior de alternancia */}
          <p className="text-xs text-zinc-500 font-normal mt-6 text-center tracking-normal">
            ¿Ya tienes una cuenta?{" "}
            <span 
              onClick={() => navigate("/login")} 
              className="text-[#1b5e3a] font-semibold hover:underline cursor-pointer transition-all"
            >
              Inicia sesión
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}
