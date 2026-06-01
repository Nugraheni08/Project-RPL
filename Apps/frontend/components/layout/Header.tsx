'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/app.module.css';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { showToast } from '../ui/Toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

function getRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  var diff = Date.now() - new Date(dateStr).getTime();
  var seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Baru saja';
  var minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + ' menit lalu';
  var hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + ' jam lalu';
  var days = Math.floor(hours / 24);
  return days + ' hari lalu';
}

interface HeaderProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

export default function Header({ onMenuClick, onProfileClick }: HeaderProps) {
  var { displayName } = useAuthStore();
  var initials = displayName
    ? displayName.substring(0, 2).toUpperCase()
    : 'AK';

  var [notifications, setNotifications] = useState<Notification[]>([]);
  var [showDropdown, setShowDropdown] = useState(false);
  var [unreadCount, setUnreadCount] = useState(0);
  var dropdownRef = useRef<HTMLDivElement>(null);
  var channelRef = useRef<any>(null);

  // ── Fetch notifications + subscribe to real-time ──────────────
  useEffect(function () {
    var fetchNotifications = async function () {
      try {
        var res = await fetch('/api/notifications');
        var json = await res.json();
        if (res.ok && json.notifications) {
          setNotifications(json.notifications);
        }
      } catch (err) {
        console.error('Fetch notifications error:', err);
      }
    };

    fetchNotifications();

    // ── Real-time listener ──────────────────────────────────────
    var channel = supabase
      .channel('notifications-header')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        function (payload: any) {
          var newNotif: Notification = payload.new;
          setNotifications(function (prev) {
            return [newNotif, ...prev].slice(0, 20);
          });
          setUnreadCount(function (prev) { return prev + 1; });
          showToast(newNotif.title, '🔔');
        }
      )
      .subscribe();

    channelRef.current = channel;

    return function () {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // ── Klik luar dropdown ────────────────────────────────────────
  useEffect(function () {
    var handleClick = function (e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setUnreadCount(0);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClick);
    }
    return function () { document.removeEventListener('mousedown', handleClick); };
  }, [showDropdown]);

  var toggleDropdown = function () {
    if (!showDropdown) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setUnreadCount(0);
    }
  };

  var getTypeIcon = function (type: string): string {
    return type === 'ai_fun_fact' ? '🤖' : '📢';
  };

  var getTypeBg = function (type: string): string {
    return type === 'ai_fun_fact' ? '#EDE9FE' : '#DBEAFE';
  };

  return (
    <header className={styles.header}>
      {/* Tombol Hamburger Menu Sidebar */}
      <button 
        className={styles.hamburger} 
        onClick={onMenuClick} 
        aria-label="Buka Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={styles['header-icons']}>
        {/* Tombol Notifikasi */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            className={`${styles['icon-btn']} ${styles.bell}`} 
            aria-label="Notifikasi"
            onClick={toggleDropdown}
            style={{ position: 'relative' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#E24B4A',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: '-8px',
              width: '340px',
              maxHeight: '420px',
              overflowY: 'auto',
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 999,
              padding: '12px 0',
            }}>
              <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid #F0F3F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '15px', color: '#1a2e4a' }}>Notifikasi</span>
                <span style={{ fontSize: '11px', color: '#8B9E96', fontWeight: 600 }}>{notifications.length} pesan</span>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#8B9E96', fontSize: '13px' }}>
                  Belum ada notifikasi.
                </div>
              ) : (
                notifications.slice(0, 10).map(function (notif) {
                  return (
                    <div
                      key={notif.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #F7F9FB',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={function (e) { (e.currentTarget as HTMLElement).style.background = '#F7F9FB'; }}
                      onMouseLeave={function (e) { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: getTypeBg(notif.type),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0
                        }}>
                          {getTypeIcon(notif.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#1a2e4a', marginBottom: '2px' }}>
                            {notif.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#5F6B7A', lineHeight: 1.4, marginBottom: '4px' }}>
                            {notif.message.length > 100 ? notif.message.slice(0, 100) + '...' : notif.message}
                          </div>
                          <div style={{ fontSize: '10px', color: '#8B9E96', fontWeight: 600 }}>
                            {getRelativeTime(notif.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Avatar Profil Pengguna */}
        <div 
          className={styles.avatar} 
          onClick={onProfileClick} 
          style={{ cursor: 'pointer' }}
          title="Buka Profil"
        >
          <div className={styles['avatar-placeholder']}>{initials}</div>
        </div>
      </div>
    </header>
  );
}