import React, { useState } from 'react';

function LogDashboard() {
  const [token, setToken] = useState('');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to fetch logs');
      }
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Admin Log Dashboard</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Paste JWT token here"
          value={token}
          onChange={e => setToken(e.target.value)}
          style={{ width: 400, marginRight: 8 }}
        />
        <button onClick={fetchLogs} disabled={loading || !token}>
          {loading ? 'Loading...' : 'Fetch Logs'}
        </button>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>user_id</th>
            <th>endpoint</th>
            <th>status_code</th>
            <th>created_at</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No logs</td></tr>
          ) : (
            logs.map((log, idx) => (
              <tr key={idx}>
                <td>{log.user_id}</td>
                <td>{log.endpoint}</td>
                <td>{log.status_code}</td>
                <td>{log.created_at}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LogDashboard;
