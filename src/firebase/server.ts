import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { firebaseConfig } from "./config";

let firebaseApp: App;
let firestore: Firestore;

if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (serviceAccount) {
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
  } else {
    console.warn(
      "Firebase Admin SDK: Service account not found. Using default credentials. This is expected for local development but may fail in production if not configured properly."
    );
    // Fallback for environments like Google Cloud Run with default credentials
    firebaseApp = initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
} else {
  firebaseApp = getApp();
}

firestore = getFirestore(firebaseApp);


export { firestore, firebaseApp };
