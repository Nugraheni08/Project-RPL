'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import styles from '@/styles/newsfeed.module.css';

/* ============================================================
   SAMPLE NEWS DATA
   ============================================================ */
const SAMPLE_NEWS = [
  {
    id: 1,
    tag: 'Sustainability',
    title: 'New Zero-Waste Initiative Launched in Student Union',
    snippet: 'The university launches a bold new plan to eliminate all single-use plastics from campus dining halls by the end of this semester.',
    media: '🌱',
    mediaType: 'initiative',
  },
  {
    id: 2,
    tag: 'Campus Life',
    title: 'IPB Green Festival 2026 Draws Record Attendance',
    snippet: 'Over 5,000 students participated in the annual eco-festival featuring workshops on composting, upcycling fashion shows...',
    media: '🎪',
    mediaType: 'event',
  },
  {
    id: 3,
    tag: 'Sustainability',
    title: 'Solar Panel Installation Complete at Faculty of Agriculture',
    snippet: 'The newly installed 200kW solar array is expected to offset 40% of the building\'s annual electricity consumption...',
    media: '☀️',
    mediaType: 'energy',
  },
  {
    id: 4,
    tag: 'Campus Life',
    title: 'Student-Led River Cleanup Collects 2 Tons of Waste',
    snippet: 'A group of 150 volunteers from various faculties joined forces to clean the Cihideung River, collecting over 2 tons of...',
    media: '🌊',
    mediaType: 'cleanup',
  },
  {
    id: 5,
    tag: 'Sustainability',
    title: 'New Electric Campus Shuttle Fleet Begins Operation',
    snippet: 'The university has replaced all diesel buses with 12 new electric shuttles, reducing campus transportation emissions by...',
    media: '🚌',
    mediaType: 'transport',
  },
];

const CATEGORIES = ['All News', 'Sustainability', 'Campus Life'];

export default function NewsfeedPage() {
  const router = useRouter();
  const { displayName, session } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All News');
  const [searchQuery, setSearchQuery] = useState('');

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        router.replace('/auth');
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  // Inisial untuk avatar header
  const email = session?.user?.email || 'user@sample.com';
  const name = displayName || email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
  const initials = displayName
    ? displayName.substring(0, 2).toUpperCase()
    : email.substring(0, 2).toUpperCase();

  // Filter news by category & search
  const filteredNews = SAMPLE_NEWS.filter((item) => {
    const matchesCategory =
      activeTab === 'All News' || item.tag === activeTab;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return <div style={{ minHeight: '100vh', background: '#E8F5EF' }} />;
  }

  return (
    <div id="main-app">
      <div className={styles['newsfeed-page']}>
        {/* ==================== HEADER ==================== */}
        <div className={styles['nf-topbar']}>
          {/* Back Button */}
          <button className={styles['nf-back-btn']} onClick={() => router.push('/map')} aria-label="Kembali">
            ←
          </button>

          <div className={styles['nf-logo']}>
            <img
              src="/logo-icon.png"
              alt="Wmap"
              style={{ width: 22, height: 22, objectFit: 'contain' }}
            />
            <span>Wmap</span>
          </div>

          <div className={styles['nf-header-right']}>
            {/* Notification Bell */}
            <button className={styles['nf-bell']} aria-label="Notifikasi">
              🔔
              <span className={styles['nf-bell-dot']} />
            </button>

            {/* Profile Avatar */}
            <div
              className={styles['nf-avatar']}
              onClick={() => router.push('/map')}
              title="Go to Profile"
            >
              {initials}
            </div>
          </div>
        </div>

        {/* ==================== CATEGORY TABS ==================== */}
        <div className={styles['nf-tabs']}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles['nf-tab']} ${activeTab === cat ? styles.active : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ==================== SEARCH BAR ==================== */}
        <div className={styles['nf-search-row']}>
          <input
            className={styles['nf-search-input']}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className={styles['nf-search-btn']} aria-label="Search">
            🔍
          </button>
        </div>

        {/* ==================== NEWS FEED ==================== */}
        <div className={styles['nf-feed']}>
          {filteredNews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8B9E96', fontSize: '14px' }}>
              No news found for "{searchQuery}"
            </div>
          ) : (
            filteredNews.map((item) => (
              <div key={item.id} className={styles['nf-card']}>
                {/* Left Column: Content */}
                <div className={styles['nf-card-content']}>
                  <div className={styles['nf-card-tag']}>{item.tag}</div>
                  <div className={styles['nf-card-title']}>{item.title}</div>
                  <div className={styles['nf-card-snippet']}>{item.snippet}</div>

                  {/* Footer */}
                  <div className={styles['nf-card-footer']}>
                    <button className={styles['nf-read-more']}>
                      Read More
                      <span className={styles['nf-read-arrow']}>→</span>
                    </button>

                    <div className={styles['nf-card-actions']}>
                      <button className={styles['nf-action-icon']} aria-label="Share">
                        ↗️
                      </button>
                      <button className={styles['nf-action-icon']} aria-label="Bookmark">
                        🔖
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Media */}
                <div className={styles['nf-card-media']}>
                  <span className={styles['nf-media-placeholder']}>{item.media}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}