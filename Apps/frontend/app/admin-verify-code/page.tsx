"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminVerifyCodePage() {
  const router = useRouter();

  const [code, setCode] = useState("");

  const handleVerify = () => {
    router.push("/admin-reset-password");
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background:
          "linear-gradient(135deg,#CCE8FE 0%,#FFFFFF 50%,#BEFFD9 100%)",
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10">

        <h1 className="text-5xl font-black text-[#252525] mb-4">
          Verify Code
        </h1>

        <p className="text-[#374151] text-lg font-medium mb-8">
          Enter the verification code sent to your admin email.
        </p>

        <input
          type="text"
          placeholder="123456"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="
            w-full
            h-24
            rounded-3xl
            border-2
            border-gray-300
            bg-[#EAF8F5]
            text-[#252525]
            text-4xl
            font-black
            text-center
            tracking-[10px]
            placeholder:text-[#9CA3AF]
            focus:outline-none
            focus:ring-4
            focus:ring-green-200
            focus:border-green-600
            mb-8
          "
        />

        <button
          onClick={handleVerify}
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
          Verify →
        </button>

        <p className="text-center mt-6 text-[#4B5563] font-medium">
          Didn't receive the code?
        </p>

        <button
          className="
            block
            mx-auto
            mt-2
            text-[#005A9C]
            font-bold
            hover:underline
          "
        >
          Resend Code
        </button>

      </div>
    </main>
  );
}