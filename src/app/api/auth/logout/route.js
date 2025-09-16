import { NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';

export async function POST(request) {
  try {
    await getAuth().signOut();
    return NextResponse.json({ success: true, message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
