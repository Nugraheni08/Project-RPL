'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toast';
import Sidebar from '../../components/layout/Sidebar';
import styles from '@/styles/report-form.module.css';

var FACILITY_OPTIONS = ['Refill Water', 'Waste Bin'];

export default function ReportIssuePage() {
  var router = useRouter();
  var [isLoading, setIsLoading] = useState(true);
  var [isSidebarOpen, setIsSidebarOpen] = useState(false);
  var [facilityType, setFacilityType] = useState('');
  var [dropdownOpen, setDropdownOpen] = useState(false);
  var [description, setDescription] = useState('');
  var [submitted, setSubmitted] = useState(false);
  var dropdownRef = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(function () {
    var checkAuth = async function () {
      var result = await supabase.auth.getSession();
      if (!result.data.session) {
        router.replace('/auth');
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(function () {
    var handleClick = function (e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return function () { document.removeEventListener('mousedown', handleClick); };
  }, [dropdownOpen]);

  if (isLoading) {
    return <div style={{ minHeight: '100vh', background: '#E8F5EF' }} />;
  }

  var showValidation = submitted && description.trim() === '';

  var handleSubmit = function () {
    setSubmitted(true);

    if (description.trim() === '') {
      showToast('Deskripsi wajib diisi!');
      return;
    }

    if (!facilityType) {
      showToast('Pilih tipe fasilitas!');
      return;
    }

    showToast('Laporan berhasil dikirim!');
    setFacilityType('');
    setDescription('');
    setSubmitted(false);
  };

  var handleDiscard = function () {
    setFacilityType('');
    setDescription('');
    setSubmitted(false);
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
            <div className={styles['rpt-select-wrap']} ref={dropdownRef}>
              <div
                className={styles['rpt-select']}
                onClick={function () { setDropdownOpen(!dropdownOpen); }}
              >
                {facilityType || <span style={{ color: '#A0B5AA' }}>Select the type of facility</span>}
              </div>
              <span className={styles['rpt-select-arrow']}>▾</span>
              <div className={styles['rpt-dropdown'] + ' ' + (dropdownOpen ? styles.open : '')}>
                {FACILITY_OPTIONS.map(function (opt) {
                  return (
                    <button
                      key={opt}
                      className={styles['rpt-dropdown-item']}
                      onClick={function () { setFacilityType(opt); setDropdownOpen(false); }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Location Reference */}
          <div className={styles['rpt-field']}>
            <label className={styles['rpt-label']}>Location Reference</label>
            <input
              className={styles['rpt-input'] + ' ' + styles.readonly}
              value="Fmipa Kering"
              readOnly
            />
          </div>

          {/* Issue Description */}
          <div className={styles['rpt-field']}>
            <label className={styles['rpt-label']}>Issue Description</label>
            <textarea
              className={styles['rpt-textarea']}
              placeholder="Provide details about the problem..."
              value={description}
              onChange={function (e) { setDescription(e.target.value); }}
              rows={5}
            />
            {showValidation ? (
              <div className={styles['rpt-validation-error']}>
                <span className={styles['rpt-error-icon']}>⚠️</span>
                <span className={styles['rpt-error-text']}>Description is required for maintenance</span>
              </div>
            ) : null}
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
          <button className={styles['rpt-submit-btn']} onClick={handleSubmit}>
            Submit Report
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