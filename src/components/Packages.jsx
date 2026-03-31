import React from "react";
import { ArrowRight, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const packages = [
  {
    id: 1,
    name: "Airport Executive",
    priceUSD: 40,
    route: "JKIA — Nairobi City Center",
    type: "Premium Sedan",
    features: ["Meet & Greet", "Flight Tracking", "Bottled Water"],
    discount: "Popular"
  },
  {
    id: 2,
    name: "The Safari Shuttle",
    priceUSD: 350,
    route: "Nairobi — Masai Mara",
    type: "4x4 Land Cruiser",
    features: ["Expert Chauffeur", "Pop-up Roof", "Full Day Trip"],
    discount: "Best Value"
  },
  {
    id: 3,
    name: "Coastal Connector",
    priceUSD: 280,
    route: "Nairobi — Diani / Mombasa",
    type: "Luxury Van",
    features: ["Up to 7 Pax", "Free Wi-Fi", "Express Highway"],
    discount: "10% Off"
  },
];

export default function Packages() {
  const navigate = useNavigate();
  const KES_RATE = 130; 

  return (
    /* 1. overflow-hidden on the section stops the whole page from shifting */
    <section className="pt-16 pb-0 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div className="max-w-xl">
            <span className="text-[#B35A38] font-bold tracking-[0.3em] uppercase text-[10px]">Fixed Rates</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 italic font-serif">Premium Route Packages</h2>
          </div>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest hidden md:block mb-1 font-bold">
            Live Conversion: 1 USD = {KES_RATE} KES
          </p>
        </div>

        {/* 2. THE SCROLL FIX: 
           -mx-6 + px-6 ensures the cards can touch the screen edges during scroll 
           without breaking the alignment with the text above. 
        */}
        <div className="flex gap-6 overflow-x-auto pb-10 snap-x no-scrollbar -mx-6 px-6">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className="min-w-[300px] md:min-w-[380px] bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 snap-center group shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="bg-[#B35A38] text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {pkg.discount}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 leading-none">${pkg.priceUSD}</p>
                  <p className="text-[#C5A059] font-bold text-[11px] mt-1">
                    Ksh {(pkg.priceUSD * KES_RATE).toLocaleString()}
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
              <p className="text-gray-500 text-xs mb-6 flex items-center gap-2">
                <Tag size={12} className="text-[#C5A059]" /> {pkg.route}
              </p>

              <div className="space-y-3 mb-8">
                {pkg.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-[13px] text-gray-600">
                    <div className="w-1 h-1 bg-[#C5A059] rounded-full" />
                    {feature}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => navigate("/booking")}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-[#B35A38] transition-all flex items-center justify-center gap-2 text-sm shadow-md active:scale-95"
              >
                Book Route <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}