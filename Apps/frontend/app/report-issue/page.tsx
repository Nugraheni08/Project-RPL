'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toast';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/report-form.module.css';

interface FacilityOption {
  id: string;
  name: string;
}

var FACILITY_TYPE_OPTIONS = ['Water Refill Station', 'Waste Bin'];

export default function ReportIssuePage() {
  var router = useRouter();
  var [loading, setLoading] = useState(true);
  var [isSidebarOpen, setIsSidebarOpen] = useState(false);
  var [facilityType, setFacilityType] = useState('');
  var [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  var [locationRef, setLocationRef] = useState('');
  var [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  var [description, setDescription] = useState('');
  var [isSubmitting, setIsSubmitting] = useState(false);
  var [facilities, setFacilities] = useState<FacilityOption[]>([]);
  var typeDropdownRef = useRef<HTMLDivElement>(null);
  var locationDropdownRef = useRef<HTMLDivElement>(null);

  // ── Auth check + fetch facilities ─────────────────────────────
  useEffect(function () {
    var init = async function () {
      var result = await supabase.auth.getSession();
      if (!result.data.session) {
        router.replace('/auth');
        return;
      }

      // Fetch facility names for location dropdown
      var { data } = await supabase
        .from('facilities')
        .select('id, name')
        .order('name', { ascending: true });

      if (data) {
        setFacilities(data);
      }

      setLoading(false);
    };
    init();
  }, [router]);

  // ── Close dropdowns on outside click ──────────────────────────
  useEffect(function () {
    var handleClick = function (e: MouseEvent) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setLocationDropdownOpen(false);
      }
    };
    if (typeDropdownOpen || locationDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return function () { document.removeEventListener('mousedown', handleClick); };
  }, [typeDropdownOpen, locationDropdownOpen]);

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#E8F5EF' }} />;
  }

  // ── Submit handler ────────────────────────────────────────────
  var handleSubmit = async function () {
    if (!facilityType) {
      showToast('Pilih tipe fasilitas!', '⚠️');
      return;
    }
    if (!locationRef) {
      showToast('Pilih lokasi fasilitas!', '⚠️');
      return;
    }
    if (!description.trim()) {
      showToast('Deskripsi masalah wajib diisi!', '⚠️');
      return;
    }

    setIsSubmitting(true);

    try {
      var res = await fetch('/api/reports/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityType: facilityType,
          locationRef: locationRef,
          description: description.trim(),
        }),
      });

      var json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengirim laporan.');

      showToast(json.message || 'Laporan berhasil dikirim!', '✅');
      setFacilityType('');
      setLocationRef('');
      setDescription('');
    } catch (err: unknown) {
      var msg = err instanceof Error ? err.message : 'Gagal mengirim.';
      showToast(msg, '❌');
      console.error('REPORT_SUBMIT_ERROR:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  var handleDiscard = function () {
    setFacilityType('');
    setLocationRef('');
    setDescription('');
  };

  return (
    <div id="main-app">
      <div className={styles['report-page']}>
        {/* ==================== HEADER ==================== */}
        <div className={styles['rpt-topbar']}>
          <button
            className={styles['rpt-hamburger']}
            onClick={function () { setIsSidebarOpen(true); }}
            aria-label="Open Menu"
          >
            <span></span>
            <span></span>
          </button>

          <button className={styles['rpt-bell']} aria-label="Notifikasi">
            🔔
            <span className={styles['rpt-bell-dot']} />
          </button>
        </div>

        {/* ==================== TITLE ==================== */}
        <div className={styles['rpt-title-section']}>
          <div className={styles['rpt-title']}>Report Issue</div>
          <div className={styles['rpt-subtitle']}>
            Help us optimize sustainability efforts by reporting broken recycling sensors or leaks.
          </div>
        </div>

        {/* ==================== FORM ==================== */}
        <div className={styles['rpt-form']}>
          {/* Facility Type Dropdown */}
          <div className={styles['rpt-field']}>
            <label className={styles['rpt-label']}>Facility Type</label>
            <div className={styles['rpt-select-wrap']} ref={typeDropdownRef}>
              <div
                className={styles['rpt-select']}
                onClick={function () { setTypeDropdownOpen(!typeDropdownOpen); }}
              >
                {facilityType || <span style={{ color: '#A0B5AA' }}>Select the type of facility</span>}
              </div>
              <span className={styles['rpt-select-arrow']}>▾</span>
              <div className={styles['rpt-dropdown'] + ' ' + (typeDropdownOpen ? styles.open : '')}>
                {FACILITY_TYPE_OPTIONS.map(function (opt) {
                  return (
                    <button
                      key={opt}
                      className={styles['rpt-dropdown-item']}
                      onClick={function () { setFacilityType(opt); setTypeDropdownOpen(false); }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Location Reference Dropdown */}
          <div className={styles['rpt-field']}>
            <label className={styles['rpt-label']}>Location Reference</label>
            <div className={styles['rpt-select-wrap']} ref={locationDropdownRef}>
              <div
                className={styles['rpt-select']}
                onClick={function () { setLocationDropdownOpen(!locationDropdownOpen); }}
              >
                {locationRef || <span style={{ color: '#A0B5AA' }}>Select facility location</span>}
              </div>
              <span className={styles['rpt-select-arrow']}>▾</span>
              <div className={styles['rpt-dropdown'] + ' ' + (locationDropdownOpen ? styles.open : '')}>
                {facilities.length === 0 ? (
                  <div style={{ padding: '10px', color: '#8B9E96', fontSize: '12px' }}>Tidak ada fasilitas.</div>
                ) : (
                  facilities.map(function (f) {
                    return (
                      <button
                        key={f.id}
                        className={styles['rpt-dropdown-item']}
                        onClick={function () { setLocationRef(f.name); setLocationDropdownOpen(false); }}
                      >
                        {f.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div className={styles['rpt-field']}>
            <label className={styles['rpt-label']}>Issue Description</label>
            <textarea
              className={styles['rpt-textarea']}
              placeholder="Provide details about the problem (e.g., Air mati, Keran bocor)..."
              value={description}
              onChange={function (e) { setDescription(e.target.value); }}
              rows={5}
            />
          </div>

          {/* Upload Photo */}
          <div className={styles['rpt-field']}>
            <label className={styles['rpt-label']}>Upload Photo</label>
            <div className={styles['rpt-upload-zone']} onClick={function () { showToast('Fitur upload coming soon! 📷'); }}>
              <span className={styles['rpt-upload-icon']}>📷</span>
              <span className={styles['rpt-upload-text']}>Take Photo or Upload</span>
            </div>
          </div>
        </div>

        {/* ==================== ACTION BUTTONS ==================== */}
        <div className={styles['rpt-actions']}>
          <button
            className={styles['rpt-submit-btn']}
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={isSubmitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
          <button className={styles['rpt-discard-link']} onClick={handleDiscard}>
            Discard Draft
          </button>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={function () { setIsSidebarOpen(false); }} />
    </div>
  );
}