import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { MUTUALITEITEN } from '@/lib/mutualiteiten';

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }
  return NextResponse.json(MUTUALITEITEN);
}

// Mutualiteiten zijn vast in de app; geen aanmaken in DB.
export async function POST() {
  return NextResponse.json(
    { error: 'Mutualiteiten zijn vast in het systeem en kunnen niet worden toegevoegd.' },
    { status: 405 }
  );
}
