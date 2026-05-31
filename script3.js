const SUPABASE_URL = 'https://xikjfhqnjqetdrcxnstl.supabase.co'
const SUPABASE_KEY = 'sb_publishable_UMC2B9AoDnD9e8GsTwXwyA_B6NoaGIf'



const { createClient } = supabase
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Contoh ambil data dari tabel 'users'
async function getData() {
  const { data, error } = await _supabase
    .from('users') // sesuaikan nama tabel di db.sql
    .select('*')
  
  if (error) console.log('Error:', error)
  else console.log('Data:', data)
}
/* ============================================================
   FUNGSI NAVIGASI / PINDAH LAYAR
   ============================================================ */
function go(targetId) {
  const current = document.querySelector('.screen.active');
  const target  = document.getElementById(targetId);
  if (!target || current === target) return;

  current.classList.add('exit-left');
  setTimeout(() => current.classList.remove('active', 'exit-left'), 350);

  target.style.transform = 'translateX(30px)';
  target.classList.add('active');
  requestAnimationFrame(() => { target.style.transform = ''; });
  target.scrollTop = 0;

  if (targetId === 's-verify') {
      if (typeof startForgotTimer === 'function') startForgotTimer();
  }
  if (targetId === 's-verify-reg') {
      if (typeof startRegTimer === 'function') startRegTimer();
  }
}

