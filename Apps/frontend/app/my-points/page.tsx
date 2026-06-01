'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useActivityStore } from '../../store/activityStore';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/my-points.module.css';

export default function MyPointsPage() {
  var router = useRouter();
  var {
    userPoints,
    userRank,
    recentActivities,
    fetchUserRank,
    fetchRecentActivities,
  } = useActivityStore();

  var [isLoading, setIsLoading] = useState(true);
  var [isSidebarOpen, setIsSidebarOpen] = useState(false);

  var [achievements, setAchievements] = useState<any[]>([]);

  useEffect(function () {
    var loadData = async function () {
      var result = await supabase.auth.getSession();
      if (!result.data.session) {
        router.replace('/auth');
        return;
      }

      var userId = result.data.session.user.id;

      // Fetch rank, recent activities, dan achievements dari API
      var apiRes = await fetch('/api/user/dashboard');
      var apiJson = await apiRes.json();
      if (apiRes.ok && apiJson.achievements) {
        setAchievements(apiJson.achievements);
      }

      await Promise.all([
        fetchUserRank(userId),
        fetchRecentActivities(userId, 10),
      ]);

      setIsLoading(false);
    };
    loadData();
  }, [router, fetchUserRank, fetchRecentActivities]);

  if (isLoading) {
    return <div style={{ minHeight: '100vh', background: '#E8F5EF' }} />;
  }

  // Data dari store
  var points = userPoints;
  var rank = userRank;
  var activities = recentActivities;

  // Progress bar: asumsikan target 3000 pts untuk "Sustainability Sage"
  var TARGET_PTS = 3000;
  var progressPercent = Math.min(100, Math.round((points / TARGET_PTS) * 100));
  var remaining = Math.max(0, TARGET_PTS - points);

  return (
    <div id="main-app">
      <div className={styles['points-page']}>
        {/* ==================== HEADER ==================== */}
        <div className={styles['mp-topbar']}>
          <button
            className={styles['mp-hamburger']}
            onClick={function () { setIsSidebarOpen(true); }}
            aria-label="Open Menu"
          >
            <span></span>
            <span></span>
          </button>

          <button className={styles['mp-bell']} aria-label="Notifikasi">
            🔔
            <span className={styles['mp-bell-dot']} />
          </button>
        </div>

        {/* ==================== POINTS OVERVIEW CARD ==================== */}
        <div className={styles['mp-overview-card']}>
          {/* Top Row */}
          <div className={styles['mp-overview-top']}>
            <div className={styles['mp-overview-left']}>
              <div className={styles['mp-badge-row']}>
                <span className={styles['mp-badge-icon']}>⭐</span>
                <span className={styles['mp-badge-label']}>Eco Warrior</span>
              </div>
              <div className={styles['mp-total-label']}>Total Point</div>
              <div className={styles['mp-total-value']}>{points.toLocaleString('id-ID')} pts</div>
            </div>

            <div className={styles['mp-rank-card']}>
              <span className={styles['mp-medal-icon']}>🏅</span>
              <span className={styles['mp-rank-badge']}>
                RANK #{rank > 0 ? rank : '-'}
              </span>
            </div>
          </div>

          {/* Progress Section */}
          <div className={styles['mp-overview-divider']}></div>
          <div className={styles['mp-progress-info']}>
            <span className={styles['mp-progress-label']}>Progress to Sustainability Sage</span>
            <span className={styles['mp-progress-remaining']}>{remaining.toLocaleString('id-ID')} pts left</span>
          </div>
          <div className={styles['mp-progress-bar']}>
            <div
              className={styles['mp-progress-fill']}
              style={{ width: progressPercent + '%' }}
            ></div>
          </div>
        </div>

        {/* ==================== IMPACT SUMMARY ==================== */}
        <div className={styles['mp-section']}>
          <div className={styles['mp-section-title']}>Impact Summary</div>

          <div className={styles['mp-impact-grid']}>
            <div className={styles['mp-impact-card']}>
              <div className={styles['mp-impact-label']}>CO2 Offset</div>
              <div className={styles['mp-impact-value']}>{points.toLocaleString('id-ID')} kg</div>
            </div>
            <div className={styles['mp-impact-card']}>
              <div className={styles['mp-impact-label']}>Water Saved</div>
              <div className={styles['mp-impact-value']}>{Math.round(points * 0.18)}L</div>
            </div>
          </div>

          <div className={styles['mp-callout-banner']}>
            <div className={styles['mp-callout-text']}>
              Your activity this month is equivalent to planting {Math.max(1, Math.round(points / 600))} new trees
            </div>
          </div>
        </div>

        {/* ==================== ACHIEVEMENTS ==================== */}
        <div className={styles['mp-section']}>
          <div className={styles['mp-section-title']}>Achievements</div>
          <div className={styles['mp-activity-card']}>
            {achievements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#999' }}>
                Belum ada achievement
              </div>
            ) : (
              achievements.map(function (ach) {
                return (
                  <div key={ach.id} className={styles['mp-act-item']} style={{ opacity: ach.unlocked ? 1 : 0.4 }}>
                    <div className={styles['mp-act-badge'] + ' ' + (ach.unlocked ? styles.water : '')} style={{ fontSize: '22px' }}>
                      {ach.icon}
                    </div>
                    <div className={styles['mp-act-info']}>
                      <div className={styles['mp-act-name']}>{ach.name}</div>
                      <div className={styles['mp-act-time']}>{ach.desc}</div>
                    </div>
                    <div className={styles['mp-act-pts']} style={{ color: ach.unlocked ? '#1D9E75' : '#ccc' }}>
                      {ach.unlocked ? '✅' : '🔒'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ==================== RECENT ACTIVITY ==================== */}
        <div className={styles['mp-section']}>
          <div className={styles['mp-section-header']}>
            <span className={styles['mp-section-title']}>Recent Activity</span>
            <button className={styles['mp-view-all']}>View All</button>
          </div>

          <div className={styles['mp-activity-card']}>
            {activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#999' }}>
                Belum ada aktivitas
              </div>
            ) : (
              activities.map(function (item, index) {
                var typeClass = item.isRecycle ? 'recycle' : 'water';
                return (
                  <div key={index} className={styles['mp-act-item']}>
                    <div className={styles['mp-act-badge'] + ' ' + styles[typeClass]}>
                      {item.icon}
                    </div>
                    <div className={styles['mp-act-info']}>
                      <div className={styles['mp-act-name']}>{item.name}</div>
                      <div className={styles['mp-act-time']}>{item.time}</div>
                    </div>
                    <div className={styles['mp-act-pts']}>{item.pts}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={function () { setIsSidebarOpen(false); }} />
    </div>
  );
}
