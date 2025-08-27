import { NextResponse } from 'next/server';
const authService = require('@/utils/authDatabaseService');

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

    // Créer l'utilisateur
    const user = await authService.createUser({
      username,
      email,
      password,
      phone_number,
      first_name,
      last_name,
      profile_picture_url,
      status_message
    });

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

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    
    // Gérer les erreurs spécifiques
    if (error.message.includes('existe déjà')) {
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
