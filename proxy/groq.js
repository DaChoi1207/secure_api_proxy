// proxy/groq.js
const pool = require('../db/pg');          // ensure this line is at the very top

module.exports = async function proxyToGroq(req, res) {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing `prompt` in request body' });
  }

  try {
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

    // ══ LOGGING: insert a row no matter what groqRes.status is ══
    pool.query(
      'INSERT INTO request_logs(user_id, endpoint, status_code) VALUES($1,$2,$3)',
      [req.user.userId, '/api/groq', groqRes.status]
    ).catch(err => console.error('Log insert error:', err));

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(502).json({ error: 'Groq API error', details: errText });
    }

    const data = await groqRes.json();
    return res.json(data);

  } catch (err) {
    // ══ LOGGING: record 500 on exception ══
    pool.query(
      'INSERT INTO request_logs(user_id, endpoint, status_code) VALUES($1,$2,$3)',
      [req.user.userId, '/api/groq', 500]
    ).catch(err => console.error('Log insert error:', err));

    console.error('Proxy exception:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
