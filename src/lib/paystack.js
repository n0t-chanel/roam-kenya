import PaystackPop from "@paystack/inline-js";

export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

const RESERVATION_PRICES_KES_CENTS = {
  "Airport Transfer": 50000,
  "Chauffeur Rental": 150000,
  "Hotel Transfer": 60000,
  "Intercity Ride": 120000,
  "Wedding Travel": 250000,
  "Safari Tour": 300000,
  "Fleet Management": 200000
};

export function getReservationAmount(serviceCategory) {
  return RESERVATION_PRICES_KES_CENTS[serviceCategory] ?? 50000;
}

export function formatKesFromCents(amountCents) {
  return `KES ${(amountCents / 100).toLocaleString()}`;
}

export function createPaymentReference(bookingId) {
  const cleanBookingId = (bookingId || "booking").toString().replace(/-/g, "").slice(0, 12);
  return `rk_${cleanBookingId}_${Date.now()}`;
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

