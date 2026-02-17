'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import KlantModal from '@/components/KlantModal';
import { apiGet, apiDelete } from '@/lib/api';
import { Klant, Mutualiteit } from '@/types';

export default function KlantenPage() {
  const router = useRouter();
  const [klanten, setKlanten] = useState<Klant[]>([]);
  const [mutualiteiten, setMutualiteiten] = useState<Mutualiteit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKlant, setSelectedKlant] = useState<Klant | null>(null);

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
      const [klantenData, mutualiteitenData] = await Promise.all([
        apiGet('/klanten').catch(() => []),
        apiGet('/mutualiteiten').catch(() => [])
      ]);

      setKlanten(klantenData);
      setMutualiteiten(mutualiteitenData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

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

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Naam</th>
                <th>Email</th>
                <th>Telefoon</th>
                <th>Startdatum</th>
                <th>Mutualiteit</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {klanten.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    <i className="fas fa-users"></i>
                    <h3>Geen klanten</h3>
                    <p>Voeg uw eerste klant toe om te beginnen</p>
                  </td>
                </tr>
              ) : (
                klanten.map((klant) => (
                  <tr key={klant.id}>
                    <td>{klant.voornaam} {klant.achternaam}</td>
                    <td>{klant.email || '-'}</td>
                    <td>{klant.telefoon || '-'}</td>
                    <td>{klant.startdatum || '-'}</td>
                    <td>{klant.mutualiteit_naam || '-'}</td>
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
