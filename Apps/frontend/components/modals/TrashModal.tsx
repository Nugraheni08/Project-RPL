'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useMapStore } from '../../store/mapStore';
import { showToast } from '../ui/Toast';
import styles from '@/styles/modals.module.css';

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour in milliseconds

function getRefillCooldownKey(stationId: string): string {
  return 'refill_cooldown_' + stationId;
}

function getRemainingCooldown(stationId: string): number {
  var key = getRefillCooldownKey(stationId);
  var stored = localStorage.getItem(key);
  if (!stored) return 0;
  var expiry = parseInt(stored, 10);
  var remaining = expiry - Date.now();
  return remaining > 0 ? remaining : 0;
}

function setRefillCooldown(stationId: string): void {
  var key = getRefillCooldownKey(stationId);
  var expiry = Date.now() + COOLDOWN_MS;
  localStorage.setItem(key, String(expiry));
}

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewClick: () => void;
  onReportClick: () => void;
  onRefillSuccess?: () => void;
}

/* Sample reviews data */
const SAMPLE_REVIEWS = [
  {
    id: 1,
    name: 'Alya Rahma',
    initials: 'AR',
    stars: 5,
    time: '3 days ago',
    text: 'Tempat sampahnya bersih dan terawat. Sangat membantu mengurangi sampah plastik di area kampus!',
  },
  {
    id: 2,
    name: 'Dimas Pratama',
    initials: 'DP',
    stars: 4,
    time: '1 week ago',
    text: 'Lokasinya strategis, tapi kadang suka penuh. Mungkin bisa ditambah jadwal pengangkutan.',
  },
  {
    id: 3,
    name: 'Siti Nurhaliza',
    initials: 'SN',
    stars: 5,
    time: '2 weeks ago',
    text: 'Good initiative! Saya selalu buang sampah di sini setelah jam kuliah. Keep it up!',
  },
];

