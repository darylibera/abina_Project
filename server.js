require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- MODELS ----------
const Design = mongoose.model('Design', new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
}));

// ---------- ADMIN ----------
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

// ---------- ROUTES ----------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

// Designs
app.get('/api/designs', async (req, res) => {
  const designs = await Design.find().sort({ createdAt: -1 });
  res.json(designs);
});

app.post('/api/designs', async (req, res) => {
  const design = await Design.create(req.body);
  res.json(design);
});

app.put('/api/designs/:id', async (req, res) => {
  const design = await Design.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(design);
});

app.delete('/api/designs/:id', async (req, res) => {
  await Design.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Messages
app.get('/api/messages', async (req, res) => {
  const msgs = await Message.find().sort({ createdAt: -1 });
  res.json(msgs);
});

app.post('/api/messages', async (req, res) => {
  const msg = await Message.create(req.body);
  res.json(msg);
});

app.delete('/api/messages/:id', async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ---------- START ----------
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB error:', err.message));