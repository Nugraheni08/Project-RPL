'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useActivityStore } from '../../store/activityStore';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/leaderboard-page.module.css';

/* Top 3 podium labels */
var BADGE_LABELS = ['WINNER', '2ND', '3RD'];

export default function LeaderboardPage() {
  var router = useRouter();
  var {
    leaderboardData,
    userRank,
    fetchLeaderboard,
    fetchUserRank,
  } = useActivityStore();

  var [isLoading, setIsLoading] = useState(true);
  var [isSidebarOpen, setIsSidebarOpen] = useState(false);
  var [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(function () {
    var loadData = async function () {
      var result = await supabase.auth.getSession();
      if (!result.data.session) {
        router.replace('/auth');
        return;
      }

      var userId = result.data.session.user.id;
      setCurrentUserId(userId);

      // Fetch leaderboard (semua) + user rank secara paralel
      await Promise.all([
        fetchLeaderboard(50),
        fetchUserRank(userId),
      ]);

      setIsLoading(false);
    };
    loadData();
  }, [router, fetchLeaderboard, fetchUserRank]);

  if (isLoading) {
    return <div style={{ minHeight: '100vh', background: '#E8F5EF' }} />;
  }

  // Data dari store
  var allUsers = leaderboardData;

  // Top 3 untuk podium
  var top3 = allUsers.slice(0, 3);

  // Reorder: [rank2, rank1, rank3] untuk layout podium tengah
  var podiumOrder: typeof top3 = [];
  if (top3.length >= 2) podiumOrder.push(top3[1]); // rank 2 di kiri
  if (top3.length >= 1) podiumOrder.push(top3[0]); // rank 1 di tengah
  if (top3.length >= 3) podiumOrder.push(top3[2]); // rank 3 di kanan

  return (
    <div id="main-app">
      <div className={styles['lb-page']}>
        {/* ==================== HEADER ==================== */}
        <div className={styles['lb-topbar']}>
          <button
            className={styles['lb-hamburger']}
            onClick={function () { setIsSidebarOpen(true); }}
            aria-label="Open Menu"
          >
            <span></span>
            <span></span>
          </button>

          <div className={styles['lb-title']}>Leaderboard</div>

          <div className={styles['lb-header-right']}>
            <button className={styles['lb-bell']} aria-label="Notifikasi">
              🔔
              <span className={styles['lb-bell-dot']} />
            </button>
            <div className={styles['lb-rank-badge-mini']}>
              <span className={styles['lb-rank-badge-icon']}>🏅</span>
              <span className={styles['lb-rank-badge-text']}>
                Rank #{userRank > 0 ? userRank : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* ==================== TOP 3 PODIUM ==================== */}
        <div className={styles['lb-podium']}>
          {top3.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
              Belum ada data leaderboard
            </div>
          ) : (
            podiumOrder.map(function (user, idx) {
              // idx: 0=rank2(left), 1=rank1(center), 2=rank3(right)
              var isCenter = idx === 1;
              var rankNum = isCenter ? 1 : idx === 0 ? 2 : 3;
              var badgeLabel = BADGE_LABELS[rankNum - 1] || '';
              var initials = user.name.substring(0, 2).toUpperCase();

              return (
                <div
                  key={user.id}
                  className={styles['lb-podium-card'] + (isCenter ? ' ' + styles.center : '')}
                >
                  <div className={styles['lb-podium-avatar-wrap']}>
                    {isCenter ? (
                      <span className={styles['lb-trophy-icon']}>🏆</span>
                    ) : null}
                    <div className={styles['lb-podium-avatar'] + (isCenter ? ' ' + styles['center-avatar'] : '')}>
                      {initials}
                    </div>
                  </div>
                  <div className={styles['lb-podium-name']}>{user.name}</div>
                  <div className={styles['lb-podium-pts']}>{user.pts.toLocaleString()}</div>
                  <div className={styles['lb-podium-badge'] + ' ' + (isCenter ? styles.winner : styles['rank-label'])}>
                    {badgeLabel}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ==================== LEADERBOARD LIST ==================== */}
        <div className={styles['lb-section']}>
          <div className={styles['lb-section-header']}>
            <span className={styles['lb-section-title']}>Leaderboard</span>
            <button className={styles['lb-view-all']}>View All</button>
          </div>

          <div className={styles['lb-list-card']}>
            {allUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                Belum ada data
              </div>
            ) : (
              allUsers.map(function (user) {
                var isYou = currentUserId === user.id;
                var subLabel = isYou ? 'You' : user.role || 'ECO WARRIOR';
                var initials = user.name.substring(0, 2).toUpperCase();

                return (
                  <div
                    key={user.id}
                    className={styles['lb-row'] + (isYou ? ' ' + styles.highlight : '')}
                  >
                    <span className={styles['lb-rank-num']}>{user.rank}</span>
                    <div className={styles['lb-avatar-sm']}>{initials}</div>
                    <div className={styles['lb-user-info']}>
                      <div className={styles['lb-user-name']}>{user.name}</div>
                      <div className={styles['lb-user-sub'] + (isYou ? ' ' + styles.green : '')}>
                        {subLabel}
                      </div>
                    </div>
                    <div className={styles['lb-row-pts']}>{user.pts.toLocaleString()} POINTS</div>
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
