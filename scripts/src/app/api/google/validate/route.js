import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token d\'accès manquant' },
      { status: 400 }
    );
  }

  try {
    // Valider le token avec Google côté serveur
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Token invalide',
          details: data.error_description || 'Token expiré ou invalide'
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: data.sub,
        email: data.email,
        name: data.name,
        picture: data.picture
      }
    });
  } catch (error) {
    console.error('Erreur lors de la validation du token:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la validation du token',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
