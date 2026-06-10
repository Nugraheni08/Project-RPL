"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  FiHome,
  FiMapPin,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiActivity,
  FiMonitor,
} from "react-icons/fi";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;

  const linkClass = (href: string) => `flex items-center gap-3 px-4 py-3 font-semibold text-sm transition-all border-l-4 ${
    isActive(href)
      ? "bg-slate-100 text-green-800 border-green-800"
      : "text-slate-800 hover:bg-slate-100 border-transparent"
  }`;

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-50">
      {/* LOGO */}
      <div className="p-6 border-b flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo-icon.png" alt="logo" className="w-10 h-10 object-contain" />
          <img src="/logo-text.png" alt="Wmap Admin" className="h-6 object-contain" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase text-center w-full">Admin Panel</p>
      </div>

      {/* MENU */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">

        <Link href="/admin-dashboard" className={linkClass("/admin-dashboard")}>
          <FiHome size={20} /><span>Dashboard</span>
        </Link>

        <Link href="/admin-facility" className={linkClass("/admin-facility")}>
          <FiMapPin size={20} /><span>Facility Management</span>
        </Link>

        <Link href="/admin-map" className={linkClass("/admin-map")}>
          <FiMonitor size={20} /><span>Map Monitoring</span>
        </Link>

        <Link href="/admin-reports" className={linkClass("/admin-reports")}>
          <FiFileText size={20} /><span>Reports Management</span>
        </Link>

        <Link href="/admin-leaderboard" className={linkClass("/admin-leaderboard")}>
          <FiActivity size={20} /><span>Eco Leaderboard</span>
        </Link>

        <Link href="/admin-users" className={linkClass("/admin-users")}>
          <FiUsers size={20} /><span>User Management</span>
        </Link>

        <div className="pt-4">
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase px-5 mb-2">SYSTEM</p>
        </div>

        <Link href="/admin-analytics" className={linkClass("/admin-analytics")}>
          <FiBarChart2 size={20} /><span>Analytics</span>
        </Link>

        <Link href="/admin-settings" className={linkClass("/admin-settings")}>
          <FiSettings size={20} /><span>Settings</span>
        </Link>

      </nav>

      {/* LOGOUT */}
      <div className="p-6 border-t">
        <button onClick={handleLogout}
          className="w-full text-slate-800 hover:text-red-600 font-bold flex items-center justify-start gap-2 transition-all">
          <FiLogOut className="text-red-600" /> Logout
        </button>
      </div>
    </aside>
  );
}