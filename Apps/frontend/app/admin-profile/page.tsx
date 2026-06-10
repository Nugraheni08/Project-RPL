"use client";

import { useState } from "react";
import AdminSidebar from "@/components/adminsidebar";
import { FiUser, FiMail, FiPhone, FiShield } from "react-icons/fi";

export default function AdminProfilePage() {
  var [profileImage, setProfileImage] = useState<string | null>(null);

  return (
    <main className="flex h-screen w-full bg-slate-100 overflow-hidden">
      <AdminSidebar />

      <section className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <div className="p-8 flex-1 overflow-y-auto">
          <h1 className="text-4xl font-extrabold text-slate-950 mb-8">
            Admin Profile
          </h1>

          <div className="bg-white rounded-3xl shadow p-8 max-w-3xl">
            <div className="flex items-center gap-6 mb-8">
              <div className="relative flex-shrink-0">
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
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full cursor-pointer shadow-lg text-sm"
                >
                  📷
                </label>

                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={function (e) {
                    var file = e.target.files?.[0];
                    if (file) {
                      setProfileImage(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-slate-950">
                  Admin WMap
                </h2>
                <p className="text-slate-700 font-medium">
                  System Administrator
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-2xl p-5 hover:border-green-300 transition-colors">
                <FiUser className="mb-2 text-green-600" size={24} />
                <h3 className="font-bold text-slate-950">Full Name</h3>
                <p className="text-slate-800">Admin WMap</p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-colors">
                <FiMail className="mb-2 text-blue-600" size={24} />
                <h3 className="font-bold text-slate-950">Email</h3>
                <p className="text-slate-800">admin@wmap.com</p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 hover:border-purple-300 transition-colors">
                <FiPhone className="mb-2 text-purple-600" size={24} />
                <h3 className="font-bold text-slate-950">Phone</h3>
                <p className="text-slate-800">081234567890</p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 hover:border-red-300 transition-colors">
                <FiShield className="mb-2 text-red-600" size={24} />
                <h3 className="font-bold text-slate-950">Role</h3>
                <p className="text-slate-800">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}