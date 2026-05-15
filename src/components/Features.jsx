import React from "react";
import { ShieldCheck, Map, Clock, Award, Sparkles, Navigation } from "lucide-react";

const features = [
  {
    id: "01",
    title: "Executive Chauffeurs",
    desc: "Rigorously vetted, highly trained, and bound by strict confidentiality. Our drivers provide a discreet, white-glove experience.",
    icon: <Award size={28} className="text-[#C5A059]" />,
    span: "lg:col-span-2" // Makes this card wider on desktop
  },
  {
    id: "02",
    title: "Live Journey Tracking",
    desc: "Share your live GPS location and ETA with your family or executive assistant instantly.",
    icon: <Navigation size={28} className="text-[#C5A059]" />,
    span: "lg:col-span-1"
  },
  {
    id: "03",
    title: "Zero Surge Pricing",
    desc: "Transparent, fixed rates. You never pay more for traffic delays or peak hours.",
    icon: <ShieldCheck size={28} className="text-[#C5A059]" />,
    span: "lg:col-span-1"
  },
  {
    id: "04",
    title: "Punctuality Guarantee",
    desc: "We track your flights and monitor Nairobi traffic to ensure your chauffeur is waiting 15 minutes early.",
    icon: <Clock size={28} className="text-[#C5A059]" />,
    span: "lg:col-span-2"
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#B35A38]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[1px] bg-[#B35A38]" />
              <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">The JTS Standard</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.15]">
              Uncompromising Quality in <span className="text-[#C5A059] italic font-light">Every Mile.</span>
            </h2>
          </div>
          <p className="text-gray-400 font-light text-sm md:text-base max-w-sm border-l-2 border-white/10 pl-6 pb-2">
            We don't just drive; we orchestrate seamless logistics so you can focus on what matters most.
          </p>
        </div>

        {/* Premium Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className={`relative bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 md:p-10 overflow-hidden group hover:border-[#C5A059]/30 transition-colors duration-500 ${feature.span}`}
            >
              {/* Giant Watermark Number (Creates Depth) */}
              <div className="absolute -bottom-6 -right-4 text-[120px] font-black text-white/[0.02] group-hover:text-[#C5A059]/[0.05] transition-colors duration-500 leading-none select-none pointer-events-none font-serif">
                {feature.id}
              </div>

              {/* Icon Container with Glassmorphism */}
              <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>

              {/* Text Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 font-light leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>

              {/* Hover Line Animation */}
              <div className="absolute top-0 left-0 w-0 h-[2px] bg-gradient-to-r from-[#C5A059] to-[#B35A38] group-hover:w-full transition-all duration-700 ease-out" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}