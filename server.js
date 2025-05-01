require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const jwt       = require('jsonwebtoken');
const pool      = require('./db/pg');
const auth      = require('./middleware/auth');
const rateLimit = require('./middleware/rateLimit');
const proxyToGroq = require('./proxy/groq');

const app = express();

// 1) CORS: allow any origin, handle preflight automatically
app.use(cors({
  origin: true,               // reflect request Origin header back
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 200            // some clients need 200 rather than 204
}));

// 2) JSON body parsing
app.use(express.json());

// 3) Health check
app.get('/', (req, res) => {
  res.send('Secure API Proxy Agent is running ✅');
});

// 4) Protected test route
app.get('/protected', auth, (req, res) => {
  res.json({ message: '✅ Authenticated!', user: req.user });
});

// 5) Auth stub
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign(
      { userId: username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }  // 24h for demo
    );
    return res.json({ token });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

// 6) Secure all /api routes
app.use('/api', auth, rateLimit);

// 7) AI proxy
app.post('/api/groq', proxyToGroq);

// 8) Audit logs
app.get('/api/logs', async (req, res) => {
  if (process.env.NODE_ENV === 'test') {
    return res.json([]);
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id, endpoint, status_code, created_at
       FROM request_logs
       ORDER BY created_at DESC
       LIMIT 50`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Could not retrieve logs' });
  }
});

// 9) Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));

module.exports = app;
