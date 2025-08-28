import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

/**
 * Middleware d'authentification pour les routes API
 */
export async function withAuth(handler) {
  return async (request, context) => {
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
      
      // Ajouter l'utilisateur à la requête
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
      
      // Continuer avec le handler
      return handler(request, context);
    } catch (error) {
      console.error('Erreur authentification:', error);
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
  };
}

/**
 * Helper pour extraire l'utilisateur de la requête
 */
export function getUserFromRequest(request) {
  return request.user;
}