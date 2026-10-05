const loginBox = document.getElementById('loginBox');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');

// If already logged in
if (sessionStorage.getItem('abinaAdmin') === 'yes') {
  showDashboard();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.success) {
    sessionStorage.setItem('abinaAdmin', 'yes');
    showDashboard();
  } else {
    document.getElementById('loginStatus').textContent = '❌ Invalid credentials';
  }
});

logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  sessionStorage.removeItem('abinaAdmin');
  location.reload();
});

function showDashboard() {
  loginBox.style.display = 'none';
  dashboard.style.display = 'block';
  logoutBtn.style.display = 'inline';
  loadDesigns();
  loadMessages();
}

document.getElementById('designForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    title: document.getElementById('title').value,
    category: document.getElementById('category').value,
    image: document.getElementById('image').value,
    description: document.getElementById('description').value
  };
  await fetch('/api/designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  e.target.reset();
  loadDesigns();
});

async function loadDesigns() {
  const designs = await (await fetch('/api/designs')).json();
  const gal = document.getElementById('adminGallery');
  if (!designs.length) {
    gal.innerHTML = '<p>No designs yet.</p>';
    return;
  }
  gal.innerHTML = designs.map(d => `
    <div class="card">
      <img src="${d.image}" alt="${d.title}">
      <div class="card-body">
        <span class="tag">${d.category}</span>
        <h3>${d.title}</h3>
        <p>${d.description}</p>
        <button onclick="deleteDesign('${d._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

async function deleteDesign(id) {
  if (!confirm('Delete this design?')) return;
  await fetch('/api/designs/' + id, { method: 'DELETE' });
  loadDesigns();
}

async function loadMessages() {
  const msgs = await (await fetch('/api/messages')).json();
  const box = document.getElementById('messages');
  if (!msgs.length) {
    box.innerHTML = '<p>No messages yet.</p>';
    return;
  }
  box.innerHTML = msgs.map(m => `
    <div class="msg">
      <strong>${m.name}</strong> — <em>${m.email}</em>
      <p>${m.message}</p>
      <button onclick="deleteMessage('${m._id}')" style="margin-top:8px;padding:4px 10px;background:#c94b4b;color:#fff;border:none;border-radius:4px;cursor:pointer">Delete</button>
    </div>
  `).join('');
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  await fetch('/api/messages/' + id, { method: 'DELETE' });
  loadMessages();
}