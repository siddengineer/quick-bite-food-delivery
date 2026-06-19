async function handleLogin() {
  hideError();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) { showError('Please fill in all fields.'); return; }

  const res = await API.post('/api/auth/login', { email, password });
  if (res.success) {
    window.location.href = 'index.html';
  } else {
    showError(res.message || 'Login failed.');
  }
}

async function handleDemoLogin() {
  // First try to create demo account, then log in
  await API.post('/api/auth/signup', {
    name: 'Demo User', email: 'demo@quickbite.in', phone: '9876543210',
    password: 'demo123', area: 'Koregaon Park',
    lat: 18.5362, lng: 73.8929
  });
  const res = await API.post('/api/auth/login', { email: 'demo@quickbite.in', password: 'demo123' });
  if (res.success) window.location.href = 'index.html';
  else showError('Demo login failed.');
}

async function handleSignup() {
  hideError();
  const name    = document.getElementById('fullName').value.trim();
  const email   = document.getElementById('email').value.trim();
  const phone   = document.getElementById('phone').value.trim();
  const area    = document.getElementById('areaSelect').value;
  const pw      = document.getElementById('password').value;
  const cpw     = document.getElementById('confirmPassword').value;

  if (!name)               { showError('Please enter your full name.'); return; }
  if (!email.includes('@')){ showError('Please enter a valid email.'); return; }
  if (phone.length < 10)   { showError('Enter a valid 10-digit phone number.'); return; }
  if (!area)               { showError('Please select your delivery area.'); return; }
  if (pw.length < 6)       { showError('Password must be at least 6 characters.'); return; }
  if (pw !== cpw)          { showError('Passwords do not match.'); return; }

  const coords = PUNE_AREAS[area] || { lat: 18.5308, lng: 73.8474 };
  const res = await API.post('/api/auth/signup', { name, email, phone, password: pw, area, ...coords });
  if (res.success) {
    window.location.href = 'index.html';
  } else {
    showError(res.message || 'Signup failed.');
  }
}
