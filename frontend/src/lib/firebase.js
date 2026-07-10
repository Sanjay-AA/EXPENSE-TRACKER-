// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAQSl1BObJ2DZkucWSX55odR-rWLb89_ns",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "expense-tracker-web-6ab25.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "expense-tracker-web-6ab25",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "expense-tracker-web-6ab25.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "283035274838",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:283035274838:web:06ef08b8457aaef94175f7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1JW96MNMT0"
};

// Initialize Firebase
let app, analytics;
try {
  console.log('Initializing Firebase with config:', firebaseConfig);
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
}

// Initialize Firebase Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);