const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialiser Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Cloud Function simple pour nettoyer les notifications expirées
exports.cleanupExpiredNotifications = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    console.log('Nettoyage des notifications expirées...');
    
    try {
      const batch = db.batch();
      const now = admin.firestore.Timestamp.now();
      
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

// Cloud Function simple pour nettoyer les statuts expirés
exports.cleanupExpiredStatus = functions.pubsub
  .schedule('every hour')
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    console.log('Nettoyage des statuts expirés...');
    
    try {
      const batch = db.batch();
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const snapshot = await db
        .collection('status')
        .where('createdAt', '<=', twentyFourHoursAgo)
        .limit(100)
        .get();
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      console.log(`${snapshot.size} statuts expirés supprimés`);
      return null;
    } catch (error) {
      console.error('Erreur nettoyage statuts:', error);
      throw error;
    }
  });

// Cloud Function simple pour mettre à jour les compteurs de messages
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
      
      console.log('Compteur de messages mis à jour');
      return null;
    } catch (error) {
      console.error('Erreur mise à jour compteurs:', error);
      throw error;
    }
  });

// Cloud Function simple pour gérer les appels manqués
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

// Les fonctions sont exportées individuellement avec exports.functionName