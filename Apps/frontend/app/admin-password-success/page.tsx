"use client";

import { useRouter } from "next/navigation";

export default function AdminPasswordSuccessPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#CCE8FE] via-white to-[#BEFFD9] px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">

        <div className="text-7xl mb-6">
          ✅
        </div>

        <h1 className="text-4xl font-black text-[#252525] mb-4">
          Password Updated
        </h1>

        <p className="text-[#4B5563] mb-8">
          Your admin password has been successfully changed.
        </p>

        <button
          onClick={() => router.push("/admin-login")}
          className="w-full py-4 rounded-full text-white font-bold text-lg"
          style={{
            background:
              "linear-gradient(90deg,#118C2C 0%,#3A7A64 100%)",
          }}
        >
          Back To Login
        </button>

      </div>
    </main>
  );
}