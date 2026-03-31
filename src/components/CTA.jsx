import React from "react";
import { useNavigate } from "react-router-dom";

export default function CTA() {
  const navigate = useNavigate();

  const handlePartnerChat = () => {
    const phoneNumber = "254705416781";
    const message = "Hello Roam Kenya, I am interested in partnering by adding my vehicle to your fleet.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section className="pt-16 pb-6 bg-white px-6">
      <div className="max-w-7xl mx-auto overflow-hidden rounded-[3rem] bg-[#1A1A1A] flex flex-col md:flex-row shadow-2xl border border-white/5">
        
        {/* LEFT SIDE: TRAVELER */}
        <div className="flex-1 p-10 md:p-14 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10">
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Ready to hit the <br /> <span className="text-[#B35A38]">Kenyan Road?</span>
          </h2>
          <p className="text-gray-400 mb-8 text-sm md:text-base max-w-sm">
            Book your professional chauffeur for airport transfers and custom safari tours today.
          </p>
          <button 
            onClick={() => navigate("/booking")}
            className="bg-[#B35A38] text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-black transition-all transform active:scale-95 w-fit text-sm"
          >
            Book My Ride Now
          </button>
        </div>

        {/* RIGHT SIDE: PARTNER */}
        <div className="flex-1 p-10 md:p-14 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] flex flex-col justify-center">
          <h2 className="text-white text-2xl font-bold mb-4 italic">
            Own a Vehicle? 
          </h2>
          <p className="text-gray-400 mb-8 text-sm max-w-sm">
            Join the Roam Kenya fleet. We manage your vehicle and connect you with premium corporate clients.
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={handlePartnerChat}
              className="border border-[#C5A059] text-[#C5A059] px-6 py-3 rounded-xl font-bold hover:bg-[#C5A059] hover:text-black transition-all w-fit text-sm"
            >
              Partner With Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}