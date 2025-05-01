// proxy/groq.js
const pool = require('../db/pg');
const fetch = require('node-fetch'); // if your Node version doesn’t expose global fetch

module.exports = async function proxyToGroq(req, res) {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing `prompt` in request body' });
  }

  let statusCode = 500;
  try {
    // 1) Forward to Groq
    const groqRes = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
        }),
      }
    );
    statusCode = groqRes.status;
    const data = await groqRes.json();

    // 2) Insert the audit log
    try {
      await pool.query(
        `INSERT INTO request_logs(user_id, endpoint, status_code)
         VALUES($1, $2, $3)`,
        [req.user.userId, '/api/groq', statusCode]
      );
    } catch (dbErr) {
      console.error('Log insert error:', dbErr);
    }

    // 3) Return the Groq response (or error code)
    if (!groqRes.ok) {
      return res.status(502).json({ error: 'Groq API error', details: data });
    }
    return res.json(data);

  } catch (err) {
    console.error('Proxy exception:', err);

    // 4) On unexpected errors, log a 500
    try {
      await pool.query(
        `INSERT INTO request_logs(user_id, endpoint, status_code)
         VALUES($1, $2, $3)`,
        [req.user.userId, '/api/groq', 500]
      );
    } catch (dbErr2) {
      console.error('Error logging failure:', dbErr2);
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};
