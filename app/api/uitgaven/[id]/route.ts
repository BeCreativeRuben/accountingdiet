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
    const { datum, beschrijving, categorie_id, bedrag, betaalmethode } = body;

    const updates: Partial<{ datum: string; beschrijving: string; categorie_id: number | null; bedrag: number; betaalmethode: string | null; maand: string | null }> = {
      beschrijving,
      categorie_id: categorie_id != null ? Number(categorie_id) : null,
      betaalmethode: betaalmethode !== undefined ? betaalmethode : null
    };
    if (bedrag != null) updates.bedrag = Number(bedrag);
    if (datum) {
      updates.datum = datum;
      const d = new Date(datum);
      d.setDate(1);
      updates.maand = d.toISOString().split('T')[0];
    }

    const updated = store.updateUitgave(Number(id), updates);
    if (!updated) {
      return NextResponse.json({ error: 'Uitgave not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Uitgave updated successfully' });
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
    const ok = store.deleteUitgave(Number(id));
    if (!ok) {
      return NextResponse.json({ error: 'Uitgave not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Uitgave deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