async function sendOTPviaBrevo(emailTujuan, kodeOTP) {
  // Ganti dengan API Key dari dashboard Brevo kamu
  const apiKey = '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'; 
  const url = 'https://api.brevo.com/v3/smtp/email';

  const payload = {
    sender: { 
      name: "Wmap App", 
      email: "oktaares@apps.ipb.ac.id" // Sesuaikan dengan email pengirim di Brevo
    },
    to: [{ email: emailTujuan }],
    subject: "Kode Verifikasi Pendaftaran Wmap",
    htmlContent: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Selamat datang di Wmap!</h2>
        <p>Gunakan kode 4 digit di bawah ini untuk memverifikasi akun kamu:</p>
        <h1 style="color: #1D9E75; letter-spacing: 5px;">${kodeOTP}</h1>
        <p>Sustain the future 🍃</p>
      </div>
    `
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log("✅ Email OTP berhasil dikirim lewat Brevo!");
    } else {
      const errText = await response.text();
      console.error("❌ Gagal kirim email:", errText);
    }
  } catch (error) {
    console.error("❌ Error jaringan saat kirim email:", error);
  }
}

let currentRole = 'mahasiswa';

function setRole(role) {
  currentRole = role;
  const btnM = document.getElementById('role-mahasiswa');
  const btnD = document.getElementById('role-dosen');
  const nimWrap = document.getElementById('nim-field-wrap');
  const nipWrap = document.getElementById('nip-field-wrap');

  if (role === 'mahasiswa') {
    btnM.style.background = 'var(--green-mid)';
    btnM.style.borderColor = 'var(--green-mid)';
    btnM.style.color = '#fff';
    btnD.style.background = '#fff';
    btnD.style.borderColor = '#ccc';
    btnD.style.color = '#555';
    nimWrap.style.display = 'block';
    nipWrap.style.display = 'none';
  } else {
    btnD.style.background = 'var(--green-mid)';
    btnD.style.borderColor = 'var(--green-mid)';
    btnD.style.color = '#fff';
    btnM.style.background = '#fff';
    btnM.style.borderColor = '#ccc';
    btnM.style.color = '#555';
    nipWrap.style.display = 'block';
    nimWrap.style.display = 'none';
  }
}

function validateNIM(nim) {
  if (nim.length !== 11) return false;
  const firstChar = nim[0].toUpperCase();
  return firstChar >= 'A' && firstChar <= 'M';
}

function validateNIP(nip) {
  return /^\d{18}$/.test(nip);
}

function clearNimError() {
  document.getElementById('nim-error').style.display = 'none';
}

function clearNipError() {
  const nipInput = document.getElementById('reg-nip');
  const nipError = document.getElementById('nip-error');
  if (nipInput && nipError) {
    nipInput.classList.remove('error');
    nipError.classList.remove('show');
    nipError.style.display = 'none';
  }
}

let currentOTP = "";

async function startRegistrationFlow() {
  const email = document.getElementById('reg-email').value.trim();
  const pw = document.getElementById('reg-pw').value;

  if (!email || !pw) {
    alert("Email dan Password wajib diisi!");
    return;
  }

  

  let idNumber = "";

  if (currentRole === 'mahasiswa') {
    const nim = document.getElementById('reg-nim').value.trim();
    if (!validateNIM(nim)) {
      document.getElementById('nim-error').style.display = 'flex';
      return;
    }
    idNumber = nim;
    window._regRole = 'Mahasiswa';
  } else {
    const nipInput = document.getElementById('reg-nip');
    const nip = nipInput.value.trim();
    if (!validateNIP(nip)) {
      nipInput.classList.add('error');
      document.getElementById('nip-error').classList.add('show');
      document.getElementById('nip-error').style.display = 'flex';
      return;
    }
    idNumber = nip;
    window._regRole = 'Dosen';
  }

  // ==========================================
  // BAGIAN TAMBAHAN UNTUK OTP BREVO
  // ==========================================
  // 1. Buat kode OTP 4 digit secara acak
  currentOTP = Math.floor(1000 + Math.random() * 9000).toString();
  console.log("Kode OTP Kamu (Lihat ini untuk testing):", currentOTP); 

  // 2. Kirim kode OTP tersebut ke email user menggunakan fungsi Brevo
  // Pastikan kamu sudah menaruh fungsi sendOTPviaBrevo() di file js kamu
  
  await sendOTPviaBrevo(email, currentOTP);
  // ==========================================


  // Eksekusi Pendaftaran ke Supabase
  const { data, error } = await _supabase.auth.signUp({
    email: email,
    password: pw,
    options: {
      data: {
        role: window._regRole,
        identifier: idNumber
      }
    }
  });

  if (error) {
    alert("Gagal mendaftar: " + error.message);
    return;
  }

  // Insert ke tabel users (opsional jika dibutuhkan)
  if (data.user) {
    const { error: dbError } = await _supabase
      .from('users') 
      .insert([
        {
          id: data.user.id, 
          email: email,
          role: window._regRole,
          nim: window._regRole === 'Mahasiswa' ? idNumber : null,
          nip: window._regRole === 'Dosen' ? idNumber : null,
          is_verified: false
        } 
      ]);
    if (dbError) {
      console.log("Error insert ke tabel users:", dbError);
    }
  }

  // Pindah layar ke verifikasi
  document.getElementById('email-display').textContent = email;
  go('s-verify-reg');
  
  if (typeof updateStep === 'function') updateStep(2);
  if (typeof startRegTimer === 'function') startRegTimer();
}

function togglePw(id, btn) {
  const inp  = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type   = show ? 'text' : 'password';
  btn.innerHTML = show
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}

/* ---- OTP inputs ---- */
function setupOtp(ids) {
  const inputs = ids.map(id => document.getElementById(id));
  inputs.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
    });
  });
}

/* ---- Timers ---- */
function makeTimer(displayId, resendId, seconds) {
  let s   = seconds;
  const disp = document.getElementById(displayId);
  const btn  = document.getElementById(resendId);
  if (btn) { btn.disabled = true; btn.classList.remove('active'); }

  const iv = setInterval(() => {
    s--;
    const m   = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    if (disp) disp.textContent = m + ' : ' + sec;
    if (s <= 0) {
      clearInterval(iv);
      if (btn) { btn.disabled = false; btn.classList.add('active'); }
    }
  }, 1000);
  return iv;
}

let regTimerIv, forgotTimerIv;

function startRegTimer() {
  clearInterval(regTimerIv);
  document.getElementById('reg-timer').textContent = '01 : 00';
  regTimerIv = makeTimer('reg-timer', 'reg-resend', 60);
}

function startForgotTimer() {
  clearInterval(forgotTimerIv);
  document.getElementById('forgot-timer').textContent = '00 : 40';
  forgotTimerIv = makeTimer('forgot-timer', 'forgot-resend', 40);
}

function restartTimer() { startRegTimer(); }

function updateStep(n) {
  ['step1', 'step2', 'step3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'step-dot' + (i < n - 1 ? ' done' : i === n - 1 ? ' active' : '');
  });
}

function showSuccess() {
  const ov     = document.getElementById('success');
  const circle = ov.querySelector('.success-circle svg');
  ov.classList.add('show');
  circle.classList.remove('check-anim');
  void circle.offsetWidth;
  circle.classList.add('check-anim');
}

function goToLogin() {
  const ov = document.getElementById('success');
  if (ov) ov.classList.remove('show');
    go('s-login');
}

/* ============================================================
   APP TRANSITION
   ============================================================ */
let appReady = false;

function showMainApp() {
  document.getElementById('auth-wrapper').style.display = 'none';
  const app = document.getElementById('main-app');
  app.style.display = 'flex';
  document.body.style.background = '#EEF4F1';

  if (!appReady) {
    appReady = true;
    setTimeout(() => {
      initMap();
      renderMarkers();
      renderTrashMarkers();
      renderLeaderboard();
      if (navigator.permissions) {
  navigator.permissions.query({ name: 'geolocation' }).then(result => {
    if (result.state === 'denied') {
      showToast('📍 Aktifkan lokasi di browser kamu dulu ya!');
    } else {
      startWatchLocation();
    }
  });
} else {
  startWatchLocation();
}
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && watchId === null) startWatchLocation();
      });
      setTimeout(() => { if (mapInstance) mapInstance.invalidateSize(); }, 200);
    }, 50);
  } else {
    if (mapInstance) mapInstance.invalidateSize();
  }
}

/* ============================================================
   MAP DATA
   ============================================================ */
const waterStations = [
  {
    name: "Waste Bin Fmipa Kering",
    lat: -6.5578691, lng: 106.7310589,
    addr: "1st floor fmipa kering",
    fullAddr: "Babakan, Dramaga, Bogor Regency, West Java 16680",
    rating: 5.0, reviews: 5,
    comments: [
      { name: "Ziggy Zagga",  avatar: "ZZ", time: "5 month ago", stars: 5, text: "Alat bagus bermanfaat" },
      { name: "Halilintar",   avatar: "HL", time: "5 month ago", stars: 4, text: "Alat bekerja dengan baik dan airnya enak diminum" },
    ]
  },
  {
    name: "CCR 1.09",
    lat: -6.5565914, lng: 106.7312138,
    addr: "CCR Lantai 1 Ruang 1.09",
    fullAddr: "CCR Lantai 1, IPB Dramaga, Bogor 16680",
    rating: 4.1, reviews: 11,
    comments: [
      { name: "Citra P.", avatar: "CP", time: "5 jam lalu", stars: 4, text: "Bersih dan mudah diakses." },
    ]
  },
  {
    name: "Satari",
    lat: -6.5553873, lng: 106.7240151,
    addr: "Gedung Satari IPB",
    fullAddr: "Gedung Satari, IPB Dramaga, Bogor 16680",
    rating: 4.3, reviews: 22,
    comments: [
      { name: "Dimas F.", avatar: "DF", time: "kemarin", stars: 4, text: "Aliran airnya kencang." },
      { name: "Elisa T.", avatar: "ET", time: "2hr lalu", stars: 5, text: "Favorit anak FMIPA!" },
    ]
  },
  {
    name: "Fahutan",
    lat: -6.55683, lng: 106.73063,
    addr: "Fak. Kehutanan IPB",
    fullAddr: "Gedung Fahutan, IPB Dramaga, Bogor 16680",
    rating: 4.0, reviews: 9,
    comments: [
      { name: "Farhan M.", avatar: "FM", time: "3j lalu", stars: 4, text: "Lumayan, tapi perlu lebih sering dibersihkan." },
    ]
  },
];

const trashBins = [
  { name: "Dekat Gedung Fisika",   lat: -6.5574908, lng: 106.7309288, addr: "Sekitar Gedung Fisika FMIPA" },
  { name: "CCR 1.10",              lat: -6.5565938, lng: 106.7313097, addr: "CCR Lantai 1 Ruang 1.10" },
  { name: "Sekret SSMI",           lat: -6.5561871, lng: 106.7310857, addr: "Sekretariat SSMI" },
  { name: "CCR 2.14",              lat: -6.5565555, lng: 106.7311893, addr: "CCR Lantai 2 Ruang 2.14" },
  { name: "Parkir Satari",         lat: -6.5551782, lng: 106.7242776, addr: "Area Parkir Gedung Satari" },
  { name: "Student Corner FMIPA",  lat: -6.55790,   lng: 106.73109,   addr: "Student Corner FMIPA" },
  { name: "Golden Corner",         lat: -6.55782,   lng: 106.73132,   addr: "Golden Corner Area" },
  { name: "CCR Belakang",          lat: -6.55669,   lng: 106.73163,   addr: "CCR Sisi Belakang" },
  { name: "CCR 1.03",              lat: -6.55620,   lng: 106.73092,   addr: "CCR Lantai 1 Ruang 1.03" },
  { name: "CCR Depan (DPKU)",      lat: -6.55630,   lng: 106.73121,   addr: "CCR Depan / DPKU" },
];

const stationStatuses = ['active', 'inactive', 'active', 'active'];
const trashStatuses   = ['active', 'active', 'repair', 'active', 'active', 'active', 'active', 'active', 'inactive', 'active'];

/* ============================================================
   MAP INSTANCE
   ============================================================ */
let mapInstance    = null;
let stationMarkers = [];
let trashMarkers   = [];
let userMarker     = null, accuracyCircle = null, watchId = null;
let activeStation  = null, nearestStation = null, nearestTrash = null;
let userLat        = null, userLng = null, firstFix = true;
let showTrashLayer = true, showWaterLayer = true;
let routeLayer     = null, routeTarget = null, routeMode = 'foot-walking';
let reviewRating   = 0;
let modalMiniMap = null;
let modalMiniMarker = null;

/* ---- Custom icons ---- */
const makeWaterIcon = (status) => {
  const colors = { active: '#1D9E75', inactive: '#E24B4A', repair: '#C17B42' };
  const c = colors[status] || '#1D9E75';
  return L.divIcon({
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
};

const makeTrashIcon = (status) => {
  const colors = { active: '#1D9E75', inactive: '#E24B4A', repair: '#C17B42' };
  const c = colors[status] || '#1D9E75';
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
      <div style="background:white;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:3px solid ${c};box-shadow:0 4px 14px rgba(0,0,0,0.2);">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </div>
      <div style="width:2px;height:10px;background:${c};margin-top:-1px;"></div>
      <div style="width:8px;height:8px;border-radius:50%;background:${c};margin-top:-1px;"></div>
    </div>`,
    iconSize: [44, 64], iconAnchor: [22, 64], popupAnchor: [0, -64]
  });
};

