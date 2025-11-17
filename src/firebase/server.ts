import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { firebaseConfig } from "./config";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let firebaseApp: App;
let firestore: Firestore;

if (!getApps().length) {
  if (serviceAccount) {
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not set, fallback to projectId.");
    firebaseApp = initializeApp({ projectId: firebaseConfig.projectId });
  }
} else {
  firebaseApp = getApp();
}

firestore = getFirestore(firebaseApp);

export { firestore, firebaseApp };
