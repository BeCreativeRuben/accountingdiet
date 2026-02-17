'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Afspraak, Klant, Consulttype } from '@/types';
import { apiGet, apiPostFormData, apiPutFormData } from '@/lib/api';

interface AfspraakModalProps {
  isOpen: boolean;
  onClose: () => void;
  afspraak?: Afspraak | null;
  onSuccess: () => void;
}

export default function AfspraakModal({
  isOpen,
  onClose,
  afspraak,
  onSuccess,
}: AfspraakModalProps) {
  const [klanten, setKlanten] = useState<Klant[]>([]);
  const [consulttypes, setConsulttypes] = useState<Consulttype[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    datum: '',
    klant_id: '',
    type_id: '',
    aantal: '1',
    terugbetaalbaar: false,
    opmerking: '',
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (afspraak) {
        setFormData({
          datum: afspraak.datum,
          klant_id: afspraak.klant_id.toString(),
          type_id: afspraak.type_id.toString(),
          aantal: afspraak.aantal.toString(),
          terugbetaalbaar: afspraak.terugbetaalbaar,
          opmerking: afspraak.opmerking || '',
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          datum: today,
          klant_id: '',
          type_id: '',
          aantal: '1',
          terugbetaalbaar: false,
          opmerking: '',
        });
      }
      setPdfFile(null);
    }
  }, [isOpen, afspraak]);

  const loadData = async () => {
    try {
      const [klantenData, consulttypesData] = await Promise.all([
        apiGet('/klanten'),
        apiGet('/consulttypes'),
      ]);
      setKlanten(klantenData);
      setConsulttypes(consulttypesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('datum', formData.datum);
      formDataToSend.append('klant_id', formData.klant_id);
      formDataToSend.append('type_id', formData.type_id);
      formDataToSend.append('aantal', formData.aantal);
      formDataToSend.append('terugbetaalbaar', formData.terugbetaalbaar.toString());
      if (formData.opmerking) {
        formDataToSend.append('opmerking', formData.opmerking);
      }
      if (pdfFile) {
        formDataToSend.append('pdf', pdfFile);
      }

      if (afspraak) {
        await apiPutFormData(`/afspraken/${afspraak.id}`, formDataToSend);
      } else {
        await apiPostFormData('/afspraken', formDataToSend);
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
      title={afspraak ? 'Afspraak Bewerken' : 'Nieuwe Afspraak'}
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
          <label htmlFor="klant_id">Klant *</label>
          <select
            id="klant_id"
            value={formData.klant_id}
            onChange={(e) => setFormData({ ...formData, klant_id: e.target.value })}
            required
          >
            <option value="">Selecteer klant</option>
            {klanten.map((klant) => (
              <option key={klant.id} value={klant.id}>
                {klant.voornaam} {klant.achternaam}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="type_id">Consulttype *</label>
          <select
            id="type_id"
            value={formData.type_id}
            onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
            required
          >
            <option value="">Selecteer consulttype</option>
            {consulttypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.type} {type.prijs ? `(€${type.prijs.toFixed(2)})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="aantal">Aantal *</label>
          <input
            type="number"
            id="aantal"
            min="1"
            value={formData.aantal}
            onChange={(e) => setFormData({ ...formData, aantal: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.terugbetaalbaar}
              onChange={(e) =>
                setFormData({ ...formData, terugbetaalbaar: e.target.checked })
              }
            />
            Terugbetaalbaar
          </label>
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
        <div className="form-group">
          <label htmlFor="pdf">PDF Bestand</label>
          <input
            type="file"
            id="pdf"
            accept=".pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          />
          {afspraak?.pdf_bestand && !pdfFile && (
            <p style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.5rem' }}>
              Huidig PDF: {afspraak.pdf_bestand}
            </p>
          )}
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
