// firebaseconfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Inicializa Firebase solo si no hay apps
const appfirebase = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializa Firestore UNA sola vez con persistencia
let db;
try {
  // Verifica si ya existe Firestore
  db = getFirestore(appfirebase);
} catch {
  // Si no existe, lo inicializa con caché persistente
  db = initializeFirestore(appfirebase, {
    localCache: persistentLocalCache({
      cacheSizeBytes: 100 * 1024 * 1024, // 100 MB
    }),
  });
  console.log("Firestore inicializado con persistencia offline.");
}

// Inicializa Auth
const auth = getAuth(appfirebase);

// Exporta
export { appfirebase, db, auth };
