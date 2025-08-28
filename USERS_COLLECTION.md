# 📚 Collection Users - Documentation Complète

## 🎯 Vue d'ensemble

La collection `users` a été créée pour gérer tous les profils utilisateurs de l'application WhatsApp Clone. Elle stocke automatiquement les utilisateurs après l'authentification Google et fournit une interface complète pour la gestion des profils.

## 🏗️ Structure de la Collection

### Interface Utilisateur Complète

```typescript
interface User {
  // Identifiants
  id: string;                    // ID unique Firebase
  googleId: string;              // ID Google OAuth
  email: string;                 // Email de l'utilisateur
  phone?: string;                // Numéro de téléphone (optionnel)
  
  // Informations de base
  name: string;                  // Nom complet
  firstName: string;             // Prénom
  lastName: string;              // Nom de famille
  displayName: string;           // Nom d'affichage
  username: string;              // Nom d'utilisateur unique
  
  // Avatar et médias
  avatar: string;                // URL de l'avatar
  avatarUrl: string;             // URL complète de l'avatar
  avatarThumbnail: string;       // Miniature de l'avatar
  
  // Statut et présence
  status: string;                // Statut actuel
  statusMessage: string;         // Message de statut personnalisé
  isOnline: boolean;             // En ligne actuellement
  lastSeen: Date | null;         // Dernière connexion
  lastSeenTimestamp: number | null; // Timestamp de dernière connexion
  
  // Informations personnelles
  bio: string;                   // Biographie
  location: string;              // Localisation
  website: string;               // Site web
  birthday: Date | null;         // Date de naissance
  gender: string;                // Genre
  
  // Paramètres et préférences
  settings: {
    theme: 'light' | 'dark';     // Thème de l'interface
    language: string;            // Langue (défaut: 'fr')
    notifications: {
      enabled: boolean;          // Notifications activées
      sound: boolean;            // Sons activés
      vibration: boolean;        // Vibrations activées
      showPreview: boolean;      // Aperçu des messages
      showSenderName: boolean;   // Nom de l'expéditeur
      showMessageContent: boolean; // Contenu du message
      quietHours: {
        enabled: boolean;        // Heures silencieuses
        start: string;           // Début (format: '22:00')
        end: string;             // Fin (format: '08:00')
      }
    };
    privacy: {
      lastSeen: 'everyone' | 'contacts' | 'nobody';
      profilePhoto: 'everyone' | 'contacts' | 'nobody';
      status: 'everyone' | 'contacts' | 'nobody';
      readReceipts: boolean;     // Accusés de lecture
      typingIndicator: boolean;  // Indicateur de frappe
      onlineStatus: boolean;     // Statut en ligne
    };
    chat: {
      enterToSend: boolean;      // Entrée pour envoyer
      mediaAutoDownload: boolean; // Téléchargement auto des médias
      fontSize: 'small' | 'medium' | 'large';
      bubbleStyle: string;       // Style des bulles
      wallpaper: string;         // Fond d'écran
    };
    calls: {
      incomingCallSound: boolean; // Son d'appel entrant
      outgoingCallSound: boolean; // Son d'appel sortant
      videoCallQuality: 'low' | 'medium' | 'high' | 'auto';
    }
  };
  
  // Statistiques
  stats: {
    totalMessages: number;       // Total des messages
    totalCalls: number;          // Total des appels
    totalContacts: number;       // Total des contacts
    totalGroups: number;         // Total des groupes
    joinDate: Date | null;       // Date d'inscription
    lastActive: Date | null;     // Dernière activité
  };
  
  // Sécurité et authentification
  isVerified: boolean;           // Compte vérifié
  isPremium: boolean;            // Compte premium
  twoFactorEnabled: boolean;     // 2FA activé
  backupEnabled: boolean;        // Sauvegarde activée
  
  // Métadonnées
  createdAt: Date;               // Date de création
  updatedAt: Date;               // Date de mise à jour
  lastLoginAt: Date | null;      // Dernière connexion
  loginCount: number;            // Nombre de connexions
  
  // Relations
  contacts: string[];            // IDs des contacts
  blockedUsers: string[];        // IDs des utilisateurs bloqués
  favoriteContacts: string[];    // IDs des contacts favoris
  
  // Notifications push
  pushTokens: string[];          // Tokens de notification
  
  // Préférences de synchronisation
  syncPreferences: {
    contacts: boolean;           // Synchroniser les contacts
    messages: boolean;           // Synchroniser les messages
    media: boolean;              // Synchroniser les médias
    settings: boolean;           // Synchroniser les paramètres
  }
}
```

## 🔧 Services Disponibles

### 1. UserService (Client-side)

```typescript
import userService from '@/utils/userService';

// Créer un utilisateur
const newUser = await userService.createUser(userData);

// Récupérer par ID
const user = await userService.getUserById(userId);

// Récupérer par Google ID
const user = await userService.getUserByGoogleId(googleId);

// Récupérer par email
const user = await userService.getUserByEmail(email);

// Mettre à jour
await userService.updateUser(userId, updates);

// Mettre à jour la présence
await userService.updateUserPresence(userId, isOnline);

// Mettre à jour les infos de connexion
await userService.updateUserLoginInfo(userId);

// Rechercher des utilisateurs
const users = await userService.searchUsers(query, limit);

// Gérer les contacts
await userService.toggleContact(userId, contactId, isAdding);

// Gérer les utilisateurs bloqués
await userService.toggleBlockedUser(userId, blockedUserId, isBlocking);

// Gérer les contacts favoris
await userService.toggleFavoriteContact(userId, contactId, isFavorite);
```

