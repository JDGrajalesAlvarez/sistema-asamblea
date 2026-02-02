import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
    apiKey: "PEGA_AQUI_TUS_DATOS",
    authDomain: "PEGA_AQUI_TUS_DATOS",
    projectId: "PEGA_AQUI_TUS_DATOS",
    storageBucket: "PEGA_AQUI_TUS_DATOS",
    messagingSenderId: "PEGA_AQUI_TUS_DATOS",
    appId: "PEGA_AQUI_TUS_DATOS"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
