'use client';

  import { useEffect, useRef, useState } from 'react';
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

  interface Review {
    id: string;
    user_name: string;
    user_avatar?: string;
    stars: number;
    comment: string;
    created_at: string;
  }

  interface StationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReportClick: () => void;
    onReviewClick: () => void;
    onRefillSuccess?: () => void;
  }

  export default function StationModal({ isOpen, onClose, onReportClick, onReviewClick, onRefillSuccess }: StationModalProps) {
    const { activeStation, setRouteTarget } = useMapStore();
    const miniMapContainer = useRef<HTMLDivElement>(null);

    // Refill form state
    var [isRefillOpen, setIsRefillOpen] = useState(false);
    var [refillPhoto, setRefillPhoto] = useState<File | null>(null);
    var [isSubmitting, setIsSubmitting] = useState(false);
    var [cooldownRemaining, setCooldownRemaining] = useState(0);
    var cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Review state
    var [reviews, setReviews] = useState<Review[]>([]);
    var [reviewsLoading, setReviewsLoading] = useState(false);
    var channelRef = useRef<any>(null);

    // ── Fetch reviews from DB + subscribe to real-time ──────────
    useEffect(function () {
      if (!isOpen || !activeStation) return;

      var fetchReviews = async function () {
        setReviewsLoading(true);
        try {
          const { data, error } = await supabase
            .from('reviews')
            .select('id, stars, comment, created_at, users!reviews_user_id_fkey(username)')
            .order('created_at', { ascending: false })
            .limit(20);

          if (error) {
            console.error('Fetch reviews error:', error);
            return;
          }

          var mapped: Review[] = (data || []).map(function (r: any) {
            return {
              id: r.id,
              user_name: r.users?.username || 'Anonim',
              stars: r.stars,
              comment: r.comment || '',
              created_at: r.created_at,
            };
          });
          setReviews(mapped);
        } catch (err) {
          console.error('Fetch reviews exception:', err);
        } finally {
          setReviewsLoading(false);
        }
      };

      fetchReviews();

      // ── Subscribe to real-time changes ──────────────────────────
      var channel = supabase
        .channel('reviews-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'reviews' },
          function () {
            fetchReviews();
          }
        )
        .subscribe();

      channelRef.current = channel;

      return function () {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    }, [isOpen, activeStation]);

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
        var insertResult = await supabase
          .from('refill_activity')
          .insert({
            user_id: userId,
            activity_type: 'refill',
            points_earned: 10,
            volume_ml: 500,
            proof_image_url: photoUrl,
          });

        if (insertResult.error) {
          console.error('Insert error:', insertResult.error);

          // Cooldown violation (trigger enforce_refill_cooldown)
          if (insertResult.error.message.includes('Cooldown')) {
            showToast('⏳ Kamu sudah refill di stasiun ini. Coba lagi nanti.', '⏳');
          } else {
            showToast('Gagal mencatat refill: ' + insertResult.error.message, '❌');
          }
          setIsSubmitting(false);
          return;
        }

        // 5) Success — set cooldown & close form
        setRefillCooldown(activeStation.id || activeStation.name);
        setCooldownRemaining(COOLDOWN_MS);
        showToast('💧 Refill logged! +10 pts', '💧');

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
        console.error('Refill submit exception:', err);
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

    var stationId = activeStation?.id || activeStation?.name || 'unknown';

    // ── Compute rating stats ───────────────────────────────────────
    var avg = activeStation?.rating || 5.0;
    if (reviews.length > 0) {
      var totalStars = reviews.reduce(function (s, r) { return s + r.stars; }, 0);
      avg = totalStars / reviews.length;
    }
    var filled = Math.round(avg);
    var stars = '★'.repeat(filled) + '☆'.repeat(5 - filled);
    var reviewsCount = reviews.length || (activeStation?.reviews || 0);

    // Rating breakdown bars (1-5)
    var starCounts = [0, 0, 0, 0, 0]; // index 0=star1, 4=star5
    reviews.forEach(function (r) {
      if (r.stars >= 1 && r.stars <= 5) starCounts[r.stars - 1]++;
    });
    var maxCount = Math.max(1, Math.max.apply(null, starCounts));
    var breakdown = [5, 4, 3, 2, 1].map(function (star) {
      var count = starCounts[star - 1];
      return { star: star, count: count, pct: Math.round((count / maxCount) * 100) };
    });

    // Recent comments (last 5)
    var recentReviews = reviews.slice(0, 5);

    useEffect(() => {
      if (!isOpen || !activeStation || !miniMapContainer.current) return;
      
      var miniContainer = miniMapContainer.current;
      let miniMap: any = null;

      const initMiniMap = async () => {
        const L = (await import('leaflet')).default;
        
        if (!miniContainer) return;

        if ((miniContainer as any)._leaflet_id) {
          miniContainer.innerHTML = '';
          (miniContainer as any)._leaflet_id = null;
        }
        
        miniMap = L.map(miniContainer, {
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false,
          attributionControl: false
        }).setView([activeStation.lat, activeStation.lng], 17);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(miniMap);

        const colors: any = { active: '#1D9E75', inactive: '#E24B4A', repair: '#C17B42' };
        const c = colors[activeStation.status] || '#1D9E75';
        const icon = L.divIcon({
          className: '',
          html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
            <div style="background:white;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:3px solid ${c};box-shadow:0 4px 14px rgba(0,0,0,0.2);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="${c}"><path d="M12 2C6 9 4 13 4 16a8 8 0 0016 0c0-3-2-7-8-14z"/></svg>
            </div>
            <div style="width:2px;height:10px;background:${c};margin-top:-1px;"></div>
            <div style="width:8px;height:8px;border-radius:50%;background:${c};margin-top:-1px;"></div>
          </div>`,
          iconSize: [44, 64], iconAnchor: [22, 64], popupAnchor: [0, -64]
        });

        L.marker([activeStation.lat, activeStation.lng], { icon }).addTo(miniMap);
        setTimeout(() => miniMap.invalidateSize(), 100);
      };

      initMiniMap();

      return () => {
        if (miniMap) {
          miniMap.off();
          miniMap.remove();
        }
      };
    }, [isOpen, activeStation]);

    // Helper: relatif time
    var getRelativeTime = function (dateStr: string): string {
      if (!dateStr) return '';
      var diff = Date.now() - new Date(dateStr).getTime();
      var hrs = Math.floor(diff / 3600000);
      if (hrs < 1) return 'Baru saja';
      if (hrs < 24) return hrs + ' jam lalu';
      var days = Math.floor(hrs / 24);
      if (days < 7) return days + ' hari lalu';
      return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Inisial untuk avatar
    var getInitials = function (name: string): string {
      return (name || '?').substring(0, 2).toUpperCase();
    };

    if (!isOpen || !activeStation) return null;

    return (
      <div className={`${styles['modal-overlay']} ${styles.open}`} onClick={onClose}>
        <div className={styles['modal-sheet']} style={{ padding: '0 0 0' }} onClick={e => e.stopPropagation()}>
          <div className={styles['modal-handle']}></div>
          <div className={styles['station-map-preview']}>
            <div ref={miniMapContainer} style={{ width: '100%', height: '100%' }}></div>
          </div>
          
          <div className={styles['station-info']}>
            <div className={styles['station-name']}>{activeStation.name}</div>
            <div className={styles['station-rating-row']}>
              <span className={styles['rating-num-sm']}>{avg.toFixed(1)}</span>
              <span className={styles['rating-stars-sm']}>{stars}</span>
              <span className={styles['rating-count-sm']}>({reviewsCount})</span>
            </div>
            <div className={styles['station-addr']}>{activeStation.addr}</div>
          </div>

          <div className={styles['station-actions']}>
            <button className={`${styles['action-btn']} ${styles.primary}`} onClick={() => { setRouteTarget(activeStation); onClose(); }}>🗺 Directions</button>
            <button className={styles['action-btn']} onClick={() => showToast('✅ Navigasi dimulai!', '🗺')}>▲ Start</button>
            {cooldownRemaining > 0 ? (
              <button className={styles['action-btn']} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                ⏳ {formatCooldown(cooldownRemaining)}
              </button>
            ) : (
              <button
                className={`${styles['action-btn']} ${isRefillOpen ? styles.active : ''}`}
                onClick={() => { setIsRefillOpen(!isRefillOpen); }}
              >
                💧 Log Refill
              </button>
            )}
            <button className={`${styles['action-btn']} ${styles.danger}`} onClick={onReportClick}>⚠ Report Issue</button>
          </div>

          {/* Refill form */}
          {isRefillOpen ? (
            <div className={styles['refill-form']}>
              <div className={styles['refill-form-title']}>📸 Photo Proof Required</div>
              <p className={styles['refill-form-desc']}>Take a photo of your refill to earn +10 points. Valid once per hour at this station.</p>

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
                    '✅ Submit Refill (+10 pts)'
                  )}
                </button>
              </div>
            </div>
          ) : null}

          <div className={styles['station-photos']}>
            <div className={styles['station-photo']}>🚰</div>
            <div className={styles['add-photo-btn']}><span>📷</span>Add a photo</div>
          </div>

          <div className={styles['station-address-row']}>
            <span className={styles['addr-icon']}>📍</span>
            <span className={styles['addr-text']}>{activeStation.fullAddr || 'Babakan, Dramaga, Bogor Regency, West Java 16680'}</span>
          </div>

          {/* ============ DYNAMIC REVIEW SUMMARY ============ */}
          <div className={styles['review-section']}>
            <div className={styles['review-header']}>
              <span className={styles['review-title']}>Review summary</span>
              <button className={styles['add-review-btn']} onClick={onReviewClick}>Add review</button>
            </div>
            <div className={styles['review-big']}>
              <div className={styles['review-avg-num']}>{avg.toFixed(1)}</div>
              <div className={styles['review-bar-wrap']}>
                {breakdown.map(function (b) {
                  return (
                    <div key={b.star} className={styles['review-bar-row']}>
                      <span className={styles['review-bar-lbl']}>{b.star}</span>
                      <div className={styles['review-bar-track']}>
                        <div className={styles['review-bar-fill']} style={{ width: b.pct + '%' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles['rating-label']} style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Rate</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div className={styles['reviewer-avatar']} style={{ width: '32px', height: '32px', fontSize: '12px', fontWeight: 700 }}>ZZ</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(function (s) {
                  return (
                    <span key={s} style={{ fontSize: '22px', color: '#ddd', cursor: 'pointer' }} onClick={onReviewClick}>☆</span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ============ DYNAMIC REVIEWS LIST ============ */}
          <div className={styles['review-section']} style={{ paddingTop: '4px' }}>
            <div className={styles['review-title']}>Reviews</div>
          </div>
          
          <div className={styles['comments-list']}>
            {reviewsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8B9E96', fontSize: '13px' }}>⏳ Memuat ulasan...</div>
            ) : recentReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8B9E96', fontSize: '13px' }}>Belum ada ulasan. Jadilah yang pertama!</div>
            ) : (
              recentReviews.map(function (r) {
                return (
                  <div key={r.id} className={styles['comment-item']}>
                    <div className={styles['comment-avatar']}>
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#9FE1CB,#1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white' }}>
                        {getInitials(r.user_name)}
                      </div>
                    </div>
                    <div className={styles['comment-body']}>
                      <div className={styles['comment-name']}>{r.user_name}</div>
                      <div className={styles['comment-time']}>
                        {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)} · {getRelativeTime(r.created_at)}
                      </div>
                      <div className={styles['comment-text']}>{r.comment}</div>
                    </div>
                    <button className={styles['comment-more']}>⋯</button>
                  </div>
                );
              })
            )}
          </div>

          <button className={styles['see-all-reviews']}>See all reviews</button>
          <div style={{ height: '20px' }}></div>
        </div>
      </div>
    );
  }