'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { showToast } from '../ui/Toast';
import styles from '@/styles/report-form.module.css';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName?: string;
}

var FACILITY_OPTIONS = ['Refill Water', 'Waste Bin'];

export default function ReportModal({ isOpen, onClose, locationName }: ReportModalProps) {
  var [facilityType, setFacilityType] = useState('');
  var [dropdownOpen, setDropdownOpen] = useState(false);
  var [description, setDescription] = useState('');
  var [editLocation, setEditLocation] = useState(locationName || '');
  var [submitted, setSubmitted] = useState(false);
  var [photoFile, setPhotoFile] = useState<File | null>(null);
  var [photoPreview, setPhotoPreview] = useState<string | null>(null);
  var [isSubmitting, setIsSubmitting] = useState(false);

  var fileInputRef = useRef<HTMLInputElement>(null);
  var dropdownRef = useRef<HTMLDivElement>(null);

  // Grab the current Supabase session so we can get user_id
  var session = useAuthStore(function (s) { return s.session; });

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

  // Clean up the local preview blob when component unmounts
  useEffect(function () {
    return function () {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // Sync editLocation when locationName changes (e.g., from facility detail)
  useEffect(function () {
    if (isOpen) {
      setEditLocation(locationName || '');
    }
  }, [isOpen, locationName]);

  // ---------- PHOTO HANDLING ----------
  var handlePhotoSelect = function (e: React.ChangeEvent<HTMLInputElement>) {
    var file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  var triggerFileInput = function () {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ---------- FORM RESET ----------
  var resetForm = function () {
    setFacilityType('');
    setDescription('');
    setEditLocation(locationName || '');
    setSubmitted(false);
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
  };

  // ---------- SUBMISSION LOGIC ----------
  var handleSubmit = async function () {
    setSubmitted(true);

    // -- Client-side validation --
    if (description.trim() === '') {
      showToast('Deskripsi wajib diisi!');
      return;
    }

    if (!facilityType) {
      showToast('Pilih tipe fasilitas!');
      return;
    }

    var user = session?.user;
    if (!user) {
      showToast('Anda harus login terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);

    try {
      var photoUrl: string | null = null;

      // ----- Step 1: Upload photo (if one is selected) -----
      if (photoFile) {
        // Build a unique filename to avoid collisions
        var fileExt = photoFile.name.split('.').pop() || 'jpg';
        var uniqueName = user.id + '_' + Date.now() + '.' + fileExt;

        var { error: uploadError } = await supabase.storage
          .from('report-proofs')
          .upload(uniqueName, photoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded file
        var { data: urlData } = supabase.storage
          .from('report-proofs')
          .getPublicUrl(uniqueName);

        photoUrl = urlData?.publicUrl ?? null;
      }

          // ----- Step 2: Insert report record -----
      var { error: insertError } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          facility_type: facilityType,
          location_ref: editLocation || locationName || '',
          description: description.trim(),
          photo_url: photoUrl,
          status: 'PENDING',
        });

      if (insertError) throw insertError;

      showToast('Laporan berhasil dikirim!');

      // Reset everything and close
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Report submission failed:', err);
      showToast(
        err?.message || 'Gagal mengirim laporan. Silakan coba lagi.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  var handleDiscard = function () {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  var showValidation = submitted && description.trim() === '';

  return (
    <div className={styles['report-page']} style={{
      position: 'fixed',
      inset: 0,
      zIndex: 800,
      display: isOpen ? 'flex' : 'none',
      flexDirection: 'column',
    }}>
      {/* ==================== HEADER ==================== */}
      <div className={styles['rpt-topbar']}>
        <button
          className={styles['rpt-hamburger']}
          onClick={onClose}
          aria-label="Back"
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
          {locationName ? (
            <input
              className={styles['rpt-input'] + ' ' + styles.readonly}
              value={editLocation}
              readOnly
            />
          ) : (
            <input
              className={styles['rpt-input']}
              type="text"
              placeholder="e.g. Fmipa Kering, Gymnasium"
              value={editLocation}
              onChange={function (e) { setEditLocation(e.target.value); }}
            />
          )}
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

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
            style={{ display: 'none' }}
            onChange={handlePhotoSelect}
          />

          {photoPreview ? (
            <div
              className={styles['rpt-upload-zone']}
              onClick={triggerFileInput}
              style={{
                backgroundImage: 'url(' + photoPreview + ')',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '140px',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 12,
                  background: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 12,
                }}
              >
                Tap to change photo
              </span>
            </div>
          ) : (
            <div className={styles['rpt-upload-zone']} onClick={triggerFileInput}>
              <span className={styles['rpt-upload-icon']}>📷</span>
              <span className={styles['rpt-upload-text']}>Take Photo or Upload</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================== ACTION BUTTONS ==================== */}
      <div className={styles['rpt-actions']}>
        <button
          className={styles['rpt-submit-btn']}
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={isSubmitting ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
        >
          {isSubmitting ? 'Sending...' : 'Submit Report'}
        </button>
        <button className={styles['rpt-discard-link']} onClick={handleDiscard}>
          Discard Draft
        </button>
      </div>
    </div>
  );
}