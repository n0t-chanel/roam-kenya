import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom pickup icon (blue circle)
const pickupIcon = L.divIcon({
  html: `<div style="
    width: 18px; height: 18px;
    background: #3B82F6;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.35), 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Custom destination icon (red pin)
const destinationIcon = L.divIcon({
  html: `<div style="
    width: 14px; height: 14px;
    background: #EF4444;
    border: 3px solid #fff;
    border-radius: 3px;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.35), 0 2px 8px rgba(0,0,0,0.3);
    transform: rotate(45deg);
  "></div>`,
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// GPS pulsing dot icon
const gpsIcon = L.divIcon({
  html: `<div style="position:relative;">
    <div style="
      width: 14px; height: 14px;
      background: #3B82F6;
      border: 2.5px solid #fff;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      position: relative; z-index: 2;
    "></div>
    <div style="
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 40px; height: 40px;
      background: rgba(59,130,246,0.15);
      border-radius: 50%;
      animation: gpsPulse 2s ease-out infinite;
    "></div>
  </div>`,
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Component to auto-fit bounds
function MapBoundsHandler({ pickupCoords, destinationCoords, gpsCoords }) {
  const map = useMap();
  const hasSetRef = useRef(false);

  useEffect(() => {
    const points = [];
    if (pickupCoords) points.push([pickupCoords.latitude, pickupCoords.longitude]);
    if (destinationCoords) points.push([destinationCoords.latitude, destinationCoords.longitude]);
    if (points.length === 0 && gpsCoords) {
      points.push([gpsCoords.latitude, gpsCoords.longitude]);
    }

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
      hasSetRef.current = true;
    } else if (points.length === 1) {
      map.setView(points[0], 13, { animate: true });
      hasSetRef.current = true;
    }
  }, [pickupCoords, destinationCoords, gpsCoords, map]);

  return null;
}

export default function BookingMap({ pickupCoords, destinationCoords, gpsCoords }) {
  // Default center: Nairobi
  const defaultCenter = [-1.2921, 36.8219];
  const center = pickupCoords
    ? [pickupCoords.latitude, pickupCoords.longitude]
    : gpsCoords
    ? [gpsCoords.latitude, gpsCoords.longitude]
    : defaultCenter;

  const polylinePositions = [];
  if (pickupCoords) polylinePositions.push([pickupCoords.latitude, pickupCoords.longitude]);
  if (destinationCoords) polylinePositions.push([destinationCoords.latitude, destinationCoords.longitude]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
      {/* GPS pulse animation */}
      <style>{`
        @keyframes gpsPulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", minHeight: "300px" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsHandler
          pickupCoords={pickupCoords}
          destinationCoords={destinationCoords}
          gpsCoords={gpsCoords}
        />

        {/* GPS location (pulsing blue dot) */}
        {gpsCoords && !pickupCoords && (
          <Marker position={[gpsCoords.latitude, gpsCoords.longitude]} icon={gpsIcon}>
            <Popup>
              <span className="text-xs font-semibold">Your Location</span>
            </Popup>
          </Marker>
        )}

        {/* Pickup marker */}
        {pickupCoords && (
          <Marker position={[pickupCoords.latitude, pickupCoords.longitude]} icon={pickupIcon}>
            <Popup>
              <span className="text-xs font-semibold text-blue-600">Pickup Point</span>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destinationCoords && (
          <Marker position={[destinationCoords.latitude, destinationCoords.longitude]} icon={destinationIcon}>
            <Popup>
              <span className="text-xs font-semibold text-red-600">Destination</span>
            </Popup>
          </Marker>
        )}

        {/* Route line */}
        {polylinePositions.length === 2 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: "#B35A38",
              weight: 3,
              dashArray: "8, 12",
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>

      {/* Map overlay — location count badge */}
      <div className="absolute top-3 left-3 z-[1000]">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md border border-gray-100 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${pickupCoords && destinationCoords ? "bg-green-500" : pickupCoords || destinationCoords ? "bg-amber-500" : "bg-gray-400"}`}></div>
          <span className="text-[11px] font-semibold text-gray-700">
            {pickupCoords && destinationCoords
              ? "Route set"
              : pickupCoords
              ? "Set destination"
              : destinationCoords
              ? "Set pickup"
              : "Select locations"}
          </span>
        </div>
      </div>
    </div>
  );
}
