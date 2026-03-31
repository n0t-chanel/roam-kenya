import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Star, Users, MapPin, Car } from "lucide-react";

// --- NEW: COUNTER COMPONENT ---
const Counter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const slides = [
  {
    image: "/hero1.png",
    title: "Luxury Transfers",
    subtitle: "Punctual. Professional. Private.",
    description: "Executive pickups from Airports,Hotels ,Conferences to any destination in Kenya with our vetted chauffeurs."
  },
  {
    image: "/hero3.jpg",
    title: "Unmatched Safaris",
    subtitle: "The Wild is Calling.",
    description: "Expert-led roadtrips through the heart of the Maasai Mara and Adventures in premium 4x4 vehicles."
  },
  {
    image: "/Coastal.jpg",
    title: "Coastal Escapes",
    subtitle: "Sunshine & Serenity.",
    description: "Personalized door-to-door transfers to Diani's finest resorts and hotels."
  }
];

// Updated stats to reflect your business vision
const statsData = [
  { icon: <Users size={18} />, label: "Happy Clients", value: 12500, suffix: "+" },
  { icon: <Star size={18} />, label: "Service Rating", value: 5, suffix: "/5" },
  { icon: <Car size={18} />, label: "Fleet Size", value: 45, suffix: "+" },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setFade(true);
      }, 500); 
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[90vh] bg-black overflow-hidden pt-20">
      <div className="absolute inset-0 z-0">
        <img 
          src={slides[current].image} 
          className={`w-full h-full object-cover transition-all duration-1000 ease-in-out ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} 
          alt="Roam Kenya"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto h-full px-6 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
          
          {/* STATS SECTION WITH ANIMATED COUNTERS */}
          <div className="hidden lg:flex lg:col-span-2 flex-col justify-center gap-12 border-l border-white/20 pl-8 text-white">
            {statsData.map((stat, i) => (
              <div key={i}>
                <div className="text-[#C5A059] mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold font-heading">
                  <Counter end={stat.value} />{stat.suffix}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-body mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className={`lg:col-span-9 transition-all duration-700 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="text-[#C5A059] font-body font-bold tracking-[0.4em] uppercase mb-4 block text-sm">
              {slides[current].subtitle}
            </span>
            <h1 className="font-heading text-5xl md:text-8xl text-white mb-6 leading-tight">
              {slides[current].title}
            </h1>
            <p className="text-white/70 font-body text-lg md:text-xl max-w-xl mb-10 font-light">
              {slides[current].description}
            </p>
            <button 
              onClick={() => navigate("/booking")}
              className="bg-[#B35A38] hover:bg-[#964a2d] text-white px-10 py-4 rounded-full font-bold flex items-center gap-2 transition-all transform hover:scale-105 cursor-pointer w-fit"
            >
              Book Service <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}