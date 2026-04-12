window.INANNA_FIREBASE_CONFIG = window.INANNA_FIREBASE_CONFIG || {
  apiKey: "AIzaSyCfZs_tP8DqbZhbNNeX7rp8i9Plqw4gn9E",
  authDomain: "inanna-ia.firebaseapp.com",
  projectId: "inanna-ia",
  storageBucket: "inanna-ia.firebasestorage.app",
  messagingSenderId: "444542195295",
  appId: "1:444542195295:web:cf8d174417d703866c2dea",
  measurementId: "G-P6WM1FGQ24"
};

window.INANNA_FIREBASE_OPTIONS = Object.assign(
  {
    mode: "firestore",
    collectionRoot: "participants",
    textCollectionName: "texts",
    versionCollectionName: "versions",
  },
  window.INANNA_FIREBASE_OPTIONS || {}
);
