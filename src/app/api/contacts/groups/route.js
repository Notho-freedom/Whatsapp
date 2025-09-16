import { NextResponse } from 'next/server';
import contactService from '@/utils/contactDatabaseService';
import { getAuth } from 'firebase-admin/auth';

// GET /api/contacts/groups - Récupérer tous les groupes de contacts
export async function GET(request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await authService.verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer les groupes
    const groups = await contactService.getContactGroupsByUserId(user.userId);

    return NextResponse.json({
      success: true,
      data: groups
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des groupes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des groupes' },
      { status: 500 }
    );
  }
}

// POST /api/contacts/groups - Créer un nouveau groupe
export async function POST(request) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const user = await authService.verifyJWT(token);
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer les données du groupe
    const groupData = await request.json();
    
    // Validation des données requises
    if (!groupData.name) {
      return NextResponse.json(
        { error: 'Le nom du groupe est requis' },
        { status: 400 }
      );
    }

    // Ajouter l'ID de l'utilisateur
    groupData.user_id = user.userId;

    // Créer le groupe
    const newGroup = await contactService.createContactGroup(groupData);

    return NextResponse.json({
      success: true,
      data: newGroup,
      message: 'Groupe créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur lors de la création du groupe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du groupe' },
      { status: 500 }
    );
  }
}
