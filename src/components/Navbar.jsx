import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Menu, X, ChevronDown, LogIn, User } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import UserProfile from "./UserProfile";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const serviceItems = [
    { name: "Airport Transfers", hash: "/services#transfers" },
    { name: "Chauffeur Rentals", hash: "/services#rentals" },
    { name: "Hotel Partnerships", hash: "/services#hotels" },
    { name: "Fleet Management", hash: "/services#fleet" },
  ];

  return (
    <nav className={`fixed w-full z-[3000] transition-all duration-500 ${
      isScrolled ? "bg-black/90 py-3 shadow-2xl" : "bg-transparent py-6"
    }`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
        
        {/* LOGO  */}
        <Link to="/" className="flex items-center">
          <img 
            src="/jts-logoo.png" 
            alt="Jamupet Logo" alt="Jamupet Transit" width="156" height="80"
            className="h-16 md:h-20 w-auto object-contain"
          />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-[11px] uppercase tracking-[0.2em] font-bold ${location.pathname === "/" ? "text-[#C5A059]" : "text-white"}`}>Home</Link>
          <Link to="/about" className="text-white hover:text-[#C5A059] text-[11px] uppercase tracking-[0.2em] font-bold">About</Link>
          
          <div className="group relative">
            <HashLink to="/services" className="text-white hover:text-[#C5A059] text-[11px] uppercase tracking-[0.2em] font-bold flex items-center gap-1">
              Services <ChevronDown size={12} />
            </HashLink>
            <div className="absolute hidden group-hover:block w-56 bg-black/95 top-full left-0 pt-4">
              <div className="flex flex-col border-t border-[#C5A059] bg-[#111]">
                {serviceItems.map((item) => (
                  <HashLink key={item.name} smooth to={item.hash} className="p-3 text-[10px] uppercase tracking-widest text-white hover:bg-[#C5A059]">
                    {item.name}
                  </HashLink>
                ))}
              </div>
            </div>
          </div>

          <Link to="/destinations" className="text-white hover:text-[#C5A059] text-[11px] uppercase tracking-[0.2em] font-bold">Destinations</Link>
          
          <button 
            onClick={() => navigate("/booking")}
            className="bg-[#B35A38] text-white px-6 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Book Now
          </button>

          {/* Person Illustration Login Icon */}
          {user ? (
            <UserProfile />
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="group relative flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-[#B35A38]/20 to-[#C5A059]/20 hover:from-[#B35A38]/30 hover:to-[#C5A059]/30 border border-[#C5A059]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#B35A38]/30"
              title="Login / Sign Up"
            >
              <User size={24} className="text-white group-hover:text-[#C5A059] transition-colors" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#B35A38]/0 via-[#B35A38]/10 to-[#B35A38]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </nav>
  );
}