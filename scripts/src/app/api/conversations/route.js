import { NextResponse } from 'next/server';
import firebaseServerService from '@/utils/firebaseServerService';

// GET /api/conversations - Récupérer les conversations de l'utilisateur
export async function GET(request) {
  try {
    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const isTemporary = searchParams.get('is_temporary') === 'true';
    
    // Pour les conversations temporaires, pas besoin d'authentification
    if (isTemporary) {
      const conversations = await firebaseServerService.getTempConversations();
      return NextResponse.json({
        conversations,
        count: conversations.length
      });
    }

    // Pour les conversations normales, vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Pour l'instant, on utilise un utilisateur par défaut
    // TODO: Implémenter la vérification Firebase Auth
    const user = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : { id: 1, name: 'Utilisateur par défaut' };

    // Récupérer les paramètres de requête pour les conversations normales
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type');
    const isGroup = searchParams.get('isGroup');
    const isPinned = searchParams.get('isPinned');
    const isArchived = searchParams.get('isArchived');

    // Construire les filtres
    const filters = {};
    if (type) filters.type = type;
    if (isGroup !== null) filters.isGroup = isGroup === 'true';
    if (isPinned !== null) filters.isPinned = isPinned === 'true';
    if (isArchived !== null) filters.isArchived = isArchived === 'true';
    if (limit) filters.limit = limit;
    if (offset) filters.offset = offset;

          // Récupérer les conversations
                    let conversations;
              if (query) {
                conversations = await firebaseServerService.searchConversations(user.id, query, filters);
              } else {
                conversations = await firebaseServerService.getConversationsByUserId(user.id, limit, offset);
              }
        
              // Récupérer les statistiques
              const stats = await firebaseServerService.getConversationStats(user.id);

    return NextResponse.json({
      conversations,
      stats,
      pagination: {
        limit,
        offset,
        total: conversations.length,
        hasMore: conversations.length === limit
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des conversations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations - Nettoyer les anciennes conversations temporaires
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isTemporary = searchParams.get('is_temporary') === 'true';
    
    if (isTemporary) {
      // DÉSACTIVÉ: Ne plus supprimer automatiquement les conversations
      console.log('⚠️ Suppression automatique des conversations temporaires désactivée');
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: 'Suppression automatique désactivée'
      });
    }

    return NextResponse.json(
      { error: 'Méthode DELETE non autorisée pour les conversations normales' },
      { status: 405 }
    );

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des conversations temporaires:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Créer une nouvelle conversation
export async function POST(request) {
  try {
    const body = await request.json();
    const { is_temporary = false } = body;

    // Pour les conversations temporaires, pas besoin d'authentification
    if (is_temporary) {
                  const conversation = await firebaseServerService.createTempConversation(body);
      return NextResponse.json({
        conversation,
        message: 'Conversation temporaire créée avec succès'
      }, { status: 201 });
    }

    // Pour les conversations normales, vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Pour l'instant, on utilise un utilisateur par défaut
    // TODO: Implémenter la vérification Firebase Auth
    const user = { id: 1, name: 'Utilisateur par défaut' };

    const {
      conversation_type = 'individual',
      title,
      description,
      is_group = false,
      group_photo_url,
      group_settings = {},
      participants = []
    } = body;

    // Validation des données
    if (!title && is_group) {
      return NextResponse.json(
        { error: 'Le titre est requis pour les conversations de groupe' },
        { status: 400 }
      );
    }

    if (is_group && participants.length < 2) {
      return NextResponse.json(
        { error: 'Une conversation de groupe doit avoir au moins 2 participants' },
        { status: 400 }
      );
    }

    // Créer la conversation
    const conversationData = {
      type: conversation_type,
      name: is_group ? title : null,
      description,
      created_by: user.id,
      avatar_url: group_photo_url,
      custom_settings: group_settings
    };

                const conversation = await firebaseServerService.createConversation(conversationData);
        
            // Ajouter le créateur comme participant
            await firebaseServerService.addParticipant(conversation.id, user.id, {
              role: is_group ? 'admin' : 'participant',
              is_admin: is_group
            });
        
            // Ajouter les autres participants
            for (const participantId of participants) {
              if (participantId !== user.id) {
                await firebaseServerService.addParticipant(conversation.id, participantId, {
                  role: 'participant'
                });
              }
            }
        
            // Récupérer la conversation avec les participants
            const participantsList = await firebaseServerService.getParticipants(conversation.id);

    return NextResponse.json({
      conversation: {
        ...conversation,
        participants: participantsList
      },
      message: 'Conversation créée avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur lors de la création de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