const userIcon = L.divIcon({
  className: '',
  html: `<div style="background:#185FA5;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;border:3px solid white;box-shadow:0 3px 10px rgba(24,95,165,0.4);">🔵</div>`,
  iconSize: [28, 28], iconAnchor: [14, 14]
});

/* ---- Init ---- */
function initMap() {
  if (mapInstance) return;
  mapInstance = L.map('map', { zoomControl: false }).setView([-6.5575, 106.7265], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19
  }).addTo(mapInstance);
}

function renderMarkers() {
  stationMarkers = waterStations.map((s, i) => {
    const status = stationStatuses[i] || 'active';
    const m = L.marker([s.lat, s.lng], { icon: makeWaterIcon(status) }).addTo(mapInstance);
    m.on('click', () => {
  if (status === 'inactive') {
    showToast('⚠️ Refill air sedang tidak berfungsi');
    return;
  }
  openStationModal(s, userLat ? haversine(userLat, userLng, s.lat, s.lng) : null);
});
    return { ...s, marker: m, status };
  });
}

function renderTrashMarkers() {
  trashMarkers = trashBins.map((t, i) => {
    const status = trashStatuses[i] || 'active';
    const m = L.marker([t.lat, t.lng], { icon: makeTrashIcon(status) }).addTo(mapInstance);
    m.on('click', () => {
  if (status === 'inactive') {
    showToast('⚠️ Tempat sampah sedang tidak tersedia');
    return;
  }
  openTrashModal(t);
});

    return { ...t, marker: m, status };
  });
}

