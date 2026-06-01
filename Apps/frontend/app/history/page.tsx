'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/history.module.css';

/* ============================================================
   DYNAMIC ACTIVITY DATA ARRAY
   ============================================================ */
var USER_ACTIVITIES = [
  {
    id: 1,
    type: 'water',
    icon: '💧',
    name: 'Refill water at Fmipa Kering',
    time: '2 hour ago',
    pts: '+10 pt',
  },
  {
    id: 2,
    type: 'water',
    icon: '💧',
    name: 'Refill water at Fapet',
    time: 'Yesterday',
    pts: '+10 pt',
  },
  {
    id: 3,
    type: 'recycle',
    icon: '♻️',
    name: 'Deposit Bottle Waste',
    time: 'Yesterday',
    pts: '+10 pt',
  },
  {
    id: 4,
    type: 'water',
    icon: '💧',
    name: 'Refill water at Common Classroom',
    time: '2 days ago',
    pts: '+10 pt',
  },
  {
    id: 5,
    type: 'recycle',
    icon: '♻️',
    name: 'Deposit Bottle Waste at Fahutan',
    time: '3 days ago',
    pts: '+10 pt',
  },
];

/* Dynamic counters */
var TOTAL_REFILLS = 42;
var TOTAL_WASTE = 10;
var TOTAL_ECO_POINTS = 430;

export default function HistoryPage() {
  var router = useRouter();
  var [isLoading, setIsLoading] = useState(true);
  var [visibleCount, setVisibleCount] = useState(3);
  var [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(function () {
    var checkAuth = async function () {
      var result = await supabase.auth.getSession();
      var currentSession = result.data.session;
      if (!currentSession) {
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

  var visibleActivities = USER_ACTIVITIES.slice(0, visibleCount);
  var hasMore = visibleCount < USER_ACTIVITIES.length;

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
            <div className={styles['hist-goal-value'] + ' ' + styles.blue}>{TOTAL_REFILLS} Refills</div>
            <div className={styles['hist-progress-bar']}>
              <div className={styles['hist-progress-fill'] + ' ' + styles.blue} style={{ width: '70%' }}></div>
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
              <div className={styles['hist-goal-value-sm'] + ' ' + styles.green}>{TOTAL_WASTE} Waste Disposed</div>
              <div className={styles['hist-progress-bar']}>
                <div className={styles['hist-progress-fill'] + ' ' + styles.green} style={{ width: '50%' }}></div>
              </div>
            </div>

            {/* Right — Eco Points (solid green bg) */}
            <div className={styles['hist-goal-card-sm'] + ' ' + styles['green-bg-card']}>
              <div className={styles['hist-goal-icon-row']}>
                <div className={styles['hist-goal-icon-circle'] + ' ' + styles['green-solid']}>⭐</div>
                <span className={styles['hist-goal-label']}>Monthly Goal</span>
              </div>
              <div className={styles['hist-goal-value-sm'] + ' ' + styles.dark}>{TOTAL_ECO_POINTS} Eco Points</div>
              <div className={styles['hist-progress-bar']}>
                <div className={styles['hist-progress-fill'] + ' ' + styles['dark-gray']} style={{ width: '43%' }}></div>
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
            {visibleActivities.map(function (item) {
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
            })}
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
              onClick={function () { setVisibleCount(USER_ACTIVITIES.length); }}
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