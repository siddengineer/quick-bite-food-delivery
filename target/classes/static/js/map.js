let map, markers = {}, activeId = null, user = null;
let allRestaurants = [], sortMode = 'distance', activeCuisine = '';

const userIcon   = L.divIcon({ className:'', html:'<div class="map-pin-user"></div>',     iconSize:[20,20], iconAnchor:[10,10] });
const restIcon   = L.divIcon({ className:'', html:'<div class="map-pin-rest"></div>',     iconSize:[12,12], iconAnchor:[6,6]   });
const activeIcon = L.divIcon({ className:'', html:'<div class="map-pin-rest act"></div>', iconSize:[20,20], iconAnchor:[10,10] });

window.addEventListener('DOMContentLoaded', async () => {
  user = await requireAuth();
  if (!user) return;

  document.getElementById('navUserName').textContent = user.name.split(' ')[0];
  document.getElementById('heroName').textContent    = user.name.split(' ')[0];
  document.getElementById('heroArea').textContent    = user.area;

  // Init map
  map = L.map('map', { zoomControl:false }).setView([user.lat, user.lng], 13);
  L.control.zoom({ position:'bottomright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom:19
  }).addTo(map);
  L.marker([user.lat, user.lng], { icon:userIcon }).addTo(map)
   .bindPopup(`<b>📍 ${user.area}</b><br>Your delivery location`);

  // Load cuisine chips
  const cuisineRes = await API.get('/api/restaurants/cuisines');
  if (cuisineRes.success) buildChips(cuisineRes.data);

  // Load all restaurants
  await loadRestaurants();
});

async function loadRestaurants(q='', cuisine='') {
  document.getElementById('restaurantList').innerHTML = '<div class="loading-list">Loading restaurants…</div>';
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (cuisine) params.set('cuisine', cuisine);
  const res = await API.get('/api/restaurants?' + params.toString());
  if (!res.success) return;

  allRestaurants = res.data;
  placeMarkers(allRestaurants);
  applySort();
}

function placeMarkers(list) {
  // Remove old markers
  Object.values(markers).forEach(m => m.remove());
  markers = {};
  list.forEach(r => {
    const km = getDistanceKm(user.lat, user.lng, r.lat, r.lng).toFixed(1);
    const m = L.marker([r.lat, r.lng], { icon:restIcon }).addTo(map)
      .bindPopup(`<div class="map-popup">
        <div class="mp-head"><span class="mp-emoji">${r.emoji}</span><div>
          <strong>${r.name}</strong>
          <span class="mp-meta">${r.cuisine.split(',')[0].trim()} · ${r.priceLabel} · ⭐${r.rating}</span>
        </div></div>
        <div class="mp-row">🕐 ${r.eta} min &nbsp;·&nbsp; 📍 ${km} km</div>
        <a class="mp-link" href="pages/menu.html?id=${r.id}">View Menu →</a>
      </div>`);
    m.on('click', () => activateCard(r.id));
    markers[r.id] = m;
  });
}

function buildChips(cuisines) {
  const wrap = document.getElementById('cuisineChips');
  wrap.innerHTML = `<button class="chip active" onclick="setCuisine('')">All</button>` +
    cuisines.slice(0,14).map(c => `<button class="chip" onclick="setCuisine('${c}')">${c}</button>`).join('');
}

function setCuisine(c) {
  activeCuisine = c;
  document.querySelectorAll('.chip').forEach(el => el.classList.remove('active'));
  [...document.querySelectorAll('.chip')].find(el => el.textContent === (c||'All'))?.classList.add('active');
  const q = document.getElementById('searchInput').value.trim();
  loadRestaurants(q, c);
}

function setSortMode(mode) {
  sortMode = mode;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.toggle('active', b.dataset.sort === mode));
  applySort();
}

function applySort() {
  const sorted = [...allRestaurants].sort((a,b) => {
    if (sortMode === 'distance') return getDistanceKm(user.lat,user.lng,a.lat,a.lng) - getDistanceKm(user.lat,user.lng,b.lat,b.lng);
    if (sortMode === 'rating')   return b.rating - a.rating;
    if (sortMode === 'popular')  return b.votes - a.votes;
    return 0;
  });
  renderList(sorted);
  document.getElementById('count').textContent = sorted.length;
}

let searchTimer;
function onSearch() {
  clearTimeout(searchTimer);
  const q = document.getElementById('searchInput').value.trim();
  document.getElementById('clearBtn').style.display = q ? 'flex' : 'none';
  searchTimer = setTimeout(() => loadRestaurants(q, activeCuisine), 300);
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('clearBtn').style.display = 'none';
  loadRestaurants('', activeCuisine);
}

function renderList(list) {
  const container = document.getElementById('restaurantList');
  if (!list.length) {
    container.innerHTML = `<div class="no-results"><div style="font-size:2rem">🍽️</div><p>No restaurants found</p><small>Try a different search or cuisine</small></div>`;
    return;
  }
  container.innerHTML = list.map(r => {
    const km = getDistanceKm(user.lat, user.lng, r.lat, r.lng).toFixed(1);
    const cuisineShort = r.cuisine.split(',').slice(0,2).join(' · ');
    return `<div class="rest-card" data-id="${r.id}" onclick="handleCardClick(event,${r.id})">
      <div class="rest-card-inner">
        <div class="rest-avatar">${r.emoji}</div>
        <div class="rest-card-body">
          <div class="rest-card-name">${r.name}</div>
          <div class="rest-card-sub">${r.area}</div>
          <div class="rest-card-cuisine">${cuisineShort}</div>
          <div class="rest-card-meta">
            <span class="badge-rating">⭐ ${r.rating}</span>
            <span class="meta-pill">🕐 ${r.eta} min</span>
            <span class="meta-pill">📍 ${km} km</span>
            <span class="meta-pill price-pill">${r.priceLabel}</span>
          </div>
        </div>
      </div>
      <a class="btn-menu" href="pages/menu.html?id=${r.id}">Menu →</a>
    </div>`;
  }).join('');
}

function handleCardClick(e, id) {
  if (e.target.closest('a')) return;
  activateCard(id);
}

function activateCard(id) {
  document.querySelectorAll('.rest-card').forEach(c => c.classList.remove('active'));
  Object.entries(markers).forEach(([mid,m]) => m.setIcon(parseInt(mid)===id ? activeIcon : restIcon));
  document.querySelector(`.rest-card[data-id="${id}"]`)?.classList.add('active');
  document.querySelector(`.rest-card[data-id="${id}"]`)?.scrollIntoView({ block:'nearest', behavior:'smooth' });
  if (markers[id]) { markers[id].openPopup(); map.setView(markers[id].getLatLng(), 15, { animate:true }); }
}
