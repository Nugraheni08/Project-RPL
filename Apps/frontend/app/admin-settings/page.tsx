"use client";

import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  FiUser,
  FiLock,
  FiBell,
  FiSettings,
  FiSave,
} from "react-icons/fi";

export default function AdminSettingsPage() {
  const [adminName, setAdminName] =
    useState("Admin WMap");

  const [email, setEmail] =
    useState("admin@wmap.com");

  const [phone, setPhone] =
    useState("081234567890");

  const [campusName, setCampusName] =
    useState("Universitas Lampung");

  const [ecoScore, setEcoScore] =
    useState("84");

  const [emailNotif, setEmailNotif] =
    useState(true);

  const [pushNotif, setPushNotif] =
    useState(true);

  const [reportNotif, setReportNotif] =
    useState(true);

  return (
    <AdminLayout>

      {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-950">
            Settings
          </h1>

          <p className="text-slate-800 text-lg mt-2">
            Manage administrator and system settings
          </p>
        </div>

        {/* PROFILE SETTINGS */}
        <div className="bg-white rounded-3xl shadow p-8 mb-8">

          <div className="flex items-center gap-3 mb-6">
            <FiUser
              size={24}
              className="text-green-600"
            />

            <h2 className="text-2xl font-bold text-slate-950">
              Profile Settings
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block text-slate-900 font-bold mb-2">
                Admin Name
              </label>

              <input
                type="text"
                value={adminName}
                onChange={(e) =>
                  setAdminName(e.target.value)
                }
                className="w-full border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-900 font-bold mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-900 font-bold mb-2">
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="w-full border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold"
              />
            </div>

          </div>
        </div>

        {/* SECURITY */}
        <div className="bg-white rounded-3xl shadow p-8 mb-8">

          <div className="flex items-center gap-3 mb-6">
            <FiLock
              size={24}
              className="text-red-500"
            />

            <h2 className="text-2xl font-bold text-slate-950">
              Security Settings
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <input
              type="password"
              placeholder="New Password"
              className="border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold"
            />

          </div>

        </div>

        {/* NOTIFICATIONS */}
        <div className="bg-white rounded-3xl shadow p-8 mb-8">

          <div className="flex items-center gap-3 mb-6">
            <FiBell
              size={24}
              className="text-blue-600"
            />

            <h2 className="text-2xl font-bold text-slate-950">
              Notification Settings
            </h2>
          </div>

          <div className="space-y-5">

            <div className="flex justify-between items-center">

              <span className="text-slate-950 font-semibold">
                Email Notifications
              </span>

              <input
                type="checkbox"
                checked={emailNotif}
                onChange={() =>
                  setEmailNotif(!emailNotif)
                }
                className="w-5 h-5"
              />
            </div>

            <div className="flex justify-between items-center">

              <span className="text-slate-950 font-semibold">
                Push Notifications
              </span>

              <input
                type="checkbox"
                checked={pushNotif}
                onChange={() =>
                  setPushNotif(!pushNotif)
                }
                className="w-5 h-5"
              />
            </div>

            <div className="flex justify-between items-center">

              <span className="text-slate-950 font-semibold">
                Report Alerts
              </span>

              <input
                type="checkbox"
                checked={reportNotif}
                onChange={() =>
                  setReportNotif(!reportNotif)
                }
                className="w-5 h-5"
              />
            </div>

          </div>

        </div>

        {/* CAMPUS SETTINGS */}
        <div className="bg-white rounded-3xl shadow p-8 mb-8">

          <div className="flex items-center gap-3 mb-6">
            <FiSettings
              size={24}
              className="text-purple-600"
            />

            <h2 className="text-2xl font-bold text-slate-950">
              Campus Settings
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block text-slate-900 font-bold mb-2">
                Campus Name
              </label>

              <input
                type="text"
                value={campusName}
                onChange={(e) =>
                  setCampusName(e.target.value)
                }
                className="w-full border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-900 font-bold mb-2">
                Default Eco Score
              </label>

              <input
                type="number"
                value={ecoScore}
                onChange={(e) =>
                  setEcoScore(e.target.value)
                }
                className="w-full border border-slate-300 rounded-xl p-4 text-slate-950 font-semibold"
              />
            </div>

          </div>

        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">

          <button
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl flex items-center gap-2 font-bold shadow"
          >
            <FiSave />
            Save Settings
          </button>

        </div>

    </AdminLayout>
  );
}