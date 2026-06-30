// Script pour supprimer les boutiques démo et anciennes
// Utilise Firebase CLI auth token
// Usage: node scripts/cleanup-boutiques-firebase-cli.js

const https = require('https');
const { execSync } = require('child_process');

// Récupérer le token Firebase CLI
let token;
try {
  token = execSync('firebase login:print-token', { encoding: 'utf-8' }).trim();
} catch (error) {
  console.error('❌ Erreur: Firebase CLI non authentifié');
  console.error('Veuillez exécuter: firebase login');
  process.exit(1);
}

const projectId = 'vendoo-67f37';
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/boutiques`;

// Fonction pour faire une requête HTTP
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function cleanupBoutiques() {
  console.log('🧹 Nettoyage des boutiques démo et anciennes...\n');

  try {
    // Récupérer toutes les boutiques
    console.log('📊 Récupération des boutiques...');
    const response = await makeRequest(baseUrl);
    
    if (!response.documents) {
      console.log('Aucune boutique trouvée');
      return;
    }

    console.log(`📊 ${response.documents.length} boutiques trouvées\n`);

    let deletedCount = 0;
    let skippedCount = 0;

    for (const doc of response.documents) {
      const boutiqueId = doc.name.split('/').pop();
      const fields = doc.fields || {};
      
      const nom = fields.nom?.stringValue || 'Sans nom';
      const userId = fields.userId?.stringValue || '';
      const createdAt = fields.createdAt?.timestampValue;
      
      const isDemo = fields.isDemo?.booleanValue === true || 
                     nom.toLowerCase().includes('demo') ||
                     nom.toLowerCase().includes('test') ||
                     nom.toLowerCase().includes('exemple');
      
      const hasNoUser = !userId;
      
      let isOld = false;
      if (createdAt) {
        const createdDate = new Date(createdAt);
        const daysOld = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        isOld = daysOld > 30;
      }

      const shouldDelete = isDemo || hasNoUser || isOld;

      if (shouldDelete) {
        console.log(`🗑️  Suppression: ${nom} (ID: ${boutiqueId})`);
        console.log(`   Raison: ${isDemo ? 'Démo' : hasNoUser ? 'Pas d\'utilisateur' : 'Ancienne (>30j)'}`);

        // Supprimer les produits associés
        const productsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products`;
        const productsResponse = await makeRequest(productsUrl);
        
        if (productsResponse.documents) {
          const boutiqueProducts = productsResponse.documents.filter(p => 
            p.fields.boutique_id?.stringValue === boutiqueId
          );
          
          console.log(`   - ${boutiqueProducts.length} produits à supprimer`);
          
          for (const product of boutiqueProducts) {
            const productId = product.name.split('/').pop();
            await makeRequest(`${productsUrl}/${productId}`, 'DELETE');
          }
        }

        // Supprimer la boutique
        await makeRequest(`${baseUrl}/${boutiqueId}`, 'DELETE');
        deletedCount++;
      } else {
        console.log(`✅ Conservée: ${nom} (ID: ${boutiqueId})`);
        skippedCount++;
      }
    }

    console.log(`\n✨ Nettoyage terminé!`);
    console.log(`🗑️  ${deletedCount} boutiques supprimées`);
    console.log(`✅ ${skippedCount} boutiques conservées`);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
    process.exit(1);
  }
}

cleanupBoutiques().then(() => {
  console.log('\n🎉 Script terminé avec succès');
  process.exit(0);
});
