'use client';

import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import styles from '@/styles/auth.module.css';

interface RegisterScreenProps {
  isActive?: boolean;
  isExiting?: boolean;
  onNavigate?: (target: string, emailData?: string) => void;
}

export default function RegisterScreen({ isActive, isExiting, onNavigate }: RegisterScreenProps) {
  const { currentRole, setRole, setOTP } = useAuthStore();
  const [identifier, setIdentifier] = useState(''); 
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setUsernameError('');

    // Validasi username
    if (!username || username.length < 3 || username.length > 30) {
      setUsernameError('Username harus 3-30 karakter');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameError('Username hanya boleh huruf, angka, underscore, dan hyphen');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal harus terdiri dari 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      
      // FIX: /otp → /api/otp
      const response = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: generatedOtp }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal mengirim email kode OTP.');
      }

      setOTP(generatedOtp);
      
      sessionStorage.setItem('pending_reg_email', email);
      sessionStorage.setItem('pending_reg_password', password);
      sessionStorage.setItem('pending_reg_id', identifier);
      sessionStorage.setItem('pending_reg_role', currentRole);
      sessionStorage.setItem('pending_reg_username', username);

      onNavigate?.('s-verify-reg', email);
    } catch (error: any) {
      console.error('Error proses pendaftaran:', error);
      setErrorMsg(error.message || 'Terjadi kesalahan sistem. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: gunakan prop isActive & isExiting, bukan hardcode active
  if (!isActive && !isExiting) return null;

  const screenClass = [
    styles.screen,
    isActive  ? styles.active       : '',
    isExiting ? styles['exit-left'] : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={screenClass} id="s-register">
      <button type="button" className={styles['back-btn']} onClick={() => onNavigate?.('s-login')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Kembali ke Masuk
      </button>

      <div className={styles['login-body']} style={{ paddingTop: '20px' }}>
        <h1>Buat Akun</h1>
        <div className={styles.sub}>Daftarkan diri untuk mulai berkontribusi pada lingkungan kampus.</div>

        <label className={styles['field-label']}>Pilih Peran Anda</label>
        <div className={styles['otp-grid']} style={{ justifyContent: 'flex-start', marginBottom: '22px', gap: '10px' }}>
          <button
            type="button"
            className={styles['btn-social']}
            style={{ 
              borderColor: currentRole === 'mahasiswa' ? 'var(--green-mid)' : '',
              background: currentRole === 'mahasiswa' ? '#ffffff' : 'rgba(255,255,255,0.4)',
              fontWeight: currentRole === 'mahasiswa' ? '700' : '500',
              flex: 1 
            }}
            onClick={() => setRole('mahasiswa')}
          >
            🎓 Mahasiswa
          </button>
          <button
            type="button"
            className={styles['btn-social']}
            style={{ 
              borderColor: currentRole === 'dosen' ? 'var(--green-mid)' : '',
              background: currentRole === 'dosen' ? '#ffffff' : 'rgba(255,255,255,0.4)',
              fontWeight: currentRole === 'dosen' ? '700' : '500',
              flex: 1 
            }}
            onClick={() => setRole('dosen')}
          >
            👨‍🏫 Dosen / Staf
          </button>
        </div>

        <form onSubmit={handleRegisterSubmit}>
          <label className={styles['field-label']}>
            {currentRole === 'mahasiswa' ? 'NIM (Nomor Induk Mahasiswa)' : 'NIP (Nomor Induk Pegawai)'}
          </label>
          <div className={styles['field-wrap']}>
            <div className={styles['field-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <input
              type="text"
              className={styles['field-input']}
              placeholder={currentRole === 'mahasiswa' ? 'Masukkan NIM Anda' : 'Masukkan NIP Anda'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <label className={styles['field-label']}>Email Institusi</label>
          <div className={styles['field-wrap']}>
            <div className={styles['field-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <input
              type="email"
              className={styles['field-input']}
              placeholder="contoh@apps.ipb.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label className={styles['field-label']}>Username</label>
          <div className={styles['field-wrap']}>
            <div className={styles['field-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              type="text"
              className={`${styles['field-input']} ${usernameError ? styles['error'] : ''}`}
              placeholder="Pilih nama pengguna (3-30 karakter)"
              maxLength={30}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError('');
              }}
              required
            />
          </div>
          {usernameError && (
            <div className={`${styles['field-error-msg']} ${styles.show}`} style={{ marginBottom: '16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {usernameError}
            </div>
          )}

          <label className={styles['field-label']}>Kata Sandi</label>
          <div className={styles['field-wrap']}>
            <div className={styles['field-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              type="password"
              className={styles['field-input']}
              placeholder="Buat kata sandi baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <label className={styles['field-label']}>Konfirmasi Kata Sandi</label>
          <div className={styles['field-wrap']}>
            <div className={styles['field-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              type="password"
              className={styles['field-input']}
              placeholder="Ulangi kata sandi Anda"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

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

          <button type="submit" className={styles['btn-primary']} style={{ marginTop: '16px' }} disabled={isLoading}>
            {isLoading ? 'Mengirim Kode OTP...' : 'Daftar Akun'}
            {!isLoading && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}