import React from "react";
import { useNavigate } from "react-router-dom"; 
import { MapPin, Plane, TreePine, Building2, MessageCircle } from "lucide-react";
import BackButton from "../components/BackButton"; // Highly recommended to import this here too!

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
    <div className="pt-32 pb-32 bg-[#050505] min-h-screen text-white relative overflow-hidden">
      {/* Optional: Add back button if you imported it above */}
      {/* <BackButton /> */}

      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B35A38]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-[#B35A38]" />
            <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">Where We Go</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            Our <span className="italic font-light text-[#C5A059]">Coverage.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl font-light border-l border-[#C5A059]/30 pl-6">
            From the bustling streets of Nairobi to the serene horizons of the coast, 
            our elite fleet is stationed across the country to ensure your journey is seamless.
          </p>
        </div>

        {/* Animated Destination Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coverage.map((item, i) => (
            <div 
              key={i} 
              className="p-10 rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 hover:border-[#C5A059]/40 hover:bg-white/[0.02] transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#C5A059]/5 rounded-full blur-[30px] group-hover:bg-[#C5A059]/20 transition-colors duration-500" />
              
              <div className="mb-8 p-4 bg-white/5 border border-white/10 w-fit rounded-2xl group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>
              
              <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-[#C5A059] transition-colors">{item.category}</h3>
              
              <ul className="space-y-4">
                {item.locations.map((loc, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-400 font-light group-hover:text-gray-300 transition-colors">
                    <div className="w-1.5 h-1.5 bg-gray-700 group-hover:bg-[#C5A059] rounded-full transition-colors" />
                    {loc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Call to Action - Glassmorphism Style */}
        <div className="mt-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-20 text-center text-white relative overflow-hidden group hover:border-[#C5A059]/20 transition-all duration-700">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-[#B35A38]/10 via-transparent to-[#C5A059]/10 opacity-50 pointer-events-none" />
          
          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-white">Don't see your destination?</h3>
            <p className="text-gray-400 mb-10 font-light text-base md:text-lg max-w-2xl mx-auto">
              We provide bespoke long-distance transfers across East Africa. 
              Contact our concierge for a tailored itinerary and private quote.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              {/* Main Action: WhatsApp */}
              <button 
                onClick={handleCustomInquiry}
                className="bg-[#C5A059] text-black px-10 py-5 rounded-xl font-bold hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(197,160,89,0.3)] text-xs uppercase tracking-widest"
              >
                <MessageCircle size={18} /> Inquire via WhatsApp
              </button>
              
              {/* Secondary Action: Back to Form */}
              <button 
                onClick={() => navigate("/booking")}
                className="bg-transparent border border-white/20 px-10 py-5 rounded-xl text-white font-bold hover:border-[#C5A059] hover:bg-white/5 transition-all text-xs uppercase tracking-widest"
              >
                Open Booking Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}