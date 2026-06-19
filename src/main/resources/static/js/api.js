// ── Central API helper ────────────────────────────────────────────────────────
// All fetch calls go through here. Session cookie is sent automatically.

const API = {
  async get(path) {
    const res = await fetch(path, { credentials: 'include' });
    return res.json();
  },
  async post(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  }
};

// ── Auth helpers ──────────────────────────────────────────────────────────────
async function requireAuth() {
  const res = await API.get('/api/auth/me');
  if (!res.success) {
    const root = window.location.pathname.includes('/pages/') ? '../' : '';
    window.location.href = root + 'login.html';
    return null;
  }
  return res.data;
}

async function logout() {
  await API.post('/api/auth/logout', {});
  const root = window.location.pathname.includes('/pages/') ? '../' : '';
  window.location.href = root + 'login.html';
}

// ── Pune area → lat/lng ───────────────────────────────────────────────────────
const PUNE_AREAS = {
  "Shivajinagar":    { lat:18.5308, lng:73.8474 },
  "Koregaon Park":   { lat:18.5362, lng:73.8929 },
  "Kothrud":         { lat:18.5074, lng:73.8077 },
  "Baner":           { lat:18.5590, lng:73.7868 },
  "Aundh":           { lat:18.5590, lng:73.8088 },
  "Viman Nagar":     { lat:18.5679, lng:73.9143 },
  "Camp":            { lat:18.5195, lng:73.8781 },
  "Yerwada":         { lat:18.5553, lng:73.8952 },
  "Deccan Gymkhana": { lat:18.5162, lng:73.8416 },
  "Wakad":           { lat:18.5985, lng:73.7615 },
  "Hinjewadi":       { lat:18.5912, lng:73.7389 },
  "Hadapsar":        { lat:18.4969, lng:73.9258 },
  "Magarpatta":      { lat:18.5128, lng:73.9283 },
  "Kalyani Nagar":   { lat:18.5461, lng:73.9008 },
  "Balewadi":        { lat:18.5695, lng:73.7747 },
  "Kharadi":         { lat:18.5564, lng:73.9497 },
  "Pashan":          { lat:18.5340, lng:73.8025 },
  "FC Road":         { lat:18.5204, lng:73.8394 },
  "Kondhwa":         { lat:18.4672, lng:73.8847 },
  "Pimple Saudagar": { lat:18.6071, lng:73.7888 }
};

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function showError(msg) {
  const e = document.getElementById('errorMsg');
  if (!e) return;
  e.textContent = msg; e.style.display = 'flex';
}
function hideError() {
  const e = document.getElementById('errorMsg');
  if (e) e.style.display = 'none';
}
function togglePw(id, btn) {
  const i = document.getElementById(id);
  i.type = i.type === 'password' ? 'text' : 'password';
  btn.textContent = i.type === 'password' ? 'Show' : 'Hide';
}
