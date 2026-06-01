'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import styles from '@/styles/notifications.module.css';

/* ============================================================
   DYNAMIC NOTIFICATION DATA ARRAY
   ============================================================ */
var NOTIFICATIONS = [
  {
    id: 1,
    group: 'TODAY',
    icon: '♻️',
    title: 'You\u2019ve earned 500 Carbon Points!',
    desc: 'Congratulations! Your recent recycling activity at Fmipa Kering has earned you bonus carbon credits.',
    time: '2h ago',
  },
  {
    id: 2,
    group: 'TODAY',
    icon: '📊',
    title: 'Weekly Impact Report Ready',
    desc: 'Your sustainability report for this week is now available. You saved 12 plastic bottles from landfills.',
    time: '5h ago',
  },
  {
    id: 3,
    group: 'TODAY',
    icon: '💧',
    title: 'Refill Streak: 7 Days!',
    desc: 'You\u2019ve refilled your bottle for 7 consecutive days. Keep up the great work for a bonus reward!',
    time: '8h ago',
  },
  {
    id: 4,
    group: 'YESTERDAY',
    icon: '🏆',
    title: 'New Achievement Unlocked: Eco Warrior',
    desc: 'You\u2019ve reached the Eco Warrior tier by earning over 2,000 eco points this month.',
    time: '1d ago',
  },
  {
    id: 5,
    group: 'YESTERDAY',
    icon: '🗑️',
    title: 'Waste Bin at Fapet Has Been Resolved',
    desc: 'The issue you reported at Fapet waste bin has been marked as resolved by the maintenance team.',
    time: '1d ago',
  },
  {
    id: 6,
    group: 'YESTERDAY',
    icon: '🌿',
    title: 'New Sustainability Initiative Launched',
    desc: 'A campus-wide composting program has been announced. Check the news section for details on how to join.',
    time: '1d ago',
  },
];

/* Group notifications by group label */
function groupNotifications(data: typeof NOTIFICATIONS) {
  var groups: { label: string; items: typeof NOTIFICATIONS }[] = [];
  var seen: { [key: string]: boolean } = {};

  data.forEach(function (item) {
    if (!seen[item.group]) {
      seen[item.group] = true;
      groups.push({ label: item.group, items: data.filter(function (n) { return n.group === item.group; }) });
    }
  });

  return groups;
}

export default function NotificationsPage() {
  var router = useRouter();
  var { session, displayName } = useAuthStore();
  var [isLoading, setIsLoading] = useState(true);

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

  var email = session?.user?.email || 'user@sample.com';
  var name = displayName || email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
  var initials = displayName
    ? displayName.substring(0, 2).toUpperCase()
    : email.substring(0, 2).toUpperCase();

  var grouped = groupNotifications(NOTIFICATIONS);

  return (
    <div id="main-app">
      <div className={styles['notif-page']}>
        {/* ==================== HEADER ==================== */}
        <div className={styles['nf-topbar']}>
          <button className={styles['nf-bell-btn']} aria-label="Notifications">
            🔔
          </button>

          <div className={styles['nf-title']}>Notifications</div>

          <div className={styles['nf-avatar']}>{initials}</div>
        </div>

        {/* ==================== NOTIFICATION GROUPS ==================== */}
        {grouped.map(function (group) {
          return (
            <div key={group.label} className={styles['nf-group']}>
              <div className={styles['nf-group-header']}>{group.label}</div>

              <div className={styles['nf-list']}>
                {group.items.map(function (item) {
                  return (
                    <div key={item.id} className={styles['nf-card']}>
                      <div className={styles['nf-icon-badge']}>{item.icon}</div>
                      <div className={styles['nf-card-content']}>
                        <div className={styles['nf-card-title']}>{item.title}</div>
                        <div className={styles['nf-card-desc']}>{item.desc}</div>
                      </div>
                      <span className={styles['nf-card-time']}>{item.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
