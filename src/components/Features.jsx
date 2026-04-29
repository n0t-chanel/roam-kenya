import { ShieldCheck, Clock, UserCheck, Star } from "lucide-react";

const reasons = [
  {
    title: "Safety & Security",
    desc: "Vetted professional chauffeurs and GPS-tracked premium vehicles for total peace of mind.",
    icon: <ShieldCheck size={32} />, // Slightly smaller icon
    backColor: "bg-[#B35A38]"
  },
  {
    title: "Punctuality",
    desc: "We monitor flights in real-time. We are always there 15 minutes before your schedule.",
    icon: <Clock size={32} />,
    backColor: "bg-[#1A1A1A]"
  },
  {
    title: "Personalized Care",
    desc: "Tailored routes and in-car amenities. We don't just drive; we host you across Kenya.",
    icon: <UserCheck size={32} />,
    backColor: "bg-[#C5A059]"
  },
  {
    title: "VIP Standards",
    desc: "Discreet and reliable. The preferred partner for hotels and corporate travelers.",
    icon: <Star size={32} />,
    backColor: "bg-gray-800"
  }
];

export default function Features() {
  return (
    <section className="py-16 pb-4 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-10"> {/* Reduced mb-16 to mb-10 */}
          <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">The Chauffeur Difference</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 italic">Why Choose Jamupet Transits?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {reasons.map((item, i) => (
            <div key={i} className="group h-[300px] [perspective:1000px]"> {/* Reduced h-350 to h-300 */}
              <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-lg rounded-[2rem]">
                
                {/* FRONT SIDE */}
                <div className="absolute inset-0 h-full w-full bg-white rounded-[2rem] p-6 flex flex-col items-center justify-center text-center [backface-visibility:hidden]">
                  <div className="text-[#C5A059] mb-4 p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.title}</h3>
                  <p className="mt-3 text-[9px] text-[#B35A38] font-bold uppercase tracking-widest opacity-60">Hover to reveal</p>
                </div>

                {/* BACK SIDE */}
                <div className={`absolute inset-0 h-full w-full ${item.backColor} rounded-[2rem] p-6 flex flex-col items-center justify-center text-center text-white [transform:rotateY(180deg)] [backface-visibility:hidden]`}>
                  <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                  <p className="text-xs leading-relaxed opacity-90">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}