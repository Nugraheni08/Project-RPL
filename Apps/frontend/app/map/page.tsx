'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import ProfilePanel from '../../components/layout/ProfilePanel';

import MapView from '../../components/map/MapView';
import Leaderboard from '../../components/ui/Leaderboard';
import Toast from '../../components/ui/Toast';

import StationModal from '../../components/modals/StationModal';
import TrashModal from '../../components/modals/TrashModal';
import ReviewModal from '../../components/modals/ReviewModal';
import ReportModal from '../../components/modals/ReportModal';

import { useMapStore } from '../../store/mapStore';
import { useAuthStore } from '../../store/authStore';
import { useActivityStore } from '../../store/activityStore';
import { waterStations, trashBins, stationStatuses, trashStatuses } from '../../lib/contstants';
import ChatBot from '../../components/chat/ChatBot';

// Tipe untuk statistik dashboard user
interface DashboardStats {
  bottles_saved: number;
  bottles_this_week: number;
  eco_points: number;
  rank: number;
}

// Helper: 7 hari lalu dalam format ISO
function getWeekAgoISO(): string {
  var d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
}

var NEWS_ITEMS = [
  { id: 1, icon: '🌳', color: 'linear-gradient(135deg, #1D9E75, #0A5940)', title: '1000 Trees Planting Next Month', sub: 'Read more about our sustainability initiatives' },
  { id: 2, icon: '♻️', color: 'linear-gradient(135deg, #185FA5, #0C447C)', title: 'Zero Waste Campus 2025 Goal', sub: 'IPB targets 90% waste reduction' },
  { id: 3, icon: '☀️', color: 'linear-gradient(135deg, #D85A30, #A04020)', title: 'Solar Panels Installed at Faperta', sub: '200kW array now operational' },
  { id: 4, icon: '🌊', color: 'linear-gradient(135deg, #2E86AB, #1A5C7A)', title: 'River Cleanup Collects 2 Tons', sub: '150 volunteers joined the effort' },
  { id: 5, icon: '🚌', color: 'linear-gradient(135deg, #6B4EFF, #3E2A99)', title: 'Electric Campus Shuttle Fleet', sub: '12 new buses reduce emissions' },
];

