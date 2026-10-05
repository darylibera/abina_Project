const urlParams = new URLSearchParams(location.search);
const designerId = urlParams.get('id');
const currentUser = JSON.parse(localStorage.getItem('abinaUser') || 'null');
let designer = null;

if (!designerId) location.href = 'designers.html';

// Load designer
fetch('/api/users/' + designerId).then(r => r.json()).then(d => {
  designer = d;
  document.getElementById('profileSection').innerHTML = `
    <div style="display:flex;gap:25px;flex-wrap:wrap;align-items:center">
      <img src="${d.profileImage || 'https://via.placeholder.com/200?text=' + encodeURIComponent(d.name)}" style="width:180px;height:180px;border-radius:50%;object-fit:cover">
      <div>
        <h2>${d.name}</h2>
        <p style="color:#1f3a2e;font-weight:600;margin:5px 0">${d.specialty || 'Interior Designer'}</p>
        <p style="color:#666;max-width:600px">${d.bio || 'Passionate about creating beautiful spaces.'}</p>
      </div>
    </div>
    <h3>Portfolio</h3>
    <div id="designerPortfolio" class="gallery"></div>
  `;

  // Portfolio
  fetch('/api/designs/by/' + designerId).then(r => r.json()).then(designs => {
    const box = document.getElementById('designerPortfolio');
    if (!designs.length) { box.innerHTML = '<p>No portfolio items yet.</p>'; return; }
    box.innerHTML = designs.map(x => `
      <div class="card">
        <img src="${x.image}" onerror="this.src='https://via.placeholder.com/400x200'">
        <div class="card-body"><h3>${x.title}</h3><p>${x.description}</p></div>
      </div>`).join('');
  });

  // Packages dropdown
  const pkgSelect = document.getElementById('packageSelect');
  if (d.packages && d.packages.length) {
    pkgSelect.innerHTML = d.packages.map(p =>
      `<option value="${p.name}" data-price="${p.price}">${p.name} — ₹${p.price}</option>`
    ).join('');
  } else {
    pkgSelect.innerHTML = '<option value="Standard Consultation" data-price="0">Standard Consultation</option>';
  }

  document.getElementById('bookingSection').style.display = 'block';
  document.getElementById('reviewsSection').style.display = 'block';
  loadReviews();
});

// Booking submit
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) {
    alert('Please login first to book a designer.');
    location.href = 'login.html';
    return;
  }
  if (currentUser.role !== 'customer') {
    alert('Only customers can book designers.');
    return;
  }
  const f = e.target;
  const selectedOpt = f.packageName.options[f.packageName.selectedIndex];
  const body = {
    customerId: currentUser._id,
    customerName: currentUser.name,
    designerId: designer._id,
    designerName: designer.name,
    packageName: f.packageName.value,
    packagePrice: Number(selectedOpt.dataset.price || 0),
    date: f.date.value,
    time: f.time.value,
    address: f.address.value,
    notes: f.notes.value
  };
  const res = await fetch('/api/bookings', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
  });
  const status = document.getElementById('bookStatus');
  if (res.ok) {
    status.className = 'alert alert-success';
    status.textContent = '✅ Booking request sent! Track it in your dashboard.';
    f.reset();
  } else {
    status.className = 'alert alert-error';
    status.textContent = '❌ Booking failed.';
  }
});

// Reviews
function loadReviews() {
  fetch('/api/reviews/designer/' + designerId).then(r => r.json()).then(reviews => {
    const box = document.getElementById('reviewsList');
    if (!reviews.length) { box.innerHTML = '<p>No reviews yet.</p>'; return; }
    box.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        <p style="margin:6px 0"><strong>${r.customerName}</strong></p>
        <p>${r.comment}</p>
      </div>`).join('');
  });
}