'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/app.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onReportIssue?: () => void;
}

export default function Sidebar({ isOpen, onClose, onReportIssue }: SidebarProps) {
  const router = useRouter();
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <>
      <div 
        className={`${styles['sidebar-overlay']} ${isOpen ? styles.open : ''}`} 
        id="sidebarOverlay" 
        onClick={onClose}
      ></div>
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`} id="sidebar">
        <div className={styles['sidebar-header']}>
          <img src="/logo-icon.png" alt="Wmap Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <span className={styles['sidebar-logo-text']}>Wmap</span>
        </div>
        <div className={styles['sidebar-search']}>
          <span className={styles['sidebar-search-icon']}>🔍</span>
          <input placeholder="Search Menu..." id="sidebarSearchInput" />
          <button>🔍</button>
        </div>
        <div className={styles['sidebar-menu']}>
          <button className={styles['sidebar-item']} onClick={() => { onClose(); router.push('/map'); }}>
            <span className={styles['sidebar-item-icon']}>🏠</span> Dashboard
          </button>
          <button className={styles['sidebar-item']} onClick={onClose}>
            <span className={styles['sidebar-item-icon']}>🗺</span> Facility Map
          </button>
          <button className={styles['sidebar-item']} onClick={() => { onClose(); router.push('/profil'); }}>
            <span className={styles['sidebar-item-icon']}>👤</span> Profil
          </button>

          <div 
            className={`${styles['sidebar-group']} ${openGroups['activity'] ? styles.open : ''}`}
            onClick={() => toggleGroup('activity')}
          >
            <button className={styles['sidebar-item']} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <span className={styles['sidebar-item-icon']}>⚡</span> Activity
              <span className={styles['sidebar-chevron']}>▾</span>
            </button>
            <div className={styles['sidebar-sub']}>
              <button className={styles['sidebar-sub-item']} onClick={(e) => { e.stopPropagation(); onClose(); router.push('/history'); }}>Refill History</button>
              <button className={styles['sidebar-sub-item']} onClick={(e) => { e.stopPropagation(); onClose(); router.push('/reports-history'); }}>Reports History</button>
              <button className={styles['sidebar-sub-item']} onClick={(e) => { e.stopPropagation(); onClose(); router.push('/review-history'); }}>Review History</button>
            </div>
          </div>

          <div 
            className={`${styles['sidebar-group']} ${openGroups['leaderboard'] ? styles.open : ''}`}
            onClick={() => toggleGroup('leaderboard')}
          >
            <button className={styles['sidebar-item']} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <span className={styles['sidebar-item-icon']}>🏆</span> Points &amp; Leaderboard
              <span className={styles['sidebar-chevron']}>▾</span>
            </button>
            <div className={styles['sidebar-sub']}>
              <button className={styles['sidebar-sub-item']} onClick={(e) => { e.stopPropagation(); onClose(); router.push('/my-points'); }}>My Points</button>
              <button className={styles['sidebar-sub-item']} onClick={(e) => { e.stopPropagation(); onClose(); router.push('/leaderboard'); }}>Leaderboard</button>
              <button className={styles['sidebar-sub-item']} onClick={(e) => e.stopPropagation()}>Achievements</button>
            </div>
          </div>

          <div 
            className={`${styles['sidebar-group']} ${openGroups['reports'] ? styles.open : ''}`}
            onClick={() => toggleGroup('reports')}
          >
            <button className={styles['sidebar-item']} style={{ width: '100%', justifyContent: 'flex-start' }}>
              <span className={styles['sidebar-item-icon']}>📋</span> Reports &amp; Feedback
              <span className={styles['sidebar-chevron']}>▾</span>
            </button>
            <div className={styles['sidebar-sub']}>
              <button className={styles['sidebar-sub-item']} onClick={(e) => { e.stopPropagation(); onClose(); if (onReportIssue) onReportIssue(); }}>Report Facility Issue</button>
              <button className={styles['sidebar-sub-item']} onClick={(e) => { e.stopPropagation(); onClose(); router.push('/reports-history'); }}>View Report</button>
              <button className={styles['sidebar-sub-item']} onClick={(e) => { e.stopPropagation(); onClose(); router.push('/feedback'); }}>Submit Review</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}