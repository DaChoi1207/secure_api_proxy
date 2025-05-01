// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db/pg');

const auth = require('./middleware/auth');
const rateLimit = require('./middleware/rateLimit');
const proxyToGroq = require('./proxy/groq');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('Secure API Proxy Agent is running ✅');
});

// Protected test route
app.get('/protected', auth, (req, res) => {
  res.json({ message: '✅ Authenticated!', user: req.user });
});

// Mount all /api routes behind auth + rate limit
app.use('/api', auth, rateLimit);

// === Your Groq proxy endpoint ===
// This must come *after* the auth+rateLimit middleware
app.post('/api/groq', proxyToGroq);

// GET /api/logs — return the 50 most recent requests
app.get('/api/logs', auth, async (req, res) => {
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
