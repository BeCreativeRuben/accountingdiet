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
    const { type, prijs } = body;

    const updated = await store.updateConsulttype(Number(id), {
      type,
      prijs: prijs != null ? Number(prijs) : null
    });
    if (!updated) {
      return NextResponse.json({ error: 'Consulttype not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Consulttype updated successfully' });
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
    const ok = await store.deleteConsulttype(Number(id));
    if (!ok) {
      return NextResponse.json({ error: 'Consulttype not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Consulttype deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
