(function () {
  const SDK_VERSION = "12.2.1";
  const session = {
    modules: null,
    app: null,
    auth: null,
    db: null,
    lastCustomToken: "",
    currentParticipantId: "",
  };

  function getConfig() {
    return window.INANNA_FIREBASE_CONFIG || null;
  }

  function getOptions() {
    return Object.assign(
      {
        mode: "apps-script",
        collectionRoot: "participants",
        textCollectionName: "texts",
        versionCollectionName: "versions",
      },
      window.INANNA_FIREBASE_OPTIONS || {}
    );
  }

  function normalizeStatus(status, sharedWithEducator) {
    const normalized = String(status || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (!normalized) {
      return sharedWithEducator ? "compartilhada com educador" : "rascunho";
    }
    if (normalized.startsWith("selecion")) return "selecionada para antologia";
    if (normalized.startsWith("compart")) return "compartilhada com educador";
    if (normalized.startsWith("em revis")) return "em revisao";
    if (normalized.startsWith("conclu")) return "concluida";
    if (normalized.startsWith("arquiv")) return "arquivada";
    return "rascunho";
  }

  function defaultIndicators(versionCount) {
    const revisionCount = Number(versionCount) || 0;
    return {
      completude: "0/6 versos preenchidos",
      fechamento: "texto iniciando",
      rimaStatus: "rima em formacao",
      coerenciaTematica: "tema em formacao",
      repeticaoLexical: "boa variedade lexical",
      numberOfRevisions: revisionCount,
      maturacao:
        revisionCount >= 4
          ? "texto amadurecido"
          : revisionCount >= 2
            ? "texto amadurecendo"
            : revisionCount === 1
              ? "primeira versao registrada"
              : "texto iniciando",
    };
  }

  function normalizeIndicators(indicators, versionCount) {
    const fallback = defaultIndicators(versionCount);
    const source = indicators || {};
    return {
      completude: String(source.completude || fallback.completude),
      fechamento: String(source.fechamento || fallback.fechamento),
      rimaStatus: String(source.rimaStatus || fallback.rimaStatus),
      coerenciaTematica: String(source.coerenciaTematica || fallback.coerenciaTematica),
      repeticaoLexical: String(source.repeticaoLexical || fallback.repeticaoLexical),
      numberOfRevisions: Number(source.numberOfRevisions || versionCount || 0),
      maturacao: String(source.maturacao || fallback.maturacao),
    };
  }

  function isoNow() {
    return new Date().toISOString();
  }

  function buildEntityId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}_${window.crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
    }
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }

  function getTextCollectionPath(participantId) {
    const options = getOptions();
    return [options.collectionRoot, participantId, options.textCollectionName];
  }

  function getVersionCollectionPath(participantId, textId) {
    const options = getOptions();
    return [options.collectionRoot, participantId, options.textCollectionName, textId, options.versionCollectionName];
  }

  async function loadModules() {
    if (session.modules) return session.modules;

    const [appModule, authModule, firestoreModule] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`),
      import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`),
    ]);

    session.modules = {
      ...appModule,
      ...authModule,
      ...firestoreModule,
    };
    return session.modules;
  }

  async function ensureClients() {
    const config = getConfig();
    if (!config || !config.apiKey || !config.projectId || !config.appId) {
      throw new Error("Firebase ainda nao foi configurado para o caderno de sextilhas.");
    }

    const firebase = await loadModules();
    if (!session.app) {
      session.app = firebase.initializeApp(config);
      session.auth = firebase.getAuth(session.app);
      session.db = firebase.getFirestore(session.app);
    }

    return { firebase, auth: session.auth, db: session.db };
  }

  function assertOwner(identity, record) {
    if (!record || String(record.participantId || "").trim() !== String(identity.participantId || "").trim()) {
      throw new Error("O participante nao tem acesso a este texto.");
    }
  }

  function mapVersionRecord(record) {
    return {
      versionId: String(record.versionId || "").trim(),
      textId: String(record.textId || "").trim(),
      participantId: String(record.participantId || "").trim(),
      versionNumber: Number(record.versionNumber) || 0,
      title: String(record.title || "").trim(),
      theme: String(record.theme || "").trim(),
      note: String(record.note || "").trim(),
      verses: Array.isArray(record.verses) ? record.verses.map((item) => String(item || "").trim()).slice(0, 6) : ["", "", "", "", "", ""],
      status: normalizeStatus(record.status, record.sharedWithEducator),
      sharedWithEducator: !!record.sharedWithEducator,
      createdAt: String(record.createdAt || ""),
      indicators: normalizeIndicators(record.indicators, record.versionNumber),
      revisionNote: String(record.revisionNote || "").trim(),
    };
  }

  function mapTextRecord(record) {
    const versionCount = Number(record.versionCount) || 0;
    return {
      textId: String(record.textId || "").trim(),
      title: String(record.title || "").trim(),
      theme: String(record.theme || "").trim(),
      note: String(record.note || "").trim(),
      status: normalizeStatus(record.status, record.sharedWithEducator),
      createdAt: String(record.createdAt || ""),
      updatedAt: String(record.updatedAt || record.createdAt || ""),
      currentVersionId: String(record.currentVersionId || "").trim(),
      versionCount: versionCount,
      sharedWithEducator: !!record.sharedWithEducator,
      selectedForAnthology: !!record.selectedForAnthology,
      reopenRequested: !!record.reopenRequested,
      indicators: normalizeIndicators(record.indicators, versionCount),
      participantId: String(record.participantId || "").trim(),
      checkinUserId: String(record.checkinUserId || "").trim(),
      teacherGroup: String(record.teacherGroup || "").trim(),
      verses: Array.isArray(record.verses) ? record.verses.map((item) => String(item || "").trim()).slice(0, 6) : ["", "", "", "", "", ""],
      latestVersion: record.latestVersion ? mapVersionRecord(record.latestVersion) : null,
    };
  }

  function buildDashboardPayload(texts) {
    const completedCount = texts.filter((item) => normalizeStatus(item.status) === "concluida").length;
    const sorted = [...texts].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    return {
      status: "success",
      textCount: texts.length,
      completedCount,
      lastEditedAt: sorted[0]?.updatedAt || "",
      texts: sorted,
    };
  }

  async function initializeSession(input) {
    const { customToken, identity } = input || {};
    const { firebase, auth } = await ensureClients();
    if (typeof auth.authStateReady === "function") {
      await auth.authStateReady();
    }

    const participantId = String(identity?.participantId || "").trim();
    if (auth.currentUser && session.currentParticipantId === participantId) {
      return {
        status: "success",
        provider: "firestore",
        uid: String(auth.currentUser?.uid || "").trim(),
      };
    }

    if (auth.currentUser && session.currentParticipantId && session.currentParticipantId !== participantId) {
      await firebase.signOut(auth);
      session.lastCustomToken = "";
      session.currentParticipantId = "";
    }

    if (!customToken) throw new Error("Custom token do Firebase ausente.");
    if (!auth.currentUser || session.lastCustomToken !== customToken) {
      await firebase.signInWithCustomToken(auth, customToken);
      session.lastCustomToken = customToken;
    }

    await ensureParticipantClaimsReady(auth, participantId);

    session.currentParticipantId = participantId;

    return {
      status: "success",
      provider: "firestore",
      uid: String(auth.currentUser?.uid || "").trim(),
    };
  }

  function hasActiveSession(participantId) {
    const currentParticipantId = String(participantId || "").trim();
    const hasUser = !!session.auth?.currentUser;
    if (!hasUser) return false;
    if (!currentParticipantId) return true;
    return session.currentParticipantId === currentParticipantId;
  }

  async function ensureParticipantClaimsReady(auth, participantId) {
    const currentParticipantId = String(participantId || "").trim();
    if (!auth?.currentUser || !currentParticipantId) return;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await auth.currentUser.getIdToken(true);
      const tokenResult = await auth.currentUser.getIdTokenResult();
      if (String(tokenResult?.claims?.participantId || "").trim() === currentParticipantId) {
        return;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }

    throw new Error("As claims do Firebase ainda nao ficaram prontas para este participante.");
  }

  async function getUserDashboard(identity) {
    const { firebase, db } = await ensureClients();
    const textsQuery = firebase.query(
      firebase.collection(db, ...getTextCollectionPath(identity.participantId)),
      firebase.orderBy("updatedAt", "desc")
    );
    const snapshot = await firebase.getDocs(textsQuery);
    const texts = snapshot.docs.map((docSnap) => mapTextRecord(docSnap.data()));
    texts.forEach((record) => assertOwner(identity, record));
    return buildDashboardPayload(texts);
  }

  async function createText(identity, payload) {
    const { firebase, db } = await ensureClients();
    const textId = buildEntityId("text");
    const now = isoNow();
    const textRecord = {
      textId,
      participantId: identity.participantId,
      checkinUserId: identity.checkinUserId,
      teacherGroup: identity.teacherGroup || "",
      title: String(payload.title || "").trim(),
      theme: String(payload.theme || "").trim(),
      note: String(payload.note || payload.observation || "").trim(),
      status: normalizeStatus(payload.status, false),
      createdAt: now,
      updatedAt: now,
      currentVersionId: "",
      versionCount: 0,
      sharedWithEducator: false,
      selectedForAnthology: false,
      reopenRequested: false,
      appVariant: String(identity.appVariant || "inanna-main").trim() || "inanna-main",
      indicators: defaultIndicators(0),
      verses: ["", "", "", "", "", ""],
      latestVersion: null,
    };

    await firebase.setDoc(
      firebase.doc(db, ...getTextCollectionPath(identity.participantId), textId),
      textRecord
    );

    return {
      ok: true,
      status: "success",
      text: mapTextRecord(textRecord),
    };
  }

  async function getText(identity, textId) {
    const { firebase, db } = await ensureClients();
    const textRef = firebase.doc(db, ...getTextCollectionPath(identity.participantId), textId);
    const snapshot = await firebase.getDoc(textRef);
    if (!snapshot.exists()) {
      throw new Error("Texto nao encontrado.");
    }

    const textRecord = mapTextRecord(snapshot.data());
    assertOwner(identity, textRecord);

    return {
      status: "success",
      text: textRecord,
      latestVersion: textRecord.latestVersion,
    };
  }

  async function getTextVersions(identity, textId) {
    const { firebase, db } = await ensureClients();
    const versionsQuery = firebase.query(
      firebase.collection(db, ...getVersionCollectionPath(identity.participantId, textId)),
      firebase.orderBy("versionNumber", "desc")
    );
    const snapshot = await firebase.getDocs(versionsQuery);
    const versions = snapshot.docs.map((docSnap) => mapVersionRecord(docSnap.data()));
    versions.forEach((record) => assertOwner(identity, record));
    return {
      status: "success",
      textId,
      versions,
    };
  }

  async function saveTextVersion(identity, payload) {
    const { firebase, db } = await ensureClients();
    const textId = String(payload.textId || "").trim();
    if (!textId) throw new Error("textId obrigatorio.");

    const textRef = firebase.doc(db, ...getTextCollectionPath(identity.participantId), textId);
    const textSnapshot = await firebase.getDoc(textRef);
    if (!textSnapshot.exists()) {
      throw new Error("Texto nao encontrado.");
    }

    const currentText = mapTextRecord(textSnapshot.data());
    assertOwner(identity, currentText);

    const nextVersionNumber = Number(currentText.versionCount || 0) + 1;
    const versionId = buildEntityId("version");
    const now = isoNow();
    const sharedWithEducator = !!payload.sharedWithEducator;
    const status = normalizeStatus(payload.status || currentText.status, sharedWithEducator);
    const versionRecord = {
      versionId,
      textId,
      participantId: identity.participantId,
      checkinUserId: identity.checkinUserId,
      teacherGroup: identity.teacherGroup || "",
      versionNumber: nextVersionNumber,
      title: String(payload.title || currentText.title || "").trim(),
      theme: String(payload.theme || currentText.theme || "").trim(),
      note: String(payload.note || payload.observation || currentText.note || "").trim(),
      verses: Array.isArray(payload.verses) ? payload.verses.map((item) => String(item || "").trim()).slice(0, 6) : ["", "", "", "", "", ""],
      status,
      sharedWithEducator,
      createdAt: now,
      indicators: normalizeIndicators(payload.indicators, nextVersionNumber),
      revisionNote: String(payload.revisionNote || "").trim(),
    };

    const nextTextRecord = Object.assign({}, currentText, {
      title: versionRecord.title,
      theme: versionRecord.theme,
      note: versionRecord.note,
      status,
      updatedAt: now,
      currentVersionId: versionId,
      versionCount: nextVersionNumber,
      sharedWithEducator,
      reopenRequested: !!currentText.reopenRequested,
      indicators: versionRecord.indicators,
      verses: versionRecord.verses,
      latestVersion: versionRecord,
    });

    await firebase.setDoc(
      firebase.doc(db, ...getVersionCollectionPath(identity.participantId, textId), versionId),
      versionRecord
    );
    await firebase.setDoc(textRef, nextTextRecord, { merge: true });

    return {
      ok: true,
      status: "success",
      text: mapTextRecord(nextTextRecord),
      version: mapVersionRecord(versionRecord),
    };
  }

  async function archiveText(identity, payload) {
    return updateTextStatus(identity, {
      ...payload,
      status: payload.status || "arquivada",
    });
  }

  async function updateTextStatus(identity, payload) {
    const { firebase, db } = await ensureClients();
    const textId = String(payload.textId || "").trim();
    if (!textId) throw new Error("textId obrigatorio.");

    const textRef = firebase.doc(db, ...getTextCollectionPath(identity.participantId), textId);
    const snapshot = await firebase.getDoc(textRef);
    if (!snapshot.exists()) {
      throw new Error("Texto nao encontrado.");
    }

    const currentText = mapTextRecord(snapshot.data());
    assertOwner(identity, currentText);

    const sharedWithEducator = payload.sharedWithEducator === undefined
      ? !!currentText.sharedWithEducator
      : !!payload.sharedWithEducator;
    const nextStatus = normalizeStatus(payload.status || currentText.status || "rascunho", sharedWithEducator);
    let reopenRequested = payload.reopenRequested === undefined
      ? !!currentText.reopenRequested
      : !!payload.reopenRequested;
    if (nextStatus !== "concluida") reopenRequested = false;
    const updatedAt = isoNow();
    const nextLatestVersion = currentText.latestVersion
      ? Object.assign({}, currentText.latestVersion, {
        status: nextStatus,
        sharedWithEducator,
      })
      : currentText.latestVersion;
    const nextTextRecord = Object.assign({}, currentText, {
      status: nextStatus,
      sharedWithEducator,
      reopenRequested,
      updatedAt,
      latestVersion: nextLatestVersion,
    });

    await firebase.setDoc(textRef, nextTextRecord, { merge: true });
    if (currentText.currentVersionId) {
      await firebase.setDoc(
        firebase.doc(db, ...getVersionCollectionPath(identity.participantId, textId), currentText.currentVersionId),
        {
          status: nextStatus,
          sharedWithEducator,
        },
        { merge: true }
      );
    }

    return {
      ok: true,
      status: "success",
      text: mapTextRecord(nextTextRecord),
    };
  }

  window.InannaFirebaseBridge = {
    isConfigured() {
      const config = getConfig();
      return !!(config && config.apiKey && config.projectId && config.appId);
    },
    getMode() {
      return String(getOptions().mode || "apps-script").trim().toLowerCase();
    },
    hasActiveSession,
    initializeSession,
    getUserDashboard,
    createText,
    getText,
    getTextVersions,
    saveTextVersion,
    updateTextStatus,
    archiveText,
  };
})();
