import { NextResponse } from 'next/server';
import { auth } from '@/utils/firebaseConfig';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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

    // Authentification via Firebase
    await signInWithEmailAndPassword(auth || getAuth(), email, password);
    const current = (auth || getAuth()).currentUser;
    const token = await current.getIdToken();
    return NextResponse.json({ success: true, token, user: { id: current.uid, email: current.email } });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    
    // Gérer les erreurs spécifiques
    if (error.message === 'Email ou mot de passe incorrect') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
