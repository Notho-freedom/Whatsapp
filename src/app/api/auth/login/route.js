import { NextResponse } from 'next/server';
import { auth } from '@/config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation des données
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (!auth) {
      return NextResponse.json({ error: 'Firebase non initialisé' }, { status: 500 });
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const token = await cred.user.getIdToken(true);
    const user = cred.user;
    return NextResponse.json({
      user: {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      },
      accessToken: token
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    
    return NextResponse.json({ error: error?.message || 'Erreur interne du serveur' }, { status: 400 });
  }
}
