'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/reports-history.module.css';

/* ============================================================
   DYNAMIC REPORTS DATA ARRAY
   ============================================================ */
var USER_REPORTS = [
  {
    id: 1,
    type: 'REFILL WATER',
    title: 'Refill water at Fahutan',
    desc: 'Mesin rusak, air tidak keluar.',
    status: 'IN PROGRESS',
    date: 'May 1, 2026',
    bannerIcon: '🚰',
    bannerStyle: 'water-bg',
  },
  {
    id: 2,
    type: 'WASTE BIN',
    title: 'Waste Bin at Fapet Full',
    desc: 'Tempat sampah sudah penuh dan belum diangkut.',
    status: 'RESOLVED',
    date: 'April 28, 2026',
    bannerIcon: '🗑️',
    bannerStyle: 'trash-bg',
  },
  {
    id: 3,
    type: 'REFILL WATER',
    title: 'Refill at Common Classroom',
    desc: 'Tekanan air rendah, perlu pengecekan pompa.',
    status: 'PENDING',
    date: 'April 25, 2026',
    bannerIcon: '💧',
    bannerStyle: 'water-bg',
  },
  {
    id: 4,
    type: 'WASTE BIN',
    title: 'Waste Bin at Rektorat Damaged',
    desc: 'Tutup tempat sampah hilang, perlu penggantian.',
    status: 'RESOLVED',
    date: 'April 20, 2026',
    bannerIcon: '♻️',
    bannerStyle: 'trash-bg',
  },
  {
    id: 5,
    type: 'REFILL WATER',
    title: 'Refill station at Fapet leaking',
    desc: 'Ada kebocoran kecil di pipa utama, air menetes terus.',
    status: 'IN PROGRESS',
    date: 'April 15, 2026',
    bannerIcon: '💧',
    bannerStyle: 'water-bg',
  },
];

/* Dynamic counters derived from array */
var TOTAL_ACTIVE = USER_REPORTS.filter(function (r) { return r.status === 'IN PROGRESS' || r.status === 'PENDING'; }).length;
var TOTAL_RESOLVED = USER_REPORTS.filter(function (r) { return r.status === 'RESOLVED'; }).length;

function getStatusClass(status: string): string {
  if (status === 'IN PROGRESS') return styles['in-progress'];
  if (status === 'RESOLVED') return styles.resolved;
  if (status === 'PENDING') return styles.pending;
  return '';
}

export default function ReportsHistoryPage() {
  var router = useRouter();
  var [isLoading, setIsLoading] = useState(true);
  var [visibleCount, setVisibleCount] = useState(4);
  var [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(function () {
    var checkAuth = async function () {
      var result = await supabase.auth.getSession();
      if (!result.data.session) {
        router.replace('/auth');
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return <div style={{ minHeight: '100vh', background: '#E8F5EF' }} />;
  }

  var visibleReports = USER_REPORTS.slice(0, visibleCount);
  var hasMore = visibleCount < USER_REPORTS.length;

  return (
    <div id="main-app">
      <div className={styles['reports-page']}>
        {/* ==================== HEADER ==================== */}
        <div className={styles['rp-topbar']}>
          <button
            className={styles['rp-hamburger']}
            onClick={function () { setIsSidebarOpen(true); }}
            aria-label="Back to Map"
          >
            <span></span>
            <span></span>
          </button>

          <button className={styles['rp-bell']} aria-label="Notifikasi">
            🔔
            <span className={styles['rp-bell-dot']} />
          </button>
        </div>

        {/* ==================== SUMMARY CARDS ==================== */}
        <div className={styles['rp-summary-grid']}>
          {/* Left — Active Reports */}
          <div className={styles['rp-summary-card'] + ' ' + styles.white}>
            <div className={styles['rp-summary-icon']}>⚠️</div>
            <div className={styles['rp-summary-value'] + ' ' + styles.green}>
              {TOTAL_ACTIVE} Active Reports
            </div>
          </div>

          {/* Right — Resolved (solid green bg) */}
          <div className={styles['rp-summary-card'] + ' ' + styles['green-bg']}>
            <div className={styles['rp-summary-icon']}>✅</div>
            <div className={styles['rp-summary-value'] + ' ' + styles.dark}>
              {TOTAL_RESOLVED} Resolved
            </div>
          </div>
        </div>

        {/* ==================== SECTION TITLE ==================== */}
        <div className={styles['rp-section-title']}>Reports History</div>

        {/* ==================== REPORTS LIST ==================== */}
        <div className={styles['rp-list']}>
          {visibleReports.map(function (report) {
            return (
              <div key={report.id} className={styles['rp-card']}>
                {/* Image Banner */}
                <div className={styles['rp-card-banner']}>
                  <div className={styles['rp-card-banner-img'] + ' ' + styles[report.bannerStyle]}>
                    {report.bannerIcon}
                  </div>
                  <div className={styles['rp-badge-pill']}>{report.type}</div>
                </div>

                {/* Card Body */}
                <div className={styles['rp-card-body']}>
                  <div className={styles['rp-card-row']}>
                    <div className={styles['rp-card-info']}>
                      <div className={styles['rp-card-title']}>{report.title}</div>
                      <div className={styles['rp-card-desc']}>{report.desc}</div>
                    </div>
                    <div className={styles['rp-status-pill'] + ' ' + getStatusClass(report.status)}>
                      {report.status}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={styles['rp-card-footer']}>
                  <span className={styles['rp-calendar-icon']}>📅</span>
                  <span className={styles['rp-date-text']}>{report.date}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================== LOAD MORE ==================== */}
        {hasMore ? (
          <button
            className={styles['rp-load-more']}
            onClick={function () { setVisibleCount(USER_REPORTS.length); }}
          >
            Load older reports
          </button>
        ) : null}
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={function () { setIsSidebarOpen(false); }} />
    </div>
  );
}