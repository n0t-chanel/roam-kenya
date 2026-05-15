import React, { useState, useEffect } from "react";
import { Tag, Timer, Zap, Check, Loader2 } from "lucide-react";
import { supabase } from "../supabaseClient"; 

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch deals from Supabase on component mount
  useEffect(() => {
    async function fetchDeals() {
      try {
        const { data, error } = await supabase
          .from('deals')
          .select('*')
          .eq('is_active', true) // Only fetch deals marked as active
          .order('id', { ascending: true });

        if (error) throw error;
        if (data) setDeals(data);
      } catch (error) {
        console.error("Error fetching deals:", error.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDeals();
  }, []);

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#C5A059]/5 rounded-full blur-[150px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[1px] bg-[#B35A38]" />
              <span className="text-[#B35A38] font-bold tracking-[.3em] uppercase text-[10px]">Private Offers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.15]">
              Exclusive <span className="text-[#C5A059] italic font-light">Travel Privileges.</span>
            </h2>
          </div>
          <p className="text-gray-400 font-light text-sm md:text-right max-w-[250px]">
            Reserved strictly for online bookings. Apply these codes at checkout to redeem your privileges.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#C5A059]" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DealCard({ deal }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(deal.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group cursor-pointer">
      <div className="relative overflow-hidden bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[#C5A059]/40">
        <div className="absolute top-1/2 -left-5 w-10 h-10 bg-[#050505] rounded-full -translate-y-1/2 border-r border-white/10" />
        <div className="absolute top-1/2 -right-5 w-10 h-10 bg-[#050505] rounded-full -translate-y-1/2 border-l border-white/10" />
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <Tag size={20} className="text-[#C5A059]" />
          </div>
          <div className="flex items-center gap-2 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold">
            <Timer size={12} /> {deal.expiry}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[#B35A38] text-[10px] uppercase tracking-[0.2em] font-bold mb-2">{deal.title}</p>
          <h3 className="text-3xl font-bold text-white mb-4">{deal.offer}</h3>
          <p className="text-gray-400 text-sm font-light leading-relaxed mb-8 border-l border-white/10 pl-4">
            {deal.desc}
          </p>
        </div>

        <div 
          onClick={handleCopy}
          className="relative z-10 border border-dashed border-white/20 p-4 rounded-xl flex justify-between items-center group-hover:border-[#C5A059]/50 transition-colors bg-white/[0.02] hover:bg-white/[0.05]"
        >
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Promo Code</span>
            <span className="text-lg font-bold text-white tracking-[0.1em]">{deal.code}</span>
          </div>
          <div className={`text-[10px] font-bold px-4 py-2 rounded-lg uppercase tracking-widest transition-all duration-300 ${
            copied ? "bg-[#C5A059] text-black shadow-[0_0_20px_rgba(197,160,89,0.4)]" : "bg-[#1A1A1A] text-white border border-white/10 group-hover:bg-white group-hover:text-black"
          }`}>
            {copied ? <span className="flex items-center gap-2"><Check size={12}/> Copied</span> : "Copy"}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#C5A059]/0 via-transparent to-[#C5A059]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </div>
  );
}