### 2. API Routes (Server-side)

#### GET /api/users
- Récupère tous les utilisateurs avec pagination
- Supporte la recherche par nom
- Paramètres : `limit`, `startAfter`, `search`

#### POST /api/users
- Crée un nouvel utilisateur
- Validation des champs requis (email, name)

#### GET /api/users/[userId]
- Récupère un utilisateur spécifique

#### PUT /api/users/[userId]
- Met à jour un utilisateur existant

#### DELETE /api/users/[userId]
- Supprime un utilisateur

## 🚀 Intégration avec l'Authentification Google

### Flux d'Authentification

1. **Connexion Google** : L'utilisateur se connecte avec Google
2. **Récupération des données** : Les informations de base sont récupérées depuis Google
3. **Création/Mise à jour** : L'utilisateur est créé ou mis à jour dans Firebase
4. **Stockage local** : Les données sont sauvegardées localement
5. **Synchronisation** : Les données sont synchronisées avec Firebase

### Gestion des Erreurs

- **Fallback Firebase** : Si Firebase échoue, utilisation des données locales
- **Données temporaires** : Création d'un profil temporaire si nécessaire
- **Retry automatique** : Tentatives de reconnexion automatiques

## 📱 Utilisation dans l'Interface

### Composant GoogleAuth

```typescript
// Après authentification réussie
const userData = await userService.createOrUpdateGoogleUser(userInfo);

// Sauvegarde locale
localStorage.setItem('googleAuthToken', response.access_token);
localStorage.setItem('userData', JSON.stringify(userData));

// Mise à jour de l'état
setUser(userData);
setAuthStep('success');
```

### Vérification de l'Authentification Existante

```typescript
// Vérifier si l'utilisateur existe dans Firebase
const existingUser = await userService.getUserByGoogleId(userInfo.sub);

if (existingUser) {
  // Mettre à jour les informations de connexion
  await userService.updateUserLoginInfo(existingUser.id);
  setUser(existingUser);
} else {
  // Créer un nouvel utilisateur
  const newUser = await userService.createUser(userData);
  setUser(newUser);
}
```

## 🔒 Sécurité et Validation

### Validation des Données

- **Champs requis** : email, name
- **Types de données** : validation des types et formats
- **Sanitisation** : nettoyage des données d'entrée

### Permissions

- **Lecture** : Tous les utilisateurs peuvent lire les profils publics
- **Écriture** : Seul l'utilisateur peut modifier son propre profil
- **Suppression** : Seul l'utilisateur peut supprimer son compte

## 📊 Performance et Optimisation

### Stratégies de Cache

- **Cache local** : Données utilisateur stockées localement
- **Cache Firebase** : Mise en cache des requêtes fréquentes
- **Lazy loading** : Chargement différé des données non critiques

### Indexation

- **Google ID** : Index unique pour la recherche rapide
- **Email** : Index pour la recherche par email
- **Display Name** : Index pour la recherche textuelle

## 🧪 Tests et Développement

### Données de Test

```typescript
// Créer un utilisateur de test
const testUser = {
  googleId: 'test_google_id',
  email: 'test@example.com',
  name: 'Utilisateur Test',
  displayName: 'Utilisateur Test',
  username: 'testuser',
  // ... autres champs
};

await userService.createUser(testUser);
```

### Développement Local

- **Firebase Emulator** : Support pour le développement local
- **Données de test** : Génération automatique de données de test
- **Mode debug** : Logs détaillés en mode développement

## 🔄 Synchronisation et Réplication

### Stratégies de Sync

- **Temps réel** : Mises à jour en temps réel via Firebase
- **Hors ligne** : Support du mode hors ligne avec synchronisation différée
- **Conflits** : Résolution automatique des conflits de synchronisation

### Gestion des Conflits

- **Timestamp** : Utilisation des timestamps pour la résolution
- **Versioning** : Numérotation des versions des données
- **Merge automatique** : Fusion intelligente des données

## 📈 Évolutions Futures

### Fonctionnalités Prévues

- **Profils avancés** : Plus d'informations personnelles
- **Préférences avancées** : Plus d'options de personnalisation
- **Statistiques détaillées** : Métriques d'utilisation avancées
- **Intégration sociale** : Connexions avec d'autres réseaux

### Optimisations

- **Compression** : Compression des données stockées
- **Archivage** : Archivage automatique des anciennes données
- **Backup** : Système de sauvegarde automatisé

---

## 📝 Notes de Développement

Cette collection a été conçue pour être **évolutive** et **performante**. Elle suit les meilleures pratiques Firebase et offre une base solide pour toutes les fonctionnalités utilisateur de l'application.

Pour toute question ou suggestion d'amélioration, consultez la documentation Firebase ou contactez l'équipe de développement.
