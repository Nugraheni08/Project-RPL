"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { showToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import {
  FiUser,
  FiLock,
  FiBell,
  FiSettings,
  FiSave,
  FiLoader,
} from "react-icons/fi";

export default function AdminSettingsPage() {
  const [userId, setUserId] = useState<string>("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [campusName, setCampusName] = useState("");
  const [ecoScore, setEcoScore] = useState("");
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [reportNotif, setReportNotif] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  // Ambil user session + profile data saat mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        if (!user) return;

        setUserId(user.id);
        setEmail(user.email || "");

        // Ambil data dari user_metadata (notifikasi + campus settings)
        const meta = user.user_metadata || {};
        if (meta.email_notifications !== undefined) setEmailNotif(meta.email_notifications);
        if (meta.push_notifications !== undefined) setPushNotif(meta.push_notifications);
        if (meta.report_alerts !== undefined) setReportNotif(meta.report_alerts);
        if (meta.campus_name) setCampusName(meta.campus_name);
        if (meta.default_eco_score) setEcoScore(String(meta.default_eco_score));

        // Ambil profile dari public.profiles
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single();

        if (profileData) {
          if (profileData.full_name) setAdminName(profileData.full_name);
          if (profileData.phone) setPhone(profileData.phone);
        }

        // Fallback admin name dari user_metadata atau email
        if (!adminName && !profileData?.full_name) {
          setAdminName(meta.full_name || meta.username || user.email?.split("@")[0] || "Admin WMap");
        }
      } catch (err) {
        console.error("Gagal fetch profile:", err);
      } finally {
        setIsFetchingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Validasi password saat user mengetik
  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordError("Password tidak cocok.");
    } else if (newPassword && newPassword.length < 6) {
      setPasswordError("Password minimal 6 karakter.");
    } else {
      setPasswordError("");
    }
  }, [newPassword, confirmPassword]);

  const handleSave = async () => {
    if (!userId) {
      showToast("Sesi tidak valid. Silakan login ulang.", "❌");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      showToast("Password baru dan konfirmasi tidak cocok.", "❌");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      showToast("Password minimal 6 karakter.", "❌");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          adminName,
          email,
          phone,
          newPassword: newPassword || undefined,
          confirmPassword: confirmPassword || undefined,
          emailNotif,
          pushNotif,
          reportNotif,
          campusName,
          ecoScore,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan pengaturan.");
      }

      // Hapus field password setelah sukses
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");

      showToast(result.message || "Pengaturan berhasil disimpan.", "✅");
    } catch (error: any) {
      console.error("SETTINGS_SAVE_ERROR:", error);
      showToast(error.message || "Terjadi kesalahan saat menyimpan.", "❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-950">Settings</h1>
        <p className="text-slate-800 text-lg mt-2">
          Manage administrator and system settings
        </p>
      </div>

      {isFetchingProfile ? (
        <div className="flex items-center justify-center py-20">
          <FiLoader className="animate-spin text-green-600" size={32} />
          <span className="ml-3 text-slate-600 font-semibold">Memuat pengaturan...</span>
        </div>
      ) : (
        <>
          {/* PROFILE SETTINGS */}
          <div className="bg-white rounded-3xl shadow p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <FiUser size={24} className="text-green-600" />
              <h2 className="text-2xl font-bold text-slate-950">Profile Settings</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-900 font-bold mb-2">Admin Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-2">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* SECURITY SETTINGS */}
          <div className="bg-white rounded-3xl shadow p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <FiLock size={24} className="text-red-500" />
              <h2 className="text-2xl font-bold text-slate-950">Security Settings</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-900 font-bold mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border rounded-xl p-4 text-slate-950 font-semibold focus:outline-none focus:ring-2 ${
                    passwordError
                      ? "border-red-500 focus:ring-red-400"
                      : "border-slate-300 focus:ring-red-400"
                  }`}
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-2 font-semibold">{passwordError}</p>
                )}
              </div>
            </div>
          </div>

          {/* NOTIFICATION SETTINGS */}
          <div className="bg-white rounded-3xl shadow p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <FiBell size={24} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-950">Notification Settings</h2>
            </div>

            <div className="space-y-5">
              <label className="flex justify-between items-center cursor-pointer">
                <span className="text-slate-950 font-semibold">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="w-5 h-5 accent-green-600"
                />
              </label>

              <label className="flex justify-between items-center cursor-pointer">
                <span className="text-slate-950 font-semibold">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={pushNotif}
                  onChange={(e) => setPushNotif(e.target.checked)}
                  className="w-5 h-5 accent-green-600"
                />
              </label>

              <label className="flex justify-between items-center cursor-pointer">
                <span className="text-slate-950 font-semibold">Report Alerts</span>
                <input
                  type="checkbox"
                  checked={reportNotif}
                  onChange={(e) => setReportNotif(e.target.checked)}
                  className="w-5 h-5 accent-green-600"
                />
              </label>
            </div>
          </div>

          {/* CAMPUS SETTINGS */}
          <div className="bg-white rounded-3xl shadow p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <FiSettings size={24} className="text-purple-600" />
              <h2 className="text-2xl font-bold text-slate-950">Campus Settings</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-900 font-bold mb-2">Campus Name</label>
                <input
                  type="text"
                  value={campusName}
                  onChange={(e) => setCampusName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-bold mb-2">Default Eco Score</label>
                <input
                  type="number"
                  value={ecoScore}
                  onChange={(e) => setEcoScore(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isLoading || !!passwordError}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl flex items-center gap-2 font-bold shadow transition"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  );
}