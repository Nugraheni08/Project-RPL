"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { supabase } from "@/lib/supabase";
import { FiSearch, FiAward, FiUsers } from "react-icons/fi";

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  pts: number;
  rank: number;
  avatar_url?: string | null;
  bottles_saved?: number;
}

export default function AdminLeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(function () {
    var fetchLeaderboard = async function () {
      setIsLoading(true);
      try {
        // Fetch dari view user_rankings (sama dengan yang dipakai user leaderboard)
        var { data, error } = await supabase
          .from("user_rankings")
          .select("*")
          .order("rank", { ascending: true })
          .limit(100);

        if (error) throw error;

        if (data) {
          setUsers(
            data.map(function (row: Record<string, unknown>) {
              return {
                id: (row.id as string) || "",
                name: (row.name as string) || (row.full_name as string) || "Unknown",
                email: (row.email as string) || "-",
                role: (row.role as string) || "User",
                pts: (row.pts as number) || (row.total_points as number) || 0,
                rank: (row.rank as number) || 0,
                avatar_url: row.avatar_url as string | null,
                bottles_saved: (row.bottles_saved as number) || Math.floor(((row.pts as number) || 0) / 10),
              };
            })
          );
        }
      } catch (err) {
        console.error("Gagal fetch leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  var filtered = users.filter(function (u) {
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  var totalUsers = users.length;
  var totalPoints = users.reduce(function (sum, u) { return sum + u.pts; }, 0);
  var topScorer = users.length > 0 ? users[0] : null;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-slate-600 text-lg font-semibold animate-pulse">
            Loading Leaderboard...
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-950">
          Eco Leaderboard
        </h1>
        <p className="text-slate-800 text-lg mt-2">
          Real-time user rankings based on eco points
        </p>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow">
          <FiUsers size={32} className="text-blue-600 mb-3" />
          <p className="text-slate-800 font-semibold">Total Participants</p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">
            {totalUsers}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <FiAward size={32} className="text-green-600 mb-3" />
          <p className="text-slate-800 font-semibold">Total Eco Points</p>
          <h2 className="text-4xl font-bold text-slate-950 mt-2">
            {totalPoints.toLocaleString("en-US")}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <FiAward size={32} className="text-amber-500 mb-3" />
          <p className="text-slate-800 font-semibold">Top Scorer</p>
          <h2 className="text-2xl font-bold text-slate-950 mt-2">
            {topScorer ? topScorer.name : "-"}
          </h2>
          <p className="text-green-600 font-bold mt-1">
            {topScorer ? topScorer.pts.toLocaleString("en-US") + " pts" : ""}
          </p>
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
            placeholder="Search by name or email..."
            value={search}
            onChange={function (e) { setSearch(e.target.value); }}
            className="w-full pl-12 py-4 border border-slate-300 rounded-xl text-slate-950 font-semibold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <div className="px-6 py-5 border-b">
          <h2 className="text-2xl font-bold text-slate-950">
            Real-time Rankings
          </h2>
        </div>

        <table className="w-full">
          <thead className="bg-slate-200">
            <tr>
              <th className="p-5 text-left text-slate-950 font-bold">Rank</th>
              <th className="p-5 text-left text-slate-950 font-bold">User</th>
              <th className="p-5 text-left text-slate-950 font-bold">Email</th>
              <th className="p-5 text-left text-slate-950 font-bold">Role</th>
              <th className="p-5 text-left text-slate-950 font-bold">
                Eco Points
              </th>
              <th className="p-5 text-left text-slate-950 font-bold">
                Bottles Saved
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-10 text-center text-slate-500 font-semibold"
                >
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map(function (user) {
                var rankBadgeClass =
                  user.rank === 1
                    ? "bg-amber-100 text-amber-800"
                    : user.rank === 2
                    ? "bg-slate-200 text-slate-700"
                    : user.rank === 3
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-100 text-slate-600";

                return (
                  <tr
                    key={user.id}
                    className="border-t hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-5">
                      <span
                        className={
                          "w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm " +
                          rankBadgeClass
                        }
                      >
                        {user.rank}
                      </span>
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.name
                              .split(" ")
                              .map(function (n) {
                                return n.charAt(0);
                              })
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()
                          )}
                        </div>
                        <span className="font-bold text-slate-950">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    <td className="p-5 text-slate-900 font-medium">
                      {user.email}
                    </td>

                    <td className="p-5">
                      <span
                        className={
                          "px-3 py-1 rounded-lg text-xs font-bold " +
                          (user.role === "Admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700")
                        }
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="p-5">
                      <span className="font-extrabold text-green-600 text-lg">
                        {user.pts.toLocaleString("en-US")}
                      </span>
                    </td>

                    <td className="p-5">
                      <span className="font-bold text-slate-700">
                        {user.bottles_saved
                          ? user.bottles_saved.toLocaleString("en-US")
                          : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}