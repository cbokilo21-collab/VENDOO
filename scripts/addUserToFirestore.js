const admin = require("firebase-admin");

// Use application default credentials from Firebase CLI
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'vendoo-67f37'
});

const db = admin.firestore();

async function addUser() {
  try {
    // Add cbokilo26@gmail.com to users collection
    const userRef = await db.collection('users').add({
      name: 'cbokilo26',
      email: 'cbokilo26@gmail.com',
      userType: 'buyer',
      createdAt: new Date().toISOString(),
    });
    
    console.log('✓ User added successfully with ID:', userRef.id);
    console.log('✓ Email: cbokilo26@gmail.com');
    console.log('✓ UserType: buyer');
    console.log('✓ This user can now receive broadcast messages');
  } catch (error) {
    console.error('✗ Error adding user:', error);
    process.exit(1);
  }
}

addUser();
