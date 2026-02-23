import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import * as store from '@/lib/store';

export async function POST(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const klant_id = Number(body.klant_id);
    const geinformeerd = Boolean(body.geinformeerd);
    if (!klant_id || Number.isNaN(klant_id)) {
      return NextResponse.json({ error: 'klant_id verplicht' }, { status: 400 });
    }
    const jaar = new Date().getFullYear();
    await store.setTerugbetalingGeinformeerd(klant_id, jaar, geinformeerd);
    return NextResponse.json({ ok: true, klant_id, geinformeerd, jaar });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
