import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { createUserInterface } from '@/types';

class UserService {
  constructor() {
    this.collectionName = 'users';
  }

  // Créer un nouvel utilisateur
  async createUser(userData) {
    try {
      // Utiliser l'interface pour valider les données
      const userTemplate = createUserInterface();
      const newUser = {
        ...userTemplate,
        ...userData,
        id: userData.id || userData.googleId || `user_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        loginCount: 1
      };

      const userRef = doc(db, this.collectionName, newUser.id);
      await setDoc(userRef, newUser);
      
      console.log('✅ Utilisateur créé avec succès:', newUser.id);
      return newUser;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Créer ou mettre à jour un utilisateur Google
  async createOrUpdateGoogleUser(googleUserData) {
    try {
      const { sub: googleId, email, name, picture } = googleUserData;
      
      // Vérifier si l'utilisateur existe déjà
      let existingUser = await this.getUserByGoogleId(googleId);
      
      if (existingUser) {
        // Mettre à jour l'utilisateur existant
        const updates = {
          name: name || existingUser.name,
          email: email || existingUser.email,
          avatar: picture || existingUser.avatar,
          avatarUrl: picture || existingUser.avatarUrl,
          lastLoginAt: new Date(),
          loginCount: (existingUser.loginCount || 0) + 1,
          isOnline: true,
          lastSeen: null,
          lastSeenTimestamp: null,
          updatedAt: new Date()
        };
        
        await this.updateUser(existingUser.id, updates);
        console.log('✅ Utilisateur Google mis à jour:', existingUser.id);
        return { ...existingUser, ...updates };
      } else {
        // Créer un nouvel utilisateur
        const newUserData = {
          googleId,
          email,
          name,
          firstName: name ? name.split(' ')[0] : '',
          lastName: name ? name.split(' ').slice(1).join(' ') : '',
          displayName: name,
          username: email ? email.split('@')[0] : `user_${Date.now()}`,
          avatar: picture,
          avatarUrl: picture,
          avatarThumbnail: picture,
          status: 'Disponible',
          statusMessage: 'Salut ! Je suis sur WhatsApp.',
          isOnline: true,
          lastSeen: null,
          lastSeenTimestamp: null,
          bio: '',
          location: '',
          website: '',
          birthday: null,
          gender: '',
          isVerified: false,
          isPremium: false,
          twoFactorEnabled: false,
          backupEnabled: false,
          contacts: [],
          blockedUsers: [],
          favoriteContacts: [],
          pushTokens: [],
          syncPreferences: {
            contacts: true,
            messages: true,
            media: true,
            settings: true
          }
        };
        
        const newUser = await this.createUser(newUserData);
        console.log('✅ Nouvel utilisateur Google créé:', newUser.id);
        return newUser;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création/mise à jour de l\'utilisateur Google:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par ID
  async getUserById(userId) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par Google ID
  async getUserByGoogleId(googleId) {
    try {
      const usersRef = collection(db, this.collectionName);
      const q = query(usersRef, where('googleId', '==', googleId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche par Google ID:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par email
  async getUserByEmail(email) {
    try {
      const usersRef = collection(db, this.collectionName);
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche par email:', error);
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  async updateUser(userId, updates) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(userRef, updateData);
      console.log('✅ Utilisateur mis à jour avec succès:', userId);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour le statut de présence
  async updateUserPresence(userId, isOnline = false) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      const updateData = {
        isOnline,
        lastSeen: isOnline ? null : new Date(),
        lastSeenTimestamp: isOnline ? null : Date.now(),
        updatedAt: new Date()
      };
      
      await updateDoc(userRef, updateData);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  // Mettre à jour les informations de connexion
  async updateUserLoginInfo(userId) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        const updateData = {
          lastLoginAt: new Date(),
          loginCount: (currentData.loginCount || 0) + 1,
          isOnline: true,
          lastSeen: null,
          lastSeenTimestamp: null,
          updatedAt: new Date()
        };
        
        await updateDoc(userRef, updateData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des infos de connexion:', error);
      throw error;
    }
  }

  // Supprimer un utilisateur
  async deleteUser(userId) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      await deleteDoc(userRef);
      console.log('✅ Utilisateur supprimé avec succès:', userId);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  // Rechercher des utilisateurs
  async searchUsers(query, limitCount = 20) {
    try {
      const usersRef = collection(db, this.collectionName);
      const q = query(
        usersRef,
        where('displayName', '>=', query),
        where('displayName', '<=', query + '\uf8ff'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche d\'utilisateurs:', error);
      throw error;
    }
  }

  // Récupérer plusieurs utilisateurs par IDs
  async getUsersByIds(userIds) {
    try {
      if (!userIds || userIds.length === 0) return [];
      
      const users = [];
      const batchSize = 10; // Firestore limite les requêtes "in" à 10 éléments
      
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const usersRef = collection(db, this.collectionName);
        const q = query(usersRef, where('__name__', 'in', batch));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
      }
      
      return users;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs par IDs:', error);
      throw error;
    }
  }

  // Récupérer tous les utilisateurs (avec pagination)
  async getAllUsers(limitCount = 50, startAfterDoc = null) {
    try {
      const usersRef = collection(db, this.collectionName);
      let q = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  // Mettre à jour le profil utilisateur
  async updateUserProfile(userId, profileUpdates) {
    try {
      const allowedFields = [
        'firstName', 'lastName', 'displayName', 'username', 'bio', 
        'location', 'website', 'birthday', 'gender', 'status', 'statusMessage'
      ];
      
      const filteredUpdates = {};
      Object.keys(profileUpdates).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = profileUpdates[key];
        }
      });
      
      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('Aucun champ valide à mettre à jour');
      }
      
      return await this.updateUser(userId, filteredUpdates);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  // Mettre à jour les paramètres utilisateur
  async updateUserSettings(userId, settingsUpdates) {
    try {
      const allowedSettings = [
        'theme', 'language', 'notifications', 'privacy', 'chat', 'calls'
      ];
      
      const filteredSettings = {};
      Object.keys(settingsUpdates).forEach(key => {
        if (allowedSettings.includes(key)) {
          filteredSettings[`settings.${key}`] = settingsUpdates[key];
        }
      });
      
      if (Object.keys(filteredSettings).length === 0) {
        throw new Error('Aucun paramètre valide à mettre à jour');
      }
      
      return await this.updateUser(userId, filteredSettings);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  }

  // Ajouter/retirer un contact
  async toggleContact(userId, contactId, isAdding = true) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        const contacts = currentData.contacts || [];
        
        if (isAdding && !contacts.includes(contactId)) {
          contacts.push(contactId);
        } else if (!isAdding && contacts.includes(contactId)) {
          const index = contacts.indexOf(contactId);
          contacts.splice(index, 1);
        }
        
        await updateDoc(userRef, {
          contacts,
          updatedAt: new Date()
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la gestion des contacts:', error);
      throw error;
    }
  }

  // Ajouter/retirer un utilisateur bloqué
  async toggleBlockedUser(userId, blockedUserId, isBlocking = true) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        const blockedUsers = currentData.blockedUsers || [];
        
        if (isBlocking && !blockedUsers.includes(blockedUserId)) {
          blockedUsers.push(blockedUserId);
        } else if (!isBlocking && blockedUsers.includes(blockedUserId)) {
          const index = blockedUsers.indexOf(blockedUserId);
          blockedUsers.splice(index, 1);
        }
        
        await updateDoc(userRef, {
          blockedUsers,
          updatedAt: new Date()
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la gestion des utilisateurs bloqués:', error);
      throw error;
    }
  }

  // Ajouter/retirer un contact favori
  async toggleFavoriteContact(userId, contactId, isFavorite = true) {
    try {
      const userRef = doc(db, this.collectionName, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        const favoriteContacts = currentData.favoriteContacts || [];
        
        if (isFavorite && !favoriteContacts.includes(contactId)) {
          favoriteContacts.push(contactId);
        } else if (!isFavorite && favoriteContacts.includes(contactId)) {
          const index = favoriteContacts.indexOf(contactId);
          favoriteContacts.splice(index, 1);
        }
        
        await updateDoc(userRef, {
          favoriteContacts,
          updatedAt: new Date()
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la gestion des contacts favoris:', error);
      throw error;
    }
  }
}

// Instance singleton
const userService = new UserService();
export default userService;
