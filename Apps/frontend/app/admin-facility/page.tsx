"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { showToast } from "@/components/ui/Toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiDroplet,
  FiLoader,
} from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

interface Facility {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
}

export default function AdminFacilityPage() {
  var [facilities, setFacilities] = useState<Facility[]>([]);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState<string | null>(null);
  var [search, setSearch] = useState("");

  // Add/Edit modal state
  var [showModal, setShowModal] = useState(false);
  var [editMode, setEditMode] = useState(false);
  var [selectedId, setSelectedId] = useState<string | null>(null);
  var [saving, setSaving] = useState(false);

  var [facilityName, setFacilityName] = useState("");
  var [facilityCategory, setFacilityCategory] = useState("Water Refill");
  var [facilityLocation, setFacilityLocation] = useState("");
  var [facilityStatus, setFacilityStatus] = useState("Active");

  // Delete confirmation
  var [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);
  var [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  var [deleting, setDeleting] = useState(false);

  // ── Fetch from API ─────────────────────────────────────────────
  var fetchFacilities = async function () {
    setLoading(true);
    setError(null);
    try {
      var res = await fetch("/api/admin/facilities");
      var json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat data.");
      setFacilities(json.facilities || []);
    } catch (err: unknown) {
      var msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    fetchFacilities();
  }, []);

  // ── Form Reset ─────────────────────────────────────────────────
  var resetForm = function () {
    setFacilityName("");
    setFacilityCategory("Water Refill");
    setFacilityLocation("");
    setFacilityStatus("Active");
    setEditMode(false);
    setSelectedId(null);
  };

  // ── Add / Edit Save ────────────────────────────────────────────
  var handleSave = async function () {
    if (!facilityName.trim()) return;
    setSaving(true);
    try {
      if (editMode && selectedId) {
        var res = await fetch("/api/admin/facilities", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedId,
            name: facilityName.trim(),
            category: facilityCategory,
            location: facilityLocation.trim(),
            status: facilityStatus,
          }),
        });
        var json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal update.");
        showToast(json.message || "Fasilitas diupdate.", "✅");
      } else {
        var createRes = await fetch("/api/admin/facilities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: facilityName.trim(),
            category: facilityCategory,
            location: facilityLocation.trim(),
            status: facilityStatus,
          }),
        });
        var createJson = await createRes.json();
        if (!createRes.ok) throw new Error(createJson.error || "Gagal menambah.");
        showToast(createJson.message || "Fasilitas ditambahkan.", "✅");
      }
      await fetchFacilities();
      resetForm();
      setShowModal(false);
    } catch (err: unknown) {
      var msg = err instanceof Error ? err.message : "Unknown error";
      showToast(msg, "❌");
    } finally {
      setSaving(false);
    }
  };

  // ── Edit Click ─────────────────────────────────────────────────
  var handleEdit = function (facility: Facility) {
    setSelectedId(facility.id);
    setFacilityName(facility.name);
    setFacilityCategory(facility.category);
    setFacilityLocation(facility.location);
    setFacilityStatus(facility.status);
    setEditMode(true);
    setShowModal(true);
  };

  // ── Delete Click → Open Confirmation ───────────────────────────
  var handleDeleteClick = function (facility: Facility) {
    setDeleteTarget(facility);
    setShowDeleteConfirm(true);
  };

  // ── Confirm Delete ─────────────────────────────────────────────
  var confirmDelete = async function () {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      var res = await fetch("/api/admin/facilities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      var json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal hapus.");
      showToast(json.message || "Fasilitas dihapus.", "✅");
      var targetId = deleteTarget.id;
      setFacilities(function (prev) { return prev.filter(function (f) { return f.id !== targetId; }); });
    } catch (err: unknown) {
      var msg = err instanceof Error ? err.message : "Unknown error";
      showToast(msg, "❌");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  // ── Search filter ──────────────────────────────────────────────
  var filteredFacilities = facilities.filter(function (f) {
    var q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q);
  });

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-950">Facility Management</h1>
          <p className="text-slate-800 text-lg mt-2 font-medium">
            Manage refill stations and waste bins
          </p>
        </div>

        <button
          onClick={function () { resetForm(); setShowModal(true); }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow transition"
        >
          <FiPlus />
          Add Facility
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 flex items-center justify-between">
          <span className="font-semibold">{error}</span>
          <button onClick={function () { setError(null); }} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
        </div>
      )}

      {/* SEARCH */}
      <div className="bg-white rounded-3xl shadow p-6 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
          <input
            type="text"
            placeholder="Search facility..."
            value={search}
            onChange={function (e) { setSearch(e.target.value); }}
            className="w-full pl-12 py-4 border border-slate-300 rounded-xl text-slate-950 font-semibold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-2xl font-bold text-slate-950">Facility List</h2>
        </div>

        {loading ? (
          <div className="p-20 text-center text-slate-500 font-semibold flex items-center justify-center gap-3">
            <FiLoader className="animate-spin text-green-600" size={24} />
            <span>Loading facilities...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-200">
              <tr>
                <th className="text-left p-5 text-slate-950 font-bold">Facility</th>
                <th className="text-left p-5 text-slate-950 font-bold">Category</th>
                <th className="text-left p-5 text-slate-950 font-bold">Location</th>
                <th className="text-left p-5 text-slate-950 font-bold">Status</th>
                <th className="text-center p-5 text-slate-950 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacilities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500 font-semibold">
                    No facilities found.
                  </td>
                </tr>
              ) : (
                filteredFacilities.map(function (facility) {
                  return (
                    <tr key={facility.id} className="border-t hover:bg-slate-50 transition">
                      <td className="p-5 font-bold text-slate-950">{facility.name}</td>
                      <td className="p-5 text-slate-900 font-medium">
                        <div className="flex items-center gap-2">
                          {facility.category === "Water Refill" ? (
                            <FiDroplet className="text-blue-600" />
                          ) : (
                            <FaTrash className="text-green-600" />
                          )}
                          {facility.category}
                        </div>
                      </td>
                      <td className="p-5 text-slate-900 font-medium">{facility.location}</td>
                      <td className="p-5">
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-bold ${
                            facility.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : facility.status === "Maintenance"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {facility.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={function () { handleEdit(facility); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={function () { handleDeleteClick(facility); }}
                            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition"
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
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

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl w-[500px] max-w-[95vw] p-8 shadow-2xl">
            <h2 className="text-3xl font-extrabold text-slate-950 mb-6">
              {editMode ? "Edit Facility" : "Add New Facility"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Facility Name"
                value={facilityName}
                onChange={function (e) { setFacilityName(e.target.value); }}
                className="w-full border border-slate-300 p-4 rounded-xl text-slate-950 font-semibold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="text"
                placeholder="Location"
                value={facilityLocation}
                onChange={function (e) { setFacilityLocation(e.target.value); }}
                className="w-full border border-slate-300 p-4 rounded-xl text-slate-950 font-semibold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <select
                value={facilityCategory}
                onChange={function (e) { setFacilityCategory(e.target.value); }}
                className="w-full border border-slate-300 p-4 rounded-xl text-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Water Refill</option>
                <option>Waste Bin</option>
              </select>

              <select
                value={facilityStatus}
                onChange={function (e) { setFacilityStatus(e.target.value); }}
                className="w-full border border-slate-300 p-4 rounded-xl text-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Active</option>
                <option>Maintenance</option>
                <option>Offline</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving || !facilityName.trim()}
                className={`flex-1 text-white py-3 rounded-xl font-bold transition ${
                  saving || !facilityName.trim()
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {saving ? "Saving..." : editMode ? "Update Facility" : "Save Facility"}
              </button>

              <button
                onClick={function () { resetForm(); setShowModal(false); }}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-950 py-3 rounded-xl font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl p-8 w-[450px] max-w-[95vw] shadow-2xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Hapus Fasilitas</h2>
            <p className="text-slate-800 mb-2">Apakah Anda yakin ingin menghapus fasilitas berikut?</p>
            <div className="bg-slate-100 rounded-xl p-4 mb-6">
              <p className="font-bold text-slate-950">{deleteTarget.name}</p>
              <p className="text-slate-600 text-sm">{deleteTarget.category} — {deleteTarget.location}</p>
            </div>
            <p className="text-red-600 text-sm font-semibold mb-6">
              ⚠️ Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-4">
              <button
                onClick={function () { setShowDeleteConfirm(false); setDeleteTarget(null); }}
                disabled={deleting}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 py-3 rounded-xl font-bold transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
              >
                {deleting ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <FiTrash2 />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}