'use client';

import { useState } from 'react';

// Import komponen (akan memunculkan error sementara sampai filenya dibuat)
import LoginScreen from '../../components/auth/LoginScreen';
import RegisterScreen from '../../components/auth/RegisterScreen';
import OtpScreen from '../../components/auth/OtpScreen';
import SuccessOverlay from '../../components/auth/SuccessOverlay';

// Tipe untuk memetakan nama ID layar persis seperti di HTML asli
export type ScreenId = 
  | 's-login' 
  | 's-register' 
  | 's-verify-reg' 
  | 's-newpass-reg' 
  | 's-forgot' 
  | 's-verify' 
  | 's-newpass';

export default function AuthPage() {
  // Layar default saat masuk ke /auth adalah Login
  const [activeScreen, setActiveScreen] = useState('s-login');
  
  // State untuk mengontrol animasi keluar (mengganti .exit-left)
  const [exitingScreen, setExitingScreen] = useState<String| null>(null);

  // State global untuk membawa data antar layar
  const [userEmail, setUserEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Fungsi navigasi pengganti go() di script3.js
const go = (targetId: string, emailData?: string) => {
    if (activeScreen === targetId) return;

    // Picu animasi keluar untuk layar saat ini
    setExitingScreen(activeScreen);
    
    // Tunggu 350ms (sesuai CSS) sebelum mengganti status layar aktif
    setTimeout(() => {
      setExitingScreen(null);
    }, 350);

    setActiveScreen(targetId);
  };

  return (
    <>
      <SuccessOverlay
        isVisible={showSuccess}
        onContinue={() => {
          setShowSuccess(false);
          go('s-login');
        }}
      />
      <LoginScreen
        isActive={activeScreen === 's-login'}
        isExiting={exitingScreen === 's-login'}
        onNavigate={go}
      />

      <RegisterScreen
        isActive={activeScreen === 's-register'}
        isExiting={exitingScreen === 's-register'}
        onNavigate={go}
      />

      <OtpScreen
        isActive={activeScreen === 's-verify-reg'}
        isExiting={exitingScreen === 's-verify-reg'}
        onNavigate={go}
        email={userEmail}
        onSuccess={() => setShowSuccess(true)}
      />
      
      {/* Jika nantinya layar Lupa Password (s-forgot, s-verify, s-newpass) dipecah 
          menjadi komponen terpisah, tambahkan di sini menggunakan pola yang sama */}
    </>
  );
}