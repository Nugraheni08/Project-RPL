"use client";

import AdminSidebar from "@/components/adminsidebar";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen w-full bg-slate-100 overflow-hidden">
      <AdminSidebar />

      <section className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </section>
    </main>
  );
}