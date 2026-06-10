"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { supabase } from "@/lib/supabase";
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
} from "react-icons/fi";

interface Facility {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  status: string;
  address?: string;
}

export default function AdminMapPage() {
  var [facilities, setFacilities] = useState<Facility[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [error, setError] = useState<string | null>(null);
  var [search, setSearch] = useState("");

  var [showModal, setShowModal] = useState(false);
  var [editMode, setEditMode] = useState(false);
  var [selectedId, setSelectedId] = useState<string | null>(null);
  var [saving, setSaving] = useState(false);

  var [name, setName] = useState("");
  var [category, setCategory] = useState("Water Refill");
  var [latitude, setLatitude] = useState("");
  var [longitude, setLongitude] = useState("");
  var [status, setStatusForm] = useState("Active");

  var fetchFacilities = async function () {
    setIsLoading(true);
    setError(null);
    try {
      var res = await fetch("/api/admin/facilities");
      var json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengambil data fasilitas.");

      if (json.facilities) {
        setFacilities(json.facilities);
      }
    } catch (err: unknown) {
      var message = err instanceof Error ? err.message : "Unknown error";
      setError("Gagal mengambil data fasilitas: " + message);
      console.error("Fetch facilities error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(function () {
    fetchFacilities();
  }, []);

  var resetForm = function () {
    setName("");
    setCategory("Water Refill");
    setLatitude("");
    setLongitude("");
    setStatusForm("Active");
    setEditMode(false);
    setSelectedId(null);
  };

  var handleSave = async function () {
    if (!name.trim()) return;

    setSaving(true);
    try {
      var payload: Record<string, unknown> = {
        name: name.trim(),
        category: category,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        status: status,
      };

      var res: Response;
      if (editMode && selectedId) {
        payload.id = selectedId;
        res = await fetch("/api/admin/facilities", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/facilities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      var json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan fasilitas.");

      await fetchFacilities();
      resetForm();
      setShowModal(false);
    } catch (err: unknown) {
      var message = err instanceof Error ? err.message : "Unknown error";
      setError("Gagal menyimpan fasilitas: " + message);
      console.error("Save facility error:", err);
    } finally {
      setSaving(false);
    }
  };

  var deleteFacility = async function (id: string) {
    if (!confirm("Are you sure you want to delete this facility?")) return;

    try {
      var res = await fetch("/api/admin/facilities?id=" + encodeURIComponent(id), {
        method: "DELETE",
      });
      var json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus fasilitas.");

      // Optimistic UI — instantly remove from local state
      setFacilities(function (prev) { return prev.filter(function (f) { return f.id !== id; }); });
    } catch (err: unknown) {
      var message = err instanceof Error ? err.message : "Unknown error";
      setError("Gagal menghapus fasilitas: " + message);
      console.error("Delete facility error:", err);
    }
  };

  var handleEdit = function (facility: Facility) {
    setSelectedId(facility.id);
    setName(facility.name);
    setCategory(facility.category);
    setLatitude(String(facility.latitude || ""));
    setLongitude(String(facility.longitude || ""));
    setStatusForm(facility.status);
    setEditMode(true);
    setShowModal(true);
  };

  var filteredFacilities = facilities.filter(function (f) {
    return (
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Dynamic summary counts
  var totalLocations = facilities.length;
  var refillStations = facilities.filter(function (f) {
    return f.category && f.category.toLowerCase().includes("refill");
  }).length;
  var wasteBins = facilities.filter(function (f) {
    return f.category && f.category.toLowerCase().includes("waste");
  }).length;
  var activeCount = facilities.filter(function (f) {
    return f.status && f.status.toLowerCase() === "active";
  }).length;

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-950">
            Campus Map Management
          </h1>
          <p className="text-slate-800 mt-2 text-lg">
            Manage campus facility locations
          </p>
        </div>

        <button
          onClick={function () {
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow"
        >
          <FiPlus />
          Add Location
        </button>
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

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow">
          <h3 className="text-slate-800 font-semibold">Total Locations</h3>
          <h2 className="text-5xl font-bold text-slate-950 mt-2">
            {isLoading ? "..." : totalLocations}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <h3 className="text-slate-800 font-semibold">Refill Stations</h3>
          <h2 className="text-5xl font-bold text-green-600 mt-2">
            {isLoading ? "..." : refillStations}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <h3 className="text-slate-800 font-semibold">Waste Bins</h3>
          <h2 className="text-5xl font-bold text-blue-600 mt-2">
            {isLoading ? "..." : wasteBins}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <h3 className="text-slate-800 font-semibold">Active</h3>
          <h2 className="text-5xl font-bold text-purple-600 mt-2">
            {isLoading ? "..." : activeCount}
          </h2>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-3xl shadow p-6 mb-6">
        <div className="relative">
          <FiSearch
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
          />
          <input
            type="text"
            value={search}
            onChange={function (e) { setSearch(e.target.value); }}
            placeholder="Search location..."
            className="w-full pl-12 py-4 border border-slate-300 rounded-xl text-slate-950 font-semibold"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center text-slate-500 font-semibold">
            <div className="animate-pulse">Loading facilities...</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-5 text-left text-slate-950 font-bold">Facility</th>
                <th className="p-5 text-left text-slate-950 font-bold">Category</th>
                <th className="p-5 text-left text-slate-950 font-bold">Latitude</th>
                <th className="p-5 text-left text-slate-950 font-bold">Longitude</th>
                <th className="p-5 text-left text-slate-950 font-bold">Status</th>
                <th className="p-5 text-center text-slate-950 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacilities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500 font-semibold">
                    No facilities found.
                  </td>
                </tr>
              ) : (
                filteredFacilities.map(function (facility) {
                  return (
                    <tr key={facility.id} className="border-t hover:bg-slate-50">
                      <td className="p-5 font-bold text-slate-950">
                        {facility.name}
                      </td>
                      <td className="p-5 text-slate-900">
                        {facility.category}
                      </td>
                      <td className="p-5 text-slate-900">
                        {facility.latitude}
                      </td>
                      <td className="p-5 text-slate-900">
                        {facility.longitude}
                      </td>
                      <td className="p-5">
                        <span
                          className={
                            "px-3 py-1 rounded-lg font-bold text-sm " +
                            (facility.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : facility.status === "Maintenance"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700")
                          }
                        >
                          {facility.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={function () { handleEdit(facility); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={function () { deleteFacility(facility.id); }}
                            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl"
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

      {/* MODAL */}
      {showModal ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-slate-950 mb-6">
              {editMode ? "Edit Location" : "Add Location"}
            </h2>

            <div className="space-y-4">
              <input
                value={name}
                onChange={function (e) { setName(e.target.value); }}
                placeholder="Facility Name"
                className="w-full border border-slate-300 p-4 rounded-xl text-slate-950"
              />

              <select
                value={category}
                onChange={function (e) { setCategory(e.target.value); }}
                className="w-full border border-slate-300 p-4 rounded-xl text-slate-950"
              >
                <option>Water Refill</option>
                <option>Waste Bin</option>
              </select>

              <input
                value={latitude}
                onChange={function (e) { setLatitude(e.target.value); }}
                placeholder="Latitude (e.g. -5.3612)"
                className="w-full border border-slate-300 p-4 rounded-xl text-slate-950"
              />

              <input
                value={longitude}
                onChange={function (e) { setLongitude(e.target.value); }}
                placeholder="Longitude (e.g. 105.2423)"
                className="w-full border border-slate-300 p-4 rounded-xl text-slate-950"
              />

              <select
                value={status}
                onChange={function (e) { setStatusForm(e.target.value); }}
                className="w-full border border-slate-300 p-4 rounded-xl text-slate-950"
              >
                <option>Active</option>
                <option>Maintenance</option>
                <option>Offline</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className={
                  "flex-1 text-white py-3 rounded-xl font-bold " +
                  (saving || !name.trim()
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700")
                }
              >
                {saving
                  ? "Saving..."
                  : editMode
                  ? "Update Location"
                  : "Save Location"}
              </button>

              <button
                onClick={function () {
                  resetForm();
                  setShowModal(false);
                }}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-950 py-3 rounded-xl font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}