'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toast';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/feedback.module.css';

export default function FeedbackPage() {
  var router = useRouter();
  var [isLoading, setIsLoading] = useState(true);
  var [isSidebarOpen, setIsSidebarOpen] = useState(false);
  var [rating, setRating] = useState(0);
  var [hoverRating, setHoverRating] = useState(0);
  var [feedback, setFeedback] = useState('');
  var [isAnonymous, setIsAnonymous] = useState(true);
  var [isSubmitting, setIsSubmitting] = useState(false);

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

  var handleSubmit = async function () {
    if (rating === 0) {
      showToast('Please tap a star rating first!', '⭐');
      return;
    }

    setIsSubmitting(true);

    try {
      // ── Header-based token passing ──────────────────────────────
      var sessionRes = await supabase.auth.getSession();
      var token = sessionRes.data.session?.access_token;

      var res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (token || ''),
        },
        body: JSON.stringify({
          rating: rating,
          comment: feedback,
          isAnonymous: isAnonymous,
        }),
      });

      var json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengirim feedback.');

      showToast(json.message || 'Feedback sent! Thank you for your input.', '✅');
      setRating(0);
      setHoverRating(0);
      setFeedback('');
      setIsAnonymous(true);
    } catch (err: any) {
      console.error('FEEDBACK_SUBMIT_ERROR:', err);
      showToast(err.message || 'Failed to send feedback. Please try again.', '❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  var handleCancel = function () {
    setRating(0);
    setHoverRating(0);
    setFeedback('');
    setIsAnonymous(true);
  };

  return (
    <div id="main-app">
      <div className={styles['feedback-page']}>
        {/* ==================== HEADER ==================== */}
        <div className={styles['fb-topbar']}>
          <button
            className={styles['fb-hamburger']}
            onClick={function () { setIsSidebarOpen(true); }}
            aria-label="Open Menu"
          >
            <span></span>
            <span></span>
          </button>

          <button className={styles['fb-bell']} aria-label="Notifikasi">
            🔔
            <span className={styles['fb-bell-dot']} />
          </button>
        </div>

        {/* ==================== TITLE ==================== */}
        <div className={styles['fb-title-section']}>
          <div className={styles['fb-title']}>We value your input</div>
          <div className={styles['fb-subtitle']}>
            Your feedback helps us refine Wmap and accelerate our collective sustainability goals.
          </div>
        </div>

        {/* ==================== FEEDBACK FORM CARD ==================== */}
        <div className={styles['fb-form-card']}>
          {/* Overall Experience */}
          <div className={styles['fb-field']}>
            <div className={styles['fb-label']}>Overall Experience</div>
            <div className={styles['fb-stars-row']}>
              {[1, 2, 3, 4, 5].map(function (star) {
                var isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    className={styles['fb-star'] + (isFilled ? ' ' + styles.filled : '')}
                    onMouseEnter={function () { setHoverRating(star); }}
                    onMouseLeave={function () { setHoverRating(0); }}
                    onClick={function () { setRating(star); }}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <div className={styles['fb-rate-hint']}>Tap to rate your satisfaction</div>
          </div>

          {/* Improvement Input */}
          <div className={styles['fb-field']}>
            <div className={styles['fb-label']}>How can we improve?</div>
            <textarea
              className={styles['fb-textarea']}
              placeholder="Tell us what's working and what's not...."
              value={feedback}
              onChange={function (e) { setFeedback(e.target.value); }}
              rows={5}
            />
          </div>

          {/* Anonymity Toggle */}
          <div className={styles['fb-field']}>
            <div className={styles['fb-toggle-row']}>
              <span className={styles['fb-toggle-icon']}>👁️‍🗨️</span>
              <div className={styles['fb-toggle-info']}>
                <div className={styles['fb-toggle-label']}>Submit Anonymously</div>
                <div className={styles['fb-toggle-sub']}>Identity hidden from team.</div>
              </div>
              <div
                className={styles['fb-toggle-switch'] + (isAnonymous ? '' : ' ' + styles.off)}
                onClick={function () { setIsAnonymous(!isAnonymous); }}
              >
                <div className={styles['fb-toggle-track']}></div>
                <div className={styles['fb-toggle-thumb']}></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles['fb-actions']}>
            <button
              className={styles['fb-submit-btn']}
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={isSubmitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </button>
            <button className={styles['fb-cancel-btn']} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>

        {/* ==================== BOTTOM INFO BANNER ==================== */}
        <div className={styles['fb-banner']}>
          <div className={styles['fb-banner-icon']}>✨</div>
          <div className={styles['fb-banner-title']}>Impact Mindset</div>
          <div className={styles['fb-banner-text']}>
            Your feedback optimizes our carbon algorithms, making the planet greener
          </div>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={function () { setIsSidebarOpen(false); }} />
    </div>
  );
}