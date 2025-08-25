# Intégration du ChatStore

## Vue d'ensemble

L'intégration du ChatStore est maintenant complète avec une architecture backend/frontend bien structurée. Cette intégration permet une gestion complète des conversations et messages sans modifier l'UI existante.

## Architecture

### 1. Store Zustand (chatStore.js)
- **Localisation** : `src/stores/chatStore.js`
- **Fonctionnalités** :
  - Gestion des conversations (CRUD complet)
  - Gestion des messages (CRUD complet)
  - Gestion des réactions et réponses
  - Gestion des statuts de messages
  - Persistance locale avec localStorage
  - Actions pour synchronisation et sauvegarde

### 2. API Routes Next.js
- **Conversations** : `/api/conversations` - Gestion des conversations (GET/POST)
- **Conversation spécifique** : `/api/conversations/[conversationId]` - Gestion d'une conversation (GET/PUT/DELETE)
- **Messages** : `/api/conversations/[conversationId]/messages` - Gestion des messages (GET/POST)
- **Message spécifique** : `/api/conversations/[conversationId]/messages/[messageId]` - Gestion d'un message (GET/PUT/DELETE)

### 3. Hook personnalisé (useChat.js)
- **Localisation** : `src/hooks/useChat.js`
- **Fonctionnalités** :
  - Encapsulation de la logique du chatStore
  - Chargement automatique des conversations
  - Chargement automatique des messages
  - Gestion des erreurs et du chargement
  - Utilitaires pour la gestion des conversations

### 4. Service de chat (chatService.js)
- **Localisation** : `src/utils/chatService.js`
- **Fonctionnalités** :
  - Centralisation des appels API
  - Validation des données de conversation et message
  - Utilitaires pour la recherche et le filtrage
  - Gestion des erreurs HTTP

## Fonctionnalités

### Gestion des conversations
- Création de conversations individuelles et de groupe
- Sélection et navigation entre conversations
- Épinglage/désépinglage de conversations
- Archivage/désarchivage de conversations
- Mise en sourdine/désactivation de la sourdine
- Gestion des thèmes de conversation

### Gestion des messages
- Envoi de messages texte
- Support de différents types de messages (texte, média, etc.)
- Édition et suppression de messages
- Gestion des statuts (envoyé, livré, lu, échoué)
- Ajout de réactions aux messages
- Système de réponses aux messages

### Fonctionnalités avancées
- Recherche dans les messages
- Pagination des messages
- Comptage des messages non lus
- Marquage automatique comme lu
- Gestion des participants

### Synchronisation
- Chargement automatique des conversations
- Chargement automatique des messages
- Sauvegarde sur le serveur
- Synchronisation en temps réel (préparé)

## Utilisation

### Dans un composant React

```jsx
import { useChat } from '../hooks/useChat';

const MonComposant = () => {
  const {
    conversations,
    selectedConversation,
    messages,
    isLoading,
    sendMessage,
    createConversation,
    selectConversation,
    getCurrentMessages,
    getTotalUnreadCount
  } = useChat();

  const handleSendMessage = async (content) => {
    if (!selectedConversation) return;
    
    const result = await sendMessage(selectedConversation, content);
    if (result.success) {
      console.log('Message envoyé avec succès');
    } else {
      console.error('Erreur:', result.error);
    }
  };

  const handleCreateConversation = async (participants) => {
    const result = await createConversation(participants);
    if (result.success) {
      console.log('Conversation créée avec succès');
    } else {
      console.error('Erreur:', result.error);
    }
  };

  return (
    <div>
      <h1>Chat ({getTotalUnreadCount()} non lus)</h1>
      <p>Conversations: {conversations.length}</p>
      <p>Conversation sélectionnée: {selectedConversation || 'Aucune'}</p>
      
      {/* Interface utilisateur */}
    </div>
  );
};
```

### Accès direct au store

```jsx
import { useChatStore } from '../stores/chatStore';

const MonComposant = () => {
  const { conversations, messages, selectedConversation } = useChatStore();
  
  return (
    <div>
      {conversations.map(conversation => (
        <div key={conversation.id}>
          <h3>{conversation.customName || conversation.participants.map(p => p.name).join(', ')}</h3>
          <p>Messages: {messages[conversation.id]?.length || 0}</p>
        </div>
      ))}
    </div>
  );
};
```

## API Endpoints

### GET /api/conversations
Récupère toutes les conversations avec filtres optionnels.

### POST /api/conversations
Crée une nouvelle conversation.

### GET /api/conversations/[conversationId]
Récupère une conversation spécifique.

### PUT /api/conversations/[conversationId]
Met à jour une conversation.

### DELETE /api/conversations/[conversationId]
Supprime une conversation.

### GET /api/conversations/[conversationId]/messages
Récupère les messages d'une conversation avec pagination.

### POST /api/conversations/[conversationId]/messages
Envoie un nouveau message dans une conversation.

### GET /api/conversations/[conversationId]/messages/[messageId]
Récupère un message spécifique.

### PUT /api/conversations/[conversationId]/messages/[messageId]
Met à jour un message.

### DELETE /api/conversations/[conversationId]/messages/[messageId]
Supprime un message.

## Données de test

### Conversations de test
- Conversation individuelle avec Jean Dupont (épinglée)
- Conversation individuelle avec Marie Martin
- Conversation de groupe "Groupe Projet" (en sourdine)

### Messages de test
- Messages texte avec différents statuts
- Messages avec réactions
- Messages avec horodatage

## Sécurité

### Validation des données
- Validation du contenu des messages
- Validation des participants de conversation
- Vérification des permissions d'accès

### Persistance
- Stockage sécurisé dans localStorage
- Synchronisation avec le serveur
- Sauvegarde automatique des modifications

## Extensibilité

### Ajout de nouvelles fonctionnalités
1. Étendre le chatStore avec de nouvelles actions
2. Ajouter les API routes correspondantes
3. Mettre à jour le service de chat
4. Étendre le hook useChat si nécessaire

### Personnalisation
- Ajout de nouveaux types de messages
- Extension du système de réactions
- Intégration avec d'autres services

## Prochaines étapes

1. **Intégration avec l'UI existante** : Connecter le chatStore aux composants existants
2. **Base de données** : Remplacement des données mockées
3. **Tests unitaires** : Ajout de tests pour le chatStore
4. **Documentation** : Documentation complète des API
5. **Optimisation** : Amélioration des performances
6. **Temps réel** : Intégration WebSocket pour les messages en temps réel

## Fichiers créés/modifiés

### Nouveaux fichiers
- `src/app/api/conversations/route.js`
- `src/app/api/conversations/[conversationId]/route.js`
- `src/app/api/conversations/[conversationId]/messages/route.js`
- `src/app/api/conversations/[conversationId]/messages/[messageId]/route.js`
- `src/hooks/useChat.js`
- `src/utils/chatService.js`

### Fichiers modifiés
- `src/hooks/index.js` - Ajout de l'export useChat
- `src/utils/index.js` - Ajout de l'export chatService
- `src/components/auth/index.js` - Nettoyage des exports

L'intégration du ChatStore est maintenant prête et peut être utilisée dans votre application existante.
