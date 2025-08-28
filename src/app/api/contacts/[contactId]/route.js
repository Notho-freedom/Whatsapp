import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { UserService } from '@/services/user.service';

// PUT /api/contacts/[contactId] - Mettre à jour un contact
export const PUT = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { contactId } = params;
    const updates = await request.json();
    
    await UserService.updateContact(userId, contactId, updates);
    
    return NextResponse.json({
      success: true,
      message: 'Contact mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du contact' },
      { status: 500 }
    );
  }
});

// DELETE /api/contacts/[contactId] - Supprimer un contact
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { contactId } = params;
    
    await UserService.removeContact(userId, contactId);
    
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
});

// PATCH /api/contacts/[contactId] - Actions sur un contact
export const PATCH = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { contactId } = params;
    const { action } = await request.json();
    
    switch (action) {
      case 'block':
        await UserService.toggleBlockUser(userId, contactId, true);
        break;
        
      case 'unblock':
        await UserService.toggleBlockUser(userId, contactId, false);
        break;
        
      case 'favorite':
        await UserService.updateContact(userId, contactId, { isFavorite: true });
        break;
        
      case 'unfavorite':
        await UserService.updateContact(userId, contactId, { isFavorite: false });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Action non supportée' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Action effectuée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'action sur le contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'action' },
      { status: 500 }
    );
  }
});