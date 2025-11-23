import { NextResponse } from 'next/server';
import firebaseStorageService from '@/utils/firebaseStorageService';

// POST /api/media/upload - Uploader un fichier média
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const conversationId = formData.get('conversationId');
    const messageId = formData.get('messageId') || null;

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

    // Valider le fichier
    const validation = firebaseStorageService.validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Fichier invalide', details: validation.errors },
        { status: 400 }
      );
    }

    // Déterminer le type de média
    const mediaType = firebaseStorageService.getMediaType(file);

    // Uploader le fichier
    const uploadResult = await firebaseStorageService.uploadMedia(
      file, 
      conversationId, 
      messageId, 
      mediaType
    );

    return NextResponse.json({
      success: true,
      media: {
        type: mediaType,
        url: uploadResult.url,
        path: uploadResult.path,
        fileName: uploadResult.fileName,
        size: uploadResult.size,
        contentType: uploadResult.contentType,
        timeCreated: uploadResult.timeCreated
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload du média:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    );
  }
}
