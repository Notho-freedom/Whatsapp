#!/bin/bash

# Script de déploiement Firebase pour WhatsApp Clone

set -e

echo "🚀 Démarrage du déploiement Firebase..."

# Vérifier que Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé. Installation..."
    npm install -g firebase-tools
fi

# Vérifier l'authentification Firebase
echo "🔐 Vérification de l'authentification Firebase..."
firebase login:ci --no-localhost || firebase login

# Build de l'application Next.js
echo "🔨 Build de l'application..."
npm run build

# Export statique pour Firebase Hosting
echo "📦 Export statique..."
npm run export

# Déployer les règles de sécurité
echo "🔒 Déploiement des règles de sécurité..."
firebase deploy --only firestore:rules,storage:rules

# Déployer les indexes Firestore
echo "📊 Déploiement des indexes Firestore..."
firebase deploy --only firestore:indexes

# Installer les dépendances des Cloud Functions
echo "☁️ Installation des dépendances Cloud Functions..."
cd functions
npm install
cd ..

# Déployer les Cloud Functions
echo "⚡ Déploiement des Cloud Functions..."
firebase deploy --only functions

# Déployer l'hébergement
echo "🌐 Déploiement de l'application..."
firebase deploy --only hosting

echo "✅ Déploiement terminé avec succès!"
echo "🔗 Votre application est disponible sur: https://elite-5b171.web.app"

# Afficher les URLs importantes
echo ""
echo "📋 URLs importantes:"
echo "- Application: https://elite-5b171.web.app"
echo "- Console Firebase: https://console.firebase.google.com/project/elite-5b171"
echo "- Firestore: https://console.firebase.google.com/project/elite-5b171/firestore"
echo "- Storage: https://console.firebase.google.com/project/elite-5b171/storage"