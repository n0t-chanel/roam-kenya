import React from "react";
import { Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "Dr. Elena Mensah",
    role: "International Consultant",
    text: "Roam Kenya doesn't just provide a car; they provide peace of mind. You can tell their values are rooted in something deeper.",
    rating: 5
  },
  {
    name: "Sheenel wangari",
    role: "Property Owner",
    text: "Partnering my villas with them was the best decision. Their 'God-first' approach translates into total honesty.",
    rating: 5
  },
  { 
    name: "The Miller Family",
    role: "Safari Travelers",
    text: "A seamless, blessed journey from the airport to the Mara. They live out their values in every mile.",
    rating: 5
  }
];

export default function ClientReviews() {
  return (
    <section className="py-14 bg-white px-6">
      <div className="max-w-7xl mx-auto text-center">
        <span className="text-[#C5A059] font-serif italic text-lg mb-4 block">
          "Commit your work to the Lord, and your plans will be established."
        </span>
        <h2 className="text-4xl font-bold mb-12">Driven by <span className="text-[#B35A38]">Faith</span> & Excellence</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div key={i} className="bg-gray-50 p-10 rounded-[3rem] text-left border border-gray-100">
              <Quote className="text-[#C5A059]/20 mb-4" size={40} />
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, starIndex) => (
                  <Star key={starIndex} size={12} fill="#C5A059" className="text-[#C5A059]" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6">"{review.text}"</p>
              <h4 className="font-bold">{review.name}</h4>
              <p className="text-[#B35A38] text-[10px] font-bold uppercase tracking-widest">{review.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}