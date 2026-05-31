"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  FiHome,
  FiMapPin,
  FiFileText,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

export default function AdminSidebar() {
  const router = useRouter();

const handleLogout = () => {
  router.push("/admin-login");
};

  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin-dashboard",
      icon: <FiHome size={20} />,
    },
    {
      name: "Facility Management",
      href: "/admin-facility",
      icon: <FiMapPin size={20} />,
    },
    {
      name: "Campus Map",
      href: "/admin-map",
      icon: <FiMapPin size={20} />,
    },
    {
      name: "Reports",
      href: "/admin-reports",
      icon: <FiFileText size={20} />,
    },
    {
      name: "User Management",
      href: "/admin-users",
      icon: <FiUsers size={20} />,
    },
    {
      name: "Analytics",
      href: "/admin-analytics",
      icon: <FiBarChart2 size={20} />,
    },
    {
      name: "Settings",
      href: "/admin-settings",
      icon: <FiSettings size={20} />,
    },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 flex flex-col">

      {/* LOGO */}
      <div className="p-6 border-b">

        <img
          src="/logo-text.png"
          alt="WMap"
          className="w-36 mb-2"
        />

        <p className="text-slate-700 font-medium">
          Admin Panel
        </p>

      </div>

      {/* MENU */}
      <nav className="flex-1 p-4 space-y-2">

        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
              
              ${
                pathname === item.href
                  ? "bg-green-600 text-white"
                  : "text-slate-800 hover:bg-slate-100"
              }
              
            `}
          >
            {item.icon}

            <span>{item.name}</span>
          </Link>
        ))}

      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t">

       <button
  onClick={handleLogout}
  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
>
  <FiLogOut />
  Logout
</button>

      </div>

    </aside>
  );
}