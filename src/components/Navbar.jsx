import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { BookOpen, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import UserProfile from "./UserProfile";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const isHomePage = location.pathname === "/";
  const useLightNavbar = !isHomePage;
  const navTextClass = useLightNavbar
    ? "text-gray-900 hover:text-[#B35A38]"
    : "text-white hover:text-[#C5A059]";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const serviceItems = [
    { name: "Airport Transfers", hash: "/services#transfers" },
    { name: "Chauffeur Rentals", hash: "/services#rentals" },
    { name: "Hotel Partnerships", hash: "/services#hotels" },
    { name: "Fleet Management", hash: "/services#fleet" },
  ];

  const mainLinks = [
    { name: "Home", to: "/" },
    { name: "About", to: "/about" },
    { name: "Destinations", to: "/destinations" },
  ];

  const closeMenu = () => setIsOpen(false);

  const navigateAndClose = (path) => {
    closeMenu();
    navigate(path);
  };

  const openLogin = () => {
    closeMenu();
    setShowLoginModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigateAndClose("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const mobileTextClass = useLightNavbar ? "text-gray-900" : "text-white";
  const menuButtonClass = useLightNavbar || isScrolled || isOpen
    ? "border-gray-200 bg-white text-gray-900 shadow-sm"
    : "border-white/20 bg-black/20 text-white backdrop-blur-md";
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Account";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[3000] transition-all duration-500 ${
        useLightNavbar
          ? "bg-white/95 py-2 shadow-md border-b border-gray-200 backdrop-blur-xl"
          : isScrolled || isOpen
            ? "bg-black/92 py-2 shadow-2xl backdrop-blur-xl"
            : "bg-transparent py-3 md:py-6"
      }`}
    >
      <div className="relative z-[3] max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 xl:px-12 flex justify-between items-center">
        
        {/* LOGO  */}
        <Link to="/" className="flex items-center min-w-0" onClick={closeMenu}>
          <img 
            src="/jts-logoo.png" 
            alt="Jamupet Transit"
            width="156"
            height="80"
            className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto max-w-[150px] sm:max-w-[170px] md:max-w-[190px] object-contain"
          />
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className={`text-[11px] uppercase tracking-[0.2em] font-bold ${location.pathname === "/" ? "text-[#C5A059]" : navTextClass}`}>Home</Link>
          <Link to="/about" className={`${location.pathname === "/about" ? "text-[#C5A059]" : navTextClass} text-[11px] uppercase tracking-[0.2em] font-bold`}>About</Link>
          
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
          </div>

          <Link to="/destinations" className={`${location.pathname === "/destinations" ? "text-[#C5A059]" : navTextClass} text-[11px] uppercase tracking-[0.2em] font-bold`}>Destinations</Link>
          
          <button 
            onClick={() => navigate("/booking")}
            className="bg-[#C5A059] text-black px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all duration-300"
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
        <button
          type="button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          className={`lg:hidden relative h-11 w-11 rounded-full border transition-all duration-300 ${menuButtonClass}`}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
          <span
            className={`absolute left-3 right-3 top-[14px] h-0.5 rounded-full bg-current transition-all duration-300 ${
              isOpen ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-3 right-3 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current transition-all duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-3 right-3 bottom-[14px] h-0.5 rounded-full bg-current transition-all duration-300 ${
              isOpen ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-[68px] sm:top-[76px] md:top-[88px] z-[1] bg-black/45 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      />

      <div
        id="mobile-navigation"
        className={`lg:hidden fixed left-3 right-3 top-[76px] sm:top-[84px] md:top-[96px] z-[2] max-h-[calc(100dvh-88px)] sm:max-h-[calc(100dvh-96px)] md:max-h-[calc(100dvh-108px)] overflow-y-auto rounded-2xl border shadow-2xl transition-all duration-300 ${
          useLightNavbar
            ? "border-gray-200 bg-white text-gray-900"
            : "border-white/10 bg-[#080808]/95 text-white backdrop-blur-2xl"
        } ${isOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-4 opacity-0 pointer-events-none"}`}
      >
        <div className="p-3">
          <div className={`rounded-xl p-2 ${useLightNavbar ? "bg-gray-50" : "bg-white/5"}`}>
            {mainLinks.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                onClick={closeMenu}
                className={`block rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] transition-colors ${
                  location.pathname === item.to
                    ? "bg-[#C5A059] text-black"
                    : `${mobileTextClass} hover:bg-[#C5A059] hover:text-black`
                }`}
              >
                {item.name}
              </Link>
            ))}

            <HashLink
              smooth
              to="/services"
              onClick={closeMenu}
              className={`block rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] transition-colors ${
                location.pathname === "/services"
                  ? "bg-[#C5A059] text-black"
                  : `${mobileTextClass} hover:bg-[#C5A059] hover:text-black`
              }`}
            >
              Services
            </HashLink>
          </div>

          <div className={`mt-3 rounded-xl p-2 ${useLightNavbar ? "bg-gray-50" : "bg-white/5"}`}>
            <p className={`px-4 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.22em] ${useLightNavbar ? "text-gray-500" : "text-white/45"}`}>
              Service Types
            </p>
            {serviceItems.map((item) => (
              <HashLink
                key={item.name}
                smooth
                to={item.hash}
                onClick={closeMenu}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  useLightNavbar ? "text-gray-700 hover:bg-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.name}
              </HashLink>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigateAndClose("/booking")}
            className="mt-3 w-full rounded-xl bg-[#C5A059] px-5 py-3.5 text-sm font-black uppercase tracking-[0.16em] text-black transition-colors hover:bg-white"
          >
            Book Now
          </button>

          <div className={`mt-3 rounded-xl border p-3 ${useLightNavbar ? "border-gray-200 bg-white" : "border-white/10 bg-black/20"}`}>
            {user ? (
              <>
                <div className="mb-2 flex items-center gap-3 px-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B35A38] to-[#C5A059] text-sm font-bold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-bold ${mobileTextClass}`}>{userName}</p>
                    <p className={`truncate text-xs ${useLightNavbar ? "text-gray-500" : "text-white/50"}`}>{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigateAndClose("/bookings")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    useLightNavbar ? "text-gray-800 hover:bg-gray-100" : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <BookOpen size={16} className="text-[#C5A059]" />
                  My Bookings
                </button>
                <button
                  type="button"
                  onClick={() => navigateAndClose("/settings")}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    useLightNavbar ? "text-gray-800 hover:bg-gray-100" : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Settings size={16} className="text-[#C5A059]" />
                  Account Settings
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold transition-colors ${
                  useLightNavbar
                    ? "border-[#B35A38] text-[#B35A38] hover:bg-[#B35A38] hover:text-white"
                    : "border-[#C5A059]/40 text-white hover:bg-[#B35A38]"
                }`}
              >
                <User size={18} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </nav>
  );
}
