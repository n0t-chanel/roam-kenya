import React from "react";
import { CarFront } from "lucide-react";

export default function Preloader({ isLoading }) {
  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-500 ${
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center">
        {/* The Car (Bouncing slightly to simulate driving) */}
        <div className="relative z-10 animate-[bounce_1s_infinite]">
          <CarFront size={64} className="text-[#C5A059]" />
        </div>

        {/* The Road */}
        <div className="w-64 h-1.5 mt-2 relative overflow-hidden rounded-full bg-gray-800">
          <div className="absolute inset-0 road-animation"></div>
        </div>

        {/* Loading Text */}
        <span className="text-[#C5A059] text-xs font-bold uppercase tracking-[0.3em] mt-10 animate-pulse">
          Preparing Your Journey...
        </span>
      </div>
    </div>
  );
}