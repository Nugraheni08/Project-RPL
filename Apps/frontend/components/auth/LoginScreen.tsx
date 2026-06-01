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

        <div className={styles.divider}>
          <div className={styles['divider-line']}></div>
          <span>atau</span>
          <div className={styles['divider-line']}></div>
        </div>

        <button type="button" className={styles['btn-social']} onClick={() => alert('Fitur Google SSO belum tersedia.')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Lanjutkan dengan Google
        </button>

        <div className={styles['link-row']}>
          Belum punya akun? <button type="button" onClick={goToRegister}>Daftar di sini</button>
        </div>
      </div>
    </div>
  );
}