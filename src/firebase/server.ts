import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { firebaseConfig } from "./config";
import fs from "fs";
import path from "path";

let firebaseApp: App;
let firestore: Firestore;

if (!getApps().length) {
  // ── Estrategia 1: archivo service-account.json en la raíz del proyecto ──
  // Este es el método más confiable en desarrollo local porque evita problemas
  // de codificación al pegar el JSON en variables de entorno.
  const keyFilePath = path.join(process.cwd(), "service-account.json");

  let serviceAccount: any = null;

  if (fs.existsSync(keyFilePath)) {
    serviceAccount = JSON.parse(fs.readFileSync(keyFilePath, "utf8"));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // ── Estrategia 2: variable de entorno (producción / CI) ──
    // El replace convierte los \\n literales que genera .env en saltos de línea reales.
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    if (serviceAccount?.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }
  }

  if (serviceAccount) {
    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
  } else {
    console.warn(
      "Firebase Admin SDK: No se encontró service-account.json ni FIREBASE_SERVICE_ACCOUNT_KEY. " +
      "Usando credenciales por defecto (solo funciona en Google Cloud)."
    );
    firebaseApp = initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
} else {
  firebaseApp = getApp();
}

firestore = getFirestore(firebaseApp);

export { firestore, firebaseApp };
