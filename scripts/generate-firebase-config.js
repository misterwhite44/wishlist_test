const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const targetPath = path.join(projectRoot, 'js', 'firebase-config.js');

if (!fs.existsSync(envPath)) {
  console.error('Missing .env file. Create one from .env.example');
  process.exit(1);
}

const raw = fs.readFileSync(envPath, 'utf8');
const env = raw.split(/\r?\n/).reduce((acc, line) => {
  const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
  if (!match) return acc;
  const key = match[1];
  let value = match[2] || '';
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  acc[key] = value;
  return acc;
}, {});

const required = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_MEASUREMENT_ID'
];

const missing = required.filter((key) => !env[key]);
if (missing.length) {
  console.error('Missing required .env values:', missing.join(', '));
  process.exit(1);
}

const config = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID
};

const output = `// GENERATED FILE - DO NOT EDIT.
// This file is generated from .env by running \`npm run build\`.

const firebaseConfig = ${JSON.stringify(config, null, 2)};

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

// Anonymous auth is not required for the current Firestore security rules.
// Remove or enable it later only if you add auth-based rules.
// firebase.auth().signInAnonymously()
//   .catch((error) => console.warn('Anonymous auth failed:', error));

console.log('🔥 Firebase initialized');
`;

fs.writeFileSync(targetPath, output, 'utf8');
console.log('✅ Generated js/firebase-config.js from .env');
