'use client';

import { useState } from 'react';

export default function Legend() {
  // State untuk mengontrol apakah kotak legenda sedang terbuka atau tertutup
  const [isOpen, setIsOpen] = useState(true);

  // Tampilan ketika legenda dilipat (minimize)
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '16px',
          background: 'white',
          border: 'none',
          padding: '10px 14px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          fontWeight: 600,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        ℹ️ Legenda
      </button>
    );
  }

  // Tampilan ketika kotak legenda terbuka penuh
  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '16px',
      background: 'white',
      padding: '12px 16px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '150px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>Keterangan Peta</h4>
        <button 
          onClick={() => setIsOpen(false)}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '18px', 
            padding: 0,
            lineHeight: 1,
            color: 'var(--text-secondary)'
          }}
          aria-label="Tutup Legenda"
        >
          &times;
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
          <span style={{ fontSize: '16px' }}>💧</span>
          <span>Stasiun Air</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
          <span style={{ fontSize: '16px' }}>♻️</span>
          <span>Tempat Sampah</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
          <span style={{ 
            display: 'inline-block', 
            width: '14px', 
            height: '14px', 
            background: '#4285F4', 
            borderRadius: '50%', 
            border: '2px solid white', 
            boxShadow: '0 0 0 2px #4285F4' 
          }}></span>
          <span>Lokasi Anda</span>
        </div>
      </div>
    </div>
  );
}