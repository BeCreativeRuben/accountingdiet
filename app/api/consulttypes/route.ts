import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import * as store from '@/lib/store';

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const data = store.getConsulttypes().sort((a, b) => a.type.localeCompare(b.type));
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  try {
    const body = await request.json();
    const { type, prijs } = body;

    const row = store.insertConsulttype({
      type,
      prijs: prijs != null ? Number(prijs) : null
    });
    return NextResponse.json(row);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
