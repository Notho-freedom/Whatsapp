import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Récupération du token depuis les headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'accès requis' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);

    // Simulation de la validation du token
    // En production, vous devriez valider le token avec votre système d'authentification
    if (!accessToken.startsWith('access_') && !accessToken.startsWith('google_access_')) {
      return NextResponse.json(
        { error: 'Token d\'accès invalide' },
        { status: 401 }
      );
    }

    // Simulation d'un utilisateur basé sur le token
    const mockUser = {
      id: accessToken.startsWith('google_access_') ? 'google_123456789' : 1,
      email: accessToken.startsWith('google_access_') ? 'user@gmail.com' : 'demo@example.com',
      name: accessToken.startsWith('google_access_') ? 'Utilisateur Google' : 'Utilisateur Demo',
      avatar: accessToken.startsWith('google_access_') ? 'https://via.placeholder.com/150' : '/api/avatar/1',
      phone: '+33123456789',
      provider: accessToken.startsWith('google_access_') ? 'google' : 'local'
    };

    const responseData = {
      user: mockUser,
      valid: true
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
