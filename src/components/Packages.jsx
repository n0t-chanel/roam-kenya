import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Star, MapPin } from "lucide-react";

const packages = [
  {
    id: 1,
    title: "City Executive",
    route: "JKIA ⇄ Nairobi Hotels",
    price: "From KES 3,500",
    duration: "Per Transfer",
    features: [
      "VIP Meet & Greet at Arrivals",
      "60 Mins Complimentary Wait Time",
      "Executive Sedan (Up to 3 Pax)",
      "Complimentary Bottled Water"
    ],
    isPopular: false,
  },
  {
    id: 2,
    title: "The Safari Class",
    route: "Nairobi ⇄ Mara / Ol Pejeta",
    price: "Custom Quote",
    duration: "Multi-Day",
    features: [
      "Dedicated Expert Driver-Guide",
      "Modified 4x4 Safari Cruiser",
      "Unlimited Game Drives",
      "Pop-up Roof & VHF Radio"
    ],
    isPopular: true,
  },
  {
    id: 3,
    title: "Intercity Escape",
    route: "Nairobi ⇄ Naivasha / Nakuru",
    price: "From KES 18,000",
    duration: "Per Day",
    features: [
      "Luxury SUV (Up to 7 Pax)",
      "Flexible Routing & Stopovers",
      "Elite, Discreet Chauffeur",
      "Premium Refreshments & Wi-Fi"
    ],
    isPopular: false,
  }
];

export default function Packages() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-[#B35A38]" />
            <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">Curated Journeys</span>
            <div className="w-8 h-[1px] bg-[#B35A38]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Signature <span className="text-[#C5A059] italic font-light">Transit Packages</span>
          </h2>
          <p className="text-gray-600 font-light text-sm md:text-base">
            Transparent pricing meets unparalleled luxury. Select a package tailored to your itinerary, or contact us for bespoke travel arrangements across East Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`relative rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-2 ${
                pkg.isPopular 
                  ? "bg-white border border-[#C5A059]/30 shadow-[0_20px_60px_-15px_rgba(197,160,89,0.2)] py-12 md:-my-8 z-10" 
                  : "bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C5A059] text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 shadow-xl">
                  <Star size={12} fill="black" /> Top Choice
                </div>
              )}

              <div className="text-center mb-8 border-b border-gray-100 pb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{pkg.title}</h3>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mb-6">
                  <MapPin size={14} className="text-[#B35A38]" /> {pkg.route}
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">{pkg.duration}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <Check size={16} className={pkg.isPopular ? "text-[#C5A059] mt-0.5" : "text-gray-400 mt-0.5"} />
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => navigate("/booking", { 
                  state: { packageTitle: pkg.title, type: "Curated Package" }
                })}
                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  pkg.isPopular 
                    ? "bg-[#C5A059] text-black hover:bg-gray-900 hover:text-white shadow-lg" 
                    : "bg-gray-50 border border-gray-200 text-gray-900 hover:bg-[#B35A38] hover:text-white hover:border-transparent"
                }`}
              >
                Select Package <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}