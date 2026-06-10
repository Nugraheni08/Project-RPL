"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/adminsidebar";
import MapView, { MapFacility } from "@/components/map/MapView";
import { supabase } from "@/lib/supabase";
import {
  FiUser,
  FiSearch,
  FiBell,
  FiSettings,
  FiDroplet,
  FiTrash2,
  FiAlertCircle,
  FiBarChart2,
  FiCheckCircle,
  FiFlag,
  FiMessageSquare,
  FiEye,
  FiPlus,
  FiLoader,
} from "react-icons/fi";

interface DashboardData {
  campusName: string;
  ecoScore: number;
  stats: { label: string; value: string; trend: string; trendRed?: boolean }[];
  recentReports: { id: string; title: string; location: string; time: string; status: string; statusClass: string }[];
  weeklyRefill: { day: string; value: number }[];
  activeLocations: { name: string; pct: number }[];
  userGrowth: { active: string; new: number; target: string };
  facilityTable: { id: string; dbId: string; name: string; category: string; status: string; statusClass: string }[];
  leaderboard: { name: string; pts: number; initials: string; isMvp: boolean }[];
  reviews: { user: string; text: string; stars: number }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dbFacilities, setDbFacilities] = useState<MapFacility[]>([]);
  var fetchFacilitiesRef = useRef<() => Promise<void>>(async function () {});

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat dashboard.");
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      console.error("DASHBOARD_FETCH_ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    var fetchFacilities = async function () {
      try {
        var res = await fetch('/api/facilities');
        var json = await res.json();
        if (res.ok && json.facilities) {
          setDbFacilities(json.facilities);
        }
      } catch (err) {
        console.error('Admin dashboard: gagal fetch facilities:', err);
      }
    };

    fetchFacilitiesRef.current = fetchFacilities;
    fetchFacilities();
  }, []);

  // ── Supabase Realtime subscription for live facility updates ──
  useEffect(function () {
    var channel = supabase
      .channel('admin-dashboard-facilities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'facilities' },
        function () {
          fetchFacilitiesRef.current();
        }
      )
      .subscribe();

    return function () {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) {
    return (
      <main className="flex h-screen w-full bg-slate-100 overflow-hidden">
        <AdminSidebar />
        <section className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FiLoader className="animate-spin text-green-600 mx-auto" size={40} />
            <p className="mt-4 text-slate-600 font-semibold text-lg">Memuat Dashboard...</p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex h-screen w-full bg-slate-100 overflow-hidden">
        <AdminSidebar />
        <section className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 text-xl font-bold">⚠️ {error || "Data tidak tersedia."}</p>
            <button onClick={fetchDashboard} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-xl font-bold">Coba Lagi</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full bg-slate-100 overflow-hidden">
      <AdminSidebar />

      <section className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* HEADER */}
        <header className="w-full bg-white h-20 flex-shrink-0 border-b border-slate-300 px-8 flex justify-between items-center z-20">
          <div className="relative flex-1 max-w-lg">
            <FiSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search facilities, reports, stations..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="flex items-center gap-4">
            <Link href="/admin-notifications">
              <div className="relative cursor-pointer">
                <FiBell size={24} className="text-slate-800 hover:text-green-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
              </div>
            </Link>

            <Link href="/admin-settings">
              <FiSettings size={24} className="text-slate-800 hover:text-green-600" />
            </Link>

            <Link href="/admin-profile">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-3 py-2 rounded-xl">
                <FiUser size={22} className="text-slate-800" />
                <span className="font-semibold text-slate-900">Admin</span>
              </div>
            </Link>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {/* TITLE */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Dashboard Overview</h1>
              <p className="text-slate-700 mt-1 text-lg">Green Campus Monitoring — {data.campusName}</p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
              Campus Eco Score: {data.ecoScore}/100
            </div>
          </div>

          {/* ROW 1: STAT CARDS */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
            {data.stats.map(function (s, idx) {
              var icons = [<FiDroplet size={24} key={0} />, <FiDroplet size={24} key={1} />, <FiTrash2 size={24} key={2} />, <FiAlertCircle size={24} key={3} />];
              var iconBgs = ["bg-blue-50", "bg-green-50", "bg-emerald-50", "bg-red-50"];
              var iconClrs = ["text-blue-600", "text-green-600", "text-emerald-600", "text-red-500"];
              return (
                <div key={s.label} className="bg-white rounded-3xl p-6 shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div className={"w-12 h-12 rounded-xl flex items-center justify-center text-2xl " + iconBgs[idx]}>
                      <span className={iconClrs[idx]}>{icons[idx]}</span>
                    </div>
                    <span className={"text-xs font-semibold " + (s.trendRed ? "text-red-500" : "text-green-600")}>{s.trend}</span>
                  </div>
                  <p className="text-slate-700 font-semibold text-sm">{s.label}</p>
                  <h2 className="text-5xl font-bold text-slate-900 mt-2">{s.value}</h2>
                </div>
              );
            })}
          </div>

          {/* ROW 2: MAP + REPORTS */}
          <div className="grid lg:grid-cols-3 gap-6 mt-8">
            {/* Map */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Live Campus Map</h2>
                  <p className="text-slate-600 text-sm mt-1">Real-time facility monitoring</p>
                </div>
                <div className="flex items-center gap-3">
                  <select className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none">
                    <option>All Facilities</option>
                    <option>Refill Station</option>
                    <option>Waste Bin</option>
                  </select>
                  <button onClick={fetchDashboard} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold">Refresh</button>
                </div>
              </div>
              <MapView 
                className="h-[450px] w-full rounded-2xl relative overflow-hidden isolate border border-slate-200" 
                style={{ zIndex: 10 }}
                facilities={dbFacilities}
              />
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-3xl p-6 shadow-md flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-bold text-slate-900">Recent Reports</h2>
                <Link href="/admin-reports" className="text-green-700 font-bold">View All</Link>
              </div>
              <div className="space-y-4 flex-1">
                {data.recentReports.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No reports yet.</p>
                ) : (
                  data.recentReports.map(function (r) {
                    return (
                      <div key={r.id} className="border rounded-xl p-4 hover:border-green-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-900 text-sm">{r.title}</h3>
                          <span className={"text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap " + r.statusClass}>{r.status}</span>
                        </div>
                        <p className="text-slate-600 text-xs mt-1 mb-3">{r.location} • {r.time}</p>
                        <div className="flex gap-2">
                          <button className="text-[10px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100 flex items-center gap-1"><FiEye size={10} /> View</button>
                          <button className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 flex items-center gap-1"><FiCheckCircle size={10} /> Resolve</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ROW 3: CHARTS */}
          <div className="grid lg:grid-cols-3 gap-6 mt-8">
            {/* Weekly Refill Activity */}
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Weekly Refill Activity</h2>
              <p className="text-xs text-slate-500 mb-4">Daily usage of water stations</p>
              <div className="flex items-end justify-between gap-2 h-40">
                {data.weeklyRefill.map(function (b) {
                  var maxVal = Math.max(...data.weeklyRefill.map(function (x) { return x.value; }), 1);
                  var h = Math.max(4, (b.value / maxVal) * 120);
                  return (
                    <div key={b.day} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full bg-green-500 rounded-t-md transition-all hover:bg-green-600" style={{ height: h + "px", minHeight: "4px" }}></div>
                      <span className="text-[10px] font-semibold text-slate-400">{b.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Locations */}
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Active Locations</h2>
              <p className="text-xs text-slate-500 mb-4">High-traffic hotspots</p>
              <div className="flex flex-col gap-3">
                {data.activeLocations.map(function (loc) {
                  return (
                    <div key={loc.name}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-slate-700">{loc.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">{loc.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: loc.pct + "%" }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* User Growth */}
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-slate-900 mb-4">User Growth</h2>
              <p className="text-xs text-slate-500 mb-4">Weekly student engagement</p>
              <div className="relative h-32">
                <svg className="w-full h-full" viewBox="0 0 200 100">
                  <polyline points="0,80 30,50 60,55 90,25 120,35 150,15 180,20 200,10" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-slate-200">
                <div className="text-center"><div className="text-lg font-extrabold text-slate-900">{data.userGrowth.active}</div><div className="text-[10px] text-slate-500 font-semibold">Active</div></div>
                <div className="text-center"><div className="text-lg font-extrabold text-green-600">+{data.userGrowth.new}</div><div className="text-[10px] text-slate-500 font-semibold">New</div></div>
                <div className="text-center"><div className="text-lg font-extrabold text-slate-900">{data.userGrowth.target}</div><div className="text-[10px] text-slate-500 font-semibold">Target</div></div>
              </div>
            </div>
          </div>

          {/* ROW 4: FACILITY TABLE + WIDGETS */}
          <div className="grid lg:grid-cols-3 gap-6 mt-8">
            {/* Facility Management */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-3xl font-bold text-slate-900">Facility Management</h2>
                <Link href="/admin-facility" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-1.5"><FiPlus size={16} /> Add Facility</Link>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-slate-800">Facility</th>
                    <th className="text-left text-slate-800">Category</th>
                    <th className="text-left text-slate-800">Status</th>
                    <th className="text-left text-slate-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.facilityTable.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-sm">No facilities yet.</td></tr>
                  ) : (
                    data.facilityTable.map(function (f) {
                      return (
                        <tr key={f.id} className="border-b">
                          <td className="py-4">
                            <div className="font-medium text-slate-900">{f.name}</div>
                            <div className="text-[10px] text-slate-400">{f.id}</div>
                          </td>
                          <td className="text-slate-700 text-sm">{f.category}</td>
                          <td><span className={"text-xs font-bold px-3 py-1 rounded-lg " + f.statusClass}>{f.status}</span></td>
                          <td>
                            <div className="flex gap-2">
                              <Link href={"/admin-facility"} className="text-xs font-semibold text-slate-500 hover:text-green-600">Edit</Link>
                              <button className="text-xs font-semibold text-slate-500 hover:text-red-500">Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Widgets Column */}
            <div className="space-y-6">
              {/* Eco Leaderboard */}
              <div className="bg-white rounded-3xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Eco Leaderboard</h2>
                <div className="space-y-3">
                  {data.leaderboard.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No users yet.</p>
                  ) : (
                    data.leaderboard.map(function (lb, idx) {
                      return (
                        <div key={lb.name} className="flex items-center gap-3">
                          <div className="text-sm font-extrabold text-slate-300 w-5">{idx + 1}</div>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white font-bold text-[11px]">{lb.initials}</div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                              {lb.name}
                              {lb.isMvp ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">MVP</span> : null}
                            </div>
                          </div>
                          <div className="text-xs font-bold text-green-600">{lb.pts.toLocaleString("en-US")} pts</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Review Moderation */}
              <div className="bg-white rounded-3xl p-6 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-slate-900">Review Moderation</h2>
                  <Link href="/admin-reviews" className="text-sm font-bold text-green-600 hover:underline">Manage</Link>
                </div>
                <div className="space-y-3">
                  {data.reviews.map(function (rev) {
                    return (
                      <div key={rev.user + rev.text} className="border rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">{rev.user.charAt(0)}</div>
                          <span className="text-xs font-semibold text-slate-700">{rev.user}</span>
                          <span className="text-[11px] text-amber-400">{"★".repeat(rev.stars)}{"☆".repeat(5 - rev.stars)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{rev.text}</p>
                        <div className="flex gap-1.5">
                          <button className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">APPROVE</button>
                          <button className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">HIDE</button>
                          <button className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-0.5"><FiMessageSquare size={8} /> REPLY</button>
                          <button className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded flex items-center gap-0.5"><FiFlag size={8} /> FLAG</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg shadow-green-200 flex items-center justify-center text-2xl transition-all hover:scale-105 z-50">
        <FiPlus size={24} />
      </button>
    </main>
  );
}