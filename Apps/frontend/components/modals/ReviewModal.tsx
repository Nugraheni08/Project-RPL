'use client';

import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { showToast } from '../ui/Toast';
import styles from '@/styles/modals.module.css';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName?: string;
}

export default function ReviewModal({ isOpen, onClose, locationName = 'Waste Bin Fmipa Kering' }: ReviewModalProps) {
  const { displayName } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const userName = displayName || 'Ziggy Zagga';
  const initials = userName.substring(0, 2).toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showToast('Pilih rating dulu ya!', '⭐');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(function (resolve) { return setTimeout(resolve, 1000); });
      showToast('Ulasan berhasil dikirim! (+5 Poin)', '⭐');

      setRating(0);
      setHoverRating(0);
      setComment('');
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Gagal mengirim ulasan.', '⚠️');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles['review-screen'] + ' ' + styles.open}>
      {/* ============ HEADER ============ */}
      <div className={styles['review-screen-header']}>
        <button className={styles['review-screen-close']} onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className={styles['review-screen-title']}>{locationName}</div>
      </div>

      {/* ============ BODY ============ */}
      <form className={styles['review-screen-body']} onSubmit={handleSubmit}>
        {/* User Identity */}
        <div className={styles['review-screen-user']}>
          <div className={styles['review-screen-avatar']}>{initials}</div>
          <div className={styles['review-screen-username']}>{userName}</div>
        </div>

        {/* 5 Large Stars */}
        <div className={styles['review-screen-stars']}>
          {[1, 2, 3, 4, 5].map(function (star) {
            var isFilled = star <= (hoverRating || rating);
            var starClass = styles['review-screen-star'];
            if (isFilled) {
              starClass = starClass + ' ' + styles.filled;
            }
            return (
              <button
                key={star}
                type="button"
                className={starClass}
                onMouseEnter={function () { return setHoverRating(star); }}
                onMouseLeave={function () { return setHoverRating(0); }}
                onClick={function () { return setRating(star); }}
              >
                ★
              </button>
            );
          })}
        </div>

        {/* Text Area */}
        <textarea
          className={styles['review-screen-textarea']}
          placeholder="Choose a rating first, then add a review"
          value={comment}
          onChange={function (e) { return setComment(e.target.value); }}
          rows={5}
        />

        {/* Add Media Button */}
        <button type="button" className={styles['review-screen-media-btn']} onClick={function () { return showToast('Fitur upload foto coming soon!'); }}>
          📷 Add photos & videos
        </button>
      </form>

      {/* ============ FOOTER ============ */}
      <div className={styles['review-screen-footer']}>
        <button
          className={styles['review-screen-post-btn']}
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
}