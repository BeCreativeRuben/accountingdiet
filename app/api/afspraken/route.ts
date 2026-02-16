import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Afspraak } from '@/types';

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { data: afspraken, error } = await supabase
      .from('afspraken')
      .select(`
        *,
        klanten (voornaam, achternaam),
        consulttypes (type, prijs)
      `)
      .order('datum', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const rows = (afspraken || []).map((a: any): Afspraak => ({
      ...a,
      voornaam: a.klanten?.voornaam,
      achternaam: a.klanten?.achternaam,
      type: a.consulttypes?.type,
      type_prijs: a.consulttypes?.prijs
    }));

    const result = rows.map(({ klanten, consulttypes, ...a }) => a);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
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

    let pdfKey: string | null = null;
    
    if (pdfFile && pdfFile.size > 0) {
      const bucket = 'afspraak-pdfs';
      const ext = '.pdf';
      const key = `pdfs/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const arrayBuffer = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(key, buffer, {
          contentType: 'application/pdf',
          upsert: false
        });
      
      if (!upErr) pdfKey = key;
    }

    const { data: typeRow, error: typeErr } = await supabase
      .from('consulttypes')
      .select('prijs')
      .eq('id', type_id)
      .single();

    if (typeErr) {
      return NextResponse.json(
        { error: typeErr.message },
        { status: 500 }
      );
    }

    const prijs = typeRow?.prijs ?? 0;
    const totaal = prijs * (Number(aantal) || 1);
    const d = new Date(datum);
    d.setDate(1);
    const maand = d.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('afspraken')
      .insert({
        datum,
        klant_id: Number(klant_id),
        type_id: Number(type_id),
        aantal: Number(aantal) || 1,
        prijs,
        totaal,
        terugbetaalbaar: Boolean(terugbetaalbaar),
        opmerking: opmerking || null,
        maand,
        pdf_bestand: pdfKey
      })
      .select('id, datum, klant_id, type_id, aantal, prijs, totaal, terugbetaalbaar, opmerking')
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
