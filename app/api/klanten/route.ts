import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Klant } from '@/types';

function mapMutualiteit(row: any) {
  if (!row) return row;
  return { ...row, maxSessiesPerJaar: row.max_sessies_per_jaar };
}

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
    const { data: klanten, error } = await supabase
      .from('klanten')
      .select('id, voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering')
      .order('achternaam')
      .order('voornaam');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const ids = (klanten || []).map((k: any) => k.mutualiteit_id).filter(Boolean);
    const mutualiteitIds = [...new Set(ids)];
    let names: Record<number, string> = {};
    
    if (mutualiteitIds.length) {
      const { data: mut } = await supabase
        .from('mutualiteiten')
        .select('id, naam')
        .in('id', mutualiteitIds);
      (mut || []).forEach((m: any) => {
        names[m.id] = m.naam;
      });
    }

    const result = (klanten || []).map((k: any): Klant => ({
      ...k,
      mutualiteit_naam: k.mutualiteit_id ? names[k.mutualiteit_id] : null,
      solidaris_uitzondering: k.solidaris_uitzondering || false
    }));

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
    const body = await request.json();
    const { voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering } = body;

    const { data, error } = await supabase
      .from('klanten')
      .insert({
        voornaam,
        achternaam,
        email: email || null,
        telefoon: telefoon || null,
        startdatum: startdatum || null,
        mutualiteit_id: mutualiteit_id ? Number(mutualiteit_id) : null,
        solidaris_uitzondering: solidaris_uitzondering === true || solidaris_uitzondering === 'true'
      })
      .select('id, voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering')
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
