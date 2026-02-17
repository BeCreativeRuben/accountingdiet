import { NextRequest, NextResponse } from 'next/server';
import { SECRET_TOKEN } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (token === SECRET_TOKEN) {
      return NextResponse.json({
        valid: true,
        token: SECRET_TOKEN,
        user: { displayName: 'Gebruiker' }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
