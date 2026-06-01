'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/review-history.module.css';

/* ============================================================
   DYNAMIC REVIEW DATA ARRAY
   ============================================================ */
var USER_REVIEWS = [
  {
    id: 1,
    facility: 'Waste Bin at SC Fmipa',
    stars: 5,
    time: '2 day ago',
    text: 'Tempat sampahnya bersih dan terawat. Sangat membantu mengurangi sampah plastik di area kampus!',
  },
  {
    id: 2,
    facility: 'Refill Station Fapet',
    stars: 4,
    time: '5 day ago',
    text: 'Airnya segar dan lancar. Cuma kadang antriannya agak panjang pas jam istirahat.',
  },
  {
    id: 3,
    facility: 'Refill Station at Common Classroom',
    stars: 5,
    time: '1 week ago',
    text: 'Lokasi strategis, selalu saya pakai setelah kuliah. Mesinnya selalu bersih!',
  },
  {
    id: 4,
    facility: 'Waste Bin at Fahutan',
    stars: 3,
    time: '1 week ago',
    text: 'Cukup membantu, tapi kadang bau karena jadwal pengangkutan kurang sering.',
  },
  {
    id: 5,
    facility: 'Refill Station at Rektorat',
    stars: 5,
    time: '2 week ago',
    text: 'Air dingin dan segar banget. Cocok buat refill setelah olahraga di sekitar rektorat.',
  },
  {
    id: 6,
    facility: 'Waste Bin at Fapet',
    stars: 4,
    time: '3 week ago',
    text: 'Penempatannya strategis di dekat kantin, jadi mudah dijangkau setelah makan.',
  },
];

/* Dynamically compute total count */
var TOTAL_REVIEWS = USER_REVIEWS.length;

/* Render dynamic star component */
function StarRating(props: { stars: number }) {
  var stars = props.stars;
  var items = [];
  for (var i = 0; i < 5; i++) {
    if (i < stars) {
      items.push(
        <span key={i} className={styles['rv-star-filled']}>★</span>
      );
    } else {
      items.push(
        <span key={i} className={styles['rv-star-empty']}>☆</span>
      );
    }
  }
  return <div className={styles['rv-card-stars']}>{items}</div>;
}

export default function ReviewHistoryPage() {
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

  var visibleReviews = USER_REVIEWS.slice(0, visibleCount);
  var hasMore = visibleCount < TOTAL_REVIEWS;

  return (
    <div id="main-app">
      <div className={styles['review-page']}>
        {/* ==================== HEADER ==================== */}
        <div className={styles['rv-topbar']}>
          <button
            className={styles['rv-hamburger']}
            onClick={function () { setIsSidebarOpen(true); }}
            aria-label="Open Menu"
          >
            <span></span>
            <span></span>
          </button>

          <button className={styles['rv-bell']} aria-label="Notifikasi">
            🔔
            <span className={styles['rv-bell-dot']} />
          </button>
        </div>

        {/* ==================== SUMMARY CARD ==================== */}
        <div className={styles['rv-summary']}>
          <div className={styles['rv-summary-card']}>
            <div className={styles['rv-summary-icon-badge']}>🔍</div>
            <div className={styles['rv-summary-info']}>
              <div className={styles['rv-summary-count']}>{TOTAL_REVIEWS}</div>
              <div className={styles['rv-summary-label']}>Total Reviews</div>
            </div>
          </div>
        </div>

        {/* ==================== SECTION TITLE ==================== */}
        <div className={styles['rv-section-title']}>Review History</div>

        {/* ==================== DYNAMIC REVIEW LIST ==================== */}
        <div className={styles['rv-list']}>
          {visibleReviews.map(function (review) {
            return (
              <div key={review.id} className={styles['rv-card']}>
                <div className={styles['rv-card-title']}>{review.facility}</div>

                <div className={styles['rv-card-rating-row']}>
                  <StarRating stars={review.stars} />
                  <span className={styles['rv-card-time']}>{review.time}</span>
                </div>

                <div className={styles['rv-card-text']}>{review.text}</div>
              </div>
            );
          })}
        </div>

        {/* ==================== LOAD MORE ==================== */}
        {hasMore ? (
          <button
            className={styles['rv-load-more']}
            onClick={function () { setVisibleCount(TOTAL_REVIEWS); }}
          >
            Load More History
          </button>
        ) : null}
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={function () { setIsSidebarOpen(false); }} />
    </div>
  );
}