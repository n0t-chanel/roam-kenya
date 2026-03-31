import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link"; // Essential for section jumps
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Defined specific sub-services for the dropdown
  const serviceItems = [
    { name: "Airport Transfers", hash: "/services#transfers" },
    { name: "Chauffeur Rentals", hash: "/services#rentals" },
    { name: "Hotel Partnerships", hash: "/services#hotels" },
    { name: "Fleet Management", hash: "/services#fleet" },
  ];

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Destinations", path: "/destinations" },
  ];

  return (
    <nav className={`fixed w-full z-[3000] transition-all duration-500 bg-black/80 backdrop-blur-md ${
      isScrolled ? "py-2 shadow-2xl" : "py-3"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="text-2xl font-heading font-bold text-white tracking-tighter">
          ROAM<span className="text-[#B35A38]">KENYA</span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-10">
          {/* Home and About */}
          {navLinks.slice(0, 2).map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`text-[11px] uppercase tracking-[0.25em] font-bold transition-all duration-300 ${
                location.pathname === link.path ? "text-[#C5A059]" : "text-white hover:text-[#C5A059]"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* SERVICES WITH DROPDOWN */}
          <div className="group relative">
            <HashLink 
              to="/services" 
              className={`text-[11px] uppercase tracking-[0.25em] font-bold transition-all duration-300 flex items-center gap-1 ${
                location.pathname === "/services" ? "text-[#C5A059]" : "text-white hover:text-[#C5A059]"
              }`}
            >
              Services <ChevronDown size={12} className="group-hover:rotate-180 transition-transform" />
            </HashLink>
            
            {/* Dropdown Menu */}
            <div className="absolute hidden group-hover:block w-64 bg-black/95 text-white top-full left-0 pt-6 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col border-t-2 border-[#C5A059] bg-[#1A1A1A] shadow-2xl">
                {serviceItems.map((item) => (
                  <HashLink
                    key={item.name}
                    smooth
                    to={item.hash}
                    className="p-4 text-[10px] uppercase tracking-widest hover:bg-[#C5A059] hover:text-white transition-all border-b border-white/5"
                  >
                    {item.name}
                  </HashLink>
                ))}
              </div>
            </div>
          </div>

          {/* Destinations */}
          <Link 
            to="/destinations" 
            className={`text-[11px] uppercase tracking-[0.25em] font-bold transition-all duration-300 ${
              location.pathname === "/destinations" ? "text-[#C5A059]" : "text-white hover:text-[#C5A059]"
            }`}
          >
            Destinations
          </Link>
          
          <button 
            onClick={() => navigate("/booking")}
            className="bg-[#B35A38] text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 shadow-lg active:scale-95"
          >
            Book Now
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button className="md:hidden text-white p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black z-[4000] flex flex-col items-center justify-center overflow-y-auto py-20 px-6 md:hidden">
          <button className="absolute top-8 right-8 text-white" onClick={() => setIsOpen(false)}><X size={32}/></button>
          
          <Link to="/" onClick={() => setIsOpen(false)} className="text-white text-3xl font-heading font-bold mb-4">Home</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className="text-white text-3xl font-heading font-bold mb-4">About</Link>
          
          {/* Mobile Services Sections */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <Link to="/services" onClick={() => setIsOpen(false)} className="text-[#C5A059] text-3xl font-heading font-bold uppercase tracking-widest">Services</Link>
            <div className="flex flex-col items-center gap-3">
              {serviceItems.map((item) => (
                <HashLink 
                  key={item.name} 
                  smooth 
                  to={item.hash} 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 text-lg hover:text-white transition-colors"
                >
                  {item.name}
                </HashLink>
              ))}
            </div>
          </div>

          <Link to="/destinations" onClick={() => setIsOpen(false)} className="text-white text-3xl font-heading font-bold mb-10">Destinations</Link>
          
          <button 
            onClick={() => {
              setIsOpen(false);
              navigate("/booking");
            }}
            className="bg-[#B35A38] text-white px-12 py-5 rounded-2xl text-lg font-bold uppercase tracking-widest"
          >
            Book Now
          </button>
        </div>
      )}
    </nav>
  );
}