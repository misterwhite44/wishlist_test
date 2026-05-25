// GENERATED FILE - DO NOT EDIT.
// Generated automatically during build.

const firebaseConfig = {
  "apiKey": "AIzaSyD1reaUvJD39XEPVv1bBBB9CD_icc1CX7A",
  "authDomain": "wishlist-907be.firebaseapp.com",
  "projectId": "wishlist-907be",
  "storageBucket": "wishlist-907be.firebasestorage.app",
  "messagingSenderId": "961573518397",
  "appId": "1:961573518397:web:7cb1d2ea0bf7c3564d3e54",
  "measurementId": "G-C2Z97D94X2"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
window.db = db;

db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open - offline persistence disabled');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support offline persistence');
    }
  });

console.log('🔥 Firebase initialized');
