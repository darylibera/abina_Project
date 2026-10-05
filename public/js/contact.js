document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const res = await fetch('/api/messages', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ name: f.name.value, email: f.email.value, message: f.message.value })
  });
  const status = document.getElementById('status');
  if (res.ok) {
    status.className = 'alert alert-success';
    status.textContent = '✅ Message sent! We will contact you soon.';
    f.reset();
  } else {
    status.className = 'alert alert-error';
    status.textContent = '❌ Something went wrong.';
  }
});