import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import * as store from '@/lib/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const { id } = await params;
  const idNum = Number(id);
  const afspraak = await store.getAfspraakById(idNum);

  if (!afspraak) {
    return NextResponse.json(
      { error: 'Afspraak not found' },
      { status: 404 }
    );
  }

  if (!afspraak.pdf_bestand) {
    return NextResponse.json(
      { error: 'No PDF for this afspraak' },
      { status: 404 }
    );
  }

  const base64 = await store.getAfspraakPdf(idNum);
  if (!base64) {
    return NextResponse.json(
      { error: 'PDF not found' },
      { status: 404 }
    );
  }

  const dataUrl = `data:application/pdf;base64,${base64}`;
  return NextResponse.json({ url: dataUrl });
}
