import { NextResponse } from 'next/server';
const authService = require('@/utils/authDatabaseService');

export async function POST(request) {
  try {
    const { accessToken, sessionToken } = await request.json();

    let user = null;

    // Vérifier d'abord le JWT
    if (accessToken) {
      try {
        const decoded = await authService.verifyJWT(accessToken);
        user = await authService.getUserById(decoded.userId);
      } catch (jwtError) {
        console.log('JWT invalide, tentative avec session token');
      }
    }

    // Si pas d'utilisateur via JWT, essayer avec le session token
    if (!user && sessionToken) {
      user = await authService.validateSession(sessionToken);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Token d\'authentification invalide' },
        { status: 401 }
      );
    }

    return NextResponse.json({
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
      authenticated: true
    });
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
