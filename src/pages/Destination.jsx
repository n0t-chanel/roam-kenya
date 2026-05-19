import React from "react";
import { useNavigate } from "react-router-dom"; 
import { MapPin, Plane, TreePine, Building2, MessageCircle } from "lucide-react";
import BackButton from "../components/BackButton";

const coverage = [
  {
    category: "Airports",
    icon: <Plane className="text-[#C5A059]" size={28} />,
    locations: ["JKIA (Nairobi)", "Wilson Airport", "Moi International (Mombasa)", "Diani Airport"]
  },
  {
    category: "Major Cities",
    icon: <Building2 className="text-[#C5A059]" size={28} />,
    locations: ["Nairobi (All Areas)", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]
  },
  {
    category: "Safari Destinations",
    icon: <TreePine className="text-[#C5A059]" size={28} />,
    locations: ["Maasai Mara", "Amboseli", "Tsavo East/West", "Lake Nakuru", "Samburu"]
  }
];

export default function Destinations() {
  const navigate = useNavigate(); 

  const handleCustomInquiry = () => {
    const phoneNumber = "254705416781"; 
    const message = "Hello Jamupet Transit, I would like to inquire about a custom transport route.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="pt-32 pb-32 bg-[#FDFCFB] min-h-screen text-gray-900">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-[#B35A38]" />
            <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">Where We Go</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-gray-900">
            Our <span className="italic font-light text-[#C5A059]">Coverage.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl font-light border-l border-[#C5A059]/30 pl-6">
            From the bustling streets of Nairobi to the serene horizons of the coast, 
            our elite fleet is stationed across the country to ensure your journey is seamless.
          </p>
        </div>

        {/* Crisp Cards with light shadow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coverage.map((item, i) => (
            <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-gray-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-gray-200 transition-all duration-500 group">
              <div className="mb-8 p-4 bg-gray-50 w-fit rounded-2xl group-hover:bg-[#C5A059]/10 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900 group-hover:text-[#C5A059] transition-colors">{item.category}</h3>
              <ul className="space-y-4">
                {item.locations.map((loc, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-500 font-light group-hover:text-gray-900 transition-colors">
                    <div className="w-1.5 h-1.5 bg-gray-300 group-hover:bg-[#C5A059] rounded-full" />
                    {loc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Section (Light Glassmorphism) */}
        <div className="mt-24 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[3rem] p-10 md:p-20 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          <h3 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-gray-900">Don't see your destination?</h3>
          <p className="text-gray-500 mb-10 font-light text-base md:text-lg max-w-2xl mx-auto">
            We provide bespoke long-distance transfers across East Africa. 
            Contact our concierge for a tailored itinerary and private quote.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button onClick={handleCustomInquiry} className="bg-[#C5A059] text-white px-10 py-5 rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-lg">
              <MessageCircle size={18} /> Inquire via WhatsApp
            </button>
            <button onClick={() => navigate("/booking")} className="bg-transparent border border-gray-300 px-10 py-5 rounded-xl text-gray-900 font-bold hover:border-[#C5A059] hover:bg-gray-50 transition-all text-xs uppercase tracking-widest">
              Open Booking Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}