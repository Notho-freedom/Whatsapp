import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

export async function POST(request) {
  try {
    const { idToken, user } = await request.json();

    // Validation du token
    if (!idToken || !user) {
      return NextResponse.json(
        { error: 'Token Google et informations utilisateur requis' },
        { status: 400 }
      );
    }

    // Gérer l'authentification Google
    const result = await AuthService.handleGoogleAuth({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL
    });

    return NextResponse.json({
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified
      },
      customToken: result.customToken,
      isNewUser: result.isNewUser
    });
  } catch (error) {
    console.error('Erreur lors de l\'authentification Google:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}