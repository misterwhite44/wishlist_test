// ── Central data store ──────────────────────────────────────────────────────

const DEFAULT_DATA = {
  budgetLimit: 0,
  categories: [],
  items: []
};

// ── Firestore persistence ──────────────────────────────────────────────────
// Data is stored in Firestore collection 'state' with document 'main'
// All users see and modify the same data in real-time

async function loadData() {
  try {
    const docRef = db.collection('state').doc('main');
    const snapshot = await docRef.get();
    
    if (snapshot.exists) {
      const rawData = snapshot.data();
      console.log('📚 Loaded data from Firestore', rawData);
      const normalized = normalizeFirestoreState(rawData);
      if (!isValidState(normalized)) {
        console.warn('⚠️ Firestore document format invalid, initializing empty state');
        await docRef.set(DEFAULT_DATA);
        return JSON.parse(JSON.stringify(DEFAULT_DATA));
      }
      return normalized;
    } else {
      console.log('📝 No data in Firestore, initializing empty state...');
      await docRef.set(DEFAULT_DATA);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  } catch (err) {
    console.error('❌ Firestore load error:', err);
    // Fallback to localStorage if Firestore is unavailable
    try {
      const saved = localStorage.getItem('buylist_v2');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function normalizeFirestoreState(rawData) {
  if (!rawData) return null;
  return rawData.state || rawData;
}

function isValidState(state) {
  if (!state || !Array.isArray(state.categories) || !Array.isArray(state.items)) return false;
  const validCategory = (cat) => cat && typeof cat.id === 'string' && typeof cat.label === 'string';
  const validItem = (item) => item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.price === 'number';
  return state.categories.every(validCategory) && state.items.every(validItem);
}

async function saveData(data) {
  try {
    await db.collection('state').doc('main').set(data);
    console.log('✅ Data saved to Firestore');
  } catch (err) {
    console.error('❌ Firestore save error:', err);
    // Fallback to localStorage
    try { localStorage.setItem('buylist_v2', JSON.stringify(data)); } catch(e) {}
  }
}

async function resetData() {
  try {
    await db.collection('state').doc('main').set(DEFAULT_DATA);
    console.log('🔄 Data reset to defaults in Firestore');
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  } catch (err) {
    console.error('❌ Firestore reset error:', err);
    localStorage.removeItem('buylist_v2');
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

// Real-time listener for Firestore changes
// This updates the state globally when other users/tabs modify data
function setupRealtimeListener(onStateChange) {
  try {
    db.collection('state').doc('main').onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const rawData = snapshot.data();
        console.log('🔄 Real-time update from Firestore', rawData);
        const normalized = normalizeFirestoreState(rawData);
        if (!isValidState(normalized)) {
          console.warn('⚠️ Firestore real-time update format invalid, ignoring');
          return;
        }
        onStateChange(normalized);
      }
    });
  } catch (err) {
    console.error('❌ Real-time listener error:', err);
  }
}

window.AppData = { loadData, saveData, resetData, setupRealtimeListener, DEFAULT_DATA };
