# WhatsApp Clone Desktop

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111111)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Un clone de WhatsApp Desktop créé avec Next.js, Tailwind CSS et React. Cette application reproduit fidèlement l'interface utilisateur de WhatsApp Web avec une expérience utilisateur moderne et responsive.

## 🚀 Fonctionnalités

- **Interface fidèle** : Reproduction exacte de l'interface WhatsApp Desktop
- **Liste des conversations** : Affichage des chats avec recherche et filtrage
- **En-tête de conversation** : Profil du contact avec boutons d'action
- **Zone de messages** : Interface pour afficher les conversations
- **Zone de saisie** : Envoi de messages avec support des emojis et pièces jointes
- **Design responsive** : Interface adaptée à différentes tailles d'écran
- **Thème sombre** : Interface moderne avec thème sombre par défaut

## 🛠️ Technologies utilisées

- **Next.js 15** - Framework React avec App Router
- **React 18** - Bibliothèque UI
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes modernes
- **JavaScript/JSX** - Langage de programmation

## 📁 Structure du projet

```
src/
├── app/
│   ├── globals.css          # Styles globaux
│   ├── layout.js           # Layout principal
│   └── page.js             # Page d'accueil
├── components/
│   ├── WhatsApp.jsx        # Composant principal
│   ├── Titlebar.jsx        # Barre de titre
│   ├── ChatList.jsx        # Liste des conversations
│   ├── ChatHeader.jsx      # En-tête de conversation
│   ├── ChatBody.jsx        # Zone des messages
│   └── ChatFooter.jsx      # Zone de saisie
└── ...
```

## 🎨 Composants principaux

### Titlebar
Barre de titre avec logo WhatsApp et boutons de contrôle de fenêtre (minimiser, maximiser, fermer).

### ChatList
Liste des conversations avec :
- Recherche en temps réel
- Filtrage des chats
- Indicateurs de statut (en ligne, messages non lus)
- Avatars et informations de contact

### ChatHeader
En-tête de conversation avec :
- Profil du contact sélectionné
- Statut de connexion
- Boutons d'action (appel vidéo, appel vocal, recherche)

### ChatBody
Zone d'affichage des messages avec :
- Interface vide par défaut
- Support pour l'affichage futur des messages
- Design responsive

### ChatFooter
Zone de saisie avec :
- Champ de saisie de message
- Boutons d'action (emoji, pièce jointe, envoi)
- Support des raccourcis clavier (Entrée pour envoyer)

## 🚀 Installation et démarrage

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd whatsapp-clone
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## 🎯 Fonctionnalités à venir

- [ ] Système de messagerie en temps réel
- [ ] Support des emojis et réactions
- [ ] Envoi de fichiers et médias
- [ ] Appels audio et vidéo
- [ ] Notifications push
- [ ] Mode hors ligne
- [ ] Sauvegarde des conversations
- [ ] Thèmes personnalisables

## 🎨 Personnalisation

### Couleurs WhatsApp
Le projet utilise une palette de couleurs personnalisée dans `tailwind.config.js` :

```javascript
colors: {
  whatsapp: {
    primary: '#00a884',      // Vert WhatsApp
    secondary: '#667781',    // Gris secondaire
    dark: {                  // Palette de gris sombres
      50: '#f7f7f8',
      // ...
      950: '#121212',
    },
    chat: {                  // Couleurs spécifiques au chat
      bg: '#2C2C2C',
      header: '#1e1e1e',
      input: '#2a2a2a',
      search: '#3D3D3D',
    }
  }
}
```

### Police
Utilisation de la police Segoe UI pour une authenticité maximale avec l'interface Windows.

## 📱 Responsive Design

L'application est conçue pour fonctionner sur :
- **Desktop** : Interface complète avec sidebar et zone de chat
- **Tablet** : Adaptation responsive pour écrans moyens
- **Mobile** : Interface optimisée pour petits écrans

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **WhatsApp** pour l'inspiration de l'interface
- **Next.js** pour le framework React
- **Tailwind CSS** pour le système de design
- **Lucide** pour les icônes modernes

---

**Note** : Ce projet est un clone éducatif et n'est pas affilié à WhatsApp ou Meta. Il est créé à des fins d'apprentissage et de démonstration.
