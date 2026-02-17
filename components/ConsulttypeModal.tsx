'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Consulttype } from '@/types';
import { apiPost, apiPut } from '@/lib/api';

interface ConsulttypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  consulttype?: Consulttype | null;
  onSuccess: () => void;
}

export default function ConsulttypeModal({
  isOpen,
  onClose,
  consulttype,
  onSuccess,
}: ConsulttypeModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    prijs: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (consulttype) {
        setFormData({
          type: consulttype.type,
          prijs: consulttype.prijs?.toString() || '',
        });
      } else {
        setFormData({
          type: '',
          prijs: '',
        });
      }
    }
  }, [isOpen, consulttype]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        type: formData.type,
        prijs: formData.prijs ? Number(formData.prijs) : null,
      };

      if (consulttype) {
        await apiPut(`/consulttypes/${consulttype.id}`, data);
      } else {
        await apiPost('/consulttypes', data);
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
      title={consulttype ? 'Consulttype Bewerken' : 'Nieuwe Consulttype'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Type *</label>
          <input
            type="text"
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="prijs">Prijs</label>
          <input
            type="number"
            id="prijs"
            step="0.01"
            min="0"
            value={formData.prijs}
            onChange={(e) => setFormData({ ...formData, prijs: e.target.value })}
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
