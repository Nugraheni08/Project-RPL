import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="auth-wrapper">
      <div className="phone-shell">
        {/* Konten dari page.tsx (Login, Register, OTP) akan dirender di sini */}
        {children}
      </div>
    </div>
  );
}