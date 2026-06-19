let draft = null;

window.addEventListener('DOMContentLoaded', async () => {
  const u = await requireAuth();
  if (!u) return;
  document.getElementById('navUserName').textContent = u.name.split(' ')[0];

  draft = JSON.parse(sessionStorage.getItem('draftOrder') || 'null');
  if (!draft) { window.location.href = '../index.html'; return; }

  document.getElementById('payRestName').textContent = draft.restaurantName;
  document.getElementById('payArea').textContent = draft.deliveryArea;
  document.getElementById('payItems').innerHTML = draft.items.map(i =>
    `<div class="pay-line"><span>${i.name} × ${i.qty}</span><span>₹${i.price*i.qty}</span></div>`
  ).join('');
  document.getElementById('paySubtotal').textContent = `₹${draft.subtotal}`;
  document.getElementById('payTax').textContent      = `₹${draft.tax}`;
  document.getElementById('payDelivery').textContent = draft.deliveryFee === 0 ? 'FREE' : `₹${draft.deliveryFee}`;
  document.getElementById('payTotal').textContent    = `₹${draft.total}`;
  document.getElementById('payBtnTotal').textContent = `₹${draft.total}`;

  // default UPI selected
  selectPayment('upi');

  // Card formatting
  document.getElementById('cardNumber')?.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  });
  document.getElementById('cardExpiry')?.addEventListener('input', function() {
    let v = this.value.replace(/\D/g,'').slice(0,4);
    if (v.length > 2) v = v.slice(0,2)+'/'+v.slice(2);
    this.value = v;
  });
});

function selectPayment(method) {
  document.querySelectorAll('.pay-method-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.pay-detail').forEach(d => d.style.display = 'none');
  document.querySelector(`.pay-method-card[data-method="${method}"]`)?.classList.add('selected');
  const det = document.getElementById(`detail-${method}`);
  if (det) det.style.display = 'block';
}

async function confirmPayment() {
  const sel = document.querySelector('.pay-method-card.selected');
  if (!sel) { showPayError('Please select a payment method.'); return; }
  const method = sel.dataset.method;

  if (method === 'card') {
    const num  = document.getElementById('cardNumber').value.replace(/\s/g,'');
    const exp  = document.getElementById('cardExpiry').value;
    const cvv  = document.getElementById('cardCVV').value;
    const name = document.getElementById('cardName').value.trim();
    if (num.length < 16 || !exp || cvv.length < 3 || !name) { showPayError('Please fill in all card details.'); return; }
  }
  if (method === 'upi') {
    const upi = document.getElementById('upiId').value.trim();
    if (!upi.includes('@')) { showPayError('Please enter a valid UPI ID (e.g. name@upi).'); return; }
  }

  const btn = document.getElementById('payBtn');
  btn.disabled = true; btn.textContent = 'Processing…';

  const res = await API.post('/api/orders', {
    restaurantId:  draft.restaurantId,
    paymentMethod: method,
    deliveryArea:  draft.deliveryArea,
    deliveryLat:   draft.deliveryLat,
    deliveryLng:   draft.deliveryLng,
    items: draft.items.map(i => ({ name: i.name, qty: i.qty, price: i.price }))
  });

  if (!res.success) {
    btn.disabled = false; btn.textContent = `Pay ₹${draft.total}`;
    showPayError(res.message || 'Order failed. Please try again.');
    return;
  }

  // Save order to sessionStorage for tracking page
  sessionStorage.setItem('activeOrder', JSON.stringify(res.data));
  sessionStorage.removeItem('draftOrder');

  // Show success overlay
  const order = res.data;
  document.getElementById('successOrderId').textContent        = order.orderId;
  document.getElementById('successPartnerName').textContent    = order.partner.name;
  document.getElementById('successPartnerVehicle').textContent = `${order.partner.vehicle} · ${order.partner.vNo}`;
  document.getElementById('successPartnerRating').textContent  = `⭐ ${order.partner.rating}`;
  document.getElementById('paySuccessOverlay').style.display   = 'flex';

  setTimeout(() => { window.location.href = 'track.html'; }, 3000);
}

function showPayError(msg) {
  const e = document.getElementById('payError');
  e.textContent = msg; e.style.display = 'block';
  setTimeout(() => e.style.display = 'none', 4000);
}
