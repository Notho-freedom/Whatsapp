import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token } = await request.json();

    // Validation du token
    if (!token) {
      return NextResponse.json(
        { error: 'Token Google requis' },
        { status: 400 }
      );
    }

    // Simulation de la validation du token Google
    // En production, vous devriez valider le token avec l'API Google
    const mockGoogleUser = {
      id: 'google_123456789',
      email: 'user@gmail.com',
      name: 'Utilisateur Google',
      avatar: 'https://via.placeholder.com/150',
      phone: '+33123456789'
    };

    // Génération des tokens
    const accessToken = `google_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const refreshToken = `google_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 heure

    const responseData = {
      user: {
        id: mockGoogleUser.id,
        email: mockGoogleUser.email,
        name: mockGoogleUser.name,
        avatar: mockGoogleUser.avatar,
        phone: mockGoogleUser.phone,
        provider: 'google'
      },
      accessToken,
      refreshToken,
      expiresAt
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erreur lors de l\'authentification Google:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
