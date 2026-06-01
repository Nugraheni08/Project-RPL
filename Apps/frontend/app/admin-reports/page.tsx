"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { supabase } from "@/lib/supabase";
import { FiLoader } from "react-icons/fi";
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
  user_id: string;
  user_name?: string;
  facility_type: string;
  location_ref: string;
  description: string;
  status: string;
  created_at: string;
}

export default function AdminReportsPage() {
  var [reports, setReports] = useState<Report[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [error, setError] = useState<string | null>(null);
  var [search, setSearch] = useState("");
  var [statusFilter, setStatusFilter] = useState("All");
  var [selectedReport, setSelectedReport] = useState<Report | null>(null);
  var [showModal, setShowModal] = useState(false);
  var [updatingId, setUpdatingId] = useState<string | null>(null);

  var fetchReports = async function () {
    setIsLoading(true);
    setError(null);
    try {
      var res = await fetch("/api/admin/reports");
      var json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengambil data laporan.");

      if (json.reports) {
        setReports(json.reports);
      }
    } catch (err: unknown) {
      var message = err instanceof Error ? err.message : "Unknown error";
      setError("Gagal mengambil data laporan: " + message);
      console.error("Fetch reports error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(function () {
    fetchReports();
  }, []);

  var updateStatus = async function (id: string, newStatus: string) {
    setUpdatingId(id);
    try {
      var { error: updateError } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateError) throw updateError;

      // Refresh data setelah update
      await fetchReports();

      // Update selected report di modal jika terbuka
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
    } catch (err: unknown) {
      var message = err instanceof Error ? err.message : "Unknown error";
      console.error("Update status error:", err);
      setError("Gagal update status: " + message);
    } finally {
      setUpdatingId(null);
    }
  };

  var filteredReports = reports.filter(function (report) {
    var matchSearch =
      (report.user_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (report.facility_type || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (report.location_ref || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (report.description || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    var matchStatus =
      statusFilter === "All" || report.status === statusFilter;

    return matchSearch && matchStatus;
  });

  var totalReports = reports.length;
  var pendingReports = reports.filter(function (r) { return r.status === "PENDING"; }).length;
  var progressReports = reports.filter(function (r) { return r.status === "IN PROGRESS"; }).length;
  var resolvedReports = reports.filter(function (r) { return r.status === "RESOLVED"; }).length;

  var formatStatus = function (status: string) {
    if (status === "PENDING") return "Pending";
    if (status === "IN PROGRESS") return "In Progress";
    if (status === "RESOLVED") return "Resolved";
    return status;
  };

  var formatDate = function (dateStr: string) {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_e) {
      return dateStr;
    }
  };

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-950">
          Reports Management
        </h1>
        <p className="text-slate-800 text-lg mt-2 font-medium">
          Monitor and manage user reports
        </p>
      </div>

      {/* ERROR BANNER */}
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 flex items-center justify-between">
          <span className="font-semibold">{error}</span>
          <button
            onClick={function () { setError(null); }}
            className="text-red-500 hover:text-red-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      ) : null}

      {/* STATISTICS */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow">
          <FiFileText size={32} className="text-blue-600 mb-3" />
          <p className="text-slate-800 font-semibold">Total Reports</p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">
            {isLoading ? "..." : totalReports}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <FiAlertCircle size={32} className="text-red-600 mb-3" />
          <p className="text-slate-800 font-semibold">Pending</p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">
            {isLoading ? "..." : pendingReports}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <FiClock size={32} className="text-yellow-600 mb-3" />
          <p className="text-slate-800 font-semibold">In Progress</p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">
            {isLoading ? "..." : progressReports}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <FiCheckCircle size={32} className="text-green-600 mb-3" />
          <p className="text-slate-800 font-semibold">Resolved</p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">
            {isLoading ? "..." : resolvedReports}
          </h2>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-3xl shadow p-6 mb-6 flex gap-4">
        <div className="relative flex-1">
          <FiSearch
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
          />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={function (e) { setSearch(e.target.value); }}
            className="w-full pl-12 py-4 border border-slate-300 rounded-xl text-slate-950 font-semibold"
          />
        </div>

        <select
          value={statusFilter}
          onChange={function (e) { setStatusFilter(e.target.value); }}
          className="px-4 rounded-xl border border-slate-300 text-slate-950 font-semibold"
        >
          <option>All</option>
          <option>PENDING</option>
          <option>IN PROGRESS</option>
          <option>RESOLVED</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-slate-500 font-semibold flex items-center justify-center gap-3">
            <FiLoader className="animate-spin text-green-600" size={28} />
            <span>Loading reports...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-5 text-left text-slate-950 font-bold">No.</th>
                <th className="p-5 text-left text-slate-950 font-bold">User</th>
                <th className="p-5 text-left text-slate-950 font-bold">Category</th>
                <th className="p-5 text-left text-slate-950 font-bold">Location</th>
                <th className="p-5 text-left text-slate-950 font-bold">Date</th>
                <th className="p-5 text-left text-slate-950 font-bold">Status</th>
                <th className="p-5 text-center text-slate-950 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500 font-semibold">
                    No reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map(function (report, index) {
                  return (
                    <tr key={report.id} className="border-t hover:bg-slate-50">
                      <td className="p-5 font-bold text-slate-950">
                        {index + 1}
                      </td>
                      <td className="p-5 text-slate-900">
                        {report.user_name || "User"}
                      </td>
                      <td className="p-5 text-slate-900">
                        {report.facility_type}
                      </td>
                      <td className="p-5 text-slate-900">
                        {report.location_ref}
                      </td>
                      <td className="p-5 text-slate-900 text-sm">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="p-5">
                        <span
                          className={
                            "px-3 py-1 rounded-lg text-sm font-bold " +
                            (report.status === "PENDING"
                              ? "bg-red-100 text-red-700"
                              : report.status === "IN PROGRESS"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700")
                          }
                        >
                          {formatStatus(report.status)}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={function () {
                              setSelectedReport(report);
                              setShowModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl"
                            title="View Detail"
                          >
                            <FiEye />
                          </button>

                          <select
                            value={report.status}
                            disabled={updatingId === report.id}
                            onChange={function (e) {
                              updateStatus(report.id, e.target.value);
                            }}
                            className={
                              "border border-slate-300 rounded-xl px-2 py-1 text-xs font-bold cursor-pointer " +
                              (updatingId === report.id ? "opacity-50" : "")
                            }
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && selectedReport
        ? (function () {
            var report = selectedReport;
            return (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                <div className="bg-white w-[600px] rounded-3xl p-8">
                  <h2 className="text-3xl font-bold text-slate-950 mb-6">
                    Report Detail
                  </h2>

                  <div className="space-y-4 text-slate-900">
                    <p>
                      <strong>User:</strong> {report.user_name || "User"}
                    </p>
                    <p>
                      <strong>Category:</strong> {report.facility_type}
                    </p>
                    <p>
                      <strong>Location:</strong> {report.location_ref}
                    </p>
                    <p>
                      <strong>Date:</strong> {formatDate(report.created_at)}
                    </p>
                    <p>
                      <strong>Description:</strong> {report.description}
                    </p>

                    <div>
                      <strong>Status:</strong>
                      <select
                        value={report.status}
                        onChange={function (e) {
                          updateStatus(report.id, e.target.value);
                        }}
                        disabled={updatingId === report.id}
                        className="ml-2 border border-slate-300 p-2 rounded-xl font-semibold"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                      {updatingId === report.id ? (
                        <span className="ml-2 text-sm text-slate-500 animate-pulse">
                          Updating...
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={function () { setShowModal(false); }}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            );
          })()
        : null}
    </AdminLayout>
  );
}