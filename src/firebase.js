// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);