"use client";

import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { FiLoader } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface AnalyticsData {
  totalRefills: number;
  wasteCollected: { value: number; label: string };
  reportsThisMonth: number;
  activeUsers: { value: number; label: string };
  totalUsers: { value: number; label: string };
  weeklyRefill: { day: string; refill: number }[];
  monthlyReports: { month: string; reports: number }[];
  topLocations: { name: string; percentage: number }[];
  ecoScore: { score: number; status: string };
}

const LOCATION_COLORS: Record<string, string> = {
  FMIPA: "bg-green-600",
  Fapet: "bg-blue-600",
  Fahutan: "bg-emerald-600",
  Satari: "bg-yellow-500",
  Perpus: "bg-purple-600",
  GPK: "bg-orange-500",
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Refs to hold the latest fetch function and data for real-time callbacks
  const dataRef = useRef<AnalyticsData | null>(null);
  const fetchRef = useRef<() => Promise<void>>(async () => {});

  // Keep dataRef in sync with latest state
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // ── Fetch analytics from API ──────────────────────────────────────
  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat data.");
      setData(json);
      setError("");
      setLastUpdated(new Date().toLocaleTimeString("id-ID"));
    } catch (err: any) {
      console.error("ANALYTICS_FRONTEND_ERROR:", err);
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchRef.current = fetchAnalytics;
    fetchAnalytics();
  }, []);

  // ── Supabase Realtime Subscriptions ───────────────────────────────
  // Listen for INSERT / UPDATE / DELETE on refill_activity and reports
  // tables so the analytics dashboard updates in real-time when users
  // perform refills, waste disposals, or file reports around campus.
  useEffect(() => {
    const channel = supabase
      .channel('admin-analytics-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'refill_activity' },
        () => {
          console.log('[Analytics] Refill activity changed — re-fetching...');
          fetchRef.current();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          console.log('[Analytics] Reports changed — re-fetching...');
          fetchRef.current();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          console.log('[Analytics] Users changed — re-fetching...');
          fetchRef.current();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        () => {
          console.log('[Analytics] Reviews changed — re-fetching...');
          fetchRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper: format angka besar (4.2K, 1.2M)
  const formatNum = (n: number): string => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toLocaleString("id-ID");
  };

  // Helper: warna bar untuk top locations
  const getLocColor = (name: string): string =>
    LOCATION_COLORS[name] || "bg-slate-500";

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-32">
          <FiLoader className="animate-spin text-green-600" size={36} />
          <span className="ml-3 text-slate-600 text-lg font-semibold">
            Memuat data analitik...
          </span>
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="py-20 text-center">
          <p className="text-red-600 text-xl font-bold">⚠️ {error || "Data tidak tersedia."}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-950">Analytics Dashboard</h1>
        <p className="text-slate-800 text-lg mt-2">Monitor campus sustainability performance</p>
      </div>

      {/* STATISTIC CARDS */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow">
          <p className="text-slate-700 font-semibold">Total Refills</p>
          <h2 className="text-5xl font-bold text-green-600 mt-3">
            {formatNum(data.totalRefills)}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <p className="text-slate-700 font-semibold">Waste Collected</p>
          <h2 className="text-5xl font-bold text-blue-600 mt-3">
            {data.wasteCollected.label}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <p className="text-slate-700 font-semibold">Reports This Month</p>
          <h2 className="text-5xl font-bold text-red-600 mt-3">
            {data.reportsThisMonth}
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <p className="text-slate-700 font-semibold">Active Users</p>
          <h2 className="text-5xl font-bold text-purple-600 mt-3">
            {data.activeUsers.label}
          </h2>
          {data.totalUsers && (
            <p className="text-xs text-slate-400 mt-1 font-medium">
              of {data.totalUsers.label} total registered
            </p>
          )}
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* REFILL BAR CHART */}
        <div className="bg-white rounded-3xl p-6 shadow">
          <h2 className="text-2xl font-bold text-slate-950 mb-4">Weekly Refill Activity</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyRefill}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="refill" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REPORTS LINE CHART */}
        <div className="bg-white rounded-3xl p-6 shadow">
          <h2 className="text-2xl font-bold text-slate-950 mb-4">Monthly Reports</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyReports}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="#2563eb"
                  strokeWidth={4}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LAST UPDATED INDICATOR */}
      {lastUpdated && (
        <div className="text-right mb-4">
          <span className="text-xs text-slate-400 font-medium">
            Last updated: {lastUpdated}
          </span>
        </div>
      )}

      {/* BOTTOM SECTION */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* TOP LOCATIONS */}
        <div className="bg-white rounded-3xl p-6 shadow">
          <h2 className="text-2xl font-bold text-slate-950 mb-6">Top Locations</h2>
          <div className="space-y-5">
            {data.topLocations.map((loc) => (
              <div key={loc.name}>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-900">{loc.name}</span>
                  <span className="font-bold text-slate-900">{loc.percentage}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full">
                  <div
                    className={`h-3 rounded-full ${getLocColor(loc.name)}`}
                    style={{ width: `${loc.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ECO SCORE */}
        <div className="bg-white rounded-3xl p-6 shadow flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold text-slate-950 mb-6">Campus Eco Score</h2>
          <div
            className={`w-52 h-52 rounded-full border-[18px] flex items-center justify-center ${
              data.ecoScore.score >= 90
                ? "border-green-500"
                : data.ecoScore.score >= 75
                ? "border-blue-500"
                : data.ecoScore.score >= 50
                ? "border-yellow-500"
                : "border-red-500"
            }`}
          >
            <div className="text-center">
              <h3 className="text-6xl font-extrabold text-green-600">{data.ecoScore.score}</h3>
              <p className="text-slate-700 font-semibold">/100</p>
            </div>
          </div>
          <p className="mt-6 font-bold text-lg text-green-700">
            Sustainability Status: {data.ecoScore.status}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}