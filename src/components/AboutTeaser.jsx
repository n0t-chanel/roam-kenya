import { useNavigate } from "react-router-dom";
import { ArrowRight, Award, Shield } from "lucide-react";

export default function AboutTeaser() {
  const navigate = useNavigate();

  return (
    <section className="py-14 bg-white overflow-hidden"> {/* Reduced from py-20 */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Left Side: Visuals */}
          <div className="relative order-2 lg:order-1">
            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-xl">
              <img 
                src="cars.jpg" 
                alt="Roam Kenya Chauffeur" 
                className="w-full h-[300px] md:h-[400px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#C5A059]/10 rounded-full -z-10" />
          </div>

          {/* Right Side: Content */}
          <div className="space-y-5 order-1 lg:order-2">
            <div>
              <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">Our Heritage</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 leading-tight">
                More Than Just a Ride, <br />
                <span className="italic font-serif text-[#C5A059]">A Kenyan Experience.</span>
              </h2>
            </div>

            <p className="text-gray-500 leading-relaxed text-sm md:text-base font-light max-w-lg">
              Founded in Nairobi, Jamupet Transit Solutions was born to provide reliable, 
              discreet, and professional chauffeur services. 
            </p>

            <div className="flex gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Shield size={16} className="text-[#C5A059]" />
                <span className="font-bold text-[10px] uppercase">Vetted</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Award size={16} className="text-[#C5A059]" />
                <span className="font-bold text-[10px] uppercase">VIP Service</span>
              </div>
            </div>

            <button 
              onClick={() => navigate("/about")}
              className="flex items-center gap-4 text-gray-900 font-bold hover:text-[#B35A38] transition-all text-sm group pt-2"
            >
              Read Our Full Story 
              <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-[#B35A38] group-hover:text-white transition-all">
                <ArrowRight size={14} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}