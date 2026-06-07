'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/history.module.css';

interface Activity {
  id: string;
  type: string;
  icon: string;
  name: string;
  time: string;
  pts: string;
  created_at: string;
}

export default function HistoryPage() {
  var router = useRouter();
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  var [monthlyRefills, setMonthlyRefills] = useState(0);
  var [monthlyWaste, setMonthlyWaste] = useState(0);
  var [monthlyPoints, setMonthlyPoints] = useState(0);
  var [activities, setActivities] = useState<Activity[]>([]);
  var [visibleCount, setVisibleCount] = useState(3);
  var [isSidebarOpen, setIsSidebarOpen] = useState(false);
  var [userId, setUserId] = useState<string>('');

  var TARGET_REFILLS = 50;
  var TARGET_WASTE = 20;
  var TARGET_POINTS = 1000;

  // ── Fetch data ———————————————————————————————————————————————
  var fetchHistory = useCallback(async function () {
    try {
      // ── Header-based token passing ──────────────────────────────
      var sessionRes = await supabase.auth.getSession();
      var token = sessionRes.data.session?.access_token;

      var res = await fetch('/api/user/history', {
        headers: {
          'Authorization': 'Bearer ' + (token || ''),
        },
      });
      var json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memuat riwayat.');

      setMonthlyRefills(json.monthlyRefills || 0);
      setMonthlyWaste(json.monthlyWaste || 0);
      setMonthlyPoints(json.monthlyPoints || 0);
      setActivities(json.activities || []);
    } catch (err: unknown) {
      var msg = err instanceof Error ? err.message : 'Gagal memuat.';
      setError(msg);
      console.error('HISTORY_FETCH_ERROR:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auth check + initial fetch ─────────────────────────────────
  useEffect(function () {
    var init = async function () {
      var sessionResult = await supabase.auth.getSession();
      var currentSession = sessionResult.data.session;
      if (!currentSession) {
        router.replace('/auth');
        return;
      }
      setUserId(currentSession.user.id);
      await fetchHistory();
    };
    init();
  }, [router, fetchHistory]);

  // ── Real-time subscription (depends on reactive userId) ────────
  useEffect(function () {
    if (!userId) return;

    var channelName = 'user-history-' + userId;

    var channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'refill_activity', filter: 'user_id=eq.' + userId },
        function () { fetchHistory(); }
      )
      .subscribe();

    return function () {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchHistory]);

  // ── Loading state ——————————————————————————————————————————————
  if (loading) {
    return (
      <div id="main-app">
        <div className={styles['history-page']} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>⏳</div>
            <p style={{ marginTop: '12px', fontSize: '14px', color: '#8B9E96', fontWeight: 600 }}>Memuat riwayat...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ————————————————————————————————————————————————
  if (error) {
    return (
      <div id="main-app">
        <div className={styles['history-page']} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#E24B4A', fontWeight: 700 }}>⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Progress percentages ———————————————————————————————————————
  var refillPct = Math.min(100, Math.round((monthlyRefills / TARGET_REFILLS) * 100));
  var wastePct = Math.min(100, Math.round((monthlyWaste / TARGET_WASTE) * 100));
  var pointsPct = Math.min(100, Math.round((monthlyPoints / TARGET_POINTS) * 100));

  var visibleActivities = activities.slice(0, visibleCount);
  var hasMore = visibleCount < activities.length;

  return (
    <div id="main-app">
      <div className={styles['history-page']}>
        {/* ==================== HEADER ==================== */}
        <div className={styles['hist-topbar']}>
          <button
            className={styles['hist-hamburger']}
            onClick={function () { setIsSidebarOpen(true); }}
            aria-label="Open Menu"
          >
            <span></span>
            <span></span>
          </button>

          <button className={styles['hist-bell']} aria-label="Notifikasi">
            🔔
            <span className={styles['hist-bell-dot']} />
          </button>
        </div>

        {/* ==================== MONTHLY GOALS ==================== */}
        <div className={styles['hist-goals-section']}>
          {/* Top Card — Refills */}
          <div className={styles['hist-goal-card']}>
            <div className={styles['hist-goal-icon-row']}>
              <div className={styles['hist-goal-icon-circle'] + ' ' + styles['blue-bg']}>💧</div>
              <span className={styles['hist-goal-label']}>Monthly Goal</span>
            </div>
            <div className={styles['hist-goal-value'] + ' ' + styles.blue}>{monthlyRefills} Refills</div>
            <div className={styles['hist-progress-bar']}>
              <div className={styles['hist-progress-fill'] + ' ' + styles.blue} style={{ width: refillPct + '%' }}></div>
            </div>
          </div>

          {/* Bottom Two Cards — Grid */}
          <div className={styles['hist-goals-grid']}>
            {/* Left — Waste Disposed */}
            <div className={styles['hist-goal-card-sm']}>
              <div className={styles['hist-goal-icon-row']}>
                <div className={styles['hist-goal-icon-circle'] + ' ' + styles['green-bg']}>🗑️</div>
                <span className={styles['hist-goal-label']}>Monthly Goal</span>
              </div>
              <div className={styles['hist-goal-value-sm'] + ' ' + styles.green}>{monthlyWaste} Waste Disposed</div>
              <div className={styles['hist-progress-bar']}>
                <div className={styles['hist-progress-fill'] + ' ' + styles.green} style={{ width: wastePct + '%' }}></div>
              </div>
            </div>

            {/* Right — Eco Points (solid green bg) */}
            <div className={styles['hist-goal-card-sm'] + ' ' + styles['green-bg-card']}>
              <div className={styles['hist-goal-icon-row']}>
                <div className={styles['hist-goal-icon-circle'] + ' ' + styles['green-solid']}>⭐</div>
                <span className={styles['hist-goal-label']}>Monthly Goal</span>
              </div>
              <div className={styles['hist-goal-value-sm'] + ' ' + styles.dark}>{monthlyPoints} Eco Points</div>
              <div className={styles['hist-progress-bar']}>
                <div className={styles['hist-progress-fill'] + ' ' + styles['dark-gray']} style={{ width: pointsPct + '%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RECENT ACTIVITY ==================== */}
        <div className={styles['hist-section']}>
          <div className={styles['hist-section-header']}>
            <span className={styles['hist-section-title']}>Recent Activity</span>
            <button className={styles['hist-view-all']}>View All</button>
          </div>

          <div className={styles['hist-activity-card']}>
            {visibleActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#8B9E96', fontSize: '13px' }}>
                Belum ada aktivitas bulan ini.
              </div>
            ) : (
              visibleActivities.map(function (item) {
                return (
                  <div key={item.id} className={styles['hist-act-item']}>
                    <div className={styles['hist-act-badge'] + ' ' + styles[item.type]}>
                      {item.icon}
                    </div>
                    <div className={styles['hist-act-info']}>
                      <div className={styles['hist-act-name']}>{item.name}</div>
                      <div className={styles['hist-act-time']}>{item.time}</div>
                    </div>
                    <div className={styles['hist-act-pts']}>{item.pts}</div>
                  </div>
                );
              })
            )}
          </div>

          {hasMore ? (
            <button
              className={styles['hist-view-all']}
              style={{
                display: 'block',
                width: '100%',
                marginTop: '10px',
                padding: '14px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: 700,
                color: '#1D9E75',
                background: '#E8ECF0',
                border: 'none',
                borderRadius: '14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onClick={function () { setVisibleCount(activities.length); }}
            >
              Load More Activity
            </button>
          ) : null}
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={function () { setIsSidebarOpen(false); }} />
    </div>
  );
}