window.INANNA_FIREBASE_CONFIG = window.INANNA_FIREBASE_CONFIG || null;

window.INANNA_FIREBASE_OPTIONS = Object.assign(
  {
    mode: "apps-script",
    collectionRoot: "participants",
    textCollectionName: "texts",
    versionCollectionName: "versions",
  },
  window.INANNA_FIREBASE_OPTIONS || {}
);
