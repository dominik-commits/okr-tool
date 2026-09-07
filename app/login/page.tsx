'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = '/';
    } else {
      setError('Falsches Passwort.');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#12151A',
        fontFamily: 'IBM Plex Sans, sans-serif',
        color: '#E9E5DA',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          background: '#1B2129',
          border: '1px solid #2B333D',
          borderRadius: 10,
          padding: '32px 28px',
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <h1 style={{ fontSize: 20, margin: 0, fontWeight: 500 }}>Planungskompass</h1>
        <p style={{ fontSize: 13, color: '#8A93A1', margin: 0 }}>
          Bitte Passwort eingeben, um auf die gemeinsame Jahresplanung zuzugreifen.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          autoFocus
          style={{
            background: '#12151A',
            border: '1px solid #2B333D',
            color: '#E9E5DA',
            borderRadius: 6,
            padding: '9px 11px',
            fontSize: 14,
          }}
        />
        {error && <span style={{ color: '#C1594B', fontSize: 12.5 }}>{error}</span>}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#4C948C',
            color: '#0D0F13',
            border: 'none',
            borderRadius: 6,
            padding: '9px 14px',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Prüfe…' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
