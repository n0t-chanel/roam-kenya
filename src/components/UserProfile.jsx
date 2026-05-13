import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, BookOpen, Settings, User, ChevronDown } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";

export default function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      setIsOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="relative group">
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all group-hover:shadow-lg group-hover:shadow-[#B35A38]/20"
        title={user.email}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B35A38] to-[#C5A059] flex items-center justify-center text-white font-bold text-sm">
          {userInitial}
        </div>
        <ChevronDown
          size={16}
          className="text-white/70 group-hover:text-[#C5A059] transition-colors"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-[4000] overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#B35A38]/10 to-[#C5A059]/10">
            <p className="text-white font-semibold text-sm">{userName}</p>
            <p className="text-white/60 text-xs">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                navigate("/bookings");
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <BookOpen size={16} className="text-[#C5A059]" />
              <span>My Bookings</span>
            </button>

            <button
              onClick={() => {
                navigate("/profile");
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <User size={16} className="text-[#C5A059]" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => {
                navigate("/settings");
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm"
            >
              <Settings size={16} className="text-[#C5A059]" />
              <span>Account Settings</span>
            </button>
          </div>

          {/* Logout Button */}
          <div className="p-2 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all rounded-lg text-sm font-medium"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[3999]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
