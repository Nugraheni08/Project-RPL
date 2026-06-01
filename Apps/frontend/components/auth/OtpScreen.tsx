'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import styles from '@/styles/auth.module.css';

interface OtpScreenProps {
  isActive?: boolean;
  isExiting?: boolean;
  onNavigate?: (target: string) => void;
  email?: string;
  onSuccess?: () => void;
}

export default function OtpScreen({ isActive, isExiting, onNavigate, email, onSuccess }: OtpScreenProps) {
  const { currentOTP, setOTP } = useAuthStore();
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Reset OTP input & timer setiap kali layar ini aktif
  useEffect(() => {
    if (isActive) {
      setOtpValues(['', '', '', '']);
      setErrorMsg('');
      setTimer(30);
      // Auto-fokus ke kotak pertama saat layar aktif
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [isActive]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newValues = [...otpValues];
    newValues[index] = value.substring(value.length - 1);
    setOtpValues(newValues);
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setErrorMsg('');
    const pendingEmail = sessionStorage.getItem('pending_reg_email');
    if (!pendingEmail) {
      setErrorMsg('Data email tidak ditemukan. Silakan daftar ulang.');
      return;
    }
    try {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const response = await fetch('/api/otp', { // ← diperbaiki: /otp → /api/otp
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp: generatedOtp }),
      });
      if (!response.ok) throw new Error('Gagal mengirim ulang OTP');
      setOTP(generatedOtp);
      setTimer(30);
      alert('Kode OTP baru telah dikirim ke email Anda.');
    } catch (error: any) {
      setErrorMsg('Gagal mengirim ulang kode OTP.');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const inputOTP = otpValues.join('');
    if (inputOTP.length < 4) {
      setErrorMsg('Harap lengkapi 4 digit kode OTP.');
      return;
    }
    if (inputOTP !== currentOTP) {
      setErrorMsg('Kode OTP salah atau tidak valid.');
      return;
    }
    setIsLoading(true);
    try {
      const pendingEmail    = sessionStorage.getItem('pending_reg_email');
      const password        = sessionStorage.getItem('pending_reg_password');
      const identifier      = sessionStorage.getItem('pending_reg_id');
      const role            = sessionStorage.getItem('pending_reg_role');
      const username        = sessionStorage.getItem('pending_reg_username');

      if (!pendingEmail || !password) throw new Error('Sesi pendaftaran tidak valid, silakan ulangi dari awal.');

      // Panggil server-side API route untuk membuat user via service_role key
      // (Operasi database dilakukan di server sehingga error tampil di Vercel Runtime Logs)
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmail,
          password,
          role: role === 'dosen' ? 'Dosen' : 'Mahasiswa',
          identifier: identifier || '',
          username,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat akun. Silakan coba lagi.');
      }

      sessionStorage.removeItem('pending_reg_email');
      sessionStorage.removeItem('pending_reg_password');
      sessionStorage.removeItem('pending_reg_id');
      sessionStorage.removeItem('pending_reg_role');
      sessionStorage.removeItem('pending_reg_username');
      onSuccess?.();
    } catch (error: any) {
      console.error('OTP_VERIFY_ERROR:', error);
      setErrorMsg(error.message || 'Gagal membuat akun. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const pendingEmail = typeof window !== 'undefined' ? sessionStorage.getItem('pending_reg_email') : 'email Anda';

  // ─── FIX 1: gunakan prop isActive & isExiting, bukan hardcode ───────────
  if (!isActive && !isExiting) return null;

  const screenClass = [
    styles.screen,
    isActive  ? styles.active  : '',
    isExiting ? styles['exit-left'] : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={screenClass} id="s-verify">
      {/* FIX 2: back button harusnya ke 's-register', bukan 's-login' */}
      <button type="button" className={styles['back-btn']} onClick={() => onNavigate?.('s-register')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Batal & Kembali
      </button>

      <div className={styles['login-body']} style={{ paddingTop: '20px' }}>
        <div className={styles['icon-circle']} style={{ margin: '0 auto 24px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        
        <h1 style={{ textAlign: 'center' }}>Periksa Email Anda</h1>
        <div className={styles.sub} style={{ textAlign: 'center' }}>
          Kami telah mengirimkan 4-digit kode OTP ke{' '}
          <span className={styles['email-highlight']}>{pendingEmail}</span>.
        </div>

        <form onSubmit={handleVerify}>
          <div className={styles['otp-grid']}>
            {otpValues.map((val, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                maxLength={1}
                className={styles['otp-input']}
                value={val}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                required
              />
            ))}
          </div>

          {errorMsg && (
            <div className={`${styles['field-error-msg']} ${styles.show}`} style={{ justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errorMsg}
            </div>
          )}

          <div className={styles['timer-wrap']}>
            <div className={styles['timer-count']}>
              00:{timer < 10 ? `0${timer}` : timer}
            </div>
            <button 
              type="button" 
              className={`${styles['resend-btn']} ${timer === 0 ? styles.active : ''}`}
              onClick={handleResendOTP}
              disabled={timer > 0}
            >
              Kirim Ulang Kode
            </button>
          </div>

          <button type="submit" className={styles['btn-primary']} style={{ marginTop: '28px' }} disabled={isLoading}>
            {isLoading ? 'Memverifikasi...' : 'Verifikasi Akun'}
            {!isLoading && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}