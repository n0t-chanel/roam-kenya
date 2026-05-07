import React, { useState } from "react";
import { useLocation } from "react-router-dom"; 
import { Calendar, MapPin, Car, ChevronRight, Info, Plane, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../supabaseClient"; 
import BackButton from "../components/BackButton";

export default function BookingForm() {
  const location = useLocation(); 

  const [formData, setFormData] = useState({
    pickup: location.state?.type === "Airport Transfer" ? location.state.location : "",
    destination: location.state?.type === "Hotel Transfer" ? location.state.location : "",
    flightNumber: "", 
    date: "",
    time: "",
    hours: "Transfer Only", 
    passengers: "1",
    vehicleType: "Executive Sedan",
    serviceCategory: location.state?.packageTitle || location.state?.type ||"standard Booking"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([
          {
            pickup_location: formData.pickup,
            dropoff_location: formData.destination,
            flight_number: formData.flightNumber,
            pickup_date: formData.date,
            pickup_time: formData.time,
            duration: formData.hours,
            passengers: formData.passengers,
            vehicle_type: formData.vehicleType,
            service_category: formData.serviceCategory,
            status: 'Pending'
          }
        ]);

      if (error) throw error;
      setIsSuccess(true);
    } catch (error) {
      console.error("Booking failed:", error.message);
      alert("There was an issue submitting your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#050505] py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <BackButton />
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
          
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

          <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-10 text-black">
            
            {/* SECTION 1: ROUTE */}
            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-4 uppercase tracking-widest">
                <MapPin size={18} className="text-[#B35A38]" /> 01. Route Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Pickup Point</label>
                  <input name="pickup" value={formData.pickup} onChange={handleChange} type="text" placeholder="Airport, Hotel, or Home..." className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#C5A059] focus:bg-white outline-none font-medium" required />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Drop-off Point</label>
                  <input name="destination" value={formData.destination} onChange={handleChange} type="text" placeholder="Where are we heading?" className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#C5A059] focus:bg-white outline-none font-medium" required />
                </div>
              </div>
              <div className="group pt-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 mb-2 ml-2">
                  <Plane size={12} className="text-[#C5A059]" /> Flight Number (Optional)
                </label>
                <input name="flightNumber" value={formData.flightNumber} onChange={handleChange} type="text" placeholder="e.g., KQ102 (We track your arrival)" className="w-full md:w-1/2 p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#C5A059] focus:bg-white outline-none font-medium" />
              </div>
            </div>

            {/* SECTION 2: SCHEDULE */}
            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-4 uppercase tracking-widest">
                <Calendar size={18} className="text-[#B35A38]" /> 02. Schedule & Duration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Date</label>
                  <input name="date" type="date" value={formData.date} onChange={handleChange} className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C5A059] font-medium" required />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Pickup Time</label>
                  <input name="time" type="time" value={formData.time} onChange={handleChange} className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C5A059] font-medium" required />
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

            {/* SECTION 3: VEHICLE */}
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