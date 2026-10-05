const adminUser = JSON.parse(localStorage.getItem('abinaUser') || 'null');
const loginBox = document.getElementById('loginBox');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');

// --- Seed admin email check ---
// Admin = any user with role 'admin'
// We'll create the admin via a special register (see note below)

if (adminUser && adminUser.role === 'admin') showDashboard();

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/api/login', {
    method: 'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.success && data.user.role === 'admin') {
    localStorage.setItem('abinaUser', JSON.stringify(data.user));
    showDashboard();
  } else {
    document.getElementById('loginStatus').className = 'alert alert-error';
    document.getElementById('loginStatus').textContent = '❌ Not an admin account';
  }
});

logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('abinaUser');
  location.reload();
});

function showDashboard() {
  loginBox.style.display = 'none';
  dashboard.style.display = 'block';
  logoutBtn.style.display = 'inline';
  renderAdminTab('users');
}

document.querySelectorAll('.tabs button').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    renderAdminTab(b.dataset.tab);
  });
});

async function renderAdminTab(tab) {
  const box = document.getElementById('adminContent');
  box.innerHTML = '<p>Loading...</p>';

  if (tab === 'users') {
    const users = await (await fetch('/api/designers')).json();
    const all = []; // simple: designers only + we can extend
    box.innerHTML = `<h3>Designers (${users.length})</h3>` + users.map(u => `
      <div class="booking-card">
        <h4>${u.name} — ${u.email}</h4>
        <p class="meta">Specialty: ${u.specialty || '—'}</p>
        <p class="meta">Role: ${u.role}</p>
      </div>`).join('');
  }

  if (tab === 'bookings') {
    const bookings = await (await fetch('/api/bookings')).json();
    box.innerHTML = `<h3>All Bookings (${bookings.length})</h3>` + bookings.map(b => `
      <div class="booking-card">
        <h4>${b.packageName} — ₹${b.packagePrice}</h4>
        <p class="meta">Customer: ${b.customerName} → Designer: ${b.designerName}</p>
        <p class="meta">📅 ${b.date} at ${b.time}</p>
        <p class="meta"><span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span></p>
      </div>`).join('');
  }

  if (tab === 'designs') {
    const designs = await (await fetch('/api/designs')).json();
    box.innerHTML = `<h3>All Designs (${designs.length})</h3><div class="gallery">` + designs.map(d => `
      <div class="card">
        <img src="${d.image}" onerror="this.src='https://via.placeholder.com/400x200'">
        <div class="card-body">
          <h3>${d.title}</h3><p>${d.description}</p>
          <button class="btn btn-small btn-danger" onclick="adminDel('designs','${d._id}')">Delete</button>
        </div>
      </div>`).join('') + '</div>';
  }

  if (tab === 'messages') {
    const msgs = await (await fetch('/api/messages')).json();
    box.innerHTML = `<h3>Messages (${msgs.length})</h3>` + msgs.map(m => `
      <div class="booking-card">
        <h4>${m.name} — ${m.email}</h4>
        <p>${m.message}</p>
        <button class="btn btn-small btn-danger" onclick="adminDel('messages','${m._id}')">Delete</button>
      </div>`).join('');
  }

  if (tab === 'reviews') {
    const reviews = await (await fetch('/api/reviews')).json();
    box.innerHTML = `<h3>Reviews (${reviews.length})</h3>` + reviews.map(r => `
      <div class="booking-card">
        <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        <p style="margin:5px 0"><strong>${r.customerName}</strong></p>
        <p>${r.comment}</p>
      </div>`).join('');
  }
}

window.adminDel = async (type, id) => {
  if (!confirm('Delete?')) return;
  await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
  renderAdminTab(type);
};