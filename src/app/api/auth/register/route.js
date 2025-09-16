import { NextResponse } from 'next/server';
import { auth } from '@/utils/firebaseConfig';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export async function POST(request) {
  try {
    const {
      username,
      email,
      password,
      phone_number,
      first_name,
      last_name,
      profile_picture_url,
      status_message
    } = await request.json();

    // Validation des données
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur, email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    await createUserWithEmailAndPassword(auth || getAuth(), email, password);
    const current = (auth || getAuth()).currentUser;
    return NextResponse.json({ success: true, user: { id: current.uid, email: current.email, username } }, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    
    // Gérer les erreurs spécifiques
    if (error.message && error.message.includes('existe déjà')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
