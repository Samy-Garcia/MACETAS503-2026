import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Carga una fuente de Google Fonts dinámicamente (misma lógica que en el
// admin) para que el título/subtítulo se vean con la tipografía real que
// eligió el admin, no solo con el nombre.
const cargarGoogleFont = (nombreFuente) => {
  if (!nombreFuente || !nombreFuente.trim()) return;
  const id = `google-font-${nombreFuente.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(id)) return;

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(nombreFuente).replace(/%20/g, "+")}:wght@400;700&display=swap`;
  document.head.appendChild(link);
};

// Carrusel del hero del inicio. Si el admin no ha subido ninguna imagen
// todavía, se muestra "fallbackImage" (la imagen fija de siempre) para que
// el hero nunca se vea vacío. Cada imagen puede tener opcionalmente un
// título, subtítulo y botón "Comprar ahora" superpuestos, con su propia
// tipografía (cualquier fuente de Google Fonts) y posición libre sobre la
// imagen (configurables desde Ajustes → Carrusel del inicio en el admin).
export default function HeroCarousel({ images, fallbackImage, altText }) {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const slides = images && images.length > 0 ? images : null;

  useEffect(() => {
    setCurrent(0);
  }, [slides]);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timerRef.current);
  }, [slides]);

  // Precarga la fuente de cada imagen que la tenga configurada, para que no
  // haya un salto visual (texto sin estilo -> con estilo) al cambiar de
  // slide. Título, subtítulo y cada botón pueden tener una fuente distinta.
  useEffect(() => {
    if (!slides) return;
    slides.forEach((img) => {
      cargarGoogleFont(img.titleFontFamily || img.fontFamily);
      cargarGoogleFont(img.subtitleFontFamily || img.fontFamily);
      (img.buttons || []).forEach(b => cargarGoogleFont(b.fontFamily));
    });
  }, [slides]);

  const goTo = (index) => {
    clearInterval(timerRef.current);
    setCurrent(index);
  };

  const goToPrev = () => {
    if (!slides) return;
    goTo((current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    if (!slides) return;
    goTo((current + 1) % slides.length);
  };

  const irAEnlace = (link) => {
    if (!link) return;
    // Un enlace externo (http/https) navega afuera; uno interno (/ruta)
    // usa el router de la SPA para no recargar toda la página.
    if (/^https?:\/\//i.test(link)) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      navigate(link);
    }
  };

  if (!slides) {
    return (
      <div className="w-full h-[520px] relative overflow-hidden bg-zinc-200">
        <img
          src={fallbackImage}
          alt={altText}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>
    );
  }

  const slideActual = slides[current];
  const botonesActuales = slideActual.buttons && slideActual.buttons.length > 0
    ? slideActual.buttons
    // Respaldo: imágenes configuradas con la versión anterior (un solo
    // botón, buttonText/buttonLink) siguen mostrando ese botón igual.
    : (slideActual.buttonText ? [{
        text: slideActual.buttonText,
        link: slideActual.buttonLink,
        fontFamily: slideActual.buttonFontFamily || slideActual.fontFamily,
        positionX: slideActual.textPositionX ?? 50,
        positionY: (slideActual.textPositionY ?? 50) + 15
      }] : []);

  const tieneTexto = slideActual.title || slideActual.subtitle || botonesActuales.length > 0;

  const fuenteTitulo = slideActual.titleFontFamily || slideActual.fontFamily;
  const fuenteSubtitulo = slideActual.subtitleFontFamily || slideActual.fontFamily;
  const estiloTitulo = fuenteTitulo ? { fontFamily: `"${fuenteTitulo}", sans-serif` } : {};
  const estiloSubtitulo = fuenteSubtitulo ? { fontFamily: `"${fuenteSubtitulo}", sans-serif` } : {};

  const posTitulo = { x: slideActual.titlePositionX ?? slideActual.textPositionX ?? 50, y: slideActual.titlePositionY ?? slideActual.textPositionY ?? 35 };
  const posSubtitulo = { x: slideActual.subtitlePositionX ?? slideActual.textPositionX ?? 50, y: slideActual.subtitlePositionY ?? slideActual.textPositionY ?? 50 };

  return (
    <div className="w-full h-[520px] relative overflow-hidden bg-zinc-200">
      {slides.map((img, index) => (
        <div
          key={img.public_id || index}
          role="img"
          aria-label={`${altText} ${index + 1}`}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${img.url})`,
            backgroundSize: `${img.imageZoom ?? 100}%`,
            backgroundPosition: `${img.imagePositionX ?? 50}% ${img.imagePositionY ?? 50}%`,
            backgroundRepeat: "no-repeat"
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/5" />

      {/* Texto superpuesto -- título, subtítulo y cada botón tienen su
          propia posición libre (elegida arrastrando en el admin), ya no se
          mueven pegados como un solo bloque. Se puede tener más de un
          botón por imagen. */}
      {tieneTexto && (
        <>
          <div className="absolute inset-0 bg-black/25" />

          {slideActual.title && (
            <h1
              className="absolute text-white text-3xl sm:text-5xl font-bold drop-shadow-lg text-center px-4 max-w-[90%] sm:max-w-xl"
              style={{ left: `${posTitulo.x}%`, top: `${posTitulo.y}%`, transform: "translate(-50%, -50%)", ...estiloTitulo }}
            >
              {slideActual.title}
            </h1>
          )}

          {slideActual.subtitle && (
            <p
              className="absolute text-white text-sm sm:text-lg drop-shadow text-center px-4 max-w-[90%] sm:max-w-xl"
              style={{ left: `${posSubtitulo.x}%`, top: `${posSubtitulo.y}%`, transform: "translate(-50%, -50%)", ...estiloSubtitulo }}
            >
              {slideActual.subtitle}
            </p>
          )}

          {botonesActuales.map((b, i) => (
            <button
              key={i}
              onClick={() => irAEnlace(b.link)}
              className="absolute px-6 py-2.5 bg-surface text-primary-700 font-semibold rounded-full text-sm hover:bg-zinc-100 transition-all shadow-md"
              style={{
                left: `${b.positionX ?? 50}%`,
                top: `${b.positionY ?? 65}%`,
                transform: "translate(-50%, -50%)",
                ...(b.fontFamily ? { fontFamily: `"${b.fontFamily}", sans-serif` } : {})
              }}
            >
              {b.text}
            </button>
          ))}
        </>
      )}

      {/* Flechas de navegación manual */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            aria-label="Imagen anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-surface text-primary-700 flex items-center justify-center transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            aria-label="Siguiente imagen"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-surface text-primary-700 flex items-center justify-center transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Ir a la imagen ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                index === current ? "w-6 bg-surface" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
