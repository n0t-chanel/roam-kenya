import React from "react";
import { useNavigate } from "react-router-dom"; // 1. Import the navigator
import { MapPin, Plane, TreePine, Building2, MessageCircle } from "lucide-react";

const coverage = [
  {
    category: "Airports",
    icon: <Plane className="text-[#B35A38]" />,
    locations: ["JKIA (Nairobi)", "Wilson Airport", "Moi International (Mombasa)", "Diani Airport"]
  },
  {
    category: "Major Cities",
    icon: <Building2 className="text-[#C5A059]" />,
    locations: ["Nairobi (All Areas)", "Mombasa", "Kisumu", "Nakuru", "Eldoret"]
  },
  {
    category: "Safari Destinations",
    icon: <TreePine className="text-emerald-700" />,
    locations: ["Maasai Mara", "Amboseli", "Tsavo East/West", "Lake Nakuru", "Samburu"]
  }
];

export default function Destinations() {
  const navigate = useNavigate(); // 2. Initialize the hook

  const handleCustomInquiry = () => {
    // Option A: Take them to your Booking Form
    // navigate("/booking"); 

    // Option B: Direct WhatsApp for Custom Quotes (Better for "Lazy" users)
    const phoneNumber = "=+254705416781"; // Replace with your number
    const message = "Hello Roam Kenya, I would like to inquire about a custom transport route.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">Our <span className="text-[#B35A38]">Coverage.</span></h1>
          <p className="text-xl text-gray-500 max-w-2xl font-light">
            From the bustling streets of Nairobi to the serene horizons of the coast, 
            our fleet is stationed across the country to ensure you are never stranded.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {coverage.map((item, i) => (
            <div key={i} className="p-10 rounded-[3rem] bg-gray-50 hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-gray-100">
              <div className="mb-6 p-4 bg-white w-fit rounded-2xl shadow-sm">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-6 font-heading">{item.category}</h3>
              <ul className="space-y-4">
                {item.locations.map((loc, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-600">
                    <div className="w-1.5 h-1.5 bg-[#C5A059] rounded-full" />
                    {loc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-20 bg-[#1A1A1A] rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-heading mb-6">Don't see your destination?</h3>
            <p className="text-gray-400 mb-10 italic text-lg max-w-2xl mx-auto">
              We provide bespoke long-distance transfers across East Africa. 
              Contact our concierge for a tailored itinerary and quote.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              {/* Main Action: WhatsApp */}
              <button 
                onClick={handleCustomInquiry}
                className="bg-[#B35A38] px-10 py-5 rounded-2xl font-bold hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                <MessageCircle size={20} /> Inquire via WhatsApp
              </button>
              
              {/* Secondary Action: Back to Form */}
              <button 
                onClick={() => navigate("/booking")}
                className="bg-white/10 backdrop-blur-md border border-white/20 px-10 py-5 rounded-2xl font-bold hover:bg-white/20 transition-all"
              >
                Open Booking Form
              </button>
            </div>
          </div>

          {/* Background Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059] opacity-5 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#B35A38] opacity-5 rounded-full -ml-20 -mb-20 blur-3xl" />
        </div>
      </div>
    </div>
  );
}