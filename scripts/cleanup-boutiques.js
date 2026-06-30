// Script pour supprimer les boutiques démo et anciennes de Firestore
// Usage: node scripts/cleanup-boutiques.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Charger les credentials Firebase depuis le fichier local si disponible
let serviceAccount;
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = require(serviceAccountPath);
} else {
  console.error('Erreur: Fichier firebase-service-account.json non trouvé');
  console.error('Veuillez télécharger le fichier depuis Firebase Console et le placer dans le répertoire racine');
  process.exit(1);
}

// Initialiser Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

async function cleanupBoutiques() {
  console.log('🧹 Nettoyage des boutiques démo et anciennes...\n');

  try {
    // Récupérer toutes les boutiques
    const boutiquesSnapshot = await db.collection('boutiques').get();
    console.log(`📊 ${boutiquesSnapshot.size} boutiques trouvées dans Firestore\n`);

    let deletedCount = 0;
    let skippedCount = 0;

    for (const doc of boutiquesSnapshot.docs) {
      const boutique = doc.data();
      const boutiqueId = doc.id;

      // Critères pour identifier les boutiques à supprimer:
      // 1. Boutiques avec userId vide ou null
      // 2. Boutiques marquées comme démo
      // 3. Boutiques créées il y a plus de 30 jours par des utilisateurs non vérifiés
      // 4. Boutiques avec des noms de démo évidents

      const isDemo = boutique.isDemo === true || 
                     boutique.nom?.toLowerCase().includes('demo') ||
                     boutique.nom?.toLowerCase().includes('test') ||
                     boutique.nom?.toLowerCase().includes('exemple');
      
      const hasNoUser = !boutique.userId || boutique.userId === '';
      
      // Vérifier l'âge de la boutique (plus de 30 jours)
      let isOld = false;
      if (boutique.createdAt) {
        const createdAt = boutique.createdAt.toDate ? boutique.createdAt.toDate() : new Date(boutique.createdAt);
        const daysOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        isOld = daysOld > 30;
      }

      const shouldDelete = isDemo || hasNoUser || isOld;

      if (shouldDelete) {
        console.log(`🗑️  Suppression: ${boutique.nom} (ID: ${boutiqueId})`);
        console.log(`   Raison: ${isDemo ? 'Démo' : hasNoUser ? 'Pas d\'utilisateur' : 'Ancienne (>30j)'}`);

        // Supprimer les produits associés
        const productsSnapshot = await db.collection('products')
          .where('boutique_id', '==', boutiqueId)
          .get();
        
        console.log(`   - ${productsSnapshot.size} produits à supprimer`);
        const deleteProductsPromises = productsSnapshot.docs.map(p => p.ref.delete());
        await Promise.all(deleteProductsPromises);

        // Supprimer la boutique
        await doc.ref.delete();
        deletedCount++;
      } else {
        console.log(`✅ Conservée: ${boutique.nom} (ID: ${boutiqueId})`);
        skippedCount++;
      }
    }

    console.log(`\n✨ Nettoyage terminé!`);
    console.log(`🗑️  ${deletedCount} boutiques supprimées`);
    console.log(`✅ ${skippedCount} boutiques conservées`);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

// Exécuter le nettoyage
cleanupBoutiques().then(() => {
  console.log('\n🎉 Script terminé avec succès');
  process.exit(0);
});
