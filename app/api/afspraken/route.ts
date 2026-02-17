import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import * as store from '@/lib/store';
import { Afspraak } from '@/types';

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const rows = store.getAfspraken();
  const result: Afspraak[] = rows.map((a) => {
    const klant = store.getKlantById(a.klant_id);
    const consulttype = store.getConsulttypeById(a.type_id);
    return {
      id: a.id,
      datum: a.datum,
      klant_id: a.klant_id,
      type_id: a.type_id,
      aantal: a.aantal,
      prijs: a.prijs,
      totaal: a.totaal,
      terugbetaalbaar: a.terugbetaalbaar,
      opmerking: a.opmerking,
      maand: a.maand,
      pdf_bestand: a.pdf_bestand,
      voornaam: klant?.voornaam,
      achternaam: klant?.achternaam,
      type: consulttype?.type,
      type_prijs: consulttype?.prijs ?? undefined
    };
  });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const formData = await request.formData();
    const datum = formData.get('datum') as string;
    const klant_id = formData.get('klant_id') as string;
    const type_id = formData.get('type_id') as string;
    const aantal = formData.get('aantal') as string;
    const terugbetaalbaar = formData.get('terugbetaalbaar') === 'true';
    const opmerking = formData.get('opmerking') as string | null;
    const pdfFile = formData.get('pdf') as File | null;

    const typeRow = store.getConsulttypeById(Number(type_id));
    if (!typeRow) {
      return NextResponse.json({ error: 'Consulttype not found' }, { status: 400 });
    }
    const prijs = typeRow.prijs ?? 0;
    const totaal = prijs * (Number(aantal) || 1);
    const d = new Date(datum);
    d.setDate(1);
    const maand = d.toISOString().split('T')[0];

    let pdfBestand: string | null = null;
    if (pdfFile && pdfFile.size > 0) {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      pdfBestand = 'stored'; // marker; actual PDF in pdfStore by id after insert
    }

    const row = store.insertAfspraak({
      datum,
      klant_id: Number(klant_id),
      type_id: Number(type_id),
      aantal: Number(aantal) || 1,
      prijs,
      totaal,
      terugbetaalbaar: Boolean(terugbetaalbaar),
      opmerking: opmerking || null,
      maand,
      pdf_bestand: pdfBestand
    });

    if (pdfFile && pdfFile.size > 0) {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      store.setAfspraakPdf(row.id, base64);
    }

    return NextResponse.json({
      id: row.id,
      datum: row.datum,
      klant_id: row.klant_id,
      type_id: row.type_id,
      aantal: row.aantal,
      prijs: row.prijs,
      totaal: row.totaal,
      terugbetaalbaar: row.terugbetaalbaar,
      opmerking: row.opmerking
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
