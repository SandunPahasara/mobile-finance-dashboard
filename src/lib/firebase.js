// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCxv8BOTZhAPU0WWf83-cHnkMmcxhWOlfQ",
    authDomain: "finance-dashboard-app-2e4d3.firebaseapp.com",
    projectId: "finance-dashboard-app-2e4d3",
    storageBucket: "finance-dashboard-app-2e4d3.firebasestorage.app",
    messagingSenderId: "710230027800",
    appId: "1:710230027800:web:b958c1bda10f2f978fdd6d",
    measurementId: "G-V21EQ7M0DS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