export default function TrashModal({ isOpen, onClose, onReviewClick, onReportClick, onRefillSuccess }: TrashModalProps) {
  const { activeStation, setRouteTarget } = useMapStore();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Refill form state
  var [isRefillOpen, setIsRefillOpen] = useState(false);
  var [refillPhoto, setRefillPhoto] = useState<File | null>(null);
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [cooldownRemaining, setCooldownRemaining] = useState(0);
  var cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check cooldown when modal opens
  useEffect(function () {
    if (!isOpen || !activeStation) return;
    var remaining = getRemainingCooldown(activeStation.id || activeStation.name);
    setCooldownRemaining(remaining);

    if (remaining > 0) {
      cooldownTimerRef.current = setInterval(function () {
        setCooldownRemaining(function (prev) {
          var next = prev - 1000;
          if (next <= 0) {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return function () {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [isOpen, activeStation]);

  // Reset refill form when modal closes
  useEffect(function () {
    if (!isOpen) {
      setIsRefillOpen(false);
      setRefillPhoto(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  var handleRefillSubmit = async function () {
    if (!refillPhoto || !activeStation) return;

    setIsSubmitting(true);

    try {
      // 1) Get authenticated user
      var sessionResult = await supabase.auth.getSession();
      var userId = sessionResult.data.session?.user?.id;

      if (!userId) {
        showToast('Session expired. Silakan login ulang.', '❌');
        setIsSubmitting(false);
        return;
      }

      // 2) Upload photo to Supabase Storage
      var fileExt = refillPhoto.name.split('.').pop() || 'jpg';
      var fileName = userId + '/' + Date.now() + '.' + fileExt;

      var uploadResult = await supabase.storage
        .from('refill-proofs')
        .upload(fileName, refillPhoto, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadResult.error) {
        console.error('Upload error:', uploadResult.error);
        showToast('Gagal upload foto: ' + uploadResult.error.message, '❌');
        setIsSubmitting(false);
        return;
      }

      // 3) Get public URL
      var urlResult = supabase.storage.from('refill-proofs').getPublicUrl(fileName);
      var photoUrl = urlResult.data.publicUrl;

      // 4) Insert into refill_activity
      // NOTE: facility_id is NOT sent — bin IDs from the frontend are
      // hardcoded strings ("trash-0", etc.), not real DB UUIDs.
      // The column allows NULL (ON DELETE SET NULL).
      // Trigger handle_refill_points auto-adds +10 to users.total_points.
      var insertResult = await supabase
        .from('refill_activity')
        .insert({
          user_id: userId,
          activity_type: 'waste_deposit',
          points_earned: 10,
          volume_ml: 500,
          proof_image_url: photoUrl,
        });

      if (insertResult.error) {
        console.error('Insert error:', insertResult.error);

        if (insertResult.error.message.includes('Cooldown')) {
          showToast('⏳ Kamu sudah deposit di stasiun ini. Coba lagi nanti.', '⏳');
        } else {
          showToast('Gagal mencatat deposit: ' + insertResult.error.message, '❌');
        }
        setIsSubmitting(false);
        return;
      }

      // 5) Success — set cooldown & close form
      setRefillCooldown(activeStation.id || activeStation.name);
      setCooldownRemaining(COOLDOWN_MS);
      showToast('♻️ Waste deposit logged! +10 pts', '♻️');

      // 6) Notify parent to refresh dashboard stats
      if (onRefillSuccess) {
        onRefillSuccess();
      }

      setIsSubmitting(false);
      setIsRefillOpen(false);
      setRefillPhoto(null);

      // Start cooldown countdown
      cooldownTimerRef.current = setInterval(function () {
        setCooldownRemaining(function (prev) {
          var next = prev - 1000;
          if (next <= 0) {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            return 0;
          }
          return next;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Deposit submit exception:', err);
      showToast('Gagal: ' + (err.message || 'Unknown error'), '❌');
      setIsSubmitting(false);
    }
  };

  var formatCooldown = function (ms: number): string {
    if (ms <= 0) return '';
    var totalSeconds = Math.ceil(ms / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    if (minutes > 0) {
      return minutes + 'm ' + seconds + 's';
    }
    return seconds + 's';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenuId]);

  if (!isOpen || !activeStation) return null;

  var isWaterMode = activeStation.type === 'refill_air' || activeStation.type === 'water' || (activeStation.category || '').toLowerCase() === 'water refill' || (activeStation.category || '').toLowerCase() === 'water station';

  const avg = activeStation.rating || 5.0;
  const filled = Math.round(avg);
  const starsStr = '★'.repeat(filled) + '☆'.repeat(5 - filled);
  const reviewsCount = activeStation.reviews || 5;
  const stationName = activeStation.name || 'Waste Bin Fmipa Kering';
  const stationAddr = activeStation.addr || '1st floor fmipa kering';
  const fullAddr = activeStation.fullAddr || 'Jl. Raya Dramaga, Babakan, Kec. Dramaga, Kabupaten Bogor, Jawa Barat 16680';

  const handleGetDirections = () => {
    setRouteTarget(activeStation);
    onClose();
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleQuickRate = (_star: number) => {
    showToast('⭐ Open full review to submit your rating!');
    onReviewClick();
  };

  return (
    <div className={`${styles['modal-overlay']} ${styles.open}`} onClick={onClose}>
      <div className={styles['detail-sheet']} onClick={e => e.stopPropagation()}>
        <div className={styles['modal-handle']}></div>

        {/* ============ HEADER ============ */}
        <div className={styles['detail-header']}>
          <div className={styles['detail-title-section']}>
            <div className={styles['detail-title']}>{stationName}</div>
            <div className={styles['detail-subtitle']}>
              <span className={styles['detail-rating']}>{avg.toFixed(1)}</span>
              <span className={styles['detail-stars']}>{starsStr}</span>
              <span className={styles['detail-review-count']}>({reviewsCount})</span>
            </div>
            <span className={styles['detail-location']}>{stationAddr}</span>
          </div>

          <div className={styles['detail-header-actions']}>
            <button className={styles['detail-icon-btn']} aria-label="Bookmark">
              🔖
            </button>
            <button className={styles['detail-icon-btn']} onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {/* ============ QUICK ACTIONS ============ */}
        <div className={styles['detail-actions-row']}>
          <button className={`${styles['detail-pill']} ${styles.primary}`} onClick={handleGetDirections}>
            🗺 Directions
          </button>
          <button className={`${styles['detail-pill']} ${styles['outline-blue']}`} onClick={() => showToast('Navigasi dimulai!')}>
            ▲ Start
          </button>
          {cooldownRemaining > 0 ? (
            <button className={`${styles['detail-pill']} ${styles['outline-blue']}`} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              ⏳ {formatCooldown(cooldownRemaining)}
            </button>
          ) : (
            <button
              className={`${styles['detail-pill']} ${styles['outline-blue']}`}
              onClick={() => { setIsRefillOpen(!isRefillOpen); }}
            >
              📝 Log Refill
            </button>
          )}
          <button className={`${styles['detail-pill']} ${styles['outline-blue']}`} onClick={onReportClick}>
            ⚠ Report Issue
          </button>
        </div>

        {/* ============ REFILL FORM ============ */}
        {isRefillOpen ? (
          <div className={styles['refill-form']}>
            <div className={styles['refill-form-title']}>📸 Photo Proof Required</div>
            <p className={styles['refill-form-desc']}>Take a photo of your disposal to earn +10 points. Valid once per hour at this station.</p>

            <div className={styles['refill-photo-upload']}>
              {refillPhoto ? (
                <div className={styles['refill-photo-preview']}>
                  <img
                    src={URL.createObjectURL(refillPhoto)}
                    alt="Refill proof preview"
                    className={styles['refill-photo-img']}
                  />
                  <button
                    className={styles['refill-photo-remove']}
                    onClick={function () { setRefillPhoto(null); }}
                    disabled={isSubmitting}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className={styles['refill-photo-label']}>
                  <span className={styles['refill-photo-icon']}>📷</span>
                  <span className={styles['refill-photo-text']}>Tap to take a photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className={styles['refill-photo-input']}
                    onChange={function (e) {
                      var file = e.target.files?.[0];
                      if (file) setRefillPhoto(file);
                    }}
                    disabled={isSubmitting}
                  />
                </label>
              )}
            </div>

            <div className={styles['refill-form-actions']}>
              <button
                className={styles['refill-cancel-btn']}
                onClick={function () { setIsRefillOpen(false); setRefillPhoto(null); }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className={`${styles['refill-submit-btn']} ${isSubmitting || !refillPhoto ? styles.disabled : ''}`}
                onClick={handleRefillSubmit}
                disabled={isSubmitting || !refillPhoto}
              >
                {isSubmitting ? (
                  <span className={styles['refill-spinner']}>
                    <span className={styles['spinner']}></span>
                    Submitting...
                  </span>
                ) : (
                  '✅ Submit (+10 pts)'
                )}
              </button>
            </div>
          </div>
        ) : null}

        {/* ============ MEDIA ROW ============ */}
        <div className={styles['detail-media-row']}>
          <div className={styles['detail-photo-thumb']}>{isWaterMode ? '🚰' : '🗑️'}</div>
          <div className={styles['detail-add-photo']}>
            <span>📷</span>
            Add a photo
          </div>
        </div>

        {/* ============ ADDRESS CARD ============ */}
        <div className={styles['detail-address-banner']}>
          <span className={styles['detail-addr-pin']}>📍</span>
          <span className={styles['detail-addr-full']}>{fullAddr}</span>
        </div>

        {/* ============ REVIEW SUMMARY ============ */}
        <div className={styles['detail-review-summary']}>
          <div className={styles['detail-review-header']}>
            <span className={styles['detail-section-label']}>Reviews</span>
            <button className={styles['detail-add-review-link']} onClick={onReviewClick}>Add review</button>
          </div>

          <div className={styles['detail-review-big']}>
            <div className={styles['detail-avg-num']}>{avg.toFixed(1)}</div>
            <div className={styles['detail-bar-wrap']}>
              {[5, 4, 3, 2, 1].map((i) => {
                const pct = i === filled ? 100 : i < filled ? 80 : 0;
                return (
                  <div key={i} className={styles['detail-bar-row']}>
                    <span className={styles['detail-bar-lbl']}>{i}</span>
                    <div className={styles['detail-bar-track']}>
                      <div className={styles['detail-bar-fill']} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============ QUICK RATE ROW ============ */}
        <div className={styles['detail-rate-row']}>
          <div className={styles['detail-rate-avatar']}>ZZ</div>
          <div className={styles['detail-rate-stars']}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} className={styles['detail-star-empty']} onClick={() => handleQuickRate(s)}>
                ☆
              </button>
            ))}
          </div>
        </div>

        {/* ============ REVIEWS LIST ============ */}
        <div className={styles['detail-reviews-label']}>User Reviews</div>

        <div className={styles['comments-list']}>
          {SAMPLE_REVIEWS.map((review) => (
            <div key={review.id} className={styles['comment-item']}>
              <div className={styles['comment-avatar']}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#9FE1CB,#1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white' }}>
                  {review.initials}
                </div>
              </div>
              <div className={styles['comment-body']}>
                <div className={styles['comment-name']}>{review.name}</div>
                <div className={styles['comment-time']}>
                  {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)} · {review.time}
                </div>
                <div className={styles['comment-text']}>{review.text}</div>
              </div>

              {/* 3-dot menu dropdown */}
              <div className={styles['comment-menu-wrap']} ref={openMenuId === review.id ? menuRef : null}>
                <button className={styles['comment-more']} onClick={() => toggleMenu(review.id)}>
                  ⋯
                </button>
                <div className={`${styles['comment-dropdown']} ${openMenuId === review.id ? styles.open : ''}`}>
                  <button className={styles['comment-dropdown-item']} onClick={() => { setOpenMenuId(null); showToast('Review shared!'); }}>
                    ↗ Share Review
                  </button>
                  <button className={`${styles['comment-dropdown-item']} ${styles.danger}`} onClick={() => { setOpenMenuId(null); showToast('Report submitted.'); }}>
                    ⚠ Report Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ============ SEE ALL BUTTON ============ */}
        <button className={styles['btn-see-all']}>
          See all reviews
        </button>
      </div>
    </div>
  );
}