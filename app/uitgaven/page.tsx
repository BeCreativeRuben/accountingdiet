'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import UitgaveModal from '@/components/UitgaveModal';
import { apiGet, apiDelete } from '@/lib/api';
import { Uitgave } from '@/types';

/** Format ISO date (YYYY-MM-DD) to Dutch d-m-y; avoids wrong year when parsing with Date. */
function formatDatum(datum: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    const [y, m, d] = datum.split('-');
    return `${parseInt(d, 10)}-${parseInt(m, 10)}-${y}`;
  }
  return new Date(datum).toLocaleDateString('nl-NL');
}

export default function UitgavenPage() {
  const router = useRouter();
  const [uitgaven, setUitgaven] = useState<Uitgave[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUitgave, setSelectedUitgave] = useState<Uitgave | null>(null);

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
      const data = await apiGet('/uitgaven').catch(() => []);
      setUitgaven(data);
    } catch (error) {
      console.error('Error loading uitgaven:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze uitgave wilt verwijderen?')) {
      return;
    }

    try {
      await apiDelete(`/uitgaven/${id}`);
      setUitgaven(uitgaven.filter(u => u.id !== id));
    } catch (error: any) {
      alert('Er is een fout opgetreden bij het verwijderen: ' + error.message);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Uitgavenbeheer" />
        <div className="page-content">
          <div className="loading">Gegevens laden...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Uitgavenbeheer" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h2>Uitgaven</h2>
            <p className="page-description">
              Beheer uw uitgaven en voeg nieuwe uitgaven toe.
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedUitgave(null);
                setModalOpen(true);
              }}
            >
              <i className="fas fa-plus"></i> Nieuwe Uitgave
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Beschrijving</th>
                <th>Categorie</th>
                <th>Bedrag</th>
                <th>Betaalmethode</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {uitgaven.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    <i className="fas fa-receipt"></i>
                    <h3>Geen uitgaven</h3>
                    <p>Voeg uw eerste uitgave toe om te beginnen</p>
                  </td>
                </tr>
              ) : (
                uitgaven.map((uitgave) => (
                  <tr key={uitgave.id}>
                    <td>{formatDatum(uitgave.datum)}</td>
                    <td>{uitgave.beschrijving}</td>
                    <td>{uitgave.categorie || '-'}</td>
                    <td>€{uitgave.bedrag.toFixed(2)}</td>
                    <td>{uitgave.betaalmethode || '-'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        title="Bewerken"
                        onClick={() => {
                          setSelectedUitgave(uitgave);
                          setModalOpen(true);
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(uitgave.id)}
                        title="Verwijderen"
                        style={{ marginLeft: '0.5rem' }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UitgaveModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUitgave(null);
        }}
        uitgave={selectedUitgave}
        onSuccess={loadData}
      />
    </>
  );
}
