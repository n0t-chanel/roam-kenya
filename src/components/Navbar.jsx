import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Menu, X, ChevronDown, User } from "lucide-react";
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
  const isHomePage = location.pathname === "/";
  const useLightNavbar = !isHomePage;
  const navTextClass = useLightNavbar ? "text-gray-900 hover:text-[#B35A38]" : "text-white hover:text-[#C5A059]";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  const serviceItems = [
    { name: "Airport Transfers", hash: "/services#transfers" },
    { name: "Chauffeur Rentals", hash: "/services#rentals" },
    { name: "Hotel Partnerships", hash: "/services#hotels" },
    { name: "Fleet Management", hash: "/services#fleet" },
  ];

  return (
    <nav className={`fixed w-full z-[3000] transition-all duration-500 ${
      useLightNavbar
        ? "bg-white py-3 shadow-md border-b border-gray-200"
        : isScrolled
          ? "bg-black/90 py-3 shadow-2xl"
          : "bg-transparent py-6"
    }`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
        
        {/* LOGO  */}
        <Link to="/" className="flex items-center">
          <img 
            src="/jts-logoo.png" 
            alt="Jamupet Transit"
            width="156"
            height="80"
            className="h-16 md:h-20 w-auto object-contain"
          />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-[11px] uppercase tracking-[0.2em] font-bold ${location.pathname === "/" ? "text-[#C5A059]" : navTextClass}`}>Home</Link>
          <Link to="/about" className={`${navTextClass} text-[11px] uppercase tracking-[0.2em] font-bold`}>About</Link>
          
          <div className="group relative">
            <HashLink to="/services" className={`${navTextClass} text-[11px] uppercase tracking-[0.2em] font-bold flex items-center gap-1`}>
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

            <Link to="/destinations" className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${location.pathname === "/destinations" ? "text-[#C5A059]" : "text-white hover:text-[#C5A059]"}`}>
              Destinations
            </Link>
            <Link to="/auth" className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${location.pathname === "/auth" ? "text-[#C5A059]" : "text-white hover:text-[#C5A059]"}`}>
                 Client Login
                  </Link>
            
            <button 
              onClick={() => navigate("/booking")}
              className="bg-[#C5A059] text-black px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all duration-300"
            >
              
              Book Now
            </button>
          </div>

          <Link to="/destinations" className={`${navTextClass} text-[11px] uppercase tracking-[0.2em] font-bold`}>Destinations</Link>
          
          <button 
            onClick={() => {
              setIsOpen(false);
              navigate("/booking");
            }}
            className="mt-8 bg-[#C5A059] text-black w-full max-w-[200px] py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all"
          >
            Book Now
          </button>

          {/* Person Illustration Login Icon */}
          {user ? (
            <UserProfile />
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className={`group relative flex items-center justify-center p-3 rounded-full border transition-all duration-300 ${
                useLightNavbar
                  ? "bg-white border-[#B35A38] hover:bg-[#B35A38]"
                  : "bg-black/20 border-[#C5A059]/40 hover:bg-[#B35A38]"
              }`}
              title="Login / Sign Up"
            >
              <User
                size={24}
                className={`transition-colors ${useLightNavbar ? "text-[#B35A38] group-hover:text-white" : "text-white group-hover:text-white"}`}
              />
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className={`md:hidden ${useLightNavbar ? "text-gray-900" : "text-white"}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </nav>
  );
}
