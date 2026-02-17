'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Mutualiteit } from '@/types';
import { apiPost, apiPut } from '@/lib/api';

interface MutualiteitModalProps {
  isOpen: boolean;
  onClose: () => void;
  mutualiteit?: Mutualiteit | null;
  onSuccess: () => void;
}

export default function MutualiteitModal({
  isOpen,
  onClose,
  mutualiteit,
  onSuccess,
}: MutualiteitModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    naam: '',
    maxSessiesPerJaar: '',
    opmerking: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (mutualiteit) {
        setFormData({
          naam: mutualiteit.naam,
          maxSessiesPerJaar:
            (mutualiteit.maxSessiesPerJaar || mutualiteit.max_sessies_per_jaar)?.toString() || '',
          opmerking: mutualiteit.opmerking || '',
        });
      } else {
        setFormData({
          naam: '',
          maxSessiesPerJaar: '',
          opmerking: '',
        });
      }
    }
  }, [isOpen, mutualiteit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        naam: formData.naam,
        maxSessiesPerJaar: formData.maxSessiesPerJaar
          ? Number(formData.maxSessiesPerJaar)
          : null,
        opmerking: formData.opmerking || null,
      };

      if (mutualiteit) {
        await apiPut(`/mutualiteiten/${mutualiteit.id}`, data);
      } else {
        await apiPost('/mutualiteiten', data);
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
      title={mutualiteit ? 'Mutualiteit Bewerken' : 'Nieuwe Mutualiteit'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="naam">Naam *</label>
          <input
            type="text"
            id="naam"
            value={formData.naam}
            onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="maxSessiesPerJaar">Max Sessies per Jaar</label>
          <input
            type="number"
            id="maxSessiesPerJaar"
            min="0"
            value={formData.maxSessiesPerJaar}
            onChange={(e) =>
              setFormData({ ...formData, maxSessiesPerJaar: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="opmerking">Opmerking</label>
          <textarea
            id="opmerking"
            value={formData.opmerking}
            onChange={(e) => setFormData({ ...formData, opmerking: e.target.value })}
            rows={3}
          />
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
