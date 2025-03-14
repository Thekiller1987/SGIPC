import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
    apiKey: "AIzaSyDbiMjzg2LkxP072A6YH-gxu90Ljv-slKY",
    authDomain: "obratitan-d3da9.firebaseapp.com",
    projectId: "obratitan-d3da9",
    storageBucket: "obratitan-d3da9.firebasestorage.app",
    messagingSenderId: "893767644955",
    appId: "1:893767644955:web:d2611705f8f092a10505be",
    measurementId: "G-BRS4T56EE2"
};

// Inicializa Firebase
const appfirebase = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(appfirebase);

// Inicializa Authentication
const auth = getAuth(appfirebase);

export { appfirebase, db, auth };