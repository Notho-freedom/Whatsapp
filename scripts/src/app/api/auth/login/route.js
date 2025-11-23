import { NextResponse } from 'next/server';
import authService from '@/utils/authDatabaseService';

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

    // Authentification avec SQLite
    const user = await authService.authenticateUser(email, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Créer une session
    const session = await authService.createSession(user.id, {
      device: 'web',
      browser: 'unknown',
      os: 'unknown'
    });

    // Générer un JWT
    const jwtToken = await authService.generateJWT(user);

    // Retourner les données d'authentification
    const responseData = {
              user: {
          id: user.id,
          email: user.email,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone,
          profile_picture_url: user.profile_photo_url,
          status_message: user.status_message,
          is_online: user.is_online,
          last_seen: user.last_seen
        },
      session: {
        sessionId: session.sessionId,
        sessionToken: session.sessionToken,
        expiresAt: session.expiresAt
      },
      accessToken: jwtToken,
      expiresAt: session.expiresAt
    };

    return NextResponse.json(responseData);
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
