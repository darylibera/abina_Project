fetch('/api/designs').then(r => r.json()).then(designs => {
  const gal = document.getElementById('gallery');
  if (!designs.length) { gal.innerHTML = '<p>No designs yet. Check back soon!</p>'; return; }
  gal.innerHTML = designs.map(d => `
    <div class="card">
      <img src="${d.image}" alt="${d.title}" onerror="this.src='https://via.placeholder.com/400x200?text=Design'">
      <div class="card-body">
        <span class="tag">${d.category || 'Design'}</span>
        <h3>${d.title}</h3>
        <p>${d.description}</p>
        ${d.designerName ? `<p style="font-size:13px;color:#888">by ${d.designerName}</p>` : ''}
      </div>
    </div>`).join('');
});