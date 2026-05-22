// ── Firebase Configuration ──────────────────────────────────────────────────
// ⚠️ IMPORTANT: Replace with your own Firebase credentials from
// https://console.firebase.google.com → Your Project → Project Settings → Web

const firebaseConfig = {
  apiKey: "AIzaSyD1reaUvJD39XEPVv1bBBB9CD_icc1CX7A",
  authDomain: "wishlist-907be.firebaseapp.com",
  projectId: "wishlist-907be",
  storageBucket: "wishlist-907be.firebasestorage.app",
  messagingSenderId: "961573518397",
  appId: "1:961573518397:web:7cb1d2ea0bf7c3564d3e54",
  measurementId: "G-C2Z97D94X2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firestore reference
const db = firebase.firestore();

// Optional: Enable offline persistence (recommended)
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open - offline persistence disabled');
    } else if (err.code == 'unimplemented') {
      console.warn('Browser does not support offline persistence');
    }
  });

// Initialize auth anonymously (optional - for tracking)
firebase.auth().signInAnonymously()
  .catch((error) => console.warn('Anonymous auth failed:', error));

console.log('🔥 Firebase initialized');
