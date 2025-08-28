import { NextResponse } from 'next/server';
import firebaseServerService from '@/utils/firebaseServerService';

// GET /api/users - Récupérer tous les utilisateurs (avec pagination)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const startAfter = searchParams.get('startAfter');
    const search = searchParams.get('search');
    
    let users;
    
    if (search) {
      users = await firebaseServerService.searchUsers(search, limit);
    } else {
      users = await firebaseServerService.getAllUsers(limit, startAfter);
    }
    
    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        limit,
        hasMore: users.length === limit,
        nextCursor: users.length === limit ? users[users.length - 1]?.id : null
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

// POST /api/users - Créer un nouvel utilisateur
export async function POST(request) {
  try {
    const userData = await request.json();
    
    // Validation des données requises
    if (!userData.email || !userData.name) {
      return NextResponse.json(
        { error: 'Email et nom requis' },
        { status: 400 }
      );
    }
    
    // Créer l'utilisateur
    const newUser = await firebaseServerService.createUser(userData);
    
    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'Utilisateur créé avec succès'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}
