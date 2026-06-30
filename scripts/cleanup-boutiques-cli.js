// Script pour supprimer les boutiques démo et anciennes de Firestore
// Utilise Firebase CLI authentifié localement
// Usage: node scripts/cleanup-boutiques-cli.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Vérifier si Firebase CLI est installé et authentifié
try {
  execSync('firebase login --no-localhost', { stdio: 'inherit' });
} catch (error) {
  console.log('Firebase CLI non authentifié ou non installé');
  console.log('Veuillez installer Firebase CLI: npm install -g firebase-tools');
  console.log('Puis authentifiez-vous: firebase login');
  process.exit(1);
}

// Créer un script temporaire Node.js pour Firestore
const scriptContent = `
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Utiliser les credentials de Firebase CLI
const app = initializeApp({
  projectId: 'vendoo-67f37'
});

const db = getFirestore(app);

async function cleanupBoutiques() {
  console.log('🧹 Nettoyage des boutiques démo et anciennes...\\n');

  try {
    const boutiquesSnapshot = await db.collection('boutiques').get();
    console.log(\`📊 \${boutiquesSnapshot.size} boutiques trouvées dans Firestore\\n\`);

    let deletedCount = 0;
    let skippedCount = 0;

    for (const doc of boutiquesSnapshot.docs) {
      const boutique = doc.data();
      const boutiqueId = doc.id;

      const isDemo = boutique.isDemo === true || 
                     boutique.nom?.toLowerCase().includes('demo') ||
                     boutique.nom?.toLowerCase().includes('test') ||
                     boutique.nom?.toLowerCase().includes('exemple');
      
      const hasNoUser = !boutique.userId || boutique.userId === '';
      
      let isOld = false;
      if (boutique.createdAt) {
        const createdAt = boutique.createdAt.toDate ? boutique.createdAt.toDate() : new Date(boutique.createdAt);
        const daysOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        isOld = daysOld > 30;
      }

      const shouldDelete = isDemo || hasNoUser || isOld;

      if (shouldDelete) {
        console.log(\`🗑️  Suppression: \${boutique.nom} (ID: \${boutiqueId})\`);
        console.log(\`   Raison: \${isDemo ? 'Démo' : hasNoUser ? 'Pas d\\'utilisateur' : 'Ancienne (>30j)'}\`);

        const productsSnapshot = await db.collection('products')
          .where('boutique_id', '==', boutiqueId)
          .get();
        
        console.log(\`   - \${productsSnapshot.size} produits à supprimer\`);
        const deleteProductsPromises = productsSnapshot.docs.map(p => p.ref.delete());
        await Promise.all(deleteProductsPromises);

        await doc.ref.delete();
        deletedCount++;
      } else {
        console.log(\`✅ Conservée: \${boutique.nom} (ID: \${boutiqueId})\`);
        skippedCount++;
      }
    }

    console.log(\`\\n✨ Nettoyage terminé!\`);
    console.log(\`🗑️  \${deletedCount} boutiques supprimées\`);
    console.log(\`✅ \${skippedCount} boutiques conservées\`);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

cleanupBoutiques().then(() => {
  console.log('\\n🎉 Script terminé avec succès');
  process.exit(0);
});
`;

const tempScriptPath = path.join(__dirname, 'temp-cleanup.js');
fs.writeFileSync(tempScriptPath, scriptContent);

console.log('Exécution du script de nettoyage...\n');

try {
  execSync(`node ${tempScriptPath}`, { stdio: 'inherit' });
  fs.unlinkSync(tempScriptPath);
} catch (error) {
  console.error('Erreur lors de l\'exécution:', error);
  fs.unlinkSync(tempScriptPath);
  process.exit(1);
}
