document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    email: form.email.value,
    message: form.message.value
  };
  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (res.ok) {
    document.getElementById('status').textContent = '✅ Message sent! We will contact you soon.';
    form.reset();
  } else {
    document.getElementById('status').textContent = '❌ Something went wrong.';
  }
});