import React, { useState } from 'react';

export default function AdminDashboard() {
  const [step, setStep] = useState('login');      // 'login' or 'logs'
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [token, setToken] = useState('');
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState(null);
  const API = process.env.REACT_APP_API_BASE_URL;

  // 1️⃣ Log in to get a JWT
  const handleLogin = async () => {
    setError(null);
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Login failed');
      }
      const { token } = await res.json();
      setToken(token);
      setStep('logs');
    } catch (e) {
      setError(e.message);
    }
  };

  // 2️⃣ Fetch logs with that JWT
  const fetchLogs = async () => {
    setError(null);
    try {
      const res = await fetch(`${API}/api/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch logs');
      }
      setLogs(await res.json());
    } catch (e) {
      setError(e.message);
    }
  };

  if (step === 'login') {
    return (
      <div style={{ padding: 32, maxWidth: 400, margin: '60px auto', border: '1px solid #eee', borderRadius: 12, background: '#fafbfc', boxShadow: '0 2px 8px #eee' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 10, color: '#222' }}>Admin Login</h1>
        <p style={{ color: '#666', marginBottom: 20, fontSize: 15 }}>
          <strong>Note:</strong> This project serves mainly for demoing a secure API proxy and admin audit log UI.<br/>
          <span style={{ fontSize: 13, color: '#888' }}>
            Please use <b>admin</b> / <b>password</b> to log in.<br/>
            No registration or real user management is implemented.
          </span>
        </p>
        {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}
        <input
          style={{ width: '100%', marginBottom: 10, padding: 8, border: '1px solid #ccc', borderRadius: 5, fontSize: 15 }}
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          style={{ width: '100%', marginBottom: 18, padding: 8, border: '1px solid #ccc', borderRadius: 5, fontSize: 15 }}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          onClick={handleLogin}
          style={{ width: '100%', background: '#2563eb', color: 'white', padding: 10, fontWeight: 600, borderRadius: 6, fontSize: 16, border: 'none', cursor: 'pointer' }}
        >
          Log In
        </button>
      </div>
    );
  }

  // step === 'logs'
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Log Dashboard</h1>
      <button
        onClick={fetchLogs}
        className="bg-green-600 text-white py-2 px-4 rounded mb-4"
      >
        Fetch Logs
      </button>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {logs && (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Endpoint</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td className="border p-2">{log.id}</td>
                <td className="border p-2">{log.user_id}</td>
                <td className="border p-2">{log.endpoint}</td>
                <td className="border p-2">{log.status_code}</td>
                <td className="border p-2">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
