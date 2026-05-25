import React, { useEffect, useMemo, useRef, useState } from "react";

const MAPBOX_GL_JS_URL = "https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js";
const MAPBOX_GL_CSS_URL = "https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.css";
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAPBOX_DIRECTIONS_URL = "https://api.mapbox.com/directions/v5/mapbox/driving";

// Nairobi coordinates (center of Kenya for default view)
const DEFAULT_CENTER = [36.8219, -1.2921];
// Kenya bounding box: [west, south, east, north]
const KENYA_BOUNDS = [
  [33.5, -4.9],
  [42.0, 5.5]
];
const DEFAULT_ZOOM = 8;
const EMPTY_ROUTE = {
  type: "FeatureCollection",
  features: []
};

function loadMapboxGl() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mapbox is only available in a browser."));
  }
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);
  if (window.__roamKenyaMapboxPromise) return window.__roamKenyaMapboxPromise;

  if (!document.querySelector(`link[href="${MAPBOX_GL_CSS_URL}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = MAPBOX_GL_CSS_URL;
    document.head.appendChild(link);
  }

  window.__roamKenyaMapboxPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${MAPBOX_GL_JS_URL}"]`);
    const handleLoad = () => {
      window.mapboxgl ? resolve(window.mapboxgl) : reject(new Error("Mapbox failed to initialize."));
    };
    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Unable to load Mapbox.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = MAPBOX_GL_JS_URL;
    script.async = true;
    script.onload = handleLoad;
    script.onerror = () => reject(new Error("Unable to load Mapbox."));
    document.body.appendChild(script);
  });

  return window.__roamKenyaMapboxPromise;
}

function toLngLat(coords) {
  if (!coords) return null;
  const lng = coords.longitude;
  const lat = coords.latitude;
  if (typeof lng !== "number" || typeof lat !== "number" || isNaN(lng) || isNaN(lat)) return null;
  return [lng, lat];
}

/**
 * Fetch real road-based route geometry from Mapbox Directions API.
 * Returns a GeoJSON FeatureCollection with the full polyline, or falls back
 * to a straight line if the request fails.
 */
async function fetchRoadRoute(pickup, destination) {
  if (!pickup || !destination) return EMPTY_ROUTE;

  const pickupLngLat = toLngLat(pickup);
  const destLngLat = toLngLat(destination);
  if (!pickupLngLat || !destLngLat) return EMPTY_ROUTE;

  try {
    const coordinates = `${pickupLngLat[0]},${pickupLngLat[1]};${destLngLat[0]},${destLngLat[1]}`;
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      alternatives: "false",
      geometries: "geojson",       // Full road geometry (not encoded polyline)
      overview: "full",            // Complete route shape
      steps: "false"
    });

    const response = await fetch(`${MAPBOX_DIRECTIONS_URL}/${coordinates}?${params.toString()}`);
    if (!response.ok) throw new Error(`Directions API error: ${response.status}`);

    const data = await response.json();
    const route = data?.routes?.[0];
    if (!route?.geometry?.coordinates?.length) throw new Error("No route geometry returned");

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: route.geometry   // Full road-following polyline from Mapbox
        }
      ]
    };
  } catch (err) {
    console.warn("⚠️ Road route fetch failed, falling back to straight line:", err.message);
    // Graceful fallback: straight-line between the two points
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [pickupLngLat, destLngLat]
          }
        }
      ]
    };
  }
}

function getMapClickTarget({ activeField, pickupField, destinationField, pickupCoords, destinationCoords }) {
  const hasDestination = destinationField && destinationField !== pickupField;
  if (activeField === pickupField || activeField === destinationField) return activeField;
  if (!pickupCoords && pickupField) return pickupField;
  if (hasDestination && !destinationCoords) return destinationField;
  return pickupField || destinationField;
}

