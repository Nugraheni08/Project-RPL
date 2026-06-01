'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import styles from '@/styles/profile.module.css';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  var router = useRouter();
  var { session, setSession, displayName, phone, location, setPhone, setLocation } = useAuthStore();

  var [isEditing, setIsEditing] = useState(false);
  var [editPhone, setEditPhone] = useState(phone);
  var [editLocation, setEditLocation] = useState(location);
  var [isSaving, setIsSaving] = useState(false);
  var [fetchedEmail, setFetchedEmail] = useState('');
  var [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  var [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  var fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile + email + avatar from Supabase when panel opens
  useEffect(function () {
    if (!isOpen) return;

    var loadData = async function () {
      // Get current session
      var sessionResult = await supabase.auth.getSession();
      var userId = sessionResult.data.session?.user?.id;
      var userEmail = sessionResult.data.session?.user?.email;

      if (userEmail) {
        setFetchedEmail(userEmail);
      }

      if (!userId) return;

      // Load profile from public.profiles (including avatar_url)
      var profileResult = await supabase
        .from('profiles')
        .select('phone, location, avatar_url')
        .eq('id', userId)
        .single();

      if (profileResult.data) {
        if (profileResult.data.phone) setPhone(profileResult.data.phone);
        if (profileResult.data.location) setLocation(profileResult.data.location);
        if (profileResult.data.avatar_url) setAvatarUrl(profileResult.data.avatar_url);
      }
    };
    loadData();
  }, [isOpen, setPhone, setLocation]);

  // Sync edit fields with store when entering edit mode
  useEffect(function () {
    if (isEditing) {
      setEditPhone(phone);
      setEditLocation(location);
    }
  }, [isEditing, phone, location]);

  var email = fetchedEmail || session?.user?.email || '';

  // Nama dari displayName store (diisi saat login/registrasi), fallback dari email
  var name = displayName || (email ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : '');

  // Inisial untuk avatar
  var initials = displayName
    ? displayName.substring(0, 2).toUpperCase()
    : email
      ? email.substring(0, 2).toUpperCase()
      : '?';

  var userPhone = phone || '';
  var userLocation = location || '';

  var handleEditAll = function () {
    setIsEditing(true);
  };

  var handleCancel = function () {
    setIsEditing(false);
    setEditPhone(phone);
    setEditLocation(location);
  };

  var handleSave = async function () {
    // Get current session directly from Supabase
    var sessionResult = await supabase.auth.getSession();
    var userId = sessionResult.data.session?.user?.id;

    if (!userId) {
      alert('Session tidak valid. Silakan login ulang.');
      return;
    }

    setIsSaving(true);

    try {
      // NOTE: User row di public.users sudah auto-dibuat oleh trigger
      // on_auth_user_created saat registrasi. Tidak perlu insert manual lagi.

      var result = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          phone: editPhone,
          location: editLocation,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (result.error) {
        console.error('Save profile error — full details:', JSON.stringify(result.error, null, 2));
        alert('Gagal menyimpan: ' + (result.error.message || result.error.code || 'Unknown error') + '. Cek console browser untuk detail.');
        setIsSaving(false);
        return;
      }

      // Update auth store
      setPhone(editPhone);
      setLocation(editLocation);

      setIsEditing(false);
      alert('Profil berhasil disimpan!');
    } catch (error) {
      console.error('Save profile exception:', error);
      alert('Gagal menyimpan profil. Detail: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSaving(false);
    }
  };

  // ============ AVATAR UPLOAD ============
  var handleAvatarClick = function () {
    fileInputRef.current?.click();
  };

  var handleAvatarFileChange = async function (e: React.ChangeEvent<HTMLInputElement>) {
    var file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    var validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Format tidak didukung. Gunakan PNG, JPEG, WebP, atau GIF.');
      return;
    }

    // Get user ID
    var sessionResult = await supabase.auth.getSession();
    var userId = sessionResult.data.session?.user?.id;
    if (!userId) {
      alert('Session tidak valid. Silakan login ulang.');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      var fileExt = file.name.split('.').pop() || 'jpg';
      var fileName = userId + '/avatar-' + Date.now() + '.' + fileExt;

      // Upload to avatars bucket
      var uploadResult = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadResult.error) {
        console.error('Avatar upload error:', uploadResult.error);
        alert('Gagal upload avatar: ' + uploadResult.error.message);
        setIsUploadingAvatar(false);
        return;
      }

      // Get public URL
      var urlResult = supabase.storage.from('avatars').getPublicUrl(fileName);
      var newAvatarUrl = urlResult.data.publicUrl;

      // Update profiles table
      var updateResult = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (updateResult.error) {
        console.error('Profile update error:', updateResult.error);
        alert('Avatar terupload, tapi gagal simpan ke profil: ' + updateResult.error.message);
      }

      // Update local state
      setAvatarUrl(newAvatarUrl);
      alert('Avatar berhasil diupdate!');
    } catch (err: any) {
      console.error('Avatar upload exception:', err);
      alert('Gagal upload: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input agar bisa upload file yang sama lagi
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  // ============ END AVATAR UPLOAD ============

  var handleLogout = async function () {
    try {
      await supabase.auth.signOut();
      setSession(null);
      router.replace('/auth');
    } catch (error) {
      console.error('Error saat logout:', error);
      alert('Gagal keluar akun. Silakan coba lagi.');
    }
  };

  return (
    <div className={styles['profile-panel'] + ' ' + (isOpen ? styles.open : '')}>
      {/* ==================== HEADER ==================== */}
      <div className={styles['profile-topbar']}>
        {/* Back Button */}
        <button className={styles['profile-back-btn']} onClick={onClose} aria-label="Kembali">
          ←
        </button>

        {/* Logo Wmap dengan ikon daun hijau */}
        <div className={styles['profile-logo']}>
          <img
            src="/logo-icon.png"
            alt="Wmap"
            style={{ width: 22, height: 22, objectFit: 'contain' }}
          />
          <span>Wmap</span>
        </div>

        {/* Notification Bell */}
        <button className={styles['profile-bell']} aria-label="Notifikasi">
          🔔
          <span className={styles['profile-bell-dot']} />
        </button>
      </div>

      {/* ==================== PROFILE SUMMARY ==================== */}
      <div className={styles['profile-summary']}>
        <div className={styles['profile-avatar-wrap']}>
          <div
            className={styles['profile-avatar']}
            onClick={handleAvatarClick}
            style={{ cursor: 'pointer', overflow: 'hidden' }}
          >
            {isUploadingAvatar ? (
              <span style={{ fontSize: '14px' }}>⏳</span>
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                }}
              />
            ) : (
              initials
            )}
          </div>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleAvatarFileChange}
          />
          {/* Edit Pencil Badge */}
          <div
            className={styles['profile-avatar-badge']}
            onClick={handleAvatarClick}
            style={{ cursor: 'pointer' }}
          >
            {isUploadingAvatar ? '⏳' : '✏️'}
          </div>
        </div>
        <div className={styles['profile-display-name']}>{name}</div>
      </div>

      {/* ==================== PERSONAL INFORMATION ==================== */}
      <div className={styles['profile-section-header']}>
        <span className={styles['profile-section-title']}>Personal Information</span>
        {isEditing ? (
          <button className={styles['profile-section-edit']} onClick={handleCancel}>
            Cancel
          </button>
        ) : (
          <button className={styles['profile-section-edit']} onClick={handleEditAll}>
            Edit All
          </button>
        )}
      </div>

      <div className={styles['profile-info-cards']}>
        {/* Full Name */}
        <div className={styles['profile-info-card']}>
          <span className={styles['profile-info-label']}>Full Name</span>
          <span className={styles['profile-info-value']}>{name || '—'}</span>
        </div>

        {/* Email Address */}
        <div className={styles['profile-info-card']}>
          <span className={styles['profile-info-label']}>Email Address</span>
          <span className={styles['profile-info-value']}>{email || '—'}</span>
        </div>

        {/* Phone Number */}
        <div className={styles['profile-info-card']}>
          <span className={styles['profile-info-label']}>Phone Number</span>
          {isEditing ? (
            <input
              className={styles['profile-info-input']}
              type="tel"
              placeholder="Masukkan nomor telepon"
              value={editPhone}
              onChange={function (e) { setEditPhone(e.target.value); }}
            />
          ) : (
            <span className={styles['profile-info-value'] + ' ' + (!userPhone ? styles['profile-info-empty'] : '')}>
              {userPhone || 'Belum diisi'}
            </span>
          )}
        </div>

        {/* Location */}
        <div className={styles['profile-info-card']}>
          <span className={styles['profile-info-label']}>Location</span>
          {isEditing ? (
            <input
              className={styles['profile-info-input']}
              type="text"
              placeholder="Masukkan lokasi"
              value={editLocation}
              onChange={function (e) { setEditLocation(e.target.value); }}
            />
          ) : (
            <span className={styles['profile-info-value'] + ' ' + (!userLocation ? styles['profile-info-empty'] : '')}>
              {userLocation || 'Belum diisi'}
            </span>
          )}
        </div>
      </div>

      {/* ==================== SECURITY ==================== */}
      <div className={styles['profile-security-section']}>
        <div className={styles['profile-section-header']}>
          <span className={styles['profile-section-title']}>Security</span>
        </div>

        <div className={styles['profile-security-card']} onClick={function () { alert('Fitur Change Password belum tersedia'); }}>
          <div className={styles['profile-security-info']}>
            <span className={styles['profile-security-label']}>Change Password</span>
            <span className={styles['profile-security-sub']}>Last updated 3 month ago</span>
          </div>
          <span className={styles['profile-security-arrow']}>›</span>
        </div>
      </div>

      {/* ==================== ACTION BUTTONS ==================== */}
      <div className={styles['profile-actions']}>
        {isEditing ? (
          <button
            className={styles['btn-save-changes']}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Menyimpan...' : 'Save Changes'}
          </button>
        ) : null}
        <button className={styles['btn-logout-link']} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}