import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import * as store from '@/lib/store';
import { Maandoverzicht } from '@/types';

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const { searchParams } = new URL(request.url);
  const jaarParam = searchParams.get('jaar');
  const year = jaarParam ? Math.max(2000, Math.min(2100, Number(jaarParam))) : new Date().getFullYear();
  const yearNum = Number.isNaN(year) ? new Date().getFullYear() : year;
  const yearStart = `${yearNum}-01-01`;
  const yearEnd = `${yearNum}-12-31`;

  const afspraken = (await store.getAfspraken()).filter(
    (a) => a.maand && a.maand >= yearStart && a.maand <= yearEnd
  );
  const uitgavenList = (await store.getUitgaven()).filter(
    (u) => u.maand && u.maand >= yearStart && u.maand <= yearEnd
  );

  const byMonth: Record<string, { inkomsten: number; uitgaven: number }> = {};
  for (let i = 1; i <= 12; i++) {
    const m = i.toString().padStart(2, '0');
    byMonth[m] = { inkomsten: 0, uitgaven: 0 };
  }

  // Alle afspraken (ook terugbetaalbare) tellen als inkomsten.
  afspraken.forEach((a) => {
    const m = a.maand ? String(a.maand).slice(5, 7) : null;
    if (m && byMonth[m]) {
      byMonth[m].inkomsten += Number(a.totaal || 0);
    }
  });

  uitgavenList.forEach((u) => {
    const m = u.maand ? String(u.maand).slice(5, 7) : null;
    if (m && byMonth[m]) {
      byMonth[m].uitgaven += Number(u.bedrag || 0);
    }
  });

  const monthlyData: Maandoverzicht[] = Object.entries(byMonth).map(([maand, v]) => ({
    maand,
    inkomsten: v.inkomsten,
    uitgaven: v.uitgaven,
    netto: v.inkomsten - v.uitgaven
  }));

  return NextResponse.json(monthlyData);
}
