// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db/pg');
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth');
const rateLimit = require('./middleware/rateLimit');
const proxyToGroq = require('./proxy/groq');

const app = express();

// Middleware
app.use(express.json());
const FRONTEND_URL = process.env.FRONTEND_URL;  
app.use(cors({
  origin: FRONTEND_URL,                   // e.g. https://your-vercel-app.vercel.app
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Health check
app.get('/', (req, res) => {
  res.send('Secure API Proxy Agent is running ✅');
});

// Protected test route
app.get('/protected', auth, (req, res) => {
  res.json({ message: '✅ Authenticated!', user: req.user });
});

// Auth endpoint
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  // ★ Replace this with real user checks, or leave it simple for demo
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign(
      { userId: username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// Mount all /api routes behind auth + rate limit
app.use('/api', auth, rateLimit);

// === Your Groq proxy endpoint ===
// This must come *after* the auth+rateLimit middleware
app.post('/api/groq', proxyToGroq);

// GET /api/logs — return the 50 most recent requests
app.get('/api/logs', async (req, res) => {
  // If running under Jest, just return an empty array
  if (process.env.NODE_ENV === 'test') {
    return res.json([]);
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, user_id, endpoint, status_code, created_at \
       FROM request_logs \
       ORDER BY created_at DESC \
       LIMIT 50'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Could not retrieve logs' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));

module.exports = app;
