# 📱 Configuration de l'API Google People pour les Contacts

## 📋 Prérequis

1. **Compte Google Cloud Platform** - [console.cloud.google.com](https://console.cloud.google.com)
2. **Projet Google Cloud** avec facturation activée
3. **API Google People activée**
4. **Authentification Google OAuth 2.0 configurée**

## 🚀 Étapes de Configuration

### 1. Activer l'API Google People

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Sélectionnez votre projet
3. Allez dans "APIs et services" → "Bibliothèque"
4. Recherchez "Google People API"
5. Cliquez sur l'API et cliquez "Activer"

### 2. Configurer les Scopes OAuth

Modifiez votre configuration OAuth pour inclure l'accès aux contacts :

```javascript
// Dans GoogleAuth.jsx
scope: 'email profile https://www.googleapis.com/auth/contacts.readonly'
```

**Scopes disponibles :**
- `https://www.googleapis.com/auth/contacts.readonly` - Lecture seule des contacts
- `https://www.googleapis.com/auth/contacts` - Lecture et écriture des contacts
- `https://www.googleapis.com/auth/user.emails.read` - Lecture des emails
- `https://www.googleapis.com/auth/user.phone_numbers.read` - Lecture des numéros de téléphone

### 3. Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Configuration Google OAuth 2.0
NEXT_PUBLIC_GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com

# API Google People
NEXT_PUBLIC_GOOGLE_PEOPLE_API_ENABLED=true

# Scopes supplémentaires
NEXT_PUBLIC_GOOGLE_SCOPES=email profile https://www.googleapis.com/auth/contacts.readonly
```

## 🔧 Utilisation

### Hook useGoogleContacts

```jsx
import { useGoogleContacts } from '@/hooks/useGoogleContacts';

export default function MyComponent() {
  const {
    contacts,
    isLoading,
    error,
    fetchContacts,
    searchContacts,
    exportContacts
  } = useGoogleContacts();

  // Utiliser les contacts...
}
```

### Service GoogleContactsService

```jsx
import googleContactsService from '@/utils/googleContactsService';

// Récupérer tous les contacts
const contacts = await googleContactsService.fetchContacts(accessToken);

// Rechercher des contacts
const results = googleContactsService.searchContacts('John');

// Obtenir les statistiques
const stats = googleContactsService.getContactsStats();

// Exporter les contacts
const jsonData = googleContactsService.exportContactsToJSON();
const csvData = googleContactsService.exportContactsToCSV();
```

## 🎯 Fonctionnalités

### ✅ Récupération des Contacts
- **Synchronisation automatique** avec l'API Google People
- **Gestion des erreurs** et retry automatique
- **Mise en cache** des contacts pour de meilleures performances
- **Synchronisation intelligente** (évite les appels inutiles)

### 🔍 Recherche et Filtrage
- **Recherche en temps réel** par nom, email, organisation
- **Filtres par type** : avec photos, emails, téléphones
- **Onglets organisés** : tous, récents, favoris
- **Tri automatique** par nom alphabétique

### 📊 Statistiques et Analytics
- **Compteurs en temps réel** : total, avec photos, emails, téléphones
- **Métadatas des contacts** : dates de modification, sources
- **Informations d'organisation** : entreprises, postes, types

### 💾 Export et Sauvegarde
- **Format JSON** : données complètes avec métadatas
- **Format CSV** : données tabulaires pour Excel/Google Sheets
- **Téléchargement automatique** des fichiers
- **Nommage intelligent** avec dates

### 🔄 Synchronisation
- **Vérification des permissions** avant synchronisation
- **Gestion des tokens** et renouvellement automatique
- **Détection des modifications** depuis la dernière sync
- **Indicateur de dernière synchronisation**

## 🚨 Dépannage

### Erreur "insufficient_scope"
- Vérifiez que le scope `https://www.googleapis.com/auth/contacts.readonly` est inclus
- Assurez-vous que l'API Google People est activée

### Erreur "access_denied"
- L'utilisateur a refusé l'accès aux contacts
- Vérifiez les permissions dans les paramètres Google

### Erreur "quota_exceeded"
- L'API a atteint sa limite de requêtes
- Attendez quelques minutes avant de réessayer

### Contacts vides
- Vérifiez que l'utilisateur a des contacts dans Google Contacts
- Assurez-vous que les contacts ne sont pas privés

## 📚 API Référence

### Méthodes du Hook

```javascript
const {
  // État
  contacts,              // Liste complète des contacts
  filteredContacts,      // Contacts filtrés par recherche
  isLoading,             // État de chargement
  error,                 // Erreur éventuelle
  searchQuery,           // Requête de recherche actuelle
  stats,                 // Statistiques des contacts
  lastSync,              // Date de dernière synchronisation

  // Actions
  fetchContacts,         // Récupérer tous les contacts
  refreshContacts,       // Actualiser les contacts
  searchContacts,        // Rechercher des contacts
  syncContacts,          // Synchroniser avec l'API
  exportContacts,        // Exporter les contacts

  // Utilitaires
  getRecentContacts,     // Obtenir les contacts récents
  getFavoriteContacts,   // Obtenir les contacts favoris
  getContactById,        // Obtenir un contact par ID
  getContactsByOrganization, // Filtrer par organisation
  checkContactsPermissions,   // Vérifier les permissions
  getSyncInfo,           // Informations de synchronisation

  // État dérivé
  hasContacts,           // Y a-t-il des contacts ?
  totalContacts,         // Nombre total de contacts
  searchResults,         // Nombre de résultats de recherche
  canSync                // Peut-on synchroniser ?
} = useGoogleContacts();
```

### Structure des Contacts

```javascript
const contact = {
  id: "people/123456789",
  resourceName: "people/123456789",
  etag: "%Etag%",
  metadata: { /* métadatas Google */ },
  
  // Noms
  names: [{
    displayName: "John Doe",
    givenName: "John",
    familyName: "Doe",
    displayNameLastFirst: "Doe, John"
  }],
  
  // Emails
  emails: [{
    value: "john@example.com",
    type: "work",
    formattedType: "Travail"
  }],
  
  // Téléphones
  phones: [{
    value: "+33123456789",
    type: "mobile",
    formattedType: "Mobile"
  }],
  
  // Photos
  photos: [{
    url: "https://...",
    metadata: { /* métadatas */ }
  }],
  
  // Organisations
  organizations: [{
    name: "Google",
    title: "Software Engineer",
    type: "work"
  }],
  
  // Champs calculés
  displayName: "John Doe",
  primaryEmail: "john@example.com",
  primaryPhone: "+33123456789",
  primaryPhoto: "https://..."
};
```

## 🌟 Exemples Avancés

### Intégration avec WhatsApp Clone

```jsx
// src/components/ChatList.jsx
import { useGoogleContacts } from '@/hooks/useGoogleContacts';

export default function ChatList() {
  const { contacts, searchContacts } = useGoogleContacts();
  
  // Filtrer les contacts pour les chats
  const chatContacts = contacts.filter(contact => 
    contact.primaryPhone || contact.primaryEmail
  );
  
  return (
    <div>
      {chatContacts.map(contact => (
        <ChatItem
          key={contact.id}
          contact={contact}
          onSelect={() => startChat(contact)}
        />
      ))}
    </div>
  );
}
```

### Synchronisation automatique

```jsx
// src/components/ContactsSync.jsx
import { useGoogleContacts } from '@/hooks/useGoogleContacts';

export default function ContactsSync() {
  const { syncContacts, lastSync, canSync } = useGoogleContacts();
  
  useEffect(() => {
    // Synchroniser automatiquement toutes les 30 minutes
    const interval = setInterval(() => {
      if (canSync) {
        syncContacts();
      }
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [canSync, syncContacts]);
  
  return (
    <div>
      <p>Dernière sync: {lastSync?.toLocaleString()}</p>
      <button onClick={syncContacts} disabled={!canSync}>
        Synchroniser maintenant
      </button>
    </div>
  );
}
```

## 🔐 Bonnes Pratiques

1. **Gérer les permissions** : Vérifiez toujours l'accès aux contacts
2. **Mise en cache** : Évitez les appels API répétés
3. **Gestion d'erreurs** : Traitez gracieusement les erreurs d'API
4. **Synchronisation intelligente** : Respectez les quotas et limites
5. **Sécurité** : Ne stockez jamais les tokens en clair
6. **Performance** : Limitez le nombre de contacts chargés si nécessaire

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la console du navigateur pour les erreurs
2. Consultez la documentation Google People API
3. Vérifiez votre configuration Google Cloud Console
4. Testez avec un compte Google de développement

---

**Note :** Ce système est conçu pour fonctionner avec Next.js et Electron. Assurez-vous que votre environnement est correctement configuré et que l'API Google People est activée.
