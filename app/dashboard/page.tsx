'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Header from '@/components/Header';
import { apiGet } from '@/lib/api';
import { Dashboard, Maandoverzicht } from '@/types';

const MAAND_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mrt', '04': 'Apr', '05': 'Mei', '06': 'Jun',
  '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Dec',
};

const currentYear = new Date().getFullYear();
const JAAR_OPTS = [currentYear, currentYear - 1, currentYear - 2];

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [maandoverzicht, setMaandoverzicht] = useState<Maandoverzicht[]>([]);
  const [loading, setLoading] = useState(true);
  const [jaar, setJaar] = useState(currentYear);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  useEffect(() => {
    if (!jaar) return;
    loadMaandoverzicht(jaar);
  }, [jaar]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, maandoverzichtData] = await Promise.all([
        apiGet('/dashboard').catch(() => ({ inkomsten: 0, uitgaven: 0, netto: 0 })),
        apiGet(`/maandoverzicht?jaar=${jaar}`).catch(() => [])
      ]);

      setDashboard(dashboardData);
      setMaandoverzicht(maandoverzichtData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMaandoverzicht = async (jaarNum: number) => {
    try {
      const data = await apiGet(`/maandoverzicht?jaar=${jaarNum}`).catch(() => []);
      setMaandoverzicht(data);
    } catch {
      setMaandoverzicht([]);
    }
  };

  const chartData = useMemo(() => {
    const sorted = [...maandoverzicht].sort((a, b) => Number(a.maand) - Number(b.maand) || a.maand.localeCompare(b.maand));
    return sorted.map((item) => ({
      ...item,
      maandLabel: MAAND_LABELS[item.maand] || item.maand,
    }));
  }, [maandoverzicht]);

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
            <h2>Maandoverzicht</h2>
            <div className="chart-actions">
              <label className="year-select-wrap">
                <span className="sr-only">Jaar</span>
                <select
                  className="year-select"
                  value={jaar}
                  onChange={(e) => setJaar(Number(e.target.value))}
                  aria-label="Jaar"
                >
                  {JAAR_OPTS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
              <button
                className="btn btn-sm btn-secondary"
                onClick={loadData}
              >
                <i className="fas fa-sync-alt"></i> Vernieuwen
              </button>
            </div>
          </div>
          {chartData.length > 0 && (
            <div style={{ width: '100%', height: 280, marginTop: '1rem', marginBottom: '1.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="maandLabel" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
                  <Tooltip
                    formatter={(value: number) => `€${Number(value).toFixed(2)}`}
                    labelFormatter={(label) => label}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend />
                  <Bar name="Inkomsten" dataKey="inkomsten" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar name="Uitgaven" dataKey="uitgaven" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
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
                      <td>{MAAND_LABELS[item.maand] || item.maand}</td>
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
