import React, { useEffect, useRef, useState } from 'react';

const FUENTES_SUGERIDAS = [
  'Poppins', 'Playfair Display', 'Montserrat', 'Roboto', 'Lora',
  'Merriweather', 'Raleway', 'Oswald', 'Dancing Script', 'Pacifico',
  'Nunito', 'Quicksand', 'Josefin Sans', 'Cormorant Garamond', 'Bebas Neue'
];

const cargarGoogleFont = (nombreFuente) => {
  if (!nombreFuente || !nombreFuente.trim()) return;
  const id = `google-font-${nombreFuente.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(nombreFuente).replace(/%20/g, '+')}:wght@400;700&display=swap`;
  document.head.appendChild(link);
};

const SelectorFuente = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-black/70 mb-1">{label}</label>
    <input
      type="text"
      list="fuentes-sugeridas"
      placeholder="Ej: Poppins"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-[#DCEIDA]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4B8AC] focus:border-transparent transition-all bg-[#FBE0D9]/5 text-black text-sm shadow-sm"
    />
  </div>
);

const vacioTitulo = { text: '', fontFamily: '', positionX: 50, positionY: 35 };
const vacioSubtitulo = { text: '', fontFamily: '', positionX: 50, positionY: 50 };

// Edita el texto superpuesto de UNA imagen ya subida al carrulo: título,
// subtítulo y una lista de botones (se pueden agregar varios), cada uno con
// su propia tipografía (cualquier fuente de Google Fonts) y su propia
// posición libre sobre la imagen -- cada elemento se arrastra por separado
// en la vista previa, ya no se mueven todos pegados como antes.
const EditHeroImageModal = ({ isOpen, onClose, onSave, image = null }) => {
  const [imagenPos, setImagenPos] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(100);
  const [modoMoverImagen, setModoMoverImagen] = useState(false);

  const [titulo, setTitulo] = useState(vacioTitulo);
  const [subtitulo, setSubtitulo] = useState(vacioSubtitulo);
  const [botones, setBotones] = useState([]);

  // Qué elemento se está arrastrando ahora mismo: null, 'title', 'subtitle',
  // 'image', o { type: 'button', index }
  const [arrastrando, setArrastrando] = useState(null);
  // Si el elemento que se arrastra está imantado al centro horizontal y/o
  // vertical ahora mismo (para mostrar la línea de guía punteada, como en
  // Canva) -- se calcula en cada movimiento, junto con la posición.
  const [imanX, setImanX] = useState(false);
  const [imanY, setImanY] = useState(false);
  const previewRef = useRef(null);
  // Guarda, al iniciar el arrastre, la diferencia entre dónde se hizo clic y
  // la posición actual del elemento -- así el punto exacto donde agarraste
  // el texto se queda pegado al cursor durante todo el arrastre, en vez de
  // que el CENTRO del texto salte de golpe a la posición del cursor (que es
  // justo lo que se sentía incómodo antes).
  const offsetArrastreRef = useRef({ dx: 0, dy: 0 });

  const iniciarArrastre = (tipo, posActual, e) => {
    if (!previewRef.current) return;
    // Protección: si por error se pasa un objeto sin x/y numéricos (como
    // pasó con título/subtítulo antes -- se les mandaba el objeto de
    // estado completo, con positionX/positionY, no x/y), no seguir con
    // NaN en silencio, mejor no iniciar el arrastre.
    if (typeof posActual?.x !== 'number' || typeof posActual?.y !== 'number') {
      console.warn('iniciarArrastre: posActual inválido', posActual);
      return;
    }
    // Evita que el navegador inicie su propio "arrastre nativo" de texto
    // (como cuando seleccionas texto y lo arrastras a otra ventana) -- eso
    // es lo que hacía que el mousemove personalizado dejara de recibir
    // eventos a medio arrastre, dejando el texto "pegado" sin moverse.
    if (e.cancelable && e.type === 'mousedown') e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = previewRef.current.getBoundingClientRect();
    const cursorXPct = ((clientX - rect.left) / rect.width) * 100;
    const cursorYPct = ((clientY - rect.top) / rect.height) * 100;
    offsetArrastreRef.current = {
      dx: posActual.x - cursorXPct,
      dy: posActual.y - cursorYPct
    };
    setArrastrando(tipo);
  };

  useEffect(() => {
    if (!isOpen || !image) return;
    setImagenPos({
      x: image.imagePositionX ?? 50,
      y: image.imagePositionY ?? 50
    });
    setZoom(image.imageZoom ?? 100);
    setModoMoverImagen(false);
    setTitulo({
      text: image.title || '',
      fontFamily: image.titleFontFamily || image.fontFamily || '',
      positionX: image.titlePositionX ?? image.textPositionX ?? 50,
      positionY: image.titlePositionY ?? image.textPositionY ?? 35
    });
    setSubtitulo({
      text: image.subtitle || '',
      fontFamily: image.subtitleFontFamily || image.fontFamily || '',
      positionX: image.subtitlePositionX ?? image.textPositionX ?? 50,
      positionY: image.subtitlePositionY ?? image.textPositionY ?? 50
    });
    // Respaldo: si la imagen todavía tiene el botón único de la versión
    // anterior (buttonText) y no tiene la lista nueva, se convierte en el
    // primer botón de la lista, para no perderlo.
    if (image.buttons && image.buttons.length > 0) {
      setBotones(image.buttons.map(b => ({
        text: b.text || '', link: b.link || '', fontFamily: b.fontFamily || '',
        positionX: b.positionX ?? 50, positionY: b.positionY ?? 65
      })));
    } else if (image.buttonText) {
      setBotones([{
        text: image.buttonText, link: image.buttonLink || '', fontFamily: image.buttonFontFamily || image.fontFamily || '',
        positionX: image.textPositionX ?? 50, positionY: (image.textPositionY ?? 50) + 15
      }]);
    } else {
      setBotones([]);
    }
  }, [isOpen, image]);

  useEffect(() => {
    cargarGoogleFont(titulo.fontFamily);
    cargarGoogleFont(subtitulo.fontFamily);
    botones.forEach(b => cargarGoogleFont(b.fontFamily));
  }, [titulo.fontFamily, subtitulo.fontFamily, botones]);

  // Arrastre: escucha el movimiento en toda la ventana mientras haya algo
  // seleccionado para arrastrar, y actualiza SOLO ese elemento (título,
  // subtítulo, o el botón correspondiente por índice).
  useEffect(() => {
    if (!arrastrando) return;

    const UMBRAL_IMAN = 3; // porcentaje de cercanía al centro para imantarse

    const calcularPosicion = (clientX, clientY) => {
      if (!previewRef.current) return null;
      const rect = previewRef.current.getBoundingClientRect();
      const cursorXPct = ((clientX - rect.left) / rect.width) * 100;
      const cursorYPct = ((clientY - rect.top) / rect.height) * 100;
      let x = cursorXPct + offsetArrastreRef.current.dx;
      let y = cursorYPct + offsetArrastreRef.current.dy;

      const cercaCentroX = Math.abs(x - 50) < UMBRAL_IMAN;
      const cercaCentroY = Math.abs(y - 50) < UMBRAL_IMAN;
      if (cercaCentroX) x = 50;
      if (cercaCentroY) y = 50;
      setImanX(cercaCentroX);
      setImanY(cercaCentroY);

      return {
        x: Math.max(2, Math.min(98, x)),
        y: Math.max(4, Math.min(96, y))
      };
    };

    const aplicar = (pos) => {
      if (!pos) return;
      if (arrastrando === 'title') {
        setTitulo(prev => ({ ...prev, positionX: pos.x, positionY: pos.y }));
      } else if (arrastrando === 'subtitle') {
        setSubtitulo(prev => ({ ...prev, positionX: pos.x, positionY: pos.y }));
      } else if (arrastrando === 'image') {
        setImagenPos({ x: pos.x, y: pos.y });
      } else if (arrastrando?.type === 'button') {
        setBotones(prev => prev.map((b, i) => i === arrastrando.index ? { ...b, positionX: pos.x, positionY: pos.y } : b));
      }
    };

    const handleMouseMove = (e) => aplicar(calcularPosicion(e.clientX, e.clientY));
    const handleTouchMove = (e) => {
      if (e.touches?.[0]) aplicar(calcularPosicion(e.touches[0].clientX, e.touches[0].clientY));
    };
    const detener = () => {
      setArrastrando(null);
      setImanX(false);
      setImanY(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', detener);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', detener);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', detener);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', detener);
    };
  }, [arrastrando]);

  if (!isOpen || !image) return null;

  const handleGuardar = (e) => {
    e.preventDefault();
    onSave({
      imagePositionX: imagenPos.x,
      imagePositionY: imagenPos.y,
      imageZoom: zoom,
      title: titulo.text,
      titleFontFamily: titulo.fontFamily,
      titlePositionX: titulo.positionX,
      titlePositionY: titulo.positionY,
      subtitle: subtitulo.text,
      subtitleFontFamily: subtitulo.fontFamily,
      subtitlePositionX: subtitulo.positionX,
      subtitlePositionY: subtitulo.positionY,
      buttons: botones.filter(b => b.text.trim() !== '')
    });
  };

  const agregarBoton = () => {
    setBotones(prev => [...prev, { text: 'Comprar ahora', link: '', fontFamily: '', positionX: 50, positionY: Math.min(90, 50 + prev.length * 12) }]);
  };

  const actualizarBoton = (index, campo, valor) => {
    setBotones(prev => prev.map((b, i) => i === index ? { ...b, [campo]: valor } : b));
  };

  const eliminarBoton = (index) => {
    setBotones(prev => prev.filter((_, i) => i !== index));
  };

  const estiloTitulo = titulo.fontFamily ? { fontFamily: `"${titulo.fontFamily}", sans-serif` } : {};
  const estiloSubtitulo = subtitulo.fontFamily ? { fontFamily: `"${subtitulo.fontFamily}", sans-serif` } : {};

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="fixed inset-0 pointer-events-auto bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl shadow-[#8E929B]/20 w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto">
          <div className="border-b border-[#DCEIDA]/30 px-6 py-4 sticky top-0 bg-white z-10 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-black">EDITAR TEXTO DE LA IMAGEN</h2>
          </div>

          <form onSubmit={handleGuardar} className="p-6 space-y-4">
            {/* Vista previa -- título, subtítulo y cada botón se arrastran
                por separado, cada uno con su propio recuadro punteado al
                pasar el mouse para que se note que se puede mover solo.
                También se puede reencuadrar la imagen en sí (posición y
                zoom), activando el modo "Mover imagen". */}
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                <label className="block text-sm font-medium text-black">
                  Vista previa <span className="text-black/40 font-normal">(arrastra cada elemento para moverlo por separado)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setModoMoverImagen(prev => !prev)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                    modoMoverImagen ? 'bg-[#A4B8AC] text-white' : 'bg-[#DCEIDA]/40 text-black/60 hover:bg-[#DCEIDA]/70'
                  }`}
                >
                  {modoMoverImagen ? '✓ Moviendo la imagen' : '🖼 Mover imagen'}
                </button>
              </div>

              {modoMoverImagen && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-black/50 shrink-0">Zoom</span>
                  <input
                    type="range"
                    min="100"
                    max="200"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 accent-[#A4B8AC]"
                  />
                  <span className="text-xs text-black/50 w-10 text-right shrink-0">{zoom}%</span>
                </div>
              )}

              <div
                ref={previewRef}
                onMouseDown={(e) => modoMoverImagen && iniciarArrastre('image', imagenPos, e)}
                onTouchStart={(e) => modoMoverImagen && iniciarArrastre('image', imagenPos, e)}
                className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black/5 select-none ${modoMoverImagen ? 'cursor-move ring-2 ring-[#A4B8AC]' : ''}`}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${image.url})`,
                    backgroundSize: `${zoom}%`,
                    backgroundPosition: `${imagenPos.x}% ${imagenPos.y}%`,
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                {(titulo.text || subtitulo.text || botones.some(b => b.text)) && (
                  <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                )}

                {/* Líneas de guía (como en Canva): aparecen cuando el
                    elemento que se arrastra queda cerca del centro,
                    horizontal o verticalmente, y "imantan" la posición
                    exacta al 50% para que sea fácil centrar el texto. */}
                {arrastrando && imanX && (
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#ECB7B3] pointer-events-none" style={{ transform: 'translateX(-50%)' }} />
                )}
                {arrastrando && imanY && (
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-[#ECB7B3] pointer-events-none" style={{ transform: 'translateY(-50%)' }} />
                )}

                <div className={modoMoverImagen ? 'pointer-events-none' : ''}>
                {titulo.text && (
                  <div
                    draggable={false}
                    onMouseDown={(e) => iniciarArrastre('title', { x: titulo.positionX, y: titulo.positionY }, e)}
                    onTouchStart={(e) => iniciarArrastre('title', { x: titulo.positionX, y: titulo.positionY }, e)}
                    className={`absolute cursor-move px-2 py-1 rounded border border-dashed ${arrastrando === 'title' ? 'border-white' : 'border-transparent hover:border-white/60'}`}
                    style={{ left: `${titulo.positionX}%`, top: `${titulo.positionY}%`, transform: 'translate(-50%, -50%)', maxWidth: '85%' }}
                  >
                    <h3 className="text-white text-lg font-bold drop-shadow text-center" style={estiloTitulo}>{titulo.text}</h3>
                  </div>
                )}

                {subtitulo.text && (
                  <div
                    draggable={false}
                    onMouseDown={(e) => iniciarArrastre('subtitle', { x: subtitulo.positionX, y: subtitulo.positionY }, e)}
                    onTouchStart={(e) => iniciarArrastre('subtitle', { x: subtitulo.positionX, y: subtitulo.positionY }, e)}
                    className={`absolute cursor-move px-2 py-1 rounded border border-dashed ${arrastrando === 'subtitle' ? 'border-white' : 'border-transparent hover:border-white/60'}`}
                    style={{ left: `${subtitulo.positionX}%`, top: `${subtitulo.positionY}%`, transform: 'translate(-50%, -50%)', maxWidth: '85%' }}
                  >
                    <p className="text-white text-xs drop-shadow text-center" style={estiloSubtitulo}>{subtitulo.text}</p>
                  </div>
                )}

                {botones.map((b, i) => b.text && (
                  <div
                    key={i}
                    draggable={false}
                    onMouseDown={(e) => iniciarArrastre({ type: 'button', index: i }, { x: b.positionX, y: b.positionY }, e)}
                    onTouchStart={(e) => iniciarArrastre({ type: 'button', index: i }, { x: b.positionX, y: b.positionY }, e)}
                    className={`absolute cursor-move rounded border border-dashed ${arrastrando?.type === 'button' && arrastrando.index === i ? 'border-white' : 'border-transparent hover:border-white/60'}`}
                    style={{ left: `${b.positionX}%`, top: `${b.positionY}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <span
                      className="inline-block px-3 py-1.5 bg-white text-black text-xs font-semibold rounded-full"
                      style={b.fontFamily ? { fontFamily: `"${b.fontFamily}", sans-serif` } : {}}
                    >
                      {b.text}
                    </span>
                  </div>
                ))}
                </div>
              </div>
            </div>

            {/* Título */}
            <div className="border border-[#DCEIDA]/30 rounded-xl p-3 space-y-3">
              <label className="block text-sm font-medium text-black">Título</label>
              <input
                type="text"
                placeholder="Ej: Nueva colección de macetas"
                maxLength={60}
                value={titulo.text}
                onChange={(e) => setTitulo(prev => ({ ...prev, text: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#DCEIDA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A4B8AC] focus:border-transparent transition-all bg-[#FBE0D9]/5 text-black shadow-sm"
              />
              <SelectorFuente label="Tipografía del título" value={titulo.fontFamily} onChange={(v) => setTitulo(prev => ({ ...prev, fontFamily: v }))} />
            </div>

            {/* Subtítulo */}
            <div className="border border-[#DCEIDA]/30 rounded-xl p-3 space-y-3">
              <label className="block text-sm font-medium text-black">Subtítulo</label>
              <input
                type="text"
                placeholder="Ej: Dale vida a tu hogar"
                maxLength={100}
                value={subtitulo.text}
                onChange={(e) => setSubtitulo(prev => ({ ...prev, text: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#DCEIDA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A4B8AC] focus:border-transparent transition-all bg-[#FBE0D9]/5 text-black shadow-sm"
              />
              <SelectorFuente label="Tipografía del subtítulo" value={subtitulo.fontFamily} onChange={(v) => setSubtitulo(prev => ({ ...prev, fontFamily: v }))} />
            </div>

            {/* Botones (0 o varios) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-black">Botones</label>
                <button
                  type="button"
                  onClick={agregarBoton}
                  className="text-xs font-semibold text-[#5f7568] hover:text-[#3f4f45] transition-colors"
                >
                  + Agregar botón
                </button>
              </div>

              {botones.length === 0 && (
                <p className="text-xs text-black/40">Todavía no hay ningún botón en esta imagen.</p>
              )}

              <div className="space-y-3">
                {botones.map((b, i) => (
                  <div key={i} className="border border-[#DCEIDA]/30 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-black/50">Botón {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => eliminarBoton(i)}
                        className="text-xs font-semibold text-[#ECB7B3] hover:text-red-500 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Texto (Ej: Comprar ahora)"
                      maxLength={30}
                      value={b.text}
                      onChange={(e) => actualizarBoton(i, 'text', e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#DCEIDA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A4B8AC] focus:border-transparent transition-all bg-[#FBE0D9]/5 text-black shadow-sm"
                    />
                    <input
                      type="text"
                      placeholder="URL (Ej: /macetas o https://instagram.com/tuusuario)"
                      value={b.link}
                      onChange={(e) => actualizarBoton(i, 'link', e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#DCEIDA]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A4B8AC] focus:border-transparent transition-all bg-[#FBE0D9]/5 text-black text-sm shadow-sm"
                    />
                    <SelectorFuente label="Tipografía del botón" value={b.fontFamily} onChange={(v) => actualizarBoton(i, 'fontFamily', v)} />
                  </div>
                ))}
              </div>
            </div>

            <datalist id="fuentes-sugeridas">
              {FUENTES_SUGERIDAS.map(f => <option key={f} value={f} />)}
            </datalist>
            <p className="text-xs text-black/40">
              Las URL pueden ser internas de la tienda (Ej: /macetas, /velas, /ofertas) o externas (Ej: https://instagram.com/tuusuario).
              Las tipografías escritas deben coincidir exactamente con el nombre en{' '}
              <a href="https://fonts.google.com" target="_blank" rel="noreferrer" className="underline hover:text-black">
                fonts.google.com
              </a>.
            </p>

            <div className="flex justify-end space-x-3 pt-4 border-t border-[#DCEIDA]/30">
              <button type="button" onClick={onClose} className="px-6 py-2.5 border border-[#DCEIDA]/30 rounded-xl text-black hover:bg-[#FBE0D9] hover:border-[#ECB7B3] transition-all font-medium uppercase tracking-wide">
                Cancelar
              </button>
              <button type="submit" className="px-6 py-2.5 bg-[#ECB7B3] text-white rounded-xl hover:bg-[#A4B8AC] transition-all font-medium uppercase tracking-wide shadow-md shadow-[#ECB7B3]/30">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditHeroImageModal;
