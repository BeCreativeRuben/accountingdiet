'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiPost('/login', { token });
      
      if (response.valid) {
        localStorage.setItem('authToken', response.token);
        router.push('/dashboard');
      } else {
        setError('Ongeldige toegangscode');
      }
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij het inloggen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F0F2F5',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#2D3748',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Diëtist Noor
        </h1>
        <p style={{
          color: '#718096',
          marginBottom: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          Voer uw toegangscode in
        </p>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="message error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="token">Toegangscode</label>
            <input
              type="password"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Inloggen...' : 'Inloggen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
