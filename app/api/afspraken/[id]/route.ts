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
    const idNum = Number(id);
    const formData = await request.formData();
    const datum = formData.get('datum') as string | null;
    const klant_id = formData.get('klant_id') as string | null;
    const type_id = formData.get('type_id') as string | null;
    const aantal = formData.get('aantal') as string | null;
    const terugbetaalbaar = formData.get('terugbetaalbaar') as string | null;
    const opmerking = formData.get('opmerking') as string | null;
    const pdfFile = formData.get('pdf') as File | null;

    const updates: Partial<{ datum: string; klant_id: number; type_id: number; aantal: number; prijs: number; totaal: number; terugbetaalbaar: boolean; opmerking: string | null; maand: string | null; pdf_bestand: string | null }> = {};

    if (datum) {
      updates.datum = datum;
      const d = new Date(datum);
      d.setDate(1);
      updates.maand = d.toISOString().split('T')[0];
    }
    if (klant_id != null) updates.klant_id = Number(klant_id);
    if (type_id != null) updates.type_id = Number(type_id);
    if (aantal != null) updates.aantal = Number(aantal);
    if (terugbetaalbaar != null) updates.terugbetaalbaar = terugbetaalbaar === 'true';
    if (opmerking !== undefined) updates.opmerking = opmerking;

    if (type_id != null) {
      const typeRow = store.getConsulttypeById(Number(type_id));
      const prijs = typeRow?.prijs ?? 0;
      updates.prijs = prijs;
      updates.totaal = prijs * (Number(aantal) || 1);
    }

    if (pdfFile && pdfFile.size > 0) {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      store.setAfspraakPdf(idNum, base64);
      updates.pdf_bestand = 'stored';
    }

    const updated = store.updateAfspraak(idNum, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Afspraak not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Afspraak updated successfully' });
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
    const ok = store.deleteAfspraak(Number(id));
    if (!ok) {
      return NextResponse.json({ error: 'Afspraak not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Afspraak deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
