import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
        
        {/* LOGO - Replaced text with Image as requested */}
        <Link to="/" className="flex items-center">
          <img 
            src="/jts-logoo.png" // Update this to your actual logo path
            alt="Jamupet Logo" 
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
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
}