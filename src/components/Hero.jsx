import { useNavigate } from "react-router-dom";
import { Plane, Building2, Palmtree } from "lucide-react";
import Typewriter from 'typewriter-effect';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero1.webp"
          alt="Luxury Transit"
          width="800" 
          height="600" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      </div>

      {/* MAIN CONTENT */}
      {/* ADDED: pt-32 and pb-56 on mobile to keep text out of the logo and bottom strip */}
      <div className="relative z-20 max-w-[1440px] mx-auto h-full px-6 md:px-12 flex items-center pt-32 pb-56 md:pt-0 md:pb-0">
        
        {/* ADDED: Adjusted margins to center better on mobile */}
        <div className="max-w-4xl mb-0 md:mb-24 mt-8 md:mt-0">
          
          {/* DYNAMIC TYPING TITLE */}
          <h1 className="text-white font-serif text-5xl md:text-[75px] leading-[1.1] mb-6 min-h-[120px] md:min-h-[180px]">
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

          <p className="text-white/70 text-base md:text-lg mb-10 max-w-md font-light leading-relaxed">
            Experience seamless, reliable and discreet transport tailored to your world. 
            From Nairobi to the Mara, we move you with class.
          </p>

          <div className="flex gap-4">
            <button 
              onClick={() => navigate("/booking")} 
              className="bg-[#C5A059] text-black px-10 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-2xl"
            >
              Book a Ride
            </button>
            <button 
              onClick={() => navigate("/services")} 
              className="border border-white/40 text-white px-10 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Explore Services
            </button>
          </div>
        </div>
      </div>

      {/* COMPACT SERVICE STRIP */}
      <div className="absolute bottom-0 left-0 w-full z-30 grid grid-cols-1 md:grid-cols-3 border-t border-white/10 bg-black/60 backdrop-blur-md">
        
        <div className="p-6 md:p-8 border-r border-white/10 flex flex-col gap-3 group hover:bg-white/5 transition-all">
          <Plane className="text-[#C5A059] w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          <div>
            <h3 className="text-[#C5A059] uppercase tracking-widest text-[11px] font-bold mb-1">Airport Transfers</h3>
            <p className="text-white/50 text-[12px] leading-relaxed">JKIA & Wilson specialized pickups.</p>
          </div>
        </div>

        <div className="p-6 md:p-8 border-r border-white/10 flex flex-col gap-3 group hover:bg-white/5 transition-all">
          <Building2 className="text-[#C5A059] w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          <div>
            <h3 className="text-[#C5A059] uppercase tracking-widest text-[11px] font-bold mb-1">Corporate Travel</h3>
            <p className="text-white/50 text-[12px] leading-relaxed">Professional logistics for executives.</p>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-3 group hover:bg-white/5 transition-all">
          <Palmtree className="text-[#C5A059] w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          <div>
            <h3 className="text-[#C5A059] uppercase tracking-widest text-[11px] font-bold mb-1">Safari Tours</h3>
            <p className="text-white/50 text-[12px] leading-relaxed">Explore the wild in premium comfort.</p>
          </div>
        </div>

      </div>
    </section>
  );
}