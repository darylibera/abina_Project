const user = JSON.parse(localStorage.getItem('abinaUser') || 'null');
if (!user) location.href = 'login.html';

document.getElementById('welcome').textContent = `Welcome, ${user.name}! (${user.role})`;
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('abinaUser');
  location.href = 'index.html';
});

const tabs = document.getElementById('tabs');
const content = document.getElementById('content');
let activeTab = user.role === 'designer' ? 'requests' : 'bookings';

function renderTabs() {
  const tabList = user.role === 'designer'
    ? [['requests','Booking Requests'], ['portfolio','My Portfolio'], ['packages','My Packages'], ['profile','Edit Profile'], ['notifications','Notifications']]
    : [['bookings','My Bookings'], ['notifications','Notifications']];
  tabs.innerHTML = tabList.map(([k,label]) =>
    `<button data-tab="${k}" class="${activeTab===k?'active':''}">${label}</button>`).join('');
  tabs.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    activeTab = b.dataset.tab; renderTabs(); renderContent();
  }));
}

function renderContent() {
  content.innerHTML = '<p>Loading...</p>';
  if (activeTab === 'bookings') loadCustomerBookings();
  if (activeTab === 'requests') loadDesignerRequests();
  if (activeTab === 'portfolio') loadDesignerPortfolio();
  if (activeTab === 'packages') loadDesignerPackages();
  if (activeTab === 'profile') loadProfile();
  if (activeTab === 'notifications') loadNotifications();
}

