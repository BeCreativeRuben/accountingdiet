'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { apiGet } from '@/lib/api';
import { Dashboard, Maandoverzicht } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [maandoverzicht, setMaandoverzicht] = useState<Maandoverzicht[]>([]);
  const [loading, setLoading] = useState(true);

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
      const [dashboardData, maandoverzichtData] = await Promise.all([
        apiGet('/dashboard').catch(() => ({ inkomsten: 0, uitgaven: 0, netto: 0 })),
        apiGet('/maandoverzicht').catch(() => [])
      ]);

      setDashboard(dashboardData);
      setMaandoverzicht(maandoverzichtData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="page-content">
          <div className="loading">Gegevens laden...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" />
      <div className="page-content">
        <div className="kpi-cards">
          <div className="kpi-card">
            <div className="kpi-icon">
              <i className="fas fa-euro-sign"></i>
            </div>
            <div className="kpi-content">
              <h3>Inkomsten (deze maand)</h3>
              <p className="kpi-value">
                €{dashboard?.inkomsten.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <i className="fas fa-credit-card"></i>
            </div>
            <div className="kpi-content">
              <h3>Uitgaven (deze maand)</h3>
              <p className="kpi-value">
                €{dashboard?.uitgaven.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="kpi-content">
              <h3>Netto (deze maand)</h3>
              <p className="kpi-value">
                €{dashboard?.netto.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h2>Maandoverzicht {new Date().getFullYear()}</h2>
            <div className="chart-actions">
              <button
                className="btn btn-sm btn-secondary"
                onClick={loadData}
              >
                <i className="fas fa-sync-alt"></i> Vernieuwen
              </button>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Maand</th>
                  <th>Inkomsten</th>
                  <th>Uitgaven</th>
                  <th>Netto</th>
                </tr>
              </thead>
              <tbody>
                {maandoverzicht.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      Geen data beschikbaar
                    </td>
                  </tr>
                ) : (
                  maandoverzicht.map((item) => (
                    <tr key={item.maand}>
                      <td>{item.maand}</td>
                      <td>€{item.inkomsten.toFixed(2)}</td>
                      <td>€{item.uitgaven.toFixed(2)}</td>
                      <td>€{item.netto.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
