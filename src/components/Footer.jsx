import React from "react";
import { Link } from "react-router-dom"; // Added for routing
import { HashLink } from 'react-router-hash-link'; // For smooth scrolling to sections
import { Facebook, Instagram, Twitter, Linkedin, Phone, Mail, MapPin, Send, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F0F0F] text-white pt-16 pb-8 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* COLUMN 1: BRAND & VISION */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tighter">
              ROAM<span className="text-[#B35A38]">KENYA</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Kenya’s premier personalized chauffeur and logistics partner. 
              Founded on faith and a commitment to excellence, we elevate your 
              travel experience from the airport to the wild.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#B35A38] hover:border-[#B35A38] transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* COLUMN 2: QUICK LINKS (MIRRORING NAV BAR) */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-[#C5A059]">Quick Links</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Our Services</Link></li>
              <li><Link to="/destinations" className="hover:text-white transition-colors">Destinations</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/booking" className="hover:text-[#B35A38] font-bold transition-colors">Book Now</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: DIRECT SERVICE JUMPS */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-[#C5A059]">Solutions</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><HashLink smooth to="/services#transfers" className="hover:text-white transition-colors">Airport Transfers</HashLink></li>
              <li><HashLink smooth to="/services#rentals" className="hover:text-white transition-colors">Chauffeur Rentals</HashLink></li>
              <li><HashLink smooth to="/services#chauffeur-pricing" className="hover:text-white transition-colors">Fleet Pricing</HashLink></li>
              <li><HashLink smooth to="/services#hotels" className="hover:text-white transition-colors">Hotel Partners</HashLink></li>
              <li><HashLink smooth to="/services#fleet" className="hover:text-white transition-colors">Fleet Management</HashLink></li>
            </ul>
          </div>

          {/* COLUMN 4: CONTACT & LOCATION */}
          <div>
            <h4 className="text-lg font-bold mb-8 text-[#C5A059]">Contact Info</h4>
            <ul className="space-y-6 text-gray-400 text-sm">
              <li className="flex items-start gap-4">
                <MapPin className="text-[#B35A38] shrink-0" size={20} />
                <span>Nairobi, Kenya<br />JKIA Airport, Terminal 1E</span>
              </li>
              <li className="flex items-center gap-4 hover:text-white transition-colors">
                <Phone className="text-[#B35A38] shrink-0" size={20} />
                <a href="tel:+254705416781">+254 705416781</a>
              </li>
              <li className="flex items-center gap-4 hover:text-white transition-colors">
                <Mail className="text-[#B35A38] shrink-0" size={20} />
                <a href="mailto:info@roamkenya.com">info@roamkenya.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
          <p>© {currentYear} ROAM KENYA LTD. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart size={10} className="text-[#B35A38] fill-[#B35A38]" />
            <span>in Kenya</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* FLOATING WHATSAPP BUTTON (Kept your existing logic) */}
      <a 
        href="https://wa.me/254705416781?text=Hello%20Roam%20Kenya,%20I'd%20like%20to%20make%20a%20booking." 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-10 right-10 z-[2000] bg-[#25D366] p-4 rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.4)] hover:scale-110 transition-all group"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="absolute right-full mr-4 bg-white text-black px-4 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
          Book via WhatsApp
        </span>
      </a>
    </footer>
  );
}