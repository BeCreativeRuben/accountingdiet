'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Uitgave, Categorie } from '@/types';
import { apiGet, apiPost, apiPut } from '@/lib/api';

interface UitgaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  uitgave?: Uitgave | null;
  onSuccess: () => void;
}

export default function UitgaveModal({
  isOpen,
  onClose,
  uitgave,
  onSuccess,
}: UitgaveModalProps) {
  const [categorieen, setCategorieen] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    datum: '',
    beschrijving: '',
    categorie_id: '',
    bedrag: '',
    betaalmethode: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCategorieen();
      if (uitgave) {
        setFormData({
          datum: uitgave.datum,
          beschrijving: uitgave.beschrijving,
          categorie_id: uitgave.categorie_id?.toString() || '',
          bedrag: uitgave.bedrag.toString(),
          betaalmethode: uitgave.betaalmethode || '',
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          datum: today,
          beschrijving: '',
          categorie_id: '',
          bedrag: '',
          betaalmethode: '',
        });
      }
    }
  }, [isOpen, uitgave]);

  const loadCategorieen = async () => {
    try {
      const data = await apiGet('/categorieen');
      setCategorieen(data);
    } catch (error) {
      console.error('Error loading categorieen:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        categorie_id: formData.categorie_id ? Number(formData.categorie_id) : null,
        bedrag: Number(formData.bedrag),
      };

      if (uitgave) {
        await apiPut(`/uitgaven/${uitgave.id}`, data);
      } else {
        await apiPost('/uitgaven', data);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      alert('Er is een fout opgetreden: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={uitgave ? 'Uitgave Bewerken' : 'Nieuwe Uitgave'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="datum">Datum *</label>
          <input
            type="date"
            id="datum"
            value={formData.datum}
            onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="beschrijving">Beschrijving *</label>
          <input
            type="text"
            id="beschrijving"
            value={formData.beschrijving}
            onChange={(e) => setFormData({ ...formData, beschrijving: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="categorie_id">Categorie</label>
          <select
            id="categorie_id"
            value={formData.categorie_id}
            onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
          >
            <option value="">Selecteer categorie</option>
            {categorieen.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categorie}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="bedrag">Bedrag *</label>
          <input
            type="number"
            id="bedrag"
            step="0.01"
            min="0"
            value={formData.bedrag}
            onChange={(e) => setFormData({ ...formData, bedrag: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="betaalmethode">Betaalmethode</label>
          <select
            id="betaalmethode"
            value={formData.betaalmethode}
            onChange={(e) => setFormData({ ...formData, betaalmethode: e.target.value })}
          >
            <option value="">Selecteer betaalmethode</option>
            <option value="Contant">Contant</option>
            <option value="Bankoverschrijving">Bankoverschrijving</option>
            <option value="Bancontact">Bancontact</option>
            <option value="Creditcard">Creditcard</option>
            <option value="Domiciliëring">Domiciliëring</option>
          </select>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Annuleren
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
