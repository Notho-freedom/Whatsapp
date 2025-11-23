import { NextResponse } from 'next/server';
import contactService from '@/utils/contactDatabaseService';
import authService from '@/utils/authDatabaseService';

// GET /api/contacts - Récupérer tous les contacts de l'utilisateur
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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const search = searchParams.get('search') || '';
    const isFavorite = searchParams.get('isFavorite');
    const label = searchParams.get('label');
    const groupId = searchParams.get('groupId');

    // Construire les filtres
    const filters = {};
    if (search) filters.search = search;
    if (isFavorite !== null) filters.isFavorite = isFavorite === 'true';
    if (label) filters.label = label;
    if (groupId) filters.groupId = parseInt(groupId);

    // Récupérer les contacts
    const contacts = await contactService.getContactsByUserId(user.userId, limit, offset, filters);
    
    // Récupérer les statistiques
    const stats = await contactService.getContactStats(user.userId);

    return NextResponse.json({
      success: true,
      data: {
        contacts,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.total_contacts
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des contacts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des contacts' },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Créer un nouveau contact
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

    // Récupérer les données du contact
    const contactData = await request.json();
    
    // Validation des données requises
    if (!contactData.first_name || !contactData.last_name) {
      return NextResponse.json(
        { error: 'Le prénom et le nom sont requis' },
        { status: 400 }
      );
    }

    // Ajouter l'ID de l'utilisateur
    contactData.user_id = user.userId;

    // Créer le contact
    const newContact = await contactService.createContact(contactData);

    return NextResponse.json({
      success: true,
      data: newContact,
      message: 'Contact créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur lors de la création du contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du contact' },
      { status: 500 }
    );
  }
}
