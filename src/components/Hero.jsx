import { useNavigate } from "react-router-dom";
import { Plane, Building2, Palmtree } from "lucide-react";
import Typewriter from 'typewriter-effect';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-screen bg-[#FDFCFB] overflow-hidden">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero1.webp"
          alt="Luxury Transit"
          width="800" 
          height="600" 
          className="w-full h-full object-cover"
        />
        {/* Light Theme Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-20 max-w-[1440px] mx-auto h-full px-6 md:px-12 flex items-center pt-32 pb-56 md:pt-0 md:pb-0">
        
        <div className="max-w-4xl mb-0 md:mb-24 mt-8 md:mt-0">
          
          {/* DYNAMIC TYPING TITLE */}
          <h1 className="text-gray-900 font-serif text-5xl md:text-[75px] leading-[1.1] mb-6 min-h-[120px] md:min-h-[180px]">
            Premium Journeys. <br />
            <span className="italic font-light text-[#C5A059]">
              <Typewriter
                options={{
                  strings: [
                    'Exceptional Service.',
                    'Airport Transfers.',
                    'Hotel Transfers.',
                    'Executive Chauffeurs.',
                    'Safari Experiences.',
                    'Travel with Confidence.',
                    'Book Now.'
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 75,
                  deleteSpeed: 50,
                }}
              />
            </span>
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-[1px] bg-[#C5A059]" />
            <span className="text-[#C5A059] tracking-[0.3em] uppercase text-[10px] md:text-[12px] font-bold">
              Luxury Transit Solutions Kenya
            </span>
          </div>

          <p className="text-gray-600 text-base md:text-lg mb-10 max-w-md font-light leading-relaxed">
            Experience seamless, reliable and discreet transport tailored to your world. 
            From Nairobi to the Mara, we move you with class.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate("/booking")} 
              className="bg-[#C5A059] text-white px-10 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-900 transition-all shadow-[0_10px_30px_rgba(197,160,89,0.3)]"
            >
              Book a Ride
            </button>
            <button 
              onClick={() => navigate("/services")} 
              className="border border-gray-300 text-gray-900 px-10 py-4 text-[11px] font-bold uppercase tracking-widest hover:border-gray-900 hover:bg-gray-50 transition-all bg-white/50 backdrop-blur-sm"
            >
              Explore Services
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT SERVICE STRIP - Light Glassmorphism */}
      <div className="absolute bottom-0 left-0 w-full z-30 grid grid-cols-1 md:grid-cols-3 border-t border-white bg-white/80 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        
        <div className="p-6 md:p-8 border-r border-gray-100 flex flex-col gap-3 group hover:bg-white transition-all cursor-default">
          <Plane className="text-[#C5A059] w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          <div>
            <h3 className="text-gray-900 uppercase tracking-widest text-[11px] font-bold mb-1">Airport Transfers</h3>
            <p className="text-gray-500 text-[12px] leading-relaxed">JKIA & Wilson specialized pickups.</p>
          </div>
        </div>

        <div className="p-6 md:p-8 border-r border-gray-100 flex flex-col gap-3 group hover:bg-white transition-all cursor-default">
          <Building2 className="text-[#C5A059] w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          <div>
            <h3 className="text-gray-900 uppercase tracking-widest text-[11px] font-bold mb-1">Corporate Travel</h3>
            <p className="text-gray-500 text-[12px] leading-relaxed">Professional logistics for executives.</p>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-3 group hover:bg-gray transition-all cursor-default">
          <Palmtree className="text-[#C5A059] w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          <div>
            <h3 className="text-gray-900 uppercase tracking-widest text-[11px] font-bold mb-1">Safari Tours</h3>
            <p className="text-gray-500 text-[12px] leading-relaxed">Explore the wild in premium comfort.</p>
          </div>
        </div>

      </div>
    </section>
  );
}