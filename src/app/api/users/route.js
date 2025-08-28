import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { UserService } from '@/services/user.service';

// GET /api/users - Rechercher des utilisateurs
export const GET = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit')) || 20;
    
    const result = await UserService.searchUsers(query, userId, limit);
    
    return NextResponse.json({
      users: result.users,
      total: result.total
    });
  } catch (error) {
    console.error('❌ Erreur lors de la recherche d\'utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
});