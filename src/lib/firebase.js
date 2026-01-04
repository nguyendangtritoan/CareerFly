import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase with fallback/mock for development
let app;
let auth;
let googleProvider;
let db;

try {
    // Check if critical keys are present
    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
        throw new Error("Missing Firebase Config");
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
} catch (error) {
    console.warn("Firebase Init Failed (likely missing .env). Using MOCK services to prevent crash.");

    // Simple mocks to prevent app from crashing
    auth = {
        currentUser: null,
        // Mock onAuthStateChanged that returns an unsubscribe function
        onAuthStateChanged: (cb) => {
            cb(null);
            return () => { };
        },
        signOut: async () => console.log('Mock SignOut')
    };

    // Mock Provider
    googleProvider = {};

    // Mock Firestore
    db = {};
}

export { auth, googleProvider, db };
