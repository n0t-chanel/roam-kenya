import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // We don't want the back button to show on the Home page
  if (location.pathname === "/") return null;

  return (
    <button 
      onClick={() => navigate(-1)}
      className="fixed top-24 left-6 z-[2000] flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full hover:bg-[#B35A38] hover:border-[#B35A38] transition-all duration-300 group shadow-2xl"
    >
      <div className="bg-white/10 p-1 rounded-full group-hover:bg-white group-hover:text-[#B35A38] transition-colors">
        <ArrowLeft size={14} />
      </div>
      <span className="text-[9px] uppercase tracking-[0.2em] font-black">Go Back</span>
    </button>
  );
}