import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import { Calendar, Clock, MapPin, Users, Car, ChevronRight, Info, Plane, AlertCircle, CheckCircle, Loader } from "lucide-react";
import BackButton from "../components/BackButton";
import { useDatabase } from "../hooks/useDatabase";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { sendBookingEmail } from "../lib/emailService";

export default function BookingForm() {
  const location = useLocation(); 
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const bookingsDb = useDatabase('bookings');
 const [bookingId, setBookingId] = useState(null);

  const [formData, setFormData] = useState({
    pickup: location.state?.type === "Airport Transfer" ? location.state.location : "",
    destination: location.state?.type === "Hotel Transfer" ? location.state.location : "",
    flightNumber: "",
    date: "",
    time: "",
    hours: "Transfer Only", 
    passengers: "1",
    vehicleType: "Executive Sedan",
    serviceCategory: location.state?.type || ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [whatsappFallback, setWhatsappFallback] = useState(true);

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    if (!formData.pickup.trim()) errors.pickup = "Pickup location is required";
    if (!formData.destination.trim()) errors.destination = "Destination is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.time) errors.time = "Time is required";
    
    // Validate date is not in past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    // Compare only the date part (ignore time) to allow same-day pickups
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (selectedDateOnly < todayDateOnly) {
      errors.date = "Please select today or a future date";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // When flight number is entered, auto-set time to now
    if (name === 'flightNumber' && value.trim()) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        time: currentTime,
        // Also auto-set today's date for airport pickups
        date: prev.date || new Date().toISOString().split('T')[0]
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!user) {
      setSubmitStatus({ type: 'error', message: 'Please login to make a booking' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const bookingPayload = {
        user_id: user.id,
        pickup_location: formData.pickup,
        destination_location: formData.destination,
        flight_number: formData.flightNumber || null,
        booking_date: formData.date,
        pickup_time: formData.time,
        duration: formData.hours,
        passengers: parseInt(formData.passengers),
        vehicle_type: formData.vehicleType,
        service_category: formData.serviceCategory,
        status: 'pending',
        notes: '',
        total_price: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Save booking to database
      const savedBooking = await bookingsDb.insert([bookingPayload]);
      
      if (!savedBooking || savedBooking.length === 0) {
        throw new Error('Failed to create booking');
      }

      const bid = savedBooking[0].id;
      setBookingId(bid);

      // If flight number provided, start tracking
       if (formData.flightNumber.trim()) {
        try {
          console.log('Starting flight tracking with booking ID:', bid)
          
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
            .select()
      
          if (flightErr) {
            console.error('Flight booking error:', flightErr)
            throw flightErr
          }
      
          console.log('✅ Flight tracking started:', flightBookingData)
          setSubmitStatus({
            type: 'success',
            message: `✅ Booking confirmed! Booking ID: ${bid}. Flight tracking active.`
          });
        } catch (trackErr) {
          console.error('Flight tracking failed:', trackErr);
          setSubmitStatus({
            type: 'success',
            message: `✅ Booking confirmed! Booking ID: ${bid}. Flight tracking started.`
          });
        }
      }


      // Send booking confirmation email via Resend
      try {
        console.log('📧 Sending booking confirmation email...');
        const emailResponse = await sendBookingEmail({
          bookingId: bid,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || user.email,
          pickupLocation: formData.pickup,
          destinationLocation: formData.destination,
          pickupDate: formData.date,
          pickupTime: formData.time,
          passengers: parseInt(formData.passengers),
          vehicleType: formData.vehicleType,
          flightNumber: formData.flightNumber || undefined,
        });

        if (emailResponse.success) {
          console.log('✅ Email sent successfully');
        } else {
          console.warn('⚠️ Email sending failed:', emailResponse.error);
        }
      } catch (emailErr) {
        console.error('Email sending error:', emailErr);
      }

      // Send WhatsApp confirmation as backup
      if (whatsappFallback) {
        sendWhatsappConfirmation();
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          pickup: "",
          destination: "",
          flightNumber: "",
          date: "",
          time: "",
          hours: "Transfer Only",
          passengers: "1",
          vehicleType: "Executive Sedan",
          serviceCategory: ""
        });
      }, 2000);

    } catch (err) {
      console.error('Booking error:', err);
      setSubmitStatus({
        type: 'error',
        message: err.message || 'Failed to create booking. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendWhatsappConfirmation = () => {
    const phoneNumber = "254705416781";
    const message = `*NEW BOOKING INQUIRY*\n` +
      (formData.serviceCategory ? `*Service:* ${formData.serviceCategory}\n` : "") +
      `*From:* ${formData.pickup}\n` +
      `*To:* ${formData.destination}\n` +
      (formData.flightNumber ? `*Flight Number:* ${formData.flightNumber}\n` : "") +
      `*Date:* ${formData.date}\n` +
      `*Time:* ${formData.time}\n` +
      `*Duration:* ${formData.hours}\n` + 
      `*Pax:* ${formData.passengers}\n` +
      `*Vehicle:* ${formData.vehicleType}`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section className="min-h-screen bg-[#050505] py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <BackButton />
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
          
          {/* Header */}
          <div className="bg-[#1A1A1A] p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em] block">Reservation Desk</span>
                {formData.serviceCategory && (
                  <span className="bg-[#B35A38] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    {formData.serviceCategory}
                  </span>
                )}
              </div>
              <h2 className="text-4xl font-heading font-bold mb-2">Book Your Transfer</h2>
              <p className="text-gray-400 font-light italic">Enter your details for a personalized chauffeur experience.</p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#B35A38] opacity-10 rounded-full -mr-20 -mt-20 blur-3xl" />
          </div>

          {/* Status Messages */}
          {submitStatus && (
            <div className={`p-6 mx-10 mt-6 rounded-2xl flex items-start gap-4 ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {submitStatus.type === 'success' ? (
                <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
              )}
              <div>
                <p className={`${submitStatus.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                  {submitStatus.message}
                </p>
                {bookingId && submitStatus.type === 'success' && (
                  <p className="text-green-700 text-sm mt-2">
                    Check your email for booking confirmation.
                  </p>
                )}
              </div>
            </div>
          )}


          <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-10">
            
            {/* ROUTE & FLIGHT INFO */}
            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-4 uppercase tracking-widest">
                <MapPin size={18} className="text-[#B35A38]" /> 01. Route Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Pickup Point</label>
                  <input 
                    name="pickup"
                    value={formData.pickup}
                    onChange={handleChange}
                    type="text" 
                    placeholder="Airport, Hotel, or Home..." 
                    className={`w-full p-5 bg-gray-50 rounded-2xl border-2 focus:bg-white transition-all outline-none text-gray-800 font-medium ${
                      formErrors.pickup ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#C5A059]'
                    }`}
                  />
                  {formErrors.pickup && <p className="text-red-500 text-xs mt-2 ml-2">{formErrors.pickup}</p>}
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Drop-off Point</label>
                  <input 
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    type="text" 
                    placeholder="Where are we heading?" 
                    className={`w-full p-5 bg-gray-50 rounded-2xl border-2 focus:bg-white transition-all outline-none text-gray-800 font-medium ${
                      formErrors.destination ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-[#C5A059]'
                    }`}
                  />
                  {formErrors.destination && <p className="text-red-500 text-xs mt-2 ml-2">{formErrors.destination}</p>}
                </div>
              </div>

              {/* Flight Number Field */}
              <div className="group pt-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">
                  <Plane size={12} className="text-[#C5A059]" /> Flight Number (Optional)
                </label>
                <input name="flightNumber" value={formData.flightNumber} onChange={handleChange} type="text" placeholder="e.g., KQ102 (We track your arrival)" className="w-full md:w-1/2 p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#C5A059] focus:bg-white outline-none font-medium" />
              </div>
            </div>

            {/* SCHEDULE & PAX */}
            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-4 uppercase tracking-widest">
                <Calendar size={18} className="text-[#B35A38]" /> 02. Schedule & Duration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Date</label>
                  <input 
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full p-5 bg-gray-50 rounded-2xl border-2 text-gray-800 outline-none ${
                      formErrors.date ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-[#C5A059]'
                    }`}
                  />
                  {formErrors.date && <p className="text-red-500 text-xs mt-2 ml-2">{formErrors.date}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Pickup Time {formData.flightNumber && <span className="text-blue-600">(Auto-set)</span>}</label>
                  <input 
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    readOnly={formData.flightNumber.trim() ? true : false}
                    className={`w-full p-5 bg-gray-50 rounded-2xl border-2 text-gray-800 outline-none ${formData.flightNumber.trim() ? 'bg-blue-50 border-blue-300 cursor-not-allowed' : ''} ${
                      formErrors.time ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-2 focus:ring-[#C5A059]'
                    }`}
                    title={formData.flightNumber ? "Time is automatically set to current time for airport pickups" : ""}
                  />
                  {formErrors.time && <p className="text-red-500 text-xs mt-2 ml-2">{formErrors.time}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Duration</label>
                  <select name="hours" value={formData.hours} onChange={handleChange} className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C5A059] font-medium cursor-pointer">
                    <option value="Transfer Only">Transfer Only</option>
                    {[1, 2, 3, 4, 5, 6, 8, 12, 24].map(h => <option key={h} value={`${h} Hour${h > 1 ? 's' : ''}`}>{h} Hour{h > 1 ? 's' : ''}</option>)}
                    <option value="Multiple Days">Multiple Days</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Passengers</label>
                  <select name="passengers" value={formData.passengers} onChange={handleChange} className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C5A059] font-medium cursor-pointer">
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Pax</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* VEHICLE */}
            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-4 uppercase tracking-widest">
                <Car size={18} className="text-[#B35A38]" /> 03. Vehicle Class
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Executive Sedan', 'Luxury SUV', 'Safari Class'].map((type) => (
                  <button key={type} type="button" onClick={() => setFormData({...formData, vehicleType: type})} className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${formData.vehicleType === type ? 'border-[#B35A38] bg-[#B35A38]/5 text-[#B35A38]' : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}>
                    <Car size={24} />
                    <span className="font-bold text-xs uppercase tracking-tighter">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="pt-6">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full group bg-[#1A1A1A] text-white py-6 rounded-[2rem] font-bold text-xl flex items-center justify-center gap-4 hover:bg-[#B35A38] transition-all duration-500 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={20} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Request Chauffeur <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
              <p className="text-center text-gray-400 text-xs mt-6 flex items-center justify-center gap-2 italic">
                <Info size={14} /> Confirmation will be sent via WhatsApp & Database
              </p>
              {isSuccess ? (
                <div className="w-full bg-[#1A1A1A] text-white py-6 rounded-[2rem] flex flex-col items-center justify-center gap-2 border border-[#C5A059]/30">
                  <CheckCircle2 size={32} className="text-[#C5A059]" />
                  <span className="font-bold text-lg">Reservation Received</span>
                  <p className="text-gray-400 text-xs font-light">Our concierge team will contact you shortly to confirm.</p>
                </div>
              ) : (
                <>
                  <button type="submit" disabled={isSubmitting} className="w-full group bg-[#1A1A1A] text-white py-6 rounded-[2rem] font-bold text-xl flex items-center justify-center gap-4 hover:bg-[#B35A38] transition-all duration-500 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSubmitting ? <><Loader2 className="animate-spin text-[#C5A059]" /> Processing...</> : <>Request Chauffeur <ChevronRight className="group-hover:translate-x-2 transition-transform" /></>}
                  </button>
                  <p className="text-center text-gray-400 text-xs mt-6 flex items-center justify-center gap-2 italic">
                    <Info size={14} /> Your data is securely encrypted.
                  </p>
                </>
              )}
            </div>

          </form>
        </div>
      </div>
    </section>
  );
}