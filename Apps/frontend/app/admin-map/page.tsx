"use client";

import { useState } from "react";
import AdminSidebar from "@/components/adminsidebar";
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
} from "react-icons/fi";

interface Location {
  id: number;
  name: string;
  category: string;
  latitude: string;
  longitude: string;
  status: string;
}

export default function AdminMapPage() {
  const [search, setSearch] = useState("");

  const [locations, setLocations] = useState<Location[]>([
    {
      id: 1,
      name: "Refill Station FMIPA",
      category: "Water Refill",
      latitude: "-5.3612",
      longitude: "105.2423",
      status: "Active",
    },
    {
      id: 2,
      name: "Waste Bin Engineering",
      category: "Waste Bin",
      latitude: "-5.3601",
      longitude: "105.2411",
      status: "Active",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] =
    useState("Water Refill");

  const [latitude, setLatitude] =
    useState("");

  const [longitude, setLongitude] =
    useState("");

  const [status, setStatus] =
    useState("Active");

  const resetForm = () => {
    setName("");
    setCategory("Water Refill");
    setLatitude("");
    setLongitude("");
    setStatus("Active");

    setEditMode(false);
    setSelectedId(null);
  };

  const addLocation = () => {
    if (!name) return;

    const newLocation: Location = {
      id: Date.now(),
      name,
      category,
      latitude,
      longitude,
      status,
    };

    setLocations([
      ...locations,
      newLocation,
    ]);

    resetForm();
    setShowModal(false);
  };

  const deleteLocation = (id: number) => {
    setLocations(
      locations.filter(
        (location) => location.id !== id
      )
    );
  };

  const handleEdit = (
    location: Location
  ) => {
    setSelectedId(location.id);

    setName(location.name);
    setCategory(location.category);
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setStatus(location.status);

    setEditMode(true);
    setShowModal(true);
  };

  const saveEdit = () => {
    setLocations(
      locations.map((location) =>
        location.id === selectedId
          ? {
              ...location,
              name,
              category,
              latitude,
              longitude,
              status,
            }
          : location
      )
    );

    resetForm();
    setShowModal(false);
  };

  const filteredLocations =
    locations.filter((location) =>
      location.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <main className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <section className="ml-64 p-8">

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
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold"
          >
            <FiPlus />
            Add Location
          </button>

        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-3xl p-6 shadow">
            <h3 className="text-slate-800 font-semibold">
              Total Locations
            </h3>

            <h2 className="text-5xl font-bold text-slate-950 mt-2">
              {locations.length}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow">
            <h3 className="text-slate-800 font-semibold">
              Refill Stations
            </h3>

            <h2 className="text-5xl font-bold text-green-600 mt-2">
              {
                locations.filter(
                  (l) =>
                    l.category ===
                    "Water Refill"
                ).length
              }
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow">
            <h3 className="text-slate-800 font-semibold">
              Waste Bins
            </h3>

            <h2 className="text-5xl font-bold text-blue-600 mt-2">
              {
                locations.filter(
                  (l) =>
                    l.category ===
                    "Waste Bin"
                ).length
              }
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow">
            <h3 className="text-slate-800 font-semibold">
              Active
            </h3>

            <h2 className="text-5xl font-bold text-purple-600 mt-2">
              {
                locations.filter(
                  (l) =>
                    l.status === "Active"
                ).length
              }
            </h2>
          </div>

        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-3xl shadow p-6 mb-6">

          <div className="relative">

            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search location..."
              className="w-full pl-12 py-4 border border-slate-300 rounded-xl text-slate-950 font-semibold"
            />

          </div>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-200">
              <tr>
                <th className="p-5 text-left">
                  Facility
                </th>
                <th className="p-5 text-left">
                  Category
                </th>
                <th className="p-5 text-left">
                  Latitude
                </th>
                <th className="p-5 text-left">
                  Longitude
                </th>
                <th className="p-5 text-left">
                  Status
                </th>
                <th className="p-5 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {filteredLocations.map(
                (location) => (
                  <tr
                    key={location.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="p-5 font-bold text-slate-950">
                      {location.name}
                    </td>

                    <td className="p-5 text-slate-900">
                      {location.category}
                    </td>

                    <td className="p-5 text-slate-900">
                      {location.latitude}
                    </td>

                    <td className="p-5 text-slate-900">
                      {location.longitude}
                    </td>

                    <td className="p-5">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold">
                        {location.status}
                      </span>
                    </td>

                    <td className="p-5">
                      <div className="flex justify-center gap-3">

                        <button
                          onClick={() =>
                            handleEdit(
                              location
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl"
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          onClick={() =>
                            deleteLocation(
                              location.id
                            )
                          }
                          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl"
                        >
                          <FiTrash2 />
                        </button>

                      </div>
                    </td>
                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-white w-[500px] rounded-3xl p-8 shadow-2xl">

              <h2 className="text-3xl font-bold text-slate-950 mb-6">
                {editMode
                  ? "Edit Location"
                  : "Add Location"}
              </h2>

              <div className="space-y-4">

                <input
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Facility Name"
                  className="w-full border border-slate-300 p-4 rounded-xl text-slate-950"
                />

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 p-4 rounded-xl text-slate-950"
                >
                  <option>
                    Water Refill
                  </option>

                  <option>
                    Waste Bin
                  </option>
                </select>

                <input
                  value={latitude}
                  onChange={(e) =>
                    setLatitude(
                      e.target.value
                    )
                  }
                  placeholder="Latitude"
                  className="w-full border border-slate-300 p-4 rounded-xl text-slate-950"
                />

                <input
                  value={longitude}
                  onChange={(e) =>
                    setLongitude(
                      e.target.value
                    )
                  }
                  placeholder="Longitude"
                  className="w-full border border-slate-300 p-4 rounded-xl text-slate-950"
                />

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 p-4 rounded-xl text-slate-950"
                >
                  <option>
                    Active
                  </option>

                  <option>
                    Maintenance
                  </option>

                  <option>
                    Offline
                  </option>
                </select>

              </div>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={
                    editMode
                      ? saveEdit
                      : addLocation
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
                >
                  {editMode
                    ? "Update Location"
                    : "Save Location"}
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