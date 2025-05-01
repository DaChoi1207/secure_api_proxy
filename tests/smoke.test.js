// tests/smoke.test.js
const request = require('supertest');
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Require the Express app (ensure server.js exports `app`)
const app = require('../server');

// Generate a fresh test token
const TEST_TOKEN = jwt.sign(
  { userId: 'test-user' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Secure API Proxy Smoke Tests', () => {
  it('GET / should return 200 and running message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/running/i);
  });

  it('GET /protected without token should return 401', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
  });

  it('GET /protected with valid token should return user info', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${TEST_TOKEN}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.userId).toBe('test-user');
  });

  it('POST /api/groq without token should return 401', async () => {
    const res = await request(app)
      .post('/api/groq')
      .send({ prompt: 'test' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/groq with token but missing prompt returns 400', async () => {
    const res = await request(app)
      .post('/api/groq')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  // Skip the real API call by default; remove `.skip` if you want live testing
  it.skip('POST /api/groq with token should return a Groq completion', async () => {
    const res = await request(app)
      .post('/api/groq')
      .set('Authorization', `Bearer ${TEST_TOKEN}`)
      .send({ prompt: 'Hello from smoke test' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('choices');
    expect(Array.isArray(res.body.choices)).toBe(true);
  });

  it('GET /api/logs without token should return 401', async () => {
    const res = await request(app).get('/api/logs');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/logs with valid token should return an array', async () => {
    const res = await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${TEST_TOKEN}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
