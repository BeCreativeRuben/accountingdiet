'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { apiGet } from '@/lib/api';
import { TerugbetalingSignaal } from '@/types';

export default function TerugbetalingPage() {
  const router = useRouter();
  const [signalen, setSignalen] = useState<TerugbetalingSignaal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSignalen = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return signalen;
    return signalen.filter(
      (s) =>
        (s.voornaam?.toLowerCase() ?? '').includes(q) ||
        (s.achternaam?.toLowerCase() ?? '').includes(q) ||
        `${(s.voornaam ?? '').toLowerCase()} ${(s.achternaam ?? '').toLowerCase()}`.trim().includes(q) ||
        `${(s.achternaam ?? '').toLowerCase()} ${(s.voornaam ?? '').toLowerCase()}`.trim().includes(q) ||
        (s.mutualiteit_naam?.toLowerCase() ?? '').includes(q) ||
        (s.melding?.toLowerCase() ?? '').includes(q)
    );
  }, [signalen, searchQuery]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const data = await apiGet('/terugbetaling-signalen').catch(() => []);
      setSignalen(data);
    } catch (error) {
      console.error('Error loading terugbetaling signalen:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Terugbetaling Signalen" />
        <div className="page-content">
          <div className="loading">Gegevens laden...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Terugbetaling Signalen" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h2>Terugbetaling Signalen</h2>
            <p className="page-description">
              Overzicht van terugbetaling signalen voor klanten.
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-sm btn-secondary"
              onClick={loadData}
            >
              <i className="fas fa-sync-alt"></i> Vernieuwen
            </button>
          </div>
        </div>

        <div className="search-bar-wrap">
          <label className="search-label" htmlFor="terugbetaling-zoek">
            <i className="fas fa-search"></i>
          </label>
          <input
            id="terugbetaling-zoek"
            type="search"
            className="search-input"
            placeholder="Zoek op klantnaam, mutualiteit of melding..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Terugbetaling signalen zoeken"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Zoekopdracht wissen"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Klant</th>
                <th>Mutualiteit</th>
                <th>Sessies Terugbetaalbaar</th>
                <th>Melding</th>
              </tr>
            </thead>
            <tbody>
              {signalen.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    <i className="fas fa-check-circle"></i>
                    <h3>Geen terugbetaling signalen</h3>
                    <p>Alle klanten zitten binnen hun limieten</p>
                  </td>
                </tr>
              ) : filteredSignalen.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    <i className="fas fa-search"></i>
                    <p>Geen signalen gevonden voor &quot;{searchQuery}&quot;</p>
                  </td>
                </tr>
              ) : (
                filteredSignalen.map((signaal) => (
                  <tr key={signaal.klant_id}>
                    <td>{signaal.voornaam} {signaal.achternaam}</td>
                    <td>{signaal.mutualiteit_naam}</td>
                    <td>{signaal.sessies_terugbetaalbaar}</td>
                    <td>{signaal.melding}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
