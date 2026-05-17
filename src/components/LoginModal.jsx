import { useState } from "react";
import { createPortal } from "react-dom";
import { X, LogIn, UserPlus, Ghost, Chrome, Facebook, Mail, Lock, User, AlertCircle, Loader, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, signInWithFacebook, signUpAnonymous, loading, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // View: "options" | "signin" | "signup"
  const [view, setView] = useState("options");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: ""
  });
  const [formErrors, setFormErrors] = useState({});

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({ email: "", password: "", fullName: "", confirmPassword: "" });
    setFormErrors({});
    setError(null);
  };

  const goToView = (v) => {
    resetForm();
    setView(v);
  };

  const handleClose = () => {
    resetForm();
    setView("options");
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Min 6 characters";
    if (view === "signup") {
      if (!formData.fullName.trim()) errors.fullName = "Name is required";
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords don't match";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setError(null);
    try {
      if (view === "signup") {
        await signUp(formData.email, formData.password);
      } else {
        await signIn(formData.email, formData.password);
      }
      handleClose();
      navigate("/booking");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUpAnonymous();
      if (result.success) {
        handleClose();
        navigate("/booking");
      } else {
        setError(result.error?.message || "Anonymous login failed");
      }
    } catch (err) {
      setError(err.message || "Failed to login anonymously");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        handleClose();
        navigate("/booking");
      } else {
        setError(result.error?.message || "Google login failed");
      }
    } catch (err) {
      setError(err.message || "Failed to login with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithFacebook();
      if (result.success) {
        handleClose();
        navigate("/booking");
      } else {
        setError(result.error?.message || "Facebook login failed");
      }
    } catch (err) {
      setError(err.message || "Failed to login with Facebook");
    } finally {
      setIsLoading(false);
    }
  };

  // Shared input style
  const inputClass = (fieldName) =>
    `w-full p-3.5 bg-white/10 rounded-xl border transition-all outline-none text-white font-medium placeholder-white/40 text-sm ${
      formErrors[fieldName] ? "border-red-500" : "border-white/20 focus:border-[#C5A059]"
    }`;

  return createPortal(
    <div
      className="fixed inset-0 z-[7000] grid min-h-dvh place-items-center overflow-y-auto px-3 py-6 sm:px-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close login modal"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div
          className="relative w-full bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-5 sm:p-8 max-h-[calc(100dvh-3rem)] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "fadeInScale 0.25s ease-out" }}
        >
          {/* Animation keyframes */}
          <style>{`
            @keyframes fadeInScale {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={22} className="text-white" />
          </button>

          {/* Back button (when in form view) */}
          {view !== "options" && (
            <button
              onClick={() => goToView("options")}
              className="absolute top-5 left-5 p-2 hover:bg-white/10 rounded-full transition-all"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
          )}

          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-1">
              {view === "signup" ? "Create Account" : view === "signin" ? "Sign In" : "Welcome"}
            </h2>
            <p className="text-white/60 text-sm">
              {view === "signup" ? "Join Roam Kenya" : view === "signin" ? "Welcome back" : "to Roam Kenya"}
            </p>
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error || authError}</p>
            </div>
          )}

          {/* === OPTIONS VIEW === */}
          {view === "options" && (
            <>
              {/* Email Auth Options */}
              <div className="space-y-2.5 mb-5">
                <button
                  onClick={() => goToView("signup")}
                  disabled={isLoading}
                  className="w-full group relative overflow-hidden rounded-2xl p-3.5 transition-all duration-300 bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserPlus size={20} />
                      <div className="text-left">
                        <p className="font-bold text-sm">Create Account</p>
                        <p className="text-[11px] opacity-60">New to Roam Kenya?</p>
                      </div>
                    </div>
                    <span className="text-lg opacity-0 group-hover:opacity-100 transition-all">→</span>
                  </div>
                </button>

                <button
                  onClick={() => goToView("signin")}
                  disabled={isLoading}
                  className="w-full group relative overflow-hidden rounded-2xl p-3.5 transition-all duration-300 bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LogIn size={20} />
                      <div className="text-left">
                        <p className="font-bold text-sm">Sign In</p>
                        <p className="text-[11px] opacity-60">Existing member?</p>
                      </div>
                    </div>
                    <span className="text-lg opacity-0 group-hover:opacity-100 transition-all">→</span>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-white/20" />
                <p className="text-white/50 text-xs font-semibold">OR</p>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Social Auth */}
              <div className="space-y-2.5 mb-5">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full rounded-2xl p-3 transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Chrome size={18} className="text-[#4285F4]" />
                    <span className="text-white font-semibold text-sm">Continue with Google</span>
                  </div>
                </button>

                <button
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                  className="w-full rounded-2xl p-3 transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Facebook size={18} className="text-[#1877F2]" />
                    <span className="text-white font-semibold text-sm">Continue with Facebook</span>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-white/20" />
                <p className="text-white/50 text-xs font-semibold">OR</p>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Anonymous */}
              <button
                onClick={handleAnonymousLogin}
                disabled={isLoading}
                className="w-full group relative overflow-hidden rounded-2xl p-3.5 transition-all duration-300 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/30 text-white disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ghost size={20} />
                    <div className="text-left">
                      <p className="font-bold text-sm">Continue as Guest</p>
                      <p className="text-[11px] opacity-60">No account needed</p>
                    </div>
                  </div>
                  <span className="text-lg opacity-0 group-hover:opacity-100 transition-all">→</span>
                </div>
              </button>
            </>
          )}

          {/* === SIGN IN / SIGN UP FORM VIEW === */}
          {(view === "signin" || view === "signup") && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* Full Name (signup only) */}
              {view === "signup" && (
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-white/50 mb-1.5 ml-1">
                    <User size={12} /> Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={inputClass("fullName")}
                  />
                  {formErrors.fullName && <p className="text-red-300 text-xs mt-1 ml-1">{formErrors.fullName}</p>}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-white/50 mb-1.5 ml-1">
                  <Mail size={12} /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass("email")}
                />
                {formErrors.email && <p className="text-red-300 text-xs mt-1 ml-1">{formErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-white/50 mb-1.5 ml-1">
                  <Lock size={12} /> Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputClass("password")}
                />
                {formErrors.password && <p className="text-red-300 text-xs mt-1 ml-1">{formErrors.password}</p>}
              </div>

              {/* Confirm Password (signup only) */}
              {view === "signup" && (
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-white/50 mb-1.5 ml-1">
                    <Lock size={12} /> Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={inputClass("confirmPassword")}
                  />
                  {formErrors.confirmPassword && <p className="text-red-300 text-xs mt-1 ml-1">{formErrors.confirmPassword}</p>}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || loading}
                className="w-full bg-[#B35A38] hover:bg-[#a04a2a] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 shadow-lg shadow-[#B35A38]/20"
              >
                {isLoading || loading ? (
                  <><Loader size={16} className="animate-spin" /> Processing...</>
                ) : (
                  view === "signup" ? "Create Account" : "Sign In"
                )}
              </button>

              {/* Toggle */}
              <div className="text-center pt-3 border-t border-white/10">
                <p className="text-white/50 text-sm">
                  {view === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => goToView(view === "signup" ? "signin" : "signup")}
                    className="text-[#C5A059] font-bold hover:underline"
                  >
                    {view === "signup" ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-white/40 text-[11px] text-center">
              We're committed to protecting your privacy.{" "}
              <a href="#" className="text-[#C5A059] hover:underline">Privacy Policy</a>
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#B35A38]/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#C5A059]/20 rounded-full blur-3xl -z-10" />
        </div>
      </div>
    </div>,
    document.body
  );
}
