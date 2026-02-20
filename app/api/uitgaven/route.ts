import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import * as store from '@/lib/store';
import { Uitgave } from '@/types';

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const rows = await store.getUitgaven();
  const result: Uitgave[] = await Promise.all(rows.map(async (u) => {
    const categorie = u.categorie_id ? (await store.getCategorieById(u.categorie_id))?.categorie ?? null : null;
    return {
      id: u.id,
      datum: u.datum,
      beschrijving: u.beschrijving,
      categorie_id: u.categorie_id,
      bedrag: u.bedrag,
      betaalmethode: u.betaalmethode,
      maand: u.maand,
      categorie
    };
  }));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const { datum, beschrijving, categorie_id, bedrag, betaalmethode } = body;

    const d = new Date(datum);
    const maand = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;

    const row = await store.insertUitgave({
      datum,
      beschrijving,
      categorie_id: categorie_id ? Number(categorie_id) : null,
      bedrag: Number(bedrag),
      betaalmethode: betaalmethode || null,
      maand
    });
    return NextResponse.json(row);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
