'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
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
  bio: string;
}

export default function ProfilPage() {
  var router = useRouter();
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  var [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(function () {
    var fetchProfile = async function () {
      try {
        var sessionResult = await supabase.auth.getSession();
        if (!sessionResult.data.session) {
          router.replace('/auth');
          return;
        }

        var res = await fetch('/api/user/profile');
        var json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal memuat profil.');
        setProfile(json);
      } catch (err: unknown) {
        var msg = err instanceof Error ? err.message : 'Unknown error';
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#E8F5EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>⏳</div>
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#8B9E96', fontWeight: 600 }}>Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#E8F5EF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#E24B4A', fontWeight: 700 }}>⚠️ {error || 'Data tidak tersedia.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#E8F5EF' }}>
      {/* ==================== TOPBAR ==================== */}
      <div className={styles['profile-topbar']}>
        <button className={styles['profile-back-btn']} onClick={function () { router.push('/map'); }} aria-label="Kembali">
          ←
        </button>
        <div className={styles['profile-logo']}>
          <img src="/logo-icon.png" alt="Wmap" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          <span>Wmap</span>
        </div>
        <button className={styles['profile-bell']} aria-label="Notifikasi">
          🔔
          <span className={styles['profile-bell-dot']} />
        </button>
      </div>

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
          {profile.phone ? (
            <div className={styles['profile-info-card']}>
              <span className={styles['profile-info-label']}>Telepon</span>
              <span className={styles['profile-info-value']}>{profile.phone}</span>
            </div>
          ) : null}
          {profile.location ? (
            <div className={styles['profile-info-card']}>
              <span className={styles['profile-info-label']}>Lokasi</span>
              <span className={styles['profile-info-value']}>{profile.location}</span>
            </div>
          ) : null}
        </div>

        {/* ==================== LOGOUT ==================== */}
        <div className={styles['profile-actions']} style={{ marginTop: '24px', paddingBottom: '32px' }}>
          <button className={styles['btn-logout-link']} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}