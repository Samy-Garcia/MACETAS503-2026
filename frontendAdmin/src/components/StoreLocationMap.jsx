// StoreLocationMap.jsx
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function SelectorDeUbicacion({ onSeleccionar }) {
  useMapEvents({
    click(e) {
      onSeleccionar({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function StoreLocationMap({ lat, lng, onCambiarUbicacion }) {
  const posicion = lat && lng ? [lat, lng] : [13.6929, -89.2182];

  return (
    <div>
      <p className="text-xs text-black/60 mb-2">
        Haz clic en el mapa para mover la ubicación de la tienda
      </p>
      <MapContainer
        center={posicion}
        zoom={14}
        style={{ height: "320px", width: "100%", borderRadius: 12 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SelectorDeUbicacion onSeleccionar={onCambiarUbicacion} />
        {lat && lng && <Marker position={[lat, lng]} />}
      </MapContainer>
    </div>
  );
}