/* ============================================================
   MAP CONTROLS
   ============================================================ */
function toggleLayer(type) {
  if (type === 'water') {
    showWaterLayer = !showWaterLayer;
    stationMarkers.forEach(sm => showWaterLayer
      ? mapInstance.addLayer(sm.marker)
      : mapInstance.removeLayer(sm.marker));
    document.getElementById('btnToggleWater').style.opacity = showWaterLayer ? '1' : '0.45';
  } else {
    showTrashLayer = !showTrashLayer;
    trashMarkers.forEach(tm => showTrashLayer
      ? mapInstance.addLayer(tm.marker)
      : mapInstance.removeLayer(tm.marker));
    document.getElementById('btnToggleTrash').style.opacity = showTrashLayer ? '1' : '0.45';
  }
}

function startWatchLocation() {
  if (!navigator.geolocation) return;
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  firstFix = true;
  watchId = navigator.geolocation.watchPosition(
    onLocationUpdate,
    onLocationError,
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 }
  );
}

function onLocationUpdate(pos) {
  userLat = pos.coords.latitude;
  userLng = pos.coords.longitude;
  const acc = Math.round(pos.coords.accuracy);

  if (!mapInstance) return;

  if (userMarker) userMarker.setLatLng([userLat, userLng]);
  else userMarker = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstance);

  if (accuracyCircle) accuracyCircle.setLatLng([userLat, userLng]).setRadius(acc);
  else accuracyCircle = L.circle([userLat, userLng], {
    radius: acc, color: '#185FA5', fillColor: '#185FA5',
    fillOpacity: 0.1, weight: 1.5, dashArray: '4'
  }).addTo(mapInstance);

  const accLabel = document.getElementById('accuracyLabel');
  if (accLabel) { accLabel.style.display = 'block'; accLabel.textContent = `±${acc}m`; }

  ['btnCenter', 'btnNearest', 'btnNearestTrash'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'flex';
  });

  if (firstFix) {
    firstFix = false;
    mapInstance.setView([userLat, userLng], 16, { animate: true });
  }

  nearestStation = waterStations
    .map(s => ({ ...s, dist: haversine(userLat, userLng, s.lat, s.lng) }))
    .sort((a, b) => a.dist - b.dist)[0];

  nearestTrash = trashBins
    .map(t => ({ ...t, dist: haversine(userLat, userLng, t.lat, t.lng) }))
    .sort((a, b) => a.dist - b.dist)[0];
}

function onLocationError(err) {
  if (err.code === 1) {
    // Permission denied
    showToast('📍 Aktifkan lokasi di browser kamu dulu ya!');
  } else if (err.code === err.TIMEOUT) {
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    watchId = navigator.geolocation.watchPosition(
      onLocationUpdate, () => {},
      { enableHighAccuracy: false, maximumAge: 15000, timeout: 20000 }
    );
  }
}

