import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import * as store from '@/lib/store';
import { Dashboard } from '@/types';

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const currentMonth = new Date();
  currentMonth.setDate(1);
  const currentMonthStr = currentMonth.toISOString().split('T')[0];

  const afspraken = (await store.getAfspraken()).filter((a) => a.maand === currentMonthStr);
  const uitgavenList = (await store.getUitgaven()).filter((u) => u.maand === currentMonthStr);

  const inkomsten = afspraken.reduce((s, r) => s + Number(r.totaal || 0), 0);
  const uitgaven = uitgavenList.reduce((s, r) => s + Number(r.bedrag || 0), 0);

  const dashboard: Dashboard = {
    inkomsten,
    uitgaven,
    netto: inkomsten - uitgaven
  };

  return NextResponse.json(dashboard);
}
