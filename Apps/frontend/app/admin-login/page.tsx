"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminLoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // sementara langsung masuk dashboard admin
    router.push("/admin-dashboard");
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background:
          "linear-gradient(135deg,#CCE8FE 0%,#FFFFFF 50%,#BEFFD9 100%)",
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">

          <img
            src="/logo-icon.png"
            alt="logo"
            className="w-20 h-20 object-contain"
          />

          <img
            src="/logo-text.png"
            alt="wmap"
            className="w-48 mt-2"
          />

          <p className="text-[#9AA3A7] font-bold tracking-widest mt-2">
            ADMIN PANEL
          </p>

        </div>

        {/* Title */}
        <div className="text-center mb-8">

          <h1 className="text-5xl font-black text-[#252525]">
            Admin Login
          </h1>

          <p className="text-[#374151] mt-3 font-medium">
            Sign in to access WMap Administration Panel
          </p>

        </div>

        {/* Email */}
        <div className="mb-5">

          <label className="block text-sm font-bold text-[#374151] mb-2">
            EMAIL ADMIN
          </label>

          <input
            type="email"
            placeholder="admin@wmap.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full
              p-4
              rounded-2xl
              bg-[#EAF8F5]
              border
              border-gray-300
              text-[#252525]
              placeholder:text-[#6B7280]
              font-medium
              outline-none
              focus:ring-2
              focus:ring-green-500
            "
          />

        </div>

        {/* Password */}
        <div className="mb-6">

          <label className="block text-sm font-bold text-[#374151] mb-2">
            PASSWORD
          </label>

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full
                p-4
                rounded-2xl
                bg-[#EAF8F5]
                border
                border-gray-300
                text-[#252525]
                placeholder:text-[#6B7280]
                font-medium
                outline-none
                focus:ring-2
                focus:ring-green-500
              "
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-[#4B5563]
              "
            >
              {showPassword ? (
                <FiEyeOff size={22} />
              ) : (
                <FiEye size={22} />
              )}
            </button>

          </div>

        </div>

        {/* Forgot Password */}
        <div className="text-right mb-6">

          <button
            type="button"
            className="
              text-[#005A9C]
              font-semibold
              hover:underline
            "
          >
            Forgot Password?
          </button>

        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="
            w-full
            py-4
            rounded-full
            text-white
            text-xl
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
          Login Admin →
        </button>

        {/* Footer */}
        <p className="text-center text-[#4B5563] mt-6 text-sm font-medium">
          WMap Administration Dashboard
        </p>

      </div>
    </main>
  );
}