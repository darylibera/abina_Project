fetch('/api/designs')
  .then(r => r.json())
  .then(designs => {
    const gal = document.getElementById('gallery');
    if (!designs.length) {
      gal.innerHTML = '<p>No designs yet. Check back soon!</p>';
      return;
    }
    gal.innerHTML = designs.map(d => `
      <div class="card">
        <img src="${d.image}" alt="${d.title}">
        <div class="card-body">
          <span class="tag">${d.category}</span>
          <h3>${d.title}</h3>
          <p>${d.description}</p>
        </div>
      </div>
    `).join('');
  });