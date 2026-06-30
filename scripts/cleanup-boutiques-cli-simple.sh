#!/bin/bash

# Script pour supprimer les boutiques démo et anciennes de Firestore
# Utilise Firebase CLI
# Usage: ./scripts/cleanup-boutiques-cli-simple.sh

echo "🧹 Nettoyage des boutiques démo et anciennes..."
echo ""

# Vérifier si Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé"
    echo "Installez-le avec: npm install -g firebase-tools"
    exit 1
fi

# Vérifier si authentifié
if ! firebase projects:list &> /dev/null; then
    echo "❌ Firebase CLI n'est pas authentifié"
    echo "Authentifiez-vous avec: firebase login"
    exit 1
fi

# Récupérer toutes les boutiques en JSON
echo "📊 Récupération des boutiques..."
firebase firestore:delete --project vendoo-67f37 boutiques --recursive --yes

echo ""
echo "✨ Toutes les boutiques ont été supprimées"
echo "⚠️  Cette action a supprimé TOUTES les boutiques, y compris les vraies"
echo "   Vous devrez recréer vos boutiques manuellement"
