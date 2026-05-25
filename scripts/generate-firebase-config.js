const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const targetPath = path.join(projectRoot, 'js', 'firebase-config.js');
const envPath = path.join(projectRoot, '.env');

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (!match) return;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

loadDotEnv(envPath);

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
];

function envValue(key) {
  const fallback = key.replace(/^VITE_/, '');
  return process.env[key] || process.env[fallback] || '';
}

const missing = required.filter((key) => !envValue(key));

if (missing.length) {
  console.error('Missing environment variables:');
  missing.forEach((key) => console.error(`- ${key} or ${key.replace(/^VITE_/, '')}`));
  process.exit(1);
}

const config = {
  apiKey: envValue('VITE_FIREBASE_API_KEY'),
  authDomain: envValue('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: envValue('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: envValue('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: envValue('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: envValue('VITE_FIREBASE_APP_ID'),
  measurementId: envValue('VITE_FIREBASE_MEASUREMENT_ID')
};

const output = `// GENERATED FILE - DO NOT EDIT.
// Generated automatically during build.

const firebaseConfig = ${JSON.stringify(config, null, 2)};

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
`;

fs.writeFileSync(targetPath, output, 'utf8');

console.log('✅ Generated js/firebase-config.js');