import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Building, TrendingUp, ShieldCheck, ArrowRight, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import ServiceFlipCards from "../components/Services/ServiceFlipCards";
import ClientReviews from "../components/Services/ClientReviews";

export default function Services() {
  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const allCards = document.querySelectorAll(".is-flipped");
    allCards.forEach((card) => card.classList.remove("is-flipped"));

    if (hash) {
      const targetId = hash.replace("#", "");
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        const flipInner = element.querySelector(".transition-all"); 
        if (flipInner) {
          setTimeout(() => {
            flipInner.classList.add("is-flipped");
          }, 600);
        }
      }
    }
  }, [hash]); 

  const handlePropertyListing = () => {
    const phoneNumber = "254705416781";
    const message = "Hello Jamupet Transit, I own a property/Airbnb and I am interested in partnering with you for guest transfers.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white selection:bg-[#C5A059] selection:text-black">
      <Navbar />
      <BackButton />

      {/* INVISIBLE SEO FAQ SCHEMA */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How much does it cost to rent an Executive Sedan in Nairobi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our Executive Sedan rentals are highly flexible, starting from approximately KES 2,500 per hour. They are perfect for city meetings, quick errands, and comfortable airport drop-offs for up to 3 passengers."
            }
          },
          {
            "@type": "Question",
            "name": "Are there cheap rental transfer services available?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our pricing is designed to let you save money with our rentals by offering flexible hourly, daily, and per-trip rates tailored to your exact needs in Kenya."
            }
          },
          {
            "@type": "Question",
            "name": "Can I get a daily rate for a Luxury SUV or Safari Tour?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! We offer custom daily rates for our Luxury SUVs and specialized Safari cruisers. They are ideal for intercity rides, corporate teams, and tourist expeditions."
            }
          }
        ]
      })}} />

      {/* CINEMATIC HERO SECTION */}
      <section className="pt-40 pb-24 relative overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/suv.webp" 
            alt="Luxury Services" 
            className="w-full h-full object-cover opacity-20 scale-105"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1920"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C5A059]/10 rounded-full blur-[150px] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-2xl">
            <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px] mb-4 block">
              Redefining Kenyan Hospitality
            </span>
            <h1 className="text-5xl md:text-7xl font-bold font-serif leading-[1.1]">
              Our <span className="text-[#C5A059] italic font-light">Solutions.</span>
            </h1>
          </div>
          <p className="text-gray-400 text-base md:text-lg font-light max-w-sm border-l border-[#C5A059]/30 pl-6 mb-2">
            Professional logistics for the discerning traveler, tourist, and elite property partner.
          </p>
        </div>
      </section>

      {/* 1. CORE SERVICES (FLIP CARDS) */}
      {/* Note: You may need to update the internal CSS of ServiceFlipCards to match the dark theme! */}
      <ServiceFlipCards />

      {/* 2. DYNAMIC PRICING TABLE (DARK LUXURY BENTO) */}
      <section className="py-32 px-6 relative" id="pricing">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#B35A38]/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Designed for <span className="italic text-[#C5A059] font-light">Comfort & Style.</span></h2>
            <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">
              Why compromise on quality when you can have both? We make it easy to <strong className="text-white">save money with our rentals</strong> without sacrificing luxury. Whether you are looking for highly competitive, <strong className="text-white">cheap rental transfer services</strong> or premium chauffeur rates for a multi-day safari, our pricing adapts to your specific needs.
            </p>
            <p className="text-[#B35A38] text-[10px] font-bold uppercase tracking-[0.2em] mt-8 bg-[#B35A38]/10 border border-[#B35A38]/20 inline-block px-6 py-3 rounded-full">
              Rates are flexible based on itinerary
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Standard Tier */}
            <div className="bg-[#0a0a0a] p-10 rounded-[2.5rem] border border-white/5 relative group hover:-translate-y-2 hover:border-[#C5A059]/30 transition-all duration-500">
              <h3 className="text-2xl font-bold text-white mb-2">Executive Sedan</h3>
              <p className="text-gray-500 text-sm mb-8 font-light">Perfect for city meetings & airport drops.</p>
              <div className="mb-10">
                <span className="text-4xl font-black text-white">Flexible</span>
                <span className="text-gray-500 text-xs tracking-widest uppercase block mt-2">Hourly & Airport Rates</span>
              </div>
              <ul className="space-y-4 mb-10">
                {['Up to 3 Passengers', 'Pristine, air-conditioned comfort', 'Professional Chauffeur', 'Complimentary Bottled Water'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-light">
                    <CheckCircle2 size={16} className="text-[#C5A059]" /> {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/booking", { state: { type: "Sedan Rental" }})} className="w-full py-4 rounded-xl border border-white/20 text-white font-bold hover:bg-[#C5A059] hover:border-[#C5A059] hover:text-black transition-colors text-xs uppercase tracking-widest">
                Book Sedan
              </button>
            </div>

            {/* Featured Tier */}
            <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0a0a0a] p-10 md:p-12 rounded-[2.5rem] shadow-2xl relative transform lg:-translate-y-6 border border-[#C5A059]/30 group hover:-translate-y-8 transition-all duration-500 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C5A059] text-black text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-full shadow-[0_0_20px_rgba(197,160,89,0.4)] flex items-center gap-2">
                <Star size={12} fill="black" /> Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 text-center">Luxury SUV</h3>
              <p className="text-gray-400 text-sm mb-8 font-light text-center">Ideal for intercity rides & corporate teams.</p>
              <div className="mb-10 text-center">
                <span className="text-5xl font-black text-[#C5A059]">Custom</span>
                <span className="text-gray-500 text-xs tracking-widest uppercase block mt-3">Daily / Hourly available</span>
              </div>
              <ul className="space-y-4 mb-10">
                {['Up to 7 Passengers', 'Superior legroom & luggage space', 'Elite, discreet chauffeurs', 'Free Wi-Fi & Refreshments', 'Priority Booking Status'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-200 font-light">
                    <CheckCircle2 size={16} className="text-[#C5A059]" /> {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/booking", { state: { type: "SUV Rental" }})} className="w-full py-4 rounded-xl bg-[#C5A059] text-black font-bold hover:bg-white transition-colors text-xs uppercase tracking-widest shadow-lg">
                Book Luxury SUV
              </button>
            </div>

            {/* Premium Tier */}
            <div className="bg-[#0a0a0a] p-10 rounded-[2.5rem] border border-white/5 relative group hover:-translate-y-2 hover:border-[#C5A059]/30 transition-all duration-500">
              <h3 className="text-2xl font-bold text-white mb-2">Safari Class</h3>
              <p className="text-gray-500 text-sm mb-8 font-light">Designed for special events & expeditions.</p>
              <div className="mb-10">
                <span className="text-4xl font-black text-white">Per Trip</span>
                <span className="text-gray-500 text-xs tracking-widest uppercase block mt-2">Based on exact itinerary</span>
              </div>
              <ul className="space-y-4 mb-10">
                {['Modified Safari Vans/Cruisers', 'Pristine Wedding Fleet', 'Expert driver-guides available', 'Custom Routing & Safaris'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300 font-light">
                    <CheckCircle2 size={16} className="text-[#C5A059]" /> {feature}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/booking", { state: { type: "Specialty Rental" }})} className="w-full py-4 rounded-xl border border-white/20 text-white font-bold hover:bg-[#C5A059] hover:border-[#C5A059] hover:text-black transition-colors text-xs uppercase tracking-widest">
                Request Quote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROPERTY PARTNERSHIP (GLASSMORPHISM TEXT UI) */}
      <section className="py-32 px-6 relative" id="hotels">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 md:p-16 border border-white/10 relative overflow-hidden group hover:border-[#C5A059]/30 transition-colors duration-700">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C5A059] opacity-20 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-110"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 text-center md:text-left">
                <span className="text-[#B35A38] font-bold tracking-[.3em] text-[10px] uppercase mb-4 block">B2B Partnerships</span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight font-serif">
                  Elevate Your <br/>Guest Experience.
                </h2>
                <p className="text-gray-400 font-light leading-relaxed mb-10 text-sm md:text-base">
                  Do you own a premium Hotel, Boutique Airbnb, or Lodge in Kenya? Partner with Jamupet Transit to offer your guests seamless, reliable transportation from the moment they land at JKIA straight to your doorstep. 
                </p>
                <button 
                  onClick={handlePropertyListing}
                  className="bg-[#C5A059] text-black px-8 py-4 rounded-xl font-bold hover:bg-white transition-all flex items-center justify-center md:justify-start gap-3 w-full md:w-auto text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(197,160,89,0.3)]"
                >
                  List Your Property <ArrowRight size={16} />
                </button>
              </div>

              <div className="flex-1 w-full space-y-4">
                <PartnerBenefit 
                  icon={<Building size={20} className="text-[#C5A059]" />}
                  title="Direct Client Connections"
                  desc="Provide immense value to your guests by solving their logistical headaches before they arrive."
                />
                <PartnerBenefit 
                  icon={<TrendingUp size={20} className="text-[#C5A059]" />}
                  title="Zero Hassle, High Reward"
                  desc="We handle the driving, the tracking, and the luggage. You get the 5-star review for a smooth check-in."
                />
                <PartnerBenefit 
                  icon={<ShieldCheck size={20} className="text-[#C5A059]" />}
                  title="Guaranteed Vetting"
                  desc="Rest easy knowing your guests are handled by verified, professional Kenyan chauffeurs."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CLIENT REVIEWS SECTION */}
      {/* Note: Ensure ClientReviews component has dark-mode text classes! */}
      <ClientReviews />
    </div>
  );
}

// Upgraded Dark Partner Benefit Micro-Component
function PartnerBenefit({ icon, title, desc }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex gap-5 items-start hover:bg-white/[0.05] hover:border-[#C5A059]/20 transition-all duration-300 hover:-translate-y-1">
      <div className="mt-1 bg-white/5 p-3 rounded-xl border border-white/10">{icon}</div>
      <div>
        <h4 className="text-white font-bold text-base mb-1">{title}</h4>
        <p className="text-gray-400 font-light text-xs md:text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}