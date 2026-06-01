'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/reports-history.module.css';

interface UserReport {
  id: string;
  type: string;
  location_ref: string;
  description: string;
  status: string;
  created_at: string;
  bannerIcon: string;
  bannerStyle: string;
}

function getStatusClass(status: string): string {
  if (status === 'IN PROGRESS') return styles['in-progress'];
  if (status === 'RESOLVED') return styles.resolved;
  if (status === 'PENDING') return styles.pending;
  return '';
}

function formatStatus(status: string): string {
  if (status === 'PENDING') return 'Pending';
  if (status === 'IN PROGRESS') return 'In Progress';
  if (status === 'RESOLVED') return 'Resolved';
  return status;
}

function formatType(type: string): string {
  const t = (type || '').toLowerCase();
  if (t.includes('refill') || t.includes('water')) return 'REFILL WATER';
  if (t.includes('sampah') || t.includes('waste') || t.includes('bin')) return 'WASTE BIN';
  return type.toUpperCase();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (_e) {
    return dateStr;
  }
}

export default function ReportsHistoryPage() {
  var router = useRouter();
  var [reports, setReports] = useState<UserReport[]>([]);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  var [isSidebarOpen, setIsSidebarOpen] = useState(false);
  var [visibleCount, setVisibleCount] = useState(4);

  // ── Auth check + fetch data ──────────────────────────────────
  useEffect(function () {
    var init = async function () {
      try {
        // 1. Cek session client-side
        var sessionResult = await supabase.auth.getSession();
        if (!sessionResult.data.session) {
          router.replace('/auth');
          return;
        }

        // 2. Fetch reports milik user ini dari API
        var res = await fetch('/api/reports/user');
        var json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal memuat laporan.');

        setReports(json.reports || []);
      } catch (err: unknown) {
        var msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        console.error('USER_REPORTS_FETCH_ERROR:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  // ── Dynamic summary counters ─────────────────────────────────
  var activeReports = reports.filter(function (r) {
    return r.status === 'IN PROGRESS' || r.status === 'PENDING';
  }).length;
  var resolvedReports = reports.filter(function (r) {
    return r.status === 'RESOLVED';
  }).length;

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <div id="main-app">
        <div className={styles['reports-page']} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>⏳</div>
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#8B9E96', fontWeight: 600 }}>Memuat laporan...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <div id="main-app">
        <div className={styles['reports-page']} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#E24B4A', fontWeight: 700, textAlign: 'center' }}>{error}</p>
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────
  if (reports.length === 0) {
    return (
      <div id="main-app">
        <div className={styles['reports-page']} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
          <div style={{ fontSize: '56px' }}>📋</div>
          <p style={{ marginTop: '12px', fontSize: '16px', fontWeight: 700, color: '#1a2e4a' }}>Belum ada laporan yang dikirim.</p>
          <p style={{ marginTop: '4px', fontSize: '12px', color: '#8B9E96', textAlign: 'center' }}>Laporan fasilitas yang Anda kirim akan muncul di sini.</p>
        </div>
      </div>
    );
  }

  var visibleReports = reports.slice(0, visibleCount);
  var hasMore = visibleCount < reports.length;

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
              {activeReports} Active Reports
            </div>
          </div>

          {/* Right — Resolved (solid green bg) */}
          <div className={styles['rp-summary-card'] + ' ' + styles['green-bg']}>
            <div className={styles['rp-summary-icon']}>✅</div>
            <div className={styles['rp-summary-value'] + ' ' + styles.dark}>
              {resolvedReports} Resolved
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
                  <div className={styles['rp-badge-pill']}>{formatType(report.type)}</div>
                </div>

                {/* Card Body */}
                <div className={styles['rp-card-body']}>
                  <div className={styles['rp-card-row']}>
                    <div className={styles['rp-card-info']}>
                      <div className={styles['rp-card-title']}>{report.location_ref || 'Lokasi tidak diketahui'}</div>
                      <div className={styles['rp-card-desc']}>{report.description}</div>
                    </div>
                    <div className={styles['rp-status-pill'] + ' ' + getStatusClass(report.status)}>
                      {formatStatus(report.status)}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={styles['rp-card-footer']}>
                  <span className={styles['rp-calendar-icon']}>📅</span>
                  <span className={styles['rp-date-text']}>{formatDate(report.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================== LOAD MORE ==================== */}
        {hasMore ? (
          <button
            className={styles['rp-load-more']}
            onClick={function () { setVisibleCount(reports.length); }}
          >
            Load older reports
          </button>
        ) : null}
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={function () { setIsSidebarOpen(false); }} />
    </div>
  );
}