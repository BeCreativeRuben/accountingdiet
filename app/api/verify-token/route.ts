import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  return NextResponse.json({
    valid: true,
    user: {
      displayName: 'Gebruiker'
    }
  });
}
