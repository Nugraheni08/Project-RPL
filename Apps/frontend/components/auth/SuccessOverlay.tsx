'use client';

import styles from '@/styles/auth.module.css';

interface SuccessOverlayProps {
  isVisible?: boolean;
  onGoToLogin?: () => void;
  onContinue?: () => void;
}

export default function SuccessOverlay({ isVisible, onGoToLogin, onContinue }: SuccessOverlayProps) {
  return (
    <div className={`${styles['success-overlay']} ${isVisible ? styles.show : ''}`}>
      <div className={`${styles['success-circle']} ${isVisible ? styles['check-anim'] : ''}`}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2>Akun Dibuat!</h2>
      <p>Selamat bergabung di Wmap.</p>
      <button 
        type="button" 
        className={styles['btn-white']} 
        onClick={onContinue}
      >
        Mulai Sekarang
      </button>
    </div>
  );
}