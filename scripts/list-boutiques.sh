#!/bin/bash

# Script pour lister toutes les boutiques de Firestore
# Usage: ./scripts/list-boutiques.sh

echo "📊 Liste des boutiques dans Firestore..."
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

# Utiliser Node.js pour lister les boutiques
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'vendoo-67f37'
});

const db = admin.firestore();

async function listBoutiques() {
  try {
    const boutiquesSnapshot = await db.collection('boutiques').get();
    console.log('Total boutiques:', boutiquesSnapshot.size);
    console.log('');
    
    boutiquesSnapshot.docs.forEach(doc => {
      const b = doc.data();
      console.log('ID:', doc.id);
      console.log('Nom:', b.nom);
      console.log('Secteur:', b.secteur);
      console.log('UserId:', b.userId || 'NON');
      console.log('CreatedAt:', b.createdAt ? new Date(b.createdAt._seconds * 1000).toISOString() : 'N/A');
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

listBoutiques();
"
