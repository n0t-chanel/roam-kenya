import PaystackPop from "@paystack/inline-js";

export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
export const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export const KES_CENTS_PER_KM = 43 * 100;
const RESERVATION_PERCENTAGE = 0.3;
const MAPBOX_GEOCODING_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";
const MAPBOX_DIRECTIONS_URL = "https://api.mapbox.com/directions/v5/mapbox/driving";
const KENYA_BBOX = "33.501,-4.899,41.899,5.430";
const NAIROBI_PROXIMITY = "36.8219,-1.2921";
const MAPBOX_TYPES = "address,poi,place,locality,neighborhood";

export function getReservationAmount(totalPriceCents) {
  return Math.round(totalPriceCents * RESERVATION_PERCENTAGE);
}

export function formatKesFromCents(amountCents) {
  return `KES ${(amountCents / 100).toLocaleString()}`;
}

export function createPaymentReference(bookingId) {
  const cleanBookingId = (bookingId || "booking").toString().replace(/-/g, "").slice(0, 12);
  return `rk_${cleanBookingId}_${Date.now()}`;
}

function getMapboxToken() {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error("Missing VITE_MAPBOX_ACCESS_TOKEN. Add it to your .env.local file.");
  }
  return MAPBOX_ACCESS_TOKEN;
}

function normalizeMapboxFeature(feature) {
  const [longitude, latitude] = feature.center || [];
  const contextLabel = Array.isArray(feature.context)
    ? feature.context.map((item) => item.text).filter(Boolean).join(", ")
    : "";
  const label = feature.place_name || [feature.text, contextLabel].filter(Boolean).join(", ");

  return {
    label,
    shortLabel: feature.text || label,
    latitude: Number(latitude),
    longitude: Number(longitude)
  };
}

export async function geocodeLocation(query) {
  if (!query?.trim()) throw new Error("Location is required for distance calculation.");
  const params = new URLSearchParams({
    access_token: getMapboxToken(),
    autocomplete: "true",
    bbox: KENYA_BBOX,
    country: "ke",
    language: "en",
    limit: "1",
    proximity: NAIROBI_PROXIMITY,
    types: MAPBOX_TYPES
  });
  const url = `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(query)}.json?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Unable to geocode location.");
  const data = await response.json();
  if (!Array.isArray(data?.features) || data.features.length === 0) {
    throw new Error(`Location not found: ${query}`);
  }
  return normalizeMapboxFeature(data.features[0]);
}

export async function searchKenyaLocations(query) {
  if (!query?.trim() || query.trim().length < 3) return [];
  
  try {
    const params = new URLSearchParams({
      access_token: getMapboxToken(),
      autocomplete: "true",
      bbox: KENYA_BBOX,
      country: "ke",
      language: "en",
      limit: "8",
      proximity: NAIROBI_PROXIMITY,
      // Prioritize specific location types
      types: "address,place,locality,neighborhood,region",
      // Fuzzy matching for better results
      fuzzyMatch: "true"
    });
    
    const url = `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(query)}.json?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn("Mapbox API error:", response.status);
      return [];
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data?.features)) {
      return [];
    }
    
    // Filter results to ensure they're within Kenya
    const kenyaResults = data.features.filter(feature => {
      if (!feature.center || feature.center.length < 2) return false;
      const [lng, lat] = feature.center;
      // Check if within Kenya bounds
      return lng >= 33.5 && lng <= 42.0 && lat >= -4.9 && lat <= 5.5;
    });
    
    return kenyaResults.map(normalizeMapboxFeature);
  } catch (error) {
    console.error("Location search error:", error);
    return [];
  }
}

