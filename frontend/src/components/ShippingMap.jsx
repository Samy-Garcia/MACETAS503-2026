import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getRuta } from "../api/routesApi"; // ajusta la ruta según donde esté tu carpeta api
import { getConfig } from "../api/configApi"; // ajusta la ruta según donde esté tu carpeta api

// Fix para que los iconos de marcador se vean bien en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Valores de respaldo mientras carga la configuración real desde el backend
const UBICACION_TIENDA_DEFAULT = { lat: 13.6929, lng: -89.2182 };

// Captura el clic del usuario en el mapa
function SelectorDeUbicacion({ onSeleccionar }) {
  useMapEvents({
    click(e) {
      onSeleccionar({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Ajusta el zoom/centro para que la ruta completa sea visible
function AjustarVista({ geometria }) {
  const map = useMap();
  useEffect(() => {
    if (geometria) {
      const capa = L.geoJSON(geometria);
      map.fitBounds(capa.getBounds(), { padding: [40, 40] });
    }
  }, [geometria, map]);
  return null;
}

// Calcula el costo de envío "crudo" según el modo configurado por el admin,
// sin aplicar todavía la regla de envío gratis.
function calcularCostoBase({ shippingMode, distanciaMetros, pricePerKm, fixedShippingCost }) {
  if (shippingMode === "fixed") {
    return fixedShippingCost || 0;
  }
  // "perKm" (o cualquier otro valor, como fallback seguro)
  const distanciaKm = distanciaMetros / 1000;
  return distanciaKm * (pricePerKm || 0);
}

/**
 * Props:
 * - subtotal: number -> subtotal actual del carrito, necesario para saber si
 *   aplica el envío gratis configurado por el admin (freeShippingMinAmount)
 * - onDireccionSeleccionada(direccionTexto, coords) -> se llama cuando el usuario
 *   hace clic en el mapa, para que puedas autocompletar el campo "Dirección de envío"
 * - onCostoEnvioCalculado(costoEnvio, distanciaMetros, duracionSegundos, esGratis) ->
 *   te da el costo final de envío (0 si aplicó envío gratis) y un flag esGratis
 *   para que puedas mostrar el mensaje correcto en el resumen
 * - ubicacionForzada: { lat, lng, texto } -> opcional. Cuando se pasa (o
 *   cambia de valor), simula que el usuario hizo clic justo ahí, sin pedirle
 *   que marque el mapa de nuevo. Se usa para reutilizar una dirección ya
 *   guardada del perfil: como ya se conoce el texto de la dirección, no hace
 *   falta la geocodificación inversa, solo calcular la ruta directo.
 */
export default function MapaEnvio({ subtotal = 0, onDireccionSeleccionada, onCostoEnvioCalculado, ubicacionForzada }) {
  const [ubicacionTienda, setUbicacionTienda] = useState(UBICACION_TIENDA_DEFAULT);
  const [shippingMode, setShippingMode] = useState("perKm");
  const [pricePerKm, setPricePerKm] = useState(0);
  const [fixedShippingCost, setFixedShippingCost] = useState(0);
  const [freeShippingMinAmount, setFreeShippingMinAmount] = useState(null);
  const [destino, setDestino] = useState(null);
  const [ruta, setRuta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Al montar, trae la ubicación real de la tienda y la configuración de envío
  // (modo, precio por km, costo fijo, monto mínimo para envío gratis)
  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const config = await getConfig();
        if (config?.storeLat && config?.storeLng) {
          setUbicacionTienda({ lat: config.storeLat, lng: config.storeLng });
        }
        setShippingMode(config?.shippingMode || "perKm");
        setPricePerKm(config?.pricePerKm || 0);
        setFixedShippingCost(config?.fixedShippingCost || 0);
        setFreeShippingMinAmount(
          config?.freeShippingMinAmount === undefined ? null : config?.freeShippingMinAmount
        );
      } catch (err) {
        console.error("No se pudo cargar la configuración de envío:", err);
        // Si falla, se sigue usando UBICACION_TIENDA_DEFAULT y valores en 0
      }
    };

    cargarConfig();
  }, []);

  // El envío gratis aplica si hay un mínimo configurado y el subtotal lo alcanza
  const aplicaEnvioGratis =
    freeShippingMinAmount !== null &&
    freeShippingMinAmount !== undefined &&
    freeShippingMinAmount > 0 &&
    subtotal >= freeShippingMinAmount;

  // Lógica compartida: calcula la ruta desde la tienda hasta unas coordenadas
  // ya conocidas, y notifica el resultado. La usan tanto el clic en el mapa
  // como una dirección guardada (ubicacionForzada) -- ambos caminos terminan
  // aquí, solo cambia de dónde sale el texto de la dirección.
  const calcularEnvioHacia = async (coords, direccionTexto) => {
    setDestino(coords);
    setRuta(null);
    setError(null);
    setCargando(true);

    try {
      if (onDireccionSeleccionada) {
        onDireccionSeleccionada(direccionTexto, coords);
      }

      const dataRuta = await getRuta(ubicacionTienda, coords);

      setRuta(dataRuta);

      if (onCostoEnvioCalculado) {
        const costoBase = calcularCostoBase({
          shippingMode,
          distanciaMetros: dataRuta.distanciaMetros,
          pricePerKm,
          fixedShippingCost,
        });

        const esGratis =
          freeShippingMinAmount !== null &&
          freeShippingMinAmount !== undefined &&
          freeShippingMinAmount > 0 &&
          subtotal >= freeShippingMinAmount;

        const costoFinal = esGratis ? 0 : costoBase;

        onCostoEnvioCalculado(costoFinal, dataRuta.distanciaMetros, dataRuta.duracionSegundos, esGratis);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo calcular la ruta hacia esa ubicación");
    } finally {
      setCargando(false);
    }
  };

  // Cuando el usuario hace clic en el mapa (necesita geocodificación inversa,
  // porque a diferencia de una dirección guardada, todavía no sabemos el texto)
  const manejarSeleccion = async (coords) => {
    setCargando(true);
    setError(null);
    try {
      const resGeo = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`
      );
      const dataGeo = await resGeo.json();
      const direccionTexto = dataGeo.display_name || "";
      await calcularEnvioHacia(coords, direccionTexto);
    } catch (err) {
      console.error(err);
      setError("No se pudo calcular la ruta hacia esa ubicación");
      setCargando(false);
    }
  };

  // Cuando se selecciona una dirección guardada (ubicacionForzada cambia),
  // se calcula el envío directo, sin geocodificación inversa: ya se conoce
  // el texto de la dirección, no hay que preguntarle a Nominatim.
  useEffect(() => {
    if (ubicacionForzada) {
      calcularEnvioHacia(
        { lat: ubicacionForzada.lat, lng: ubicacionForzada.lng },
        ubicacionForzada.texto || ""
      );
    }
    // No se incluye calcularEnvioHacia en las dependencias a propósito: se
    // recrea en cada render (usa varios estados internos), incluirla
    // causaría que este efecto se dispare de más.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ubicacionForzada]);

  // Costo a mostrar en el texto informativo debajo del mapa (ya con envío gratis aplicado)
  const costoMostrado = ruta
    ? aplicaEnvioGratis
      ? 0
      : calcularCostoBase({
          shippingMode,
          distanciaMetros: ruta.distanciaMetros,
          pricePerKm,
          fixedShippingCost,
        })
    : 0;

  return (
    <div>
      <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: 8 }}>
        Haz clic en el mapa para marcar tu dirección de entrega
      </p>

      {aplicaEnvioGratis && (
        <p style={{ fontSize: "0.85rem", color: "#14532d", fontWeight: 600, marginBottom: 8 }}>
          🎉 ¡Tu pedido califica para envío gratis!
        </p>
      )}

      <MapContainer
        center={[ubicacionTienda.lat, ubicacionTienda.lng]}
        zoom={13}
        style={{ height: "400px", width: "100%", borderRadius: 8 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <SelectorDeUbicacion onSeleccionar={manejarSeleccion} />

        {/* Marcador de la tienda */}
        <Marker position={[ubicacionTienda.lat, ubicacionTienda.lng]} />

        {/* Marcador del destino elegido */}
        {destino && <Marker position={[destino.lat, destino.lng]} />}

        {ruta?.geometria && (
          <>
            <GeoJSON
              data={ruta.geometria}
              style={{ color: "#14532d", weight: 5, opacity: 0.8 }}
            />
            <AjustarVista geometria={ruta.geometria} />
          </>
        )}
      </MapContainer>

      {cargando && <p style={{ marginTop: 8 }}>Calculando ruta...</p>}
      {error && <p style={{ marginTop: 8, color: "red" }}>{error}</p>}

      {ruta && (
        <p style={{ marginTop: 8, fontSize: "0.9rem" }}>
          Distancia: {(ruta.distanciaMetros / 1000).toFixed(2)} km — Tiempo estimado:{" "}
          {Math.round(ruta.duracionSegundos / 60)} min — Envío:{" "}
          {aplicaEnvioGratis ? (
            <span style={{ color: "#14532d", fontWeight: 600 }}>Gratis</span>
          ) : (
            `$${costoMostrado.toFixed(2)}`
          )}
        </p>
      )}
    </div>
  );
}
