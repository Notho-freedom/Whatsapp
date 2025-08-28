import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

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

    // Créer l'utilisateur avec Firebase Auth
    const result = await AuthService.createUser(email, password, email.split('@')[0]);
    
    return NextResponse.json({
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        phoneNumber: result.user.phoneNumber
      },
      customToken: result.customToken,
      isNewUser: result.isNewUser
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    
    if (error.message.includes('déjà utilisé')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}