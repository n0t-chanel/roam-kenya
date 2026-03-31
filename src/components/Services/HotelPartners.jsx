import React from "react";
import { MapPin, Star, Building, ArrowUpRight } from "lucide-react";

const sampleHotels = [
  { name: "Nairobi Serena", loc: "Nairobi", price: "$250", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800" },
  { name: "Hemingways Watamu", loc: "Watamu", price: "$400", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800" },
  { name: "Diani Sea Lodge", loc: "Diani", price: "$180", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800" }
];

export default function HotelPartners() {
  return (
    <section id="hotels" className="py-14 bg-[#FDFCFB] px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px] mb-2 block">Curation</span>
          <h2 className="text-4xl font-bold text-gray-900">Partner Accommodations</h2>
        </div>

        {/* HOTEL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {sampleHotels.map((hotel, i) => (
            <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group">
              <div className="h-60 overflow-hidden">
                <img src={hotel.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={hotel.name} />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl">{hotel.name}</h3>
                  <div className="flex text-[#C5A059]"><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/></div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                  <MapPin size={14} /> {hotel.loc}
                </div>
                <button className="w-full border border-gray-200 py-3 rounded-xl text-sm font-bold hover:bg-[#1A1A1A] hover:text-white transition-all">Check Availability</button>
              </div>
            </div>
          ))}
        </div>

        {/* LIST YOUR PROPERTY CTA */}
        <div className="bg-[#1A1A1A] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <Building className="text-[#C5A059] mx-auto mb-6" size={48} />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Are you a Property Owner?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-10 font-light text-lg">
              Join Kenya's elite hospitality network. We provide the logistics, the luxury vehicles, and the high-end clients. You provide the stay.
            </p>
            <button 
              onClick={() => window.open("https://wa.me/254705416781?text=I%20want%20to%20list%20my%20property%20with%20Roam%20Kenya")}
              className="bg-[#B35A38] text-white px-10 py-5 rounded-2xl font-bold hover:bg-[#C5A059] transition-all flex items-center gap-3 mx-auto"
            >
              List Your Property <ArrowUpRight size={20} />
            </button>
          </div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#C5A059]/10 blur-[100px] rounded-full" />
        </div>
      </div>
    </section>
  );
}