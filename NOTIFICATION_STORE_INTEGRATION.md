# NotificationStore Integration

## Vue d'ensemble

L'intégration du `NotificationStore` fournit une solution complète pour la gestion des notifications dans l'application WhatsApp. Cette intégration inclut la gestion des notifications, les paramètres de notification, les permissions système, et la synchronisation.

## Architecture

### 1. Store (Zustand)
- **Fichier**: `src/stores/notificationStore.js`
- **Fonctionnalités**:
  - Gestion des notifications (ajout, suppression, marquage comme lu)
  - Paramètres de notification (son, vibration, heures silencieuses)
  - Permissions système
  - Recherche et filtrage
  - Statistiques et utilitaires

### 2. API Routes (Next.js)
- **`/api/notifications`** (GET/POST): Gestion des notifications
- **`/api/notifications/[notificationId]`** (GET/PUT/DELETE): Gestion d'une notification spécifique
- **`/api/notifications/settings`** (GET/PUT/PATCH): Gestion des paramètres
- **`/api/notifications/sync`** (GET): Synchronisation des notifications

### 3. Service Layer
- **Fichier**: `src/utils/notificationService.js`
- **Fonctionnalités**:
  - Centralisation des appels API
  - Validation des données
  - Utilitaires de formatage
  - Fonctions de recherche et filtrage
  - Création de notifications prédéfinies

### 4. Custom Hook
- **Fichier**: `src/hooks/useNotification.js`
- **Fonctionnalités**:
  - Interface simplifiée pour les composants
  - Gestion automatique des permissions
  - Fonctions de création prédéfinies
  - Gestion d'erreurs

## Fonctionnalités principales

### Gestion des notifications
```javascript
// Ajouter une notification
const result = addNotification({
  title: 'Nouveau message',
  content: 'Alice vous a envoyé un message',
  category: 'messages',
  priority: 'normal'
});

// Marquer comme lu
markAsRead(notificationId);

// Supprimer une notification
removeNotification(notificationId);
```

### Paramètres de notification
```javascript
// Mettre à jour les paramètres
updateSettings({
  sound: true,
  vibration: false,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  }
});

// Vérifier les heures silencieuses
const inQuietHours = isInQuietHours();
```

### Permissions système
```javascript
// Demander la permission
requestPermission();

// Afficher une notification système
showSystemNotification('Titre', 'Contenu');

// Jouer un son
playNotificationSound();
```

### Recherche et filtrage
```javascript
// Rechercher des notifications
const results = searchNotifications('message');

// Filtrer par catégorie
const messages = filterByCategory('messages');

// Filtrer par priorité
const urgent = filterByPriority('urgent');
```

### Notifications prédéfinies
```javascript
// Notification de message
createMessageNotification('Alice', 'Salut !', 'conv1', 'msg1');

// Notification d'appel manqué
createCallNotification('Bob', 'missed', 'call1');

// Notification de statut
createStatusNotification('Charlie', 'photo', 'status1');

// Notification de média
createMediaNotification('David', 'image', 'conv2', 'media1');
```

## Structure des données

### Notification
```javascript
{
  id: 'notif_123',
  title: 'Titre de la notification',
  content: 'Contenu de la notification',
  category: 'messages', // system, messages, calls, status, media
  priority: 'normal', // low, normal, high, urgent
  isRead: false,
  isDismissed: false,
  createdAt: '2024-01-01T00:00:00Z',
  icon: '/icons/message.svg',
  actions: [
    {
      id: 'reply',
      title: 'Répondre',
      icon: '/icons/reply.svg'
    }
  ],
  metadata: {
    conversationId: 'conv1',
    messageId: 'msg1'
  }
}
```

### Paramètres
```javascript
{
  enabled: true,
  sound: true,
  vibration: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  categories: {
    system: true,
    messages: true,
    calls: true,
    status: true,
    media: true
  }
}
```

## API Endpoints

### GET /api/notifications
Récupère toutes les notifications avec filtres optionnels.

**Paramètres de requête**:
- `category`: Filtrer par catégorie
- `priority`: Filtrer par priorité
- `isRead`: Filtrer par statut de lecture
- `limit`: Limiter le nombre de résultats

### POST /api/notifications
Crée une nouvelle notification.

**Corps de la requête**:
```javascript
{
  title: 'Titre',
  content: 'Contenu',
  category: 'messages',
  priority: 'normal'
}
```

### GET /api/notifications/[notificationId]
Récupère une notification spécifique.

### PUT /api/notifications/[notificationId]
Met à jour une notification.

### DELETE /api/notifications/[notificationId]
Supprime une notification.

### GET /api/notifications/settings
Récupère les paramètres de notification.

### PUT /api/notifications/settings
Met à jour complètement les paramètres.

### PATCH /api/notifications/settings
Met à jour partiellement les paramètres.

### GET /api/notifications/sync
Synchronise les notifications avec le serveur.

## Utilisation dans les composants

```javascript
import { useNotification } from '../hooks/useNotification';

const MyComponent = () => {
  const {
    notifications,
    settings,
    addNotification,
    markAsRead,
    updateSettings
  } = useNotification();

  const handleNewMessage = (message) => {
    addNotification({
      title: 'Nouveau message',
      content: `${message.sender}: ${message.preview}`,
      category: 'messages',
      priority: 'normal'
    });
  };

  return (
    <div>
      {/* Interface utilisateur */}
    </div>
  );
};
```

## Gestion des erreurs

Le hook `useNotification` inclut une gestion d'erreurs robuste :

```javascript
const result = addNotification(notificationData);
if (result.success) {
  // Succès
  console.log('Notification ajoutée:', result.notification);
} else {
  // Erreur
  console.error('Erreur:', result.error);
}
```

## Persistance

Le store utilise le middleware `persist` de Zustand pour sauvegarder automatiquement l'état dans `localStorage` :
- Notifications
- Paramètres
- Permissions

## Tests

Un composant de test complet (`NotificationTest`) est fourni pour tester toutes les fonctionnalités :
- Ajout/suppression de notifications
- Gestion des paramètres
- Recherche et filtrage
- Actions système
- Notifications prédéfinies

## Sécurité

- Validation des données côté client et serveur
- Gestion sécurisée des permissions système
- Protection contre les injections de données malveillantes

## Performance

- Mise en cache des notifications
- Chargement différé des données
- Optimisation des re-renders avec React.memo
- Gestion efficace de la mémoire

## Extensibilité

Le système est conçu pour être facilement extensible :
- Ajout de nouvelles catégories de notifications
- Intégration avec d'autres services
- Personnalisation des actions
- Support de nouveaux types de médias

## Intégration avec d'autres stores

Le `NotificationStore` peut être utilisé en conjonction avec :
- `AuthStore` : Notifications d'authentification
- `UserStore` : Notifications de profil et contacts
- `ChatStore` : Notifications de messages et appels

## Maintenance

- Documentation complète
- Tests automatisés
- Gestion des versions
- Support des mises à jour
