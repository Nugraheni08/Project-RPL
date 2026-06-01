'use client';

import { useState } from 'react';
import styles from '@/styles/app.module.css';

export default function FilterRow() {
  // State lokal untuk menandai filter mana yang sedang aktif
  const [activeFilter, setActiveFilter] = useState('Semua');

  // Daftar filter yang tersedia (Disesuaikan dengan konteks kampus hijau)
  const filters = [
    { id: 'Semua', label: 'Semua', icon: '🌍' },
    { id: 'Air', label: 'Stasiun Air', icon: '💧' },
    { id: 'Sampah', label: 'Tempat Sampah', icon: '♻️' },
    { id: 'Fapet', label: 'Area Fapet', icon: '🐄' },
    { id: 'Fmipa', label: 'Area FMIPA', icon: '🔬' },
    { id: 'CCR', label: 'Gedung CCR', icon: '🏢' },
  ];

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
    
    // Nanti logika filternya bisa disambungkan ke mapStore atau API
    // alert(`Filter aktif: ${filterId}`);
  };

  return (
    <div 
      className={styles['filter-row']} 
      style={{ 
        display: 'flex', 
        gap: '10px', 
        padding: '12px 16px', 
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch', // Biar scroll halus di HP
        msOverflowStyle: 'none',  // Sembunyikan scrollbar di IE/Edge
        scrollbarWidth: 'none',   // Sembunyikan scrollbar di Firefox
      }}
    >
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleFilterClick(filter.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeFilter === filter.id ? 'none' : '1px solid #ddd',
            background: activeFilter === filter.id ? 'var(--green-mid, #2D7A52)' : 'white',
            color: activeFilter === filter.id ? 'white' : 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: activeFilter === filter.id ? '0 2px 8px rgba(45, 122, 82, 0.3)' : 'none'
          }}
        >
          <span>{filter.icon}</span>
          <span>{filter.label}</span>
        </button>
      ))}
    </div>
  );
}