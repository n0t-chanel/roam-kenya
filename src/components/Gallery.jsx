import React, { useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { galleryItems } from "../Data/galleryData"; 

export default function Gallery() {
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");

  // Unique categories for the pills
  const categories = ["All", ...new Set(galleryItems.map(item => item.category))];

  // Filter items based on active pill
  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(progress);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="pt-12 pb-6 bg-white overflow-hidden"> {/* Reduced padding to show next section */}
      <div className="max-w-7xl mx-auto px-6">
        
        {/* 1. HEADER SECTION (Centered like the Arctic image) */}
        <div className="text-center mb-8">
          <span className="border border-gray-200 text-gray-400 font-bold tracking-widest uppercase text-[9px] px-4 py-1 rounded-full mb-4 inline-block">
            Travel Package
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
            The Easiest Way To Experience <br />
            <span className="text-gray-400 font-light italic">The Jamupet Transit Beautifully</span>
          </h2>
        </div>

        {/* 2. CATEGORY PILLS (New feature from image) */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-[11px] font-bold transition-all duration-300 ${
                activeCategory === cat 
                ? "bg-[#001524] text-white shadow-lg" 
                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. SCROLLABLE CONTAINER */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto no-scrollbar pb-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="relative flex-none w-[260px] md:w-[300px] h-[380px] md:h-[420px] snap-start group cursor-pointer rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={12} className="text-[#C5A059]" />
                  <span className="text-[#C5A059] text-[9px] uppercase tracking-[0.2em] font-black">
                    {item.category}
                  </span>
                </div>
                <p className="text-white font-bold text-lg leading-tight">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 4. NAVIGATION & PROGRESS BAR (Arctic Style) */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <button 
            onClick={() => scroll("left")}
            className="p-3 rounded-full border border-gray-100 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft size={18} className="text-gray-400" />
          </button>

          <div className="w-32 h-[3px] bg-gray-100 relative rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-[#001524] transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          <button 
            onClick={() => scroll("right")}
            className="p-3 rounded-full border border-gray-100 hover:bg-gray-50 transition-all"
          >
            <ArrowRight size={18} className="text-gray-400" />
          </button>
        </div>

      </div>
    </section>
  );
}