'use client';

export default function LogoutButton() {
  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  }
  return (
    <button
      onClick={logout}
      style={{
        background: 'none',
        border: '1px solid #2B333D',
        color: '#8A93A1',
        borderRadius: 6,
        padding: '5px 10px',
        fontSize: 12,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      Abmelden
    </button>
  );
}
