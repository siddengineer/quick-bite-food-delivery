let cart = {}, restaurant = null, user = null;

window.addEventListener('DOMContentLoaded', async () => {
  user = await requireAuth();
  if (!user) return;
  document.getElementById('navUserName').textContent = user.name.split(' ')[0];

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { window.location.href = '../index.html'; return; }

  const res = await API.get(`/api/restaurants/${id}`);
  if (!res.success) { window.location.href = '../index.html'; return; }

  restaurant = res.data;
  document.title = `${restaurant.name} — QuickBite`;
  document.getElementById('restName').textContent = `${restaurant.emoji} ${restaurant.name}`;

  const km = getDistanceKm(user.lat, user.lng, restaurant.lat, restaurant.lng).toFixed(1);
  const cuisineShort = restaurant.cuisine.split(',').slice(0,3).join(' · ');
  document.getElementById('restMeta').innerHTML = `
    <span class="rmeta-pill">⭐ ${restaurant.rating} <span style="opacity:.6">(${restaurant.votes?.toLocaleString()})</span></span>
    <span class="rmeta-sep">·</span><span>${cuisineShort}</span>
    <span class="rmeta-sep">·</span><span>🕐 ${restaurant.eta} min</span>
    <span class="rmeta-sep">·</span><span>${restaurant.priceLabel} ₹${restaurant.costForTwo} for two</span>
    <span class="rmeta-sep">·</span><span>📍 ${km} km away</span>`;
  document.getElementById('restAddress').textContent = '📍 ' + restaurant.address;

  const topDiv = document.getElementById('topDishes');
  (restaurant.topDishes||'').split(',').filter(Boolean).forEach(d => {
    const t = document.createElement('span'); t.className='top-dish-tag'; t.textContent=d.trim(); topDiv.appendChild(t);
  });

  document.getElementById('deliveryArea').textContent = user.area;
  renderMenu(restaurant.menu || []);
});

function renderMenu(menu) {
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';
  menu.forEach(item => {
    const div = document.createElement('div');
    div.className = 'menu-card'; div.id = `mc-${item.id}`;
    div.innerHTML = `
      <div class="menu-card-body">
        <div class="menu-card-name">${item.name}</div>
        <div class="menu-card-desc">${item.description}</div>
        <div class="menu-card-price">₹${item.price}</div>
      </div>
      <div class="menu-card-action">
        <button class="btn-add" id="ba-${item.id}" onclick="addItem(${item.id},${item.price},'${item.name.replace(/'/g,"\\'")}')">+ Add</button>
        <div class="qty-ctrl" id="qc-${item.id}" style="display:none;">
          <button onclick="changeQty(${item.id},-1)">−</button>
          <span id="qv-${item.id}">0</span>
          <button onclick="changeQty(${item.id},1)">+</button>
        </div>
      </div>`;
    grid.appendChild(div);
  });
}

function addItem(id, price, name) {
  cart[id] = { qty: 1, price, name };
  document.getElementById(`ba-${id}`).style.display  = 'none';
  document.getElementById(`qc-${id}`).style.display  = 'flex';
  document.getElementById(`qv-${id}`).textContent = 1;
  renderCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) {
    delete cart[id];
    document.getElementById(`ba-${id}`).style.display = '';
    document.getElementById(`qc-${id}`).style.display = 'none';
  } else {
    document.getElementById(`qv-${id}`).textContent = cart[id].qty;
  }
  renderCart();
}

function renderCart() {
  const keys = Object.keys(cart);
  const body    = document.getElementById('cartBody');
  const footer  = document.getElementById('cartFooter');
  const empty   = document.getElementById('cartEmpty');
  const badge   = document.getElementById('cartBadge');
  const totalItems = Object.values(cart).reduce((a,c)=>a+c.qty,0);
  badge.textContent = totalItems; badge.style.display = totalItems ? 'flex' : 'none';

  if (!keys.length) { body.innerHTML=''; empty.style.display='block'; footer.style.display='none'; return; }
  empty.style.display = 'none';
  let subtotal = 0;
  body.innerHTML = keys.map(id => {
    const it = cart[id], s = it.price * it.qty; subtotal += s;
    return `<div class="cart-line"><span class="cart-line-name">${it.name} <small>× ${it.qty}</small></span><span>₹${s}</span></div>`;
  }).join('');
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 500 ? 0 : 40;
  document.getElementById('cartSubtotal').textContent = `₹${subtotal}`;
  document.getElementById('cartTax').textContent      = `₹${tax}`;
  document.getElementById('cartDelivery').textContent = deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`;
  document.getElementById('cartTotal').textContent    = `₹${subtotal+tax+deliveryFee}`;
  footer.style.display = 'block';
  window._cartData = { cart, subtotal, tax, deliveryFee, total: subtotal+tax+deliveryFee };
}

function proceedToPayment() {
  if (!Object.keys(cart).length) return;
  const d = window._cartData;
  const draft = {
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    restaurantEmoji: restaurant.emoji,
    restaurantLat: restaurant.lat,
    restaurantLng: restaurant.lng,
    restaurantAddress: restaurant.address,
    eta: restaurant.eta,
    items: Object.values(Object.fromEntries(Object.entries(cart).map(([id,v])=>[id,{name:v.name,qty:v.qty,price:v.price}]))),
    subtotal: d.subtotal, tax: d.tax, deliveryFee: d.deliveryFee, total: d.total,
    deliveryArea: user.area, deliveryLat: user.lat, deliveryLng: user.lng
  };
  sessionStorage.setItem('draftOrder', JSON.stringify(draft));
  window.location.href = 'payment.html';
}
