# Intégration de l'AuthStore

## Vue d'ensemble

L'intégration de l'AuthStore est maintenant complète avec une architecture backend/frontend bien structurée. Cette intégration permet une gestion complète de l'authentification sans modifier l'UI existante.

## Architecture

### 1. Store Zustand (authStore.js)
- **Localisation** : `src/stores/authStore.js`
- **Fonctionnalités** :
  - Gestion de l'état d'authentification
  - Persistance locale avec localStorage
  - Actions pour login, logout, refresh token
  - Gestion des erreurs et du chargement

### 2. API Routes Next.js
- **Login** : `/api/auth/login` - Authentification avec email/mot de passe
- **Google** : `/api/auth/google` - Authentification Google
- **Refresh** : `/api/auth/refresh` - Rafraîchissement des tokens
- **Verify** : `/api/auth/verify` - Vérification des tokens

### 3. Hook personnalisé (useAuth.js)
- **Localisation** : `src/hooks/useAuth.js`
- **Fonctionnalités** :
  - Encapsulation de la logique de l'authStore
  - Vérification automatique du statut d'authentification
  - Gestion des intervalles de rafraîchissement des tokens

### 4. Service d'authentification (authService.js)
- **Localisation** : `src/utils/authService.js`
- **Fonctionnalités** :
  - Centralisation des appels API
  - Gestion des erreurs HTTP
  - Utilitaires pour les tokens

## Utilisation

### Dans un composant React

```jsx
import { useAuth } from '../hooks/useAuth';

const MonComposant = () => {
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout,
    clearError
  } = useAuth();

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      console.log('Connexion réussie');
    } else {
      console.error('Erreur:', result.error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bienvenue, {user.name}!</p>
          <button onClick={logout}>Se déconnecter</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          {/* Formulaire de connexion */}
        </form>
      )}
    </div>
  );
};
```

### Accès direct au store

```jsx
import { useAuthStore } from '../stores/authStore';

const MonComposant = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  return (
    <div>
      {isAuthenticated && <p>Utilisateur connecté: {user.name}</p>}
    </div>
  );
};
```

## Fonctionnalités

### Authentification locale
- Connexion avec email/mot de passe
- Validation des credentials
- Génération de tokens d'accès et de rafraîchissement

### Authentification Google
- Intégration avec l'API Google
- Gestion des tokens Google
- Profil utilisateur Google

### Gestion des tokens
- Vérification automatique de l'expiration
- Rafraîchissement automatique des tokens
- Persistance sécurisée dans localStorage

### Gestion des erreurs
- Messages d'erreur localisés
- Gestion des erreurs réseau
- Nettoyage automatique des erreurs

## Test de l'intégration

### Page de test
- **URL** : `/test-stores`
- **Composant** : `AuthTest`
- **Fonctionnalités** :
  - Test de connexion locale
  - Test de connexion Google
  - Affichage de l'état d'authentification
  - Gestion des erreurs

### Données de test
- **Email** : `demo@example.com`
- **Mot de passe** : `password123`

## Sécurité

### Tokens
- Tokens d'accès avec expiration (1 heure)
- Tokens de rafraîchissement sécurisés
- Validation côté serveur

### Stockage
- Persistance dans localStorage
- Chiffrement optionnel disponible
- Nettoyage automatique lors de la déconnexion

## Extensibilité

### Ajout de nouveaux providers
1. Créer une nouvelle API route
2. Ajouter la méthode dans authService.js
3. Étendre l'authStore si nécessaire
4. Mettre à jour le hook useAuth

### Personnalisation
- Modification des durées d'expiration
- Ajout de validations personnalisées
- Intégration avec d'autres services

## Prochaines étapes

1. **Intégration avec l'UI existante** : Connecter l'authStore aux composants existants
2. **Sécurité renforcée** : Implémentation de JWT réels
3. **Base de données** : Remplacement des données mockées
4. **Tests unitaires** : Ajout de tests pour l'authStore
5. **Documentation** : Documentation complète des API

## Fichiers créés/modifiés

### Nouveaux fichiers
- `src/app/api/auth/login/route.js`
- `src/app/api/auth/google/route.js`
- `src/app/api/auth/refresh/route.js`
- `src/app/api/auth/verify/route.js`
- `src/hooks/useAuth.js`
- `src/utils/authService.js`
- `src/components/auth/AuthTest.jsx`
- `src/app/test-stores/page.js`

### Fichiers modifiés
- `src/hooks/index.js` - Ajout de l'export useAuth
- `src/utils/index.js` - Ajout de l'export authService
- `src/components/auth/index.js` - Ajout de l'export AuthTest

L'intégration est maintenant prête et peut être testée via la page `/test-stores`.
