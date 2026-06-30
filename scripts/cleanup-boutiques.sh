#!/bin/bash

# Script pour supprimer les boutiques démo et anciennes de Firestore
# Utilise Firebase CLI
# Usage: ./scripts/cleanup-boutiques.sh

echo "🧹 Nettoyage des boutiques démo et anciennes..."
echo ""

# Vérifier si Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé"
    echo "Installez-le avec: npm install -g firebase-tools"
    exit 1
fi

# Vérifier si authentifié
if ! firebase login --no-localhost &> /dev/null; then
    echo "❌ Firebase CLI n'est pas authentifié"
    echo "Authentifiez-vous avec: firebase login"
    exit 1
fi

# Récupérer toutes les boutiques
echo "📊 Récupération des boutiques..."
firebase firestore:delete --project vendoo-67f37 --recursive boutiques --shallow
