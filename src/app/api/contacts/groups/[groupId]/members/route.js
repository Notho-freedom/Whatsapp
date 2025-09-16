import { NextResponse } from 'next/server';
import contactService from '@/utils/contactDatabaseService';
import { getAuth } from 'firebase-admin/auth';

// GET /api/contacts/groups/[groupId]/members - Récupérer les membres d'un groupe
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

    const { groupId } = params;

    // Vérifier que le groupe existe et appartient à l'utilisateur
    const group = await contactService.getContactGroupById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Groupe non trouvé' }, { status: 404 });
    }

    if (group.user_id !== user.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer les membres du groupe
    const members = await contactService.getGroupMembers(groupId);

    return NextResponse.json({
      success: true,
      data: members
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des membres:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des membres' },
      { status: 500 }
    );
  }
}

// POST /api/contacts/groups/[groupId]/members - Ajouter un contact au groupe
export async function POST(request, { params }) {
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

    const { groupId } = params;
    const { contactId } = await request.json();

    if (!contactId) {
      return NextResponse.json({ error: 'ID du contact requis' }, { status: 400 });
    }

    // Vérifier que le groupe existe et appartient à l'utilisateur
    const group = await contactService.getContactGroupById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Groupe non trouvé' }, { status: 404 });
    }

    if (group.user_id !== user.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Vérifier que le contact existe et appartient à l'utilisateur
    const contact = await contactService.getContactById(contactId);
    if (!contact) {
      return NextResponse.json({ error: 'Contact non trouvé' }, { status: 404 });
    }

    if (contact.user_id !== user.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Ajouter le contact au groupe
    const result = await contactService.addContactToGroup(contactId, groupId);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Contact ajouté au groupe avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du contact au groupe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du contact au groupe' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/groups/[groupId]/members - Retirer un contact du groupe
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

    const { groupId } = params;
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');

    if (!contactId) {
      return NextResponse.json({ error: 'ID du contact requis' }, { status: 400 });
    }

    // Vérifier que le groupe existe et appartient à l'utilisateur
    const group = await contactService.getContactGroupById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Groupe non trouvé' }, { status: 404 });
    }

    if (group.user_id !== user.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Vérifier que le contact existe et appartient à l'utilisateur
    const contact = await contactService.getContactById(contactId);
    if (!contact) {
      return NextResponse.json({ error: 'Contact non trouvé' }, { status: 404 });
    }

    if (contact.user_id !== user.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Retirer le contact du groupe
    await contactService.removeContactFromGroup(contactId, groupId);

    return NextResponse.json({
      success: true,
      message: 'Contact retiré du groupe avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors du retrait du contact du groupe:', error);
    return NextResponse.json(
      { error: 'Erreur lors du retrait du contact du groupe' },
      { status: 500 }
    );
  }
}
