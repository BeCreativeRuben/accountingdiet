import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import * as store from '@/lib/store';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering } = body;

    const updates: Partial<{ voornaam: string; achternaam: string; email: string | null; telefoon: string | null; startdatum: string | null; mutualiteit_id: number | null; solidaris_uitzondering: boolean }> = {
      voornaam,
      achternaam,
      email: email || null,
      telefoon: telefoon || null,
      startdatum: startdatum || null,
      mutualiteit_id: mutualiteit_id ? Number(mutualiteit_id) : null
    };

    if (solidaris_uitzondering !== undefined) {
      updates.solidaris_uitzondering = solidaris_uitzondering === true || solidaris_uitzondering === 'true';
    }

    const updated = store.updateKlant(Number(id), updates);
    if (!updated) {
      return NextResponse.json({ error: 'Klant not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Klant updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const { id } = await params;
    const ok = store.deleteKlant(Number(id));
    if (!ok) {
      return NextResponse.json({ error: 'Klant not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Klant deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
