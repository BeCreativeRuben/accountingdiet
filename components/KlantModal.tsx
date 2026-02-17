'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Klant, Mutualiteit } from '@/types';
import { apiGet, apiPost, apiPut } from '@/lib/api';

interface KlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  klant?: Klant | null;
  onSuccess: () => void;
}

export default function KlantModal({ isOpen, onClose, klant, onSuccess }: KlantModalProps) {
  const [mutualiteiten, setMutualiteiten] = useState<Mutualiteit[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    voornaam: '',
    achternaam: '',
    email: '',
    telefoon: '',
    startdatum: '',
    mutualiteit_id: '',
    solidaris_uitzondering: false,
  });

  useEffect(() => {
    if (isOpen) {
      loadMutualiteiten();
      if (klant) {
        setFormData({
          voornaam: klant.voornaam,
          achternaam: klant.achternaam,
          email: klant.email || '',
          telefoon: klant.telefoon || '',
          startdatum: klant.startdatum || '',
          mutualiteit_id: klant.mutualiteit_id?.toString() || '',
          solidaris_uitzondering: klant.solidaris_uitzondering || false,
        });
      } else {
        setFormData({
          voornaam: '',
          achternaam: '',
          email: '',
          telefoon: '',
          startdatum: '',
          mutualiteit_id: '',
          solidaris_uitzondering: false,
        });
      }
    }
  }, [isOpen, klant]);

  const loadMutualiteiten = async () => {
    try {
      const data = await apiGet('/mutualiteiten');
      setMutualiteiten(data);
    } catch (error) {
      console.error('Error loading mutualiteiten:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        mutualiteit_id: formData.mutualiteit_id ? Number(formData.mutualiteit_id) : null,
      };

      if (klant) {
        await apiPut(`/klanten/${klant.id}`, data);
      } else {
        await apiPost('/klanten', data);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      alert('Er is een fout opgetreden: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedMutualiteit = mutualiteiten.find(
    (m) => m.id.toString() === formData.mutualiteit_id
  );
  const showSolidarisCheckbox =
    selectedMutualiteit?.naam.toLowerCase().includes('solidaris');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={klant ? 'Klant Bewerken' : 'Nieuwe Klant'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="voornaam">Voornaam *</label>
          <input
            type="text"
            id="voornaam"
            value={formData.voornaam}
            onChange={(e) => setFormData({ ...formData, voornaam: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="achternaam">Achternaam *</label>
          <input
            type="text"
            id="achternaam"
            value={formData.achternaam}
            onChange={(e) => setFormData({ ...formData, achternaam: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefoon">Telefoon</label>
          <input
            type="tel"
            id="telefoon"
            value={formData.telefoon}
            onChange={(e) => setFormData({ ...formData, telefoon: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="startdatum">Startdatum</label>
          <input
            type="date"
            id="startdatum"
            value={formData.startdatum}
            onChange={(e) => setFormData({ ...formData, startdatum: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="mutualiteit">Mutualiteit</label>
          <select
            id="mutualiteit"
            value={formData.mutualiteit_id}
            onChange={(e) => setFormData({ ...formData, mutualiteit_id: e.target.value })}
          >
            <option value="">Selecteer mutualiteit</option>
            {mutualiteiten.map((mut) => (
              <option key={mut.id} value={mut.id}>
                {mut.naam}
              </option>
            ))}
          </select>
        </div>
        {showSolidarisCheckbox && (
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.solidaris_uitzondering}
                onChange={(e) =>
                  setFormData({ ...formData, solidaris_uitzondering: e.target.checked })
                }
              />
              Solidaris uitzondering (met doktersattest - 8 sessies i.p.v. 4)
            </label>
          </div>
        )}
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
