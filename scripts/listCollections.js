const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listCollections() {
  try {
    const collections = await db.listCollections();
    console.log('Collections in Firestore:');
    for (const collection of collections) {
      console.log(`- ${collection.id}`);
      const snapshot = await collection.limit(3).get();
      console.log(`  Sample documents: ${snapshot.size}`);
      if (snapshot.size > 0) {
        const doc = snapshot.docs[0];
        console.log(`  Sample data:`, doc.data());
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listCollections();
