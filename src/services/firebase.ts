import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAb9HyOrLRqie3xsELIADSpWXQSRuDXWsc",
  authDomain: "vendoo-67f37.firebaseapp.com",
  projectId: "vendoo-67f37",
  storageBucket: "vendoo-67f37.firebasestorage.app",
  messagingSenderId: "151415845463",
  appId: "1:151415845463:web:7c3d69941a3e0974dc2912",
  measurementId: "G-5KCQLZ9SWY"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
