'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/profile.module.css';

interface ProfileData {
  name: string;
  email: string;
  nim: string;
  role: string;
  points: number;
  totalRefills: number;
  phone: string;
  location: string;
  avatarUrl: string | null;
}

export default function ProfilPage() {
  var router = useRouter();
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  var [profile, setProfile] = useState<ProfileData | null>(null);
  var [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(function () {
    var fetchProfile = async function () {
      try {
        // ── Step 1: Cek session client-side ─────────────────────
        var sessionResult = await supabase.auth.getSession();
        var user = sessionResult.data.session?.user;
        if (!user) {
          router.replace('/auth');
          return;
        }

        var userId = user.id;

        // ── Step 2: Fetch langsung dari Supabase (anon key + RLS) ──
        var [userResult, profileResult, refillResult] = await Promise.all([
          supabase.from('users').select('username, email, role, nim, nip, total_points').eq('id', userId).single(),
          supabase.from('profiles').select('full_name, phone, location, avatar_url').eq('id', userId).single(),
          supabase.from('refill_activity').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('activity_type', 'refill'),
        ]);

        var userRow = userResult.data;
        var profileRow = profileResult.data;

        setProfile({
          name: profileRow?.full_name || userRow?.username || user.email?.split('@')[0] || 'User',
          email: userRow?.email || user.email || '',
          nim: userRow?.nim || userRow?.nip || '-',
          role: userRow?.role || 'Mahasiswa',
          points: userRow?.total_points || 0,
          totalRefills: refillResult.count || 0,
          phone: profileRow?.phone || '',
          location: profileRow?.location || '',
          avatarUrl: profileRow?.avatar_url || null,
        });
      } catch (err: unknown) {
        var msg = err instanceof Error ? err.message : 'Gagal memuat profil.';
        setError(msg);
        console.error('PROFILE_FETCH_ERROR:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  var handleLogout = async function () {
    try {
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  var initials = profile?.name
    ? profile.name.substring(0, 2).toUpperCase()
    : '?';

  return (
    <div id="main-app">
      <div style={{ minHeight: '100vh', background: '#E8F5EF' }}>
        {/* ==================== TOPBAR ==================== */}
        <div className={styles['profile-topbar']}>
          <button
            className={styles['profile-back-btn']}
            onClick={function () { router.push('/map'); }}
            aria-label="Kembali"
          >
            ←
          </button>
          <div className={styles['profile-logo']}>
            <img src="/logo-icon.png" alt="Wmap" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            <span>Wmap</span>
          </div>
          <button
            className={styles['profile-bell']}
            aria-label="Buka menu"
            onClick={function () { setIsSidebarOpen(true); }}
          >
            <span style={{ display: 'block', width: '18px', height: '2px', background: '#1D9E75', marginBottom: '3px', borderRadius: '1px' }} />
            <span style={{ display: 'block', width: '14px', height: '2px', background: '#1D9E75', borderRadius: '1px' }} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>⏳</div>
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#8B9E96', fontWeight: 600 }}>Memuat profil...</p>
            </div>
          </div>
        ) : error || !profile ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '120px', paddingLeft: '24px', paddingRight: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#E24B4A', fontWeight: 700 }}>⚠️ {error || 'Data tidak tersedia.'}</p>
              <button
                onClick={function () { router.push('/map'); }}
                style={{ marginTop: '12px', padding: '8px 20px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ==================== PROFILE SUMMARY ==================== */}
            <div className={styles['profile-summary']}>
              <div className={styles['profile-avatar-wrap']}>
                <div className={styles['profile-avatar']}>
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              <div className={styles['profile-display-name']}>{profile.name}</div>
              <div style={{ fontSize: '12px', color: '#8B9E96', marginTop: '4px' }}>{profile.role} — {profile.nim}</div>
            </div>

            {/* ==================== INFO CARDS ==================== */}
            <div style={{ padding: '0 16px' }}>
              <div className={styles['profile-section-header']} style={{ marginBottom: '8px' }}>
                <span className={styles['profile-section-title']}>Personal Information</span>
              </div>

              <div className={styles['profile-info-cards']}>
                <div className={styles['profile-info-card']}>
                  <span className={styles['profile-info-label']}>Nama Lengkap</span>
                  <span className={styles['profile-info-value']}>{profile.name}</span>
                </div>
                <div className={styles['profile-info-card']}>
                  <span className={styles['profile-info-label']}>Email</span>
                  <span className={styles['profile-info-value']}>{profile.email}</span>
                </div>
                <div className={styles['profile-info-card']}>
                  <span className={styles['profile-info-label']}>NIM / NIP</span>
                  <span className={styles['profile-info-value']}>{profile.nim}</span>
                </div>
                <div className={styles['profile-info-card']}>
                  <span className={styles['profile-info-label']}>Role</span>
                  <span className={styles['profile-info-value']}>{profile.role}</span>
                </div>
                <div className={styles['profile-info-card']}>
                  <span className={styles['profile-info-label']}>Total Eco Points</span>
                  <span className={styles['profile-info-value']} style={{ color: '#1D9E75', fontWeight: 800 }}>
                    {profile.points.toLocaleString('id-ID')} pts
                  </span>
                </div>
                <div className={styles['profile-info-card']}>
                  <span className={styles['profile-info-label']}>Total Refills</span>
                  <span className={styles['profile-info-value']} style={{ color: '#185FA5', fontWeight: 800 }}>
                    {profile.totalRefills.toLocaleString('id-ID')} kali
                  </span>
                </div>
                {profile.phone && (
                  <div className={styles['profile-info-card']}>
                    <span className={styles['profile-info-label']}>Telepon</span>
                    <span className={styles['profile-info-value']}>{profile.phone}</span>
                  </div>
                )}
                {profile.location && (
                  <div className={styles['profile-info-card']}>
                    <span className={styles['profile-info-label']}>Lokasi</span>
                    <span className={styles['profile-info-value']}>{profile.location}</span>
                  </div>
                )}
              </div>

              {/* ==================== LOGOUT ==================== */}
              <div className={styles['profile-actions']} style={{ marginTop: '24px', paddingBottom: '32px' }}>
                <button className={styles['btn-logout-link']} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={function () { setIsSidebarOpen(false); }} />
    </div>
  );
}