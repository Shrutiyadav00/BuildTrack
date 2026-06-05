require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const path    = require('path');
const connectDB = require('./config/db');
const { protect } = require('./middleware/auth');
const { requireActiveSubscription } = require('./middleware/subscriptionGate');

connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Public routes (no auth, no subscription gate) ──────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth',         require('./routes/auth'));

// ── Subscription routes (auth required but NO subscription gate) ────────────
// Expired users must be able to reach this to upgrade
app.use('/api/subscription', require('./routes/subscriptions'));

// ── Protected + subscription-gated routes ──────────────────────────────────
// All routes below this line require: valid JWT + active subscription
const gated = [protect, requireActiveSubscription];

app.use('/api/projects',    ...gated, require('./routes/projects'));
app.use('/api/tasks',       ...gated, require('./routes/tasks'));
app.use('/api/workers',     ...gated, require('./routes/workers'));
app.use('/api/attendance',  ...gated, require('./routes/attendance'));
app.use('/api/transactions',...gated, require('./routes/transactions'));
app.use('/api/documents',   ...gated, require('./routes/documents'));
app.use('/api/dashboard',   ...gated, require('./routes/dashboard'));
app.use('/api/users',       ...gated, require('./routes/users'));

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
