#!/bin/bash

# Script pour supprimer les boutiques démo et anciennes de Firestore
# Utilise Firebase CLI (déjà authentifié)
# Usage: ./scripts/cleanup-boutiques-firebase-cli.sh

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

# Lister toutes les boutiques
echo "📊 Récupération des boutiques..."
firebase firestore:read --project vendoo-67f37 boutiques --format json > /tmp/boutiques.json 2>/dev/null

if [ ! -s /tmp/boutiques.json ]; then
    echo "⚠️  Aucune boutique trouvée ou erreur de lecture"
    echo "Vérification manuelle..."
    firebase firestore:read --project vendoo-67f37 boutiques
    exit 0
fi

# Compter les boutiques
TOTAL=$(cat /tmp/boutiques.json | jq 'length' 2>/dev/null || echo "0")
echo "📊 $TOTAL boutiques trouvées"
echo ""

# Pour chaque boutique, vérifier si elle doit être supprimée
# Note: Cette approche nécessite jq pour traiter le JSON
if command -v jq &> /dev/null; then
    echo "Traitement des boutiques..."
    cat /tmp/boutiques.json | jq -c '.[]' | while read -r boutique; do
        ID=$(echo "$boutique" | jq -r '._id')
        NOM=$(echo "$boutique" | jq -r '.nom // "Sans nom"')
        USER_ID=$(echo "$boutique" | jq -r '.userId // ""')
        CREATED_AT=$(echo "$boutique" | jq -r '.createdAt // ""')
        IS_DEMO=$(echo "$boutique" | jq -r '.isDemo // false')
        
        # Vérifier si c'est une démo
        IS_DEMO_NAME=$(echo "$NOM" | grep -iE 'demo|test|exemple' || echo "")
        
        if [ "$IS_DEMO" = "true" ] || [ -n "$IS_DEMO_NAME" ] || [ -z "$USER_ID" ]; then
            echo "🗑️  Suppression: $NOM (ID: $ID)"
            firebase firestore:delete --project vendoo-67f37 boutiques/$ID
        else
            echo "✅ Conservée: $NOM (ID: $ID)"
        fi
    done
else
    echo "⚠️  jq n'est pas installé. Installation: brew install jq (macOS) ou apt install jq (Linux)"
    echo "Affichage des boutiques pour suppression manuelle:"
    cat /tmp/boutiques.json
fi

# Nettoyer
rm -f /tmp/boutiques.json

echo ""
echo "✨ Nettoyage terminé!"
