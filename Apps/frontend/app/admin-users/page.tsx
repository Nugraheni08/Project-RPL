"use client";

import { useState, useEffect, useRef } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { showToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import {
  FiUsers,
  FiUserCheck,
  FiShield,
  FiSearch,
  FiEye,
  FiTrash2,
  FiLoader,
} from "react-icons/fi";

interface User {
  id: string;
  name: string;
  email: string;
  nim: string;
  role: string;
  status: string;
  joinDate: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Ref to hold latest fetch func for real-time subscriptions
  const fetchRef = useRef<() => Promise<void>>(async () => {});

  // ── Fetch users from secure admin API ─────────────────────
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat data pengguna.");

      setUsers(json.users || []);
    } catch (err: any) {
      console.error("FETCH_USERS_ERROR:", err);
      setError(err.message || "Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRef.current = fetchUsers;
    fetchUsers();
  }, []);

  // ── Supabase Realtime: auto-refresh on users table changes ──
  useEffect(() => {
    const channel = supabase
      .channel('admin-users-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          console.log('[Users] Table changed — re-fetching...');
          fetchRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Dynamic metric card calculations ───────────────────────
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const adminCount = users.filter((u) => u.role === "Admin").length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsers = users.filter((u) => {
    if (u.joinDate === "-") return false;
    const d = new Date(u.joinDate);
    return !isNaN(d.getTime()) && d >= thirtyDaysAgo;
  }).length;

  // ── Search filter ──────────────────────────────────────────
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.nim.includes(search)
  );

  // ── Open delete confirmation ───────────────────────────────
  const handleDeleteClick = (user: User) => {
    setDeleteTarget(user);
    setShowDeleteConfirm(true);
  };

  // ── Execute delete via secure admin API (service_role) ─────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        "/api/admin/users?id=" + encodeURIComponent(deleteTarget.id),
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghapus pengguna.");

      showToast(json.message || "Akun berhasil dihapus.", "✅");
      // Remove from local state immediately (real-time will also trigger a re-fetch)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    } catch (err: any) {
      console.error("DELETE_USER_ERROR:", err);
      showToast(err.message || "Gagal menghapus pengguna.", "❌");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-32">
          <FiLoader className="animate-spin text-green-600" size={36} />
          <span className="ml-3 text-slate-600 text-lg font-semibold">
            Memuat data pengguna...
          </span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="py-20 text-center">
          <p className="text-red-600 text-xl font-bold">⚠️ {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-950">User Management</h1>
        <p className="text-slate-800 mt-2 text-lg">Manage users and administrators</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow">
          <FiUsers size={32} className="text-blue-600 mb-3" />
          <p className="text-slate-800 font-semibold">Total Users</p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">{totalUsers}</h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <FiUserCheck size={32} className="text-green-600 mb-3" />
          <p className="text-slate-800 font-semibold">Active Users</p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">{activeUsers}</h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <FiShield size={32} className="text-purple-600 mb-3" />
          <p className="text-slate-800 font-semibold">Admins</p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">{adminCount}</h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <FiUsers size={32} className="text-orange-600 mb-3" />
          <p className="text-slate-800 font-semibold">New Users</p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">{newUsers}</h2>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white rounded-3xl shadow p-6 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 py-4 border border-slate-300 rounded-xl text-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* USER TABLE */}
      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-200">
            <tr>
              <th className="p-5 text-left font-bold text-slate-950">Name</th>
              <th className="p-5 text-left font-bold text-slate-950">Email</th>
              <th className="p-5 text-left font-bold text-slate-950">NIM</th>
              <th className="p-5 text-left font-bold text-slate-950">Role</th>
              <th className="p-5 text-left font-bold text-slate-950">Status</th>
              <th className="p-5 text-center font-bold text-slate-950">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-slate-500 font-semibold">
                  Tidak ada pengguna ditemukan.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-t hover:bg-slate-50 transition">
                  <td className="p-5 font-bold text-slate-950">{user.name}</td>
                  <td className="p-5 text-slate-900">{user.email}</td>
                  <td className="p-5 text-slate-900">{user.nim}</td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-lg font-bold text-sm ${
                        user.role === "Admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-lg font-bold text-sm ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-3">
                      {/* View Detail */}
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition"
                        title="View Detail"
                      >
                        <FiEye />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition"
                        title="Delete Account"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW DETAIL MODAL */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl p-8 w-[550px] max-w-[95vw] shadow-2xl">
            <h2 className="text-3xl font-bold text-slate-950 mb-6">User Detail</h2>

            <div className="space-y-4 text-slate-900">
              <p>
                <strong className="text-slate-700">Name:</strong> {selectedUser.name}
              </p>
              <p>
                <strong className="text-slate-700">Email:</strong> {selectedUser.email}
              </p>
              <p>
                <strong className="text-slate-700">NIM/NIP:</strong> {selectedUser.nim}
              </p>
              <p>
                <strong className="text-slate-700">Role:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-lg font-bold text-sm ${
                    selectedUser.role === "Admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {selectedUser.role}
                </span>
              </p>
              <p>
                <strong className="text-slate-700">Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-lg font-bold text-sm ${
                    selectedUser.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedUser.status}
                </span>
              </p>
              <p>
                <strong className="text-slate-700">Join Date:</strong> {selectedUser.joinDate}
              </p>
            </div>

            <button
              onClick={() => {
                setShowModal(false);
                setSelectedUser(null);
              }}
              className="w-full mt-6 bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl p-8 w-[450px] max-w-[95vw] shadow-2xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Hapus Akun</h2>
            <p className="text-slate-800 mb-2">
              Apakah Anda yakin ingin menghapus akun berikut?
            </p>
            <div className="bg-slate-100 rounded-xl p-4 mb-6">
              <p className="font-bold text-slate-950">{deleteTarget.name}</p>
              <p className="text-slate-600 text-sm">{deleteTarget.email}</p>
              <p className="text-slate-500 text-xs mt-1">Role: {deleteTarget.role}</p>
            </div>
            <p className="text-red-600 text-sm font-semibold mb-6">
              ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data pengguna akan dihapus permanen.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
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