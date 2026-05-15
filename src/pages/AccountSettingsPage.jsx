import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Loader, LogOut } from "lucide-react";
import { supabaseAuth } from "../lib/supabase";
import { useAuthContext } from "../context/AuthContext";

export default function AccountSettingsPage() {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!password.trim()) {
      setStatus({ type: "error", message: "New password is required." });
      return;
    }
    if (password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabaseAuth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirmPassword("");
      setStatus({ type: "success", message: "Password updated successfully." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto border border-gray-300 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Account Settings</h1>
          <p className="text-gray-600 mb-6">Sign in to manage your account.</p>
          <Link to="/auth" className="inline-block px-6 py-3 bg-[#B35A38] text-white font-semibold hover:bg-[#8B4225] transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border border-gray-300 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your account security and session controls.</p>
        </div>

        <div className="border border-gray-300 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-semibold text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-500">User ID</p>
              <p className="font-semibold text-gray-900 break-all">{user.id}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="border border-gray-300 p-8 space-y-5">
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#B35A38]"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#B35A38]"
              placeholder="Confirm new password"
            />
          </div>

          {status && (
            <div className={`p-4 border ${status.type === "success" ? "bg-green-50 border-green-400 text-green-700" : "bg-red-50 border-red-400 text-red-700"}`}>
              {status.message}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#B35A38] text-white font-semibold hover:bg-[#8B4225] disabled:opacity-50 transition-colors"
            >
              {isSaving ? <Loader size={18} className="animate-spin" /> : <KeyRound size={18} />}
              {isSaving ? "Updating..." : "Update Password"}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-6 py-3 border border-red-500 text-red-600 font-semibold hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

