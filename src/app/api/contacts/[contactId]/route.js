import { NextResponse } from 'next/server';
import contactService from '@/utils/contactDatabaseService';
import authService from '@/utils/authDatabaseService';

// GET /api/contacts/[contactId] - Récupérer un contact spécifique
export async function GET(request, { params }) {
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

    const { contactId } = await params;

    // Récupérer le contact
    const contact = await contactService.getContactById(contactId);
    if (!contact) {
      return NextResponse.json({ error: 'Contact non trouvé' }, { status: 404 });
    }

    // Vérifier que le contact appartient à l'utilisateur
    if (contact.user_id !== user.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer les groupes du contact
    const groups = await contactService.getContactGroups(contactId);

    return NextResponse.json({
      success: true,
      data: {
        contact,
        groups
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du contact' },
      { status: 500 }
    );
  }
}

// PUT /api/contacts/[contactId] - Mettre à jour un contact
export async function PUT(request, { params }) {
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

    const { contactId } = await params;
    const updateData = await request.json();

    // Vérifier que le contact existe et appartient à l'utilisateur
    const existingContact = await contactService.getContactById(contactId);
    if (!existingContact) {
      return NextResponse.json({ error: 'Contact non trouvé' }, { status: 404 });
    }

    if (existingContact.user_id !== user.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Mettre à jour le contact
    const updatedContact = await contactService.updateContact(contactId, updateData);

    return NextResponse.json({
      success: true,
      data: updatedContact,
      message: 'Contact mis à jour avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du contact' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/[contactId] - Supprimer un contact
export async function DELETE(request, { params }) {
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

    const { contactId } = params;

    // Vérifier que le contact existe et appartient à l'utilisateur
    const existingContact = await contactService.getContactById(contactId);
    if (!existingContact) {
      return NextResponse.json({ error: 'Contact non trouvé' }, { status: 404 });
    }

    if (existingContact.user_id !== user.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Supprimer le contact
    await contactService.deleteContact(contactId);

    return NextResponse.json({
      success: true,
      message: 'Contact supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression du contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du contact' },
      { status: 500 }
    );
  }
}
