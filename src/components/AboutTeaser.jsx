import { useNavigate } from "react-router-dom";
import { ArrowRight, Award, Shield } from "lucide-react";

export default function AboutTeaser() {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Visuals */}
          <div className="relative order-2 lg:order-1">
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img 
                src="cars.jpg" 
                alt="Roam Kenya Chauffeur" 
                className="w-full h-[350px] md:h-[450px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Minimalist Design Elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#C5A059]/10 rounded-full -z-10" />
          </div>

          {/* Right Side: Content */}
          <div className="space-y-6 order-1 lg:order-2">
            <div>
              <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">Our Heritage</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 leading-tight">
                More Than Just a Ride, <br />
                <span className="italic font-serif text-[#C5A059]">A Kenyan Experience.</span>
              </h2>
            </div>

            <p className="text-gray-500 leading-relaxed text-sm md:text-base font-light">
              Founded in Nairobi, Roam Kenya was born to provide reliable, 
              discreet, and professional chauffeur services. 
              Whether it's Westlands or the Mara, we are your 
              trusted logistics partner.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Shield size={18} className="text-[#C5A059]" />
                <span className="font-bold text-xs uppercase">Vetted</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Award size={18} className="text-[#C5A059]" />
                <span className="font-bold text-xs uppercase">VIP</span>
              </div>
            </div>

            <button 
              onClick={() => navigate("/about")}
              className="flex items-center gap-4 text-gray-900 font-bold hover:text-[#B35A38] transition-all text-sm group"
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