"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const handleContinue = () => {
    router.push("/admin-verify-code");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#CCE8FE] via-white to-[#BEFFD9] px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        <h1 className="text-4xl font-black text-[#252525] mb-3">
          Forgot Password
        </h1>

        <p className="text-[#4B5563] mb-8">
          Enter your admin email to receive a verification code.
        </p>

        <label className="block font-bold text-[#374151] mb-2">
          ADMIN EMAIL
        </label>

        <input
          type="email"
          placeholder="admin@wmap.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-2xl bg-[#EAF8F5] border border-gray-300 text-[#252525] mb-8"
        />

        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-full text-white font-bold text-lg"
          style={{
            background:
              "linear-gradient(90deg,#118C2C 0%,#3A7A64 100%)",
          }}
        >
          Send Code →
        </button>
      </div>
    </main>
  );
}