'use client';

import { useRouter } from 'next/navigation';
import styles from '@/styles/auth.module.css';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <div className={`${styles.screen} ${styles.active}`} id="s-splash">
      <div className={styles['splash-logo-wrap']}>
        <img
          src="/logo-icon.png"
          alt="Wmap Logo"
          className={styles['splash-logo-img']}
        />
        <img
          src="/logo-text.png"
          alt="Wmap"
          className={styles['splash-logo-text-img']}
        />
        <div className={styles['splash-tagline']}>Sustain the future</div>
        <div className={styles['splash-dots']}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: '56px', left: 0, right: 0, padding: '0 28px' }}>
        <button className={styles['btn-primary']} onClick={() => router.push('/auth')}>
          Mulai
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}