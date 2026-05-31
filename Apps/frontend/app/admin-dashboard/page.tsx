"use client";

import { FiUser } from "react-icons/fi";
import Link from "next/link";
import AdminSidebar from "@/components/adminsidebar";
import {
  FiUsers,
  FiDroplet,
  FiTrash2,
  FiAlertTriangle,
  FiSearch,
  FiBell,
  FiSettings,
} from "react-icons/fi";

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <section className="ml-64 min-h-screen">
        {/* TOPBAR */}
        <header className="bg-white border-b border-slate-300 px-8 py-5 flex justify-between items-center sticky top-0 z-20">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Dashboard Overview
            </h1>

            <p className="text-slate-700 mt-1 text-lg">
              Green Campus Monitoring System
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <FiSearch
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search..."
                className="w-72 pl-12 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

<Link href="/admin-notifications">
  <div className="relative cursor-pointer">

    <FiBell
      size={24}
      className="text-slate-800 hover:text-green-600"
    />

    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
      3
    </span>

  </div>
</Link>

<Link href="/admin-profile">
  <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-3 py-2 rounded-xl">
    <FiUser
      size={22}
      className="text-slate-800"
    />

    <span className="font-semibold text-slate-900">
      Admin
    </span>
  </div>
</Link>

            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-bold">
              Eco Score: 84/100
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* STAT CARD */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <FiUsers
                size={35}
                className="text-blue-600 mb-4"
              />

              <p className="text-slate-700 font-semibold">
                Total Users
              </p>

              <h2 className="text-5xl font-bold text-slate-900 mt-2">
                2.4K
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-md">
              <FiDroplet
                size={35}
                className="text-green-600 mb-4"
              />

              <p className="text-slate-700 font-semibold">
                Active Refill Stations
              </p>

              <h2 className="text-5xl font-bold text-slate-900 mt-2">
                47
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-md">
              <FiTrash2
                size={35}
                className="text-emerald-600 mb-4"
              />

              <p className="text-slate-700 font-semibold">
                Active Waste Bins
              </p>

              <h2 className="text-5xl font-bold text-slate-900 mt-2">
                132
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-md">
              <FiAlertTriangle
                size={35}
                className="text-red-500 mb-4"
              />

              <p className="text-slate-700 font-semibold">
                Reports Pending
              </p>

              <h2 className="text-5xl font-bold text-slate-900 mt-2">
                12
              </h2>
            </div>
          </div>

          {/* MAP + REPORT */}
          <div className="grid lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold text-slate-900">
                  Live Campus Map
                </h2>

                <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold">
                  Refresh
                </button>
              </div>

              <div className="h-[450px] rounded-2xl bg-slate-200 flex items-center justify-center">
                <p className="text-2xl font-bold text-slate-700">
                  Campus Map Preview
                </p>
              </div>
            </div>

            {/* REPORT */}
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-bold text-slate-900">
                  Recent Reports
                </h2>

                <button className="text-green-700 font-bold">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                <div className="border rounded-xl p-4">
                  <h3 className="font-bold text-slate-900">
                    Refill Station Rusak
                  </h3>

                  <p className="text-slate-600 mt-1">
                    FMIPA • 2 jam lalu
                  </p>

                  <span className="inline-block mt-3 bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold">
                    URGENT
                  </span>
                </div>

                <div className="border rounded-xl p-4">
                  <h3 className="font-bold text-slate-900">
                    Tempat Sampah Penuh
                  </h3>

                  <p className="text-slate-600 mt-1">
                    Engineering • 5 jam lalu
                  </p>

                  <span className="inline-block mt-3 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs font-bold">
                    MEDIUM
                  </span>
                </div>

                <div className="border rounded-xl p-4">
                  <h3 className="font-bold text-slate-900">
                    Lampu Rusak
                  </h3>

                  <p className="text-slate-600 mt-1">
                    Dormitory • 1 hari lalu
                  </p>

                  <span className="inline-block mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">
                    LOW
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FACILITY */}
          <div className="grid lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold text-slate-900">
                  Facility Management
                </h2>

                <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold">
                  + Add Facility
                </button>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-slate-800">
                      Facility
                    </th>

                    <th className="text-left text-slate-800">
                      Status
                    </th>

                    <th className="text-left text-slate-800">
                      Category
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b">
                    <td className="py-4 font-medium text-slate-900">
                      Refill Station A1
                    </td>

                    <td>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg">
                        Active
                      </span>
                    </td>

                    <td className="text-slate-700">
                      Refill
                    </td>
                  </tr>

                  <tr className="border-b">
                    <td className="py-4 font-medium text-slate-900">
                      Waste Bin B3
                    </td>

                    <td>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg">
                        Maintenance
                      </span>
                    </td>

                    <td className="text-slate-700">
                      Waste Bin
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 font-medium text-slate-900">
                      Refill Station C7
                    </td>

                    <td>
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg">
                        Offline
                      </span>
                    </td>

                    <td className="text-slate-700">
                      Refill
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* QUICK ACTION */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Quick Actions
                </h2>

                <div className="space-y-3">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold">
                    Add Facility
                  </button>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold">
                    Add Admin
                  </button>

                  <button className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-semibold">
                    Export Reports
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Recent Reviews
                </h2>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      Nabil
                    </h4>

                    <p className="text-slate-700">
                      Refill station sangat membantu.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      Faisal
                    </h4>

                    <p className="text-slate-700">
                      Tempat sampah perlu ditambah.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}