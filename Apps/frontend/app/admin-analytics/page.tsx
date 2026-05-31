"use client";

import AdminSidebar from "@/components/adminsidebar";
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

const refillData = [
  { day: "Mon", refill: 120 },
  { day: "Tue", refill: 180 },
  { day: "Wed", refill: 240 },
  { day: "Thu", refill: 210 },
  { day: "Fri", refill: 310 },
  { day: "Sat", refill: 90 },
  { day: "Sun", refill: 70 },
];

const reportData = [
  { month: "Jan", reports: 12 },
  { month: "Feb", reports: 20 },
  { month: "Mar", reports: 15 },
  { month: "Apr", reports: 18 },
  { month: "May", reports: 25 },
  { month: "Jun", reports: 30 },
];

export default function AdminAnalyticsPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <section className="ml-64 p-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-950">
            Analytics Dashboard
          </h1>

          <p className="text-slate-800 text-lg mt-2">
            Monitor campus sustainability performance
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-3xl p-6 shadow">
            <p className="text-slate-700 font-semibold">
              Total Refills
            </p>

            <h2 className="text-5xl font-bold text-green-600 mt-3">
              4,280
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow">
            <p className="text-slate-700 font-semibold">
              Waste Collected
            </p>

            <h2 className="text-5xl font-bold text-blue-600 mt-3">
              1.2T
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow">
            <p className="text-slate-700 font-semibold">
              Reports This Month
            </p>

            <h2 className="text-5xl font-bold text-red-600 mt-3">
              30
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow">
            <p className="text-slate-700 font-semibold">
              Active Users
            </p>

            <h2 className="text-5xl font-bold text-purple-600 mt-3">
              2.4K
            </h2>
          </div>

        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">

          {/* REFILL CHART */}
          <div className="bg-white rounded-3xl p-6 shadow">

            <h2 className="text-2xl font-bold text-slate-950 mb-4">
              Weekly Refill Activity
            </h2>

            <div className="h-[300px]">

              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={refillData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="refill"
                    fill="#16a34a"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

            </div>
          </div>

          {/* REPORT CHART */}
          <div className="bg-white rounded-3xl p-6 shadow">

            <h2 className="text-2xl font-bold text-slate-950 mb-4">
              Monthly Reports
            </h2>

            <div className="h-[300px]">

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData}>
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

        {/* BOTTOM SECTION */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* TOP LOCATIONS */}
          <div className="bg-white rounded-3xl p-6 shadow">

            <h2 className="text-2xl font-bold text-slate-950 mb-6">
              Top Locations
            </h2>

            <div className="space-y-5">

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-900">
                    FMIPA
                  </span>

                  <span className="font-bold text-slate-900">
                    88%
                  </span>
                </div>

                <div className="h-3 bg-slate-200 rounded-full">
                  <div className="h-3 bg-green-600 rounded-full w-[88%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-900">
                    Engineering
                  </span>

                  <span className="font-bold text-slate-900">
                    72%
                  </span>
                </div>

                <div className="h-3 bg-slate-200 rounded-full">
                  <div className="h-3 bg-blue-600 rounded-full w-[72%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-slate-900">
                    Library
                  </span>

                  <span className="font-bold text-slate-900">
                    65%
                  </span>
                </div>

                <div className="h-3 bg-slate-200 rounded-full">
                  <div className="h-3 bg-yellow-500 rounded-full w-[65%]" />
                </div>
              </div>

            </div>

          </div>

          {/* ECO SCORE */}
          <div className="bg-white rounded-3xl p-6 shadow flex flex-col justify-center items-center">

            <h2 className="text-2xl font-bold text-slate-950 mb-6">
              Campus Eco Score
            </h2>

            <div className="w-52 h-52 rounded-full border-[18px] border-green-500 flex items-center justify-center">

              <div className="text-center">

                <h3 className="text-6xl font-extrabold text-green-600">
                  84
                </h3>

                <p className="text-slate-700 font-semibold">
                  /100
                </p>

              </div>

            </div>

            <p className="mt-6 text-green-700 font-bold text-lg">
              Sustainability Status: Excellent
            </p>

          </div>

        </div>

      </section>
    </main>
  );
}