export async function reverseGeocodeLocation({ latitude, longitude }) {
  if (!latitude || !longitude) {
    throw new Error("Invalid coordinates provided.");
  }
  
  try {
    // Check if coordinates are within Kenya
    if (longitude < 33.5 || longitude > 42.0 || latitude < -4.9 || latitude > 5.5) {
      console.warn("Coordinates outside Kenya bounds:", { latitude, longitude });
    }
    
    const params = new URLSearchParams({
      access_token: getMapboxToken(),
      country: "ke",
      language: "en",
      // Include all types for reverse geocoding
      types: "address,place,locality,neighborhood,region"
    });
    
    const url = `${MAPBOX_GEOCODING_URL}/${longitude},${latitude}.json?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn("Mapbox reverse geocoding error:", response.status);
      throw new Error("Unable to reverse geocode location.");
    }
    
    const data = await response.json();
    const fallback = `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`;
    
    if (!Array.isArray(data?.features) || data.features.length === 0) {
      // Return coordinates as fallback with a note
      return {
        label: fallback,
        shortLabel: `Location (${fallback})`
      };
    }
    
    return normalizeMapboxFeature(data.features[0]);
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    const fallback = `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`;
    return {
      label: fallback,
      shortLabel: `Location (${fallback})`
    };
  }
}

export function calculateDistanceKm(start, end) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(end.latitude - start.latitude);
  const dLon = toRad(end.longitude - start.longitude);
  const lat1 = toRad(start.latitude);
  const lat2 = toRad(end.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export const VEHICLE_MULTIPLIERS = {
  "Economy Sedan": 1.0,
  "Sedan": 1.0,
  "Executive Sedan": 1.8,
  "SUV": 2.5,
  "SUV (7-seater)": 2.5,
  "Land Cruiser": 3.0,
  "Van": 3.0,
  "Van (10-seater)": 3.0,
  "Van (14-seater)": 3.5,
  "Safari Van (15-seater)": 3.5,
  "Truck": 4.0,
  "Luxury Car": 4.0,
  "Limousine": 8.0
};

async function calculateMapboxDrivingRoute(start, end) {
  const coordinates = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
  const params = new URLSearchParams({
    access_token: getMapboxToken(),
    alternatives: "false",
    geometries: "geojson",
    overview: "full",
    steps: "false",
    annotations: "duration,distance"
  });
  const response = await fetch(`${MAPBOX_DIRECTIONS_URL}/${coordinates}?${params.toString()}`);
  if (!response.ok) throw new Error(`Mapbox Directions error: ${response.status}`);
  const data = await response.json();
  const route = data?.routes?.[0];

  if (!route || !Number.isFinite(route.distance)) {
    throw new Error("Driving route was not returned by Mapbox.");
  }

  return {
    distanceKm: route.distance / 1000,
    durationMin: Math.round(route.duration / 60)
  };
}

export async function calculateTripPricing({ startQuery, endQuery, startCoords, endCoords, vehicleType = "Economy Sedan" }) {
  const startPoint = startCoords ?? (await geocodeLocation(startQuery));
  const endPoint = endCoords ?? (await geocodeLocation(endQuery));
  let distanceKm;
  let durationMin = null;
  let usedRoadDistance = false;

  try {
    const routeResult = await calculateMapboxDrivingRoute(startPoint, endPoint);
    distanceKm = routeResult.distanceKm;
    durationMin = routeResult.durationMin;
    usedRoadDistance = true;
    console.log(`✅ Road distance: ${distanceKm.toFixed(1)} km, ~${durationMin} min drive`);
  } catch (error) {
    console.warn("⚠️ Mapbox Directions failed, using straight-line fallback:", error.message);
    // Multiply straight-line by 1.35 to better approximate road distance
    const straightKm = calculateDistanceKm(startPoint, endPoint);
    distanceKm = straightKm * 1.35;
  }
  
  const multiplier = VEHICLE_MULTIPLIERS[vehicleType] || 1.0;
  
  // Base price: KES 43/km, minimum KES 100 (10000 cents)
  const basePriceCents = Math.max(10000, Math.round(distanceKm * KES_CENTS_PER_KM));
  const totalPriceCents = Math.round(basePriceCents * multiplier);
  
  const reservationFeeCents = getReservationAmount(totalPriceCents);
  const finalPaymentCents = totalPriceCents - reservationFeeCents;

  return {
    startPoint,
    endPoint,
    distanceKm: Number(distanceKm.toFixed(2)),
    durationMin,
    usedRoadDistance,
    basePriceCents,
    totalPriceCents,
    reservationFeeCents,
    finalPaymentCents,
    multiplier
  };
}

export function startPaystackCheckout({
  email,
  amount,
  reference,
  metadata,
  onSuccess,
  onCancel
}) {
  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error("Missing VITE_PAYSTACK_PUBLIC_KEY. Add it to your .env.local file.");
  }

  if (!email) {
    throw new Error("A valid user email is required for Paystack checkout.");
  }

  if (!amount || amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const paystack = new PaystackPop();
  paystack.newTransaction({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount,
    currency: "KES",
    reference,
    metadata,
    onSuccess,
    onCancel
  });
}

