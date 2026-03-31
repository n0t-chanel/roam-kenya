import React from "react";
import { HashLink } from 'react-router-hash-link';
import { Plane, Car, Building2, ShieldCheck, ArrowRight } from "lucide-react";

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
    link: "#chauffeur-pricing" // Updated to local jump for the new pricing section
  },
  {
    id: "hotels",
    title: "Hotel Stays",
    icon: <Building2 size={32} />,
    frontText: "Curated luxury stays with integrated logistics.",
    backTitle: "Partner Stays",
    backPoints: ["VIP Check-in Support", "Hand-picked Locations", "Seamless Transport"],
    cta: "Find a Stay",
    link: "#hotels" 
  },
  {
    id: "fleet",
    title: "Fleet Management",
    icon: <ShieldCheck size={32} />,
    frontText: "Turn your vehicle into a premium asset.",
    backTitle: "Earn with Us",
    backPoints: ["Maintenance Oversight", "Verified High-End Clients", "Transparent Payouts"],
    cta: "Partner Now",
    link: "https://wa.me/254705416781?text=I%20am%20interested%20in%20Fleet%20Management%20Partnership"
  }
];

export default function ServiceFlipCards() {
  return (
    <section className="py-16 md:py-6 bg-white px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((svc) => (
          <div key={svc.id} id={svc.id} className="group h-[450px] [perspective:1000px]">
            {/* Added [&.is-flipped] to handle the programmatic flip from the Navbar links */}
            <div className="relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] [&.is-flipped]:[transform:rotateY(180deg)]">
              
              {/* FRONT SIDE */}
              <div className="absolute inset-0 bg-gray-50 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center border border-gray-100 [backface-visibility:hidden]">
                <div className="text-[#B35A38] mb-6">{svc.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{svc.title}</h3>
                <p className="text-gray-500 text-sm">{svc.frontText}</p>
                <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="absolute inset-0 bg-[#1A1A1A] text-white rounded-[2rem] p-8 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <div>
                  <h4 className="text-[#C5A059] font-bold text-lg mb-6">{svc.backTitle}</h4>
                  <ul className="space-y-4">
                    {svc.backPoints.map((point, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full"></span> {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {svc.link.startsWith('http') ? (
                  <a 
                    href={svc.link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full py-4 bg-[#B35A38] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#C5A059] transition-colors"
                  >
                    {svc.cta} <ArrowRight size={14} />
                  </a>
                ) : (
                  <HashLink 
                    smooth 
                    to={svc.link} 
                    className="w-full py-4 bg-[#B35A38] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#C5A059] transition-colors"
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