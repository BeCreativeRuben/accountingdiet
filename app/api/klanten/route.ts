import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { getMutualiteitNaam } from '@/lib/mutualiteiten';
import * as store from '@/lib/store';
import { Klant } from '@/types';

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const rows = await store.getKlanten();
  const result: Klant[] = rows.map((k) => ({
    ...k,
    mutualiteit_naam: k.mutualiteit_id ? getMutualiteitNaam(k.mutualiteit_id) : null,
    solidaris_uitzondering: k.solidaris_uitzondering || false
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
    const { voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering } = body;

    const row = await store.insertKlant({
      voornaam,
      achternaam,
      email: email || null,
      telefoon: telefoon || null,
      startdatum: startdatum || null,
      mutualiteit_id: mutualiteit_id ? Number(mutualiteit_id) : null,
      solidaris_uitzondering: solidaris_uitzondering === true || solidaris_uitzondering === 'true'
    });

    return NextResponse.json(row);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
