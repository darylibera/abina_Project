require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------------- MODELS ----------------
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['customer', 'designer', 'admin'], default: 'customer' },
  // Designer-only fields
  bio: String,
  specialty: String,
  profileImage: String,
  packages: [{
    name: String,
    price: Number,
    description: String
  }],
  createdAt: { type: Date, default: Date.now }
}));

const Design = mongoose.model('Design', new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  image: String,
  designerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  designerName: String,
  createdAt: { type: Date, default: Date.now }
}));

const Booking = mongoose.model('Booking', new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  designerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  designerName: String,
  packageName: String,
  packagePrice: Number,
  date: String,
  time: String,
  address: String,
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  name: String, email: String, message: String,
  createdAt: { type: Date, default: Date.now }
}));

const Notification = mongoose.model('Notification', new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  text: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}));

const Review = mongoose.model('Review', new mongoose.Schema({
  designerId: mongoose.Schema.Types.ObjectId,
  customerId: mongoose.Schema.Types.ObjectId,
  customerName: String,
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
}));

// ---------------- HELPERS ----------------
const notify = async (userId, text) => {
  await Notification.create({ userId, text });
};

// ---------------- AUTH ----------------
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role, specialty, bio } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, role, specialty, bio });
    res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.json({ success: false, message: 'Invalid credentials' });
  res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});


// ---------------- USERS ----------------
app.get('/api/designers', async (req, res) => {
  const designers = await User.find({ role: 'designer' }).select('-password');
  res.json(designers);
});

app.get('/api/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  res.json(user);
});

// Designer updates profile + packages
app.put('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  res.json(user);
});

// ---------------- DESIGNS ----------------
app.get('/api/designs', async (req, res) => {
  const designs = await Design.find().sort({ createdAt: -1 });
  res.json(designs);
});

app.get('/api/designs/by/:designerId', async (req, res) => {
  const designs = await Design.find({ designerId: req.params.designerId });
  res.json(designs);
});

app.post('/api/designs', async (req, res) => {
  const design = await Design.create(req.body);
  res.json(design);
});

app.delete('/api/designs/:id', async (req, res) => {
  await Design.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ---------------- BOOKINGS ----------------
app.post('/api/bookings', async (req, res) => {
  const booking = await Booking.create(req.body);
  await notify(booking.designerId, `New booking request from ${booking.customerName} for ${booking.packageName}`);
  res.json(booking);
});

app.get('/api/bookings/customer/:id', async (req, res) => {
  const bookings = await Booking.find({ customerId: req.params.id }).sort({ createdAt: -1 });
  res.json(bookings);
});

app.get('/api/bookings/designer/:id', async (req, res) => {
  const bookings = await Booking.find({ designerId: req.params.id }).sort({ createdAt: -1 });
  res.json(bookings);
});

app.get('/api/bookings', async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
});

app.put('/api/bookings/:id', async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (req.body.status) {
    await notify(booking.customerId, `Your booking for ${booking.packageName} is now ${req.body.status}`);
  }
  res.json(booking);
});

app.delete('/api/bookings/:id', async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ---------------- MESSAGES ----------------
app.get('/api/messages', async (req, res) => {
  res.json(await Message.find().sort({ createdAt: -1 }));
});
app.post('/api/messages', async (req, res) => {
  res.json(await Message.create(req.body));
});
app.delete('/api/messages/:id', async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ---------------- NOTIFICATIONS ----------------
app.get('/api/notifications/:userId', async (req, res) => {
  const notes = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(notes);
});
app.put('/api/notifications/read/:userId', async (req, res) => {
  await Notification.updateMany({ userId: req.params.userId }, { read: true });
  res.json({ success: true });
});

// ---------------- REVIEWS ----------------
app.post('/api/reviews', async (req, res) => {
  const review = await Review.create(req.body);
  await notify(review.designerId, `New ${review.rating}★ review from ${review.customerName}`);
  res.json(review);
});
app.get('/api/reviews/designer/:id', async (req, res) => {
  const reviews = await Review.find({ designerId: req.params.id }).sort({ createdAt: -1 });
  res.json(reviews);
});
app.get('/api/reviews', async (req, res) => {
  res.json(await Review.find().sort({ createdAt: -1 }));
});

// ---------------- START ----------------
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB error:', err.message));