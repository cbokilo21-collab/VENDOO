#!/bin/bash

# Script de déploiement des règles Firebase
# Usage: ./deploy-firebase.sh

echo "🔥 Déploiement des règles Firebase..."

# Vérifier si Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé."
    echo "Installez-le avec: npm install -g firebase-tools"
    exit 1
fi

# Déployer les règles Firestore
echo "📝 Déploiement des règles Firestore..."
firebase deploy --only firestore:rules

# Déployer les règles Storage
echo "📁 Déploiement des règles Storage..."
firebase deploy --only storage:rules

echo "✅ Déploiement terminé !"
