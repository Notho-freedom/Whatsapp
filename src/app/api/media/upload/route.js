import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { MediaService } from '@/services/media.service';

// POST /api/media/upload - Uploader un fichier média
export const POST = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    const formData = await request.formData();
    
    const file = formData.get('file');
    const conversationId = formData.get('conversationId');
    const messageId = formData.get('messageId') || `temp_${Date.now()}`;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID de conversation requis' },
        { status: 400 }
      );
    }

    // Convertir le File en buffer pour le traitement
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileData = {
      buffer,
      originalname: file.name,
      mimetype: file.type,
      size: file.size
    };

    // Uploader le fichier
    const result = await MediaService.uploadMedia(
      fileData,
      userId,
      conversationId,
      messageId
    );

    return NextResponse.json({
      success: true,
      media: result
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload du média:', error);
    
    if (error.message.includes('supporté') || error.message.includes('volumineux')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    );
  }
});

// DELETE /api/media/upload - Supprimer un média
export const DELETE = withAuth(async (request) => {
  try {
    const { storagePath } = await request.json();

    if (!storagePath) {
      return NextResponse.json(
        { error: 'Chemin du fichier requis' },
        { status: 400 }
      );
    }

    await MediaService.deleteMedia(storagePath);

    return NextResponse.json({
      success: true,
      message: 'Média supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du média:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du fichier' },
      { status: 500 }
    );
  }
});