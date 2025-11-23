import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();

    // Validation du refresh token
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token requis' },
        { status: 400 }
      );
    }

    // Simulation de la validation du refresh token
    // En production, vous devriez valider le token dans votre base de données
    if (!refreshToken.startsWith('refresh_') && !refreshToken.startsWith('google_refresh_')) {
      return NextResponse.json(
        { error: 'Refresh token invalide' },
        { status: 401 }
      );
    }

    // Génération d'un nouveau access token
    const newAccessToken = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newExpiresAt = Date.now() + (60 * 60 * 1000); // 1 heure

    const responseData = {
      accessToken: newAccessToken,
      expiresAt: newExpiresAt
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