export default function BookingMap({
  pickupCoords,
  destinationCoords,
  gpsCoords,
  pickupField,
  destinationField,
  activeField,
  onActiveFieldChange,
  onLocationPick
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRefs = useRef({});
  const latestPropsRef = useRef({});
  const routeFetchRef = useRef(null);     // Abort controller for in-flight route fetches
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);

  const hasDestination = destinationField && destinationField !== pickupField;
  const selectedField = useMemo(
    () => getMapClickTarget({ activeField, pickupField, destinationField, pickupCoords, destinationCoords }),
    [activeField, pickupField, destinationField, pickupCoords, destinationCoords]
  );

  useEffect(() => {
    latestPropsRef.current = { activeField, pickupField, destinationField, pickupCoords, destinationCoords, onLocationPick };
  }, [activeField, pickupField, destinationField, pickupCoords, destinationCoords, onLocationPick]);

  // ── Map initialisation ───────────────────────────────────────────────────
  useEffect(() => {
    if (!MAPBOX_TOKEN || mapRef.current || !mapContainerRef.current) return undefined;
    let disposed = false;

    loadMapboxGl()
      .then((mapboxgl) => {
        if (disposed || !mapContainerRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          // Navigation-style map (shows road names, traffic-friendly)
          style: "mapbox://styles/mapbox/navigation-day-v1",
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          maxBounds: KENYA_BOUNDS,
          minZoom: 5,
          maxZoom: 18,
          interactive: true,
          pitch: 0
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
        map.on("load", () => {
          if (disposed) return;

          // ── Route layers ─────────────────────────────────────────────────
          map.addSource("trip-route", { type: "geojson", data: EMPTY_ROUTE });

          // Layer 1: thick dark outline (casing) for contrast
          map.addLayer({
            id: "trip-route-casing",
            type: "line",
            source: "trip-route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#1A1A1A",
              "line-width": 8,
              "line-opacity": 0.4
            }
          });

          // Layer 2: main gold route line
          map.addLayer({
            id: "trip-route-line",
            type: "line",
            source: "trip-route",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#C5A059",
              "line-width": 5,
              "line-opacity": 0.95
            }
          });

          setMapReady(true);
          setTimeout(() => { if (!disposed && mapRef.current) mapRef.current.resize(); }, 100);
        });

        map.on("error", (error) => {
          if (!disposed) {
            console.error("❌ Mapbox error:", error);
            setMapError(error?.message || "Map rendering error occurred");
          }
        });

        map.on("click", (event) => {
          const state = latestPropsRef.current;
          const targetField = getMapClickTarget(state);
          if (!targetField || !state.onLocationPick) return;
          state.onLocationPick(targetField, { latitude: event.lngLat.lat, longitude: event.lngLat.lng });
        });

        mapRef.current = map;
      })
      .catch((error) => {
        if (!disposed) setMapError(error.message || "Unable to load Mapbox.");
      });

    return () => {
      disposed = true;
      setMapReady(false);
      Object.values(markerRefs.current).forEach((m) => m?.remove());
      markerRefs.current = {};
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Markers + road route update ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !window.mapboxgl) return;

    const mapboxgl = window.mapboxgl;

    // Helper: create or update a marker
    const upsertMarker = ({ key, coords, color, draggable, fieldName, emoji }) => {
      const existing = markerRefs.current[key];
      if (!coords) {
        existing?.remove();
        delete markerRefs.current[key];
        return;
      }
      const lngLat = toLngLat(coords);
      if (!lngLat) return;

      if (existing) {
        existing.setLngLat(lngLat);
        return;
      }

      // Custom HTML marker for a more Google Maps-like look
      const el = document.createElement("div");
      el.style.cssText = `
        width: 36px; height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        cursor: ${draggable ? "grab" : "default"};
        display: flex; align-items: center; justify-content: center;
      `;
      const inner = document.createElement("div");
      inner.style.cssText = "transform: rotate(45deg); font-size: 14px; line-height: 1;";
      inner.textContent = emoji || "📍";
      el.appendChild(inner);

      const marker = new mapboxgl.Marker({ element: el, draggable, anchor: "bottom" })
        .setLngLat(lngLat)
        .addTo(map);

      if (draggable && fieldName) {
        marker.on("dragend", () => {
          const { lng, lat } = marker.getLngLat();
          latestPropsRef.current.onLocationPick?.(fieldName, { latitude: lat, longitude: lng });
        });
      }
      markerRefs.current[key] = marker;
    };

    upsertMarker({ key: "pickup", coords: pickupCoords, color: "#2563EB", draggable: true, fieldName: pickupField, emoji: "🔵" });
    upsertMarker({ key: "destination", coords: hasDestination ? destinationCoords : null, color: "#C5A059", draggable: true, fieldName: destinationField, emoji: "🟡" });
    upsertMarker({ key: "gps", coords: gpsCoords && !pickupCoords ? gpsCoords : null, color: "#0EA5E9", draggable: false, emoji: "📍" });

    // ── Fetch real road route ───────────────────────────────────────────────
    const routeSource = map.getSource("trip-route");
    if (!routeSource) return;

    const showRoute = pickupCoords && hasDestination && destinationCoords;

    if (!showRoute) {
      routeSource.setData(EMPTY_ROUTE);
    } else {
      // Cancel any previous in-flight fetch
      if (routeFetchRef.current) routeFetchRef.current.cancelled = true;
      const fetchToken = { cancelled: false };
      routeFetchRef.current = fetchToken;

      fetchRoadRoute(pickupCoords, destinationCoords).then((routeGeoJSON) => {
        if (fetchToken.cancelled) return;
        const source = mapRef.current?.getSource("trip-route");
        if (source) source.setData(routeGeoJSON);
      });
    }

    // ── Fit map bounds to visible points ──────────────────────────────────
    const points = [pickupCoords, hasDestination ? destinationCoords : null, gpsCoords]
      .filter(Boolean)
      .map(toLngLat)
      .filter(Boolean);

    if (points.length >= 2) {
      const bounds = points.reduce(
        (b, p) => b.extend(p),
        new mapboxgl.LngLatBounds(points[0], points[0])
      );
      map.fitBounds(bounds, { padding: { top: 80, bottom: 80, left: 60, right: 60 }, maxZoom: 15, duration: 700 });
    } else if (points.length === 1) {
      map.easeTo({ center: points[0], zoom: Math.max(map.getZoom(), 14), duration: 700 });
    }
  }, [pickupCoords, destinationCoords, gpsCoords, pickupField, destinationField, hasDestination, mapReady]);

  const statusLabel = pickupCoords && (destinationCoords || !hasDestination)
    ? "Route set"
    : pickupCoords
    ? "Set destination"
    : "Set pickup";

  if (!MAPBOX_TOKEN) {
    return (
      <div className="booking-portal-enter relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-gray-200 bg-gray-950 text-white shadow-[0_12px_34px_rgba(15,23,42,0.08)] flex items-center justify-center p-6">
        <div className="max-w-xs text-center">
          <p className="text-sm font-bold">Mapbox token missing</p>
          <p className="text-xs text-white/70 mt-2">Add VITE_MAPBOX_ACCESS_TOKEN to enable precise location picking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-portal-enter relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-gray-200 shadow-[0_12px_34px_rgba(15,23,42,0.08)] bg-gray-900">
      {/* Map canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full bg-gray-900" style={{ minHeight: "300px" }} />

      {/* Top-left controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        {/* Status pill */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-[0_8px_18px_rgba(15,23,42,0.08)] border border-gray-100 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${pickupCoords && (destinationCoords || !hasDestination) ? "bg-green-500" : "bg-amber-500"}`} />
          <span className="text-[11px] font-semibold text-gray-700">{statusLabel}</span>
        </div>

        {/* Pickup / Destination toggle buttons */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-[0_8px_18px_rgba(15,23,42,0.08)] border border-gray-100 overflow-hidden flex">
          {pickupField && (
            <button
              type="button"
              onClick={() => onActiveFieldChange?.(pickupField)}
              className={`px-3 py-1.5 text-[11px] font-bold transition-colors ${selectedField === pickupField ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
            >
              Pickup
            </button>
          )}
          {hasDestination && (
            <button
              type="button"
              onClick={() => onActiveFieldChange?.(destinationField)}
              className={`px-3 py-1.5 text-[11px] font-bold transition-colors ${selectedField === destinationField ? "bg-[#C5A059] text-white" : "text-gray-700 hover:bg-gray-100"}`}
            >
              Destination
            </button>
          )}
        </div>
      </div>

      {/* Map error overlay */}
      {mapError && (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-lg border border-red-200 bg-white/95 px-3 py-2 text-xs font-medium text-red-700 shadow-md">
          {mapError}
        </div>
      )}
    </div>
  );
}
