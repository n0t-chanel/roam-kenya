import React from "react";
import { HashLink } from 'react-router-hash-link';
import { Plane, Car, Building2, MapPin, HeartHandshake, Camera, ArrowRight } from "lucide-react";

// Removed Fleet Management to leave exactly 6 passenger-focused services
const services = [
  {
    id: "transfers",
    title: "Airport Transfers",
    icon: <Plane size={32} />,
    frontText: "Punctual, stress-free arrivals at JKIA & Wilson.",
    backTitle: "The Gold Standard",
    backPoints: ["Real-time Flight Tracking", "Meet & Greet Service", "Fixed Rates"],
    cta: "Book Transfer",
    link: "/booking" 
  },
  {
    id: "rentals",
    title: "Chauffeur Rentals",
    icon: <Car size={32} />,
    frontText: "Premium fleet with professional drivers for the day.",
    backTitle: "Relax, We Drive",
    backPoints: ["Daily KES & USD Rates", "Vetted Security Drivers", "All-Inclusive Pricing"],
    cta: "View Fleet",
    link: "#pricing" 
  },
  {
    id: "hotel-transfers",
    title: "Hotel Transfers",
    icon: <Building2 size={32} />,
    frontText: "Seamless transit direct to your Nairobi accommodation.",
    backTitle: "Arrive in Style",
    backPoints: ["Direct Routing", "Luggage Assistance", "Partner Discounts"],
    cta: "Book Transfer",
    link: "/booking" 
  },
  {
    id: "intercity",
    title: "Intercity Rides",
    icon: <MapPin size={32} />,
    frontText: "Safe, luxurious long-distance travel across Kenya.",
    backTitle: "Beyond Nairobi",
    backPoints: ["Nakuru, Nanyuki, Mombasa", "Rest Stops Included", "Spacious SUVs"],
    cta: "Request Route",
    link: "/booking" 
  },
  {
    id: "wedding",
    title: "Wedding Travel",
    icon: <HeartHandshake size={32} />,
    frontText: "Elegant transport for your special day.",
    backTitle: "The Grand Entrance",
    backPoints: ["Pristine Executive Fleet", "Chauffeur in Uniform", "Multi-Car Packages"],
    cta: "Get a Quote",
    link: "https://wa.me/254705416781?text=I%20need%20a%20custom%20quote%20for%20Wedding%20Travel" 
  },
  {
    id: "safari",
    title: "Safari Tours",
    icon: <Camera size={32} />,
    frontText: "Custom expeditions for locals and tourists.",
    backTitle: "Into the Wild",
    backPoints: ["Modified Safari Cruisers", "Expert Driver-Guides", "Multi-Day Packages"],
    cta: "Plan Safari",
    link: "/booking" 
  }
];

export default function ServiceFlipCards() {
  return (
    <section className="py-24 bg-[#FDFCFB] px-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A059]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Changed lg:grid-cols-4 to lg:grid-cols-3 for a perfect 2x3 grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {services.map((svc) => (
          <div key={svc.id} id={svc.id} className="group h-[450px] [perspective:1000px]">
            <div className="relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] [&.is-flipped]:[transform:rotateY(180deg)]">
              
              {/* FRONT SIDE */}
              <div className="absolute inset-0 bg-white rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center border border-gray-100 [backface-visibility:hidden] shadow-[0_10px_30px_rgba(0,0,0,0.03)] group-hover:border-[#C5A059]/30 transition-colors">
                <div className="text-[#C5A059] mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 group-hover:scale-110 transition-transform duration-500 shadow-sm">{svc.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{svc.title}</h3>
                <p className="text-gray-500 font-light text-sm">{svc.frontText}</p>
                <div className="mt-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  Explore <ArrowRight size={12} />
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="absolute inset-0 bg-gradient-to-br from-white to-[#C5A059]/5 border border-[#C5A059]/30 shadow-[0_20px_50px_rgba(197,160,89,0.1)] text-gray-900 rounded-[2.5rem] p-8 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <div>
                  <h4 className="text-gray-900 font-bold text-xl mb-6 font-serif italic">{svc.backTitle}</h4>
                  <ul className="space-y-4">
                    {svc.backPoints.map((point, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-3 font-light">
                        <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full mt-1.5 flex-shrink-0 shadow-sm"></span> {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {svc.link.startsWith('http') ? (
                  <a 
                    href={svc.link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full py-4 bg-[#C5A059] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-lg"
                  >
                    {svc.cta} <ArrowRight size={14} />
                  </a>
                ) : (
                  <HashLink 
                    smooth 
                    to={svc.link} 
                    className="w-full py-4 bg-[#C5A059] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-lg"
                  >
                    {svc.cta} <ArrowRight size={14} />
                  </HashLink>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}