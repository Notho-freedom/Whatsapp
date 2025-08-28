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
    
    // Vérifier le token avec Firebase
    const decodedToken = await AuthService.verifyToken(idToken);
    
    // Récupérer les informations complètes de l'utilisateur
    const user = await AuthService.getUser(decodedToken.uid);

    return NextResponse.json({
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      },
      authenticated: true
    });
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
    return NextResponse.json(
      { error: 'Token invalide ou expiré' },
      { status: 401 }
    );
  }
}