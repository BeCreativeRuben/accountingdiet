import { NextRequest, NextResponse } from 'next/server';
import { SECRET_TOKEN } from './config';

export function authenticateToken(request: NextRequest): { authenticated: boolean; response?: NextResponse } {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token || token !== SECRET_TOKEN) {
    return {
      authenticated: false,
      response: NextResponse.json({ error: 'Invalid or missing token' }, { status: 401 })
    };
  }
  
  return { authenticated: true };
}
