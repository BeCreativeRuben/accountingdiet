'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Categorie } from '@/types';
import { apiPost, apiPut } from '@/lib/api';

interface CategorieModalProps {
  isOpen: boolean;
  onClose: () => void;
  categorie?: Categorie | null;
  onSuccess: () => void;
}

export default function CategorieModal({
  isOpen,
  onClose,
  categorie,
  onSuccess,
}: CategorieModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categorie: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (categorie) {
        setFormData({
          categorie: categorie.categorie,
        });
      } else {
        setFormData({
          categorie: '',
        });
      }
    }
  }, [isOpen, categorie]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (categorie) {
        await apiPut(`/categorieen/${categorie.id}`, formData);
      } else {
        await apiPost('/categorieen', formData);
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
      title={categorie ? 'Categorie Bewerken' : 'Nieuwe Categorie'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="categorie">Categorie *</label>
          <input
            type="text"
            id="categorie"
            value={formData.categorie}
            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
            required
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
