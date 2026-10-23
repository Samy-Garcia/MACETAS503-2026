import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export default function InteractiveGradient({ children }) {
  const ref = useRef(null);

  // 1. Usamos MotionValues para guardar las coordenadas del ratón
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 2. Creamos resortes (springs) para suavizar el movimiento de la luz
  // stiffness: 150 (firmeza), damping: 25 (amortiguación) - Físicas tipo Apple
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 25 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 25 });

  // 3. Transformamos las coordenadas suaves en posiciones porcentuales para la luz
  const lightPositionX = useTransform(smoothX, [0, 1], ["20%", "80%"]);
  const lightPositionY = useTransform(smoothY, [0, 1], ["20%", "80%"]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!ref.current) return;
      const { clientX, clientY } = event;
      
      // Calculamos la posición del ratón relativa a la ventana (0 a 1)
      const xPercentage = clientX / window.innerWidth;
      const yPercentage = clientY / window.innerHeight;

      // Actualizamos los MotionValues
      mouseX.set(xPercentage);
      mouseY.set(yPercentage);
    };

    // Escuchamos el movimiento del ratón en toda la ventana
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div ref={ref} className="min-h-screen w-full relative bg-[#2a5c3a] overflow-hidden">
      
      {/* Luz Interactiva Suave (Efecto "Luz que sigue") */}
      <motion.div
        className="absolute w-[50vw] h-[50vw] rounded-full bg-white opacity-20 blur-[100px] pointer-events-none z-0"
        style={{
          left: lightPositionX,
          top: lightPositionY,
          translateX: "-50%", // Centrar la luz en el cursor
          translateY: "-50%",
        }}
      />

      {/* Círculos de luz estáticos del boceto original (para mantener la profundidad) */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#7bb38e] opacity-40 blur-[120px] z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#a3d9b7] opacity-30 blur-[100px] z-0" />

      {/* Contenido (la tarjeta) - Aseguramos que esté por encima de las luces */}
      <div className="relative z-10 w-full flex items-center justify-center min-h-screen">
        {children}
      </div>
    </div>
  );
}