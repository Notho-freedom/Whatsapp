import { NextResponse } from 'next/server';
import contactService from '@/utils/contactDatabaseService';
import authService from '@/utils/authDatabaseService';

// GET /api/contacts/groups/[groupId] - Récupérer un groupe spécifique avec ses membres
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

    // Récupérer le groupe
    const group = await contactService.getContactGroupById(groupId);
    if (!group) {
      return NextResponse.json({ error: 'Groupe non trouvé' }, { status: 404 });
    }

    // Vérifier que le groupe appartient à l'utilisateur
    if (group.user_id !== user.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer les membres du groupe
    const members = await contactService.getGroupMembers(groupId);

    return NextResponse.json({
      success: true,
      data: {
        group,
        members
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du groupe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du groupe' },
      { status: 500 }
    );
  }
}

// PUT /api/contacts/groups/[groupId] - Mettre à jour un groupe
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

    const { groupId } = params;
    const updateData = await request.json();

    // Vérifier que le groupe existe et appartient à l'utilisateur
    const existingGroup = await contactService.getContactGroupById(groupId);
    if (!existingGroup) {
      return NextResponse.json({ error: 'Groupe non trouvé' }, { status: 404 });
    }

    if (existingGroup.user_id !== user.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Empêcher la modification des groupes système
    if (existingGroup.is_system) {
      return NextResponse.json({ error: 'Impossible de modifier un groupe système' }, { status: 403 });
    }

    // Mettre à jour le groupe
    const updatedGroup = await contactService.updateContactGroup(groupId, updateData);

    return NextResponse.json({
      success: true,
      data: updatedGroup,
      message: 'Groupe mis à jour avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du groupe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du groupe' },
      { status: 500 }
    );
  }
}

// DELETE /api/contacts/groups/[groupId] - Supprimer un groupe
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

    // Vérifier que le groupe existe et appartient à l'utilisateur
    const existingGroup = await contactService.getContactGroupById(groupId);
    if (!existingGroup) {
      return NextResponse.json({ error: 'Groupe non trouvé' }, { status: 404 });
    }

    if (existingGroup.user_id !== user.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Empêcher la suppression des groupes système
    if (existingGroup.is_system) {
      return NextResponse.json({ error: 'Impossible de supprimer un groupe système' }, { status: 403 });
    }

    // Supprimer le groupe
    await contactService.deleteContactGroup(groupId);

    return NextResponse.json({
      success: true,
      message: 'Groupe supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression du groupe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du groupe' },
      { status: 500 }
    );
  }
}
