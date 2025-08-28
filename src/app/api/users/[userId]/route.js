import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { UserService } from '@/services/user.service';

// GET /api/users/[userId] - Récupérer un utilisateur spécifique
export const GET = withAuth(async (request, { params }) => {
  try {
    const { userId } = params;
    
    const user = await UserService.getUserById(userId);
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
    
    if (error.message === 'Utilisateur non trouvé') {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
});