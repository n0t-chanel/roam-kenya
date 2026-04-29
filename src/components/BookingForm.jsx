import React, { useState } from "react";
import { useLocation } from "react-router-dom"; // <-- Added this import
import { Calendar, Clock, MapPin, Users, Car, ChevronRight, Info } from "lucide-react";
import BackButton from "../components/BackButton";

export default function BookingForm() {
  const location = useLocation(); // <-- Added to catch navigation data

  // Initialize state directly from location data if it exists
  const [formData, setFormData] = useState({
    pickup: location.state?.type === "Airport Transfer" ? location.state.location : "",
    destination: location.state?.type === "Hotel Transfer" ? location.state.location : "",
    date: "",
    time: "",
    passengers: "1",
    vehicleType: "Executive Sedan",
    serviceCategory: location.state?.type || "" // <-- Tracks if it's an Airport/Hotel transfer
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneNumber = "254705416781"; 
    
    // Updated message to include the service category at the top
    const message = `NEW BOOKING INQUIRY` +
      (formData.serviceCategory ? `Service: ${formData.serviceCategory}` : "") +
      ` From: ${formData.pickup}` +
      ` To: ${formData.destination}` +
      ` Date: ${formData.date}` +
      `Time: ${formData.time}` +
      ` Pax: ${formData.passengers}` +
      `Vehicle: ${formData.vehicleType}`;
      
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <section className="min-h-screen bg-[#FDFCFB] py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <BackButton />
        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
          
          {/* Header Section */}
          <div className="bg-[#1A1A1A] p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em] block">Reservation Desk</span>
                {/* Dynamically show a badge if a service category was passed from the Services page */}
                {formData.serviceCategory && (
                  <span className="bg-[#B35A38] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    {formData.serviceCategory}
                  </span>
                )}
              </div>
              <h2 className="text-4xl font-heading font-bold mb-2">Book Your Transfer</h2>
              <p className="text-gray-400 font-light italic">Enter your details for a personalized chauffeur experience.</p>
            </div>
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#B35A38] opacity-10 rounded-full -mr-20 -mt-20 blur-3xl" />
          </div>

          <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-10">
            
            {/* SECTION 1: ROUTE */}
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
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#C5A059] focus:bg-white transition-all outline-none text-gray-800 font-medium"
                    required
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Drop-off Point</label>
                  <input 
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    type="text" 
                    placeholder="Where are we heading?" 
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#C5A059] focus:bg-white transition-all outline-none text-gray-800 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: SCHEDULE & PAX */}
            <div className="space-y-6">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-4 uppercase tracking-widest">
                <Calendar size={18} className="text-[#B35A38]" /> 02. Schedule
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Date</label>
                  <input 
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C5A059] text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Pickup Time</label>
                  <input 
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C5A059] text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-2">Passengers</label>
                  <select 
                    name="passengers"
                    value={formData.passengers}
                    onChange={handleChange}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#C5A059] text-gray-800 font-medium appearance-none"
                  >
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Passengers</option>)}
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
                {['Executive Sedan', 'Luxury 4x4', 'Safari Van'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({...formData, vehicleType: type})}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                      formData.vehicleType === type 
                      ? 'border-[#B35A38] bg-[#B35A38]/5 text-[#B35A38]' 
                      : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
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
                className="w-full group bg-[#1A1A1A] text-white py-6 rounded-[2rem] font-bold text-xl flex items-center justify-center gap-4 hover:bg-[#B35A38] transition-all duration-500 shadow-xl"
              >
                Request Chauffeur <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </button>
              <p className="text-center text-gray-400 text-xs mt-6 flex items-center justify-center gap-2 italic">
                <Info size={14} /> This inquiry will be confirmed via WhatsApp
              </p>
            </div>

          </form>
        </div>
      </div>
    </section>
  );
}