"use client";

import { useState } from "react";
import AdminSidebar from "@/components/adminsidebar";
import {
  FiUsers,
  FiUserCheck,
  FiShield,
  FiSearch,
  FiEye,
  FiTrash2,
} from "react-icons/fi";

interface User {
  id: number;
  name: string;
  email: string;
  nim: string;
  role: string;
  status: string;
  joinDate: string;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Nabil",
      email: "nabil@wmap.com",
      nim: "2217051001",
      role: "User",
      status: "Active",
      joinDate: "12 Mei 2026",
    },
    {
      id: 2,
      name: "Faisal",
      email: "faisal@wmap.com",
      nim: "2217051002",
      role: "User",
      status: "Active",
      joinDate: "10 Mei 2026",
    },
    {
      id: 3,
      name: "Admin Utama",
      email: "admin@wmap.com",
      nim: "-",
      role: "Admin",
      status: "Active",
      joinDate: "01 Januari 2026",
    },
  ]);

  const filteredUsers = users.filter(
    (user) =>
      user.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.nim.includes(search)
  );

  const deleteUser = (id: number) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <section className="ml-64 p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-950">
            User Management
          </h1>

          <p className="text-slate-800 mt-2 text-lg">
            Manage users and administrators
          </p>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-3xl p-6 shadow">
            <FiUsers
              size={32}
              className="text-blue-600 mb-3"
            />

            <p className="text-slate-800 font-semibold">
              Total Users
            </p>

            <h2 className="text-4xl font-bold text-slate-950 mt-2">
              {users.length}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow">
            <FiUserCheck
              size={32}
              className="text-green-600 mb-3"
            />

            <p className="text-slate-800 font-semibold">
              Active Users
            </p>

            <h2 className="text-4xl font-bold text-slate-950 mt-2">
              {
                users.filter(
                  (u) => u.status === "Active"
                ).length
              }
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow">
            <FiShield
              size={32}
              className="text-purple-600 mb-3"
            />

            <p className="text-slate-800 font-semibold">
              Admins
            </p>

            <h2 className="text-4xl font-bold text-slate-950 mt-2">
              {
                users.filter(
                  (u) => u.role === "Admin"
                ).length
              }
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow">
            <FiUsers
              size={32}
              className="text-orange-600 mb-3"
            />

            <p className="text-slate-800 font-semibold">
              New Users
            </p>

            <h2 className="text-4xl font-bold text-slate-950 mt-2">
              24
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
              placeholder="Search user..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-12 py-4 border border-slate-300 rounded-xl text-slate-950 font-semibold"
            />

          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-slate-200">
              <tr>
                <th className="p-5 text-left">Name</th>
                <th className="p-5 text-left">Email</th>
                <th className="p-5 text-left">NIM</th>
                <th className="p-5 text-left">Role</th>
                <th className="p-5 text-left">Status</th>
                <th className="p-5 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="p-5 font-bold text-slate-950">
                    {user.name}
                  </td>

                  <td className="p-5 text-slate-900">
                    {user.email}
                  </td>

                  <td className="p-5 text-slate-900">
                    {user.nim}
                  </td>

                  <td className="p-5">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold">
                      {user.role}
                    </span>
                  </td>

                  <td className="p-5">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold">
                      {user.status}
                    </span>
                  </td>

                  <td className="p-5">
                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl"
                      >
                        <FiEye />
                      </button>

                      <button
                        onClick={() =>
                          deleteUser(user.id)
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
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

            <div className="bg-white rounded-3xl p-8 w-[550px]">

              <h2 className="text-3xl font-bold text-slate-950 mb-6">
                User Detail
              </h2>

              <div className="space-y-4 text-slate-900">

                <p><strong>Name:</strong> {selectedUser.name}</p>

                <p><strong>Email:</strong> {selectedUser.email}</p>

                <p><strong>NIM:</strong> {selectedUser.nim}</p>

                <p><strong>Role:</strong> {selectedUser.role}</p>

                <p><strong>Status:</strong> {selectedUser.status}</p>

                <p><strong>Join Date:</strong> {selectedUser.joinDate}</p>

              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-6 bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold"
              >
                Close
              </button>

            </div>

          </div>
        )}

      </section>
    </main>
  );
}