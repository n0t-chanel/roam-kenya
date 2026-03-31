import { Tag, Timer, Zap } from "lucide-react";

const deals = [
  {
    id: 1,
    title: "First-Time Flyer",
    code: "KARIBU24",
    offer: "15% OFF",
    desc: "Valid for your first airport transfer from JKIA.",
    expiry: "Limited Slots",
    color: "from-orange-500 to-red-600"
  },
  {
    id: 2,
    title: "Mara Weekend Special",
    code: "WILDWEEK",
    offer: "SAVE $50",
    desc: "Book a 3-day safari roadtrip and save.",
    expiry: "Ends in 2 Days",
    color: "from-emerald-500 to-teal-700"
  },
  {
    id: 3,
    title: "Corporate Partnership",
    code: "BIZTRAVEL",
    offer: "FREE UPGRADE",
    desc: "Upgrade to Executive Class for Sedan price.",
    expiry: "Ongoing",
    color: "from-blue-600 to-indigo-800"
  }
];

export default function Deals() {
  return (
    <section className="py-16 bg-white overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="text-[#B35A38]" size={16} fill="currentColor" />
              <span className="text-[#B35A38] font-bold tracking-[.2em] uppercase text-[10px]">Flash Offers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Exclusive Travel Deals</h2>
          </div>
          <p className="text-gray-400 text-[10px] max-w-[200px] md:text-right">Terms apply. Valid for online bookings only.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deals.map((deal) => (
            <div key={deal.id} className="relative group cursor-pointer">
              <div className={`relative overflow-hidden bg-gradient-to-br ${deal.color} p-6 rounded-[2rem] text-white shadow-xl transition-all duration-500 group-hover:-translate-y-2`}>
                
                {/* Cut-outs */}
                <div className="absolute top-1/2 -left-4 w-8 h-8 bg-white rounded-full -translate-y-1/2" />
                <div className="absolute top-1/2 -right-4 w-8 h-8 bg-white rounded-full -translate-y-1/2" />
                
                <div className="flex justify-between items-start mb-4">
                  <Tag size={20} className="opacity-70" />
                  <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold">
                    <Timer size={10} /> {deal.expiry}
                  </div>
                </div>

                <p className="text-[10px] uppercase tracking-widest opacity-80 mb-1">{deal.title}</p>
                <h3 className="text-3xl font-bold mb-3">{deal.offer}</h3>
                <p className="text-[13px] opacity-90 mb-6 leading-snug">
                  {deal.desc}
                </p>

                {/* Promo Box */}
                <div className="relative border border-dashed border-white/40 p-3 rounded-xl flex justify-between items-center group-hover:border-white transition-colors">
                  <span className="text-[10px] font-mono opacity-70">CODE:</span>
                  <span className="text-base font-bold tracking-wider">{deal.code}</span>
                  <div className="absolute -top-2 -right-2 bg-white text-black text-[7px] font-black px-1.5 py-0.5 rounded rotate-12 group-hover:rotate-0 transition-transform">
                    COPY
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}