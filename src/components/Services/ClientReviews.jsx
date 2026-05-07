import React from "react";
import { Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "Dr. Elena Mensah",
    role: "International Consultant",
    text: "Jamupet Transit doesn't just provide a car; they provide peace of mind. You can tell their values are rooted in something deeper.",
    rating: 5
  },
  {
    name: "Sheenel Wangari",
    role: "Property Owner",
    text: "Partnering my villas with them was the best decision. Their 'God-first' approach translates into absolute reliability and total honesty.",
    rating: 5
  },
  { 
    name: "The Miller Family",
    role: "Safari Travelers",
    text: "A seamless, blessed journey from the airport to the Mara. They live out their values in every mile. Highly recommended.",
    rating: 5
  }
];

export default function ClientReviews() {
  return (
    <section className="py-32 bg-[#050505] px-6 relative overflow-hidden border-t border-white/5">
      {/* Cinematic Lighting */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#C5A059]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <span className="text-[#C5A059] font-serif italic text-lg md:text-xl mb-6 block font-light">
          "Commit your work to the Lord, and your plans will be established."
        </span>
        <h2 className="text-4xl md:text-6xl font-bold mb-16 text-white leading-tight">
          Driven by <span className="text-[#B35A38] italic font-light">Faith</span> <br className="hidden md:block" />& Excellence
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div 
              key={i} 
              className="bg-white/5 backdrop-blur-md p-10 md:p-12 rounded-[3rem] text-left border border-white/10 group hover:-translate-y-2 hover:border-[#C5A059]/40 transition-all duration-500 relative overflow-hidden"
            >
              {/* Subtle inner hover glow */}
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#C5A059]/0 to-[#C5A059]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <Quote className="text-[#C5A059]/30 mb-8 group-hover:text-[#C5A059]/60 transition-colors duration-500" size={48} />
              
              <div className="flex gap-1.5 mb-6">
                {[...Array(review.rating)].map((_, starIndex) => (
                  <Star key={starIndex} size={14} fill="#C5A059" className="text-[#C5A059]" />
                ))}
              </div>
              
              <p className="text-gray-300 font-light leading-relaxed italic mb-10 text-base">"{review.text}"</p>
              
              <div className="border-t border-white/10 pt-6">
                <h4 className="font-bold text-white text-lg">{review.name}</h4>
                <p className="text-[#B35A38] text-[10px] font-bold uppercase tracking-widest mt-1">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}