export default function MapPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  var searchWrapRef = useRef<HTMLDivElement>(null);

  const { activeStation, setActiveStation } = useMapStore();
  const { displayName, setDisplayName } = useAuthStore();
  const { fetchUserRank, fetchRecentActivities } = useActivityStore();

  // Dashboard stats dari DB
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    bottles_saved: 0,
    bottles_this_week: 0,
    eco_points: 0,
    rank: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  var newsScrollRef = useRef<HTMLDivElement>(null);
  var [currentNewsIdx, setCurrentNewsIdx] = useState(0);

  useEffect(function () {
    var interval = setInterval(function () {
      setCurrentNewsIdx(function (prev) {
        var next = prev + 1;
        if (next >= NEWS_ITEMS.length) {
          if (newsScrollRef.current) {
            newsScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          }
          return 0;
        }
        if (newsScrollRef.current) {
          var cardWidth = 220 + 12;
          var target = next * cardWidth;
          newsScrollRef.current.scrollTo({ left: target, behavior: 'smooth' });
        }
        return next;
      });
    }, 3000);

    return function () { clearInterval(interval); };
  }, []);

  // Fetch dashboard stats: bottles_saved, eco_points, rank
  // Extracted as useRef so the refresh callback is stable
  var refreshStatsRef = useRef<() => Promise<void>>(async function () {});

  useEffect(function () {
    var fetchStats = async function () {
      var result = await supabase.auth.getSession();
      var session = result.data.session;
      if (!session) return;

      var userId = session.user.id;
      var weekAgo = getWeekAgoISO();

      setStatsLoading(true);

      try {
        // 1) Hitung bottles_saved = SUM(volume_ml) / 500 dari semua refill
        var totalBottlesPromise = supabase
          .from('refill_activity')
          .select('volume_ml')
          .eq('user_id', userId);

        // 2) Bottles minggu ini
        var weekBottlesPromise = supabase
          .from('refill_activity')
          .select('volume_ml')
          .eq('user_id', userId)
          .gte('created_at', weekAgo);

        // 3) Rank & points dari RPC
        var rankPromise = fetchUserRank(userId);

        // 4) Recent activities
        var activitiesPromise = fetchRecentActivities(userId, 5);

        var results = await Promise.all([
          totalBottlesPromise,
          weekBottlesPromise,
          rankPromise,
          activitiesPromise,
        ]);

        var totalData = results[0].data;
        var weekData = results[1].data;

        // Hitung bottles: sum volume_ml / 500, round ke integer
        var calcBottles = function (rows: any[] | null): number {
          if (!rows || rows.length === 0) return 0;
          var totalMl = rows.reduce(function (sum: number, row: any) {
            return sum + (row.volume_ml || 0);
          }, 0);
          return Math.round(totalMl / 500);
        };

        var bottlesSaved = calcBottles(totalData);
        var bottlesWeek = calcBottles(weekData);

        // Ambil points & rank dari store (sudah di-set oleh fetchUserRank)
        var storeState = useActivityStore.getState();

        setDashboardStats({
          bottles_saved: bottlesSaved,
          bottles_this_week: bottlesWeek,
          eco_points: storeState.userPoints,
          rank: storeState.userRank,
        });
      } catch (err) {
        console.error('Gagal fetch dashboard stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    // Store in ref so modals can call it
    refreshStatsRef.current = fetchStats;
    fetchStats();
  }, [fetchUserRank, fetchRecentActivities]);

  useEffect(function () {
    var checkUser = async function () {
      var result = await supabase.auth.getSession();
      var session = result.data.session;
      if (!session) {
        router.replace('/auth');
        return;
      }

      var metaUsername = session.user?.user_metadata?.username;
      if (metaUsername) {
        setDisplayName(metaUsername);
        setIsLoading(false);
        return;
      }

      var userResult = await supabase
        .from('users')
        .select('username')
        .eq('id', session.user.id)
        .single();

      if (userResult.data?.username) {
        setDisplayName(userResult.data.username);
      } else {
        var emailName = session.user.email?.split('@')[0] || '';
        var formatted = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        setDisplayName(formatted);
      }

      setIsLoading(false);
    };
    checkUser();
  }, [router, setDisplayName]);

  // Gabungkan semua fasilitas untuk dropdown pencarian
  var allFacilities = ([] as Array<{
    id: string;
    name: string;
    addr: string;
    lat: number;
    lng: number;
    type: 'water' | 'trash';
    rating?: number;
    fullAddr?: string;
  }>).concat(
    waterStations.map(function (s, i) {
      return { id: 'water-' + i, name: s.name, addr: s.addr, lat: s.lat, lng: s.lng, type: 'water' as const, rating: s.rating, fullAddr: s.fullAddr };
    }),
    trashBins.map(function (t, i) {
      return { id: 'trash-' + i, name: t.name, addr: t.addr, lat: t.lat, lng: t.lng, type: 'trash' as const };
    })
  );

  var filteredFacilities = searchQuery.trim()
    ? allFacilities.filter(function (f) {
        return f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               f.addr.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];

  useEffect(function () {
    function handleClickOutside(e: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return function () { document.removeEventListener('mousedown', handleClickOutside); };
  }, [isDropdownOpen]);

  var handleFacilitySelect = function (facility: typeof allFacilities[0]) {
    setIsDropdownOpen(false);
    setSearchQuery('');

    if (facility.type === 'water') {
      var stationIndex = parseInt(facility.id.replace('water-', ''), 10);
      var status = stationStatuses[stationIndex] || 'active';
      setActiveStation({
        name: facility.name,
        lat: facility.lat,
        lng: facility.lng,
        addr: facility.addr,
        fullAddr: facility.fullAddr,
        rating: facility.rating,
        type: 'water',
        id: facility.id,
        status: status,
      });
    } else {
      var trashIndex = parseInt(facility.id.replace('trash-', ''), 10);
      var tStatus = trashStatuses[trashIndex] || 'active';
      setActiveStation({
        name: facility.name,
        lat: facility.lat,
        lng: facility.lng,
        addr: facility.addr,
        type: 'trash',
        id: facility.id,
        status: tStatus,
      });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#EEF4F1]"></div>;
  }

  var activities = useActivityStore.getState().recentActivities;

  return (
    <div id="main-app">
      <Sidebar isOpen={isSidebarOpen} onClose={function () { setIsSidebarOpen(false); }} onReportIssue={function () { setIsReportOpen(true); }} />
      <Header 
        onMenuClick={function () { setIsSidebarOpen(true); }} 
        onProfileClick={function () { setIsProfileOpen(true); }} 
      />

      {!isProfileOpen && (
        <div className="content">
          <div className="greeting">
            <div className="greeting-sub">You've made a real contribution today</div>
            <div className="greeting-name">
              Hello{displayName ? ', ' + displayName : ''} 👋
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-leaves">
              <div className="hero-card-leaf l1"></div>
              <div className="hero-card-leaf l2"></div>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="hero-label">🍃 Plastic Bottles Saved</div>
              <div className="hero-number">
                {statsLoading ? '...' : dashboardStats.bottles_saved.toLocaleString('id-ID')}
              </div>
              <div className="hero-badge">
                ⬆ +{statsLoading ? '...' : dashboardStats.bottles_this_week} Bottles This Week
              </div>
            </div>
          </div>

          <div className="mini-stats">
            <div className="mini-stat">
              <div className="mini-stat-icon">⚡</div>
              <div>
                <div className="mini-stat-num">
                  {statsLoading ? '...' : dashboardStats.eco_points.toLocaleString('id-ID')}
                </div>
                <div className="mini-stat-lbl">Eco Points</div>
              </div>
            </div>
            <div className="mini-stat">
              <div className="mini-stat-icon blue-bg">📊</div>
              <div>
                <div className="mini-stat-num">
                  {statsLoading ? '...' : '#' + (dashboardStats.rank > 0 ? dashboardStats.rank : '-')}
                </div>
                <div className="mini-stat-lbl">Rank</div>
              </div>
            </div>
          </div>

          <div className="fun-fact">
            <div className="fun-fact-icon">💡</div>
            <div>
              <div className="fun-fact-label">Daily Fun Fact</div>
              <div className="fun-fact-text">
                Recycling just one aluminium can saves enough energy to power a TV for three hours
              </div>
            </div>
          </div>

          {/* ---- Facility Search Bar with Autocomplete ---- */}
          <div className="facility-search-wrap" ref={searchWrapRef}>
            <div className="facility-search">
              <span className="facility-search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                className="facility-search-input"
                type="text"
                placeholder="Cari fasilitas..."
                value={searchQuery}
                onChange={function (e) { setSearchQuery(e.target.value); setIsDropdownOpen(true); }}
                onFocus={function () { if (searchQuery.trim()) setIsDropdownOpen(true); }}
              />
            </div>

            {isDropdownOpen && filteredFacilities.length > 0 ? (
              <div className="facility-dropdown">
                {filteredFacilities.map(function (facility) {
                  return (
                    <div
                      key={facility.id}
                      className="facility-dropdown-item"
                      onClick={function () { handleFacilitySelect(facility); }}
                    >
                      <span className="facility-dropdown-type-icon">
                        {facility.type === 'water' ? '💧' : '♻️'}
                      </span>
                      <div className="facility-dropdown-info">
                        <div className="facility-dropdown-name">{facility.name}</div>
                        <div className="facility-dropdown-addr">
                          {facility.addr}
                          <span className="facility-dropdown-type-label">
                            {facility.type === 'water' ? ' · Water Station' : ' · Waste Bin'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {isDropdownOpen && searchQuery.trim() && filteredFacilities.length === 0 ? (
              <div className="facility-dropdown">
                <div className="facility-dropdown-empty">Fasilitas tidak ditemukan</div>
              </div>
            ) : null}
          </div>

          <MapView />

          <Leaderboard />

          <div className="section-header">
            <span className="section-title">⚡ Recent Activity</span>
            <span className="view-all" onClick={function () { router.push('/history'); }}>View All</span>
          </div>
          <div className="activity-list">
            {activities.map(function (item, idx) {
              return (
                <div key={idx} className="act-item">
                  <div className={'act-icon' + (item.isRecycle ? ' recycle' : '')}>{item.icon}</div>
                  <div className="act-info">
                    <div className="act-name">{item.name}</div>
                    <div className="act-time">{item.time}</div>
                  </div>
                  <div className="act-pts">{item.pts}</div>
                </div>
              );
            })}
          </div>

          <div className="section-header">
            <span className="section-title">🌿 Green Campus News</span>
            <span className="view-all" onClick={function () { router.push('/newsfeed'); }}>View All</span>
          </div>
          <div className="news-scroll" ref={newsScrollRef}>
            {NEWS_ITEMS.map(function (item) {
              return (
                <div key={item.id} className="news-card">
                  <div className="news-card-bg" style={{ background: item.color }}>{item.icon}</div>
                  <div className="news-card-overlay">
                    <div className="news-card-title">{item.title}</div>
                    <div className="news-card-sub">{item.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ height: '16px' }}></div>
        </div>
      )}

      <ProfilePanel isOpen={isProfileOpen} onClose={function () { setIsProfileOpen(false); }} />

      <StationModal 
        isOpen={!!activeStation && activeStation.type !== 'trash'} 
        onClose={function () { setActiveStation(null); }} 
        onReportClick={function () { setIsReportOpen(true); }} 
        onReviewClick={function () { setIsReviewOpen(true); }}
        onRefillSuccess={function () { refreshStatsRef.current(); }}
      />
      <TrashModal 
        isOpen={!!activeStation && activeStation.type === 'trash'} 
        onClose={function () { setActiveStation(null); }}
        onReviewClick={function () { setIsReviewOpen(true); }}
        onReportClick={function () { setIsReportOpen(true); }}
        onRefillSuccess={function () { refreshStatsRef.current(); }}
      />
      <ReviewModal 
        isOpen={isReviewOpen} 
        onClose={function () { setIsReviewOpen(false); }} 
      />
      <ReportModal 
        isOpen={isReportOpen} 
        onClose={function () { setIsReportOpen(false); }} 
        locationName={activeStation?.name || ''}
      />
      <Toast />
      <ChatBot />
    </div>
  );
}