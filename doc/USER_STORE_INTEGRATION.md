# Intégration du UserStore

## Vue d'ensemble

L'intégration du UserStore est maintenant complète avec une architecture backend/frontend bien structurée. Cette intégration permet une gestion complète des utilisateurs, contacts et préférences sans modifier l'UI existante.

## Architecture

### 1. Store Zustand (userStore.js)
- **Localisation** : `src/stores/userStore.js`
- **Fonctionnalités** :
  - Gestion du profil utilisateur
  - Gestion des contacts (CRUD complet)
  - Gestion des préférences (thème, notifications, confidentialité)
  - Persistance locale avec localStorage
  - Actions pour synchronisation et sauvegarde

### 2. API Routes Next.js
- **Contacts** : `/api/contacts` - Gestion des contacts (GET/POST)
- **Sync** : `/api/contacts/sync` - Synchronisation des contacts
- **Profile** : `/api/profile` - Gestion du profil utilisateur (GET/PUT/PATCH)

### 3. Hook personnalisé (useUser.js)
- **Localisation** : `src/hooks/useUser.js`
- **Fonctionnalités** :
  - Encapsulation de la logique du userStore
  - Chargement automatique des contacts
  - Application automatique du thème
  - Gestion des erreurs et du chargement

### 4. Service utilisateur (userService.js)
- **Localisation** : `src/utils/userService.js`
- **Fonctionnalités** :
  - Centralisation des appels API
  - Validation des données de contact
  - Utilitaires pour la recherche et le filtrage
  - Gestion des erreurs HTTP

## Fonctionnalités

### Gestion du profil utilisateur
- Mise à jour du profil (nom, statut, bio)
- Gestion de la photo de profil
- Mise à jour du statut en temps réel

### Gestion des contacts
- Ajout, modification, suppression de contacts
- Marquer/démarquer comme favori
- Bloquer/débloquer des contacts
- Recherche de contacts
- Synchronisation avec services externes

### Gestion des préférences
- Thème (clair/sombre/auto)
- Langue
- Paramètres de notification
- Paramètres de confidentialité
- Paramètres de chat

### Synchronisation
- Synchronisation automatique des contacts
- Sauvegarde sur le serveur
- Chargement depuis le serveur

## Utilisation

### Dans un composant React

```jsx
import { useUser } from '../hooks/useUser';

const MonComposant = () => {
  const {
    currentUser,
    contacts,
    preferences,
    isLoading,
    addContact,
    updateProfile,
    setTheme,
    searchContacts
  } = useUser();

  const handleAddContact = async (contactData) => {
    const result = await addContact(contactData);
    if (result.success) {
      console.log('Contact ajouté avec succès');
    } else {
      console.error('Erreur:', result.error);
    }
  };

  const handleThemeChange = (theme) => {
    setTheme(theme);
  };

  return (
    <div>
      <h1>Bienvenue, {currentUser?.name}</h1>
      <p>Contacts: {contacts.length}</p>
      <p>Thème actuel: {preferences.theme}</p>
      
      {/* Interface utilisateur */}
    </div>
  );
};
```

### Accès direct au store

```jsx
import { useUserStore } from '../stores/userStore';

const MonComposant = () => {
  const { contacts, preferences } = useUserStore();
  
  return (
    <div>
      {contacts.map(contact => (
        <div key={contact.id}>{contact.name}</div>
      ))}
    </div>
  );
};
```

## API Endpoints

### GET /api/contacts
Récupère tous les contacts de l'utilisateur.

### POST /api/contacts
Sauvegarde les contacts sur le serveur.

### GET /api/contacts/sync
Synchronise les contacts avec un service externe.

### GET /api/profile
Récupère le profil utilisateur actuel.

### PUT /api/profile
Met à jour complètement le profil utilisateur.

### PATCH /api/profile
Met à jour partiellement le profil utilisateur.

## Données de test

### Contacts de test
- Jean Dupont (favori)
- Marie Martin
- Pierre Durand (favori)

### Profil de test
- Nom: Utilisateur Demo
- Email: demo@example.com
- Statut: Disponible
- Bio: Développeur passionné

## Sécurité

### Validation des données
- Validation des emails
- Validation des numéros de téléphone
- Vérification des champs requis

### Persistance
- Stockage sécurisé dans localStorage
- Synchronisation avec le serveur
- Sauvegarde automatique des modifications

## Extensibilité

### Ajout de nouvelles fonctionnalités
1. Étendre le userStore avec de nouvelles actions
2. Ajouter les API routes correspondantes
3. Mettre à jour le service utilisateur
4. Étendre le hook useUser si nécessaire

### Personnalisation
- Ajout de nouveaux types de préférences
- Extension du système de contacts
- Intégration avec d'autres services

## Prochaines étapes

1. **Intégration avec l'UI existante** : Connecter le userStore aux composants existants
2. **Base de données** : Remplacement des données mockées
3. **Tests unitaires** : Ajout de tests pour le userStore
4. **Documentation** : Documentation complète des API
5. **Optimisation** : Amélioration des performances

## Fichiers créés/modifiés

### Nouveaux fichiers
- `src/app/api/contacts/route.js`
- `src/app/api/contacts/sync/route.js`
- `src/app/api/profile/route.js`
- `src/hooks/useUser.js`
- `src/utils/userService.js`

### Fichiers modifiés
- `src/hooks/index.js` - Ajout de l'export useUser
- `src/utils/index.js` - Ajout de l'export userService
- `src/components/auth/index.js` - Nettoyage des exports

L'intégration du UserStore est maintenant prête et peut être utilisée dans votre application existante.
