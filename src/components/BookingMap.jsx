import React, { useEffect, useMemo, useRef, useState } from "react";

const MAPBOX_GL_JS_URL = "https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.js";
const MAPBOX_GL_CSS_URL = "https://api.mapbox.com/mapbox-gl-js/v3.9.4/mapbox-gl.css";
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Nairobi coordinates (center of Kenya for default view)
const DEFAULT_CENTER = [36.8219, -1.2921];
// Kenya bounding box: [west, south, east, north]
const KENYA_BOUNDS = [
  [33.5, -4.9],
  [42.0, 5.5]
];
// Default zoom level for Kenya
const DEFAULT_ZOOM = 8;
const EMPTY_ROUTE = {
  type: "FeatureCollection",
  features: []
};

function loadMapboxGl() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mapbox is only available in a browser."));
  }

  if (window.mapboxgl) {
    return Promise.resolve(window.mapboxgl);
  }

  if (window.__roamKenyaMapboxPromise) {
    return window.__roamKenyaMapboxPromise;
  }

  if (!document.querySelector(`link[href="${MAPBOX_GL_CSS_URL}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = MAPBOX_GL_CSS_URL;
    document.head.appendChild(link);
  }

  window.__roamKenyaMapboxPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${MAPBOX_GL_JS_URL}"]`);

    const handleLoad = () => {
      if (window.mapboxgl) {
        resolve(window.mapboxgl);
      } else {
        reject(new Error("Mapbox failed to initialize."));
      }
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
  // Validate coordinates are valid numbers
  if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
    console.warn("Invalid coordinates provided:", coords);
    return null;
  }
  return [lng, lat];
}

function makeRouteFeature(pickupCoords, destinationCoords) {
  const pickup = toLngLat(pickupCoords);
  const destination = toLngLat(destinationCoords);

  if (!pickup || !destination) return EMPTY_ROUTE;

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [pickup, destination]
        }
      }
    ]
  };
}

