'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import styles from '@/styles/auth.module.css';
interface LoginScreenProps {
  isActive?: boolean;
  isExiting?: boolean;
  onNavigate?: (target: string) => void;
}

export default function LoginScreen({ isActive, isExiting, onNavigate }: LoginScreenProps) {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fungsi untuk beralih ke layar registrasi
  const goToRegister = () => {
    if (onNavigate) {
      onNavigate('s-register');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Harap isi email dan kata sandi.');
      return;
    }

    setIsLoading(true);

    try {
      // Autentikasi dengan Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        // Ambil data user dari tabel users untuk mengecek role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user role:', userError);
          // Fallback ke map jika gagal mengambil role
          useAuthStore.getState().setSession(data.session);
          router.push('/map');
          return;
        }

        // Jika login berhasil, simpan sesi ke global store
        useAuthStore.getState().setSession(data.session);
        
        // Redirect berdasarkan role
        if (userData?.role === 'Admin') {
          router.push('/admin-dashboard');
        } else {
          router.push('/map');
        }
      }
    } catch (error: any) {
      console.error('Error saat login:', error);
      setErrorMsg(error.message || 'Gagal masuk. Periksa kembali email dan sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.screen} ${styles.active}`} id="s-login">
      <div className={styles['login-top']}>
        <div className={styles['brand-inline']}>
          <span className={styles.w}>W</span>
          <span className={styles.rest}>map</span>
        </div>
        <div className={styles['brand-sub']}>Sustain the future</div>
      </div>

      <div className={styles['login-body']}>
        <h1>Selamat Datang!</h1>
        <div className={styles.sub}>Masuk untuk melanjutkan perjalanan hijau Anda.</div>

        <form id="loginForm" onSubmit={handleLogin}>
          {/* Email Field */}
          <label className={styles['field-label']}>Email Kampus</label>
          <div className={styles['field-wrap']}>
            <div className={styles['field-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <input
              type="email"
              className={`${styles['field-input']} ${errorMsg ? styles.error : ''}`}
              placeholder="nama@apps.ipb.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <label className={styles['field-label']}>Kata Sandi</label>
          <div className={styles['field-wrap']}>
            <div className={styles['field-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${styles['field-input']} ${errorMsg ? styles.error : ''}`}
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles['eye-btn']}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="3" y1="3" x2="21" y2="21" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Pesan Error */}
          {errorMsg && (
            <div className={`${styles['field-error-msg']} ${styles.show}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errorMsg}
            </div>
          )}

          <div className={styles['forgot-link']}>
            <button type="button">Lupa kata sandi?</button>
          </div>

          <button type="submit" className={styles['btn-primary']} disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Login'}
            {!isLoading && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </form>

        <div className={styles['link-row']} style={{ marginTop: '24px' }}>
          Belum punya akun? <button type="button" onClick={goToRegister}>Daftar di sini</button>
        </div>
      </div>
    </div>
  );
}