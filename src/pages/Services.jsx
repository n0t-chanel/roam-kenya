import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import BackButton from "../components/BackButton";
import ServiceFlipCards from "../components/Services/ServiceFlipCards";
import ClientReviews from  "../components/Services/ClientReviews";
import ChauffeurPricing from "../components/Services/ChauffeurPricing";
import HotelPartners from "../components/Services/HotelPartners";


export default function Services() {
  const { hash } = useLocation();

  useEffect(() => {
    // 1. Remove any existing 'is-flipped' classes first to reset state
    const allCards = document.querySelectorAll(".is-flipped");
    allCards.forEach((card) => card.classList.remove("is-flipped"));

    if (hash) {
      const targetId = hash.replace("#", "");
      const element = document.getElementById(targetId);

      if (element) {
        // 2. Scroll to the card/section smoothly
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        // 3. If it's one of the flip cards, trigger the flip animation
        const flipInner = element.querySelector(".transition-all"); 
        if (flipInner) {
          // Small timeout to allow the scroll to start before flipping
          setTimeout(() => {
            flipInner.classList.add("is-flipped");
          }, 600);
        }
      }
    }
  }, [hash]); 

  return (
    <div className="bg-white min-h-screen">
      <BackButton />

      {/* HERO SECTION */}
      <section className="pt-40 pb-12 bg-[#1A1A1A] text-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-2xl">
            <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px] mb-4 block">
              Redefining Kenyan Hospitality
            </span>
            <h1 className="text-5xl md:text-7xl font-bold">
              Our <span className="text-[#C5A059]">Solutions.</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg font-light max-w-sm border-l border-[#C5A059]/30 pl-6 mb-2">
            Professional logistics for the discerning traveler and property partner.
          </p>
        </div>
      </section>

      {/* 1. CORE SERVICES (FLIP CARDS) */}
      <ServiceFlipCards />

      {/* 2. POPULAR ROUTE PACKAGES */}


      {/* 3. CHAUFFEUR PRICING SECTION (Target for "View Fleet") */}
      <div id="chauffeur-pricing">
        <ChauffeurPricing />
      </div>

      {/* 4. HOTEL PARTNERS SECTION */}
      <div id="hotels">
        <HotelPartners />
      </div>

      {/* 5. FAITH & REVIEWS SECTION */}
    <ClientReviews/>

    </div>
  );
}