import { NextResponse } from 'next/server';
import authService from '@/utils/authDatabaseService';

export async function POST(request) {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Token de session requis' },
        { status: 400 }
      );
    }

    // Invalider la session
    const success = await authService.invalidateSession(sessionToken);

    if (!success) {
      return NextResponse.json(
        { error: 'Session non trouvée ou déjà invalidée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
