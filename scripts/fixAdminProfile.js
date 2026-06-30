// Script pour forcer le profil admin
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixAdminProfile() {
  try {
    // Trouver l'utilisateur par email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', 'cbokilo18@gmail.com')
      .get();
    
    if (usersSnapshot.empty) {
      console.log('Utilisateur non trouvé, création du profil admin...');
      await db.collection('users').add({
        name: 'Cyril Bokilo',
        email: 'cbokilo18@gmail.com',
        userType: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('Profil admin créé avec succès');
    } else {
      const doc = usersSnapshot.docs[0];
      console.log('Utilisateur trouvé, mise à jour du profil...');
      await doc.ref.update({
        userType: 'admin',
        name: 'Cyril Bokilo',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('Profil mis à jour avec succès');
    }
    
    console.log('Terminé! Veuillez vous déconnecter et vous reconnecter.');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

fixAdminProfile();
