import PaystackPop from "@paystack/inline-js";

export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export const KES_CENTS_PER_KM = 43 * 100;
const RESERVATION_PERCENTAGE = 0.3;

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

export async function geocodeLocation(query) {
  if (!query?.trim()) throw new Error("Location is required for distance calculation.");
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ke&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { "Accept-Language": "en", "User-Agent": "roam-kenya-app/1.0" }
  });
  if (!response.ok) throw new Error("Unable to geocode location.");
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Location not found: ${query}`);
  }
  return {
    latitude: Number(data[0].lat),
    longitude: Number(data[0].lon),
    label: data[0].display_name
  };
}

export async function searchKenyaLocations(query) {
  if (!query?.trim() || query.trim().length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&countrycodes=ke&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { "Accept-Language": "en", "User-Agent": "roam-kenya-app/1.0" }
  });
  if (!response.ok) throw new Error("Unable to fetch location suggestions.");
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    label: item.display_name,
    shortLabel: item.name || item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon)
  }));
}

export async function reverseGeocodeLocation({ latitude, longitude }) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;
  const response = await fetch(url, {
    headers: { "Accept-Language": "en", "User-Agent": "roam-kenya-app/1.0" }
  });
  if (!response.ok) throw new Error("Unable to reverse geocode location.");
  const data = await response.json();
  return {
    label: data?.display_name || `${latitude}, ${longitude}`,
    shortLabel: data?.name || data?.display_name || `${latitude}, ${longitude}`
  };
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

export async function calculateTripPricing({ startQuery, endQuery, startCoords, endCoords, vehicleType = "Economy Sedan" }) {
  const startPoint = startCoords ?? (await geocodeLocation(startQuery));
  const endPoint = endCoords ?? (await geocodeLocation(endQuery));
  const distanceKm = calculateDistanceKm(startPoint, endPoint);
  
  const multiplier = VEHICLE_MULTIPLIERS[vehicleType] || 1.0;
  
  // Base price 100 KES/km, min 100 KES (10000 cents)
  const basePriceCents = Math.max(10000, Math.round(distanceKm * KES_CENTS_PER_KM));
  const totalPriceCents = Math.round(basePriceCents * multiplier);
  
  const reservationFeeCents = getReservationAmount(totalPriceCents);
  const finalPaymentCents = totalPriceCents - reservationFeeCents;

  return {
    startPoint,
    endPoint,
    distanceKm: Number(distanceKm.toFixed(2)),
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

