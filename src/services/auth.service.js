import { adminAuth, adminDb, createCustomToken, verifyIdToken } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export class AuthService {
  /**
   * Vérifier et décoder un token ID Firebase
   */
  static async verifyToken(idToken) {
    try {
      if (!idToken) {
        throw new Error('Token manquant');
      }
      
      const decodedToken = await verifyIdToken(idToken);
      
      // Mettre à jour la dernière connexion
      await adminDb.collection('users').doc(decodedToken.uid).update({
        lastSeen: FieldValue.serverTimestamp(),
        isOnline: true
      });
      
      return decodedToken;
    } catch (error) {
      console.error('Erreur vérification token:', error);
      throw new Error('Token invalide');
    }
  }

  /**
   * Créer ou mettre à jour un utilisateur après authentification Google
   */
  static async handleGoogleAuth(googleUser) {
    try {
      const { uid, email, displayName, photoURL } = googleUser;
      
      // Créer/mettre à jour dans Firebase Auth
      let userRecord;
      try {
        userRecord = await adminAuth.getUser(uid);
        // Mettre à jour si nécessaire
        userRecord = await adminAuth.updateUser(uid, {
          email,
          displayName,
          photoURL
        });
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          userRecord = await adminAuth.createUser({
            uid,
            email,
            displayName,
            photoURL
          });
        } else {
          throw error;
        }
      }
      
      // Créer/mettre à jour le profil dans Firestore
      const userDoc = adminDb.collection('users').doc(uid);
      const userSnapshot = await userDoc.get();
      
      if (!userSnapshot.exists) {
        // Nouveau utilisateur
        await userDoc.set({
          uid,
          email,
          displayName,
          photoURL,
          phoneNumber: null,
          bio: '',
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          lastSeen: FieldValue.serverTimestamp(),
          isOnline: true,
          settings: {
            theme: 'light',
            language: 'fr',
            notifications: {
              enabled: true,
              sound: true,
              showPreview: true
            }
          },
          stats: {
            messagesSent: 0,
            conversationsStarted: 0,
            mediaShared: 0
          }
        });
      } else {
        // Utilisateur existant - mise à jour
        await userDoc.update({
          email,
          displayName,
          photoURL,
          updatedAt: FieldValue.serverTimestamp(),
          lastSeen: FieldValue.serverTimestamp(),
          isOnline: true
        });
      }
      
      // Créer un token personnalisé avec des claims
      const customToken = await createCustomToken(uid, {
        email,
        displayName,
        provider: 'google'
      });
      
      return {
        user: userRecord,
        customToken,
        isNewUser: !userSnapshot.exists
      };
    } catch (error) {
      console.error('Erreur gestion auth Google:', error);
      throw error;
    }
  }

  /**
   * Créer un utilisateur avec email/password
   */
  static async createUser(email, password, displayName) {
    try {
      // Créer dans Firebase Auth
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName
      });
      
      // Créer le profil dans Firestore
      await adminDb.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email,
        displayName,
        photoURL: null,
        phoneNumber: null,
        bio: '',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastSeen: FieldValue.serverTimestamp(),
        isOnline: true,
        settings: {
          theme: 'light',
          language: 'fr',
          notifications: {
            enabled: true,
            sound: true,
            showPreview: true
          }
        },
        stats: {
          messagesSent: 0,
          conversationsStarted: 0,
          mediaShared: 0
        }
      });
      
      // Créer un token personnalisé
      const customToken = await createCustomToken(userRecord.uid, {
        email,
        displayName,
        provider: 'password'
      });
      
      return {
        user: userRecord,
        customToken,
        isNewUser: true
      };
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      if (error.code === 'auth/email-already-exists') {
        throw new Error('Cet email est déjà utilisé');
      }
      if (error.code === 'auth/invalid-password') {
        throw new Error('Mot de passe invalide (min 6 caractères)');
      }
      throw error;
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  static async updateUserProfile(uid, updates) {
    try {
      const allowedUpdates = ['displayName', 'photoURL', 'phoneNumber', 'bio'];
      const profileUpdates = {};
      const authUpdates = {};
      
      // Séparer les mises à jour Auth et Firestore
      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          profileUpdates[key] = value;
          if (['displayName', 'photoURL', 'phoneNumber'].includes(key)) {
            authUpdates[key] = value;
          }
        }
      }
      
      // Mettre à jour dans Firebase Auth
      if (Object.keys(authUpdates).length > 0) {
        await adminAuth.updateUser(uid, authUpdates);
      }
      
      // Mettre à jour dans Firestore
      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updatedAt = FieldValue.serverTimestamp();
        await adminDb.collection('users').doc(uid).update(profileUpdates);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  }

  /**
   * Déconnecter un utilisateur (mise à jour du statut)
   */
  static async logoutUser(uid) {
    try {
      await adminDb.collection('users').doc(uid).update({
        isOnline: false,
        lastSeen: FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur déconnexion utilisateur:', error);
      throw error;
    }
  }

  /**
   * Supprimer un compte utilisateur
   */
  static async deleteUser(uid) {
    try {
      // Supprimer de Firebase Auth
      await adminAuth.deleteUser(uid);
      
      // Supprimer de Firestore (avec toutes les données associées)
      const batch = adminDb.batch();
      
      // Supprimer le profil utilisateur
      batch.delete(adminDb.collection('users').doc(uid));
      
      // Supprimer les conversations où l'utilisateur est participant
      const conversationsSnapshot = await adminDb
        .collection('conversations')
        .where('participants', 'array-contains', uid)
        .get();
      
      conversationsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Exécuter la suppression
      await batch.commit();
      
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      throw error;
    }
  }

  /**
   * Obtenir les informations d'un utilisateur
   */
  static async getUser(uid) {
    try {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        throw new Error('Utilisateur non trouvé');
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      throw error;
    }
  }
}