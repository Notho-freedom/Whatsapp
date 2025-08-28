const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialiser Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

// Cloud Function pour nettoyer les notifications expirées
exports.cleanupExpiredNotifications = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    console.log('Nettoyage des notifications expirées...');
    
    const batch = db.batch();
    const now = admin.firestore.Timestamp.now();
    
    try {
      const snapshot = await db
        .collection('notifications')
        .where('expiresAt', '<=', now)
        .limit(500)
        .get();
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`${snapshot.size} notifications expirées supprimées`);
      return null;
    } catch (error) {
      console.error('Erreur nettoyage notifications:', error);
      throw error;
    }
  });

// Cloud Function pour nettoyer les statuts expirés (24h)
exports.cleanupExpiredStatus = functions.pubsub
  .schedule('every hour')
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    console.log('Nettoyage des statuts expirés...');
    
    const batch = db.batch();
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    try {
      const snapshot = await db
        .collection('status')
        .where('createdAt', '<=', twentyFourHoursAgo)
        .limit(100)
        .get();
      
      // Supprimer aussi les fichiers associés
      const deletePromises = [];
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
        
        const statusData = doc.data();
        if (statusData.mediaUrl) {
          // Extraire le chemin du fichier de l'URL
          const path = `status/${statusData.userId}/${doc.id}/`;
          deletePromises.push(deleteStorageFolder(path));
        }
      });
      
      await Promise.all([
        batch.commit(),
        ...deletePromises
      ]);
      
      console.log(`${snapshot.size} statuts expirés supprimés`);
      return null;
    } catch (error) {
      console.error('Erreur nettoyage statuts:', error);
      throw error;
    }
  });

// Cloud Function pour gérer la suppression d'utilisateur
exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
  console.log('Suppression utilisateur:', user.uid);
  
  const batch = db.batch();
  
  try {
    // Supprimer le profil utilisateur
    batch.delete(db.collection('users').doc(user.uid));
    
    // Supprimer les conversations où l'utilisateur est le seul participant
    const conversationsSnapshot = await db
      .collection('conversations')
      .where('participantIds', 'array-contains', user.uid)
      .get();
    
    for (const doc of conversationsSnapshot.docs) {
      const conversation = doc.data();
      
      if (conversation.participantIds.length === 1) {
        // Conversation individuelle avec utilisateur supprimé
        batch.delete(doc.ref);
        
        // Supprimer les messages associés
        const messagesSnapshot = await db
          .collection('messages')
          .where('conversationId', '==', doc.id)
          .get();
        
        messagesSnapshot.forEach(msgDoc => {
          batch.delete(msgDoc.ref);
        });
      } else {
        // Retirer l'utilisateur de la conversation
        batch.update(doc.ref, {
          participantIds: admin.firestore.FieldValue.arrayRemove(user.uid),
          participants: conversation.participants.filter(p => p.uid !== user.uid)
        });
      }
    }
    
    // Supprimer les notifications
    const notificationsSnapshot = await db
      .collection('notifications')
      .where('userId', '==', user.uid)
      .get();
    
    notificationsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Supprimer les fichiers de l'utilisateur
    await deleteStorageFolder(`users/${user.uid}/`);
    
    await batch.commit();
    
    console.log('Suppression utilisateur terminée');
    return null;
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    throw error;
  }
});

// Cloud Function pour optimiser les images uploadées
exports.optimizeUploadedImage = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const contentType = object.contentType;
  
  // Vérifier que c'est une image et pas déjà une miniature
  if (!contentType.startsWith('image/') || filePath.includes('thumb_')) {
    return null;
  }
  
  console.log('Optimisation image:', filePath);
  
  // TODO: Implémenter l'optimisation avec sharp
  // - Créer une miniature
  // - Compresser l'image originale si nécessaire
  // - Mettre à jour les métadonnées
  
  return null;
});

// Cloud Function pour mettre à jour les compteurs en temps réel
exports.updateMessageCount = functions.firestore
  .document('messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const conversationId = message.conversationId;
    
    try {
      // Incrémenter le compteur de messages
      await db.collection('conversations').doc(conversationId).update({
        messageCount: admin.firestore.FieldValue.increment(1),
        lastMessage: {
          id: context.params.messageId,
          type: message.type,
          sender: message.sender,
          timestamp: message.timestamp,
          text: message.type === 'text' ? message.content.substring(0, 100) : getMessagePreview(message)
        },
        lastMessageTime: message.timestamp,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Incrémenter les compteurs non-lus pour les autres participants
      const conversationDoc = await db.collection('conversations').doc(conversationId).get();
      const conversation = conversationDoc.data();
      
      const batch = db.batch();
      const otherParticipants = conversation.participantIds.filter(id => id !== message.sender.uid);
      
      for (const participantId of otherParticipants) {
        const readRef = db.collection('conversations').doc(conversationId)
          .collection('reads').doc(participantId);
        
        batch.set(readRef, {
          unreadCount: admin.firestore.FieldValue.increment(1),
          lastMessageId: context.params.messageId
        }, { merge: true });
      }
      
      await batch.commit();
      
      return null;
    } catch (error) {
      console.error('Erreur mise à jour compteurs:', error);
      throw error;
    }
  });

// Cloud Function pour gérer les appels manqués
exports.handleMissedCall = functions.firestore
  .document('calls/{callId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Vérifier si l'appel est passé à "manqué"
    if (before.status !== 'missed' && after.status === 'missed') {
      console.log('Appel manqué détecté:', context.params.callId);
      
      try {
        // Créer une notification pour le destinataire
        const recipientId = after.participants.find(id => id !== after.initiator);
        
        if (recipientId) {
          const initiatorDoc = await db.collection('users').doc(after.initiator).get();
          const initiator = initiatorDoc.data();
          
          await db.collection('notifications').add({
            userId: recipientId,
            type: 'missed_call',
            category: 'calls',
            title: 'Appel manqué',
            body: `${initiator.displayName} a essayé de vous appeler`,
            data: {
              callId: context.params.callId,
              callType: after.type,
              initiatorId: after.initiator
            },
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            priority: 'high'
          });
        }
        
        return null;
      } catch (error) {
        console.error('Erreur création notification appel manqué:', error);
        throw error;
      }
    }
    
    return null;
  });

// Fonction helper pour supprimer un dossier dans Storage
async function deleteStorageFolder(path) {
  const bucket = storage.bucket();
  
  try {
    const [files] = await bucket.getFiles({ prefix: path });
    
    if (files.length === 0) {
      return;
    }
    
    const deletePromises = files.map(file => file.delete());
    await Promise.all(deletePromises);
    
    console.log(`${files.length} fichiers supprimés dans ${path}`);
  } catch (error) {
    console.error(`Erreur suppression dossier ${path}:`, error);
  }
}

// Fonction helper pour obtenir l'aperçu d'un message
function getMessagePreview(message) {
  switch (message.type) {
    case 'image':
      return '📷 Photo';
    case 'video':
      return '🎥 Vidéo';
    case 'audio':
      return '🎵 Message vocal';
    case 'document':
      return `📄 ${message.media?.fileName || 'Document'}`;
    case 'location':
      return '📍 Position';
    case 'system':
      return message.content;
    default:
      return 'Message';
  }
}

// Export des fonctions
module.exports = {
  cleanupExpiredNotifications,
  cleanupExpiredStatus,
  onUserDeleted,
  optimizeUploadedImage,
  updateMessageCount,
  handleMissedCall
};