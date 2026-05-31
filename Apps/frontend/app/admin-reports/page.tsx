"use client";

import { useState } from "react";
import AdminSidebar from "@/components/adminsidebar";
import {
  FiSearch,
  FiEye,
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

interface Report {
  id: string;
  user: string;
  category: string;
  location: string;
  date: string;
  status: string;
  description: string;
}

export default function AdminReportsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [reports, setReports] = useState<Report[]>([
    {
      id: "RPT-001",
      user: "Nabil",
      category: "Refill Station Rusak",
      location: "FMIPA",
      date: "31 Mei 2026",
      status: "Pending",
      description:
        "Mesin refill tidak mengeluarkan air.",
    },
    {
      id: "RPT-002",
      user: "Faisal",
      category: "Tempat Sampah Penuh",
      location: "Engineering",
      date: "30 Mei 2026",
      status: "In Progress",
      description:
        "Tempat sampah sudah penuh dan perlu dikosongkan.",
    },
    {
      id: "RPT-003",
      user: "Mirabel",
      category: "Refill Station Bocor",
      location: "Library",
      date: "29 Mei 2026",
      status: "Resolved",
      description:
        "Ada kebocoran kecil pada refill station.",
    },
  ]);

  const filteredReports = reports.filter((report) => {
    const matchSearch =
      report.user
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      report.category
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      report.location
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All" ||
      report.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const updateStatus = (
    id: string,
    newStatus: string
  ) => {
    setReports(
      reports.map((report) =>
        report.id === id
          ? { ...report, status: newStatus }
          : report
      )
    );
  };

  const totalReports = reports.length;

  const pendingReports = reports.filter(
    (r) => r.status === "Pending"
  ).length;

  const progressReports = reports.filter(
    (r) => r.status === "In Progress"
  ).length;

  const resolvedReports = reports.filter(
    (r) => r.status === "Resolved"
  ).length;

  return (
    <main className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <section className="ml-64 p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-950">
            Reports Management
          </h1>

          <p className="text-slate-800 text-lg mt-2 font-medium">
            Monitor and manage user reports
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white p-6 rounded-3xl shadow">
            <FiFileText
              size={32}
              className="text-blue-600 mb-3"
            />

            <p className="text-slate-800 font-semibold">
              Total Reports
            </p>

            <h2 className="text-4xl font-bold text-slate-950 mt-2">
              {totalReports}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow">
            <FiAlertCircle
              size={32}
              className="text-red-600 mb-3"
            />

            <p className="text-slate-800 font-semibold">
              Pending
            </p>

            <h2 className="text-4xl font-bold text-slate-950 mt-2">
              {pendingReports}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow">
            <FiClock
              size={32}
              className="text-yellow-600 mb-3"
            />

            <p className="text-slate-800 font-semibold">
              In Progress
            </p>

            <h2 className="text-4xl font-bold text-slate-950 mt-2">
              {progressReports}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow">
            <FiCheckCircle
              size={32}
              className="text-green-600 mb-3"
            />

            <p className="text-slate-800 font-semibold">
              Resolved
            </p>

            <h2 className="text-4xl font-bold text-slate-950 mt-2">
              {resolvedReports}
            </h2>
          </div>

        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white rounded-3xl shadow p-6 mb-6 flex gap-4">

          <div className="relative flex-1">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-12 py-4 border border-slate-300 rounded-xl text-slate-950 font-semibold"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="px-4 rounded-xl border border-slate-300 text-slate-950 font-semibold"
          >
            <option>All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-200">
              <tr>
                <th className="p-5 text-left">ID</th>
                <th className="p-5 text-left">User</th>
                <th className="p-5 text-left">Category</th>
                <th className="p-5 text-left">Location</th>
                <th className="p-5 text-left">Date</th>
                <th className="p-5 text-left">Status</th>
                <th className="p-5 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map((report) => (
                <tr
                  key={report.id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="p-5 font-bold text-slate-950">
                    {report.id}
                  </td>

                  <td className="p-5 text-slate-900">
                    {report.user}
                  </td>

                  <td className="p-5 text-slate-900">
                    {report.category}
                  </td>

                  <td className="p-5 text-slate-900">
                    {report.location}
                  </td>

                  <td className="p-5 text-slate-900">
                    {report.date}
                  </td>

                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        report.status === "Pending"
                          ? "bg-red-100 text-red-700"
                          : report.status ===
                            "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>

                  <td className="p-5">
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl"
                      >
                        <FiEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        {/* MODAL */}
        {showModal && selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

            <div className="bg-white w-[600px] rounded-3xl p-8">

              <h2 className="text-3xl font-bold text-slate-950 mb-6">
                Report Detail
              </h2>

              <div className="space-y-4 text-slate-900">

                <p>
                  <strong>ID:</strong>{" "}
                  {selectedReport.id}
                </p>

                <p>
                  <strong>User:</strong>{" "}
                  {selectedReport.user}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {selectedReport.category}
                </p>

                <p>
                  <strong>Location:</strong>{" "}
                  {selectedReport.location}
                </p>

                <p>
                  <strong>Description:</strong>{" "}
                  {selectedReport.description}
                </p>

                <select
                  value={selectedReport.status}
                  onChange={(e) => {
                    updateStatus(
                      selectedReport.id,
                      e.target.value
                    );

                    setSelectedReport({
                      ...selectedReport,
                      status: e.target.value,
                    });
                  }}
                  className="w-full border border-slate-300 p-4 rounded-xl font-semibold"
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>

              </div>

              <div className="mt-6">
                <button
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        )}
      </section>
    </main>
  );
}