function getMapClickTarget({ activeField, pickupField, destinationField, pickupCoords, destinationCoords }) {
  const hasDestination = destinationField && destinationField !== pickupField;

  if (activeField === pickupField || activeField === destinationField) {
    return activeField;
  }

  if (!pickupCoords && pickupField) {
    return pickupField;
  }

  if (hasDestination && !destinationCoords) {
    return destinationField;
  }

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
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);

  const hasDestination = destinationField && destinationField !== pickupField;
  const selectedField = useMemo(
    () =>
      getMapClickTarget({
        activeField,
        pickupField,
        destinationField,
        pickupCoords,
        destinationCoords
      }),
    [activeField, pickupField, destinationField, pickupCoords, destinationCoords]
  );

  useEffect(() => {
    latestPropsRef.current = {
      activeField,
      pickupField,
      destinationField,
      pickupCoords,
      destinationCoords,
      onLocationPick
    };
  }, [activeField, pickupField, destinationField, pickupCoords, destinationCoords, onLocationPick]);

  useEffect(() => {
    if (!MAPBOX_TOKEN || mapRef.current || !mapContainerRef.current) return undefined;

    let disposed = false;

    loadMapboxGl()
      .then((mapboxgl) => {
        if (disposed || !mapContainerRef.current) return;

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          maxBounds: KENYA_BOUNDS,
          maxBoundsNorth: 5.5,
          maxBoundsSouth: -4.9,
          maxBoundsEast: 42.0,
          maxBoundsWest: 33.5,
          // Prevent zooming in beyond Kenya
          minZoom: 7,
          maxZoom: 18,
          // Disable map rotation for better UX
          interactive: true,
          pitch: 0,
          trackUserInteraction: false
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

        map.on("load", () => {
          if (disposed) return;
          
          // Add source and layer for trip route
          map.addSource("trip-route", {
            type: "geojson",
            data: EMPTY_ROUTE
          });
          
          map.addLayer({
            id: "trip-route-line",
            type: "line",
            source: "trip-route",
            layout: {
              "line-cap": "round",
              "line-join": "round"
            },
            paint: {
              "line-color": "#B35A38",
              "line-width": 4,
              "line-opacity": 0.85,
              "line-dasharray": [1.5, 1.2]
            }
          });
          
          setMapReady(true);
          
          // Ensure map renders with correct size
          setTimeout(() => {
            if (!disposed && mapRef.current) {
              mapRef.current.resize();
            }
          }, 100);
          
          console.log("✅ Mapbox map loaded successfully");
        });
        
        // Add error handler
        map.on("error", (error) => {
          if (!disposed) {
            console.error("❌ Mapbox error:", error);
            setMapError(error?.message || "Map rendering error occurred");
          }
        });
        
        // Log style loading
        map.on("style.load", () => {
          console.log("✅ Map style loaded");
        });

        map.on("click", (event) => {
          const state = latestPropsRef.current;
          const targetField = getMapClickTarget(state);
          if (!targetField || !state.onLocationPick) return;

          state.onLocationPick(targetField, {
            latitude: event.lngLat.lat,
            longitude: event.lngLat.lng
          });
        });

        mapRef.current = map;
      })
      .catch((error) => {
        if (!disposed) {
          setMapError(error.message || "Unable to load Mapbox.");
        }
      });

    return () => {
      disposed = true;
      setMapReady(false);
      Object.values(markerRefs.current).forEach((marker) => marker?.remove());
      markerRefs.current = {};
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !window.mapboxgl) return;

    const mapboxgl = window.mapboxgl;

    const upsertMarker = ({ key, coords, color, draggable, fieldName }) => {
      const existingMarker = markerRefs.current[key];

      if (!coords) {
        existingMarker?.remove();
        delete markerRefs.current[key];
        return;
      }

      const lngLat = toLngLat(coords);
      if (existingMarker) {
        existingMarker.setLngLat(lngLat);
        return;
      }

      const marker = new mapboxgl.Marker({ color, draggable })
        .setLngLat(lngLat)
        .addTo(map);

      if (draggable && fieldName) {
        marker.on("dragend", () => {
          const nextLngLat = marker.getLngLat();
          latestPropsRef.current.onLocationPick?.(fieldName, {
            latitude: nextLngLat.lat,
            longitude: nextLngLat.lng
          });
        });
      }

      markerRefs.current[key] = marker;
    };

    upsertMarker({
      key: "pickup",
      coords: pickupCoords,
      color: "#2563EB",
      draggable: true,
      fieldName: pickupField
    });
    upsertMarker({
      key: "destination",
      coords: hasDestination ? destinationCoords : null,
      color: "#EF4444",
      draggable: true,
      fieldName: destinationField
    });
    upsertMarker({
      key: "gps",
      coords: gpsCoords && !pickupCoords ? gpsCoords : null,
      color: "#0EA5E9",
      draggable: false
    });

    const routeSource = map.getSource("trip-route");
    if (routeSource) {
      routeSource.setData(makeRouteFeature(pickupCoords, hasDestination ? destinationCoords : null));
    }

    const points = [pickupCoords, hasDestination ? destinationCoords : null, gpsCoords]
      .filter(Boolean)
      .map(toLngLat)
      .filter(Boolean); // Filter out any null values from toLngLat
    if (points.length >= 2) {
      const bounds = points.reduce((currentBounds, point) => currentBounds.extend(point), new mapboxgl.LngLatBounds(points[0], points[0]));
      map.fitBounds(bounds, { padding: 70, maxZoom: 15, duration: 650 });
    } else if (points.length === 1) {
      map.easeTo({ center: points[0], zoom: Math.max(map.getZoom(), 14), duration: 650 });
    }
  }, [pickupCoords, destinationCoords, gpsCoords, pickupField, destinationField, hasDestination, mapReady]);

  const statusLabel = pickupCoords && (destinationCoords || !hasDestination)
    ? "Pins set"
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
      {/* Map container with guaranteed dimensions */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full bg-gray-900" style={{ minHeight: "300px" }} />

      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-[0_8px_18px_rgba(15,23,42,0.08)] border border-gray-100 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${pickupCoords && (destinationCoords || !hasDestination) ? "bg-green-500" : "bg-amber-500"}`} />
          <span className="text-[11px] font-semibold text-gray-700">{statusLabel}</span>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-[0_8px_18px_rgba(15,23,42,0.08)] border border-gray-100 overflow-hidden flex">
          {pickupField && (
            <button
              type="button"
              onClick={() => onActiveFieldChange?.(pickupField)}
              className={`px-3 py-1.5 text-[11px] font-bold transition-colors ${
                selectedField === pickupField ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Pickup
            </button>
          )}
          {hasDestination && (
            <button
              type="button"
              onClick={() => onActiveFieldChange?.(destinationField)}
              className={`px-3 py-1.5 text-[11px] font-bold transition-colors ${
                selectedField === destinationField ? "bg-red-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Destination
            </button>
          )}
        </div>
      </div>

      {mapError && (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-lg border border-red-200 bg-white/95 px-3 py-2 text-xs font-medium text-red-700 shadow-md">
          {mapError}
        </div>
      )}
    </div>
  );
}
