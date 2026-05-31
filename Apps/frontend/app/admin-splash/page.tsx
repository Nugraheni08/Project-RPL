"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/admin-login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg,#CCE8FE 0%,#FFFFFF 50%,#BEFFD9 100%)",
      }}
    >
      <img
        src="/logo-icon.png"
        alt="logo"
        className="w-40 mb-4"
      />

      <img
        src="/logo-text.png"
        alt="wmap"
        className="w-72"
      />

      <p className="mt-4 text-[#9AA3A7] font-bold tracking-widest">
        ADMIN PANEL
      </p>
    </main>
  );
}