'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ConsulttypeModal from '@/components/ConsulttypeModal';
import CategorieModal from '@/components/CategorieModal';
import { apiGet, apiDelete } from '@/lib/api';
import { Consulttype, Mutualiteit, Categorie } from '@/types';

export default function InstellingenPage() {
  const router = useRouter();
  const [consulttypes, setConsulttypes] = useState<Consulttype[]>([]);
  const [mutualiteiten, setMutualiteiten] = useState<Mutualiteit[]>([]);
  const [categorieen, setCategorieen] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [consulttypeModalOpen, setConsulttypeModalOpen] = useState(false);
  const [categorieModalOpen, setCategorieModalOpen] = useState(false);
  const [selectedConsulttype, setSelectedConsulttype] = useState<Consulttype | null>(null);
  const [selectedCategorie, setSelectedCategorie] = useState<Categorie | null>(null);

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
      const [consulttypesData, mutualiteitenData, categorieenData] = await Promise.all([
        apiGet('/consulttypes').catch(() => []),
        apiGet('/mutualiteiten').catch(() => []),
        apiGet('/categorieen').catch(() => [])
      ]);

      setConsulttypes(consulttypesData);
      setMutualiteiten(mutualiteitenData);
      setCategorieen(categorieenData);
    } catch (error) {
      console.error('Error loading settings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConsulttype = async (id: number) => {
    if (!confirm('Weet je zeker dat je dit consulttype wilt verwijderen?')) {
      return;
    }

    try {
      await apiDelete(`/consulttypes/${id}`);
      setConsulttypes(consulttypes.filter(c => c.id !== id));
    } catch (error: any) {
      alert('Er is een fout opgetreden: ' + error.message);
    }
  };

  const handleDeleteCategorie = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze categorie wilt verwijderen?')) {
      return;
    }

    try {
      await apiDelete(`/categorieen/${id}`);
      setCategorieen(categorieen.filter(c => c.id !== id));
    } catch (error: any) {
      alert('Er is een fout opgetreden: ' + error.message);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Instellingen" />
        <div className="page-content">
          <div className="loading">Gegevens laden...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Instellingen" />
      <div className="page-content">
        <div className="page-header">
          <div>
            <h2>Instellingen</h2>
            <p className="page-description">
              Beheer consulttypes, mutualiteiten en categorieën.
            </p>
          </div>
        </div>

        <div className="settings-grid">
          {/* Consulttypes */}
          <div className="settings-card">
            <div className="settings-card-header">
              <h3>Consulttypes</h3>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSelectedConsulttype(null);
                  setConsulttypeModalOpen(true);
                }}
              >
                <i className="fas fa-plus"></i> Nieuw
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Prijs</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {consulttypes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="empty-state">
                        Geen consulttypes
                      </td>
                    </tr>
                  ) : (
                    consulttypes.map((type) => (
                      <tr key={type.id}>
                        <td>{type.type}</td>
                        <td>{type.prijs ? `€${type.prijs.toFixed(2)}` : '-'}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-secondary"
                            title="Bewerken"
                            onClick={() => {
                              setSelectedConsulttype(type);
                              setConsulttypeModalOpen(true);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteConsulttype(type.id)}
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

          {/* Mutualiteiten */}
          <div className="settings-card">
            <div className="settings-card-header">
              <h3>Mutualiteiten</h3>
              <span className="text-muted text-sm">Vaste lijst (niet bewerkbaar)</span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Naam</th>
                    <th>Max Sessies/Jaar</th>
                    <th>Opmerking</th>
                  </tr>
                </thead>
                <tbody>
                  {mutualiteiten.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="empty-state">
                        Geen mutualiteiten
                      </td>
                    </tr>
                  ) : (
                    mutualiteiten.map((mut) => (
                      <tr key={mut.id}>
                        <td>{mut.naam}</td>
                        <td>{mut.maxSessiesPerJaar || mut.max_sessies_per_jaar || '-'}</td>
                        <td>{mut.opmerking || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Categorieën */}
          <div className="settings-card">
            <div className="settings-card-header">
              <h3>Categorieën</h3>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSelectedCategorie(null);
                  setCategorieModalOpen(true);
                }}
              >
                <i className="fas fa-plus"></i> Nieuw
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Categorie</th>
                    <th>Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {categorieen.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="empty-state">
                        Geen categorieën
                      </td>
                    </tr>
                  ) : (
                    categorieen.map((cat) => (
                      <tr key={cat.id}>
                        <td>{cat.categorie}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-secondary"
                            title="Bewerken"
                            onClick={() => {
                              setSelectedCategorie(cat);
                              setCategorieModalOpen(true);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteCategorie(cat.id)}
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
        </div>
      </div>

      <ConsulttypeModal
        isOpen={consulttypeModalOpen}
        onClose={() => {
          setConsulttypeModalOpen(false);
          setSelectedConsulttype(null);
        }}
        consulttype={selectedConsulttype}
        onSuccess={loadData}
      />

      <CategorieModal
        isOpen={categorieModalOpen}
        onClose={() => {
          setCategorieModalOpen(false);
          setSelectedCategorie(null);
        }}
        categorie={selectedCategorie}
        onSuccess={loadData}
      />
    </>
  );
}