function centerOnUser() {
  if (userLat === null) { showToast('⚠️ Lokasi belum tersedia'); return; }
  mapInstance.setView([userLat, userLng], 17, { animate: true });
}

function goToNearest() {
  if (!nearestStation) { showToast('⚠️ Lokasi belum tersedia'); return; }
  mapInstance.fitBounds(
    L.latLngBounds([userLat, userLng], [nearestStation.lat, nearestStation.lng]),
    { padding: [50, 50], animate: true }
  );
  setTimeout(() => openStationModal(nearestStation, haversine(userLat, userLng, nearestStation.lat, nearestStation.lng)), 600);
}

function goToNearestTrash() {
  if (!nearestTrash) { showToast('⚠️ Lokasi belum tersedia'); return; }
  mapInstance.fitBounds(
    L.latLngBounds([userLat, userLng], [nearestTrash.lat, nearestTrash.lng]),
    { padding: [50, 50], animate: true }
  );
  setTimeout(() => openTrashModal(nearestTrash), 600);
}

function navigateToActive() {
  if (!activeStation) return;
  document.getElementById('stationModal').classList.remove('open');
  drawRoute(activeStation);
}

/* ============================================================
   MODALS
   ============================================================ */
function openStationModal(station, dist) {
  activeStation = station;
  reviewRating  = 0;

  document.getElementById('modal-name').textContent      = station.name;
  document.getElementById('modal-addr').textContent      = station.addr;
  const distEl = document.getElementById('modal-dist');
if (distEl) {
  distEl.textContent = dist ? `📍 ~${Math.round(dist * 1000)} meter dari lokasi kamu` : '';
}
  document.getElementById('modal-full-addr').textContent = station.fullAddr || 'Babakan, Dramaga, Bogor Regency, West Java 16680';

  const avg    = station.rating;
  const filled = Math.round(avg);
  document.getElementById('modal-avg-rating').textContent  = avg.toFixed(1);
  document.getElementById('review-avg-big').textContent    = avg.toFixed(1);
  document.getElementById('modal-stars-sm').textContent    = '★'.repeat(filled) + '☆'.repeat(5 - filled);
  document.getElementById('modal-rating-count').textContent = `(${station.reviews})`;

  const bars = document.getElementById('review-bars');
  bars.innerHTML = '';
  for (let i = 5; i >= 1; i--) {
    const pct = i === 5 ? 100 : 0;
    bars.innerHTML += `<div class="review-bar-row">
      <span class="review-bar-lbl">${i}</span>
      <div class="review-bar-track"><div class="review-bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }

  const qs = document.getElementById('quick-stars');
  qs.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement('span');
    s.textContent = '☆';
    s.style.cssText = 'font-size:22px;color:#ddd;cursor:pointer;';
    s.onclick = () => {
      reviewRating = i;
      Array.from(qs.children).forEach((el, idx) => el.style.color = idx < i ? '#F5A623' : '#ddd');
    };
    qs.appendChild(s);
  }

  const cl = document.getElementById('comments-list');
  cl.innerHTML = '';
  (station.comments || []).forEach(c => {
    cl.innerHTML += `<div class="comment-item">
      <div class="comment-avatar">
        <div style="width:100%;height:100%;background:linear-gradient(135deg,#9FE1CB,#1D9E75);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;">${c.avatar}</div>
      </div>
      <div class="comment-body">
        <div class="comment-name">${c.name}</div>
        <div class="comment-time">${'★'.repeat(c.stars)}${'☆'.repeat(5 - c.stars)} · ${c.time}</div>
        <div class="comment-text">${c.text}</div>
      </div>
      <button class="comment-more">⋯</button>
    </div>`;
  });

    // TC_FASILITAS_001: Tampilkan mini map lokasi water station
setTimeout(() => {
  if (!modalMiniMap) {
    modalMiniMap = L.map('modalMiniMap', {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      attributionControl: false
    }).setView([station.lat, station.lng], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(modalMiniMap);
  } else {
    modalMiniMap.setView([station.lat, station.lng], 17);
    if (modalMiniMarker) modalMiniMap.removeLayer(modalMiniMarker);
  }
  modalMiniMarker = L.marker([station.lat, station.lng], {
    icon: makeWaterIcon(stationStatuses[waterStations.indexOf(station)] || 'active')
  }).addTo(modalMiniMap);
  modalMiniMap.invalidateSize();
}, 100);

  document.getElementById('stationModal').classList.add('open');
}

function openTrashModal(bin) {
  document.getElementById('trash-modal-name').textContent = bin.name;
  document.getElementById('trash-modal-addr').textContent = bin.addr;
  const dist = userLat ? haversine(userLat, userLng, bin.lat, bin.lng) : null;
  document.getElementById('trash-modal-dist').textContent = dist
    ? `🗑 ~${Math.round(dist * 1000)} meter`
    : '🗑 IPB Dramaga';

  // ✅ TAMBAHAN TC_FASILITAS_002 — taruh di sini
  const trashIdx = trashBins.indexOf(bin);
  const trashStatus = trashStatuses[trashIdx] || 'active';
  const statusLabels = {
    active:   { label: '✅ Tersedia',          color: '#1D9E75' },
    inactive: { label: '❌ Tidak Tersedia',    color: '#E24B4A' },
    repair:   { label: '🔧 Sedang Diperbaiki', color: '#C17B42' }
  };
  const st = statusLabels[trashStatus];
  let statusEl = document.getElementById('trash-modal-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'trash-modal-status';
    statusEl.style.cssText = 'font-size:13px;font-weight:700;margin-top:8px;padding:5px 12px;border-radius:20px;display:inline-block;';
    document.getElementById('trash-modal-dist').parentNode.appendChild(statusEl);
  }
  statusEl.textContent = st.label;
  statusEl.style.color = st.color;
  statusEl.style.background = st.color + '18';
  // ✅ SELESAI TAMBAHAN

  document.getElementById('trashModal').classList.add('open');
}

function navigateToTrash() {
  const name = document.getElementById('trash-modal-name').textContent;
  const bin  = trashBins.find(t => t.name === name);
  if (!bin) return;
  document.getElementById('trashModal').classList.remove('open');
  drawRoute(bin);
}

function openAddReview() {
  document.getElementById('add-review-station-name').textContent = activeStation?.name || '';
  document.getElementById('review-text').value = '';
  document.querySelectorAll('.big-star').forEach(s => { s.textContent = '☆'; s.classList.remove('sel'); });
  reviewRating = 0;
  document.getElementById('addReviewModal').classList.add('open');
}

function closeAddReview() {
  document.getElementById('addReviewModal').classList.remove('open');
}

function submitReview() {
  const text = document.getElementById('review-text').value.trim();
  if (!reviewRating) { showToast('⚠️ Beri rating dulu'); return; }
  if (!text)          { showToast('⚠️ Tulis ulasan dulu'); return; }
  if (activeStation) {
    activeStation.comments.unshift({ name: 'Ziggy Zagga', avatar: 'ZZ', time: 'baru saja', stars: reviewRating, text });
    activeStation.reviews++;
    // TC_ULASAN_001: recalculate rating
    const total = activeStation.comments.reduce((sum, c) => sum + c.stars, 0);
    activeStation.rating = parseFloat((total / activeStation.comments.length).toFixed(1));
  }
  closeAddReview();
  showToast('✅ Ulasan berhasil diposting!'); // TC_ULASAN_001
}

function openReport() {
  document.getElementById('report-station-name').textContent = activeStation?.name || '';
  document.getElementById('stationModal').classList.remove('open');
  document.getElementById('reportModal').classList.add('open');
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  ['report-name', 'report-contact', 'report-desc'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('report-urgency').value = '';
}

function toggleChip(el) { el.classList.toggle('selected'); }

function submitReport() {
  const name    = document.getElementById('report-name').value.trim();
  const desc    = document.getElementById('report-desc').value.trim();
  const urgency = document.getElementById('report-urgency').value;
  if (!name)    { showToast('⚠️ Nama wajib diisi'); return; }
  if (!desc)    { showToast('⚠️ Deskripsi wajib diisi'); return; }
  if (!urgency) { showToast('⚠️ Pilih tingkat urgensi'); return; }
  document.getElementById('reportModal').classList.remove('open');
  showToast('🚨 Laporan berhasil dikirim!');

    userPoints += 10;
  updatePointsDisplay();

  const activity = {
    icon: '📋',
    name: `Report: ${document.getElementById('report-station-name').textContent}`,
    time: 'Baru saja · ' + (document.querySelectorAll('.chip.selected').length > 0
      ? document.querySelector('.chip.selected').textContent
      : 'Laporan dikirim'),
    pts: '+10 pt'
  };
  addActivityToList(activity);

  showToast('📋 Report dicatat! +10 pt');
}



function logStart()  { showToast('✅ Navigasi dimulai!'); }

let userPoints = 2450; // variabel poin user (sesuaikan dengan state global kamu)

function logRefill() {
  // TC_AKTIVITAS_001 & TC_AKTIVITAS_002
  if (!activeStation) { showToast('⚠️ Tidak ada stasiun yang dipilih'); return; }

  const idx = waterStations.indexOf(activeStation);
  const status = stationStatuses[idx] || 'active';

  if (status !== 'active') {
    // TC_AKTIVITAS_002: fasilitas tidak aktif → rollback & tolak
    showToast('❌ Log Refill ditolak!');
    return;
  }

  // TC_AKTIVITAS_001: valid → catat aktivitas & tambah poin
  userPoints += 10;
  updatePointsDisplay();

  const activity = {
    icon: '💧',
    name: `Refill water at ${activeStation.name}`,
    time: 'Baru saja · 500ml refilled',
    pts: '+10 pt'
  };
  addActivityToList(activity);

  showToast('💧 Refill dicatat! +10 pt');
}

/* ============================================================
   SIDEBAR
   ============================================================ */
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

function toggleSidebarGroup(groupEl) { groupEl.classList.toggle('open'); }

/* ============================================================
   ROUTING
   ============================================================ */
const OSRM_PROFILE = {
  'foot-walking':    'foot',
  'cycling-regular': 'bike',
  'driving-car':     'car'
};

async function drawRoute(station) {
  if (userLat === null) { showToast('⚠️ Tunggu GPS aktif dulu'); return; }
  routeTarget = station;
  if (routeLayer) { mapInstance.removeLayer(routeLayer); routeLayer = null; }

  const profile = OSRM_PROFILE[routeMode];
  const url = `https://router.project-osrm.org/route/v1/${profile}/${userLng},${userLat};${station.lng},${station.lat}?overview=full&geometries=geojson`;
  showToast('🗺 Menghitung rute...');

  try {
    const res  = await fetch(url);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes.length) { showToast('⚠️ Rute tidak ditemukan'); return; }

    const route    = data.routes[0];
    const coords   = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const distText = route.distance < 1000
      ? `${Math.round(route.distance)} m`
      : `${(route.distance / 1000).toFixed(1)} km`;

    const speeds   = { 'foot-walking': 5, 'cycling-regular': 15, 'driving-car': 40 };
    const mins     = Math.round((route.distance / 1000) / speeds[routeMode] * 60);
    const timeText = mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}j ${mins % 60}m`;

    routeLayer = L.polyline(coords, {
      color: '#185FA5', weight: 5, opacity: 0.85, lineJoin: 'round',
      dashArray: routeMode === 'foot-walking' ? '8,6' : null
    }).addTo(mapInstance);

    mapInstance.fitBounds(routeLayer.getBounds(), { padding: [40, 40], animate: true });

    document.getElementById('routeDest').textContent = station.name;
    document.getElementById('routeDist').textContent = distText;
    document.getElementById('routeTime').textContent = `~${timeText}`;
    document.getElementById('routePanel').classList.add('visible');
    showToast(`✅ ${distText} · ~${timeText}`);
  } catch (e) {
    showToast('⚠️ Gagal mengambil rute. Cek koneksi.');
  }
}

function clearRoute() {
  if (routeLayer) { mapInstance.removeLayer(routeLayer); routeLayer = null; }
  routeTarget = null;
  document.getElementById('routePanel').classList.remove('visible');
}

function switchMode(btn) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  routeMode = btn.dataset.mode;
  if (routeTarget) drawRoute(routeTarget);
}

/* ============================================================
   TOAST & UTILS
   ============================================================ */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function haversine(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a    = Math.sin(dLat / 2) ** 2
             + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(d) { return d * Math.PI / 180; }

async function verifyOTP() {
  const input = 
    document.getElementById('otp-r-1').value +
    document.getElementById('otp-r-2').value +
    document.getElementById('otp-r-3').value +
    document.getElementById('otp-r-4').value;

  if (input.length < 4) {
    showToast('⚠️ Masukkan 4 digit kode OTP');
    return;
  }

if (input === currentOTP) {
    // Auto update is_verified ke true
    const { data: { session } } = await _supabase.auth.getSession();
    if (session?.user?.id) {
        await _supabase
            .from('users')
            .update({ is_verified: true })
            .eq('id', session.user.id);
    }
    showSuccess();

  } else {
    showToast('❌ Kode OTP salah, coba lagi');
    // Kosongkan input
    ['otp-r-1','otp-r-2','otp-r-3','otp-r-4'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('otp-r-1').focus();
  }
}

async function handleLogout() {
  await _supabase.auth.signOut();
  appReady = false;
  document.getElementById('profilePanel').classList.remove('open');
  document.getElementById('main-app').style.display = 'none';
  document.getElementById('auth-wrapper').style.display = 'flex';
  go('s-login');
}

function showTab(tab, btn) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const panel = document.getElementById('profilePanel');
  if (tab === 'profile') {
    _supabase.auth.getSession().then(({ data: { session } }) => {
      const el = document.getElementById('profile-email-display');
      if (el && session?.user?.email) el.textContent = session.user.email;
    });
    panel.classList.add('open');
  } else {
    panel.classList.remove('open');
  }
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-pw').value;
  if (!email || !pw) { alert('Email dan password wajib diisi!'); return; }

  const { data, error } = await _supabase.auth.signInWithPassword({ email, password: pw });
  if (error) { alert('Login gagal: ' + error.message); return; }
  showMainApp();
}

function searchStations(query) {
  const q = query.toLowerCase().trim();
  const dropdown = document.getElementById('mapSearchDropdown');
  const results = [];

  // Filter markers di peta
  stationMarkers.forEach(sm => {
    const match = !q || sm.name.toLowerCase().includes(q) || sm.addr.toLowerCase().includes(q);
    match ? mapInstance.addLayer(sm.marker) : mapInstance.removeLayer(sm.marker);
    if (q && match) results.push({ icon: '💧', name: sm.name, addr: sm.addr, lat: sm.lat, lng: sm.lng });
  });
  trashMarkers.forEach(tm => {
    const match = !q || tm.name.toLowerCase().includes(q) || tm.addr.toLowerCase().includes(q);
    match ? mapInstance.addLayer(tm.marker) : mapInstance.removeLayer(tm.marker);
    if (q && match) results.push({ icon: '🗑', name: tm.name, addr: tm.addr, lat: tm.lat, lng: tm.lng });
  });

  // Render dropdown
  if (!q) { dropdown.classList.remove('open'); return; }

  if (results.length === 0) {
    dropdown.innerHTML = `<div class="dropdown-empty">Tidak ditemukan hasil untuk "<b>${q}</b>"</div>`;
  } else {
    dropdown.innerHTML = results.map(r => `
      <div class="dropdown-item" onclick="flyToResult(${r.lat}, ${r.lng})">
        <span class="dropdown-item-icon">${r.icon}</span>
        <div class="dropdown-item-info">
          <span class="dropdown-item-name">${r.name}</span>
          <span class="dropdown-item-addr">${r.addr}</span>
        </div>
      </div>
    `).join('');
  }
  dropdown.classList.add('open');
}

function flyToResult(lat, lng) {
  mapInstance.setView([lat, lng], 18, { animate: true });
  closeSearchDropdown();
}

function closeSearchDropdown() {
  document.getElementById('mapSearchDropdown').classList.remove('open');
}



function updatePointsDisplay() {
  const pointEl = document.querySelector('.mini-stat-num');
  if (pointEl) pointEl.textContent = userPoints.toLocaleString('id-ID');
}

function addActivityToList(activity) {
  const list = document.querySelector('.activity-list');
  if (!list) return;

  const item = document.createElement('div');
  item.className = 'act-item';
  item.innerHTML = `
    <div class="act-icon">${activity.icon}</div>
    <div class="act-info">
      <div class="act-name">${activity.name}</div>
      <div class="act-time">${activity.time}</div>
    </div>
    <div class="act-pts">${activity.pts}</div>
  `;
  list.insertBefore(item, list.firstChild);
}


/* ============================================================
   LEADERBOARD (TC_LEADERBOARD_001)
   ============================================================ */
const leaderboardData = [
  { name: 'Ziggy Zagga', role: 'You',          pts: 2450 },
  { name: 'Khautal',     role: 'TOP RECYCLER', pts: 2150 },
  { name: 'Krespo',      role: 'ECO WARRIOR',  pts: 2000 },
];

function renderLeaderboard() {
  // Sort descending by poin — TC_LEADERBOARD_001
  const sorted = [...leaderboardData].sort((a, b) => b.pts - a.pts);
  const rankClasses = ['gold', 'silver', 'bronze'];
  const list = document.querySelector('.leaderboard-list');
  if (!list) return;

  list.innerHTML = sorted.map((user, i) => `
    <div class="lb-item">
      <div class="lb-rank ${rankClasses[i] || ''}">${i + 1}</div>
      <div class="lb-avatar">🧑</div>
      <div class="lb-info">
        <div class="lb-name">${user.name}</div>
        <div class="lb-role">${user.role}</div>
      </div>
      <div style="text-align:right;">
        <div class="lb-pts">${user.pts.toLocaleString('id-ID')}</div>
        <div class="lb-pts-lbl">POINTS</div>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   INIT ON DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // Cek session dulu
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) {
    document.getElementById('auth-wrapper').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
  } else {
    showMainApp();
  }
  
  /* OTP setup */
  setupOtp(['otp-r-1', 'otp-r-2', 'otp-r-3', 'otp-r-4']);
  setupOtp(['otp-f-1', 'otp-f-2', 'otp-f-3', 'otp-f-4']);

  /* Big star rating in add-review modal */
  document.querySelectorAll('.big-star').forEach(s => {
    s.addEventListener('click', () => {
      reviewRating = parseInt(s.dataset.v);
      document.querySelectorAll('.big-star').forEach((el, i) => {
        el.textContent = i < reviewRating ? '★' : '☆';
        el.classList.toggle('sel', i < reviewRating);
      });
    });
  });

  /* Close modals on backdrop click */
  ['stationModal', 'reportModal', 'trashModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target === e.currentTarget) document.getElementById(id).classList.remove('open');
    });
  });

  /* Sign-in button */
 const loginBtn = document.querySelector('#s-login .btn-primary');
if (loginBtn) loginBtn.addEventListener('click', handleLogin);
});