'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useActivityStore } from '../../store/activityStore';
import styles from '@/styles/app.module.css';

export default function Leaderboard() {
  var router = useRouter();
  var { leaderboardData, fetchLeaderboard } = useActivityStore();
  var [isReady, setIsReady] = useState(false);

  useEffect(function () {
    var load = async function () {
      var sessionResult = await supabase.auth.getSession();
      if (!sessionResult.data.session) return;

      // Fetch leaderboard dari DB view user_rankings (top 3)
      await fetchLeaderboard(3);
      setIsReady(true);
    };
    load();
  }, [fetchLeaderboard]);

  // Fallback: jika data masih kosong, tampilkan skeleton kosong
  var data = leaderboardData.length > 0 ? leaderboardData.slice(0, 3) : [];

  return (
    <>
      <div className={styles['section-header']}>
        <div className={styles['section-title']}>Peringkat Minggu Ini</div>
        <div
          className={styles['view-all']}
          onClick={function () { router.push('/leaderboard'); }}
        >
          Lihat Semua
        </div>
      </div>

      <div className={styles['leaderboard-list']}>
        {data.length === 0 && !isReady ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
            Memuat...
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
            Belum ada data
          </div>
        ) : (
          data.map(function (user, index) {
            // Menentukan warna tulisan peringkat berdasarkan posisi (Juara 1, 2, 3)
            var rankClass = '';
            if (index === 0) rankClass = styles.gold;
            else if (index === 1) rankClass = styles.silver;
            else if (index === 2) rankClass = styles.bronze;

            return (
              <div key={user.id || index} className={styles['lb-item']}>
                <div className={`${styles['lb-rank']} ${rankClass}`}>
                  #{user.rank || index + 1}
                </div>

                <div className={styles['lb-avatar']}>
                  {/* Menampilkan huruf pertama dari nama pengguna sebagai avatar */}
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className={styles['lb-info']}>
                  <div className={styles['lb-name']}>{user.name}</div>
                  <div className={styles['lb-role']}>{user.role || 'ECO WARRIOR'}</div>
                </div>

                <div>
                  <div className={styles['lb-pts']}>
                    {/* Memformat angka agar menggunakan titik ribuan bergaya Indonesia */}
                    {user.pts.toLocaleString('id-ID')}
                  </div>
                  <div className={styles['lb-pts-lbl']}>PTS</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
