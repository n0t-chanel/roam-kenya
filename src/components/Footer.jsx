import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Twitter, 
  ArrowRight, ShieldCheck, MessageCircle, Loader2, Check 
} from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  
  // State for the Subscribe Form
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState("idle"); // 'idle', 'loading', 'success'

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setSubStatus("loading");
    
    // Simulate network request (You can hook this up to Supabase later!)
    setTimeout(() => {
      setSubStatus("success");
      setEmail("");
      
      // Reset back to normal after 3 seconds
      setTimeout(() => setSubStatus("idle"), 3000);
    }, 1500);
  };

  const handleWhatsAppChat = () => {
    const phoneNumber = "254705416781";
    const message = "Hello Jamupet Transit, I have a quick question about your services.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <>
      <footer className="bg-[#050505] text-white pt-16 sm:pt-24 pb-8 border-t border-white/10 relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#B35A38]/5 rounded-full blur-[150px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* TOP VIP NEWSLETTER SECTION */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 sm:gap-10 pb-12 sm:pb-16 border-b border-white/10 mb-12 sm:mb-16">
            <div className="max-w-xl text-center lg:text-left">
              <h3 className="text-2xl md:text-3xl font-bold font-serif mb-2 text-white">Join Our Private List</h3>
              <p className="text-gray-400 font-light text-sm">
                Subscribe to receive exclusive travel itineraries, seasonal Safari offers, and corporate logistic insights in East Africa.
              </p>
            </div>
            
            {/* INTERACTIVE SUBSCRIBE FORM */}
            <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto max-w-md relative group">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" 
                disabled={subStatus !== "idle"}
                required
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-36 text-sm text-white focus:outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={subStatus !== "idle"}
                className={`absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center min-w-[110px] ${
                  subStatus === "success" 
                    ? "bg-green-500 text-white" 
                    : "bg-[#C5A059] text-black hover:bg-white disabled:bg-gray-600 disabled:text-gray-400"
                }`}
              >
                {subStatus === "loading" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : subStatus === "success" ? (
                  <span className="flex items-center gap-1"><Check size={14}/> Joined</span>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          </div>

          {/* MAIN FOOTER GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Brand Column */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">JAMUPET</h2>
                <span className="text-[#C5A059] text-[9px] uppercase tracking-[0.3em] font-bold block mt-1">Transit Solutions</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-light pr-4">
                Redefining East African travel. We provide discreet, reliable, and premium chauffeur services tailored to the highest global standards.
              </p>
              <div className="flex gap-4">
                <SocialIcon icon={<Instagram size={18} />} />
                <SocialIcon icon={<Facebook size={18} />} />
                <SocialIcon icon={<Linkedin size={18} />} />
                <SocialIcon icon={<Twitter size={18} />} />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider">Quick Links</h4>
              <ul className="space-y-4">
                <FooterLink onClick={() => navigate("/")} text="Home" />
                <FooterLink onClick={() => navigate("/about")} text="Our Heritage" />
                <FooterLink onClick={() => navigate("/services")} text="Premium Services" />
                <FooterLink onClick={() => navigate("/destinations")} text="Destinations" />
                <FooterLink onClick={() => navigate("/booking")} text="Book a Transfer" />
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider">Contact Us</h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-3 text-gray-400 text-sm hover:text-[#C5A059] transition-colors cursor-pointer group">
                  <MapPin size={18} className="mt-0.5 group-hover:text-[#C5A059] text-gray-500 transition-colors" />
                  <span>Nairobi, Kenya<br/>Serving East Africa</span>
                </li>
                <li 
                  onClick={handleWhatsAppChat}
                  className="flex items-center gap-3 text-gray-400 text-sm hover:text-[#C5A059] transition-colors cursor-pointer group"
                >
                  <Phone size={18} className="group-hover:text-[#C5A059] text-gray-500 transition-colors" />
                  <span>+254 705 416 781</span>
                </li>
                <li 
                  onClick={() => window.location.href = 'mailto:bookings@jamupet.com'}
                  className="flex items-center gap-3 text-gray-400 text-sm hover:text-[#C5A059] transition-colors cursor-pointer group"
                >
                  <Mail size={18} className="group-hover:text-[#C5A059] text-gray-500 transition-colors" />
                  <span>bookings@jamupet.com</span>
                </li>
              </ul>
            </div>

            {/* Trust & Payments */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider">Secure Payments</h4>
              <p className="text-gray-400 text-sm font-light mb-4">
                We process local and international payments securely via mobile and cards.
              </p>
              
              {/* INTERACTIVE Payment Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <PaymentBadge text="M-PESA" color="bg-green-600/10 text-green-500 border-green-600/30 hover:bg-green-600/20 hover:border-green-500" />
                <PaymentBadge text="VISA" color="bg-blue-600/10 text-blue-400 border-blue-600/30 hover:bg-blue-600/20 hover:border-blue-400" />
                <PaymentBadge text="MASTERCARD" color="bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-400" />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} className="text-[#C5A059]" />
                SSL Encrypted Checkout
              </div>
            </div>

          </div>

          {/* BOTTOM BAR */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs text-gray-500 font-light gap-4">
            <p>© {new Date().getFullYear()} Jamupet Transit Solutions. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span onClick={() => navigate("/about#careers")} className="hover:text-[#C5A059] cursor-pointer transition-colors font-bold">Driver Portal</span>
            </div>
          </div>

        </div>
      </footer>

      {/* GLOBAL FLOATING WHATSAPP BUTTON */}
      <button
        onClick={handleWhatsAppChat}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transition-all duration-300 flex items-center justify-center group"
      >
        <MessageCircle size={28} />
        {/* Tooltip that appears on hover */}
        <span className="absolute right-16 bg-white text-black text-xs font-bold px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-xl transform group-hover:-translate-x-2">
          Chat with us
        </span>
      </button>
    </>
  );
}

// Micro-component for Social Icons
function SocialIcon({ icon }) {
  return (
    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#C5A059] hover:text-black hover:border-[#C5A059] transition-all duration-300 cursor-pointer hover:-translate-y-1">
      {icon}
    </div>
  );
}

// Micro-component for Links
function FooterLink({ text, onClick }) {
  return (
    <li>
      <button 
        onClick={onClick}
        className="text-gray-400 text-sm font-light hover:text-[#C5A059] transition-all duration-300 flex items-center gap-2 group"
      >
        <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#C5A059]" />
        {text}
      </button>
    </li>
  );
}

// Micro-component for Payment Badges (Now interactive)
function PaymentBadge({ text, color }) {
  return (
    <div className={`px-3 py-1.5 rounded text-[10px] font-black tracking-wider border cursor-pointer transition-all duration-300 hover:-translate-y-1 ${color}`}>
      {text}
    </div>
  );
}
