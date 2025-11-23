import { NextResponse } from 'next/server';
import firebaseServerService from '@/utils/firebaseServerService';

// GET /api/users/[userId] - Récupérer un utilisateur spécifique
export async function GET(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    const user = await firebaseServerService.getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[userId] - Mettre à jour un utilisateur
export async function PUT(request, { params }) {
  try {
    const { userId } = await params;
    const updateData = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que l'utilisateur existe
    const existingUser = await firebaseServerService.getUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Mettre à jour l'utilisateur
    const success = await firebaseServerService.updateUser(userId, updateData);
    
    if (success) {
      // Récupérer l'utilisateur mis à jour
      const updatedUser = await firebaseServerService.getUserById(userId);
      
      return NextResponse.json({
        success: true,
        data: updatedUser,
        message: 'Utilisateur mis à jour avec succès'
      });
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[userId] - Supprimer un utilisateur
export async function DELETE(request, { params }) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que l'utilisateur existe
    const existingUser = await firebaseServerService.getUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Supprimer l'utilisateur
    const success = await firebaseServerService.deleteUser(userId);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Utilisateur supprimé avec succès'
      });
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}
