'use client';

import { useState, useEffect } from 'react';

// Fungsi bantuan yang bisa di-import dan dipanggil dari file mana saja
export function showToast(message: string, icon: string = '✅') {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('show-toast', { detail: { message, icon } });
    window.dispatchEvent(event);
  }
}

export default function Toast() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState('✅');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      setMessage(customEvent.detail.message);
      setIcon(customEvent.detail.icon || '✅');
      setIsVisible(true);

      // Reset timer jika ada notifikasi baru masuk sebelum yang lama hilang
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    window.addEventListener('show-toast', handleToast);
    
    return () => {
      window.removeEventListener('show-toast', handleToast);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: isVisible ? '20px' : '-100px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--green, #1D9E75)',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '30px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 9999,
      fontSize: '13px',
      fontWeight: 600,
      transition: 'top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease',
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' : 'none',
    }}>
      <span style={{ fontSize: '16px' }}>{icon}</span>
      <span>{message}</span>
    </div>
  );
}