import React from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
// Import the data from your new file
import { galleryItems } from "../Data/galleryData"; 

export default function Gallery() {
  return (
    <section className="py-16 bg-[#F8F9FA] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-10">
          <span className="text-[#B35A38] font-bold tracking-widest uppercase text-[10px]">Your Journey, Reimagined</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">The Roam Kenya Experience</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto font-light">
            Visual highlights of our most requested luxury routes and hidden gems across the country.
          </p>
        </div>

        {/* Dynamic Flex Container */}
        <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[500px] w-full">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="relative flex-none h-[400px] md:h-full md:flex-1 hover:md:flex-[2.5] transition-all duration-700 ease-in-out group overflow-hidden rounded-[2.5rem] cursor-pointer shadow-lg bg-gray-200"
            >
              {/* IMAGE ELEMENT */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />

              {/* OVERLAY - Deepens on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

              {/* FLOATING ICON (Top Right) */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white">
                  <ArrowUpRight size={20} />
                </div>
              </div>

              {/* TEXT CONTENT */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-all delay-100 duration-500 -translate-x-4 group-hover:translate-x-0">
                    <MapPin size={12} className="text-[#C5A059]" />
                    <span className="text-[#C5A059] text-[9px] uppercase tracking-widest font-bold">
                        {item.category || "Kenya"}
                    </span>
                </div>
                
                <p className="text-white font-bold text-xl md:text-2xl leading-tight transition-transform duration-500 group-hover:-translate-y-1">
                    {item.title}
                </p>
                
                {/* EXPLORE BUTTON - Only visible on hover */}
                <div className="mt-4 h-0 overflow-hidden group-hover:h-8 transition-all duration-500 ease-in-out">
                    <span className="text-white/70 text-[10px] uppercase tracking-tighter border-b border-[#B35A38] pb-1">
                        Explore Destination
                    </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}