"use client";

import { useState } from "react";
import AdminSidebar from "@/components/adminsidebar";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiDroplet,
} from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

interface Facility {
  id: number;
  name: string;
  category: string;
  location: string;
  status: string;
}

export default function AdminFacilityPage() {
  const [search, setSearch] = useState("");

  const [facilities, setFacilities] = useState<Facility[]>([
    {
      id: 1,
      name: "Refill Station A1",
      category: "Water Refill",
      location: "FMIPA",
      status: "Active",
    },
    {
      id: 2,
      name: "Waste Bin B3",
      category: "Waste Bin",
      location: "Engineering",
      status: "Maintenance",
    },
    {
      id: 3,
      name: "Refill Station C7",
      category: "Water Refill",
      location: "Dormitory",
      status: "Offline",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

const [selectedId, setSelectedId] =
  useState<number | null>(null);

  const [facilityName, setFacilityName] = useState("");
  const [facilityCategory, setFacilityCategory] =
    useState("Water Refill");
  const [facilityLocation, setFacilityLocation] =
    useState("");
  const [facilityStatus, setFacilityStatus] =
    useState("Active");

  const addFacility = () => {
    if (!facilityName) return;

    const newFacility: Facility = {
      id: Date.now(),
      name: facilityName,
      category: facilityCategory,
      location: facilityLocation,
      status: facilityStatus,
    };

    setFacilities([...facilities, newFacility]);

resetForm();
setShowModal(false);
  };

  const deleteFacility = (id: number) => {
    setFacilities(
      facilities.filter((item) => item.id !== id)
    );
  };

  const handleEdit = (facility: Facility) => {
  setSelectedId(facility.id);

  setFacilityName(facility.name);

  setFacilityCategory(facility.category);

  setFacilityLocation(facility.location);

  setFacilityStatus(facility.status);

  setEditMode(true);

  setShowModal(true);
};

const saveEdit = () => {
  setFacilities(
    facilities.map((facility) =>
      facility.id === selectedId
        ? {
            ...facility,
            name: facilityName,
            category: facilityCategory,
            location: facilityLocation,
            status: facilityStatus,
          }
        : facility
    )
  );

resetForm();
setShowModal(false);
};

const resetForm = () => {
  setFacilityName("");
  setFacilityLocation("");
  setFacilityCategory("Water Refill");
  setFacilityStatus("Active");

  setSelectedId(null);
  setEditMode(false);
};

  const filteredFacilities = facilities.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <section className="ml-64 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-950">
              Facility Management
            </h1>

            <p className="text-slate-800 text-lg mt-2 font-medium">
              Manage refill stations and waste bins
            </p>
          </div>

<button
  onClick={() => {
    resetForm();
    setShowModal(true);
  }}
  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow"
>
            <FiPlus />
            Add Facility
          </button>
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-3xl shadow p-6 mb-6">
          <div className="relative">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
              size={20}
            />

            <input
              type="text"
              placeholder="Search facility..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 py-4 border border-slate-300 rounded-xl text-slate-950 font-semibold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow overflow-hidden">

          <div className="px-6 py-5 border-b">
            <h2 className="text-2xl font-bold text-slate-950">
              Facility List
            </h2>
          </div>

          <table className="w-full">
            <thead className="bg-slate-200">
              <tr>
                <th className="text-left p-5 text-slate-950 font-bold">
                  Facility
                </th>

                <th className="text-left p-5 text-slate-950 font-bold">
                  Category
                </th>

                <th className="text-left p-5 text-slate-950 font-bold">
                  Location
                </th>

                <th className="text-left p-5 text-slate-950 font-bold">
                  Status
                </th>

                <th className="text-center p-5 text-slate-950 font-bold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredFacilities.map((facility) => (
                <tr
                  key={facility.id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="p-5 font-bold text-slate-950">
                    {facility.name}
                  </td>

                  <td className="p-5 text-slate-900 font-medium">
                    <div className="flex items-center gap-2">

                      {facility.category ===
                      "Water Refill" ? (
                        <FiDroplet className="text-blue-600" />
                      ) : (
                        <FaTrash className="text-green-600" />
                      )}

                      {facility.category}
                    </div>
                  </td>

                  <td className="p-5 text-slate-900 font-medium">
                    {facility.location}
                  </td>

                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        facility.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : facility.status ===
                            "Maintenance"
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
  onClick={() => handleEdit(facility)}
  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl"
>
  <FiEdit2 />
</button>

                      <button
                        onClick={() =>
                          deleteFacility(facility.id)
                        }
                        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

            <div className="bg-white rounded-3xl w-[500px] p-8 shadow-2xl">

<h2 className="text-3xl font-extrabold text-slate-950 mb-6">
  {editMode
    ? "Edit Facility"
    : "Add New Facility"}
</h2>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="Facility Name"
                  value={facilityName}
                  onChange={(e) =>
                    setFacilityName(e.target.value)
                  }
                  className="w-full border border-slate-300 p-4 rounded-xl text-slate-950 font-semibold placeholder:text-slate-600"
                />

                <input
                  type="text"
                  placeholder="Location"
                  value={facilityLocation}
                  onChange={(e) =>
                    setFacilityLocation(e.target.value)
                  }
                  className="w-full border border-slate-300 p-4 rounded-xl text-slate-950 font-semibold placeholder:text-slate-600"
                />

                <select
                  value={facilityCategory}
                  onChange={(e) =>
                    setFacilityCategory(e.target.value)
                  }
                  className="w-full border border-slate-300 p-4 rounded-xl text-slate-950 font-semibold"
                >
                  <option>Water Refill</option>
                  <option>Waste Bin</option>
                </select>

                <select
                  value={facilityStatus}
                  onChange={(e) =>
                    setFacilityStatus(e.target.value)
                  }
                  className="w-full border border-slate-300 p-4 rounded-xl text-slate-950 font-semibold"
                >
                  <option>Active</option>
                  <option>Maintenance</option>
                  <option>Offline</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
<button
  onClick={
    editMode
      ? saveEdit
      : addFacility
  }
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
                >
                  {editMode
  ? "Update Facility"
  : "Save Facility"}
                </button>

                <button
onClick={() => {
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
        )}
      </section>
    </main>
  );
}
