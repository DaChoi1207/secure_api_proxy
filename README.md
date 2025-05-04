# 🔐 Secure API Proxy Agent

A backend service that acts as a secure proxy for calling external APIs (e.g. Groq), with built-in **JWT authentication**, **rate limiting**, **CORS protection**, and **audit logging** to PostgreSQL. Includes a minimal React admin UI for viewing authenticated request logs in real-time.

---

## 🌐 Live Demo

🔗 [Try the Demo](https://secure-api-proxy-88s6896k2-david-chois-projects-b14146ce.vercel.app/)  
🧪 Username: `admin` & Password: `password` *(demo-only, no real auth implemented)*

---

## 🛠️ Tech Stack

**Backend**: Node.js, Express, JWT Auth, PostgreSQL, CORS, Rate Limiting  
**Frontend**: React
**DevOps**: Docker, Railway (serverless), GitHub Actions

---

## 🔒 Key Features

- ✅ **JWT Authentication** – Secure access to protected endpoints
- 🚦 **Rate Limiting** – Prevents abuse with configurable limits
- 🔄 **CORS Hardening** – Whitelisted origins only (production-safe)
- 📝 **Structured Audit Logging** – Logs each API call with `user_id`, `endpoint`, `status_code`, and `timestamp`
- 🧾 **Admin Dashboard** – React UI to view logs (JWT protected)
- 🐳 **Containerized** – Fully Dockerized backend + frontend
- ⚙️ **CI/CD Ready** – Automated deploys via GitHub Actions + Railway

---
