"use client";

import { useState } from "react";

import AdminSidebar from "@/components/adminsidebar";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
} from "react-icons/fi";

export default function AdminProfilePage() {
    const [profileImage, setProfileImage] =
  useState<string | null>(null);
  return (
    <main className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <section className="ml-64 p-8">

        <h1 className="text-4xl font-extrabold text-slate-950 mb-8">
          Admin Profile
        </h1>

        <div className="bg-white rounded-3xl shadow p-8">

          <div className="flex items-center gap-6 mb-8">

<div className="relative">

  <div className="w-28 h-28 rounded-full overflow-hidden">

    {profileImage ? (
      <img
        src={profileImage}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-green-600 flex items-center justify-center text-white text-5xl font-bold">
        A
      </div>
    )}

  </div>

  <label
    htmlFor="profileImage"
    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full cursor-pointer shadow-lg"
  >
    📷
  </label>

  <input
    id="profileImage"
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
        setProfileImage(
          URL.createObjectURL(file)
        );
      }
    }}
  />

</div>

            <div>
              <h2 className="text-3xl font-bold text-slate-950">
                Admin WMap
              </h2>

              <p className="text-slate-700">
                System Administrator
              </p>
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="border rounded-2xl p-5">
              <FiUser className="mb-2 text-green-600" />

              <h3 className="font-bold text-slate-950">
                Full Name
              </h3>

              <p className="text-slate-800">
                Admin WMap
              </p>
            </div>

            <div className="border rounded-2xl p-5">
              <FiMail className="mb-2 text-blue-600" />

              <h3 className="font-bold text-slate-950">
                Email
              </h3>

              <p className="text-slate-800">
                admin@wmap.com
              </p>
            </div>

            <div className="border rounded-2xl p-5">
              <FiPhone className="mb-2 text-purple-600" />

              <h3 className="font-bold text-slate-950">
                Phone
              </h3>

              <p className="text-slate-800">
                081234567890
              </p>
            </div>

            <div className="border rounded-2xl p-5">
              <FiShield className="mb-2 text-red-600" />

              <h3 className="font-bold text-slate-950">
                Role
              </h3>

              <p className="text-slate-800">
                Super Admin
              </p>
            </div>

          </div>

        </div>

      </section>
    </main>
  );
}