let trackMap, riderMarker, animFrame;
const TOTAL_MS = 70000;

window.addEventListener('DOMContentLoaded', async () => {
  const session = await requireAuth();
  if (!session) return;
  document.getElementById('navUserName').textContent = session.name.split(' ')[0];

  trackMap = L.map('trackMap', { zoomControl:false }).setView([session.lat, session.lng], 13);
  L.control.zoom({ position:'bottomright' }).addTo(trackMap);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom:19
  }).addTo(trackMap);

  // Load order — from sessionStorage (just placed) or API (returning)
  let order = JSON.parse(sessionStorage.getItem('activeOrder') || 'null');
  if (!order) {
    // Try fetching latest order from API
    const res = await API.get('/api/orders');
    if (res.success && res.data.length > 0) order = res.data[0];
  }

  if (!order) { document.getElementById('noOrder').style.display='block'; return; }

  const toLat = order.deliveryLat, toLng = order.deliveryLng;
  const fromLat = order.restaurantLat, fromLng = order.restaurantLng;

  const pinUser  = L.divIcon({ className:'', html:'<div class="map-pin-user"></div>',     iconSize:[20,20], iconAnchor:[10,10] });
  const pinRest  = L.divIcon({ className:'', html:'<div class="map-pin-rest"></div>',     iconSize:[16,16], iconAnchor:[8,8]   });
  const pinRider = L.divIcon({ className:'', html:'<div class="rider-pin">🛵</div>',      iconSize:[32,32], iconAnchor:[16,16] });

  L.marker([toLat, toLng],   { icon:pinUser  }).addTo(trackMap).bindPopup(`📍 ${order.deliveryArea}`);
  L.marker([fromLat, fromLng],{ icon:pinRest }).addTo(trackMap).bindPopup(`🍴 ${order.restaurantName}`);
  riderMarker = L.marker([fromLat, fromLng], { icon:pinRider }).addTo(trackMap);

  L.polyline([[fromLat,fromLng],[toLat,toLng]], { color:'#FF6B35', weight:3, dashArray:'8 6', opacity:.8 }).addTo(trackMap);
  trackMap.fitBounds([[fromLat,fromLng],[toLat,toLng]], { padding:[60,60] });

  // Populate panels
  document.getElementById('noOrder').style.display    = 'none';
  document.getElementById('orderPanel').style.display = 'block';
  document.getElementById('trackOrderId').textContent     = '#' + order.orderId;
  document.getElementById('trackRestName').textContent    = order.restaurantName;
  document.getElementById('trackDeliveryArea').textContent= order.deliveryArea + ', Pune';

  const p = order.partner;
  document.getElementById('partnerAvatar').textContent  = p.avatar;
  document.getElementById('partnerName').textContent    = p.name;
  document.getElementById('partnerVehicle').textContent = `${p.vehicle} · ${p.vNo}`;
  document.getElementById('partnerRating').textContent  = `⭐ ${p.rating}  ·  ${p.exp} yrs exp`;
  document.getElementById('partnerPhone').textContent   = p.phone;
  document.getElementById('partnerArea').textContent    = p.area + ' zone';

  let total = 0;
  document.getElementById('trackItems').innerHTML = order.items.map(i => {
    total += i.price * i.qty;
    return `<div class="track-item-line"><span>${i.name} × ${i.qty}</span><span>₹${i.price*i.qty}</span></div>`;
  }).join('') + `<div class="track-item-line total-line"><span>Total paid</span><span>₹${order.total}</span></div>`;

  const pm = { card:'💳 Card', upi:'📲 UPI', cod:'💵 Cash' };
  document.getElementById('trackPayMethod').textContent = pm[order.paymentMethod] || order.paymentMethod;

  startAnimation(fromLat, fromLng, toLat, toLng, order.eta || 30);
});

function startAnimation(fromLat, fromLng, toLat, toLng, eta) {
  const t0 = performance.now();
  function tick(now) {
    const frac = Math.min((now - t0) / TOTAL_MS, 1);
    const e = frac < .5 ? 2*frac*frac : -1+(4-2*frac)*frac;
    riderMarker.setLatLng([fromLat+(toLat-fromLat)*e, fromLng+(toLng-fromLng)*e]);
    document.getElementById('etaDisplay').textContent = frac>=1 ? 'Arrived!' : `${Math.max(0,Math.round(eta*(1-e)))} min`;
    updateSteps(e);
    if (frac < 1) animFrame = requestAnimationFrame(tick);
    else onDelivered();
  }
  animFrame = requestAnimationFrame(tick);
}

function updateSteps(frac) {
  const stages = [
    { s:'s1',l:'l1',icon:'✅',label:'Order Confirmed',  sub:'Restaurant received your order',    th:0    },
    { s:'s2',l:'l2',icon:'🍳',label:'Preparing',        sub:'Chef is cooking your food',          th:0.12 },
    { s:'s3',l:'l3',icon:'🛵',label:'On the Way',       sub:'Your rider picked up the order',     th:0.38 },
    { s:'s4',l:null,icon:'🎉',label:'Delivered!',       sub:'Enjoy your meal!',                   th:0.97 }
  ];
  let cur = stages[0];
  stages.forEach(s => { if (frac >= s.th) cur = s; });
  document.getElementById('statusIcon').textContent  = cur.icon;
  document.getElementById('statusLabel').textContent = cur.label;
  document.getElementById('statusSub').textContent   = cur.sub;
  stages.forEach((s,i) => {
    document.querySelector(`#${s.s} .sdot`).classList.toggle('done', frac >= s.th);
    if (s.l) document.getElementById(s.l).classList.toggle('done', i+1<stages.length && frac >= stages[i+1].th);
  });
}

function onDelivered() {
  document.getElementById('deliveredBanner').style.display = 'flex';
  sessionStorage.removeItem('activeOrder');
}

function resetOrder() {
  if (animFrame) cancelAnimationFrame(animFrame);
  sessionStorage.removeItem('activeOrder');
  window.location.href = '../index.html';
}
