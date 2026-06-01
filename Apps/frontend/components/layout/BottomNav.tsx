'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/app.module.css';

interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function BottomNav({ activeTab = 'map', onTabChange }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className={styles['bottom-nav']}>
      <button 
        className={`${styles['nav-item']} ${activeTab === 'map' ? styles.active : ''}`}
        onClick={() => onTabChange && onTabChange('map')}
      >
        <div className={styles['nav-icon']}>🗺️</div>
        <span>Peta</span>
      </button>
      
      <Link
        href="/news"
        className={`${styles['nav-item']} ${pathname === '/news' ? styles.active : ''}`}
      >
        <div className={styles['nav-icon']}>📰</div>
        <span>Berita</span>
      </Link>
      
      <Link
        href="/aktivitas"
        className={`${styles['nav-item']} ${pathname === '/aktivitas' ? styles.active : ''}`}
      >
        <div className={styles['nav-icon']}>📊</div>
        <span>Aktivitas</span>
      </Link>
      
      <button 
        className={`${styles['nav-item']} ${activeTab === 'profile' ? styles.active : ''}`}
        onClick={() => onTabChange && onTabChange('profile')}
      >
        <div className={styles['nav-icon']}>👤</div>
        <span>Profil</span>
      </button>
    </nav>
  );
}
