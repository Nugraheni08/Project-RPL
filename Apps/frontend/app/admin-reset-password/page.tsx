"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminResetPasswordPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = () => {
    router.push("/admin-password-success");
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background:
          "linear-gradient(135deg,#CCE8FE 0%,#FFFFFF 50%,#BEFFD9 100%)",
      }}
    >
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-10">

        <h1 className="text-5xl font-black text-[#252525] mb-4">
          Reset Password
        </h1>

        <p className="text-[#374151] text-lg font-medium mb-8">
          Create a new password for your admin account.
        </p>

        {/* NEW PASSWORD */}
        <div className="relative mb-6">

          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full
              h-20
              px-6
              rounded-3xl
              border-2
              border-gray-300
              bg-[#EAF8F5]
              text-[#252525]
              text-lg
              font-semibold
              placeholder:text-[#6B7280]
              focus:outline-none
              focus:ring-4
              focus:ring-green-200
              focus:border-green-600
            "
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute
              right-6
              top-1/2
              -translate-y-1/2
              text-[#4B5563]
              hover:text-[#252525]
            "
          >
            {showPassword ? (
              <FiEyeOff size={24} />
            ) : (
              <FiEye size={24} />
            )}
          </button>

        </div>

        {/* CONFIRM PASSWORD */}
        <div className="mb-8">

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="
              w-full
              h-20
              px-6
              rounded-3xl
              border-2
              border-gray-300
              bg-[#EAF8F5]
              text-[#252525]
              text-lg
              font-semibold
              placeholder:text-[#6B7280]
              focus:outline-none
              focus:ring-4
              focus:ring-green-200
              focus:border-green-600
            "
          />

        </div>

        <button
          onClick={handleReset}
          className="
            w-full
            py-5
            rounded-full
            text-white
            text-2xl
            font-bold
            shadow-lg
            transition-all
            hover:scale-[1.02]
          "
          style={{
            background:
              "linear-gradient(90deg,#118C2C 0%,#3A7A64 100%)",
          }}
        >
          Reset Password →
        </button>

      </div>
    </main>
  );
}