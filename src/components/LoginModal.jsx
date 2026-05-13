import { useState } from "react";
import { X, LogIn, UserPlus, Ghost, Chrome, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithApple, signUpAnonymous } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSignUp = () => {
    navigate("/auth?mode=signup");
    onClose();
  };

  const handleSignIn = () => {
    navigate("/auth?mode=signin");
    onClose();
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUpAnonymous();
      if (result.success) {
        onClose();
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
        onClose();
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

  const handleAppleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithApple();
      if (result.success) {
        onClose();
        navigate("/booking");
      } else {
        setError(result.error?.message || "Apple login failed");
      }
    } catch (err) {
      setError(err.message || "Failed to login with Apple");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[3999] bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-sm bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <X size={24} className="text-white" />
          </button>

          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome</h2>
            <p className="text-white/70">to Roam Kenya</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Email Auth Options */}
          <div className="space-y-3 mb-6">
            {/* Sign Up Button */}
            <button
              onClick={handleSignUp}
              disabled={isLoading}
              className="w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserPlus size={22} />
                  <div className="text-left">
                    <p className="font-bold text-sm uppercase tracking-wider">
                      Create Account
                    </p>
                    <p className="text-xs opacity-75">New to Roam Kenya?</p>
                  </div>
                </div>
                <div className="text-xl opacity-0 group-hover:opacity-100 transition-all">
                  →
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LogIn size={22} />
                  <div className="text-left">
                    <p className="font-bold text-sm uppercase tracking-wider">
                      Sign In
                    </p>
                    <p className="text-xs opacity-75">Existing member?</p>
                  </div>
                </div>
                <div className="text-xl opacity-0 group-hover:opacity-100 transition-all">
                  →
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/20" />
            <p className="text-white/60 text-xs font-semibold">OR</p>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Social Auth Options */}
          <div className="space-y-3 mb-6">
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full group relative overflow-hidden rounded-2xl p-3.5 transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <Chrome size={20} className="text-[#4285F4]" />
                <span className="text-white font-semibold text-sm">
                  Continue with Google
                </span>
              </div>
            </button>

            {/* Apple Button */}
            <button
              onClick={handleAppleLogin}
              disabled={isLoading}
              className="w-full group relative overflow-hidden rounded-2xl p-3.5 transition-all duration-300 bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-3">
                <Apple size={20} className="text-white" />
                <span className="text-white font-semibold text-sm">
                  Continue with Apple
                </span>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/20" />
            <p className="text-white/60 text-xs font-semibold">OR</p>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Anonymous Login */}
          <button
            onClick={handleAnonymousLogin}
            disabled={isLoading}
            className="w-full group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border border-purple-500/30 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ghost size={22} />
                <div className="text-left">
                  <p className="font-bold text-sm uppercase tracking-wider">
                    Continue as Guest
                  </p>
                  <p className="text-xs opacity-75">No account needed</p>
                </div>
              </div>
              <div className="text-xl opacity-0 group-hover:opacity-100 transition-all">
                →
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/60 text-xs text-center">
              We're committed to protecting your privacy. See our{" "}
              <a href="#" className="text-[#C5A059] hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#B35A38]/20 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#C5A059]/20 rounded-full blur-3xl -z-10" />
        </div>
      </div>
    </>
  );
}
