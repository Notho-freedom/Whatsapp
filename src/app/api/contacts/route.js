import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { UserService } from '@/services/user.service';

// GET /api/contacts - Récupérer les contacts de l'utilisateur
export const GET = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit')) || 50;
    const lastDoc = searchParams.get('lastDoc') || null;
    
    const result = await UserService.getUserContacts(userId, limit, lastDoc);
    
    return NextResponse.json({
      contacts: result.contacts,
      hasMore: result.hasMore,
      lastDoc: result.lastDoc?.id || null
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des contacts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des contacts' },
      { status: 500 }
    );
  }
});

// POST /api/contacts - Ajouter un contact
export const POST = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    const { contactId, metadata } = await request.json();
    
    if (!contactId) {
      return NextResponse.json(
        { error: 'ID du contact requis' },
        { status: 400 }
      );
    }
    
    const result = await UserService.addContact(userId, contactId, metadata);
    
    return NextResponse.json({
      success: true,
      contact: result.contact,
      message: 'Contact ajouté avec succès'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du contact:', error);
    
    if (error.message.includes('non trouvé')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    if (error.message.includes('soi-même')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du contact' },
      { status: 500 }
    );
  }
});