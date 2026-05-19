import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageSquare } from "lucide-react";

export default function CTA() {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    const phoneNumber = "254705416781";
    const message = "Hello Jamupet Transit, I have a quick question about booking a transfer.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section className="relative py-32 bg-[#FDFCFB] overflow-hidden flex items-center justify-center">
      
      {/* Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/chauffers-careers.webp" 
          alt="Luxury Chauffeur Service" 
          width="1920"
          height="1080"
          className="w-full h-full object-cover scale-105 opacity-20 grayscale"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1600"; }}
        />
        {/* Light Gradients to blend the image seamlessly */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCFB] via-transparent to-[#FDFCFB]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCFB] via-white/40 to-[#FDFCFB]" />
      </div>

      {/* Floating Glassmorphism Card (Light Theme) */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] p-10 md:p-20 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden group hover:border-[#C5A059]/30 transition-colors duration-700">
          
          {/* Subtle Inner Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#C5A059]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-20">
            <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px] md:text-xs mb-6 block">
              Your Premium Journey Awaits
            </span>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight font-serif">
              Ready to experience the <br className="hidden md:block" />
              <span className="italic font-light text-[#C5A059]">Gold Standard?</span>
            </h2>
            
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto font-light mb-12">
              Whether it is a seamless airport transfer, a corporate roadshow, or a bespoke safari, our executive fleet is ready to move you across East Africa with unmatched precision and comfort.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate("/booking")}
                className="w-full sm:w-auto bg-[#C5A059] text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gray-900 transition-all shadow-[0_10px_30px_rgba(197,160,89,0.3)] group"
              >
                Book Your Transfer 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={handleWhatsApp}
                className="w-full sm:w-auto bg-white border border-gray-200 text-gray-900 px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <MessageSquare size={16} className="text-[#C5A059]" />
                Speak to an Agent
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}