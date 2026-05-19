import React from "react";
import { 
  ShieldCheck, 
  Target, 
  Users, 
  CarFront, 
  ArrowRight, 
  Award, 
  Briefcase, 
  MapPin, 
  CheckCircle2, 
  Check,
  Compass
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";

const stats = [
  { label: "KM Driven", value: "500k+" },
  { label: "Safety Record", value: "99.9%" },
  { label: "Elite Drivers", value: "40+" },
  { label: "Corporate Partners", value: "15+" },
];

export default function AboutPage() {
  const navigate = useNavigate();

  const handleDriverApplication = () => {
    const phoneNumber = "254705416781";
    const message = "Hello Jamupet Transit, I am interested in applying for a Professional Chauffeur position. I have viewed the requirements on your website.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-[#C5A059] selection:text-black overflow-hidden">
      <Navbar />
      <BackButton />

      {/* 1. CINEMATIC HERO */}
      <section className="pt-40 pb-24 relative overflow-hidden flex items-center min-h-[60vh]">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/Nairobi-city.webp" 
            alt="Nairobi Skyline" 
            className="w-full h-full object-cover opacity-20 scale-105"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=1920"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#C5A059]/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[#B35A38]" />
            <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px] flex items-center gap-2">
              <MapPin size={12} /> Premium Logistics Kenya
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8 font-serif">
            Driven by <br /> 
            <span className="italic text-[#C5A059] font-light">Integrity.</span>
          </h1>
          <p className="max-w-xl text-gray-400 font-light text-base md:text-xl leading-relaxed border-l-2 border-white/10 pl-6">
            From Nairobi's corporate hub to the untamed wild, we provide the absolute gold standard in East African chauffeur services.
          </p>
        </div>
      </section>

      {/* 2. OUR STORY (Glassmorphism & Grids) */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-32">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Born in Nairobi,<br/>
                <span className="text-gray-500">Serving the World.</span>
              </h2>
              <p className="text-gray-400 text-base leading-relaxed font-light">
                Jamupet Transit Solutions was founded on a singular principle: absolute reliability. True luxury isn't just about the leather interior of the car; it is about the discipline, discretion, and professionalism of the person behind the wheel. We orchestrate travel so you can move with absolute confidence.
              </p>
              
              {/* Interactive Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:bg-white/[0.05] hover:border-[#C5A059]/30 transition-all duration-500 group">
                    <h3 className="text-3xl font-bold text-white group-hover:text-[#C5A059] transition-colors mb-1">{stat.value}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Editorial Image Style */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#C5A059]/20 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700" />
              <div className="rounded-[2rem] overflow-hidden shadow-2xl h-[500px] border border-white/10 relative z-10">
                <img 
                  src="/assets/jkia.webp" 
                  alt="Luxury Fleet" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=800"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
              </div>
            </div>
          </div>

          {/* Mission Statement block */}
          <div className="max-w-5xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden group hover:border-[#C5A059]/20 transition-colors duration-700">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#B35A38]/10 rounded-full blur-[80px] pointer-events-none" />
            
            <Compass size={40} className="text-[#C5A059] mx-auto mb-8 opacity-50 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-1000" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 font-serif">We reimagine the way <br className="hidden md:block"/>East Africa moves.</h2>
            <p className="text-gray-400 leading-relaxed font-light text-base md:text-lg mb-12 max-w-3xl mx-auto">
              We offer premium luxury chauffeur-driven transfers and bespoke logistical pickups across Kenya. Exceptional safety protocols, seamless meet-and-greet, and fixed, transparent pricing mean no surprises. From Jomo Kenyatta International to your final destination, we deliver the VIP standard.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              {[
                '100% Vetted Luxury Fleet', 
                'Meticulously Maintained', 
                'Discreet & Secure Journeys', 
                'Unmatched Cabin Comfort', 
                'Highly Trained Chauffeurs',
                'Zero Surge Pricing'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                  <Check size={16} className="text-[#C5A059]" />
                  <span className="text-xs font-bold tracking-wide text-gray-300 uppercase">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Timeline Style) */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5 px-6 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-[#B35A38]/5 blur-[120px]" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[1px] bg-[#B35A38]" />
              <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">The Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-white">Seamless Booking</h2>
            
            <div className="relative space-y-12">
              <div className="absolute left-[15px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-[#C5A059] via-[#B35A38] to-transparent opacity-30"></div>

              {[
                { title: "Create Your Route", desc: "Enter your pickup & dropoff locations or select the number of hours you wish to book a car and driver for." },
                { title: "Select Vehicle Class", desc: "Choose the perfect vehicle from our premium fleet to suit your luggage requirements and personal style." },
                { title: "Enjoy The Journey", desc: "Sit back and relax. Your professional chauffeur will ensure a safe, punctual, and highly comfortable travel experience." }
              ].map((step, i) => (
                <div key={i} className="relative pl-14 group">
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full border border-[#C5A059] bg-[#050505] z-10 flex items-center justify-center text-[10px] text-[#C5A059] font-bold group-hover:bg-[#C5A059] group-hover:text-black transition-colors duration-500">
                    0{i + 1}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#C5A059] transition-colors">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-light">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button 
                onClick={() => navigate("/booking")}
                className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-black transition-all flex items-center gap-3 text-sm group"
              >
                Access Booking Portal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10">
              <img 
                src="/assets/book-now.webp" 
                alt="Booking Experience" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=1000"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#050505] via-transparent to-transparent opacity-90" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPACT FLEET (Bento Box Style) */}
      <section className="py-24 bg-[#050505] px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-[1px] bg-[#B35A38]" />
                <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">The Collection</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">Our Executive Fleet</h2>
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold border-l border-white/20 pl-4 py-1">Maintained to <br/>absolute perfection</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FleetCard title="Executive Sedan" img="/assets/sedan.webp" pax="1-3" bags="2" fallback="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800" />
            <FleetCard title="Luxury SUV" img="/assets/suv.webp" pax="1-6" bags="4" fallback="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800" />
            <FleetCard title="Safari Cruiser" img="/assets/safari-vans.webp" pax="1-7" bags="6" fallback="https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800" />
          </div>
        </div>
      </section>

      {/* 5. DRIVER CAREERS (Cinematic) */}
      <section id="careers" className="relative py-32 px-6 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/chauffers-careers.webp" 
            alt="Chauffeur" 
            className="w-full h-full object-cover opacity-30"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1920"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-[#050505]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-16 shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C5A059]/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#C5A059]/20 transition-colors duration-1000" />
          
          <div className="flex flex-col lg:flex-row gap-12 items-center relative z-20">
            <div className="flex-1">
              <span className="text-[#C5A059] font-bold tracking-[.3em] text-[10px] uppercase mb-4 block">Join The Elite</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">Chauffeur Careers</h2>
              <p className="text-gray-300 font-light mb-8 max-w-md">We are always looking for highly disciplined, well-spoken, and experienced professionals to join our roster.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {['Valid PSV & DL Class BCE', 'Clean Criminal Record', '5+ Years Experience', 'Bilingual Proficiency'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-gray-300">
                    <CheckCircle2 size={16} className="text-[#B35A38]" /> {item}
                  </div>
                ))}
              </div>
              
              <button 
                onClick={handleDriverApplication}
                className="bg-[#C5A059] text-black px-8 py-4 rounded-xl font-bold hover:bg-white transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(197,160,89,0.2)]"
              >
                Apply via WhatsApp <ArrowRight size={16} />
              </button>
            </div>
            
            <div className="hidden lg:block flex-1 text-right">
               <ShieldCheck size={180} className="text-white/5 ml-auto drop-shadow-2xl" strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

// Upgraded Dark Fleet Card with Pop-up Animation
function FleetCard({ title, img, pax, bags, fallback }) {
  return (
    <div className="bg-[#0a0a0a] p-4 rounded-[2.5rem] border border-white/5 group hover:border-[#C5A059]/30 transition-all duration-500 hover:-translate-y-2">
      <div className="h-64 rounded-[2rem] overflow-hidden mb-6 relative bg-[#1A1A1A]">
        <img 
          src={img} 
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          onError={(e) => { e.target.src = fallback; }}
        />
        {/* Cinematic Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
      </div>
      <div className="px-4 pb-4 relative">
        {/* Animated Line */}
        <div className="absolute -top-4 left-4 w-10 h-[2px] bg-[#B35A38] group-hover:w-16 group-hover:bg-[#C5A059] transition-all duration-500" />
        
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#C5A059] transition-colors">{title}</h3>
        
        <div className="flex gap-6 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-gray-400 font-semibold text-[10px] uppercase tracking-widest">
            <Users size={14} className="text-[#C5A059]" /> {pax} Pax
          </div>
          <div className="flex items-center gap-2 text-gray-400 font-semibold text-[10px] uppercase tracking-widest">
            <Briefcase size={14} className="text-[#C5A059]" /> {bags} Bags
          </div>
        </div>
      </div>
    </div>
  );
}