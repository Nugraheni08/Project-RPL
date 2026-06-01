'use client';

import styles from '@/styles/app.module.css';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

export default function Header({ onMenuClick, onProfileClick }: HeaderProps) {
  const { displayName } = useAuthStore();
  const initials = displayName
    ? displayName.substring(0, 2).toUpperCase()
    : 'AK';
  return (
    <header className={styles.header}>
      {/* Tombol Hamburger Menu Sidebar */}
      <button 
        className={styles.hamburger} 
        onClick={onMenuClick} 
        aria-label="Buka Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={styles['header-icons']}>
        {/* Tombol Notifikasi */}
        <button 
          className={`${styles['icon-btn']} ${styles.bell}`} 
          aria-label="Notifikasi"
          onClick={() => alert('Tidak ada notifikasi baru')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>

        {/* Avatar Profil Pengguna */}
        <div 
          className={styles.avatar} 
          onClick={onProfileClick} 
          style={{ cursor: 'pointer' }}
          title="Buka Profil"
        >
          <div className={styles['avatar-placeholder']}>{initials}</div>
        </div>
      </div>
    </header>
  );
}