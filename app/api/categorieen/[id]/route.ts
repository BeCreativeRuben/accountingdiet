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
    const { categorie } = body;

    const updated = await store.updateCategorie(Number(id), { categorie });
    if (!updated) {
      return NextResponse.json({ error: 'Categorie not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Categorie updated successfully' });
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
    const ok = await store.deleteCategorie(Number(id));
    if (!ok) {
      return NextResponse.json({ error: 'Categorie not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Categorie deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
