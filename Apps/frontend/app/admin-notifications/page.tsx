"use client";

import AdminSidebar from "@/components/adminsidebar";
import {
  FiBell,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrash2,
  FiUserPlus,
} from "react-icons/fi";

export default function AdminNotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "Refill Station Rusak",
      description:
        "Refill Station FMIPA dilaporkan tidak berfungsi.",
      time: "5 menit lalu",
      type: "danger",
    },
    {
      id: 2,
      title: "Tempat Sampah Penuh",
      description:
        "Waste Bin Engineering mencapai kapasitas maksimum.",
      time: "30 menit lalu",
      type: "warning",
    },
    {
      id: 3,
      title: "Laporan Diselesaikan",
      description:
        "Laporan Library telah berhasil ditangani.",
      time: "1 jam lalu",
      type: "success",
    },
    {
      id: 4,
      title: "User Baru",
      description:
        "Mahasiswa baru berhasil melakukan registrasi.",
      time: "2 jam lalu",
      type: "info",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <section className="ml-64 p-8">

        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-950">
            Notifications
          </h1>

          <p className="text-slate-800 text-lg mt-2">
            Monitor all system activities and alerts
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow overflow-hidden">

          <div className="flex justify-between items-center px-8 py-6 border-b">

            <div className="flex items-center gap-3">

              <FiBell
                size={24}
                className="text-green-600"
              />

              <h2 className="text-2xl font-bold text-slate-950">
                Recent Notifications
              </h2>

            </div>

            <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-bold">
              Mark All Read
            </button>

          </div>

          <div className="divide-y">

            {notifications.map((item) => (
              <div
                key={item.id}
                className="p-6 hover:bg-slate-50 transition"
              >

                <div className="flex justify-between items-start">

                  <div className="flex gap-4">

                    <div>

                      {item.type === "danger" && (
                        <FiAlertTriangle
                          size={24}
                          className="text-red-600"
                        />
                      )}

                      {item.type === "warning" && (
                        <FiTrash2
                          size={24}
                          className="text-yellow-600"
                        />
                      )}

                      {item.type === "success" && (
                        <FiCheckCircle
                          size={24}
                          className="text-green-600"
                        />
                      )}

                      {item.type === "info" && (
                        <FiUserPlus
                          size={24}
                          className="text-blue-600"
                        />
                      )}

                    </div>

                    <div>

                      <h3 className="font-bold text-slate-950 text-lg">
                        {item.title}
                      </h3>

                      <p className="text-slate-800 mt-1">
                        {item.description}
                      </p>

                    </div>

                  </div>

                  <span className="text-slate-600 text-sm font-medium">
                    {item.time}
                  </span>

                </div>

              </div>
            ))}

          </div>

        </div>

      </section>
    </main>
  );
}