# 🔐 Configuration de l'Authentification Google

## 📋 Prérequis

1. **Compte Google Cloud Platform** - [console.cloud.google.com](https://console.cloud.google.com)
2. **Projet Google Cloud** avec facturation activée
3. **API Google+ activée**

## 🚀 Étapes de Configuration

### 1. Créer un Projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Cliquez sur "Sélectionner un projet" → "Nouveau projet"
3. Donnez un nom à votre projet (ex: "WhatsApp Clone Auth")
4. Cliquez sur "Créer"

### 2. Activer l'API Google+

1. Dans votre projet, allez dans "APIs et services" → "Bibliothèque"
2. Recherchez "Google+ API" ou "Google Identity"
3. Cliquez sur l'API et cliquez "Activer"

### 3. Créer des Identifiants OAuth 2.0

1. Allez dans "APIs et services" → "Identifiants"
2. Cliquez sur "Créer des identifiants" → "ID client OAuth"
3. Sélectionnez "Application Web"
4. Donnez un nom à votre client OAuth
5. Ajoutez les origines JavaScript autorisées :
   ```
   http://localhost:3000
   http://localhost:3001
   https://votre-domaine.com
   ```
6. Ajoutez les URI de redirection autorisés :
   ```
   http://localhost:3000/auth/callback
   https://votre-domaine.com/auth/callback
   ```
7. Cliquez sur "Créer"

### 4. Configurer les Variables d'Environnement

Créez un fichier `.env.local` à la racine de votre projet :

```bash
# Configuration Google OAuth 2.0
NEXT_PUBLIC_GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com

# URL de redirection autorisée (optionnel)
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Scopes Google (optionnel)
NEXT_PUBLIC_GOOGLE_SCOPES=email profile

# Mode de développement
NODE_ENV=development
```

### 5. Installer les Dépendances

```bash
npm install react-icons
```

## 🔧 Utilisation

### Composant de Base

```jsx
import GoogleAuth from '@/components/GoogleAuth';

export default function LoginPage() {
  return (
    <div>
      <h1>Connexion</h1>
      <GoogleAuth />
    </div>
  );
}
```

### Hook Personnalisé

```jsx
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function UserProfile() {
  const { user, isAuthenticated, logout } = useGoogleAuth();

  if (!isAuthenticated) {
    return <div>Veuillez vous connecter</div>;
  }

  return (
    <div>
      <h2>Bienvenue, {user.name} !</h2>
      <img src={user.picture} alt={user.name} />
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
}
```

## 🎯 Fonctionnalités

### ✅ Connexion Automatique
- Le composant tente d'abord la connexion
- Vérifie les tokens existants
- Persistance des sessions

### 🔄 Enregistrement Automatique
- Si la connexion échoue, lance l'enregistrement
- Gestion intelligente des erreurs
- Fallback transparent pour l'utilisateur

### 🔒 Sécurité
- Validation des tokens avec l'API Google
- Gestion des permissions
- Tokens stockés de manière sécurisée

### 📱 Interface
- Design responsive
- États de chargement
- Gestion des erreurs
- Interface Google native

## 🚨 Dépannage

### Erreur "popup_closed_by_user"
- L'utilisateur a fermé la fenêtre de connexion
- Le composant gère automatiquement cette erreur

### Erreur "access_denied"
- L'utilisateur a refusé les permissions
- Vérifiez les scopes demandés

### Problème de CORS
- Vérifiez les origines autorisées dans Google Cloud Console
- Assurez-vous que votre domaine est correctement configuré

### Token invalide
- Le composant supprime automatiquement les tokens invalides
- L'utilisateur sera invité à se reconnecter

## 📚 API Référence

### Événements Émis

```javascript
// Connexion réussie
window.addEventListener('google-auth-success', (event) => {
  const { user, type } = event.detail;
  console.log('Authentification réussie:', type, user);
});

// Déconnexion
window.addEventListener('google-auth-logout', () => {
  console.log('Utilisateur déconnecté');
});

// Erreur d'authentification
window.addEventListener('google-auth-error', (event) => {
  console.error('Erreur:', event.detail.error);
});
```

### Méthodes du Hook

```javascript
const {
  user,              // Données utilisateur
  isAuthenticated,   // Statut d'authentification
  isLoading,         // État de chargement
  error,             // Erreur éventuelle
  logout,            // Fonction de déconnexion
  refreshUserInfo,   // Rafraîchir les infos
  hasPermission,     // Vérifier les permissions
  getUserInfo        // Obtenir les infos de base
} = useGoogleAuth();
```

## 🌟 Exemples Avancés

### Intégration avec le Contexte

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext } from 'react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = useGoogleAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Protection des Routes

```jsx
// src/components/ProtectedRoute.jsx
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Chargement...</div>;
  if (!isAuthenticated) return null;

  return children;
}
```

## 🔐 Bonnes Pratiques

1. **Toujours vérifier l'authentification** avant d'accéder aux données sensibles
2. **Gérer les erreurs** de manière gracieuse
3. **Implémenter la déconnexion** sur tous les appareils si nécessaire
4. **Valider les tokens** régulièrement
5. **Utiliser HTTPS** en production
6. **Limiter les scopes** aux permissions nécessaires

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la console du navigateur pour les erreurs
2. Consultez la documentation Google OAuth
3. Vérifiez votre configuration Google Cloud Console
4. Testez avec un compte Google de développement

---

**Note :** Ce composant est conçu pour fonctionner avec Next.js et Electron. Assurez-vous que votre environnement est correctement configuré.
