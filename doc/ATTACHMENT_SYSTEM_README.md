# Système d'Attachements WhatsApp

## Vue d'ensemble

Ce système d'attachements a été développé pour remplacer l'ancienne option "Média" et fournir une architecture complète et modulaire pour gérer différents types de contenu dans les conversations WhatsApp.

## Fonctionnalités Supprimées

- ❌ **Option "Média"** - Supprimée du menu d'attachement
- ❌ **Composant MediaUpload** - Supprimé et remplacé par des services spécialisés

## Nouvelles Fonctionnalités

### 1. Photos & Vidéos (`select-media`)
- Sélection depuis la galerie
- Support des formats image et vidéo
- Validation des tailles de fichiers
- Stockage Firebase avec métadonnées

### 2. Caméra (`open-camera`)
- Capture de photos en temps réel
- Enregistrement de vidéos
- Métadonnées de dispositif
- Stockage optimisé

### 3. Documents (`select-document`)
- Support de multiples formats (PDF, Word, Excel, etc.)
- Validation des types de fichiers
- Limite de taille configurable (50MB par défaut)
- Métadonnées complètes

### 4. Contacts (`select-contact`)
- Partage de contacts entre utilisateurs
- Système de demandes d'acceptation
- Gestion des permissions
- Synchronisation Firebase

### 5. Sondages (`create-poll`)
- Création de sondages interactifs
- Options multiples
- Système de vote
- Statistiques en temps réel

### 6. Dessins (`open-drawing`)
- Création de dessins sur canvas
- Sauvegarde avec tags
- Recherche par métadonnées
- Stockage d'images

## Architecture Technique

### Services Backend

#### `pollService.js`
- Gestion des sondages et votes
- Collections Firestore : `polls`, `poll_votes`
- Statistiques et permissions

#### `drawingService.js`
- Gestion des dessins et canvas
- Upload vers Firebase Storage
- Système de tags et recherche

#### `contactSharingService.js`
- Partage de contacts
- Collections : `shared_contacts`, `contact_requests`
- Workflow d'acceptation/refus

#### `documentService.js`
- Upload et gestion de documents
- Validation des types et tailles
- Métadonnées et recherche

#### `cameraService.js`
- Capture photo/vidéo
- Sélection depuis galerie
- Stockage optimisé

#### `attachmentService.js`
- Service principal unifié
- Orchestration des autres services
- Gestion des permissions
- Statistiques globales

### Hook React

#### `useAttachments`
- Interface unifiée pour tous les types d'attachements
- Gestion d'état et erreurs
- Actions asynchrones
- Permissions et validation

### Composants

#### `AttachmentMenu.jsx`
- Menu d'attachement mis à jour
- Options organisées logiquement
- Gestion des événements

#### `ChatFooter.jsx`
- Intégration des nouveaux services
- Gestion des événements d'attachement
- Suppression de la logique média

#### `AttachmentTest.jsx`
- Composant de test complet
- Validation de toutes les fonctionnalités
- Interface de débogage

## Configuration Firebase

### Collections Firestore
- `polls` - Sondages et options
- `poll_votes` - Votes des utilisateurs
- `drawings` - Dessins et métadonnées
- `shared_contacts` - Contacts partagés
- `contact_requests` - Demandes de contact
- `documents` - Documents uploadés
- `camera_media` - Photos et vidéos

### Storage Firebase
- `drawings/` - Images de dessins
- `documents/` - Fichiers documentaires
- `camera/` - Photos et vidéos

## Utilisation

### Dans un composant React

```jsx
import { useAttachments } from '@/hooks';

function ChatComponent({ conversationId, userId }) {
  const {
    selectMedia,
    capturePhoto,
    createPoll,
    shareContact,
    isLoading,
    error
  } = useAttachments(conversationId, userId);

  const handleMediaSelect = async (files) => {
    const result = await selectMedia(files);
    if (result.success) {
      console.log('Médias partagés:', result.media);
    }
  };

  const handlePollCreation = async () => {
    const pollData = {
      question: "Quelle est votre couleur préférée?",
      options: ["Rouge", "Bleu", "Vert"],
      allow_multiple: false
    };
    
    const result = await createPoll(pollData);
    if (result.success) {
      console.log('Sondage créé:', result.poll);
    }
  };

  return (
    <div>
      {/* Interface utilisateur */}
    </div>
  );
}
```

### Gestion des événements

```jsx
// Dans ChatFooter.jsx
const handleAttachmentOptionSelect = (option) => {
  switch (option.action) {
    case 'select-media':
      // Ouvrir le sélecteur de fichiers
      window.dispatchEvent(new CustomEvent('open-media-picker', {
        detail: { chatId: selectedChat?.id }
      }));
      break;
      
    case 'create-poll':
      // Ouvrir l'interface de création de sondage
      window.dispatchEvent(new CustomEvent('open-poll-creator', {
        detail: { chatId: selectedChat?.id }
      }));
      break;
      
    // ... autres cas
  }
};
```

## Permissions et Sécurité

### Vérification des Permissions
- Participation à la conversation requise
- Limites de stockage par conversation
- Validation des types de fichiers
- Contrôle d'accès par utilisateur

### Limites de Stockage
- **Documents** : 100MB par conversation
- **Médias** : 500MB par conversation
- **Photos** : 10MB par fichier
- **Vidéos** : 100MB par fichier

## Tests et Validation

### Composant de Test
Le composant `AttachmentTest` fournit une interface complète pour tester toutes les fonctionnalités :

- Test de chaque type d'attachement
- Validation des permissions
- Vérification des statistiques
- Gestion des erreurs

### Utilisation du Composant de Test

```jsx
import { AttachmentTest } from '@/components/chat/chatFooter';

// Dans votre composant de développement
<AttachmentTest 
  conversationId="conv_123" 
  userId="user_456" 
/>
```

## Migration depuis l'Ancien Système

### Étapes de Migration
1. Suppression de l'option "Média" du menu
2. Remplacement des composants MediaUpload
3. Intégration des nouveaux services
4. Mise à jour des gestionnaires d'événements
5. Test des nouvelles fonctionnalités

### Code de Migration

```jsx
// Ancien code (à supprimer)
const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
const handleMediaUpload = (mediaData) => { /* ... */ };

// Nouveau code
const {
  selectMedia,
  capturePhoto,
  createPoll
} = useAttachments(conversationId, userId);
```

## Maintenance et Évolution

### Nettoyage Automatique
- Suppression des anciens attachements (30 jours par défaut)
- Gestion de l'espace de stockage
- Optimisation des performances

### Statistiques et Monitoring
- Suivi de l'utilisation des attachements
- Métriques de performance
- Gestion des erreurs

### Extensibilité
- Architecture modulaire pour ajouter de nouveaux types
- Interface unifiée via `useAttachments`
- Services indépendants et réutilisables

## Support et Débogage

### Logs et Erreurs
- Logs détaillés dans la console
- Gestion centralisée des erreurs
- Composant de test intégré

### Problèmes Courants
1. **Permissions Firebase** : Vérifier les règles de sécurité
2. **Limites de stockage** : Surveiller l'utilisation
3. **Types de fichiers** : Valider les formats supportés
4. **Connexion réseau** : Gérer les timeouts

## Conclusion

Ce nouveau système d'attachements offre une architecture robuste, modulaire et extensible pour WhatsApp. Il remplace efficacement l'ancienne option "Média" tout en ajoutant des fonctionnalités avancées comme les sondages, dessins et partage de contacts.

L'intégration avec Firebase assure la synchronisation et la persistance des données, tandis que l'architecture React moderne garantit une expérience utilisateur fluide et réactive.
