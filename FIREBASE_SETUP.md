# Firebase Firestore Setup Guide

## Overview
Your BuyList app now uses **Firebase Firestore** for cloud data storage. All users see and modify the **same data** in real-time.

---

## Step 1: Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Enter project name: `buylist` (or any name)
4. Accept terms, click **Continue**
5. Disable Google Analytics (optional), click **Create project**
6. Wait for project creation (~1 minute)

---

## Step 2: Get Firebase Credentials

1. In Firebase console, go to **Project Settings** (⚙️ icon, top-right)
2. Under **Your apps**, click **Add app** → **Web** (</> icon)
3. Enter app name: `BuyList` (or any name)
4. Check ☑️ "Also set up Firebase hosting" (optional)
5. Click **Register app**
6. You'll see a code block with credentials. Copy the `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD1reaUvJD39XEPVv1bBBB9CD_icc1CX7A",
  authDomain: "wishlist-907be.firebaseapp.com",
  projectId: "wishlist-907be",
  storageBucket: "wishlist-907be.firebasestorage.app",
  messagingSenderId: "961573518397",
  appId: "1:961573518397:web:7cb1d2ea0bf7c3564d3e54",
  measurementId: "G-C2Z97D94X2"
};
```

---

## Step 3: Update Firebase Config File

1. Open `js/firebase-config.js` in your editor
2. Replace the placeholder credentials with your actual values from Step 2
3. Save the file

**Example:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxyz123456789abc_defghijk",
  authDomain: "buylist.firebaseapp.com",
  projectId: "buylist",
  storageBucket: "buylist.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

---

## Step 4: Create Firestore Collection & Security Rules

1. In Firebase console, go to **Firestore Database** (left sidebar)
2. Click **Create database**
3. Choose location: pick closest to you (e.g., Europe: `eur3`)
4. Start in **Test mode** (allows read/write for now)
5. Click **Create**

### Set Security Rules (IMPORTANT)

1. Go to **Firestore Database** → **Rules** tab
2. Replace the current rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /state/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**

---

## Step 5: Initialize Firestore Collection

1. Go back to **Firestore Database** → **Data** tab
2. Click **Start collection**
3. Collection ID: `state`
4. Document ID: `main`
5. Click **Auto ID** if needed, or manually enter `main`
6. Add field (click **Add field**):
   - Field: `categories`
   - Type: `array`
   - Click **Add**
7. Add another field:
   - Field: `items`
   - Type: `array`
   - Click **Add**
8. Click **Save**

**Note:** The actual data will be populated automatically when your app first loads.

---

## Step 6: Test Locally

1. Open your app in browser (e.g., `file://path/to/index.html` or `localhost:3000` if using a local server)
2. Open **Browser DevTools** → **Console**
3. You should see logs like:
   ```
   🔥 Firebase initialized
   📚 Loaded data from Firestore
   ✨ App initialized with data
   ```

4. If you see errors, check:
   - Are credentials correct in `js/firebase-config.js`?
   - Is Firestore database created?
   - Are security rules published?

---

## Step 7: Verify Real-Time Sync

1. Open your app in **Browser Tab 1**
2. Open your app in **Browser Tab 2** (same or different device)
3. In **Tab 1**: Click an item to check it
4. In **Tab 2**: The item should auto-update (no refresh needed)
5. In **Tab 1**: Add a new item
6. In **Tab 2**: New item appears instantly

---

## Step 8: Deploy to Vercel

Your frontend is already on Vercel. Just make sure:

1. `js/firebase-config.js` is in your repo with **real** credentials
2. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: Add Firebase Firestore integration"
   git push
   ```
3. Vercel auto-deploys
4. Test production at your Vercel domain

---

## Security Notes (⚠️ Important)

### Current Setup (Development)
- ✅ All users can read/write data
- ✅ Good for testing and collaboration

### For Production
Consider:
1. **Restrict public access** — require authentication
2. **Backup** — enable Firestore automatic backups
3. **Security rules** — use more restrictive policies
4. **API keys** — rotate and restrict API key permissions

Example restrictive rule (requires login):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /state/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `firebase is not defined` | Firebase SDK not loaded in index.html. Check CDN link. |
| `Missing or insufficient permissions` | Security rules issue. Publish the rules provided above. |
| `PERMISSION_DENIED` | Check Firestore database location and rules. |
| `Offline data not syncing` | Normal. Firestore caches locally. Refresh to sync when online. |
| `Cannot read properties of null (reading 'items')` | State not initialized. Check console for init errors. |

---

## Monitoring

Monitor your app health:

1. **Firebase Console** → **Firestore Database** → **Usage**
   - See read/write operations and storage used
2. **Firebase Console** → **Performance** (optional)
   - Track real-time latency
3. **Vercel Dashboard**
   - Track frontend performance

---

## Next Steps

- ✅ Implement real-time item sync between users
- 🔄 Add authentication (optional)
- 📱 Test on mobile devices
- 🎯 Share link with friends to test collaboration

**Questions?** Check browser console (`F12` → Console tab) for detailed error messages.
