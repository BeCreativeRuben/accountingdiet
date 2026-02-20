'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import KlantModal from '@/components/KlantModal';
import { apiGet, apiDelete } from '@/lib/api';
import { Klant, Mutualiteit } from '@/types';

export default function KlantenPage() {
  const router = useRouter();
  const [klanten, setKlanten] = useState<Klant[]>([]);
  const [afspraken, setAfspraken] = useState<{ klant_id: number }[]>([]);
  const [mutualiteiten, setMutualiteiten] = useState<Mutualiteit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKlant, setSelectedKlant] = useState<Klant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      const [klantenData, afsprakenData, mutualiteitenData] = await Promise.all([
        apiGet('/klanten').catch(() => []),
        apiGet('/afspraken').catch(() => []),
        apiGet('/mutualiteiten').catch(() => [])
      ]);

      setKlanten(klantenData);
      setAfspraken(afsprakenData.map((a: { klant_id: number }) => ({ klant_id: a.klant_id })));
      setMutualiteiten(mutualiteitenData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const afsprakenPerKlant = useMemo(() => {
    const count: Record<number, number> = {};
    afspraken.forEach((a) => { count[a.klant_id] = (count[a.klant_id] ?? 0) + 1; });
    return count;
  }, [afspraken]);

  const filteredKlanten = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return klanten;
    return klanten.filter(
      (k) =>
        (k.voornaam?.toLowerCase() ?? '').includes(q) ||
        (k.achternaam?.toLowerCase() ?? '').includes(q) ||
        `${(k.voornaam ?? '').toLowerCase()} ${(k.achternaam ?? '').toLowerCase()}`.includes(q) ||
        `${(k.achternaam ?? '').toLowerCase()} ${(k.voornaam ?? '').toLowerCase()}`.includes(q) ||
        (k.email?.toLowerCase() ?? '').includes(q) ||
        (k.telefoon ?? '').replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    );
  }, [klanten, searchQuery]);

  const handleDelete = async (id: number) => {
    if (id == null || id === undefined) return;
    if (!confirm('Weet je zeker dat je deze klant wilt verwijderen?')) {
      return;
    }

    try {
      await apiDelete(`/klanten/${id}`);
      setKlanten((prev) => prev.filter((k) => k.id !== id));
    } catch (error: any) {
      alert('Er is een fout opgetreden bij het verwijderen: ' + (error?.message ?? 'Onbekende fout'));
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Klantenbeheer" />
        <div className="page-content">
          <div className="loading">Gegevens laden...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Klantenbeheer" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h2>Klanten</h2>
            <p className="page-description">
              Beheer uw klantenbestand en voeg nieuwe klanten toe.
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedKlant(null);
                setModalOpen(true);
              }}
            >
              <i className="fas fa-plus"></i> Nieuwe Klant
            </button>
          </div>
        </div>

        <div className="search-bar-wrap">
          <label className="search-label" htmlFor="klant-zoek">
            <i className="fas fa-search"></i>
          </label>
          <input
            id="klant-zoek"
            type="search"
            className="search-input"
            placeholder="Zoek op naam, e-mail of telefoon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Klanten zoeken"
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
                <th>Naam</th>
                <th>Email</th>
                <th>Telefoon</th>
                <th>Startdatum</th>
                <th>Mutualiteit</th>
                <th>Afspraken</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {klanten.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <i className="fas fa-users"></i>
                    <h3>Geen klanten</h3>
                    <p>Voeg uw eerste klant toe om te beginnen</p>
                  </td>
                </tr>
              ) : filteredKlanten.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <i className="fas fa-search"></i>
                    <p>Geen klanten gevonden voor &quot;{searchQuery}&quot;</p>
                  </td>
                </tr>
              ) : (
                filteredKlanten.map((klant) => (
                  <tr key={klant.id}>
                    <td>{klant.voornaam} {klant.achternaam}</td>
                    <td>{klant.email || '-'}</td>
                    <td>{klant.telefoon || '-'}</td>
                    <td>{klant.startdatum || '-'}</td>
                    <td>{klant.mutualiteit_naam || '-'}</td>
                    <td>{afsprakenPerKlant[klant.id] ?? 0}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        title="Bewerken"
                        onClick={() => {
                          setSelectedKlant(klant);
                          setModalOpen(true);
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(klant.id);
                        }}
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

      <KlantModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedKlant(null);
        }}
        klant={selectedKlant}
        onSuccess={loadData}
      />
    </>
  );
}
