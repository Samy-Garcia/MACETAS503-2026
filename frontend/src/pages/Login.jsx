import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import logoMacetas from "../assets/logoMacetas.png";
import GoogleIcon from "../assets/GoogleIcon";
import { useAuthForm } from "../hooks/useAuthForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useGoogleLogin } from "@react-oauth/google";
import { loginGoogleRequest } from "../api/authApi";

export default function Login() {

  useEffect(() => {
        document.title = "Inicio de Sesión | Macetas503";
    }, []);

  const [showPassword, setShowPassword] = useState(false);

  // GOOGLE TERMS
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // TOAST DE ÉXITO
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const { register, handleSubmit, errors, onLogin, navigate } = useAuthForm();

  // useGoogleLogin abre un popup real de Google al hacer clic, sin depender
  // de que se renderice un botón invisible de Google en el DOM (el método
  // anterior -clickear un <GoogleLogin> escondido con querySelector- fallaba
  // en silencio si ese botón no llegaba a cargar).
  //
  // Al tener éxito, intentamos el login directo con el access_token, SIN
  // forzar acceptedTerms todavía. Si el cliente ya existe (o ya aceptó
  // antes), el backend responde 200 y navegamos directo, sin mostrar el
  // modal. Si el backend rechaza por falta de términos (usuario nuevo,
  // error 400), recién ahí mostramos el modal de términos y condiciones.
  const googleLoginPopup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      setGoogleAccessToken(accessToken);

      try {

        const data = await loginGoogleRequest(accessToken, false);

        console.log("Backend:", data);

        setShowSuccessToast(true);
        setTimeout(() => navigate("/"), 1200);

      } catch (error) {

        if (error?.status === 400) {
          setShowTerms(true);
        } else {
          console.log(error);
        }

      }
    },
    onError: () => {
      console.log("Error al iniciar sesión con Google");
    }
  });

  // Se ejecuta cuando el usuario da clic en "Continuar" dentro del modal
  // (usuario nuevo que ya marcó el checkbox de términos).
  const continueGoogleLogin = async () => {

    try {

        const data = await loginGoogleRequest(
            googleAccessToken,
            acceptedTerms
        );

        console.log("Backend:", data);

        setShowTerms(false);
        setShowSuccessToast(true);
        setTimeout(() => navigate("/"), 1200);

    } catch (error) {

        console.log(error);

    }

  };


  // Referencia para capturar el movimiento solo en la sección izquierda
  const leftPanelRef = useRef(null);

  // MotionValues para las coordenadas del ratón
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Suavizado físico de resortes (Springs)
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 25 });

  // Mapeo a posiciones porcentuales para la luz interactiva
  const lightPositionX = useTransform(smoothX, [0, 1], ["10%", "90%"]);
  const lightPositionY = useTransform(smoothY, [0, 1], ["10%", "90%"]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!leftPanelRef.current) return;
      
      // Obtener dimensiones del panel izquierdo
      const rect = leftPanelRef.current.getBoundingClientRect();
      
      // Calcular posición del cursor relativa ÚNICAMENTE al panel izquierdo
      const xPercentage = (event.clientX - rect.left) / rect.width;
      const yPercentage = (event.clientY - rect.top) / rect.height;

      // Actualizar si el cursor está dentro de los límites visuales del panel
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

      <Toast show={showSuccessToast} />

      {/* SECCIÓN IZQUIERDA: Gradiente Verde Oscuro Interactivo */}
      <div 
        ref={leftPanelRef}
        className="hidden md:flex md:w-1/2 relative bg-[#042a16] p-16 flex-col justify-end overflow-hidden"
      >
        {/* Luz Interactiva Suave que sigue al cursor (motion.div) */}
        <motion.div
          className="absolute w-[45vw] h-[45vw] rounded-full bg-surface opacity-[0.12] blur-[100px] pointer-events-none z-0"
          style={{
            left: lightPositionX,
            top: lightPositionY,
            translateX: "-50%",
            translateY: "-50%",
          }}
        />

        {/* Luces difuminadas estáticas del boceto original para dar profundidad */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#2a5c3a] opacity-40 blur-[130px] z-0" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#609973] opacity-25 blur-[110px] z-0" />
        
        {/* Eslogan inferior exacto del boceto */}
        <h1 className="text-white text-[56px] font-bold leading-[1.1] tracking-tight relative z-10 font-sans">
          Tu jardín<br />empieza aquí.
        </h1>
      </div>

      {/* SECCIÓN DERECHA: Formulario Estilo Panel Claro Limpio */}
      <div className="w-full md:w-1/2 bg-page flex items-center justify-center p-8 sm:p-12 lg:p-20 relative z-10">
        <div className="w-full max-w-[420px] flex flex-col items-center">
          
          {/* Logo superior */}
          <div className="mb-6 flex justify-center">
            <img src={logoMacetas} alt="Macetas Logo" className="w-16 h-16 object-contain" />
          </div>

          {/* Encabezados - Poppins con espaciado hiper compacto */}
          <h2 className="text-[32px] font-bold text-zinc-900 tracking-tight text-center mb-1">
            ¡Bienvenido a Macetas!
          </h2>
          <p className="text-sm text-zinc-400 font-normal tracking-normal text-center mb-8">
            Ingresa a tu cuenta.
          </p>

          <form onSubmit={handleSubmit(onLogin)} className="w-full flex flex-col gap-5">
            
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
                  pattern: { value: /^\S+@\S+$/i, message: "El formato de correo no es válido." }
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
                  placeholder="Ingresa tu contraseña"
                  {...register("password", { 
                    required: "La contraseña es obligatoria." 
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

            {/* Botón Principal - Verde Oscuro Orgánico */}
            <Button 
              type="submit" 
              className="w-full h-11 rounded-lg bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm tracking-tight transition-all duration-150 active:scale-[0.99] shadow-md mt-2 cursor-pointer"
            >
              Iniciar sesión
            </Button>
          </form>

          {/* Enlace de contraseña olvidada */}
          <p 
            onClick={() => navigate("/forgot-password")} 
            className="text-xs text-zinc-700 font-medium tracking-tight mt-4 hover:underline cursor-pointer self-end"
          >
            ¿Olvidaste tu contraseña?
          </p>

          {/* Divisor "O" estilizado */}
          <div className="w-full flex items-center justify-between my-6 px-1">
            <span className="w-[42%] h-[1px] bg-zinc-400/70" />
            <span className="text-xs text-zinc-500 font-medium tracking-normal">o</span>
            <span className="w-[42%] h-[1px] bg-zinc-400/70" />
          </div>

          {/* google */}
          <div className="relative w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => googleLoginPopup()}
              className="w-full h-11 rounded-lg border border-zinc-400 bg-transparent text-zinc-800 font-medium text-sm tracking-tight hover:bg-zinc-200/50 transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <GoogleIcon />
              Ingresa con Google
            </Button>
          </div>
          {/* googleee */}

          {showTerms && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

              <div className="bg-page rounded-xl p-7 w-[420px] shadow-2xl border border-zinc-300">

                <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-3">
                  Políticas de la tienda
                </h2>

                <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
                  Para crear tu cuenta en Macetas debes aceptar
                  los términos y condiciones y la política de privacidad.
                </p>

                <div className="flex items-center gap-2.5 mb-7">

                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) =>
                      setAcceptedTerms(e.target.checked)
                    }
                    className="w-4 h-4 rounded border-zinc-400 text-primary-700 focus:ring-primary-700/30 cursor-pointer accent-primary-700"
                  />

                  <span className="text-sm text-zinc-700 tracking-tight">
                    Acepto los términos y condiciones
                  </span>

                </div>

                <div className="flex justify-end gap-3">

                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTerms(false);
                      setAcceptedTerms(false);
                      setGoogleAccessToken(null);
                    }}
                    className="h-10 rounded-lg border border-zinc-400 bg-transparent text-zinc-700 font-medium text-sm tracking-tight hover:bg-zinc-200/60 transition-all duration-150 cursor-pointer"
                  >
                    Cancelar
                  </Button>

                  <Button
                    disabled={!acceptedTerms}
                    onClick={continueGoogleLogin}
                    className="h-10 rounded-lg bg-primary-700 hover:bg-primary-800 disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-medium text-sm tracking-tight transition-all duration-150 cursor-pointer"
                  >
                    Continuar
                  </Button>

                </div>

              </div>

            </div>
          )}

          {/* Enlace de Registro inferior */}
          <p className="text-xs text-zinc-500 font-normal mt-8 text-center tracking-normal">
            ¿No tienes cuenta?{" "}
            <span 
              onClick={() => navigate("/register")} 
              className="text-[#1b5e3a] font-semibold hover:underline cursor-pointer transition-all"
            >
              Registrarse
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}
