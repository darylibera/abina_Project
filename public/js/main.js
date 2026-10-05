// Show auth links in nav based on login state
const user = JSON.parse(localStorage.getItem('abinaUser') || 'null');
const authLinks = document.getElementById('authLinks');
if (authLinks) {
  if (user) {
    authLinks.innerHTML = `<a href="dashboard.html">👤 ${user.name}</a>`;
  } else {
    authLinks.innerHTML = `<a href="login.html">Login</a>`;
  }
}

// Scroll reveal animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section, .card, .booking-card, .review-card, .notification').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Nav shrink on scroll
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (nav) {
    if (window.scrollY > 50) {
      nav.style.padding = '12px 48px';
      nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
    } else {
      nav.style.padding = '18px 48px';
      nav.style.boxShadow = 'none';
    }
  }
});