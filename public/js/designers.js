fetch('/api/designers').then(r => r.json()).then(designers => {
  const list = document.getElementById('designerList');
  if (!designers.length) {
    list.innerHTML = '<p>No designers registered yet. <a href="register.html">Be the first!</a></p>';
    return;
  }
  list.innerHTML = designers.map(d => `
    <div class="card">
      <img src="${d.profileImage || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(d.name)}" alt="${d.name}">
      <div class="card-body">
        <span class="tag">${d.specialty || 'Interior Designer'}</span>
        <h3>${d.name}</h3>
        <p>${d.bio || 'Passionate about creating beautiful spaces.'}</p>
        <a href="designer.html?id=${d._id}" class="btn btn-small" style="margin-top:10px">View & Book</a>
      </div>
    </div>`).join('');
});