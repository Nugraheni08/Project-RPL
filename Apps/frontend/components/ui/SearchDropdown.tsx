'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '@/styles/profile.module.css';

// Data tiruan sementara untuk hasil pencarian (menyesuaikan script3.js)
interface SearchResult {
  id: string;
  name: string;
  addr: string;
  type: 'water' | 'trash';
}

const MOCK_DATA: SearchResult[] = [
  { id: '1', name: 'Stasiun Air Fapet', addr: 'Fakultas Peternakan IPB', type: 'water' },
  { id: '2', name: 'Fmipa Kering', addr: 'Fakultas MIPA IPB', type: 'water' },
  { id: '3', name: 'Common Classroom (CCR)', addr: 'Gedung CCR IPB', type: 'trash' },
  { id: '4', name: 'Perpustakaan LSI', addr: 'Gedung LSI IPB', type: 'water' },
];

export default function SearchDropdown() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  // Referensi untuk mendeteksi klik di luar komponen
  const wrapRef = useRef<HTMLDivElement>(null);

  // Efek untuk memfilter data setiap kali user mengetik
  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = MOCK_DATA.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.addr.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query]);

  // Efek untuk mendeteksi klik di luar area dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResult) => {
    alert(`Mengarahkan peta ke: ${item.name}`);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className={styles['map-search-wrap']} ref={wrapRef}>
      <span className={styles['map-search-icon']}>🔍</span>
      <input
        type="text"
        className={styles['map-search-input']}
        placeholder="Cari stasiun air atau tempat sampah..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length > 0 && setIsOpen(true)}
      />

      {isOpen && (
        <div className={`${styles['map-search-dropdown']} ${styles.open}`}>
          {results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                className={styles['dropdown-item']}
                onClick={() => handleSelect(item)}
              >
                <div className={styles['dropdown-item-icon']}>
                  {item.type === 'water' ? '💧' : '♻️'}
                </div>
                <div className={styles['dropdown-item-info']}>
                  <div className={styles['dropdown-item-name']}>{item.name}</div>
                  <div className={styles['dropdown-item-addr']}>{item.addr}</div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles['dropdown-empty']}>
              Lokasi tidak ditemukan
            </div>
          )}
        </div>
      )}
    </div>
  );
}