import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
    getFirestore
} from "firebase/firestore";

// Configuración de Firebase desde tus variables de entorno
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Inicializa Firebase
const appfirebase = initializeApp(firebaseConfig);

// Inicializa Firestore con persistencia offline
let db;
try {
    db = initializeFirestore(appfirebase, {
        localCache: persistentLocalCache({

            cacheSizeBytes: 100 * 1024 * 1024, 
        }),
    });
    console.log("Firestore inicializado con persistencia offline.");
} catch (error) {

    console.error("Error al inicializar Firestore con persistencia:", error);
    db = getFirestore(appfirebase); // Fallback sin persistencia

    console.error("Error al activar persistencia:", error);
    db = initializeFirestore(appfirebase, {});

}

// Inicializa la autenticación
const auth = getAuth(appfirebase);

export { appfirebase, db, auth };