// ---- CUSTOMER ----
async function loadCustomerBookings() {
  const bookings = await (await fetch('/api/bookings/customer/' + user._id)).json();
  if (!bookings.length) { content.innerHTML = '<p>You have no bookings yet. <a href="designers.html">Browse designers</a></p>'; return; }
  content.innerHTML = bookings.map(b => `
    <div class="booking-card">
      <h4>${b.packageName} — ₹${b.packagePrice}</h4>
      <p class="meta">Designer: ${b.designerName}</p>
      <p class="meta">📅 ${b.date} at ${b.time}</p>
      <p class="meta">📍 ${b.address}</p>
      ${b.notes ? `<p class="meta">📝 ${b.notes}</p>` : ''}
      <p class="meta"><span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span></p>
      ${b.status === 'completed' ? `<button class="btn btn-small" onclick="leaveReview('${b.designerId}','${b.designerName.replace(/'/g,"\\'")}')">Leave Review</button>` : ''}
      ${['pending','accepted','scheduled'].includes(b.status) ? `<button class="btn btn-small btn-danger" onclick="cancelBooking('${b._id}')">Cancel</button>` : ''}
    </div>`).join('');
}

window.cancelBooking = async (id) => {
  if (!confirm('Cancel this booking?')) return;
  await fetch('/api/bookings/' + id, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status: 'cancelled' }) });
  loadCustomerBookings();
};

window.leaveReview = (designerId, designerName) => {
  const rating = prompt(`Rate ${designerName} from 1 to 5:`);
  if (!rating || rating < 1 || rating > 5) return;
  const comment = prompt('Write your review:');
  if (!comment) return;
  fetch('/api/reviews', {
    method: 'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ designerId, customerId: user._id, customerName: user.name, rating: Number(rating), comment })
  }).then(() => alert('✅ Review submitted!'));
};

// ---- DESIGNER ----
async function loadDesignerRequests() {
  const bookings = await (await fetch('/api/bookings/designer/' + user._id)).json();
  if (!bookings.length) { content.innerHTML = '<p>No booking requests yet.</p>'; return; }
  content.innerHTML = bookings.map(b => `
    <div class="booking-card">
      <h4>${b.packageName} — ₹${b.packagePrice}</h4>
      <p class="meta">Customer: ${b.customerName}</p>
      <p class="meta">📅 ${b.date} at ${b.time}</p>
      <p class="meta">📍 ${b.address}</p>
      ${b.notes ? `<p class="meta">📝 ${b.notes}</p>` : ''}
      <p class="meta"><span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span></p>
      ${b.status === 'pending' ? `
        <button class="btn btn-small" onclick="updateBooking('${b._id}','accepted')">Accept</button>
        <button class="btn btn-small btn-danger" onclick="updateBooking('${b._id}','rejected')">Reject</button>` : ''}
      ${b.status === 'accepted' ? `<button class="btn btn-small" onclick="updateBooking('${b._id}','scheduled')">Schedule</button>` : ''}
      ${b.status === 'scheduled' ? `<button class="btn btn-small" onclick="updateBooking('${b._id}','in-progress')">Start Work</button>` : ''}
      ${b.status === 'in-progress' ? `<button class="btn btn-small" onclick="updateBooking('${b._id}','completed')">Mark Completed</button>` : ''}
    </div>`).join('');
}

window.updateBooking = async (id, status) => {
  await fetch('/api/bookings/' + id, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) });
  loadDesignerRequests();
};

async function loadDesignerPortfolio() {
  const designs = await (await fetch('/api/designs/by/' + user._id)).json();
  content.innerHTML = `
    <h3>Add New Design</h3>
    <form id="designForm" class="form">
      <input type="text" name="title" placeholder="Title" required>
      <input type="text" name="category" placeholder="Category (e.g. Living Room)" required>
      <input type="url" name="image" placeholder="Image URL (https://...)" required>
      <textarea name="description" placeholder="Description" required></textarea>
      <button type="submit" class="btn">Add Design</button>
    </form>
    <h3>My Designs</h3>
    <div class="gallery" id="myDesigns"></div>`;

  document.getElementById('designForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    await fetch('/api/designs', {
      method: 'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        title: f.title.value, category: f.category.value,
        image: f.image.value, description: f.description.value,
        designerId: user._id, designerName: user.name
      })
    });
    f.reset();
    loadDesignerPortfolio();
  });

  const box = document.getElementById('myDesigns');
  if (!designs.length) { box.innerHTML = '<p>No designs yet.</p>'; return; }
  box.innerHTML = designs.map(d => `
    <div class="card">
      <img src="${d.image}" onerror="this.src='https://via.placeholder.com/400x200'">
      <div class="card-body">
        <h3>${d.title}</h3><p>${d.description}</p>
        <button class="btn btn-small btn-danger" onclick="deleteDesign('${d._id}')">Delete</button>
      </div>
    </div>`).join('');
}

window.deleteDesign = async (id) => {
  if (!confirm('Delete this design?')) return;
  await fetch('/api/designs/' + id, { method: 'DELETE' });
  loadDesignerPortfolio();
};

async function loadDesignerPackages() {
  const me = await (await fetch('/api/users/' + user._id)).json();
  const packages = me.packages || [];
  content.innerHTML = `
    <h3>Service Packages</h3>
    <div id="pkgList">${packages.length ? packages.map((p,i) => `
      <div class="booking-card">
        <h4>${p.name} — ₹${p.price}</h4>
        <p>${p.description || ''}</p>
        <button class="btn btn-small btn-danger" onclick="removePkg(${i})">Remove</button>
      </div>`).join('') : '<p>No packages yet.</p>'}</div>
    <h3>Add Package</h3>
    <form id="pkgForm" class="form">
      <input type="text" name="name" placeholder="Package Name" required>
      <input type="number" name="price" placeholder="Price (₹)" required min="0">
      <textarea name="description" placeholder="What's included..."></textarea>
      <button type="submit" class="btn">Add Package</button>
    </form>`;

  document.getElementById('pkgForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const newPkgs = [...packages, { name: f.name.value, price: Number(f.price.value), description: f.description.value }];
    await fetch('/api/users/' + user._id, {
      method: 'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ packages: newPkgs })
    });
    loadDesignerPackages();
  });
}

window.removePkg = async (index) => {
  const me = await (await fetch('/api/users/' + user._id)).json();
  const newPkgs = me.packages.filter((_, i) => i !== index);
  await fetch('/api/users/' + user._id, {
    method: 'PUT', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ packages: newPkgs })
  });
  loadDesignerPackages();
};

async function loadProfile() {
  const me = await (await fetch('/api/users/' + user._id)).json();
  content.innerHTML = `
    <h3>Edit Profile</h3>
    <form id="profileForm" class="form">
      <label>Name</label><input type="text" name="name" value="${me.name}" required>
      <label>Specialty</label><input type="text" name="specialty" value="${me.specialty || ''}">
      <label>Bio</label><textarea name="bio">${me.bio || ''}</textarea>
      <label>Profile Image URL</label><input type="url" name="profileImage" value="${me.profileImage || ''}">
      <button type="submit" class="btn">Save</button>
      <p id="profileStatus"></p>
    </form>`;
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    await fetch('/api/users/' + user._id, {
      method: 'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name: f.name.value, specialty: f.specialty.value, bio: f.bio.value, profileImage: f.profileImage.value })
    });
    document.getElementById('profileStatus').className = 'alert alert-success';
    document.getElementById('profileStatus').textContent = '✅ Saved!';
    user.name = f.name.value;
    localStorage.setItem('abinaUser', JSON.stringify(user));
  });
}

async function loadNotifications() {
  const notes = await (await fetch('/api/notifications/' + user._id)).json();
  if (!notes.length) { content.innerHTML = '<p>No notifications.</p>'; return; }
  content.innerHTML = notes.map(n =>
    `<div class="notification ${n.read?'read':''}">${n.text}<br><small style="color:#999">${new Date(n.createdAt).toLocaleString()}</small></div>`
  ).join('');
  fetch('/api/notifications/read/' + user._id, { method: 'PUT' });
}

renderTabs();
renderContent();