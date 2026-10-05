const adminUser = JSON.parse(localStorage.getItem('abinaUser') || 'null');
const loginBox = document.getElementById('loginBox');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');

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
    const users = await (await fetch('/api/users')).json();
    const customers = users.filter(u => u.role === 'customer');
    const designers = users.filter(u => u.role === 'designer');
    const admins = users.filter(u => u.role === 'admin');

    const renderUser = (u) => `
      <div class="booking-card">
        <h4>${u.name} <span class="status-badge status-${u.role === 'designer' ? 'scheduled' : u.role === 'admin' ? 'completed' : 'pending'}">${u.role}</span></h4>
        <p class="meta">📧 ${u.email}</p>
        ${u.specialty ? `<p class="meta">🎨 ${u.specialty}</p>` : ''}
        ${u.role !== 'admin' ? `
          <button class="btn btn-small btn-danger" onclick="deleteUser('${u._id}','${u.name.replace(/'/g,"\\'")}')" style="margin-top:10px">Delete User + All Data</button>
        ` : '<p class="meta" style="color:#999">Admin cannot be deleted</p>'}
      </div>`;

    box.innerHTML = `
      <h3>Designers (${designers.length})</h3>
      ${designers.length ? designers.map(renderUser).join('') : '<p>No designers yet.</p>'}
      <h3 style="margin-top:30px">Customers (${customers.length})</h3>
      ${customers.length ? customers.map(renderUser).join('') : '<p>No customers yet.</p>'}
      <h3 style="margin-top:30px">Admins (${admins.length})</h3>
      ${admins.map(renderUser).join('')}
    `;
  }

  if (tab === 'bookings') {
    const bookings = await (await fetch('/api/bookings')).json();
    box.innerHTML = `<h3>All Bookings (${bookings.length})</h3>` + (bookings.length ? bookings.map(b => `
      <div class="booking-card">
        <h4>${b.packageName} — ₹${b.packagePrice}</h4>
        <p class="meta">Customer: ${b.customerName} → Designer: ${b.designerName}</p>
        <p class="meta">📅 ${b.date} at ${b.time}</p>
        <p class="meta"><span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span></p>
        <button class="btn btn-small btn-danger" onclick="adminDel('bookings','${b._id}')" style="margin-top:8px">Delete</button>
      </div>`).join('') : '<p>No bookings yet.</p>');
  }

  if (tab === 'designs') {
    const designs = await (await fetch('/api/designs')).json();
    box.innerHTML = `<h3>All Designs (${designs.length})</h3><div class="gallery">` + (designs.length ? designs.map(d => `
      <div class="card">
        <img src="${d.image}" onerror="this.src='https://via.placeholder.com/400x200'">
        <div class="card-body">
          <h3>${d.title}</h3>
          <p>${d.description}</p>
          ${d.designerName ? `<p style="font-size:12px;color:#999">by ${d.designerName}</p>` : ''}
          <button class="btn btn-small btn-danger" onclick="adminDel('designs','${d._id}')">Delete</button>
        </div>
      </div>`).join('') : '<p>No designs yet.</p>') + '</div>';
  }

  if (tab === 'messages') {
    const msgs = await (await fetch('/api/messages')).json();
    box.innerHTML = `<h3>Messages (${msgs.length})</h3>` + (msgs.length ? msgs.map(m => `
      <div class="booking-card">
        <h4>${m.name} — ${m.email}</h4>
        <p>${m.message}</p>
        <button class="btn btn-small btn-danger" onclick="adminDel('messages','${m._id}')">Delete</button>
      </div>`).join('') : '<p>No messages yet.</p>');
  }

  if (tab === 'reviews') {
    const reviews = await (await fetch('/api/reviews')).json();
    box.innerHTML = `<h3>Reviews (${reviews.length})</h3>` + (reviews.length ? reviews.map(r => `
      <div class="booking-card">
        <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        <p style="margin:5px 0"><strong>${r.customerName}</strong></p>
        <p>${r.comment}</p>
        <button class="btn btn-small btn-danger" onclick="adminDel('reviews','${r._id}')" style="margin-top:8px">Delete</button>
      </div>`).join('') : '<p>No reviews yet.</p>');
  }
}

window.adminDel = async (type, id) => {
  if (!confirm('Delete this item?')) return;
  const url = type === 'messages' ? '/api/messages/' + id
            : type === 'reviews' ? '/api/reviews/' + id
            : `/api/${type}/${id}`;
  // we need a delete route for reviews, add a generic fallback
  await fetch(url, { method: 'DELETE' });
  renderAdminTab(type);
};

window.deleteUser = async (id, name) => {
  if (!confirm(`⚠️ Delete "${name}"?\n\nThis will ALSO delete:\n• All their designs\n• All their bookings\n• All their reviews\n• All their notifications\n\nThis cannot be undone!`)) return;
  const res = await fetch('/api/users/' + id, { method: 'DELETE' });
  const data = await res.json();
  alert(data.message || 'Deleted');
  renderAdminTab('users');
};