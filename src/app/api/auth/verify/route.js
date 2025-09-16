import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request) {
  try {
    const { accessToken } = await request.json();
    if (!accessToken) return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    const decoded = await getAuth().verifyIdToken(accessToken);
    return NextResponse.json({ authenticated: true, user: { id: decoded.uid, email: decoded.email } });
  } catch (error) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }
}
