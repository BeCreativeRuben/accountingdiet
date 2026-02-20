'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AfspraakModal from '@/components/AfspraakModal';
import { apiGet, apiDelete } from '@/lib/api';
import { Afspraak } from '@/types';

/** Format ISO date (YYYY-MM-DD) to Dutch d-m-y; avoids wrong year when parsing with Date. */
function formatDatum(datum: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    const [y, m, d] = datum.split('-');
    return `${parseInt(d, 10)}-${parseInt(m, 10)}-${y}`;
  }
  return new Date(datum).toLocaleDateString('nl-NL');
}

export default function AfsprakenPage() {
  const router = useRouter();
  const [afspraken, setAfspraken] = useState<Afspraak[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAfspraak, setSelectedAfspraak] = useState<Afspraak | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAfspraken = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return afspraken;
    return afspraken.filter((a) => {
      const naam = `${(a.voornaam ?? '').toLowerCase()} ${(a.achternaam ?? '').toLowerCase()}`.trim();
      const naamOmgekeerd = `${(a.achternaam ?? '').toLowerCase()} ${(a.voornaam ?? '').toLowerCase()}`.trim();
      return naam.includes(q) || naamOmgekeerd.includes(q) || (a.voornaam?.toLowerCase() ?? '').includes(q) || (a.achternaam?.toLowerCase() ?? '').includes(q);
    });
  }, [afspraken, searchQuery]);

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
      const data = await apiGet('/afspraken').catch(() => []);
      setAfspraken(data);
    } catch (error) {
      console.error('Error loading afspraken:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze afspraak wilt verwijderen?')) {
      return;
    }

    try {
      await apiDelete(`/afspraken/${id}`);
      setAfspraken(afspraken.filter(a => a.id !== id));
    } catch (error: any) {
      alert('Er is een fout opgetreden bij het verwijderen: ' + error.message);
    }
  };

  const handleDownloadPDF = async (id: number) => {
    try {
      const response = await apiGet(`/afspraken/${id}/pdf`);
      if (response.url) {
        window.open(response.url, '_blank');
      }
    } catch (error: any) {
      alert('Er is een fout opgetreden bij het downloaden: ' + error.message);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Afsprakenbeheer" />
        <div className="page-content">
          <div className="loading">Gegevens laden...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Afsprakenbeheer" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h2>Afspraken</h2>
            <p className="page-description">
              Beheer uw afspraken en voeg nieuwe afspraken toe.
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedAfspraak(null);
                setModalOpen(true);
              }}
            >
              <i className="fas fa-plus"></i> Nieuwe Afspraak
            </button>
          </div>
        </div>

        <div className="search-bar-wrap">
          <label className="search-label" htmlFor="afspraak-zoek">
            <i className="fas fa-search"></i>
          </label>
          <input
            id="afspraak-zoek"
            type="search"
            className="search-input"
            placeholder="Zoek op klantnaam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Afspraken zoeken op klant"
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
                <th>Datum</th>
                <th>Klant</th>
                <th>Type</th>
                <th>Aantal</th>
                <th>Totaal</th>
                <th>Terugbetaalbaar</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {afspraken.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <i className="fas fa-calendar-alt"></i>
                    <h3>Geen afspraken</h3>
                    <p>Voeg uw eerste afspraak toe om te beginnen</p>
                  </td>
                </tr>
              ) : filteredAfspraken.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <i className="fas fa-search"></i>
                    <p>Geen afspraken gevonden voor &quot;{searchQuery}&quot;</p>
                  </td>
                </tr>
              ) : (
                filteredAfspraken.map((afspraak) => (
                  <tr key={afspraak.id}>
                    <td>{formatDatum(afspraak.datum)}</td>
                    <td>{afspraak.voornaam} {afspraak.achternaam}</td>
                    <td>{afspraak.type || '-'}</td>
                    <td>{afspraak.aantal}</td>
                    <td>€{afspraak.totaal.toFixed(2)}</td>
                    <td>{afspraak.terugbetaalbaar ? 'Ja' : 'Nee'}</td>
                    <td>
                      {afspraak.pdf_bestand && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleDownloadPDF(afspraak.id)}
                          title="PDF Downloaden"
                        >
                          <i className="fas fa-file-pdf"></i>
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-secondary"
                        title="Bewerken"
                        onClick={() => {
                          setSelectedAfspraak(afspraak);
                          setModalOpen(true);
                        }}
                        style={{ marginLeft: '0.5rem' }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(afspraak.id)}
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

      <AfspraakModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAfspraak(null);
        }}
        afspraak={selectedAfspraak}
        onSuccess={loadData}
      />
    </>
  );
}
