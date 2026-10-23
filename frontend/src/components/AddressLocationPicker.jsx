import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// San Salvador: punto de partida cuando todavía no hay nada marcado.
const CENTRO_POR_DEFECTO = [13.6929, -89.2182];

function SelectorDeUbicacion({ onSeleccionar }) {
  const map = useMapEvents({
    click(e) {
      // La rueda del mouse solo hace zoom una vez que el usuario interactúa
      // con el mapa; así, al hacer scroll por la página no se queda "atrapado".
      map.scrollWheelZoom.enable();
      onSeleccionar({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    mouseout() {
      map.scrollWheelZoom.disable();
    },
  });
  return null;
}

// Arregla los problemas típicos de Leaflet dentro de una página con
// formulario: (1) si el contenedor cambia de tamaño después de montarse
// (grid, columnas, fuentes que cargan tarde) el mapa se queda con baldosas
// grises/cortadas hasta que se calcula de nuevo su tamaño, y (2) cuando se
// marca o busca un punto nuevo, el mapa tiene que moverse hasta él.
function AjustesDelMapa({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    const contenedor = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(contenedor);
    // Un último recálculo por si la página aún se estaba acomodando.
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => {
      observer.disconnect();
      clearTimeout(t);
    };
  }, [map]);

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
    }
  }, [lat, lng, map]);

  return null;
}

// Convierte coordenadas en una dirección legible (en español).
const direccionDesdeCoordenadas = async ({ lat, lng }) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=es&lat=${lat}&lon=${lng}`
    );
    if (!res.ok) return "";
    const data = await res.json();
    return data.display_name || "";
  } catch (err) {
    console.error("No se pudo obtener la dirección de esas coordenadas:", err);
    return "";
  }
};

/**
 * Mapa simple para marcar una ubicación (dirección guardada, lugar de un
 * evento en cotizaciones). No calcula ruta ni costo de envío -- eso solo
 * aplica en el checkout. Captura el punto y resuelve el texto de la
 * dirección con geocodificación inversa para que no haya que escribirla.
 *
 * Props:
 * - lat, lng: coordenadas actuales (si ya hay una marcada, ej. al editar)
 * - onUbicacionSeleccionada(coords, direccionTexto): se llama al marcar un punto
 * - descripcion: texto de ayuda sobre el mapa (opcional)
 */
export default function AddressLocationPicker({
  lat,
  lng,
  onUbicacionSeleccionada,
  descripcion = "Haz clic en el mapa, busca un lugar o usa tu ubicación actual para marcar el punto.",
}) {
  const posicion = lat && lng ? [lat, lng] : CENTRO_POR_DEFECTO;
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const seleccionar = async (coords, textoConocido) => {
    setMensaje("");
    const direccionTexto = textoConocido || (await direccionDesdeCoordenadas(coords));
    if (!montado.current) return;
    if (!direccionTexto) {
      setMensaje("Se marcó el punto, pero no pudimos obtener la dirección escrita. Puedes escribirla a mano.");
    }
    onUbicacionSeleccionada(coords, direccionTexto);
  };

  const buscarLugar = async (e) => {
    e?.preventDefault();
    const texto = busqueda.trim();
    if (!texto) return;
    setBuscando(true);
    setMensaje("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=es&countrycodes=sv&q=${encodeURIComponent(texto)}`
      );
      const resultados = res.ok ? await res.json() : [];
      if (!resultados.length) {
        setMensaje("No encontramos ese lugar. Prueba con otro nombre o márcalo directo en el mapa.");
        return;
      }
      const r = resultados[0];
      await seleccionar({ lat: Number(r.lat), lng: Number(r.lon) }, r.display_name);
    } catch (err) {
      setMensaje("No se pudo buscar el lugar. Revisa tu conexión o márcalo directo en el mapa.");
    } finally {
      if (montado.current) setBuscando(false);
    }
  };

  const usarMiUbicacion = () => {
    if (!navigator.geolocation) {
      setMensaje("Tu navegador no permite obtener tu ubicación.");
      return;
    }
    setMensaje("");
    navigator.geolocation.getCurrentPosition(
      (pos) => seleccionar({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMensaje("No pudimos obtener tu ubicación. Revisa el permiso del navegador o márcala en el mapa."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    // "isolate" crea su propio contexto de apilamiento: los paneles de Leaflet
    // usan z-index de hasta 1000 y, sin esto, se pintaban POR ENCIMA del
    // menú de navegación fijo y de los avisos al hacer scroll.
    <div className="isolate relative z-0">
      {descripcion && <p className="text-xs text-zinc-500 mb-2">{descripcion}</p>}

      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <form onSubmit={buscarLugar} className="flex flex-1 gap-2">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar un lugar (ej: Salón Las Palmas, Santa Tecla)"
            className="flex-1 min-w-0 p-2.5 border border-zinc-300 rounded-md text-sm bg-surface"
          />
          <button
            type="submit"
            disabled={buscando || !busqueda.trim()}
            className="px-4 py-2.5 bg-primary-700 text-white text-sm font-semibold rounded-md hover:bg-primary-800 disabled:opacity-50"
          >
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </form>
        <button
          type="button"
          onClick={usarMiUbicacion}
          className="px-4 py-2.5 border border-primary-700 text-primary-700 text-sm font-semibold rounded-md hover:bg-primary-700/5"
        >
          Usar mi ubicación
        </button>
      </div>

      {mensaje && <p className="text-xs text-amber-700 mb-2">{mensaje}</p>}

      <div>
        <MapContainer
          center={posicion}
          zoom={lat && lng ? 15 : 13}
          scrollWheelZoom={false}
          style={{ height: "300px", width: "100%", borderRadius: 8 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AjustesDelMapa lat={lat} lng={lng} />
          <SelectorDeUbicacion onSeleccionar={(coords) => seleccionar(coords)} />
          {lat && lng && (
            <Marker
              position={[lat, lng]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat: nuevaLat, lng: nuevaLng } = e.target.getLatLng();
                  seleccionar({ lat: nuevaLat, lng: nuevaLng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
