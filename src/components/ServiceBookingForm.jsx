import React, { useState, useEffect, useRef } from "react";
import { Calendar, Clock, MapPin, Users, Phone, ArrowLeft, AlertCircle, CheckCircle, Loader, Plane, Car, Hotel, Heart, Camera, CreditCard, Navigation, Crosshair, Shield, Info, Truck, Banknote } from "lucide-react";
import BookingMap from "./BookingMap";
import { useDatabase } from "../hooks/useDatabase";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { sendBookingEmail } from "../lib/emailService";
import {
  calculateTripPricing,
  createPaymentReference,
  formatKesFromCents,
  reverseGeocodeLocation,
  startPaystackCheckout,
  VEHICLE_MULTIPLIERS
} from "../lib/paystack";
import {
  searchLocationAliases,
  KENYA_AIRPORTS
} from "../lib/kenyaLocations";
import { searchLocationsUnified } from "../lib/locationSearch";
import { verifyPaymentServerSide } from "../lib/paymentVerification";
import { initiateMpesaStkPush, verifyMpesaReceipt } from "../lib/mpesa";

export default function ServiceBookingForm({ serviceType, onBack }) {
  const { user } = useAuthContext();
  const bookingsDb = useDatabase('bookings');
  const [bookingId, setBookingId] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState(null);
  const [pickupGps, setPickupGps] = useState(null);
  const paymentMethodOptions = [
    { value: "paystack", label: "Paystack (Card/Bank)" },
    { value: "mpesa", label: "M-Pesa (STK Push)" },
    { value: "cash", label: "Cash (Pay Later)" }
  ];
  const mpesaIconSrc = "/assets/icons8-mpesa%20(1).svg";
  const paymentMethodIcons = {
    paystack: CreditCard,
    mpesa: Phone,
    cash: Banknote
  };
  const [reservationPaymentMethod, setReservationPaymentMethod] = useState("paystack");
  const [finalPaymentMethod, setFinalPaymentMethod] = useState("paystack");

    // Service icons mapping
  const serviceIcons = {
    "airport-transfer": Plane,
    "hotel-transfer": Hotel,
    "intercity-ride": MapPin,
    "wedding-travel": Heart,
    "safari-tour": Camera,
  };

    // Vehicle type options for each service
  const vehicleOptions = {
    "airport-transfer": ["Economy Sedan", "Executive Sedan", "SUV (7-seater)", "Luxury Car"],
    "hotel-transfer": ["Economy Sedan", "Executive Sedan", "SUV (7-seater)"],
    "intercity-ride": ["Economy Sedan", "Executive Sedan", "SUV (7-seater)", "Van (14-seater)"],
    "wedding-travel": ["Executive Sedan", "Luxury Car", "SUV (7-seater)", "Limousine"],
    "safari-tour": ["SUV (7-seater)", "Land Cruiser", "Safari Van (15-seater)"],
  };

  // Service-specific field configurations
  const serviceFields = {
    "airport-transfer": {
      label: "Airport Transfer",
      fields: [
        { name: "airport", label: "Airport", placeholder: "JKIA or Wilson", required: true },
        { name: "destination", label: "Destination", placeholder: "Your destination", required: true },
        { name: "flightNumber", label: "Flight Number (Optional)", placeholder: "e.g., KQ101", required: false },
        { name: "date", label: "Arrival Date", type: "date", required: true },
        { name: "time", label: "Pickup Time", type: "time", required: true },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["airport-transfer"], required: true },
        { name: "passengers", label: "Passengers", type: "number", min: 1, max: 10, required: true }
      ]
    },
    "hotel-transfer": {
      label: "Hotel Transfer",
      fields: [
        { name: "hotelName", label: "Hotel Name", placeholder: "Name of your hotel", required: true },
        { name: "destination", label: "Destination", placeholder: "Where are you arriving from?", required: true },
        { name: "checkInDate", label: "Check-in Date", type: "date", required: true },
        { name: "checkInTime", label: "Check-in Time", type: "time", required: true },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["hotel-transfer"], required: true },
        { name: "passengers", label: "Passengers", type: "number", min: 1, max: 6, required: true }
      ]
    },
    "intercity-ride": {
      label: "Intercity Ride",
      fields: [
        { name: "pickup", label: "From", placeholder: "Starting location", required: true },
        { name: "destination", label: "To", placeholder: "Destination city", required: true },
        { name: "date", label: "Travel Date", type: "date", required: true },
        { name: "time", label: "Departure Time", type: "time", required: true },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["intercity-ride"], required: true },
        { name: "passengers", label: "Passengers", type: "number", min: 1, max: 8, required: true }
      ]
    },
    "wedding-travel": {
      label: "Wedding Travel",
      fields: [
        { name: "pickup", label: "Pickup Location", placeholder: "Where should we pick you up?", required: true },
        { name: "destination", label: "Destination / Venue", placeholder: "Wedding venue or drop-off location", required: true },
        { name: "eventDate", label: "Event Date", type: "date", required: true },
        { name: "eventTime", label: "Event Time", type: "time", required: true },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["wedding-travel"], required: true },
        { name: "guestCount", label: "Guest Count", type: "number", min: 1, max: 20, required: true },
        { name: "specialRequests", label: "Special Requests", placeholder: "e.g., flowers, decorations", required: false }
      ]
    },
	    "safari-tour": {
	      label: "Safari Tour",
	      fields: [
	        { name: "pickup", label: "Start Location", placeholder: "e.g., Nairobi, JKIA, or your hotel", required: true },
	        { name: "destination", label: "Safari Destination", placeholder: "e.g., Maasai Mara, Amboseli, Ol Pejeta", required: true },
	        { name: "startDate", label: "Start Date", type: "date", required: true },
	        { name: "startTime", label: "Start Time", type: "time", required: true },
	        { name: "vehicleType", label: "Vehicle Type", type: "select", options: vehicleOptions["safari-tour"], required: true },
        { name: "duration", label: "Duration (Days)", type: "number", min: 1, max: 7, required: true },
        { name: "guestCount", label: "Guests", type: "number", min: 1, max: 20, required: true }
      ]
    }
  };

	  const config = serviceFields[serviceType] || serviceFields["airport-transfer"];
	  const isQuoteOnlyService = serviceType === "safari-tour";
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState({});
  const [locationCoords, setLocationCoords] = useState({});
  const [locationLoadingField, setLocationLoadingField] = useState(null);
  const [activeLocationField, setActiveLocationField] = useState(null);
  const [tripEstimate, setTripEstimate] = useState(null);
  const [estimateError, setEstimateError] = useState(null);
  const searchDebounceRef = useRef({});
  const mpesaTimeoutRef = useRef(null);
  const mpesaPollingRef = useRef(null);
  const mpesaCountdownRef = useRef(null);
  const activeBookingRef = useRef(null);
  const [mpesaRetryAvailable, setMpesaRetryAvailable] = useState(false);
  const [mpesaPendingStage, setMpesaPendingStage] = useState(null);
  const [mpesaProcessing, setMpesaProcessing] = useState(false);
  const [mpesaModalVisible, setMpesaModalVisible] = useState(false);
  const [mpesaCountdown, setMpesaCountdown] = useState(90);
  const [mpesaReference, setMpesaReference] = useState(null);
  const [mpesaReceiptInput, setMpesaReceiptInput] = useState("");
  const [mpesaReceiptLoading, setMpesaReceiptLoading] = useState(false);

	  // Function to get vehicle capacity based on vehicle type
	  const getVehicleCapacity = (vehicleType) => {
	    if (!vehicleType) return 10; // Default fallback
	    if (vehicleType.includes('7-seater')) return 7;
	    if (vehicleType.includes('10-seater')) return 10;
	    if (vehicleType.includes('14-seater') || vehicleType.includes('15-seater')) return 15;
	    if (vehicleType.includes('Land Cruiser')) return 4;
	    if (vehicleType.includes('Luxury') || vehicleType.includes('Executive')) return 4;
	    if (vehicleType.includes('Limousine')) return 6;
	    return 10; // Default for other types
	  };

  const locationFieldPriority = ["pickup", "airport", "location", "destination", "hotelName", "eventVenue", "tourType"];
  const fieldNames = config.fields.map((field) => field.name);
  const resolvedLocationFields = (() => {
    const pickupField = locationFieldPriority.find((name) => fieldNames.includes(name));
    const dropoffField =
      locationFieldPriority.find((name) => fieldNames.includes(name) && name !== pickupField) || pickupField;
    return { pickupField, dropoffField };
  })();

  const isLocationField = (name) => name === resolvedLocationFields.pickupField || name === resolvedLocationFields.dropoffField;

  const getFieldLayoutClass = (field) => {
    if (field.type === "date" || field.type === "time") {
      return "min-w-0";
    }

    return "min-w-0 sm:col-span-2";
  };

  const getSearchProximity = (fieldName) => {
    if (fieldName !== resolvedLocationFields.pickupField) {
      return pickupGps || locationCoords[resolvedLocationFields.pickupField] || null;
    }

    return pickupGps || locationCoords[resolvedLocationFields.dropoffField] || null;
  };

  const normalizeSuggestionForDisplay = (suggestion) => ({
    ...suggestion,
    label: suggestion.label || suggestion.fullLabel || suggestion.name || suggestion.shortLabel || "Kenya location",
    shortLabel: suggestion.shortLabel || suggestion.name || suggestion.label || suggestion.fullLabel || "Kenya location"
  });

  const queueLocationSearch = (fieldName, value) => {
    const query = value?.trim();
    if (searchDebounceRef.current[fieldName]) {
      clearTimeout(searchDebounceRef.current[fieldName]);
    }

    if (!query || query.length < 2) {
      setLocationSuggestions((prev) => ({ ...prev, [fieldName]: [] }));
      setLocationLoadingField((current) => (current === fieldName ? null : current));
      return;
    }

    const requestId = Date.now();
    searchDebounceRef.current[fieldName + '_id'] = requestId;

    const aliasResults = searchLocationAliases(query).map(normalizeSuggestionForDisplay);
    if (aliasResults.length > 0) {
      setLocationSuggestions((prev) => ({ ...prev, [fieldName]: aliasResults }));
      setLocationLoadingField((current) => (current === fieldName ? null : current));
    }

    // Use unified search (Local → Nominatim → Mapbox) with debounce
    searchDebounceRef.current[fieldName] = setTimeout(async () => {
      // Double check if this is still the active request
      if (searchDebounceRef.current[fieldName + '_id'] !== requestId) return;

      setLocationLoadingField(fieldName);
      try {
        const suggestions = await searchLocationsUnified(query, {
          proximity: getSearchProximity(fieldName)
        });
        if (searchDebounceRef.current[fieldName + '_id'] === requestId) {
          setLocationSuggestions((prev) => ({
            ...prev,
            [fieldName]: suggestions.map(normalizeSuggestionForDisplay)
          }));
        }
      } catch (error) {
        // Ignore AbortError as it was cancelled intentionally by a subsequent request
        if (error.name !== 'AbortError') {
          console.error("Location suggestion error:", error);
          if (searchDebounceRef.current[fieldName + '_id'] === requestId && aliasResults.length === 0) {
            setLocationSuggestions((prev) => ({ ...prev, [fieldName]: [] }));
          }
        }
      } finally {
        if (searchDebounceRef.current[fieldName + '_id'] === requestId) {
          setLocationLoadingField((current) => (current === fieldName ? null : current));
        }
      }
    }, 220);
  };

  const handleLocationSelect = (fieldName, suggestion) => {
    // Validate suggestion has required coordinates
    if (!suggestion || typeof suggestion.latitude !== 'number' || typeof suggestion.longitude !== 'number') {
      console.error("Invalid suggestion object:", suggestion);
      setEstimateError("Invalid location selected. Please try again.");
      return;
    }
    
    // Invalidate any ongoing searches
    searchDebounceRef.current[fieldName + '_id'] = Date.now();

    if (fieldName === resolvedLocationFields.pickupField) {
      setPickupGps(null);
    }
    setFormData((prev) => ({ ...prev, [fieldName]: suggestion.shortLabel || suggestion.label }));
    setLocationCoords((prev) => ({
      ...prev,
      [fieldName]: {
        latitude: suggestion.latitude,
        longitude: suggestion.longitude
      }
    }));
    setLocationSuggestions((prev) => ({ ...prev, [fieldName]: [] }));
    setActiveLocationField(null);
    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleMapLocationPick = async (fieldName, coordinates) => {
    if (!fieldName || !coordinates) return;

    // Invalidate any ongoing searches
    searchDebounceRef.current[fieldName + '_id'] = Date.now();

    const fallbackLabel = `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;

    if (fieldName === resolvedLocationFields.pickupField) {
      setPickupGps(null);
    }

    setLocationLoadingField(fieldName);
    setLocationCoords((prev) => ({
      ...prev,
      [fieldName]: coordinates
    }));
    setLocationSuggestions((prev) => ({ ...prev, [fieldName]: [] }));
    setActiveLocationField(fieldName);

    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({ ...prev, [fieldName]: null }));
    }

    try {
      const place = await reverseGeocodeLocation(coordinates);
      setFormData((prev) => ({
        ...prev,
        [fieldName]: place.shortLabel || place.label || fallbackLabel
      }));
    } catch (error) {
      console.error("Mapbox reverse geocoding error:", error);
      setFormData((prev) => ({
        ...prev,
        [fieldName]: fallbackLabel
      }));
    } finally {
      setLocationLoadingField((current) => (current === fieldName ? null : current));
    }
  };

  // Initialize form data
  useEffect(() => {
    const initialData = {};
    config.fields.forEach(field => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
    setLocationSuggestions({});
    setLocationCoords({});
    setActiveLocationField(null);
    setTripEstimate(null);
    setEstimateError(null);
  }, [serviceType]);

  useEffect(
    () => () => {
      Object.values(searchDebounceRef.current).forEach((timer) => clearTimeout(timer));
      if (mpesaTimeoutRef.current) {
        clearTimeout(mpesaTimeoutRef.current);
      }
      if (mpesaPollingRef.current) {
        clearInterval(mpesaPollingRef.current);
      }
      if (mpesaCountdownRef.current) {
        clearInterval(mpesaCountdownRef.current);
      }
    },
    []
  );

  useEffect(() => {
    activeBookingRef.current = activeBooking;
    if (activeBooking?.paymentStatus === "paid" || activeBooking?.paymentStatus === "reservation_paid") {
      if (mpesaTimeoutRef.current) {
        clearTimeout(mpesaTimeoutRef.current);
        mpesaTimeoutRef.current = null;
      }
      if (mpesaPollingRef.current) {
        clearInterval(mpesaPollingRef.current);
        mpesaPollingRef.current = null;
      }
      if (mpesaCountdownRef.current) {
        clearInterval(mpesaCountdownRef.current);
        mpesaCountdownRef.current = null;
      }
      setMpesaRetryAvailable(false);
      setMpesaPendingStage(null);
      setMpesaProcessing(false);
      setMpesaModalVisible(false);
      setMpesaReference(null);
    }
  }, [activeBooking]);

	  useEffect(() => {
	    const pickupField = resolvedLocationFields.pickupField;
	    const dropoffField = resolvedLocationFields.dropoffField;

	    if (isQuoteOnlyService) {
	      setTripEstimate(null);
	      setEstimateError(null);
	      return;
	    }

	    if (!pickupField || !dropoffField) {
	      setTripEstimate(null);
      setEstimateError(null);
      return;
    }

    const startQuery = formData[pickupField]?.trim();
    const endQuery = formData[dropoffField]?.trim();

    if (!startQuery || !endQuery || startQuery.length < 3 || endQuery.length < 3) {
      setTripEstimate(null);
      setEstimateError(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const pricing = await calculateTripPricing({
          startQuery,
          endQuery,
          startCoords: pickupGps || locationCoords[pickupField],
          endCoords: locationCoords[dropoffField],
          vehicleType: formData.vehicleType || config.fields.find(f => f.name === "vehicleType")?.options[0] || "Economy Sedan"
        });
        setTripEstimate(pricing);
        setEstimateError(null);
      } catch (error) {
        setTripEstimate(null);
        setEstimateError(error.message);
      }
    }, 350);

    return () => clearTimeout(timer);
	  }, [formData, locationCoords, pickupGps, resolvedLocationFields.pickupField, resolvedLocationFields.dropoffField, isQuoteOnlyService]);

  const validateForm = () => {
    const errors = {};

    config.fields.forEach(field => {
      if (field.required && !formData[field.name]?.toString().trim()) {
        errors[field.name] = `${field.label} is required`;
      } else if (field.required && isLocationField(field.name) && !locationCoords[field.name]) {
        if (field.name === resolvedLocationFields.pickupField && pickupGps) {
          // GPS is used, it's valid
        } else {
          errors[field.name] = `Please select ${field.label.toLowerCase()} from the suggestions`;
        }
      }
    });

    // Validate date fields are not in past
    const dateFields = config.fields.filter(f => f.type === "date");
    dateFields.forEach(field => {
      if (formData[field.name]) {
        const selectedDate = new Date(formData[field.name]);
        const today = new Date();
        const selectedDateOnly = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (selectedDateOnly < todayDateOnly) {
          errors[field.name] = "Please select today or a future date";
        }
      }
    });

    // Validate end date is after start date
    if (formData.endDate && formData.startDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errors.endDate = "End date must be after start date";
      }
    }

    if (!phoneNumber.trim()) {
      errors.phone = "Phone number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-set time when flight number is entered (for airport transfers)
    if (serviceType === "airport-transfer" && name === "flightNumber" && value.trim()) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        time: currentTime,
        // Also auto-set today's date for airport pickups
        date: prev.date || new Date().toISOString().split('T')[0]
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (isLocationField(name)) {
      if (name === resolvedLocationFields.pickupField) {
        setPickupGps(null);
      }
      setLocationCoords((prev) => ({ ...prev, [name]: null }));
      setActiveLocationField(name);
      queueLocationSearch(name, value);
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user) {
      setSubmitStatus({ type: "error", message: "Please login to make a booking" });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const pickupLocationValue =
        (resolvedLocationFields.pickupField ? formData[resolvedLocationFields.pickupField] : "") ||
        formData.pickup ||
        formData.airport ||
        formData.location ||
        formData.destination ||
        formData.hotelName ||
        formData.eventVenue ||
        formData.tourType ||
        formData.purpose ||
        "";
      const destinationLocationValue =
        (resolvedLocationFields.dropoffField ? formData[resolvedLocationFields.dropoffField] : "") ||
        formData.destination ||
        formData.hotelName ||
        formData.eventVenue ||
        formData.tourType ||
        pickupLocationValue;

	      if (!pickupLocationValue || !destinationLocationValue) {
	        throw new Error(
	          isQuoteOnlyService
	            ? "Start location and safari destination are required."
	            : "Pickup and destination are required for distance-based pricing."
	        );
	      }
	
	      const pricing = isQuoteOnlyService
	        ? null
	        : await calculateTripPricing({
	            startQuery: pickupLocationValue,
	            endQuery: destinationLocationValue,
	            startCoords: pickupGps || locationCoords[resolvedLocationFields.pickupField],
	            endCoords: locationCoords[resolvedLocationFields.dropoffField],
	            vehicleType: formData.vehicleType || "Economy Sedan"
	          });

	      const durationLabel = formData.duration
	        ? `${formData.duration} Day${Number(formData.duration) === 1 ? "" : "s"}`
	        : formData.rentalPeriod || "Full Day";
	      const notes = [
	        formData.specialRequests,
	        isQuoteOnlyService ? "Quote requested by customer" : null,
	        `Phone: ${phoneNumber}`
	      ].filter(Boolean).join(". ");

      // Prepare booking payload with minimal required fields
      const bookingPayload = {
        user_id: user.id,
        pickup_location: pickupLocationValue,
        destination_location: destinationLocationValue,
        flight_number: formData.flightNumber || null,
        booking_date: formData.date || formData.startDate || formData.checkInDate || formData.eventDate || new Date().toISOString().split("T")[0],
        pickup_time: formData.time || formData.startTime || formData.checkInTime || formData.eventTime || "09:00", // Use selected time or default
	        duration: durationLabel,
	        passengers: parseInt(formData.passengers || formData.guestCount || "1"),
	        vehicle_type: formData.vehicleType || "Standard", // Now from user selection
	        service_category: config.label,
	        status: "pending",
	        payment_status: isQuoteOnlyService ? "awaiting_quote" : "unpaid",
	        price_amount: pricing?.reservationFeeCents ?? null,
	        total_price: pricing?.totalPriceCents ?? null,
	        notes,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Save booking to database
      const savedBooking = await bookingsDb.insert([bookingPayload]);

      if (!savedBooking || savedBooking.length === 0) {
        throw new Error("Failed to create booking");
      }

      const bid = savedBooking[0].id;
      setBookingId(bid);

      // Auto-save user to user_profiles so admin can see their details
      try {
        const metadata = user.user_metadata || {};
        let resolvedName = metadata.full_name || metadata.name;
        if (!resolvedName) {
          resolvedName = metadata.is_anonymous ? 'Guest User' : user.email;
        }

        await supabase.from("user_profiles").upsert(
          {
            id: user.id,
            email: user.email,
            full_name: resolvedName,
            phone: phoneNumber,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );
      } catch (profileErr) {
        console.error("Failed to auto-save user profile:", profileErr);
      }

      // If flight number provided (for airport transfers), start tracking
      if (formData.flightNumber?.trim() && serviceType === "airport-transfer") {
        try {
          console.log('✈️ Starting flight tracking with booking ID:', bid);
          
          // Insert flight_bookings record directly
          const { data: flightBookingData, error: flightErr } = await supabase
            .from('flight_bookings')
            .insert({
              booking_id: bid,
              user_id: user.id,
              flight_number: formData.flightNumber.toUpperCase(),
              tracking_status: 'waiting',
              updated_at: new Date()
            })
            .select();
      
          if (flightErr) {
            console.error('Flight booking error:', flightErr);
            throw flightErr;
          }
      
          console.log('✅ Flight tracking started:', flightBookingData);
        } catch (trackErr) {
          console.error('Flight tracking failed:', trackErr);
        }
      }

      // Send WhatsApp confirmation as backup
      try {
        console.log("💬 Sending WhatsApp confirmation...");
        const bookingDetails = `
✅ *${config.label} Confirmed!*
Booking ID: ${bid}
Pickup: ${bookingPayload.pickup_location}
Destination: ${bookingPayload.destination_location}
Date: ${bookingPayload.booking_date}
Time: ${bookingPayload.pickup_time}
Passengers: ${bookingPayload.passengers}
${formData.flightNumber ? `Flight: ${formData.flightNumber}` : ""}

Thank you for booking with us!
        `;
        
        // Send via WhatsApp API (you'll need to configure this)
        // For now, log it
        console.log("WhatsApp message queued:", bookingDetails);
      } catch (whatsappErr) {
        console.error("WhatsApp sending error:", whatsappErr);
      }

	      const reservationAmount = pricing?.reservationFeeCents ?? null;
	      setSubmitStatus({
	        type: "success",
	        message: isQuoteOnlyService
	          ? "Booking confirmed. Please wait for a quote to be processed."
	          : `${config.label} booking confirmed. Proceed to payment to reserve this booking.`
	      });
	      setActiveBooking({
        id: bid,
        service: config.label,
        pickupLocation: bookingPayload.pickup_location || "Not specified",
        destinationLocation: bookingPayload.destination_location || "Not specified",
	        date: bookingPayload.booking_date,
	        time: bookingPayload.pickup_time,
	        duration: bookingPayload.duration,
	        passengers: bookingPayload.passengers,
        vehicleType: bookingPayload.vehicle_type,
        phoneNumber,
	        status: isQuoteOnlyService ? "Quote Pending" : "Active",
	        flightNumber: bookingPayload.flight_number || null,
	        paymentStatus: bookingPayload.payment_status,
	        paymentMethod: bookingPayload.payment_method || null,
	        paymentStage: bookingPayload.payment_stage || null,
	        reservationAmount,
	        totalPriceAmount: pricing?.totalPriceCents ?? null,
	        finalPaymentAmount: pricing?.finalPaymentCents ?? null,
	        distanceKm: pricing?.distanceKm ?? null,
	        pricingStart: pricing?.startPoint ?? null,
	        pricingEnd: pricing?.endPoint ?? null,
	        quoteOnly: isQuoteOnlyService,
	        paymentReference: null
	      });
    } catch (err) {
      console.error("Booking error:", err);
      setSubmitStatus({
        type: "error",
        message: `Error: ${err.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    const initialData = {};
    config.fields.forEach(field => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
    setPhoneNumber("");
    setFormErrors({});
    setSubmitStatus(null);
    setActiveBooking(null);
    setBookingId(null);
    setPaymentFeedback(null);
    setIsPaying(false);
    setPickupGps(null);
    setTripEstimate(null);
    setEstimateError(null);
    setLocationSuggestions({});
    setLocationCoords({});
    setActiveLocationField(null);
  };

  const enableGpsPickup = () => {
    setPaymentFeedback(null);
    if (!navigator.geolocation) {
      setPaymentFeedback({
        type: "error",
        message: "Geolocation is not supported on this device/browser."
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setPickupGps(coordinates);

        if (resolvedLocationFields.pickupField) {
          setLocationCoords((prev) => ({
            ...prev,
            [resolvedLocationFields.pickupField]: coordinates
          }));
          try {
            const place = await reverseGeocodeLocation(coordinates);
            setFormData((prev) => ({
              ...prev,
              [resolvedLocationFields.pickupField]: place.shortLabel || place.label
            }));
          } catch (reverseError) {
            console.error("Reverse geocoding error:", reverseError);
            setFormData((prev) => ({
              ...prev,
              [resolvedLocationFields.pickupField]: `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
            }));
          }
        }
      },
      (error) => {
        setPaymentFeedback({
          type: "error",
          message: `Unable to access GPS location: ${error.message}`
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleBookingPayment = async (stage) => {
    if (!activeBooking?.id || !user?.id) {
      setPaymentFeedback({
        type: "error",
        message: "Missing booking session. Please create your booking again."
      });
      return;
    }

    const paymentStage = stage === "final" ? "final" : "reservation";
    const amount =
      paymentStage === "final" ? activeBooking.finalPaymentAmount : activeBooking.reservationAmount;
    const selectedMethod =
      paymentStage === "final" ? finalPaymentMethod : reservationPaymentMethod;

    if (!amount || amount <= 0) {
      setPaymentFeedback({
        type: "error",
        message: "Payment amount is missing for this booking."
      });
      return;
    }

    if (selectedMethod === "mpesa" && !phoneNumber) {
      setPaymentFeedback({
        type: "error",
        message: "Add a valid phone number to complete M-Pesa payment."
      });
      return;
    }

    if (mpesaTimeoutRef.current) {
      clearTimeout(mpesaTimeoutRef.current);
      mpesaTimeoutRef.current = null;
    }
    if (mpesaPollingRef.current) {
      clearInterval(mpesaPollingRef.current);
      mpesaPollingRef.current = null;
    }
    if (mpesaCountdownRef.current) {
      clearInterval(mpesaCountdownRef.current);
      mpesaCountdownRef.current = null;
    }
    setMpesaRetryAvailable(false);
    setMpesaPendingStage(null);
    setMpesaProcessing(false);
    setMpesaModalVisible(false);
    setMpesaReference(null);
    setMpesaReceiptInput("");

    setIsPaying(true);
    setPaymentFeedback(null);

    if (selectedMethod === "cash") {
      const reference = `cash_${createPaymentReference(activeBooking.id)}`;
      try {
        const { error: insertError } = await supabase
          .from("payments")
          .insert({
            booking_id: activeBooking.id,
            user_id: user.id,
            amount,
            payment_method: "cash",
            payment_stage: paymentStage,
            reference,
            status: "pending",
            provider_payload: null
          });

        if (insertError) {
          throw new Error(insertError.message);
        }

        await supabase
          .from("bookings")
          .update({
            payment_status: paymentStage === "final" ? "final_pending" : "reservation_pending",
            payment_method: "cash",
            payment_stage: paymentStage,
            payment_reference: reference,
            updated_at: new Date().toISOString()
          })
          .eq("id", activeBooking.id)
          .eq("user_id", user.id);

        setActiveBooking((prev) =>
          prev
            ? {
                ...prev,
                paymentStatus: paymentStage === "final" ? "final_pending" : "reservation_pending",
                paymentMethod: "cash",
                paymentStage: paymentStage,
                paymentReference: reference
              }
            : prev
        );

        setPaymentFeedback({
          type: "success",
          message: "Cash payment recorded. An admin will confirm once payment is received."
        });
      } catch (err) {
        setPaymentFeedback({
          type: "error",
          message: err.message
        });
      } finally {
        setIsPaying(false);
      }
      return;
    }

    if (selectedMethod === "mpesa") {
      try {
        setMpesaProcessing(true);
        setMpesaModalVisible(true);
        setMpesaCountdown(90);
        const response = await initiateMpesaStkPush(supabase, {
          bookingId: activeBooking.id,
          amount,
          phone: phoneNumber,
          paymentStage
        });

        if (!response?.success) {
          throw new Error(response?.error || "Failed to initiate M-Pesa payment.");
        }

        setActiveBooking((prev) =>
          prev
            ? {
                ...prev,
                paymentStatus: paymentStage === "final" ? "final_pending" : "reservation_pending",
                paymentMethod: "mpesa",
                paymentStage,
                paymentReference: response.reference || prev.paymentReference
              }
            : prev
        );
        setMpesaPendingStage(paymentStage);
        setMpesaReference(response.reference || null);
        if (mpesaCountdownRef.current) {
          clearInterval(mpesaCountdownRef.current);
        }
        mpesaCountdownRef.current = setInterval(() => {
          setMpesaCountdown((prev) => {
            if (prev <= 1) {
              if (mpesaCountdownRef.current) {
                clearInterval(mpesaCountdownRef.current);
                mpesaCountdownRef.current = null;
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        if (mpesaPollingRef.current) {
          clearInterval(mpesaPollingRef.current);
        }
        mpesaPollingRef.current = setInterval(async () => {
          if (!response.reference) return;
          const { data: payment, error: paymentError } = await supabase
            .from("payments")
            .select("status, provider_reference, payment_stage, payment_method")
            .eq("reference", response.reference)
            .maybeSingle();

          if (paymentError || !payment) return;

          if (payment.status === "completed") {
            if (mpesaTimeoutRef.current) {
              clearTimeout(mpesaTimeoutRef.current);
              mpesaTimeoutRef.current = null;
            }
            if (mpesaPollingRef.current) {
              clearInterval(mpesaPollingRef.current);
              mpesaPollingRef.current = null;
            }
            if (mpesaCountdownRef.current) {
              clearInterval(mpesaCountdownRef.current);
              mpesaCountdownRef.current = null;
            }
            const confirmedStage = payment.payment_stage || paymentStage;
            const receipt = payment.provider_reference || response.reference;
            setActiveBooking((prev) =>
              prev
                ? {
                    ...prev,
                    paymentStatus: confirmedStage === "final" ? "paid" : "reservation_paid",
                    paymentMethod: payment.payment_method || "mpesa",
                    paymentStage: confirmedStage,
                    paymentReference: receipt
                  }
                : prev
            );
            setPaymentFeedback({
              type: "success",
              message: `Payment confirmed. M-Pesa receipt: ${receipt}.`
            });
            setMpesaProcessing(false);
            setMpesaModalVisible(false);
            setMpesaRetryAvailable(false);
          }

          if (payment.status === "failed" || payment.status === "cancelled") {
            if (mpesaTimeoutRef.current) {
              clearTimeout(mpesaTimeoutRef.current);
              mpesaTimeoutRef.current = null;
            }
            if (mpesaPollingRef.current) {
              clearInterval(mpesaPollingRef.current);
              mpesaPollingRef.current = null;
            }
            if (mpesaCountdownRef.current) {
              clearInterval(mpesaCountdownRef.current);
              mpesaCountdownRef.current = null;
            }
            setPaymentFeedback({
              type: "error",
              message: "M-Pesa payment failed or was cancelled. You can retry."
            });
            setMpesaRetryAvailable(true);
            setMpesaProcessing(false);
            setMpesaModalVisible(false);
          }
        }, 5000);
        mpesaTimeoutRef.current = setTimeout(() => {
          const current = activeBookingRef.current;
          const stillPending =
            current?.paymentMethod === "mpesa" &&
            ["reservation_pending", "final_pending"].includes(current?.paymentStatus);

          if (stillPending) {
            setPaymentFeedback({
              type: "error",
              message:
                "M-Pesa payment not confirmed. If you cancelled or the prompt expired, you can retry."
            });
            setMpesaRetryAvailable(true);
            setMpesaProcessing(false);
            setMpesaModalVisible(false);
          }
        }, 90000);
        setPaymentFeedback({
          type: "success",
          message: response.message || "M-Pesa STK push initiated. Complete the prompt on your phone."
        });
      } catch (err) {
        setPaymentFeedback({
          type: "error",
          message: err.message
        });
        setMpesaProcessing(false);
        setMpesaModalVisible(false);
      } finally {
        setIsPaying(false);
      }
      return;
    }

    const reference = createPaymentReference(activeBooking.id);

    try {
      const { error: insertError } = await supabase
        .from("payments")
        .insert({
          booking_id: activeBooking.id,
          user_id: user.id,
          amount,
          payment_method: "paystack",
          payment_stage: paymentStage,
          reference,
          status: "pending",
          paystack_response: null
        });

      if (insertError) {
        throw new Error(
          insertError.message.includes("payments")
            ? "Payments table is not ready. Run PAYSTACK_MIGRATIONS.sql in Supabase, then retry."
            : insertError.message
        );
      }

      startPaystackCheckout({
        email: user.email,
        amount,
        reference,
        metadata: {
          bookingId: activeBooking.id,
          userId: user.id,
          service: activeBooking.service,
          paymentStage
        },
        onSuccess: async (transaction) => {
          try {
            const verifyResult = await verifyPaymentServerSide(supabase, {
              reference,
              bookingId: activeBooking.id,
              expectedAmount: amount,
              paymentStage,
              checkoutResponse: transaction
            });

            if (!verifyResult?.success) {
              throw new Error(verifyResult?.error || "Payment verification failed.");
            }

            setActiveBooking((prev) =>
              prev
                ? {
                    ...prev,
                    paymentStatus: paymentStage === "final" ? "paid" : "reservation_paid",
                    paymentMethod: "paystack",
                    paymentStage,
                    paymentReference: reference
                  }
                : prev
            );
            setPaymentFeedback({
              type: "success",
              message:
                verifyResult?.message ||
                `Payment verified successfully. Reference: ${reference}.`
            });

            if (paymentStage === "reservation") {
              try {
                await sendBookingEmail({
                  bookingId: activeBooking.id,
                  userEmail: user.email,
                  userName: user.user_metadata?.full_name || user.email,
                  pickupLocation: activeBooking.pickupLocation,
                  destinationLocation: activeBooking.destinationLocation,
                  pickupDate: activeBooking.date,
                  pickupTime: activeBooking.time,
                  passengers: activeBooking.passengers,
                  vehicleType: activeBooking.vehicleType,
                  flightNumber: activeBooking.flightNumber || undefined,
                  serviceType: `${activeBooking.service} (Reserved & Paid)`,
                  reservationNotice:
                    "Reservation confirmed. You can cancel your reservation within 24 hours from payment time."
                });
              } catch (emailErr) {
                console.error("Reservation email sending error:", emailErr);
              }
            }
          } catch (verifyErr) {
            await supabase
              .from("payments")
              .update({
                paystack_response: transaction,
                updated_at: new Date().toISOString()
              })
              .eq("reference", reference)
              .eq("user_id", user.id);

            setPaymentFeedback({
              type: "error",
              message: `Payment completed but verification failed: ${verifyErr.message}. Deploy 'verify-payment' function and set PAYSTACK_SECRET_KEY in Supabase secrets, then retry verification.`
            });
          } finally {
            setIsPaying(false);
          }
        },
        onCancel: async () => {
          try {
            await supabase
              .from("payments")
              .update({
                status: "cancelled",
                updated_at: new Date().toISOString()
              })
              .eq("reference", reference)
              .eq("user_id", user.id);
          } finally {
            setPaymentFeedback({
              type: "error",
              message: "Payment was cancelled. Your booking remains unpaid."
            });
            setIsPaying(false);
          }
        }
      });
    } catch (err) {
      setPaymentFeedback({
        type: "error",
        message: err.message
      });
      setIsPaying(false);
    }
  };

  const handleReceiptVerify = async () => {
    if (!activeBooking?.id) return;
    const receipt = mpesaReceiptInput.trim();
    if (!receipt) {
      setPaymentFeedback({ type: "error", message: "Enter the M-Pesa receipt code to confirm payment." });
      return;
    }

    setMpesaReceiptLoading(true);
    setPaymentFeedback(null);
    try {
      const response = await verifyMpesaReceipt(supabase, {
        bookingId: activeBooking.id,
        receipt,
        paymentStage: mpesaPendingStage || activeBooking.paymentStage || "reservation"
      });

      if (!response?.success) {
        throw new Error(response?.error || "Payment verification failed.");
      }

      const stage = mpesaPendingStage || activeBooking.paymentStage || "reservation";
      setActiveBooking((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: stage === "final" ? "paid" : "reservation_paid",
              paymentMethod: "mpesa",
              paymentStage: stage,
              paymentReference: receipt
            }
          : prev
      );
      setPaymentFeedback({
        type: "success",
        message: `Payment confirmed. M-Pesa receipt: ${receipt}.`
      });
      setMpesaProcessing(false);
      setMpesaModalVisible(false);
      setMpesaRetryAvailable(false);
    } catch (err) {
      setPaymentFeedback({
        type: "error",
        message: err.message
      });
    } finally {
      setMpesaReceiptLoading(false);
    }
  };

  const mapPickupCoords = pickupGps || locationCoords[resolvedLocationFields.pickupField] || null;
  const mapDestCoords =
    resolvedLocationFields.dropoffField && resolvedLocationFields.dropoffField !== resolvedLocationFields.pickupField
      ? locationCoords[resolvedLocationFields.dropoffField]
      : null;
  const paymentStatusValue = activeBooking?.paymentStatus || "unpaid";
  const paymentStatusIsPaid = ["reservation_paid", "paid"].includes(paymentStatusValue);
  const reservationPaymentDisabled =
    isPaying ||
    ["reservation_paid", "paid", "reservation_pending"].includes(paymentStatusValue);
  const finalPaymentReady = ["reservation_paid", "final_pending"].includes(paymentStatusValue);
  const finalPaymentDisabled = isPaying || paymentStatusValue === "paid" || !finalPaymentReady;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 sm:pt-28 pb-14 sm:pb-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#C5A059] hover:text-[#1A1A1A] transition-colors mb-6 font-semibold text-sm"
        >
          <ArrowLeft size={18} />
          Back to Services
        </button>

        {/* Header with Icon */}
        <div className="mb-6 sm:mb-8">
          <div className="booking-portal-enter flex items-start sm:items-center gap-3 sm:gap-4 mb-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 bg-[#C5A059] rounded-lg flex items-center justify-center shadow-[0_8px_20px_rgba(197,160,89,0.18)]">
              {React.createElement(serviceIcons[serviceType] || Plane, { size: 24, color: "white" })}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{config.label}</h1>
              <p className="text-gray-500 text-sm">Complete your booking details below</p>
            </div>
          </div>
        </div>

        {/* === SPLIT LAYOUT: Form Left (Narrower) + Map Right (Larger) === */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">

        {/* LEFT PANEL — Form (Narrower on desktop) */}
        <div className="w-full lg:w-[520px] lg:flex-shrink-0 min-w-0">
        {submitStatus?.type !== "success" ? (
          <form onSubmit={handleSubmit} className="booking-portal-enter bg-white rounded-xl border border-gray-200 shadow-[0_12px_34px_rgba(15,23,42,0.06)] p-4 sm:p-6 md:p-8 space-y-5">
            {/* Dynamic Service Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {config.fields.map((field) => (
                <div key={field.name} className={getFieldLayoutClass(field)}>
                  <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                    {field.label}
                    {field.required && <span className="text-red-600 ml-1">*</span>}
                  </label>
                  
                  {/* Select field for vehicle type */}
                  {field.type === "select" ? (
                    field.name === "vehicleType" ? (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {field.options?.map((option) => {
                          const multiplier = VEHICLE_MULTIPLIERS?.[option] || 1.0;
                          let priceDisplay = "Select locations for price";
                          
                          if (tripEstimate && tripEstimate.basePriceCents) {
                            const optionTotalPrice = Math.round(tripEstimate.basePriceCents * multiplier);
                            priceDisplay = formatKesFromCents(optionTotalPrice);
                          }
                          
                          const isSelected = formData[field.name] === option;
                          
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, [field.name]: option }));
                                if (formErrors[field.name]) {
                                  setFormErrors(prev => ({ ...prev, [field.name]: null }));
                                }
                              }}
                              className={`group flex flex-col p-3 rounded-lg border transition-all duration-300 ease-out text-center hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(15,23,42,0.12)] ${
                                isSelected
                                  ? "border-[#C5A059] bg-[#C5A059]/10 shadow-[0_6px_16px_rgba(197,160,89,0.10)] hover:border-[#1A1A1A] hover:bg-[#1A1A1A]"
                                  : "border-gray-200 bg-white hover:border-[#1A1A1A] hover:bg-[#1A1A1A]"
                              }`}
                            >
                              <div className="flex items-center justify-center mb-2">
                                <Car size={24} className={`${isSelected ? "text-[#C5A059]" : "text-gray-500"} group-hover:text-white transition-colors`} />
                              </div>
                              <h4 className="font-semibold text-gray-900 text-sm flex flex-wrap items-center justify-center gap-1.5 group-hover:text-white transition-colors">
                                {option.split(' ').slice(0, 2).join(' ')}
                                {(option.includes('Executive') || option.includes('Luxury') || option.includes('Limousine') || option.includes('Land Cruiser')) ? (
                                  <span className="bg-yellow-100 text-yellow-800 text-[8px] px-1.5 py-0.5 rounded-full font-bold">PREMIUM</span>
                                ) : null}
                              </h4>
                              <p className="text-[10px] text-gray-500 mt-1 group-hover:text-white/70 transition-colors">
                                {option.includes('7-seater') ? '7 pax' : option.includes('10-seater') ? '10 pax' : option.includes('14-seater') || option.includes('15-seater') ? '15 pax' : option.includes('Van') ? 'Group' : '4 pax'}
                              </p>
                              {tripEstimate && (
                                <div className={`font-bold text-sm mt-1.5 group-hover:text-white transition-colors ${isSelected ? 'text-[#C5A059]' : 'text-gray-900'}`}>
                                  {priceDisplay}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        className={`w-full rounded-lg px-4 py-3 border transition-all duration-300 ${
                          formErrors[field.name]
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        } text-gray-900 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] appearance-none cursor-pointer`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23C5A059' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                          paddingRight: '2.5rem'
                        }}
                      >
                        <option value="" disabled>
                          Select {field.label.toLowerCase()}
                        </option>
                        {field.options?.map((option) => (
                          <option key={option} value={option} className="bg-white text-gray-900">
                            {option}
                          </option>
                        ))}
                      </select>
                    )
                  ) : isLocationField(field.name) ? (
                    <div className="relative">
                      <div className="relative flex items-center">
                        {/* Uber-style dot/square icon */}
                        <div className="absolute left-3 z-10">
                          {field.name === resolvedLocationFields.pickupField ? (
                            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-md"></div>
                          ) : (
                            <div className="w-3 h-3 rounded-sm bg-red-500 border-2 border-white shadow-md"></div>
                          )}
                        </div>
                        <input
                          type="text"
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          onFocus={() => setActiveLocationField(field.name)}
                          onBlur={() => setTimeout(() => setActiveLocationField(null), 300)}
                          placeholder={field.placeholder || "Search an address or place in Kenya..."}
                          className={`w-full pl-10 ${field.name === resolvedLocationFields.pickupField ? "pr-20" : "pr-10"} py-3 border rounded-lg transition-all duration-300 ${
                            formErrors[field.name]
                              ? "border-red-500 bg-red-50"
                              : locationCoords[field.name]
                                ? "border-green-400 bg-green-50/30"
                                : "border-gray-200 bg-gray-50 hover:border-gray-300"
                          } text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/10 focus:bg-white`}
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                          {field.name === resolvedLocationFields.pickupField && (
                            <button
                              type="button"
                              onClick={enableGpsPickup}
                              title="Use my current location"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Crosshair size={18} />
                            </button>
                          )}
                          {locationCoords[field.name] && (
                            <span className="text-green-500">
                              <CheckCircle size={16} />
                            </span>
                          )}
                        </div>
                      </div>
                      {locationLoadingField === field.name && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Loader size={12} className="animate-spin text-[#C5A059]" />
                          <p className="text-xs text-gray-500">Searching locations...</p>
                        </div>
                      )}
                      {pickupGps && field.name === resolvedLocationFields.pickupField && (
                        <p className="text-[11px] text-blue-600 mt-1 flex items-center gap-1">
                          <Navigation size={10} /> GPS: {pickupGps.latitude.toFixed(4)}, {pickupGps.longitude.toFixed(4)}
                        </p>
                      )}
                      {activeLocationField === field.name && (locationSuggestions[field.name] || []).length > 0 && (
                        <div className="absolute z-20 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-[0_16px_34px_rgba(15,23,42,0.10)] max-h-56 overflow-y-auto">
                          {(locationSuggestions[field.name] || []).map((suggestion) => {
                            // Determine icon based on location type
                            let IconComponent = MapPin;
                            if (suggestion.type === "airport") {
                              IconComponent = Plane;
                            } else if (suggestion.type === "hotel") {
                              IconComponent = Hotel;
                            }
                            const title = suggestion.shortLabel || suggestion.label || suggestion.fullLabel || suggestion.name || "Kenya location";
                            const subtitle = suggestion.label || suggestion.fullLabel || "Kenya";
                            
                            return (
                              <button
                                key={`${field.name}-${suggestion.latitude}-${suggestion.longitude}-${subtitle}`}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); handleLocationSelect(field.name, suggestion); }}
                                className="group w-full text-left px-4 py-3 hover:bg-[#1A1A1A] border-b border-gray-50 last:border-b-0 flex items-start gap-3 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-white/10 flex-shrink-0 mt-0.5 transition-colors">
                                  <IconComponent size={16} className="text-[#C5A059] group-hover:text-white transition-colors" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-gray-900 group-hover:text-white transition-colors">{title}</p>
                                  <p className="text-xs text-gray-500 truncate group-hover:text-white/70 transition-colors">{subtitle}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Standard input field
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={
                        field.name === "passengers" || field.name === "guestCount"
                          ? getVehicleCapacity(formData.vehicleType)
                          : field.max
                      }
                      className={`w-full rounded-lg px-4 py-3 border transition-all duration-300 ${
                        formErrors[field.name]
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      } text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]`}
                    />
                  )}
                  
                  {formErrors[field.name] && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {formErrors[field.name]}
                    </p>
                  )}
                </div>
                ))}
              </div>

              {/* === UBER-STYLE FARE ESTIMATION CARD === */}
	              {!isQuoteOnlyService && (resolvedLocationFields.pickupField || resolvedLocationFields.dropoffField) && (
                <div className={`rounded-xl border overflow-hidden transition-all duration-500 ${
                  tripEstimate ? "border-[#C5A059]/30 bg-gradient-to-br from-white to-[#C5A059]/10 shadow-[0_10px_28px_rgba(197,160,89,0.10)]" : "border-gray-200 bg-gray-50 shadow-[0_8px_22px_rgba(15,23,42,0.03)]"
                }`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${tripEstimate ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></div>
                        <p className="text-sm font-bold text-gray-900">Trip Estimate</p>
                      </div>
                      {tripEstimate && (
                         <div className="flex items-center gap-1.5">
                           {tripEstimate.usedRoadDistance && (
                             <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Via Roads</span>
                           )}
                           <span className="text-[10px] font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
                         </div>
                       )}
                    </div>
                    <p className="text-xs text-gray-500">30% refundable reservation · Final payment after confirmation</p>
                  </div>
                  {tripEstimate ? (
                    <div className="px-4 pb-4">
                      <div className="grid gap-2 text-center grid-cols-1 sm:grid-cols-2">
                        <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total Fare</p>
                          <p className="text-lg font-black text-gray-900 mt-0.5">{formatKesFromCents(tripEstimate.totalPriceCents)}</p>
                        </div>
                        <div className="bg-[#C5A059]/10 rounded-lg border border-[#C5A059]/20 p-3">
                          <p className="text-[10px] text-[#C5A059] uppercase tracking-wider font-semibold">Reserve (30%)</p>
                          <p className="text-lg font-black text-[#C5A059] mt-0.5">{formatKesFromCents(tripEstimate.reservationFeeCents)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <Shield size={14} className="text-green-600 flex-shrink-0" />
                        <p className="text-[11px] text-green-700 font-medium">
                          30% deposit is <span className="font-bold">fully refundable</span> if cancelled within 24 hours
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                        <Info size={12} />
                        <span>Remaining {formatKesFromCents(tripEstimate.finalPaymentCents)} payable after trip confirmation</span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 pb-4">
                      <p className="text-xs text-gray-500">Select both pickup & destination from suggestions to see fare estimate</p>
                    </div>
                  )}
                  {estimateError && <p className="text-xs text-red-600 px-4 pb-3">{estimateError}</p>}
                </div>
              )}

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Your contact number"
                  className={`w-full rounded-lg px-4 py-3 border transition-all duration-300 ${
                    formErrors.phone
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  } text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]`}
                />
                {formErrors.phone && (
                  <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Special Requests <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={formData.specialRequests || ""}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, specialRequests: e.target.value }))
                  }
                  placeholder="Any special requirements or preferences..."
                  className="w-full rounded-lg px-4 py-3 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all duration-300 resize-none h-20 hover:border-gray-400"
                />
              </div>

              {/* Status Messages */}
              {submitStatus && (
                <div
                  className={`rounded-lg p-4 flex items-start gap-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] ${
                    submitStatus.type === "error"
                      ? "bg-red-100 border border-red-400 text-red-700"
                      : "bg-green-100 border border-green-400 text-green-700"
                  }`}
                >
                  {submitStatus.type === "error" ? (
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">
                    {submitStatus.message}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-[#C5A059] hover:bg-[#1A1A1A] text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-out hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_10px_24px_rgba(197,160,89,0.18)] hover:shadow-[0_14px_30px_rgba(15,23,42,0.18)] text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {tripEstimate ? `Reserve · ${formatKesFromCents(tripEstimate.reservationFeeCents)}` : "Complete Booking"}
                  </>
                )}
              </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="booking-portal-enter bg-white rounded-xl border border-green-300 p-5 sm:p-8 shadow-[0_12px_34px_rgba(22,163,74,0.08)]">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-green-100 border border-green-300 rounded-lg">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Booking Confirmed</p>
                  <p className="text-green-700">{submitStatus?.message || "Your booking has been confirmed."}</p>
                </div>
              </div>
            </div>

	            {activeBooking?.quoteOnly && (
	              <section className="bg-white rounded-xl border border-[#C5A059]/30 p-5 sm:p-8 shadow-[0_10px_28px_rgba(197,160,89,0.08)]">
	                <div className="flex items-start gap-3">
	                  <div className="mt-0.5 text-[#C5A059]"><Info size={20} /></div>
	                  <div>
	                    <h2 className="text-xl font-bold text-gray-900">Quote Pending</h2>
	                    <p className="text-sm text-gray-600 mt-1">
	                      Booking confirmed. Please wait for a quote to be processed.
	                    </p>
	                  </div>
	                </div>
	              </section>
	            )}

	            {!activeBooking?.quoteOnly && (
	              <>
	            <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-8 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Booking</h2>
                <span className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 border border-green-300">
                  {activeBooking?.status || "Active"}
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#C5A059]"><CheckCircle size={18} /></div>
                    <div>
                      <p className="text-gray-500">Booking ID</p>
                      <p className="font-semibold text-gray-900 break-all">{activeBooking?.id || bookingId}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#C5A059]"><Truck size={18} /></div>
                    <div>
                      <p className="text-gray-500">Service</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.service}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#C5A059]"><MapPin size={18} /></div>
                    <div>
                      <p className="text-gray-500">Pickup</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.pickupLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#C5A059]"><MapPin size={18} /></div>
                    <div>
                      <p className="text-gray-500">Destination</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.destinationLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#C5A059]"><Calendar size={18} /></div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.date}</p>
                    </div>
                  </div>
	                  <div className="flex items-start gap-3">
	                    <div className="mt-0.5 text-[#C5A059]"><Clock size={18} /></div>
	                    <div>
	                      <p className="text-gray-500">Time</p>
	                      <p className="font-semibold text-gray-900">{activeBooking?.time}</p>
	                    </div>
	                  </div>
	                  {activeBooking?.duration && (
		                    <div className="flex items-start gap-3">
		                      <div className="mt-0.5 text-[#C5A059]"><Calendar size={18} /></div>
		                      <div>
		                        <p className="text-gray-500">Duration</p>
		                        <p className="font-semibold text-gray-900">{activeBooking.duration}</p>
		                      </div>
		                    </div>
			            )}
	                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#C5A059]"><Users size={18} /></div>
                    <div>
                      <p className="text-gray-500">Passengers</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.passengers}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#C5A059]"><Car size={18} /></div>
                    <div>
                      <p className="text-gray-500">Vehicle</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.vehicleType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[#C5A059]"><Phone size={18} /></div>
                    <div>
                      <p className="text-gray-500">Contact</p>
                      <p className="font-semibold text-gray-900">{activeBooking?.phoneNumber}</p>
                    </div>
                  </div>
                  {activeBooking?.flightNumber && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-[#C5A059]"><Plane size={18} /></div>
                      <div>
                        <p className="text-gray-500">Flight Number</p>
                        <p className="font-semibold text-gray-900">{activeBooking.flightNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-8 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Reserve Booking Payment</h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Shield size={11} /> Refundable 24hrs
                </span>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5 space-y-3">
                <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-1">
                  <p className="text-gray-600">Total Trip Price</p>
                  <p className="text-xl font-bold text-gray-900">{formatKesFromCents(activeBooking?.totalPriceAmount || 0)}</p>
                </div>
                <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-1">
                  <p className="text-gray-600">Reservation Fee</p>
                  <p className="text-xl font-bold text-gray-900">{formatKesFromCents(activeBooking?.reservationAmount || 0)}</p>
                </div>
                <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-1">
                  <p className="text-gray-600">Final Payment (on trip confirmation)</p>
                  <p className="font-semibold text-gray-900">{formatKesFromCents(activeBooking?.finalPaymentAmount || 0)}</p>
                </div>
                <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-2">
                  <p className="text-gray-600">Payment Status</p>
                  <span
                    className={`px-3 py-1 text-xs font-semibold border uppercase ${
                      paymentStatusIsPaid
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-yellow-100 text-yellow-700 border-yellow-300"
                    }`}
                  >
                    {paymentStatusValue}
                  </span>
                </div>
                <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-2">
                  <p className="text-gray-600">Payment Method</p>
                  <span className="text-sm font-semibold text-gray-900">
                    {activeBooking?.paymentMethod || "Not selected"}
                  </span>
                </div>
                <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-2">
                  <p className="text-gray-600">Payment Stage</p>
                  <span className="text-sm font-semibold text-gray-900">
                    {activeBooking?.paymentStage || "reservation"}
                  </span>
                </div>
                {activeBooking?.paymentReference && (
                  <div>
                    <p className="text-gray-500 text-sm">Reference</p>
                    <p className="font-semibold text-gray-900 break-all">{activeBooking.paymentReference}</p>
                  </div>
                )}
              </div>

              {paymentFeedback && (
                <div
                  className={`rounded-lg p-4 mt-4 border shadow-[0_8px_20px_rgba(15,23,42,0.04)] ${
                    paymentFeedback.type === "success"
                      ? "bg-green-50 border-green-400 text-green-700"
                      : "bg-red-50 border-red-400 text-red-700"
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <p>{paymentFeedback.message}</p>
                    {mpesaRetryAvailable && (
                      <button
                        type="button"
                        onClick={() => handleBookingPayment(mpesaPendingStage || "reservation")}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-4 py-2 border border-[#B35A38] text-[#B35A38] hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] font-semibold text-sm transition-all"
                      >
                        Retry M-Pesa Payment
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeBooking?.paymentMethod === "mpesa" &&
                (mpesaProcessing ||
                  mpesaModalVisible ||
                  ["reservation_pending", "final_pending"].includes(paymentStatusValue)) && (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">Confirm with receipt code</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Enter the receipt code from your phone to confirm instantly.
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        value={mpesaReceiptInput}
                        onChange={(event) => setMpesaReceiptInput(event.target.value)}
                        placeholder="e.g., QAY6F3P9XY"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleReceiptVerify}
                        disabled={mpesaReceiptLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                      >
                        {mpesaReceiptLoading ? "Checking..." : "Confirm Receipt"}
                      </button>
                    </div>
                  </div>
                )}

              {mpesaModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                  <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                    <div className="flex items-center gap-3">
                      <Loader size={20} className="animate-spin text-[#C5A059]" />
                      <div>
                        <p className="text-lg font-semibold text-gray-900">Processing M-Pesa payment</p>
                        <p className="text-sm text-gray-600">
                          Complete the STK prompt on your phone. This can take up to 1–2 minutes.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-gray-700">
                      Time remaining: {mpesaCountdown}s
                    </div>
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      If you cancelled the prompt, wait for the timeout and tap retry.
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setMpesaModalVisible(false)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        Hide
                      </button>
                    </div>
                  </div>
                </div>
              )}

	              <div className="mt-4 space-y-2">
	                <label className="text-xs font-semibold text-gray-500">Reservation payment method</label>
	                <div className="grid gap-2 sm:grid-cols-3">
	                  {paymentMethodOptions.map((method) => {
	                    const Icon = paymentMethodIcons[method.value] || CreditCard;
	                    const isMpesa = method.value === "mpesa";
	                    const isSelected = reservationPaymentMethod === method.value;
	                    return (
	                      <button
	                        key={`reservation-${method.value}`}
	                        type="button"
	                        onClick={() => setReservationPaymentMethod(method.value)}
	                        aria-pressed={isSelected}
	                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
	                          isSelected
	                            ? "border-[#C5A059] bg-[#C5A059]/10 text-[#1A1A1A]"
	                            : "border-gray-300 bg-white text-gray-700 hover:border-[#1A1A1A]"
	                        }`}
	                      >
	                        {isMpesa ? (
	                          <img src={mpesaIconSrc} alt="M-Pesa" className="h-4 w-4" />
	                        ) : (
	                          <Icon size={16} />
	                        )}
	                        <span>{method.label}</span>
	                      </button>
	                    );
	                  })}
	                </div>
	              </div>

	              {(reservationPaymentMethod === "mpesa" || finalPaymentMethod === "mpesa") && (
	                <div className="mt-3 space-y-2">
	                  <label className="text-xs font-semibold text-gray-500">M-Pesa phone number</label>
	                  <input
	                    type="tel"
	                    value={phoneNumber}
	                    onChange={(event) => {
	                      setPhoneNumber(event.target.value);
	                      if (formErrors.phone) {
	                        setFormErrors((prev) => ({ ...prev, phone: null }));
	                      }
	                    }}
	                    placeholder="e.g., 07XXXXXXXX or 2547XXXXXXXX"
	                    className={`w-full rounded-lg border px-3 py-2 text-sm ${
	                      formErrors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
	                    }`}
	                  />
	                  <p className="text-[11px] text-gray-500">
	                    This number receives the STK prompt for payment.
	                  </p>
	                </div>
	              )}

	              <button
	                type="button"
	                disabled={activeBooking?.quoteOnly || reservationPaymentDisabled}
	                onClick={() => handleBookingPayment("reservation")}
	                className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-6 py-3 bg-[#C5A059] hover:bg-[#1A1A1A] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-[0_10px_24px_rgba(197,160,89,0.18)]"
	              >
	                {isPaying ? <Loader size={18} className="animate-spin" /> : <CreditCard size={18} />}
	                {paymentStatusValue === "reservation_paid" || paymentStatusValue === "paid"
	                  ? "Reservation Paid"
	                  : "Pay 30% Reservation"}
	              </button>
		            </section>
		            </>
		            )}

	            {/* Booking Action Buttons - Show after reservation */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <a
                href="/bookings"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 bg-[#C5A059] hover:bg-[#1A1A1A] text-white font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-[0_8px_16px_rgba(197,160,89,0.16)] text-sm"
              >
                <CheckCircle size={16} />
                View My Bookings
              </a>
	              {!activeBooking?.quoteOnly && (
	                <div className="flex-1 space-y-2">
	                  <label className="text-xs font-semibold text-gray-500">Final payment method</label>
	                  <div className="grid gap-2 sm:grid-cols-3">
	                    {paymentMethodOptions.map((method) => {
	                      const Icon = paymentMethodIcons[method.value] || CreditCard;
	                      const isMpesa = method.value === "mpesa";
	                      const isSelected = finalPaymentMethod === method.value;
	                      return (
	                        <button
	                          key={`final-${method.value}`}
	                          type="button"
	                          onClick={() => setFinalPaymentMethod(method.value)}
	                          aria-pressed={isSelected}
	                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
	                            isSelected
	                              ? "border-[#C5A059] bg-[#C5A059]/10 text-[#1A1A1A]"
	                              : "border-gray-300 bg-white text-gray-700 hover:border-[#1A1A1A]"
	                          }`}
	                        >
	                          {isMpesa ? (
	                            <img src={mpesaIconSrc} alt="M-Pesa" className="h-4 w-4" />
	                          ) : (
	                            <Icon size={16} />
	                          )}
	                          <span>{method.label}</span>
	                        </button>
	                      );
	                    })}
	                  </div>
	                  <button
	                    type="button"
	                    disabled={finalPaymentDisabled}
	                    onClick={() => handleBookingPayment("final")}
	                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 border border-[#C5A059] hover:border-[#1A1A1A] hover:bg-[#1A1A1A] text-[#C5A059] hover:text-white font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
	                  >
	                    {isPaying ? <Loader size={16} className="animate-spin" /> : <CreditCard size={16} />}
	                    {paymentStatusValue === "paid" ? "Payment Complete" : "Complete Payment"}
	                  </button>
	                </div>
	              )}
            </div>

            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <button
                type="button"
                onClick={handleBookAnother}
                className="rounded-lg px-6 py-3 bg-[#C5A059] hover:bg-[#1A1A1A] text-white font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 shadow-[0_8px_20px_rgba(197,160,89,0.16)]"
              >
                Book Another Ride
              </button>
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg px-6 py-3 border border-gray-300 text-gray-900 hover:bg-gray-100 font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5"
              >
                Back to Services
              </button>
            </div>
          </div>
        )}
        </div>{/* end left panel */}

        {/* RIGHT PANEL — Map (Larger) */}
        <div className="w-full lg:flex-1 flex-shrink-0">
          <div className="lg:sticky lg:top-28 h-[300px] sm:h-[400px] lg:h-[calc(100vh-140px)]">
            <BookingMap
              pickupCoords={mapPickupCoords}
              destinationCoords={mapDestCoords}
              gpsCoords={pickupGps}
              pickupField={resolvedLocationFields.pickupField}
              destinationField={resolvedLocationFields.dropoffField}
              activeField={activeLocationField}
              onActiveFieldChange={setActiveLocationField}
              onLocationPick={handleMapLocationPick}
            />
          </div>
        </div>

        </div>{/* end split layout */}
      </div>
    </div>
  );
}
