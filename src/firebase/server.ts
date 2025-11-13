import { initializeApp, getApps, getApp, type FirebaseApp, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY this file.
// This file is used to initialize the Firebase Admin SDK on the server side.
// It is essential for server-side rendering and server-side data fetching.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let firebaseApp: FirebaseApp;
let firestore: Firestore;

if (!getApps().length) {
    if (serviceAccount) {
         firebaseApp = initializeApp({
            credential: cert(serviceAccount),
            databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
        });
    } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not set, initializing with default settings. This may not work in all environments.");
        firebaseApp = initializeApp({ projectId: firebaseConfig.projectId });
    }
} else {
  firebaseApp = getApp();
}

firestore = getFirestore(firebaseApp);

export { firestore, firebaseApp };
