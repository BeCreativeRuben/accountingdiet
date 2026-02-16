import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;
    const body = await request.json();
    const { voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering } = body;

    const updates: any = {
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

    const { error } = await supabase
      .from('klanten')
      .update(updates)
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
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
  { params }: { params: { id: string } }
) {
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
    const { id } = params;
    const { error } = await supabase
      .from('klanten')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Klant deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
