import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import * as store from '@/lib/store';
import { Dashboard } from '@/types';

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const currentYM = `${y}-${m}`;

  /** Get YYYY-MM from datum/maand (ISO string or parseable); so old rows with any valid format still match. */
  const getYearMonth = (dateStr: string | null): string | null => {
    if (!dateStr) return null;
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
    if (iso) return `${iso[1]}-${iso[2]}`;
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return null;
  };

  const inCurrentMonth = (dateStr: string | null) => getYearMonth(dateStr) === currentYM;

  const afspraken = (await store.getAfspraken()).filter(
    (a) => inCurrentMonth(a.maand) || inCurrentMonth(a.datum)
  );
  const uitgavenList = (await store.getUitgaven()).filter(
    (u) => inCurrentMonth(u.maand) || inCurrentMonth(u.datum)
  );

  // Inkomsten = som van totaal van alle afspraken deze maand (ook terugbetaalbare tellen mee).
  const inkomsten = afspraken.reduce((s, r) => s + Number(r.totaal ?? 0), 0);
  const uitgaven = uitgavenList.reduce((s, r) => s + Number(r.bedrag || 0), 0);

  const dashboard: Dashboard = {
    inkomsten,
    uitgaven,
    netto: inkomsten - uitgaven
  };

  return NextResponse.json(dashboard);
}
