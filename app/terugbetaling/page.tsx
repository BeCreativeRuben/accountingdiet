'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { apiGet } from '@/lib/api';
import { TerugbetalingSignaal } from '@/types';

export default function TerugbetalingPage() {
  const router = useRouter();
  const [signalen, setSignalen] = useState<TerugbetalingSignaal[]>([]);
  const [loading, setLoading] = useState(true);

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
              ) : (
                signalen.map((signaal, index) => (
                  <tr key={index}>
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
