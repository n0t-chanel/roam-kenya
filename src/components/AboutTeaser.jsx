import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AboutTeaser() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#B35A38]/5 rounded-full blur-[150px] -translate-x-1/4 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#C5A059]/5 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

          <div className="w-full lg:w-1/2 relative">
            <div className="relative rounded-[2rem] overflow-hidden border border-gray-200 shadow-2xl">
              <img 
                src="/assets/black-sedan.webp" 
                alt="Luxury Fleet" 
                width="800" 
                height="600" 
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700" 
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
            </div>

            <div className="absolute -bottom-8 -right-4 md:-right-8 bg-white/90 border border-gray-100 p-6 rounded-2xl shadow-2xl flex items-center gap-5 backdrop-blur-xl">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#C5A059]/10">
                <ShieldCheck size={28} className="text-[#C5A059]" />
              </div>
              <div>
                <div className="text-gray-900 font-bold text-xl">Top Rated</div>
                <div className="text-gray-500 text-xs uppercase tracking-widest">In Nairobi</div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-[1px] bg-[#B35A38]" />
                <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">What We Do</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-[1.15] text-gray-900">
                Luxury Transport For The <span className="text-[#C5A059] italic font-light">Most Comfortable</span> Experience.
              </h2>
            </div>

            <p className="text-gray-600 leading-relaxed text-base font-light border-l-2 border-[#C5A059]/30 pl-6">
              Step into a world of reliability with plush seating, pristine interiors, and state-of-the-art features designed to maximize comfort. Whether you need VIP airport transfers or want to <strong className="text-gray-900 font-medium">save money with our rentals</strong>, we offer highly competitive, <strong className="text-gray-900 font-medium">cheap rental services in Nairobi</strong> without ever compromising on our premium standards.
            </p>

            <ul className="space-y-4 pt-2">
              {[
                "Executive sedans, luxury SUVs, and safari cruisers.",
                "Flexible options for corporate events to weddings.",
                "Courteous chauffeurs trained for safe, private journeys."
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm text-gray-700 group">
                  <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-[#C5A059] group-hover:bg-[#C5A059]/10 transition-colors">
                    <CheckCircle2 size={12} className="text-[#C5A059]" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6">
              <button
                onClick={() => navigate("/about")}
                className="flex items-center gap-4 text-gray-900 font-bold hover:text-[#B35A38] transition-all text-sm group"
              >
                Read Our Full Story
                <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center group-hover:border-[#B35A38] group-hover:bg-[#B35A38] group-hover:text-white transition-all overflow-hidden relative">
                  <ArrowRight size={16} className="relative z-10 group-hover:-translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}