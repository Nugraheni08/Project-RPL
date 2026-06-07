'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/review-history.module.css';

interface Review {
  id: string;
  facility: string;
  stars: number;
  time: string;
  text: string;
  created_at: string;
}

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
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  var [totalReviews, setTotalReviews] = useState(0);
  var [reviews, setReviews] = useState<Review[]>([]);
  var [visibleCount, setVisibleCount] = useState(4);
  var [isSidebarOpen, setIsSidebarOpen] = useState(false);
  var [userId, setUserId] = useState<string>('');

  // ── Fetch reviews from API ────────────────────────────────────
  var fetchReviews = useCallback(async function () {
    try {
      // ── Header-based token passing ──────────────────────────────
      var sessionRes = await supabase.auth.getSession();
      var token = sessionRes.data.session?.access_token;

      var res = await fetch('/api/user/reviews', {
        headers: {
          'Authorization': 'Bearer ' + (token || ''),
        },
      });
      var json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal memuat ulasan.');

      setTotalReviews(json.totalReviews || 0);
      setReviews(json.reviews || []);
    } catch (err: unknown) {
      var msg = err instanceof Error ? err.message : 'Gagal memuat.';
      setError(msg);
      console.error('REVIEW_HISTORY_FETCH_ERROR:', err);
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
      await fetchReviews();
    };
    init();
  }, [router, fetchReviews]);

  // ── Real-time subscription (depends on reactive userId) ────────
  useEffect(function () {
    if (!userId) return;

    var channelName = 'user-reviews-' + userId;

    var channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reviews', filter: 'user_id=eq.' + userId },
        function () { fetchReviews(); }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'reviews', filter: 'user_id=eq.' + userId },
        function () { fetchReviews(); }
      )
      .subscribe();

    return function () {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchReviews]);

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <div id="main-app">
        <div className={styles['review-page']} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>⏳</div>
            <p style={{ marginTop: '12px', fontSize: '14px', color: '#8B9E96', fontWeight: 600 }}>Memuat ulasan...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <div id="main-app">
        <div className={styles['review-page']} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#E24B4A', fontWeight: 700 }}>⚠️ {error}</p>
          </div>
        </div>
      </div>
    );
  }

  var visibleReviews = reviews.slice(0, visibleCount);
  var hasMore = visibleCount < totalReviews;

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
              <div className={styles['rv-summary-count']}>{totalReviews}</div>
              <div className={styles['rv-summary-label']}>Total Reviews</div>
            </div>
          </div>
        </div>

        {/* ==================== SECTION TITLE ==================== */}
        <div className={styles['rv-section-title']}>Review History</div>

        {/* ==================== DYNAMIC REVIEW LIST ==================== */}
        <div className={styles['rv-list']}>
          {visibleReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#8B9E96', fontSize: '13px' }}>
              Belum ada ulasan yang ditulis.
            </div>
          ) : (
            visibleReviews.map(function (review) {
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
            })
          )}
        </div>

        {/* ==================== LOAD MORE ==================== */}
        {hasMore ? (
          <button
            className={styles['rv-load-more']}
            onClick={function () { setVisibleCount(totalReviews); }}
          >
            Load More History
          </button>
        ) : null}
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={function () { setIsSidebarOpen(false); }} />
    </div>
  );
}