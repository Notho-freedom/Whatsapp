import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7);
    
    // Vérifier le token et obtenir l'utilisateur
    const decodedToken = await AuthService.verifyToken(idToken);
    
    // Mettre à jour le statut de l'utilisateur
    await AuthService.logoutUser(decodedToken.uid);

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}