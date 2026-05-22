// ── Central data store ──────────────────────────────────────────────────────

const DEFAULT_DATA = {
  categories: [
    { id: 'cinema',  label: 'Home Cinema',    icon: '📺', color: '#e8c547' },
    { id: 'tennis',  label: 'Tennis',          icon: '🎾', color: '#5de89a' },
    { id: 'bureau',  label: 'Bureau / Gaming', icon: '🖥️', color: '#a78bfa' },
  ],
  items: [
    {
      id: 'wanbo',
      name: 'Wanbo Vali 1 Pro',
      subtitle: 'Projecteur 1080p portable',
      price: 320,
      cat: 'cinema',
      checked: false,
      link: 'https://www.wanbo.com',
      description: 'Projecteur LED compact 1080p avec Android TV intégré. Luminosité 800 ANSI lumens, mise au point automatique, correction trapézoïdale auto.',
      comparisons: [
        { model: 'Wanbo Vali 1 Pro', price: 320, lumen: 800, resolution: '1080p', android: true, autofocus: true, score: 9 },
        { model: 'Xiaomi MI Smart 2',   price: 280, lumen: 500, resolution: '1080p', android: true,  autofocus: false, score: 7 },
        { model: 'Dangbei Atom',         price: 499, lumen: 1100, resolution: '1080p', android: true, autofocus: true, score: 8 },
        { model: 'Anker Nebula Capsule 3', price: 599, lumen: 300, resolution: '1080p', android: true, autofocus: true, score: 7 },
      ]
    },
    {
      id: 'ecran100',
      name: 'Écran de projection 100"',
      subtitle: 'Toile de projection fixe',
      price: 80,
      cat: 'cinema',
      checked: false,
      description: 'Écran de projection blanc mat 100 pouces (221×124 cm) format 16:9. Surface gain 1.0 pour une diffusion uniforme.',
      comparisons: [
        { model: 'Écran 100" blanc mat',   price: 80,  taille: '100"', gain: 1.0, fixe: true,  score: 8 },
        { model: 'Écran 100" ALR',         price: 180, taille: '100"', gain: 1.3, fixe: true,  score: 9 },
        { model: 'Écran enroulable 100"',  price: 120, taille: '100"', gain: 1.0, fixe: false, score: 7 },
        { model: 'Écran 120" blanc mat',   price: 110, taille: '120"', gain: 1.0, fixe: true,  score: 8 },
      ]
    },
    {
      id: 'sony-hts400',
      name: 'Sony HT-S400',
      subtitle: 'Barre de son + caisson wireless',
      price: 220,
      cat: 'cinema',
      checked: false,
      link: 'https://www.sony.fr',
      description: 'Barre de son 2.1 avec caisson de basse sans fil. Puissance totale 330W, Bluetooth 5.0, X-Bass pour les basses profondes.',
      comparisons: [
        { model: 'Sony HT-S400',       price: 220, puissance: '330W', wifi: false, dolby: false, caisson: 'Wireless', score: 9 },
        { model: 'Samsung HW-B550',    price: 250, puissance: '410W', wifi: false, dolby: true,  caisson: 'Wireless', score: 8 },
        { model: 'Bose TV Speaker',    price: 280, puissance: '60W',  wifi: false, dolby: false, caisson: 'Non',      score: 7 },
        { model: 'LG S60Q',            price: 200, puissance: '300W', wifi: false, dolby: false, caisson: 'Wireless', score: 7 },
      ]
    },
    {
      id: 'led-strip',
      name: 'Éclairage ambiant LED',
      subtitle: 'Bandes LED RGBIC',
      price: 40,
      cat: 'cinema',
      checked: false,
      description: 'Bandes LED RGBIC pour rétroéclairage TV/projecteur. Compatible Alexa & Google Home, synchronisation musicale.',
      comparisons: []
    },
    {
      id: 'pongbot',
      name: 'Pongbot Pace S Pro',
      subtitle: 'Machine à balles de tennis',
      price: 599,
      cat: 'tennis',
      checked: false,
      link: 'https://www.pongbot.com',
      description: "Machine à balles de tennis portable avec contrôle via app. Fréquence 1–12 balles/min, vitesse jusqu'à 100 km/h, 40 exercices préprogrammés, batterie 4h autonomie.",
      comparisons: [
        { model: 'Pongbot Pace S Pro',  price: 599,  balles: 120, vitesse: '100 km/h', app: true,  autonomie: '4h',   score: 9 },
        { model: 'Slinger Bag',         price: 450,  balles: 144, vitesse: '80 km/h',  app: true,  autonomie: '2.5h', score: 7 },
        { model: 'Lobster Elite 2',     price: 1200, balles: 150, vitesse: '130 km/h', app: false, autonomie: '4h',   score: 8 },
        { model: 'Spinshot Player',     price: 699,  balles: 120, vitesse: '110 km/h', app: true,  autonomie: '3h',   score: 8 },
        { model: 'Siboasi T2303M',      price: 380,  balles: 100, vitesse: '90 km/h',  app: false, autonomie: '3h',   score: 6 },
      ]
    },
    {
      id: 'libernovo',
      name: 'Libernovo Omni Chair',
      subtitle: 'Chaise ergonomique gaming',
      price: 699,
      cat: 'bureau',
      checked: false,
      link: 'https://www.libernovo.com',
      description: 'Chaise ergonomique premium avec support lombaire réglable, accoudoirs 4D, dossier mesh respirant. Conçue pour de longues sessions de travail et gaming.',
      comparisons: [
        { model: 'Libernovo Omni',         price: 699,  lombaire: 'Réglable', mesh: true,  accoudoirs: '4D',  recline: '135°', score: 9 },
        { model: 'Herman Miller Aeron',    price: 1800, lombaire: 'PostureFit', mesh: true, accoudoirs: '4D', recline: '104°', score: 10 },
        { model: 'Secretlab Titan Evo',    price: 549,  lombaire: 'Magnétique', mesh: false, accoudoirs: '4D', recline: '165°', score: 8 },
        { model: 'Autonomous ErgoChair Pro', price: 499, lombaire: 'Réglable', mesh: true, accoudoirs: '4D', recline: '135°', score: 8 },
        { model: 'IKEA Markus',            price: 229,  lombaire: 'Fixe', mesh: false, accoudoirs: '2D', recline: '120°', score: 6 },
      ]
    },
  ]
};

// ── Firestore persistence ──────────────────────────────────────────────────
// Data is stored in Firestore collection 'state' with document 'main'
// All users see and modify the same data in real-time

async function loadData() {
  try {
    const docRef = db.collection('state').doc('main');
    const snapshot = await docRef.get();
    
    if (snapshot.exists) {
      console.log('📚 Loaded data from Firestore');
      return snapshot.data();
    } else {
      console.log('📝 No data in Firestore, initializing with defaults...');
      // Initialize Firestore with default data
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

async function saveData(data) {
  try {
    await db.collection('state').doc('main').update(data);
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
        const newData = snapshot.data();
        console.log('🔄 Real-time update from Firestore');
        onStateChange(newData);
      }
    });
  } catch (err) {
    console.error('❌ Real-time listener error:', err);
  }
}

window.AppData = { loadData, saveData, resetData, setupRealtimeListener, DEFAULT_DATA };
