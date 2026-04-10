import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet's broken default icon in Vite bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Adjusts the view when lat/lng/raioKm change.
 * Uses a ref to avoid re-fitting when only map reference changes.
 */
function MapController({ lat, lng, raioKm }: { lat: number; lng: number; raioKm: number }) {
  const map = useMap();
  const prevRef = useRef({ lat: NaN, lng: NaN, raioKm: NaN });

  useEffect(() => {
    const prev = prevRef.current;
    if (prev.lat === lat && prev.lng === lng && prev.raioKm === raioKm) return;
    prevRef.current = { lat, lng, raioKm };

    const center: L.LatLngTuple = [lat, lng];
    const radiusMeters = raioKm * 1000;
    const bounds = L.latLng(center).toBounds(radiusMeters * 2);
    map.fitBounds(bounds, { padding: [40, 40], animate: false });
  }, [lat, lng, raioKm, map]);

  return null;
}

interface Props {
  lat: number;
  lng: number;
  raioKm: number;
  height?: number;
}

export default function MapaEntrega({ lat, lng, raioKm, height = 300 }: Props) {
  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: 16 }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController lat={lat} lng={lng} raioKm={raioKm} />

        {/* Marcador da loja */}
        <Marker position={[lat, lng]} />

        {/* Círculo da área de entrega */}
        <Circle
          center={[lat, lng]}
          radius={raioKm * 1000}
          pathOptions={{
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '8 5',
          }}
        />
      </MapContainer>
    </div>
  );
}
