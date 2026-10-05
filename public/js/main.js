// Show auth links in nav based on login state
const user = JSON.parse(localStorage.getItem('abinaUser') || 'null');
const authLinks = document.getElementById('authLinks');
if (authLinks) {
  if (user) {
    authLinks.innerHTML = `<a href="dashboard.html">👤 ${user.name}</a>`;
  } else {
    authLinks.innerHTML = `<a href="login.html">Login</a> | <a href="register.html">Register</a>`;
  }
}