import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Menu, X, ChevronDown, User } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import UserProfile from "./UserProfile";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const authContext = useAuthContext();
  const user = authContext ? authContext.user : null;

  // Close mobile menu when route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  const serviceItems = [
    { name: "Airport Transfers", hash: "/services#transfers" },
    { name: "Chauffeur Rentals", hash: "/services#rentals" },
    { name: "Hotel Partnerships", hash: "/services#hotels" },
    { name: "Fleet Management", hash: "/services#fleet" },
  ];

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 pb-1 ${
      isActive 
        ? "text-[#C5A059] border-b-2 border-[#C5A059]" 
        : "text-white hover:text-[#C5A059] border-b-2 border-transparent"
    }`;
  };

  return (
    <>
      {/* Permanently Dark Header so the Logo Pops */}
      <nav className="absolute top-0 left-0 w-full z-[3000] bg-[#050505] py-4 border-b border-white/10 shadow-2xl">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
          
          <Link to="/" className="flex items-center group">
            <img 
              src="/jts-logoo.png" 
              alt="Jamupet Transit"
              width="156"
              height="80"
              className="h-12 md:h-16 w-auto object-contain group-hover:opacity-80 transition-opacity"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            
            <div className="flex items-center gap-8 mr-4 mt-1">
              <Link to="/" className={getLinkClass("/")}>Home</Link>
              <Link to="/about" className={getLinkClass("/about")}>About</Link>
              
              <div className="group relative">
                <HashLink to="/services" className={`flex items-center gap-1 ${getLinkClass("/services")}`}>
                  Services <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
                </HashLink>
                
                <div className="absolute top-full left-0 w-full h-6" />
                
                <div className="absolute hidden group-hover:block w-56 top-full left-0 pt-4 z-50">
                  <div className="flex flex-col rounded-xl overflow-hidden shadow-2xl border bg-[#111] border-white/10">
                    {serviceItems.map((item) => (
                      <HashLink 
                        key={item.name} 
                        smooth 
                        to={item.hash} 
                        className="p-4 text-[10px] uppercase tracking-widest transition-colors text-gray-400 hover:text-[#C5A059] hover:bg-white/5 border-b border-white/5"
                      >
                        {item.name}
                      </HashLink>
                    ))}
                  </div>
                </div>
              </div>

              <Link to="/destinations" className={getLinkClass("/destinations")}>Destinations</Link>
            </div>

            <div className="flex items-center gap-4 border-l border-gray-600/50 pl-8">
              <button 
                onClick={() => navigate("/booking")}
                className="px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg bg-[#C5A059] text-black hover:bg-white hover:shadow-[0_0_20px_rgba(197,160,89,0.3)]"
              >
                Book Now
              </button>

              {user ? (
                <UserProfile />
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="group relative flex items-center justify-center p-2.5 rounded-full border transition-all duration-300 hover:scale-105 bg-white/5 border-white/20 hover:border-[#C5A059] hover:bg-[#C5A059]/10"
                  title="Client Login"
                >
                  <User size={18} className="text-white group-hover:text-[#C5A059] transition-colors" />
                </button>
              )}
            </div>

          </div>

          <button 
            className="lg:hidden text-white hover:text-[#C5A059] transition-colors" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[2999] flex flex-col justify-center items-center bg-[#050505]/95 backdrop-blur-2xl transition-all duration-500 ease-in-out ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}>
        <div className="flex flex-col items-center gap-8 w-full px-6">
          <Link to="/" className="text-2xl font-serif text-white hover:text-[#C5A059] transition-colors">Home</Link>
          <Link to="/about" className="text-2xl font-serif text-white hover:text-[#C5A059] transition-colors">About Us</Link>
          <div className="w-12 h-[1px] my-2 bg-white/10" />
          <Link to="/services" className="text-2xl font-serif text-[#C5A059]">Our Services</Link>
          {serviceItems.map((item) => (
            <HashLink key={item.name} smooth to={item.hash} onClick={() => setIsOpen(false)} className="text-sm font-light uppercase tracking-widest text-gray-400 hover:text-white">
              {item.name}
            </HashLink>
          ))}
          <div className="w-12 h-[1px] my-2 bg-white/10" />
          <Link to="/destinations" className="text-2xl font-serif text-white hover:text-[#C5A059] transition-colors">Destinations</Link>
          
          <div className="flex flex-col gap-4 mt-8 w-full max-w-[250px]">
            <button 
              onClick={() => { setIsOpen(false); setShowLoginModal(true); }}
              className="w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all border bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Client Login
            </button>
            <button 
              onClick={() => { setIsOpen(false); navigate("/booking"); }}
              className="w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-lg bg-[#C5A059] text-black hover:bg-white"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}