import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { firebaseConfig } from "./config";

let firebaseApp: App | undefined;
let firestore: Firestore | undefined;

try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (getApps().length === 0) {
    if (serviceAccount) {
      firebaseApp = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
      });
    } else {
      console.warn(
        "Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set. Admin features will be disabled. This is normal for client-side development but will cause errors in production server-side rendering."
      );
      // Fallback for environments like Google Cloud Run with default credentials
      firebaseApp = initializeApp({ projectId: firebaseConfig.projectId });
    }
  } else {
    firebaseApp = getApp();
  }

  if (firebaseApp) {
    firestore = getFirestore(firebaseApp);
  }

} catch (error) {
  console.error("Firebase Admin SDK initialization failed:", error);
  // Ensure firestore remains undefined if initialization fails
  firestore = undefined;
}


export { firestore, firebaseApp };
