// Importaciones necesarias
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Tu configuración de Firebase (la que te dio la consola)
const firebaseConfig = {
    apiKey: "AIzaSyDjqy3QDeWhHRE2fp5rP-c8Eeq7VK85KAI",
    authDomain: "asamblea-torre.firebaseapp.com",
    databaseURL: "https://asamblea-torre-default-rtdb.firebaseio.com",
    projectId: "asamblea-torre",
    storageBucket: "asamblea-torre.firebasestorage.app",
    messagingSenderId: "719860220634",
    appId: "1:719860220634:web:89702a1a0b75d368ef9be3",
    measurementId: "G-8JT0Y85M54"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
