import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader, Save } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuthContext } from "../context/AuthContext";

export default function ProfileSettingsPage() {
  const { user } = useAuthContext();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        setFullName(data?.full_name || user.user_metadata?.full_name || "");
        setPhone(data?.phone || "");
      } catch (err) {
        setStatus({ type: "error", message: err.message });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setStatus(null);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name: fullName.trim() || null,
            phone: phone.trim() || null,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );

      if (error) throw error;

      setStatus({ type: "success", message: "Profile details updated successfully." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto border border-gray-300 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Profile Settings</h1>
          <p className="text-gray-600 mb-6">Sign in to edit your profile details.</p>
          <Link to="/auth" className="inline-block px-6 py-3 bg-[#B35A38] text-white font-semibold hover:bg-[#8B4225] transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="border border-gray-300 p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your personal details used for bookings.</p>
        </div>

        {loading ? (
          <div className="border border-gray-300 p-8 flex items-center gap-3 text-gray-700">
            <Loader size={18} className="animate-spin" />
            Loading profile...
          </div>
        ) : (
          <form onSubmit={handleSave} className="border border-gray-300 p-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="w-full px-4 py-3 border border-gray-300 bg-gray-100 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#B35A38]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-[#B35A38]"
              />
            </div>

            {status && (
              <div className={`p-4 border ${status.type === "success" ? "bg-green-50 border-green-400 text-green-700" : "bg-red-50 border-red-400 text-red-700"}`}>
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#B35A38] text-white font-semibold hover:bg-[#8B4225] disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

