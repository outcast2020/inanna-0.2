// =====================================================================
// Inanna — Proto-IA Educativa (Cordel 2.0)
// Novo fluxo de jogo:
//  ETAPA 1: Usuário escolhe um contexto (tema)
//  ETAPA 2: Usuário escreve um verso completo
//  ETAPA 3: Sistema sugere alternativas para a última palavra; usuário escolhe
//            um dos candidatos OU mantém/digita a própria palavra
//  O ciclo se repete até completar 4 versos (quadra).
// =====================================================================

// Initialize Vercel Web Analytics
import { inject } from '@vercel/analytics';
inject();

const $ = (id) => document.getElementById(id);

// ── UI refs ──────────────────────────────────────────────────────────
const ui = {
  // etapas
  step0: $("step0"),
  step1: $("step1"),
  step2: $("step2"),
  step3: $("step3"),
  stepsBar: $("stepsBar"),
  headerRight: $("headerRight"),

  // app script globals
  btnStart: $("btnStart"),
  btnGuestStart: $("btnGuestStart"),
  playerName: $("playerName"),
  playerEmail: $("playerEmail"),
  playerType: $("playerType"),
  verifyCheckinBtn: $("verifyCheckinBtn"),
  welcomeIdentity: $("welcomeIdentity"),
  profileCompletionPanel: $("profileCompletionPanel"),
  profileWorkshopYes: $("profileWorkshopYes"),
  profileWorkshopNo: $("profileWorkshopNo"),
  profileAiChatbotYes: $("profileAiChatbotYes"),
  profileAiChatbotNo: $("profileAiChatbotNo"),
  profileGender: $("profileGender"),
  profileRace: $("profileRace"),
  profileAgeRange: $("profileAgeRange"),
  profileMunicipioInput: $("profileMunicipioInput"),
  profileMunicipioOptions: $("profileMunicipioOptions"),
  profileOutsideBrazil: $("profileOutsideBrazil"),
  saveProfileBtn: $("saveProfileBtn"),
  profileStatus: $("profileStatus"),
  startHint: $("startHint"),
  btnSubmitPoem: $("btnSubmitPoem"),
  submitResponse: $("submitResponse"),
  placarList: $("placarList"),
  btnRefreshPlacar: $("btnRefreshPlacar"),
  rankingArea: $("rankingArea"),

  // trilhas
  trackChooserSection: $("trackChooserSection"),
  quadraLevelsSection: $("quadraLevelsSection"),
  chooseGameTrackBtn: $("chooseGameTrackBtn"),
  choosePlayerPanelBtn: $("choosePlayerPanelBtn"),
  startLevel1TrackBtn: $("startLevel1TrackBtn"),
  quadraLevelsBackBtn: $("quadraLevelsBackBtn"),
  chooseSextilhaTrackBtn: $("chooseSextilhaTrackBtn"),
  sextilhaAccessNotice: $("sextilhaAccessNotice"),
  chooseLevel2TrackBtn: $("chooseLevel2TrackBtn"),
  level2AccessNotice: $("level2AccessNotice"),
  level2ProgressSummary: $("level2ProgressSummary"),
  level2PreviewSection: $("level2PreviewSection"),
  level2PreviewStatus: $("level2PreviewStatus"),
  level2PreviewBackBtn: $("level2PreviewBackBtn"),
  level2SetupPanel: $("level2SetupPanel"),
  level2NicknameInput: $("level2NicknameInput"),
  level2InputMode: $("level2InputMode"),
  level2SoundMode: $("level2SoundMode"),
  level2StartBtn: $("level2StartBtn"),
  level2AudioToggleBtn: $("level2AudioToggleBtn"),
  level2SessionStatus: $("level2SessionStatus"),
  level2Arena: $("level2Arena"),
  level2ActiveRoundPanel: $("level2ActiveRoundPanel"),
  level2RoundBadge: $("level2RoundBadge"),
  level2Scoreboard: $("level2Scoreboard"),
  level2Theme: $("level2Theme"),
  level2RhymeScheme: $("level2RhymeScheme"),
  level2ThemeContext: $("level2ThemeContext"),
  level2OriginalInput: $("level2OriginalInput"),
  level2DictateBtn: $("level2DictateBtn"),
  level2SubmitOriginalBtn: $("level2SubmitOriginalBtn"),
  level2InannaResponse: $("level2InannaResponse"),
  level2RevisionTimer: $("level2RevisionTimer"),
  level2FinalInput: $("level2FinalInput"),
  level2FinalizeRoundBtn: $("level2FinalizeRoundBtn"),
  level2NextRoundBtn: $("level2NextRoundBtn"),
  level2PrimaryActionBtn: $("level2PrimaryActionBtn"),
  level2ResetBtn: $("level2ResetBtn"),
  level2RoundFeedback: $("level2RoundFeedback"),
  level2MatchResult: $("level2MatchResult"),
  trackChooserBackBtn: $("trackChooserBackBtn"),
  userDashboardSection: $("userDashboardSection"),
  dashboardGreeting: $("dashboardGreeting"),
  dashboardFolhetoCount: $("dashboardFolhetoCount"),
  dashboardTextCount: $("dashboardTextCount"),
  dashboardCompletedCount: $("dashboardCompletedCount"),
  dashboardLastEdited: $("dashboardLastEdited"),
  dashboardStatusFilter: $("dashboardStatusFilter"),
  dashboardTextList: $("dashboardTextList"),
  dashboardCadernoArea: $("dashboardCadernoArea"),
  playerDisplayNameInput: $("playerDisplayNameInput"),
  savePlayerDisplayNameBtn: $("savePlayerDisplayNameBtn"),
  playerDisplayNameStatus: $("playerDisplayNameStatus"),
  dashboardProfileSummary: $("dashboardProfileSummary"),
  toggleDashboardProfileEditBtn: $("toggleDashboardProfileEditBtn"),
  dashboardProfileEditPanel: $("dashboardProfileEditPanel"),
  dashboardProfileWorkshopYes: $("dashboardProfileWorkshopYes"),
  dashboardProfileWorkshopNo: $("dashboardProfileWorkshopNo"),
  dashboardProfileAiChatbotYes: $("dashboardProfileAiChatbotYes"),
  dashboardProfileAiChatbotNo: $("dashboardProfileAiChatbotNo"),
  dashboardProfileGender: $("dashboardProfileGender"),
  dashboardProfileRace: $("dashboardProfileRace"),
  dashboardProfileAgeRange: $("dashboardProfileAgeRange"),
  dashboardProfileMunicipioInput: $("dashboardProfileMunicipioInput"),
  dashboardProfileMunicipioOptions: $("dashboardProfileMunicipioOptions"),
  dashboardProfileOutsideBrazil: $("dashboardProfileOutsideBrazil"),
  saveDashboardProfileBtn: $("saveDashboardProfileBtn"),
  dashboardProfileStatus: $("dashboardProfileStatus"),
  playerLevel1Rewards: $("playerLevel1Rewards"),
  playerUnlockLevel2Btn: $("playerUnlockLevel2Btn"),
  playerGoLevel1Btn: $("playerGoLevel1Btn"),
  playerLevel2Rewards: $("playerLevel2Rewards"),
  playerGoLevel2Btn: $("playerGoLevel2Btn"),
  refreshPlayerPanelBtn: $("refreshPlayerPanelBtn"),
  playerLevel2Results: $("playerLevel2Results"),
  btnCreateFolheto: $("btnCreateFolheto"),
  btnCreateText: $("btnCreateText"),
  btnBackToTrackChooser: $("btnBackToTrackChooser"),
  folhetoWorkspaceSection: $("folhetoWorkspaceSection"),
  folhetoTitleHeading: $("folhetoTitleHeading"),
  folhetoSummaryText: $("folhetoSummaryText"),
  folhetoTextCount: $("folhetoTextCount"),
  folhetoCompletedCount: $("folhetoCompletedCount"),
  folhetoLastEdited: $("folhetoLastEdited"),
  folhetoTextList: $("folhetoTextList"),
  btnCreateTextInFolheto: $("btnCreateTextInFolheto"),
  btnBackToDashboardFromFolheto: $("btnBackToDashboardFromFolheto"),
  sextilhaEditorSection: $("sextilhaEditorSection"),
  editorTitleHeading: $("editorTitleHeading"),
  editorTitleInput: $("editorTitleInput"),
  editorThemeInput: $("editorThemeInput"),
  editorNoteInput: $("editorNoteInput"),
  editorVerse1: $("editorVerse1"),
  editorVerse2: $("editorVerse2"),
  editorVerse3: $("editorVerse3"),
  editorVerse4: $("editorVerse4"),
  editorVerse5: $("editorVerse5"),
  editorVerse6: $("editorVerse6"),
  editorSharedWithEducator: $("editorSharedWithEducator"),
  btnSaveTextVersion: $("btnSaveTextVersion"),
  btnFinalizeText: $("btnFinalizeText"),
  btnResendSocialEmail: $("btnResendSocialEmail"),
  btnRequestReopen: $("btnRequestReopen"),
  btnArchiveText: $("btnArchiveText"),
  btnBackToDashboard: $("btnBackToDashboard"),
  btnOpenVersionHistory: $("btnOpenVersionHistory"),
  editorLockNotice: $("editorLockNotice"),
  editorSaveMessage: $("editorSaveMessage"),
  editorInannaAvatar: $("editorInannaAvatar"),
  editorInannaStateTitle: $("editorInannaStateTitle"),
  editorInannaStateText: $("editorInannaStateText"),
  editorIndicatorList: $("editorIndicatorList"),
  editorAiFeedback: $("editorAiFeedback"),
  editorVersionMeta: $("editorVersionMeta"),
  editorLastSaved: $("editorLastSaved"),
  versionHistorySection: $("versionHistorySection"),
  versionHistoryTitle: $("versionHistoryTitle"),
  versionComparePanel: $("versionComparePanel"),
  versionHistoryList: $("versionHistoryList"),
  btnBackToEditor: $("btnBackToEditor"),
  btnBackToDashboardFromVersions: $("btnBackToDashboardFromVersions"),

  // rules modal
  rulesModal: $("rulesModal"),
  closeRules: $("closeRules"),
  challengeScore: $("challengeScore"),

  // placar modal
  placarModal: $("placarModal"),
  closePlacar: $("closePlacar"),
  fullPlacarList: $("fullPlacarList"),

  // etapa 1
  themeGrid: $("themeGrid"),

  // etapa 2
  selectedThemeName: $("selectedThemeName"),
  verseInput: $("verseInput"),
  verseBlankPreview: $("verseBlankPreview"),
  step2Progress: $("step2Progress"),
  btnAnalyze: $("btnAnalyze"),
  verseHint: $("verseHint"),

  // etapa 3
  versePreview: $("versePreview"),
  step3Progress: $("step3Progress"),
  predList: $("predList"),
  bars: $("bars"),
  contextDetected: $("contextDetected"),
  explainBox: $("explainBox"),
  openPedagogy: $("openPedagogy"),
  customInput: $("customInput"),
  btnCustom: $("btnCustom"),
  btnBack: $("btnBack"),

  // palco / resultado
  currentLine: $("currentLine"),
  quadra: $("quadra"),
  copyQuadra: $("copyQuadra"),
  btnContinueQuadra: $("btnContinueQuadra"),
  btnNewPoem: $("btnNewPoem"),
  poemSection: $("poemSection"),
  history: $("history"),

  // modo
  challengeStatus: $("challengeStatus"),
  modeChallenge: $("modeChallenge"),
  writeTimer: $("writeTimer"),
  points: $("points"),
  btnStopGameSession: $("btnStopGameSession"),

  // modal do vetor
  vectorModal: $("vectorModal"),
  closeVector: $("closeVector"),
  vectorWordTitle: $("vectorWordTitle"),
  vectorProbability: $("vectorProbability"),
  vectorSummary: $("vectorSummary"),
  vectorContextStory: $("vectorContextStory"),
  vectorWordArray: $("vectorWordArray"),
  vectorWeightsArray: $("vectorWeightsArray"),
  vectorContributionArray: $("vectorContributionArray"),
  vectorEquation: $("vectorEquation"),
  vectorDimensions: $("vectorDimensions"),
  stochasticSummary: $("stochasticSummary"),
  stochasticList: $("stochasticList"),
  openPedagogyFromVector: $("openPedagogyFromVector"),

  // modal pedagógico
  pedagogyModal: $("pedagogyModal"),
  closePedagogy: $("closePedagogy"),
  pedagogyLiveDistribution: $("pedagogyLiveDistribution"),
  pedagogyLiveList: $("pedagogyLiveList"),

  // toast / audio / social card
  toastRegion: $("toastRegion"),
  inannaFeedbackSound: $("inannaFeedbackSound"),
  socialPostcard: $("socialPostcard"),
  socialPostcardTitle: $("socialPostcardTitle"),
  socialPostcardTheme: $("socialPostcardTheme"),
  socialPostcardAuthor: $("socialPostcardAuthor"),
  socialPostcardVerses: $("socialPostcardVerses"),
};

// ── Estado do jogo ───────────────────────────────────────────────────
const state = {
  phase: 0,           // 0 | 1 | 2 | 3
  view: "identity",   // identity | chooser | game | gameResult | sextilhaDashboard | sextilhaEditor | versionHistory
  selectedTrack: "",
  playerData: null,
  name: "",
  email: "",
  municipio: "",
  estadoUF: "",
  origem: "",
  pais: "BR",
  oficinaCordel20: null,
  usouChatbotIa: null,
  genero: "",
  identificacaoRacial: "",
  faixaEtaria: "",
  profileComplete: false,
  profileSaving: false,
  dashboardProfileSaving: false,
  dashboardProfileEditOpen: false,
  profileFormParticipantId: "",
  dashboardProfileFormParticipantId: "",
  municipiosBrasilLoaded: false,
  municipiosBrasilLoading: false,
  municipiosBrasilError: "",
  participantId: "",
  checkinUserId: "",
  checkinMatchStatus: "",
  checkinMatchMethod: "",
  teacherGroup: "",
  checkinLookupStatus: "idle", // idle | loading | matched | unmatched | ambiguous | error
  checkinLookupMessage: "",
  chosenTheme: null,  // objeto THEMES
  lines: [],          // versos completos
  current: {
    rawVerse: "",     // verso com ___
    originalVerse: "",
    originalToken: "",
    pred: null,       // resultado de buildPredictions
  },
  points: 0,
  scheme: "Livre",
  modeChallenge: true,
  rhyme: null,
  scoreBreakdown: null,
  playerProgress: null,
  level2: {
    sessionId: "",
    playerId: "",
    nickname: "",
    inputMode: "written",
    soundMode: "none",
    roundState: "COMPOSING_INITIAL",
    currentRound: 1,
    roundCount: 3,
    playerWins: 0,
    inannaWins: 0,
    theme: "",
    rhymeScheme: "AABB",
    originalQuadra: "",
    finalQuadra: "",
    inannaQuadra: "",
    stolenWords: [],
    generationProvider: "",
    revisionExpiresAt: 0,
    revisionTimerId: null,
    roundResults: [],
    roundClosed: false,
    matchFinished: false,
    lastRoundResult: null,
    themeContext: "",
    themeSource: "",
    audio: null,
    dictation: null
  },
  writingStartedAt: 0,
  writingElapsedMs: 0,
  writingTimerId: null,
  writingTimerRunning: false,
  userDashboard: null,
  userFolhetos: [],
  userTexts: [],
  dashboardFilter: "all",
  activeFolhetoId: "",
  activeFolheto: null,
  activeTextId: "",
  activeText: null,
  activeTextVersions: [],
  versionCompareSelection: [],
  draftVersionSource: null,
  sextilhaStoreStatus: "idle",
  supabaseSessionReady: false,
  supabaseSessionPromise: null,
  lastAiFeedback: null,
  aiFeedbackRequestKey: "",
  aiFeedbackLoading: false,
  mutedVerseWarningIndexes: Array.from({ length: 6 }, () => false),
  editorAvatarState: "observing",
  editorAvatarLockedUntil: 0,
  dashboardLoadRequestId: 0,
  playerLevel2Profile: null,
  playerLevel2ProfileStatus: "idle",
};

const APP_VARIANT = "inanna-main";
const SUPABASE_SEXTILHA_MODE = "supabase";
const PLACAR_VISIBLE_LIMIT = 20;
const PLACAR_PREVIEW_LIMIT = 3;
const PLACAR_REACTION_LIMIT = 3;
const PLACAR_REACTION_VIEWER_STORAGE_KEY = "inanna_placar_reaction_viewer_v1";
const PLAYER_PROGRESS_STORAGE_KEY = "inanna_player_progress_v1";
const MUNICIPIOS_BR_API_URL = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios";
const MUNICIPIOS_BR_CACHE_KEY = "inanna_municipios_br_v1";
const PLACAR_REACTIONS = [
  { key: "thumb", emoji: "👍", label: "Polegar para cima" },
  { key: "heart", emoji: "❤️", label: "Coração" },
  { key: "wow", emoji: "😮", label: "Boca de surpresa" },
];
const SEXTILHA_ALLOWED_EMAILS = new Set(["cjaviervidalg@gmail.com"]);
const DEFAULT_ADMIN_EMAILS = [
  "cjaviervidalg@gmail.com",
  "celestefarias@ymail.com"
];
const SEXTILHA_LOCKED_NOTICE = "ainda estamos trabalhando e sonhando este espaço";
const LEVEL2_LOCKED_NOTICE = "Domine a rima humana no Nível 1 para liberar o Nível 2.";
const CHALLENGE_MAX_SCORE = 14;
const MASTERY_CRITERIA = [
  { key: "formaMax", label: "Forma da quadra" },
  { key: "rimaFinalMax", label: "Rima final forte" },
  { key: "esquemaForteMax", label: "Esquema forte" },
  { key: "criatividadeAutoralMax", label: "Criatividade autoral" },
  { key: "independenciaMax", label: "Independência da Inanna" },
  { key: "semRepeticaoFinal", label: "Sem repetição final" },
  { key: "semFalhaDeRima", label: "Sem falha de rima" },
  { key: "doisEsquemasUsados", label: "Dois esquemas usados" },
];
function readBooleanConfigFlag(value) {
  if (value === true) return true;
  if (value === false || value === null || typeof value === "undefined") return false;
  return ["1", "true", "yes", "sim", "on"].includes(String(value).trim().toLowerCase());
}

function readNumericConfigFlag(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readStringConfigValue(value) {
  const text = String(value || "").trim();
  if (!text || /^%VITE_[A-Z0-9_]+%$/.test(text)) return "";
  return text;
}

function readListConfigValue(value) {
  return readStringConfigValue(value)
    .split(/[,\n;]+/)
    .map(normalizeEmail)
    .filter(Boolean);
}

const INANNA_LEVEL = readNumericConfigFlag(window.INANNA_APP_CONFIG?.level, 1);
const INANNA_AI_ENABLED = readBooleanConfigFlag(window.INANNA_APP_CONFIG?.aiEnabled);
const INANNA_LEVEL2_ENABLED = readBooleanConfigFlag(window.INANNA_APP_CONFIG?.level2Enabled);
const INANNA_LEVEL2_AGENT_URL = readStringConfigValue(window.INANNA_APP_CONFIG?.level2AgentUrl);
const INANNA_LEVEL2_REQUIRE_UNLOCK = readBooleanConfigFlag(window.INANNA_APP_CONFIG?.level2RequireUnlock);
const INANNA_LEVEL2_DICTATION_ENABLED = readBooleanConfigFlag(window.INANNA_APP_CONFIG?.level2DictationEnabled);
const INANNA_LEVEL2_AUDIO_ENABLED = readBooleanConfigFlag(window.INANNA_APP_CONFIG?.level2AudioEnabled);
const INANNA_LEVEL2_SOCIAL_ENABLED = readBooleanConfigFlag(window.INANNA_APP_CONFIG?.level2SocialEnabled);
const INANNA_TURNSTILE_SITE_KEY = readStringConfigValue(window.INANNA_APP_CONFIG?.turnstileSiteKey);
const INANNA_SOCIAL_EMAIL_ENABLED = readBooleanConfigFlag(window.INANNA_APP_CONFIG?.socialEmailEnabled);
// Modo "experimentar sem cadastro" (analise-inanna.md §11). Default OFF: produção
// só muda quando habilitado explicitamente. Convidados jogam local, sem persistir.
const INANNA_GUEST_MODE_ENABLED = readBooleanConfigFlag(window.INANNA_APP_CONFIG?.guestModeEnabled);
const GUEST_FREE_QUADRAS = 2;
// Acervo de folhetos (NFT-simulação centralizada). Default OFF — registra/mostra o
// colecionável só quando habilitado (analise-inanna.md §84-109; migration 010).
const INANNA_NFT_MINTING_ENABLED = readBooleanConfigFlag(window.INANNA_APP_CONFIG?.nftMintingEnabled);
const INANNA_FIRST_ACCESS_LOOKUP_URL = readStringConfigValue(window.INANNA_APP_CONFIG?.firstAccessLookupUrl);
const INANNA_FIRST_ACCESS_LOOKUP_TOKEN = readStringConfigValue(window.INANNA_APP_CONFIG?.firstAccessLookupToken);
const INANNA_ADMIN_EMAILS = new Set([
  ...DEFAULT_ADMIN_EMAILS,
  ...readListConfigValue(window.INANNA_APP_CONFIG?.adminEmails)
]);
const LEVEL2_NICKNAME_STORAGE_KEY = "inanna_level2_nickname_v1";
const LEVEL2_SESSION_STORAGE_KEY = "inanna_level2_session_v2";
const PLAYER_DISPLAY_NAME_STORAGE_KEY = "inanna_player_display_name_v1";
const LEVEL2_ROUND_STATES = {
  COMPOSING_INITIAL: "COMPOSING_INITIAL",
  SUBMITTING_INITIAL: "SUBMITTING_INITIAL",
  GENERATING_INANNA: "GENERATING_INANNA",
  REVISING_RESPONSE: "REVISING_RESPONSE",
  SUBMITTING_FINAL: "SUBMITTING_FINAL",
  JUDGING: "JUDGING",
  ROUND_RESULT: "ROUND_RESULT",
  MATCH_RESULT: "MATCH_RESULT"
};
const LEVEL2_REVISION_TIME_SECONDS = 120;
const LEVEL2_LOCAL_CHALLENGES = [
  { theme: "ônibus lotado e sonho no bolso", rhymeScheme: "AABB" },
  { theme: "paz na quebrada sem calar a voz", rhymeScheme: "ABAB" },
  { theme: "caderno aberto e futuro na mão", rhymeScheme: "ABCB" },
  { theme: "internet, verdade e palavra própria", rhymeScheme: "ABBA" }
];
const SEXTILHA_RHYME_VERSE_INDEXES = [1, 3, 5];
const SEXTILHA_GRAMMATICAL_SYLLABLE_WARNING_LIMIT = 8;
const TOAST_AUTO_CLOSE_MS = 3000;
const SYNTHETIC_LEGACY_FOLHETO_ID = "__legacy_folheto__";
const DASHBOARD_CACHE_KEY_PREFIX = "inanna_dashboard_cache_v1";
const DASHBOARD_SLOW_NOTICE_DELAY_MS = 3500;
const DASHBOARD_SUPABASE_SESSION_TIMEOUT_MS = 30000;
const DASHBOARD_BACKGROUND_REQUEST_TIMEOUT_MS = 65000;
let municipiosBrasil = [];
let municipiosBrasilPromise = null;
const INANNA_AVATAR_STATES = {
  observing: {
    src: "inanna_observando.webp",
    title: "Inanna observando",
    text: "Ela acompanha sua escrita e pisca enquanto os versos ganham forma.",
  },
  reading: {
    src: "inanna_lendo.webp",
    title: "Inanna lendo",
    text: "Ela está lendo sua sextilha com calma para responder com cuidado.",
  },
  celebrating: {
    src: "inanna_celebrando.webp",
    title: "Inanna celebrando",
    text: "Ela gostou do brilho da sua sextilha e veio festejar a devolutiva.",
  },
};
const SEXTILHA_STATUS_LABELS = {
  "rascunho": "Rascunho",
  "em revisao": "Em revisão",
  "concluida": "Concluída",
  "compartilhada com educador": "Compartilhada com educador",
  "selecionada para antologia": "Selecionada para antologia",
  "arquivada": "Arquivada"
};
let toastSequence = 0;

function getConfiguredSextilhaDataSource() {
  if (window.InannaSupabaseBridge?.isConfigured?.()) {
    return SUPABASE_SEXTILHA_MODE;
  }
  return "unconfigured";
}

// ── Banco de Curadoria Local (Fallback/Library Pré-Programado) ────────
// Fallback local para desenvolvimento antes de conectar o placar Supabase.
const PLACAR_LIBRARY = [
  { posicao: "1º", autor: "Celinho da Paraíba", pontos: 12, timestamp: "2026-03-12T20:15:00.000Z", verso: "No sertão eu vi a poeira\nPlantar um sonho acordado\nSeco e quente meu roçado\nCantar a minha canseira" },
  { posicao: "2º", autor: "Maria Bonita", pontos: 9, timestamp: "2026-03-12T19:40:00.000Z", verso: "A fogueira incendeia o salão\nPara pular minha festança\nColorido passo de dança\nNo compasso do baião" }
];

// ── Temas / Contextos ────────────────────────────────────────────────
const THEMES = [
  {
    key: "nordeste", name: "Nordeste", emoji: "🌵",
    desc: "Sertão, forró, cordel e caatinga",
    trap: "Ex: No sertão muito quente falta a ___",
    tokens: {
      substantivos: ["sol", "fogo", "aridez", "chuva", "poeira", "calor"],
      verbos: ["plantar", "colher", "rezar", "cantar", "agradecer", "resistir"],
      adjetivos: ["seco", "quente", "forte", "bravo", "lindo", "valente"],
      lugares: ["sertão", "caatinga", "roçado", "açude", "feira", "litoral"],
      acoes: ["cantoria", "luta", "jornada", "viagem", "reza"],
      objetosCulturais: ["cordel", "sanfona", "xote", "baião", "mandacaru", "chapéu", "zabumba"]
    }
  },
  {
    key: "festajunina", name: "Festa Junina", emoji: "🎆",
    desc: "Fogueira, quadrilha, arraiá e balão",
    trap: "Ex: O céu está estrelado para soltar o ___",
    tokens: {
      substantivos: ["fogueira", "balão", "milho", "pamonha", "canjica", "quentão", "festa"],
      verbos: ["pular", "dançar", "festejar", "brincar", "sorrir", "comer"],
      adjetivos: ["colorido", "animado", "frio", "caipira", "estrelado"],
      lugares: ["arraiá", "roça", "terreiro", "praça", "salão"],
      acoes: ["quadrilha", "casamento", "brincadeira", "pescaria"],
      objetosCulturais: ["bandeirinha", "chita", "sanfona", "chapéu", "bombinha"]
    }
  },
  {
    key: "praia", name: "Praia", emoji: "🌊",
    desc: "Mar, areia, sol e vento",
    trap: "Ex: No calor eu gosto de mergulhar no ___",
    tokens: {
      substantivos: ["mar", "onda", "areia", "sol", "vento", "sal", "concha", "calor"],
      verbos: ["mergulhar", "nadar", "brincar", "relaxar", "queimar"],
      adjetivos: ["azul", "refrescante", "gelado", "salgado", "lindo"],
      lugares: ["praia", "cais", "orla", "oceano", "maré"],
      acoes: ["mergulho", "passeio", "corrida", "descanso"],
      objetosCulturais: ["farol", "barco", "rede", "prancha", "coqueiro"]
    }
  },
  {
    key: "rua", name: "Rua", emoji: "🏙️",
    desc: "Calçada, busão, correria urbana",
    trap: "Ex: Na correria urbana da cidade peguei o ___",
    tokens: {
      substantivos: ["rua", "gente", "barulho", "respiro", "cidade", "multidão"],
      verbos: ["correr", "andar", "trabalhar", "buscar", "viver"],
      adjetivos: ["rápido", "cinza", "cheio", "vivo", "intenso"],
      lugares: ["esquina", "calçada", "beco", "ponto", "asfalto"],
      acoes: ["correria", "trampo", "espera", "passo"],
      objetosCulturais: ["ônibus", "sinaleira", "sirene", "vitrine", "ônibus"]
    }
  },
  {
    key: "escola", name: "Escola", emoji: "📚",
    desc: "Caderno, lousa, turma e aprendizado",
    trap: "Ex: O professor desenhou o mapa na ___",
    tokens: {
      substantivos: ["pergunta", "resposta", "descoberta", "respeito", "atenção"],
      verbos: ["ler", "escrever", "aprender", "ensinar", "saber"],
      adjetivos: ["curioso", "difícil", "fácil", "novo", "amigo"],
      lugares: ["escola", "sala", "pátio", "quadra", "biblioteca"],
      acoes: ["lição", "leitura", "debate", "recreio"],
      objetosCulturais: ["caderno", "lousa", "prova", "sinal", "livro", "lápis"]
    }
  },
  {
    key: "faculdade", name: "Faculdade", emoji: "🎓",
    desc: "Aulas, ciência, campus e futuro",
    trap: "Ex: Eu entrei na biblioteca pra ler um ___",
    tokens: {
      substantivos: ["ciência", "futuro", "certeza", "dúvida", "grupo"],
      verbos: ["estudar", "formar", "pesquisar", "inovar", "apresentar"],
      adjetivos: ["complexo", "inteligente", "longo", "focado"],
      lugares: ["faculdade", "lab", "campus", "auditório"],
      acoes: ["pesquisa", "projeto", "prova", "defesa"],
      objetosCulturais: ["tese", "diploma", "artigo", "livro"]
    }
  },
  {
    key: "amizade", name: "Amizade", emoji: "🤝",
    desc: "Abraço, confiança e companheirismo",
    trap: "Ex: Um amigo de verdade sempre te dá um forte ___",
    tokens: {
      substantivos: ["abraço", "confiança", "lealdade", "carinho", "parceria"],
      verbos: ["ajudar", "ouvir", "falar", "sorrir", "apoiar"],
      adjetivos: ["sincero", "verdadeiro", "feliz", "junto"],
      lugares: ["casa", "esquina", "festa", "viagem"],
      acoes: ["conversa", "risada", "encontro", "caminho"],
      objetosCulturais: ["presente", "foto", "lembrança", "carta"]
    }
  },
  {
    key: "pet", name: "Pet", emoji: "🐾",
    desc: "Gatos, cães, carinho e ronrono",
    trap: "Ex: O meu cachorro faminto tentou comer a ___",
    tokens: {
      substantivos: ["carinho", "pata", "focinho", "ternura", "amor"],
      verbos: ["brincar", "correr", "dormir", "comer", "adotar"],
      adjetivos: ["peludo", "fiel", "engraçado", "manso", "ligeiro"],
      lugares: ["casa", "quintal", "parque", "sofá"],
      acoes: ["miado", "latido", "ronronar", "passeio"],
      objetosCulturais: ["coleira", "ração", "brinquedo", "abrigo"]
    }
  },
  {
    key: "trabalho", name: "Trabalho", emoji: "⚒️",
    desc: "Turno, esforço, dignidade e suor",
    trap: "Ex: Bati o meu ponto lá na porta da ___",
    tokens: {
      substantivos: ["esforço", "dignidade", "suor", "grana", "meta"],
      verbos: ["trabalhar", "lutar", "construir", "conquistar", "cansar"],
      adjetivos: ["duro", "honesto", "focado", "rotineiro"],
      lugares: ["fábrica", "ofício", "loja", "escritório"],
      acoes: ["turno", "tarefa", "rotina", "correria"],
      objetosCulturais: ["ferramenta", "computador", "café", "uniforme"]
    }
  },
  {
    key: "esporte", name: "Esporte", emoji: "⚽",
    desc: "Gol, suor, torcida e campo",
    trap: "Ex: O atacante habilidoso driblou com a ___",
    tokens: {
      substantivos: ["gol", "torcida", "suor", "alegria", "raça", "vitória"],
      verbos: ["correr", "chutar", "vencer", "perder", "treinar"],
      adjetivos: ["rápido", "forte", "cansado", "campeão"],
      lugares: ["campo", "quadra", "estádio", "pista"],
      acoes: ["drible", "corrida", "grito", "virada"],
      objetosCulturais: ["bola", "camisa", "troféu", "placar"]
    }
  },
  {
    key: "academia", name: "Academia", emoji: "🏋️",
    desc: "Treino, peso, saúde e determinação",
    trap: "Ex: Fiz muita força levantando o ___",
    tokens: {
      substantivos: ["saúde", "energia", "músculo", "meta", "força"],
      verbos: ["treinar", "levantar", "puxar", "suar", "focar"],
      adjetivos: ["pesado", "intenso", "forte", "firme"],
      lugares: ["academia", "sala", "máquina", "esteira"],
      acoes: ["treino", "esforço", "corrida", "série"],
      objetosCulturais: ["peso", "halter", "música", "garrafa"]
    }
  },
  {
    key: "parque", name: "Parque", emoji: "🌿",
    desc: "Brisa, sombra, lago e pássaro",
    trap: "Ex: Eu fui descasar sob a sombra da ___",
    tokens: {
      substantivos: ["brisa", "sombra", "calma", "natureza", "silêncio"],
      verbos: ["passear", "sentar", "respirar", "observar", "descansar"],
      adjetivos: ["verde", "fresco", "tranquilo", "livre"],
      lugares: ["parque", "lago", "grama", "árvore", "bosque"],
      acoes: ["passeio", "corrida", "caminho", "piquenique"],
      objetosCulturais: ["banco", "bicicleta", "balanço", "pipa"]
    }
  },
  {
    key: "shopping", name: "Shopping", emoji: "🛍️",
    desc: "Lojas, vitrines, compras e praça",
    trap: "Ex: Parei no corredor para ver a de roupa ___",
    tokens: {
      substantivos: ["movimento", "moda", "encontro", "brilho", "roupa"],
      verbos: ["comprar", "olhar", "passear", "comer", "escolher"],
      adjetivos: ["caro", "bonito", "cheio", "claro"],
      lugares: ["loja", "shopping", "praça", "cinema", "corredor"],
      acoes: ["compras", "passeio", "lanche", "filme"],
      objetosCulturais: ["vitrine", "sacola", "cartão", "ingresso"]
    }
  },
  {
    key: "aniversario", name: "Aniversário", emoji: "🎂",
    desc: "Bolo, festa, parabéns e velinha",
    trap: "Ex: Eu acendi a vela no topo do ___",
    tokens: {
      substantivos: ["festa", "alegria", "família", "amigos", "desejo"],
      verbos: ["celebrar", "cantar", "agradecer", "rir", "comer"],
      adjetivos: ["feliz", "doce", "surpreso", "especial"],
      lugares: ["salão", "casa", "quintal", "festa"],
      acoes: ["canto", "surpresa", "abraço", "brincadeira"],
      objetosCulturais: ["bolo", "velinha", "parabéns", "presente", "balão"]
    }
  },
  {
    key: "danca", name: "Dança", emoji: "💃",
    desc: "Ritmo, passo, compasso e ginga",
    trap: "Ex: Pulei e dancei no compasso da ___",
    tokens: {
      substantivos: ["ritmo", "ginga", "corpo", "suor", "arte", "sentimento"],
      verbos: ["dançar", "pular", "girar", "sentir", "marcar"],
      adjetivos: ["leve", "rápido", "sincronizado", "livre"],
      lugares: ["salão", "palco", "rua", "festa"],
      acoes: ["passo", "compasso", "giro", "salto", "apresentação"],
      objetosCulturais: ["música", "roupa", "sapato", "figurino"]
    }
  },
  {
    key: "cultura", name: "Cultura Popular", emoji: "🎭",
    desc: "Mito, lenda, raiz e tradição",
    trap: "Ex: O avô na roda ensinava sobre a ___",
    tokens: {
      substantivos: ["povo", "história", "conto", "memória", "arte", "mistério"],
      verbos: ["contar", "ensinar", "lembrar", "guardar", "brincar"],
      adjetivos: ["antigo", "popular", "mágico", "verdadeiro"],
      lugares: ["roda", "rua", "terreiro", "praça", "nordeste"],
      acoes: ["mito", "lenda", "tradição", "raiz"],
      objetosCulturais: ["mestre", "brincante", "fantasia", "máscara", "folclore"]
    }
  },
  {
    key: "musica", name: "Música", emoji: "🎸",
    desc: "Som, acorde, letra e emoção",
    trap: "Ex: Eu fechei os olhos pra curtir esse ___",
    tokens: {
      substantivos: ["som", "emoção", "voz", "ritmo", "ouvido"],
      verbos: ["tocar", "cantar", "ouvir", "sentir", "compor"],
      adjetivos: ["alto", "suave", "afinada", "bonita", "melódico"],
      lugares: ["festa", "palco", "estúdio", "show"],
      acoes: ["compasso", "melodia", "acorde", "ensaio"],
      objetosCulturais: ["violão", "tambor", "letra", "partitura", "banda"]
    }
  },
  {
    key: "tecnologia", name: "Tecnologia", emoji: "💻",
    desc: "Código, tela, fibra e futuro",
    trap: "Ex: Digitando muito de frente pra essa ___",
    tokens: {
      substantivos: ["código", "dados", "rede", "senha", "nuvem"],
      verbos: ["programar", "conectar", "inovar", "digitar", "processar"],
      adjetivos: ["rápido", "virtual", "digital", "moderno", "inteligente"],
      lugares: ["tela", "mundo", "espaço", "matriz"],
      acoes: ["conexão", "download", "clique", "algoritmo"],
      objetosCulturais: ["computador", "celular", "sistema", "internet", "robô"]
    }
  },
  {
    key: "casa", name: "Casa", emoji: "🏠",
    desc: "Lar, quintal, cuidado e memória afetiva",
    trap: "Ex: No fim da tarde eu volto para minha ___",
    tokens: {
      substantivos: [
        "casa", "lar", "porta", "janela", "quintal", "cozinha",
        "mesa", "rede", "família", "memória", "abrigo", "morada",
        "telhado", "parede", "chão", "cheiro", "cuidado", "aconchego"
      ],
      verbos: [
        "morar", "voltar", "cuidar", "varrer", "cozinhar", "acolher",
        "lembrar", "descansar", "brincar", "arrumar", "plantar", "sonhar"
      ],
      adjetivos: [
        "simples", "antigo", "quente", "calmo", "cheiroso", "seguro",
        "pequeno", "grande", "familiar", "querido", "aberto", "iluminado"
      ],
      lugares: [
        "sala", "quarto", "cozinha", "quintal", "varanda", "terreiro",
        "porta", "janela", "rua", "beco", "vila", "comunidade"
      ],
      acoes: [
        "chegada", "partilha", "descanso", "conversa", "brincadeira",
        "lembrança", "acolhida", "cuidado", "reunião", "visita"
      ],
      objetosCulturais: [
        "rede", "panela", "fogão", "mesa", "cadeira", "lamparina",
        "fotografia", "vaso", "rádio", "caderno", "colcha", "chave"
      ]
    }
  },
  {
    key: "mitologia-brasileira", name: "Mitologia Brasileira", emoji: "🌀",
    desc: "Lendas, encantados, floresta e imaginação popular",
    trap: "Ex: Na mata escura apareceu o velho ___",
    tokens: {
      substantivos: [
        "saci", "iara", "curupira", "boitatá", "caipora", "cuca",
        "boto", "mapinguari", "encanto", "mistério", "lenda", "floresta",
        "rio", "mata", "lua", "fogo", "assobio", "travessura"
      ],
      verbos: [
        "assobiar", "encantar", "proteger", "correr", "sumir", "aparecer",
        "enganar", "guardar", "nadar", "brilhar", "contar", "escutar"
      ],
      adjetivos: [
        "mágico", "antigo", "encantado", "brasileiro", "travesso",
        "misterioso", "valente", "noturno", "vermelho", "profundo",
        "selvagem", "luminoso"
      ],
      lugares: [
        "mata", "floresta", "rio", "lagoa", "trilha", "aldeia",
        "roçado", "sertão", "beira-rio", "cachoeira", "capoeira", "brejo"
      ],
      acoes: [
        "aparição", "travessura", "proteção", "encantamento", "fuga",
        "canto", "assobio", "mistério", "história", "contação"
      ],
      objetosCulturais: [
        "gorro", "cachimbo", "redemoinho", "fogueira", "canoa",
        "pente", "concha", "máscara", "tambor", "amuleto", "lenda", "conto"
      ]
    }
  },
  {
    key: "tradicoes-afro-brasileiras", name: "Tradições afro-brasileiras", emoji: "🥁",
    desc: "Ancestralidade, roda, tambor, corpo e memória coletiva",
    trap: "Ex: No toque do tambor eu senti muito ___",
    tokens: {
      substantivos: [
        "axé", "tambor", "roda", "terreiro", "ancestralidade", "memória",
        "corpo", "canto", "dança", "respeito", "comunidade", "oralidade",
        "força", "raiz", "fé", "tradição", "ginga", "energia"
      ],
      verbos: [
        "tocar", "dançar", "cantar", "saudar", "respeitar", "lembrar",
        "celebrar", "gingar", "escutar", "aprender", "partilhar", "honrar"
      ],
      adjetivos: [
        "ancestral", "sagrado", "coletivo", "forte", "vivo", "ritmado",
        "profundo", "brasileiro", "afro", "popular", "respeitoso", "luminoso"
      ],
      lugares: [
        "terreiro", "roda", "rua", "praça", "comunidade", "cozinha",
        "mercado", "ladeira", "pelourinho", "salvador", "bahia", "quintal"
      ],
      acoes: [
        "toque", "ginga", "canto", "dança", "celebração", "saudação",
        "partilha", "escuta", "memória", "ensinamento", "festa", "roda"
      ],
      objetosCulturais: [
        "atabaque", "agogô", "berimbau", "pandeiro", "tambor", "saia",
        "conta", "fio", "acarajé", "dendê", "capoeira", "afoxé",
        "ijexá", "maracatu", "samba", "abará"
      ]
    }
  },
  {
    key: "promocao-da-paz", name: "Promoção da paz", emoji: "🕊️",
    desc: "Diálogo, escuta, respeito e convivência",
    trap: "Ex: Quando a briga terminou nasceu a ___",
    tokens: {
      substantivos: [
        "paz", "diálogo", "escuta", "respeito", "cuidado", "perdão",
        "justiça", "esperança", "abraço", "ponte", "acordo", "amizade",
        "convivência", "solidariedade", "ternura", "calma", "união", "confiança"
      ],
      verbos: [
        "ouvir", "acolher", "dialogar", "cuidar", "perdoar", "mediar",
        "pacificar", "respeitar", "abraçar", "reparar", "conversar", "unir"
      ],
      adjetivos: [
        "calmo", "justo", "sereno", "solidário", "fraterno", "gentil",
        "humano", "coletivo", "sincero", "possível", "necessário", "vivo"
      ],
      lugares: [
        "escola", "rua", "casa", "praça", "comunidade", "sala",
        "bairro", "mundo", "roda", "cidade", "pátio", "família"
      ],
      acoes: [
        "escuta", "mediação", "acordo", "reconciliação", "conversa",
        "acolhida", "cuidado", "partilha", "abraço", "respeito", "encontro"
      ],
      objetosCulturais: [
        "pomba", "bandeira", "carta", "cartaz", "roda", "microfone",
        "livro", "ponte", "flor", "mural", "mensagem", "canção"
      ]
    }
  },
  {
    key: "mulher", name: "Mulher", emoji: "♀️",
    desc: "Voz, cuidado, força, autoria e futuro",
    trap: "Ex: Na roda ela levantou sua ___",
    tokens: {
      substantivos: [
        "mulher", "voz", "força", "autoria", "cuidado", "coragem",
        "memória", "trabalho", "sonho", "ciência", "poesia", "direito",
        "roda", "família", "liderança", "esperança", "respeito", "futuro"
      ],
      verbos: [
        "criar", "cuidar", "liderar", "ensinar", "trabalhar", "sonhar",
        "resistir", "poetar", "descobrir", "proteger", "falar", "brilhar"
      ],
      adjetivos: [
        "forte", "livre", "sábia", "criativa", "corajosa", "inteira",
        "presente", "digna", "popular", "brasileira", "jovem", "ancestral"
      ],
      lugares: [
        "casa", "escola", "rua", "roda", "palco", "laboratório",
        "campo", "cidade", "comunidade", "terreiro", "biblioteca", "oficina"
      ],
      acoes: [
        "fala", "escuta", "liderança", "partilha", "pesquisa", "cuidado",
        "defesa", "criação", "conquista", "aprendizado", "poesia", "encontro"
      ],
      objetosCulturais: [
        "caderno", "microfone", "livro", "agulha", "panela", "tambor",
        "violão", "computador", "jaleco", "lenço", "cordel", "flor"
      ]
    }
  }
];

const BACKUP_TOKENS = {
  substantivos: ["caminho", "sonho", "memória", "canto", "luta", "raiz", "silêncio", "encontro", "vento"],
  verbos: ["ver", "sentir", "lembrar", "buscar", "cantar", "viver", "dançar"],
  adjetivos: ["suave", "forte", "claro", "profundo", "lindo", "firme"],
  lugares: ["chão", "mar", "céu", "praça", "rua"],
  acoes: ["pulo", "abraço", "grito", "sorriso"],
  objetosCulturais: ["sanfona", "viola", "cordel", "pandeiro"]
};

const FALLBACK_TOKENS = Object.values(BACKUP_TOKENS).flat();

// ── Helpers ───────────────────────────────────────────────────────────
function norm(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function normalizeVerseAnalysisText(value) {
  return norm(
    String(value || "")
      .replace(/_+/g, " ")
      .replace(/[\p{P}\p{S}]+/gu, " ")
  ).replace(/\s+/g, " ").trim();
}

function tokenizeVerseAnalysisText(value) {
  return normalizeVerseAnalysisText(value).split(/\s+/).filter(Boolean);
}

function normalizeVerseForSyllableCount(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/_+/g, " ")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function formatPct(x) { return `${Math.round(x * 100)}%`; }

function padClockUnit(value) {
  return String(value).padStart(2, "0");
}

function formatElapsedClock(ms) {
  const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${padClockUnit(hours)}:${padClockUnit(minutes)}:${padClockUnit(seconds)}`;
  }

  return `${padClockUnit(minutes)}:${padClockUnit(seconds)}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

function getWritingElapsedMs() {
  if (state.writingTimerRunning && state.writingStartedAt) {
    return Math.max(0, Date.now() - state.writingStartedAt);
  }
  return Math.max(0, state.writingElapsedMs || 0);
}

function refreshWritingTimerUI() {
  if (!ui.writeTimer) return;
  ui.writeTimer.textContent = formatElapsedClock(getWritingElapsedMs());
}

function stopWritingTimer() {
  if (state.writingTimerRunning) {
    state.writingElapsedMs = getWritingElapsedMs();
    state.writingStartedAt = 0;
    state.writingTimerRunning = false;
  }

  if (state.writingTimerId) {
    window.clearInterval(state.writingTimerId);
    state.writingTimerId = null;
  }

  refreshWritingTimerUI();
}

function startWritingTimer() {
  stopWritingTimer();
  state.writingElapsedMs = 0;
  state.writingStartedAt = Date.now();
  state.writingTimerRunning = true;
  refreshWritingTimerUI();
  state.writingTimerId = window.setInterval(refreshWritingTimerUI, 1000);
}

function resetWritingTimer(options) {
  const settings = Object.assign({ autostart: false }, options);
  stopWritingTimer();
  state.writingStartedAt = 0;
  state.writingElapsedMs = 0;
  refreshWritingTimerUI();
  if (settings.autostart) {
    startWritingTimer();
  }
}

function splitQuadraLines(verseText) {
  return String(verseText || "")
    .replace(/\r\n?/g, "\n")
    .split(/\n+/)
    .map((line) => String(line || "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function splitVerseEnding(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed) {
    return { body: "", ending: "", punctuation: "" };
  }

  const tokenMatch = trimmed.match(/^(.*?)(\S+)$/);
  const rawBody = tokenMatch ? tokenMatch[1].trimEnd() : "";
  const rawEnding = tokenMatch ? tokenMatch[2] : trimmed;
  const punctuationMatch = rawEnding.match(/^(.+?)([.,;:!?…]+)$/);

  return {
    body: rawBody,
    ending: punctuationMatch ? punctuationMatch[1] : rawEnding,
    punctuation: punctuationMatch ? punctuationMatch[2] : "",
  };
}

function renderQuadraVerses(verseText) {
  const lines = splitQuadraLines(verseText);

  if (!lines.length) {
    return `<div class="placar-quadra placar-quadra-empty">Quadra indisponível.</div>`;
  }

  return `
    <div class="placar-quadra" role="group" aria-label="Quadra em ${lines.length} versos">
      ${lines.map((line, index) => {
        const parts = splitVerseEnding(line);
        const bodyMarkup = parts.body
          ? `<span class="placar-line-body">${escapeHtml(parts.body)}</span>`
          : (parts.ending ? `<span class="placar-line-body"></span>` : `<span class="placar-line-body placar-line-body-empty">—</span>`);
        const endingMarkup = parts.ending
          ? `<span class="placar-line-ending">${escapeHtml(parts.ending)}</span>`
          : "";
        const punctuationMarkup = parts.punctuation
          ? `<span class="placar-line-punctuation">${escapeHtml(parts.punctuation)}</span>`
          : "";

        return `
          <div class="placar-line">
            <span class="placar-line-num">${index + 1}</span>
            ${bodyMarkup}
            <span class="placar-line-rhyme">
              ${endingMarkup}${punctuationMarkup}
            </span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function setExplain(msg) {
  if (ui.explainBox) ui.explainBox.textContent = msg || "";
}

function setStartHint(msg, color) {
  if (!ui.startHint) return;
  ui.startHint.textContent = msg || "";
  ui.startHint.style.color = color || "var(--muted)";
}

function buildLocalViewerKey() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID().replace(/[^A-Za-z0-9_-]+/g, "");
  }
  return `viewer_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function getPlacarReactionViewerKey() {
  if (!window.localStorage) {
    window.__INANNA_PLACAR_VIEWER_KEY = window.__INANNA_PLACAR_VIEWER_KEY || buildLocalViewerKey();
    return window.__INANNA_PLACAR_VIEWER_KEY;
  }

  try {
    var existing = window.localStorage.getItem(PLACAR_REACTION_VIEWER_STORAGE_KEY);
    if (existing) return existing;
    var created = buildLocalViewerKey();
    window.localStorage.setItem(PLACAR_REACTION_VIEWER_STORAGE_KEY, created);
    return created;
  } catch (_) {
    window.__INANNA_PLACAR_VIEWER_KEY = window.__INANNA_PLACAR_VIEWER_KEY || buildLocalViewerKey();
    return window.__INANNA_PLACAR_VIEWER_KEY;
  }
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isAdminEmail(email = state.email) {
  return INANNA_ADMIN_EMAILS.has(normalizeEmail(email));
}

function emptyMasteryState() {
  return MASTERY_CRITERIA.reduce((acc, item) => {
    acc[item.key] = false;
    return acc;
  }, {});
}

function emptySchemesUsed() {
  return { AABB: 0, ABAB: 0, ABBA: 0 };
}

function getProgressPlayerId() {
  return String(
    state.participantId
    || state.checkinUserId
    || normalizeEmail(state.email)
    || "visitante"
  ).trim();
}

function getStoredPlayerDisplayName() {
  try {
    return String(window.localStorage?.getItem(PLAYER_DISPLAY_NAME_STORAGE_KEY) || "").trim();
  } catch (_) {
    return "";
  }
}

function getPlayerDisplayName() {
  return String(
    getStoredPlayerDisplayName()
    || state.playerProgress?.nickname
    || state.name
    || state.playerData?.nome
    || state.playerData?.name
    || "Participante"
  ).trim();
}

function savePlayerDisplayName(value) {
  const nickname = String(value || "").trim().slice(0, 40) || "Participante";
  try {
    window.localStorage?.setItem(PLAYER_DISPLAY_NAME_STORAGE_KEY, nickname);
    window.localStorage?.setItem(LEVEL2_NICKNAME_STORAGE_KEY, nickname);
  } catch (_) {
    // Persistencia local e opcional.
  }
  const progress = ensurePlayerProgress();
  savePlayerProgress({ ...progress, nickname });
  state.level2.nickname = nickname;
  if (ui.level2NicknameInput) ui.level2NicknameInput.value = nickname;
  renderPlayerPanel();
  return nickname;
}

function createDefaultPlayerProgress() {
  return {
    playerId: getProgressPlayerId(),
    nickname: getPlayerDisplayName(),
    levelUnlocked: 1,
    perfectQuadrasCount: 0,
    uniquePerfectQuadraHashes: [],
    mastery: emptyMasteryState(),
    schemesUsed: emptySchemesUsed(),
    totalChallengeQuadras: 0,
    bestScore: 0,
    scoreHistory: [],
    lastUpdatedAt: new Date().toISOString()
  };
}

const SCORE_HISTORY_LIMIT = 20;

// Normaliza um registro de sessão para o histórico longitudinal (medir trajetória,
// não só acerto — analise-inanna.md §55-60). Guarda total + dimensões qualitativas.
function buildScoreHistoryEntry(scoreBreakdown) {
  const rhyme = scoreBreakdown.rhyme || {};
  return {
    total: Number(scoreBreakdown.total || 0),
    rima: Number(rhyme.pairScoreTotal || 0) + Number(rhyme.schemeBonus || 0),
    forma: Number(scoreBreakdown.structure?.points || 0),
    criatividade: Number(scoreBreakdown.creativity?.bonus || 0)
      + Number(scoreBreakdown.originality?.bonus || 0)
      + Number(scoreBreakdown.independence?.bonus || 0),
    at: new Date().toISOString()
  };
}

// Mede a curva de evolução (média móvel) em vez de só limiares absolutos.
function computeProgressTrajectory(progress) {
  const history = Array.isArray(progress?.scoreHistory) ? progress.scoreHistory : [];
  if (history.length < 3) return null;
  const latest = history[history.length - 1];
  const recentPrev = history.slice(0, -1).slice(-5);
  if (!recentPrev.length) return null;
  const avg = (arr, key) => arr.reduce((s, e) => s + Number(e[key] || 0), 0) / arr.length;
  const delta = Number(latest.total || 0) - avg(recentPrev, "total");
  let bestDim = null;
  let bestGain = -Infinity;
  ["rima", "forma", "criatividade"].forEach((d) => {
    const gain = Number(latest[d] || 0) - avg(recentPrev, d);
    if (gain > bestGain) { bestGain = gain; bestDim = d; }
  });
  const trend = delta >= 1 ? "subindo" : delta <= -1 ? "ajustando" : "estavel";
  return { trend, delta, bestDim, bestGain, latest: Number(latest.total || 0), count: history.length };
}

// Recorde pessoal / "você está melhorando" — enquadramento longitudinal (§57, §60).
function renderTrajectoryHTML(progressUpdate) {
  const progress = progressUpdate?.progress;
  const traj = computeProgressTrajectory(progress);
  if (!progress || !traj) return "";
  const dimLabel = traj.bestGain > 0 && traj.bestDim ? traj.bestDim : "";
  const isRecord = traj.latest >= Number(progress.bestScore || 0) && Number(progress.totalChallengeQuadras || 0) > 1;
  let msg;
  if (isRecord) {
    msg = `🏆 Recorde pessoal! ${traj.latest} pontos — superou sua melhor marca.`;
  } else if (traj.trend === "subindo") {
    msg = `📈 Você está melhorando${dimLabel ? " em " + dimLabel : ""} — ${Math.round(traj.delta)} acima da sua média recente.`;
  } else if (traj.trend === "ajustando") {
    msg = "🎯 Essa ficou abaixo da sua média — siga tentando, sua curva sobe com o tempo.";
  } else {
    msg = `📊 Mantendo o nível${dimLabel ? ", com ganho em " + dimLabel : ""}.`;
  }
  return `<p class="verse-hint" style="margin-top:6px;">${msg}</p>`;
}

function hydratePlayerProgress(rawProgress = {}) {
  const fallback = createDefaultPlayerProgress();
  const progress = {
    ...fallback,
    ...rawProgress,
    playerId: getProgressPlayerId(),
    nickname: getStoredPlayerDisplayName() || state.name || rawProgress.nickname || fallback.nickname,
    levelUnlocked: Math.max(1, Math.min(3, Number(rawProgress.levelUnlocked || fallback.levelUnlocked) || 1)),
    perfectQuadrasCount: Math.max(0, Number(rawProgress.perfectQuadrasCount || 0) || 0),
    uniquePerfectQuadraHashes: Array.isArray(rawProgress.uniquePerfectQuadraHashes)
      ? rawProgress.uniquePerfectQuadraHashes.filter(Boolean)
      : [],
    mastery: {
      ...emptyMasteryState(),
      ...(rawProgress.mastery || {})
    },
    schemesUsed: {
      ...emptySchemesUsed(),
      ...(rawProgress.schemesUsed || {})
    },
    totalChallengeQuadras: Math.max(0, Number(rawProgress.totalChallengeQuadras || 0) || 0),
    bestScore: Math.max(0, Number(rawProgress.bestScore || 0) || 0),
    scoreHistory: Array.isArray(rawProgress.scoreHistory)
      ? rawProgress.scoreHistory.filter((entry) => entry && typeof entry === "object").slice(-SCORE_HISTORY_LIMIT)
      : [],
    lastUpdatedAt: rawProgress.lastUpdatedAt || fallback.lastUpdatedAt
  };
  if (isAdminEmail()) {
    progress.levelUnlocked = 3;
  }
  progress.perfectQuadrasCount = progress.uniquePerfectQuadraHashes.length || progress.perfectQuadrasCount;
  return progress;
}

function readStoredPlayerProgress() {
  try {
    const raw = window.localStorage?.getItem(PLAYER_PROGRESS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const playerId = getProgressPlayerId();
    if (parsed?.playerId === playerId) return parsed;
    if (parsed?.players?.[playerId]) return parsed.players[playerId];
  } catch (error) {
    console.debug("Nao foi possivel ler progresso local.", error);
  }
  return null;
}

function savePlayerProgress(progress) {
  const next = hydratePlayerProgress(progress);
  next.lastUpdatedAt = new Date().toISOString();
  state.playerProgress = next;
  try {
    window.localStorage?.setItem(PLAYER_PROGRESS_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.debug("Nao foi possivel salvar progresso local.", error);
  }
  syncLevel2TrackAccess();
  return next;
}

function loadPlayerProgress() {
  state.playerProgress = hydratePlayerProgress(readStoredPlayerProgress() || {});
  return state.playerProgress;
}

function ensurePlayerProgress() {
  if (!state.playerProgress || state.playerProgress.playerId !== getProgressPlayerId()) {
    return loadPlayerProgress();
  }
  return state.playerProgress;
}

function countMasteryCriteria(progress = ensurePlayerProgress()) {
  return MASTERY_CRITERIA.filter((item) => !!progress.mastery?.[item.key]).length;
}

function getProgressPercent(value, total) {
  return Math.max(0, Math.min(100, Math.round((Number(value || 0) / Math.max(1, total)) * 100)));
}

function normalizeQuadraForProgress(lines) {
  return (lines || [])
    .map((line) => normalizeVerseAnalysisText(line?.verse || line || ""))
    .join("\n")
    .trim();
}

function hashProgressText(value) {
  const text = String(value || "");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function getMasteryFlagsFromScore(scoreBreakdown) {
  const rhyme = scoreBreakdown?.rhyme || {};
  const pairScores = Array.isArray(rhyme.pairScores) ? rhyme.pairScores : [];
  return {
    formaMax: Number(scoreBreakdown?.structure?.points || 0) >= 1,
    rimaFinalMax: Number(rhyme.pairScoreTotal || 0) >= 6,
    esquemaForteMax: Number(rhyme.schemeBonus || 0) >= 3,
    criatividadeAutoralMax: Number(scoreBreakdown?.creativity?.bonus || 0) >= 4,
    independenciaMax: Number(scoreBreakdown?.independence?.bonus || 0) >= 2,
    semRepeticaoFinal: Number(rhyme.repeatedEndingPenalty || 0) === 0,
    semFalhaDeRima: pairScores.length === 2 && pairScores.every((score) => Number(score || 0) > 0),
    doisEsquemasUsados: false
  };
}

function updatePlayerProgressAfterChallengeQuadra(scoreBreakdown) {
  if (!state.modeChallenge || !scoreBreakdown) return null;
  const before = hydratePlayerProgress(ensurePlayerProgress());
  const progress = hydratePlayerProgress(before);
  const rhyme = scoreBreakdown.rhyme || {};
  const scheme = ["AABB", "ABAB", "ABBA"].includes(rhyme.expectedScheme)
    ? rhyme.expectedScheme
    : ["AABB", "ABAB", "ABBA"].includes(rhyme.scheme)
      ? rhyme.scheme
      : "";
  const flags = getMasteryFlagsFromScore(scoreBreakdown);
  const normalizedQuadra = normalizeQuadraForProgress(state.lines);
  const quadraHash = normalizedQuadra ? hashProgressText(normalizedQuadra) : "";
  const isPerfect = Number(scoreBreakdown.total || 0) >= CHALLENGE_MAX_SCORE
    && flags.formaMax
    && flags.rimaFinalMax
    && flags.esquemaForteMax
    && flags.criatividadeAutoralMax
    && flags.independenciaMax
    && flags.semRepeticaoFinal
    && flags.semFalhaDeRima
    && !!scheme;
  const duplicatePerfect = isPerfect && quadraHash && progress.uniquePerfectQuadraHashes.includes(quadraHash);

  progress.totalChallengeQuadras += 1;
  progress.bestScore = Math.max(progress.bestScore, Number(scoreBreakdown.total || 0));
  if (scheme && flags.esquemaForteMax && flags.semFalhaDeRima) {
    progress.schemesUsed[scheme] = Number(progress.schemesUsed[scheme] || 0) + 1;
  }

  Object.entries(flags).forEach(([key, value]) => {
    if (key !== "doisEsquemasUsados" && value) progress.mastery[key] = true;
  });
  progress.mastery.doisEsquemasUsados = Object.values(progress.schemesUsed).filter((count) => Number(count || 0) > 0).length >= 2;

  if (isPerfect && quadraHash && !duplicatePerfect) {
    progress.uniquePerfectQuadraHashes.push(quadraHash);
  }
  progress.perfectQuadrasCount = progress.uniquePerfectQuadraHashes.length;

  // Trajetória longitudinal: registra a sessão antes de derivar a tendência.
  progress.scoreHistory = [...(progress.scoreHistory || []), buildScoreHistoryEntry(scoreBreakdown)].slice(-SCORE_HISTORY_LIMIT);

  const unlockByPerfectQuadras = progress.perfectQuadrasCount >= 5;
  const unlockByMastery = Object.values(progress.mastery).every(Boolean);
  if (unlockByPerfectQuadras || unlockByMastery) {
    progress.levelUnlocked = Math.max(progress.levelUnlocked, 2);
  }

  const saved = savePlayerProgress(progress);
  return {
    progress: saved,
    before,
    flags,
    isPerfect,
    duplicatePerfect,
    justUnlocked: before.levelUnlocked < 2 && saved.levelUnlocked >= 2,
    unlockByPerfectQuadras,
    unlockByMastery
  };
}

function getPerfectQuadrasMessage(progress) {
  const count = Number(progress?.perfectQuadrasCount || 0);
  if (count >= 5) return "Nível 2 desbloqueado pela excelência.";
  if (count >= 3) return "Você já domina boa parte da rima.";
  if (count >= 1) return "Primeira quadra perfeita registrada.";
  return "Comece sua jornada de maestria.";
}

function getLevel2StatusMessage(progress = ensurePlayerProgress()) {
  if (isAdminEmail()) {
    return "Credencial de administrador ativa: todos os níveis liberados.";
  }
  if (INANNA_LEVEL >= 2 && !INANNA_LEVEL2_ENABLED) {
    return "Nível 2 está configurado, mas a feature flag ainda está desligada.";
  }
  if (INANNA_LEVEL >= 2 && !INANNA_LEVEL2_REQUIRE_UNLOCK) {
    return "Nível 2 liberado em produção experimental.";
  }
  if (progress.levelUnlocked >= 2 && INANNA_LEVEL >= 2 && INANNA_LEVEL2_ENABLED) {
    return "Nível 2 liberado: a peleja com Inanna está pronta.";
  }
  if (progress.levelUnlocked >= 2) {
    return "Nível 2 conquistado; será ativado quando a produção mudar para o nível 2.";
  }
  const missing = MASTERY_CRITERIA.length - countMasteryCriteria(progress);
  return `Bloqueado: faltam ${Math.max(0, 5 - progress.perfectQuadrasCount)} quadras perfeitas ou ${missing} marcas de maestria.`;
}

function canAccessLevel2Preview(progress = ensurePlayerProgress()) {
  if (isAdminEmail()) return INANNA_LEVEL >= 2 && INANNA_LEVEL2_ENABLED;
  if (INANNA_LEVEL < 2 || !INANNA_LEVEL2_ENABLED) return false;
  if (!INANNA_LEVEL2_REQUIRE_UNLOCK) return true;
  return Number(progress.levelUnlocked || 1) >= 2;
}

function syncLevel2TrackAccess(options = {}) {
  const progress = ensurePlayerProgress();
  const hasAccess = canAccessLevel2Preview(progress);
  const message = getLevel2StatusMessage(progress);

  if (ui.chooseLevel2TrackBtn) {
    ui.chooseLevel2TrackBtn.disabled = !hasAccess;
    ui.chooseLevel2TrackBtn.title = hasAccess ? "" : LEVEL2_LOCKED_NOTICE;
  }
  if (ui.level2AccessNotice) {
    ui.level2AccessNotice.textContent = message;
    ui.level2AccessNotice.hidden = false;
  }
  if (ui.level2ProgressSummary) {
    ui.level2ProgressSummary.innerHTML = renderLevel2MiniProgress(progress);
  }
  if (!hasAccess && options.toast) {
    showToast(message || LEVEL2_LOCKED_NOTICE, "muted", { duration: 4600 });
  }
  return hasAccess;
}

function renderLevel2MiniProgress(progress = ensurePlayerProgress()) {
  const perfectPercent = getProgressPercent(progress.perfectQuadrasCount, 5);
  const masteryCount = countMasteryCriteria(progress);
  return `
    <div class="level2-mini-progress">
      <span>Quadras perfeitas: <strong>${Math.min(progress.perfectQuadrasCount, 5)}/5</strong></span>
      <span>Critérios dominados: <strong>${masteryCount}/${MASTERY_CRITERIA.length}</strong></span>
      <span class="level2-mini-progress__bar" aria-hidden="true"><i style="width:${perfectPercent}%"></i></span>
    </div>
  `;
}

function renderMasteryProgressHTML(update) {
  const progress = update?.progress || ensurePlayerProgress();
  const perfectPercent = getProgressPercent(progress.perfectQuadrasCount, 5);
  const masteryCount = countMasteryCriteria(progress);
  const masteryPercent = getProgressPercent(masteryCount, MASTERY_CRITERIA.length);
  const pending = MASTERY_CRITERIA.filter((item) => !progress.mastery?.[item.key]);
  const unlocked = Number(progress.levelUnlocked || 1) >= 2;
  const status = update?.justUnlocked
    ? "Nível 2 desbloqueado! Você provou que a rima humana pode enfrentar a sedução da máquina."
    : unlocked
      ? "Nível 2 desbloqueado pela sua trilha de maestria."
      : `Faltam ${pending.length} marcas de maestria para liberar o Nível 2.`;
  const secondary = update?.justUnlocked
    ? "Agora a Inanna ficará mais persuasiva. Mas a vitória continua dependendo da sua autoria."
    : getPerfectQuadrasMessage(progress);
  const duplicateNote = update?.duplicatePerfect
    ? `<p class="mastery-panel__note">Esta quadra perfeita já tinha sido registrada; ela não aumenta o contador de quadras únicas.</p>`
    : "";
  const perfectNote = update?.isPerfect && !update?.duplicatePerfect
    ? `<p class="mastery-panel__note">Quadra perfeita única registrada nesta rodada.</p>`
    : "";
  const checklist = MASTERY_CRITERIA.map((item) => {
    const done = !!progress.mastery?.[item.key];
    return `<li class="${done ? "done" : "pending"}"><span>${done ? "✓" : "□"}</span>${escapeHtml(item.label)}</li>`;
  }).join("");

  return `
    <section class="mastery-panel ${unlocked ? "mastery-panel--unlocked" : ""}" aria-label="Trilha de Maestria da Quadra">
      <div class="mastery-panel__head">
        <div>
          <p class="mastery-panel__eyebrow">Trilha de Maestria da Quadra</p>
          <h3>Domine a rima humana antes de enfrentar a sedução do Nível 2.</h3>
        </div>
        <span class="mastery-panel__badge">${unlocked ? "Nível 2 desbloqueado" : "Nível 2 bloqueado"}</span>
      </div>
      <p class="mastery-panel__intro">Complete 5 quadras perfeitas ou domine todos os critérios para liberar o Nível 2.</p>
      <div class="mastery-grid">
        <div class="mastery-track">
          <div class="mastery-track__label"><span>Quadras perfeitas</span><strong>${Math.min(progress.perfectQuadrasCount, 5)}/5</strong></div>
          <div class="mastery-track__bar"><i style="width:${perfectPercent}%"></i></div>
          <p>${escapeHtml(getPerfectQuadrasMessage(progress))}</p>
        </div>
        <div class="mastery-track">
          <div class="mastery-track__label"><span>Critérios dominados</span><strong>${masteryCount}/${MASTERY_CRITERIA.length}</strong></div>
          <div class="mastery-track__bar mastery-track__bar--criteria"><i style="width:${masteryPercent}%"></i></div>
          <p>${escapeHtml(status)}</p>
        </div>
      </div>
      <ul class="mastery-checklist">${checklist}</ul>
      ${perfectNote}
      ${duplicateNote}
      <p class="mastery-panel__closing">${escapeHtml(secondary)}</p>
    </section>
  `;
}

function getLevel2DefaultNickname() {
  try {
    const stored = window.localStorage?.getItem(LEVEL2_NICKNAME_STORAGE_KEY);
    if (stored) return stored;
  } catch (_) {
    // localStorage pode falhar em modo privado.
  }
  return String(getPlayerDisplayName() || "Jogador").trim();
}

function saveLevel2Nickname(nickname) {
  try {
    window.localStorage?.setItem(LEVEL2_NICKNAME_STORAGE_KEY, nickname);
  } catch (_) {
    // Persistencia local e opcional.
  }
}

function setLevel2SessionStatus(message, color = "var(--muted)") {
  if (!ui.level2SessionStatus) return;
  ui.level2SessionStatus.textContent = message || "";
  ui.level2SessionStatus.style.color = color;
}

function renderLevel2PreviewPanel() {
  const progress = ensurePlayerProgress();
  if (!ui.level2PreviewStatus) return;
  const agentStatus = INANNA_LEVEL2_AGENT_URL
    ? "Agente conectado ao Worker."
    : "Agente remoto ainda não configurado; modo local de segurança será usado.";
  ui.level2PreviewStatus.innerHTML = `
    <div class="level2-preview-status">
      <strong>${escapeHtml(getLevel2StatusMessage(progress))}</strong>
      <p>A peleja começa com duas quadras; a terceira só entra se for preciso desempatar.</p>
      <p>${escapeHtml(agentStatus)}</p>
      ${renderLevel2MiniProgress(progress)}
    </div>
  `;
  if (ui.level2NicknameInput) ui.level2NicknameInput.value = getLevel2DefaultNickname();
}

function resetLevel2RoundInputs() {
  stopLevel2RevisionTimer();
  if (ui.level2OriginalInput) ui.level2OriginalInput.value = "";
  if (ui.level2FinalInput) {
    ui.level2FinalInput.value = "";
    ui.level2FinalInput.disabled = true;
  }
  if (ui.level2SubmitOriginalBtn) ui.level2SubmitOriginalBtn.disabled = false;
  if (ui.level2FinalizeRoundBtn) ui.level2FinalizeRoundBtn.disabled = true;
  if (ui.level2NextRoundBtn) ui.level2NextRoundBtn.hidden = true;
  if (ui.level2InannaResponse) {
    ui.level2InannaResponse.hidden = true;
    ui.level2InannaResponse.innerHTML = "";
  }
  if (ui.level2RevisionTimer) {
    ui.level2RevisionTimer.hidden = true;
    ui.level2RevisionTimer.textContent = "";
    ui.level2RevisionTimer.classList.remove("level2-timer--warn", "level2-timer--urgent");
  }
  if (ui.level2RoundFeedback) ui.level2RoundFeedback.innerHTML = "";
  syncLevel2PrimaryAction();
}

function resetLevel2State(keepIdentity = true) {
  const nickname = keepIdentity ? state.level2.nickname : "";
  const playerId = keepIdentity ? state.level2.playerId : "";
  stopLevel2RevisionTimer();
  state.level2 = {
    sessionId: "",
    playerId,
    nickname,
    inputMode: "written",
    soundMode: "none",
    roundState: LEVEL2_ROUND_STATES.COMPOSING_INITIAL,
    currentRound: 1,
    roundCount: 3,
    playerWins: 0,
    inannaWins: 0,
    theme: "",
    rhymeScheme: "AABB",
    originalQuadra: "",
    finalQuadra: "",
    inannaQuadra: "",
    stolenWords: [],
    generationProvider: "",
    revisionExpiresAt: 0,
    revisionTimerId: null,
    roundResults: [],
    roundClosed: false,
    matchFinished: false,
    lastRoundResult: null,
    themeContext: "",
    themeSource: "",
    audio: state.level2.audio || null,
    dictation: null
  };
}

function saveLevel2SessionSnapshot() {
  try {
    if (!state.level2.sessionId) return;
    const snapshot = {
      ...state.level2,
      audio: null,
      dictation: null,
      revisionTimerId: null,
      savedAt: Date.now(),
      originalInput: ui.level2OriginalInput?.value || "",
      finalInput: ui.level2FinalInput?.value || ""
    };
    window.localStorage?.setItem(LEVEL2_SESSION_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (_) {
    // localStorage pode estar indisponivel em alguns navegadores.
  }
}

function clearLevel2SessionSnapshot() {
  try {
    window.localStorage?.removeItem(LEVEL2_SESSION_STORAGE_KEY);
  } catch (_) {
    // localStorage pode estar indisponivel em alguns navegadores.
  }
}

function restoreLevel2SessionSnapshot() {
  let snapshot = null;
  try {
    const raw = window.localStorage?.getItem(LEVEL2_SESSION_STORAGE_KEY);
    snapshot = raw ? JSON.parse(raw) : null;
  } catch (_) {
    clearLevel2SessionSnapshot();
    return false;
  }
  if (!snapshot?.sessionId || snapshot.matchFinished) {
    clearLevel2SessionSnapshot();
    return false;
  }

  stopLevel2RevisionTimer();
  const restoredRoundState = isLevel2BusyState(snapshot.roundState)
    ? (snapshot.inannaQuadra ? LEVEL2_ROUND_STATES.REVISING_RESPONSE : LEVEL2_ROUND_STATES.COMPOSING_INITIAL)
    : (snapshot.roundState || LEVEL2_ROUND_STATES.COMPOSING_INITIAL);

  state.level2 = {
    ...state.level2,
    ...snapshot,
    currentRound: Math.min(3, Math.max(1, Number(snapshot.currentRound || 1))),
    roundCount: Math.min(3, Math.max(2, Number(snapshot.roundCount || 3))),
    playerWins: Math.max(0, Number(snapshot.playerWins || 0)),
    inannaWins: Math.max(0, Number(snapshot.inannaWins || 0)),
    roundState: restoredRoundState,
    roundResults: Array.isArray(snapshot.roundResults) ? snapshot.roundResults.filter(Boolean) : [],
    audio: null,
    dictation: null,
    revisionTimerId: null,
    matchFinished: false
  };

  if (ui.level2NicknameInput) ui.level2NicknameInput.value = state.level2.nickname || getLevel2DefaultNickname();
  if (ui.level2SetupPanel) ui.level2SetupPanel.hidden = true;
  if (ui.level2Arena) ui.level2Arena.hidden = false;
  if (ui.level2MatchResult) ui.level2MatchResult.hidden = true;
  if (ui.level2OriginalInput) ui.level2OriginalInput.value = snapshot.originalInput || state.level2.originalQuadra || "";
  if (ui.level2FinalInput) ui.level2FinalInput.value = snapshot.finalInput || state.level2.finalQuadra || state.level2.originalQuadra || "";

  if (state.level2.inannaQuadra) {
    renderLevel2InannaResponse({
      generationProvider: state.level2.generationProvider,
      inanna: {
        quadra: state.level2.inannaQuadra,
        stolenWords: state.level2.stolenWords || [],
        provider: state.level2.generationProvider,
        provocation: "Retomamos a peleja de onde ela parou."
      }
    });
  } else if (ui.level2InannaResponse) {
    ui.level2InannaResponse.hidden = true;
    ui.level2InannaResponse.innerHTML = "";
  }

  renderLevel2Scoreboard();
  if (state.level2.roundState === LEVEL2_ROUND_STATES.ROUND_RESULT) {
    if (state.level2.currentRound === 1) {
      renderLevel2RoundCheckpoint(state.level2.roundResults?.[0] || state.level2.lastRoundResult || {});
    } else {
      renderLevel2StoredResults();
    }
  } else if (ui.level2RoundFeedback) {
    ui.level2RoundFeedback.innerHTML = "";
  }

  if (state.level2.roundState === LEVEL2_ROUND_STATES.REVISING_RESPONSE) {
    const expiresAt = Number(state.level2.revisionExpiresAt || 0);
    startLevel2RevisionTimer(expiresAt > Date.now() ? expiresAt : Date.now() + 30_000);
  } else {
    setLevel2RoundState(state.level2.roundState, { skipSave: true });
  }
  syncLevel2PrimaryAction();
  setLevel2SessionStatus("Peleja retomada. Continue do ponto em que parou.", "var(--accent)");
  return true;
}

function setLevel2RoundState(roundState, options = {}) {
  state.level2.roundState = roundState || LEVEL2_ROUND_STATES.COMPOSING_INITIAL;
  syncLevel2PrimaryAction();
  if (!options.skipSave) saveLevel2SessionSnapshot();
}

function isLevel2BusyState(roundState = state.level2.roundState) {
  return [
    LEVEL2_ROUND_STATES.SUBMITTING_INITIAL,
    LEVEL2_ROUND_STATES.GENERATING_INANNA,
    LEVEL2_ROUND_STATES.SUBMITTING_FINAL,
    LEVEL2_ROUND_STATES.JUDGING
  ].includes(roundState);
}

function getLevel2PrimaryActionLabel() {
  switch (state.level2.roundState) {
    case LEVEL2_ROUND_STATES.SUBMITTING_INITIAL:
      return "Enviando quadra...";
    case LEVEL2_ROUND_STATES.GENERATING_INANNA:
      return "Inanna está preparando a resposta...";
    case LEVEL2_ROUND_STATES.REVISING_RESPONSE:
      return "Fechar minha resposta";
    case LEVEL2_ROUND_STATES.SUBMITTING_FINAL:
      return "Enviando resposta...";
    case LEVEL2_ROUND_STATES.JUDGING:
      return "O juiz está avaliando...";
    case LEVEL2_ROUND_STATES.ROUND_RESULT:
      if (state.level2.currentRound === 1) return "Escrever segunda quadra";
      if (state.level2.playerWins === state.level2.inannaWins) return "Quadra de desempate";
      return "Continuar";
    case LEVEL2_ROUND_STATES.MATCH_RESULT:
      return "Jogar outra peleja";
    case LEVEL2_ROUND_STATES.COMPOSING_INITIAL:
    default:
      return "Chamar Inanna";
  }
}

function syncLevel2PrimaryAction() {
  const roundState = state.level2.roundState || LEVEL2_ROUND_STATES.COMPOSING_INITIAL;
  const activeRoundVisible = ![
    LEVEL2_ROUND_STATES.ROUND_RESULT,
    LEVEL2_ROUND_STATES.MATCH_RESULT
  ].includes(roundState);
  if (ui.level2ActiveRoundPanel) ui.level2ActiveRoundPanel.hidden = !activeRoundVisible;
  if (ui.level2PrimaryActionBtn) {
    ui.level2PrimaryActionBtn.textContent = getLevel2PrimaryActionLabel();
    ui.level2PrimaryActionBtn.disabled = isLevel2BusyState(roundState);
  }
  if (ui.level2ResetBtn) {
    ui.level2ResetBtn.hidden = roundState === LEVEL2_ROUND_STATES.MATCH_RESULT;
  }
  if (ui.level2OriginalInput) {
    ui.level2OriginalInput.disabled = roundState !== LEVEL2_ROUND_STATES.COMPOSING_INITIAL;
  }
  if (ui.level2FinalInput) {
    ui.level2FinalInput.disabled = roundState !== LEVEL2_ROUND_STATES.REVISING_RESPONSE;
  }
  if (ui.level2SubmitOriginalBtn) ui.level2SubmitOriginalBtn.hidden = true;
  if (ui.level2FinalizeRoundBtn) ui.level2FinalizeRoundBtn.hidden = true;
  if (ui.level2NextRoundBtn) ui.level2NextRoundBtn.hidden = true;
}

function formatLevel2Timer(seconds) {
  const safe = Math.max(0, Math.ceil(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function stopLevel2RevisionTimer() {
  if (state.level2?.revisionTimerId) {
    window.clearInterval(state.level2.revisionTimerId);
    state.level2.revisionTimerId = null;
  }
}

function updateLevel2RevisionTimer() {
  if (!ui.level2RevisionTimer || state.level2.roundState !== LEVEL2_ROUND_STATES.REVISING_RESPONSE) return;
  const remainingMs = Number(state.level2.revisionExpiresAt || 0) - Date.now();
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  ui.level2RevisionTimer.hidden = false;
  ui.level2RevisionTimer.textContent = `Tempo de revisão: ${formatLevel2Timer(remainingSeconds)}`;
  ui.level2RevisionTimer.classList.toggle("level2-timer--warn", remainingSeconds <= 30 && remainingSeconds > 10);
  ui.level2RevisionTimer.classList.toggle("level2-timer--urgent", remainingSeconds <= 10);
  if (remainingMs <= 0) {
    stopLevel2RevisionTimer();
    finalizeLevel2Round({ auto: true });
  }
}

function startLevel2RevisionTimer(expiresAt = Date.now() + LEVEL2_REVISION_TIME_SECONDS * 1000) {
  stopLevel2RevisionTimer();
  state.level2.revisionExpiresAt = expiresAt;
  updateLevel2RevisionTimer();
  state.level2.revisionTimerId = window.setInterval(updateLevel2RevisionTimer, 1000);
  saveLevel2SessionSnapshot();
}

function openLevel2Preview() {
  if (!syncLevel2TrackAccess({ toast: true })) return;
  state.selectedTrack = "level2";
  hideGameExperience();
  setView("level2Preview", ui.level2PreviewSection);
  resetLevel2State(false);
  resetLevel2RoundInputs();
  renderLevel2PreviewPanel();
  if (restoreLevel2SessionSnapshot()) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (ui.level2SetupPanel) ui.level2SetupPanel.hidden = false;
  if (ui.level2Arena) ui.level2Arena.hidden = true;
  if (ui.level2MatchResult) ui.level2MatchResult.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getLevel2PlayerId() {
  return getProgressPlayerId();
}

function getLevel2Headers() {
  return {
    "content-type": "application/json",
    "x-inanna-player-id": state.level2.playerId || getLevel2PlayerId()
  };
}

async function callLevel2Agent(path, payload = {}) {
  if (!INANNA_LEVEL2_AGENT_URL) return runLocalLevel2Agent(path, payload);
  const url = `${INANNA_LEVEL2_AGENT_URL.replace(/\/$/, "")}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: getLevel2Headers(),
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) {
    throw new Error(data?.message || data?.error || "Falha no agente da Inanna.");
  }
  return data;
}

function runLocalLevel2Agent(path, payload = {}) {
  if (path === "/v2/session/start") {
    return Promise.resolve({
      ok: true,
      session: {
        sessionId: `local-${Date.now()}`,
        playerId: payload.playerId,
        nickname: payload.nickname,
        roundCount: 3,
        currentRound: 1,
        status: "active",
        source: "local"
      }
    });
  }
  if (path === "/v2/round/generate") {
    const challenge = LEVEL2_LOCAL_CHALLENGES[(state.level2.currentRound - 1) % LEVEL2_LOCAL_CHALLENGES.length];
    return Promise.resolve({ ok: true, challenge });
  }
  if (path === "/v2/round/respond") {
    const stolenWords = getLocalStolenWords(payload.playerQuadra || payload.playerOriginalQuadra || "");
    const quadra = buildLocalInannaQuadra(stolenWords, payload.rhymeScheme || "AABB");
    return Promise.resolve({
      ok: true,
      theme: payload.theme,
      rhymeScheme: payload.rhymeScheme,
      inanna: {
        quadra,
        stolenWords,
        provocation: "Melhore esse golpe de rima e veja se sua voz sustenta a peleja.",
        provider: "local-fallback"
      },
      inannaScore: { total: 72 },
      playerPrelim: { score: { total: estimateLocalLevel2Score(payload.playerQuadra || "") } }
    });
  }
  if (path === "/v2/round/finalize") {
    const playerScore = buildLocalLevel2Score(payload.playerFinalQuadra || payload.playerQuadra || "", payload.inannaQuadra || "");
    const inannaScore = buildLocalLevel2Score(payload.inannaQuadra || "", "");
    inannaScore.total = Math.min(110, inannaScore.total + 4);
    const playerTotal = playerScore.total;
    const inannaTotal = inannaScore.total;
    const roundWinner = playerTotal > inannaTotal ? "player" : inannaTotal > playerTotal ? "inanna" : "draw";
    return Promise.resolve({
      ok: true,
      roundWinner,
      playerScoreTotal: playerTotal,
      inannaScoreTotal: inannaTotal,
      playerScore,
      inannaScore,
      feedback: `Modo local: humano ${playerTotal}, Inanna ${inannaTotal}.`,
      roundId: ""
    });
  }
  return Promise.resolve({ ok: true });
}

function getLocalStolenWords(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9ç]+/i)
    .filter((word) => word.length > 4)
    .slice(0, 4);
}

function buildLocalInannaQuadra(words, scheme) {
  const a = words[0] || "feira";
  if (scheme === "ABAB") {
    return `Levei teu ${a} no clarão\ne pisei firme no terreiro\nse tua voz busca o sertão\nme vence no verso ligeiro`;
  }
  if (scheme === "ABCB") {
    return `Teu verso chegou ligeiro\neu respondo no terreiro\nse tua voz quer peleja\nme vence no verso ligeiro`;
  }
  if (scheme === "ABBA") {
    return `Levei teu ${a} pro clarão\ne fiz meu passo no terreiro\nquem afia verso ligeiro\nme vence agora no sertão`;
  }
  return `Roubei teu ${a} no clarão\ne fiz resposta no sertão\nse tua rima vem certeira\nme vence de mão ligeira`;
}

function estimateLocalLevel2Score(text) {
  return buildLocalLevel2Score(text).total;
}

function buildLocalLevel2Score(text, inannaText = "") {
  const lines = String(text || "").split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const structure = lines.length === 4 ? 10 : Math.min(8, lines.length * 2);
  const rhyme = Math.min(20, Math.max(4, lines.length * 4));
  const creativity = Math.min(20, words.length);
  const autonomy = inannaText ? 14 : 15;
  const verisimilitude = Math.min(15, words.length > 18 ? 13 : 8);
  const coherence = Math.min(15, lines.length === 4 ? 12 : 6);
  const response = inannaText ? 12 : 0;
  return {
    structure,
    rhyme,
    creativity,
    autonomy,
    verisimilitude,
    coherence,
    response,
    total: Math.min(110, structure + rhyme + creativity + autonomy + verisimilitude + coherence + response)
  };
}

function normalizeLevel2QuadraInput(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4)
    .join("\n");
}

function inspectLevel2Privacy(value) {
  const text = String(value || "");
  const patterns = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-.\s]?\d{4}/g,
    /(^|[\s([{])@[a-z0-9._-]{3,}/gi,
    /\b(?:https?:\/\/|www\.)\S+/gi,
    /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g
  ];
  return {
    ok: !patterns.some((pattern) => pattern.test(text))
  };
}

function validateLevel2Quadra(value) {
  const lines = normalizeLevel2QuadraInput(value).split("\n").filter(Boolean);
  if (lines.length !== 4) {
    return { ok: false, message: "A peleja pede exatamente quatro versos." };
  }
  if (lines.join(" ").length < 35) {
    return { ok: false, message: "Escreva um pouco mais para a quadra ganhar corpo." };
  }
  if (!inspectLevel2Privacy(lines.join("\n")).ok) {
    return { ok: false, message: "Retire e-mail, telefone, arroba, link ou documento dos versos antes de enviar." };
  }
  return { ok: true, quadra: lines.join("\n") };
}

function getLevel2RoundBadgeLabel() {
  const playedRounds = (state.level2.roundResults || []).filter(Boolean).length;
  if (state.level2.matchFinished) {
    const total = Math.max(playedRounds, Number(state.level2.currentRound || 0), 1);
    return `Peleja encerrada em ${total} ${total === 1 ? "quadra" : "quadras"}`;
  }
  if (Number(state.level2.currentRound || 1) >= 3) return "Desempate 3/3";
  return `Quadra ${Number(state.level2.currentRound || 1)}/2`;
}

function getLevel2RoundScoreLabel(result = {}) {
  const player = Number(result.playerScoreTotal || result.playerScore?.total || 0);
  const inanna = Number(result.inannaScoreTotal || result.inannaScore?.total || 0);
  return `Humano ${player} x ${inanna} Inanna`;
}

function renderLevel2Scoreboard() {
  if (ui.level2RoundBadge) ui.level2RoundBadge.textContent = getLevel2RoundBadgeLabel();
  if (ui.level2Scoreboard) {
    const playedRounds = (state.level2.roundResults || []).filter(Boolean).length;
    const scoreCanBeShown = state.level2.matchFinished || playedRounds >= 2 || state.level2.currentRound >= 3;
    ui.level2Scoreboard.textContent = scoreCanBeShown
      ? `Humano ${state.level2.playerWins} x ${state.level2.inannaWins} Inanna`
      : playedRounds > 0
        ? "Placar da peleja guardado até a segunda quadra"
        : "Humano 0 x 0 Inanna";
  }
  if (ui.level2Theme) ui.level2Theme.textContent = state.level2.theme || "-";
  if (ui.level2RhymeScheme) ui.level2RhymeScheme.textContent = state.level2.rhymeScheme || "AABB";
  if (ui.level2ThemeContext) {
    const context = String(state.level2.themeContext || "").trim();
    ui.level2ThemeContext.hidden = !context;
    ui.level2ThemeContext.innerHTML = context
      ? `<strong>Contexto</strong><p>${escapeHtml(context)}</p>${state.level2.themeSource ? `<a href="${escapeHtml(state.level2.themeSource)}" target="_blank" rel="noopener noreferrer">Fonte do tema</a>` : ""}`
      : "";
  }
}

async function startLevel2Match() {
  const nickname = String(ui.level2NicknameInput?.value || getLevel2DefaultNickname()).trim().slice(0, 40) || "Jogador";
  const inputMode = "written";
  const soundMode = "none";
  state.level2.playerId = getLevel2PlayerId();
  state.level2.nickname = nickname;
  state.level2.inputMode = inputMode;
  state.level2.soundMode = soundMode;
  setLevel2RoundState(LEVEL2_ROUND_STATES.COMPOSING_INITIAL);
  saveLevel2Nickname(nickname);
  setLevel2SessionStatus("Abrindo a roda da peleja...", "var(--muted)");
  if (ui.level2StartBtn) ui.level2StartBtn.disabled = true;
  try {
    const result = await callLevel2Agent("/v2/session/start", {
      playerId: state.level2.playerId,
      nickname,
      inputMode,
      soundMode,
      levelProgress: ensurePlayerProgress()
    });
    state.level2.sessionId = result.session?.sessionId || "";
    state.level2.roundCount = Number(result.session?.roundCount || 3);
    if (ui.level2SetupPanel) ui.level2SetupPanel.hidden = true;
    if (ui.level2Arena) ui.level2Arena.hidden = false;
    await beginLevel2Round(1);
    setLevel2SessionStatus("Peleja iniciada.", "var(--accent)");
  } catch (error) {
    console.error(error);
    setLevel2SessionStatus(error?.message || "Não foi possível iniciar a peleja.", "var(--danger)");
  } finally {
    if (ui.level2StartBtn) ui.level2StartBtn.disabled = false;
  }
}

async function beginLevel2Round(roundNumber) {
  stopLevel2RevisionTimer();
  state.level2.currentRound = roundNumber;
  state.level2.roundState = LEVEL2_ROUND_STATES.COMPOSING_INITIAL;
  state.level2.roundClosed = false;
  state.level2.originalQuadra = "";
  state.level2.finalQuadra = "";
  state.level2.inannaQuadra = "";
  state.level2.stolenWords = [];
  state.level2.themeContext = "";
  state.level2.themeSource = "";
  state.level2.revisionExpiresAt = 0;
  state.level2.lastRoundResult = null;
  resetLevel2RoundInputs();
  const result = await callLevel2Agent("/v2/round/generate", {
    sessionId: state.level2.sessionId,
    roundNumber
  });
  const fallback = LEVEL2_LOCAL_CHALLENGES[(roundNumber - 1) % LEVEL2_LOCAL_CHALLENGES.length];
  const challenge = result.challenge || {};
  state.level2.theme = challenge.theme || fallback.theme;
  state.level2.themeContext = challenge.context || "";
  state.level2.themeSource = challenge.source || "";
  state.level2.rhymeScheme = challenge.rhymeScheme || fallback.rhymeScheme;
  renderLevel2Scoreboard();
  setLevel2RoundState(LEVEL2_ROUND_STATES.COMPOSING_INITIAL);
}

function renderLevel2InannaResponse(result) {
  const inanna = result.inanna || {};
  const stolenWords = Array.isArray(inanna.stolenWords) ? inanna.stolenWords : [];
  if (!ui.level2InannaResponse) return;
  ui.level2InannaResponse.hidden = false;
  ui.level2InannaResponse.innerHTML = `
    <h3>Inanna responde</h3>
    <p>${escapeHtml(inanna.provocation || "Agora responda e prove sua voz.")}</p>
    <pre class="level2-quadra">${escapeHtml(inanna.quadra || "")}</pre>
    <div class="level2-stolen" aria-label="Palavras roubadas por Inanna">
      ${stolenWords.map((word) => `<span>${escapeHtml(word)}</span>`).join("")}
    </div>
    <p class="verse-hint">Geração: ${escapeHtml(result.generationProvider || inanna.provider || "agente")}</p>
  `;
}

async function submitLevel2Original() {
  if (isLevel2BusyState()) return;
  const validation = validateLevel2Quadra(ui.level2OriginalInput?.value || "");
  if (!validation.ok) {
    setLevel2SessionStatus(validation.message, "var(--danger)");
    return;
  }
  state.level2.originalQuadra = validation.quadra;
  setLevel2RoundState(LEVEL2_ROUND_STATES.GENERATING_INANNA);
  setLevel2SessionStatus("Inanna está roubando imagens da sua quadra...", "var(--muted)");
  try {
    const result = await callLevel2Agent("/v2/round/respond", {
      sessionId: state.level2.sessionId,
      playerId: state.level2.playerId,
      nickname: state.level2.nickname,
      roundNumber: state.level2.currentRound,
      theme: state.level2.theme,
      themeContext: state.level2.themeContext,
      themeSource: state.level2.themeSource,
      rhymeScheme: state.level2.rhymeScheme,
      playerQuadra: state.level2.originalQuadra,
      playerOriginalQuadra: state.level2.originalQuadra
    });
    state.level2.inannaQuadra = result.inanna?.quadra || "";
    state.level2.stolenWords = result.inanna?.stolenWords || [];
    state.level2.generationProvider = result.generationProvider || result.inanna?.provider || "";
    renderLevel2InannaResponse(result);
    if (ui.level2FinalInput) {
      ui.level2FinalInput.disabled = false;
      ui.level2FinalInput.value = state.level2.originalQuadra;
      ui.level2FinalInput.focus();
    }
    setLevel2RoundState(LEVEL2_ROUND_STATES.REVISING_RESPONSE);
    startLevel2RevisionTimer();
    setLevel2SessionStatus("Agora melhore sua resposta e tente vencer o round.", "var(--accent)");
  } catch (error) {
    console.error(error);
    setLevel2SessionStatus(error?.message || "Inanna não respondeu agora.", "var(--danger)");
    setLevel2RoundState(LEVEL2_ROUND_STATES.COMPOSING_INITIAL);
  }
}

function formatLevel2ScoreValue(value) {
  const score = Number(value || 0);
  return Number.isFinite(score) ? Math.round(score) : 0;
}

function renderLevel2CriteriaCards(label, score = {}) {
  const criteria = [
    ["Forma", score.structure],
    ["Rima", score.rhyme],
    ["Criatividade", score.creativity],
    ["Autoria", score.autonomy],
    ["Verossimilhança", score.verisimilitude],
    ["Coesão", score.coherence],
    ["Resposta", score.response]
  ];
  return `
    <div class="level2-criteria-block">
      <h4>${escapeHtml(label)}</h4>
      <div class="level2-criteria-grid">
        ${criteria.map(([name, value]) => `
          <div class="level2-score-card level2-score-card--small">
            <span>${escapeHtml(name)}</span>
            <strong>${formatLevel2ScoreValue(value)}</strong>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderLevel2RewardSummary(result = {}) {
  const reward = result.rewardSummary || {};
  const rhyme = result.rhymeOriginality || {};
  const notes = [];
  const piecesEarned = Number(reward.piecesEarned || 0);
  if (piecesEarned > 0) {
    const total = Number(reward.totalPieces || 30);
    const current = Number(reward.level2PiecesCount || 0);
    notes.push(`+${piecesEarned} pedacinho${piecesEarned > 1 ? "s" : ""} da xilogravura (${Math.min(current, total)}/${total}).`);
  }
  if (rhyme.earnedOriginalityBonus) {
    notes.push("Rima inédita reconhecida nesta peleja.");
  } else if (Number(rhyme.exactRepeatCount || 0) > 0) {
    notes.push("Repetição de palavra final: sem bônus de rima inédita.");
  } else if (Number(rhyme.rhymeFamilyRepeatCount || 0) > 0) {
    notes.push("Família sonora repetida: a rima vale, mas não rende ineditismo.");
  }
  if (!notes.length) return "";
  return `<div class="level2-reward-note">${notes.map((note) => `<p>${escapeHtml(note)}</p>`).join("")}</div>`;
}

function renderLevel2CompactCriteria(result = {}) {
  const rows = [
    ["Rima", "rhyme"],
    ["Ritmo", "structure"],
    ["Criatividade", "creativity"],
    ["Coerência", "coherence"],
    ["Resposta", "response"]
  ];
  return `
    <table class="level2-criteria-table">
      <thead><tr><th>Critério</th><th>Você</th><th>Inanna</th></tr></thead>
      <tbody>
        ${rows.map(([label, key]) => `
          <tr>
            <td>${escapeHtml(label)}</td>
            <td>${formatLevel2ScoreValue(result.playerScore?.[key])}</td>
            <td>${formatLevel2ScoreValue(result.inannaScore?.[key])}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function getLevel2RoundWinnerLabel(result = {}) {
  return result.roundWinner === "player"
    ? "Você venceu"
    : result.roundWinner === "inanna"
      ? "Inanna venceu"
      : "Empate técnico";
}

function renderLevel2RoundCheckpoint(result) {
  if (!ui.level2RoundFeedback) return;
  const shortExplanation = result.shortExplanation || result.short_explanation || result.feedback || "";
  ui.level2RoundFeedback.innerHTML = `
    <h3>Primeira quadra avaliada</h3>
    <p>${escapeHtml(shortExplanation || "A pontuação desta quadra foi registrada. A peleja fecha depois da segunda, salvo empate.")}</p>
    <div class="level2-score-grid level2-score-grid--summary">
      <div class="level2-score-card"><span>Humano</span><strong>${Number(result.playerScoreTotal || result.playerScore?.total || 0)}</strong></div>
      <div class="level2-score-card"><span>Inanna</span><strong>${Number(result.inannaScoreTotal || result.inannaScore?.total || 0)}</strong></div>
    </div>
    ${renderLevel2RewardSummary(result)}
    ${renderLevel2CompactCriteria(result)}
  `;
}

function renderLevel2StoredResults() {
  if (!ui.level2RoundFeedback) return;
  const results = state.level2.roundResults || [];
  const visibleResults = results.filter(Boolean);
  const tieAfterTwo = state.level2.currentRound >= 2 && state.level2.playerWins === state.level2.inannaWins && !state.level2.matchFinished;
  const hasTiebreak = visibleResults.length >= 3;
  const summary = tieAfterTwo
    ? "Cada lado segurou sua voz. Agora vem uma quadra de desempate com novo tema."
    : hasTiebreak
      ? "A quadra de desempate fechou a peleja."
      : "As duas primeiras quadras já bastaram para fechar a peleja.";
  ui.level2RoundFeedback.innerHTML = `
    <h3>${tieAfterTwo ? "Empate: a terceira quadra decide" : "Resultado das quadras"}</h3>
    <p>${summary}</p>
    <div class="level2-round-list">
      ${visibleResults.map((item, index) => `
        <div class="level2-round-pill">
          <span>Quadra ${index + 1}</span>
          <strong>${escapeHtml(getLevel2RoundWinnerLabel(item))}<small>${escapeHtml(getLevel2RoundScoreLabel(item))}</small></strong>
        </div>
      `).join("")}
    </div>
    ${visibleResults.slice(-1).map(renderLevel2RewardSummary).join("")}
  `;
}

function renderLevel2RoundFeedback(result, options = {}) {
  if (!ui.level2RoundFeedback) return;
  const winnerLabel = result.roundWinner === "player"
    ? "Você venceu o round"
    : result.roundWinner === "inanna"
      ? "Inanna venceu o round"
      : "Empate técnico";
  const shortExplanation = result.shortExplanation || result.short_explanation || result.feedback || "";
  ui.level2RoundFeedback.innerHTML = `
    <h3>${escapeHtml(winnerLabel)}</h3>
    <p>${escapeHtml(shortExplanation)}</p>
    <div class="level2-score-grid level2-score-grid--summary">
      <div class="level2-score-card"><span>Humano</span><strong>${Number(result.playerScoreTotal || result.playerScore?.total || 0)}</strong></div>
      <div class="level2-score-card"><span>Inanna</span><strong>${Number(result.inannaScoreTotal || result.inannaScore?.total || 0)}</strong></div>
    </div>
    ${renderLevel2RewardSummary(result)}
    ${renderLevel2CompactCriteria(result)}
    <details class="level2-criteria">
      <summary>Ver critérios</summary>
      ${renderLevel2CriteriaCards("Humano", result.playerScore || {})}
      ${renderLevel2CriteriaCards("Inanna", result.inannaScore || {})}
    </details>
  `;
}

async function finalizeLevel2Round(options = {}) {
  if (isLevel2BusyState()) return;
  const validation = validateLevel2Quadra(ui.level2FinalInput?.value || "");
  if (!validation.ok) {
    setLevel2SessionStatus(validation.message, "var(--danger)");
    return;
  }
  stopLevel2RevisionTimer();
  state.level2.finalQuadra = validation.quadra;
  setLevel2RoundState(LEVEL2_ROUND_STATES.JUDGING);
  setLevel2SessionStatus(options.auto ? "Tempo encerrado. Salvando sua resposta..." : "Avaliando rima, autoria e coesão semântica...", "var(--muted)");
  try {
    const result = await callLevel2Agent("/v2/round/finalize", {
      sessionId: state.level2.sessionId,
      playerId: state.level2.playerId,
      nickname: state.level2.nickname,
      roundNumber: state.level2.currentRound,
      theme: state.level2.theme,
      themeContext: state.level2.themeContext,
      themeSource: state.level2.themeSource,
      rhymeScheme: state.level2.rhymeScheme,
      playerOriginalQuadra: state.level2.originalQuadra,
      playerFinalQuadra: state.level2.finalQuadra,
      inannaQuadra: state.level2.inannaQuadra,
      stolenWords: state.level2.stolenWords
    });
    state.level2.lastRoundResult = result;
    state.level2.roundResults = [
      ...(state.level2.roundResults || []).filter((item) => Number(item.roundNumber || 0) !== state.level2.currentRound),
      { ...result, roundNumber: state.level2.currentRound }
    ].sort((a, b) => Number(a.roundNumber || 0) - Number(b.roundNumber || 0));
    state.level2.roundClosed = true;
    if (result.roundWinner === "player") state.level2.playerWins += 1;
    if (result.roundWinner === "inanna") state.level2.inannaWins += 1;
    renderLevel2Scoreboard();
    const finished = shouldFinishLevel2Match();
    if (finished) {
      renderLevel2StoredResults();
      finishLevel2Match();
    } else {
      if (state.level2.currentRound === 1) {
        renderLevel2RoundCheckpoint(result);
        setLevel2SessionStatus("Primeira quadra pontuada. A segunda decide se a peleja fecha ou pede desempate.", "var(--accent)");
      } else {
        renderLevel2StoredResults();
        setLevel2SessionStatus("Empate em duas quadras. A próxima decide.", "var(--accent)");
      }
      setLevel2RoundState(LEVEL2_ROUND_STATES.ROUND_RESULT);
    }
    saveLevel2SessionSnapshot();
  } catch (error) {
    console.error(error);
    setLevel2SessionStatus(error?.message || "Não consegui fechar o round.", "var(--danger)");
    setLevel2RoundState(LEVEL2_ROUND_STATES.REVISING_RESPONSE);
    startLevel2RevisionTimer(Date.now() + 30_000);
  }
}

function finishLevel2Match() {
  state.level2.matchFinished = true;
  renderLevel2Scoreboard();
  const playerWon = state.level2.playerWins > state.level2.inannaWins;
  const inannaWon = state.level2.inannaWins > state.level2.playerWins;
  const title = playerWon ? "Você venceu a peleja" : inannaWon ? "Inanna venceu a peleja" : "Empate de autoria";
  const description = playerWon
    ? "Sua autoria humana sustentou a rima e respondeu à provocação da máquina."
    : inannaWon
      ? "A máquina levou esta rodada, mas deixou pistas claras para sua próxima resposta."
      : "A peleja terminou parelha. Vale retomar a roda para buscar uma virada mais nítida.";
  if (ui.level2MatchResult) {
    ui.level2MatchResult.hidden = false;
    ui.level2MatchResult.innerHTML = `
      <h3>${title}</h3>
      <p>${description}</p>
      <p><strong>Placar final:</strong> Humano ${state.level2.playerWins} x ${state.level2.inannaWins} Inanna.</p>
    `;
  }
  if (ui.level2NextRoundBtn) ui.level2NextRoundBtn.hidden = true;
  setLevel2RoundState(LEVEL2_ROUND_STATES.MATCH_RESULT);
  clearLevel2SessionSnapshot();
  setLevel2SessionStatus("Peleja finalizada.", playerWon ? "var(--accent)" : "var(--primary)");
}

function shouldFinishLevel2Match() {
  if (state.level2.currentRound >= 3) return true;
  if (state.level2.currentRound >= 2 && state.level2.playerWins !== state.level2.inannaWins) return true;
  return false;
}

async function goToNextLevel2Round() {
  if (state.level2.matchFinished) return;
  if (state.level2.currentRound >= 2 && state.level2.playerWins !== state.level2.inannaWins) {
    finishLevel2Match();
    return;
  }
  await beginLevel2Round(state.level2.currentRound + 1);
}

async function handleLevel2PrimaryAction() {
  if (isLevel2BusyState()) return;
  switch (state.level2.roundState) {
    case LEVEL2_ROUND_STATES.REVISING_RESPONSE:
      await finalizeLevel2Round();
      break;
    case LEVEL2_ROUND_STATES.ROUND_RESULT:
      await goToNextLevel2Round();
      break;
    case LEVEL2_ROUND_STATES.MATCH_RESULT:
      await resetLevel2Match();
      break;
    case LEVEL2_ROUND_STATES.COMPOSING_INITIAL:
    default:
      await submitLevel2Original();
      break;
  }
}

async function resetLevel2Match() {
  const hasActiveMatch = Boolean(state.level2.sessionId && !state.level2.matchFinished);
  if (hasActiveMatch) {
    const ok = window.confirm("Recomeçar apaga a peleja em andamento. Quer continuar?");
    if (!ok) return;
  }
  stopLevel2Audio();
  clearLevel2SessionSnapshot();
  resetLevel2State(true);
  resetLevel2RoundInputs();
  if (ui.level2SetupPanel) ui.level2SetupPanel.hidden = false;
  if (ui.level2Arena) ui.level2Arena.hidden = true;
  if (ui.level2MatchResult) ui.level2MatchResult.hidden = true;
  renderLevel2PreviewPanel();
  setLevel2SessionStatus("");
}

async function configureLevel2Audio(soundMode) {
  stopLevel2Audio();
  if (!INANNA_LEVEL2_AUDIO_ENABLED || soundMode === "none") {
    if (ui.level2AudioToggleBtn) ui.level2AudioToggleBtn.disabled = true;
    return;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const gain = context.createGain();
  gain.gain.value = 0.035;
  gain.connect(context.destination);
  const audioState = { context, gain, nodes: [], interval: null, active: true, mode: soundMode };
  if (soundMode === "white_noise") {
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start();
    audioState.nodes.push(source);
  } else {
    const playPulse = () => {
      const osc = context.createOscillator();
      const pulseGain = context.createGain();
      osc.frequency.value = soundMode === "baiao" ? 180 : 110;
      pulseGain.gain.value = 0.045;
      osc.connect(pulseGain);
      pulseGain.connect(gain);
      osc.start();
      osc.stop(context.currentTime + 0.08);
    };
    audioState.interval = window.setInterval(playPulse, soundMode === "baiao" ? 420 : 520);
    playPulse();
  }
  state.level2.audio = audioState;
  if (ui.level2AudioToggleBtn) {
    ui.level2AudioToggleBtn.disabled = false;
    ui.level2AudioToggleBtn.textContent = "Pausar som";
  }
}

function stopLevel2Audio() {
  const audio = state.level2?.audio;
  if (!audio) return;
  try {
    audio.nodes?.forEach((node) => node.stop?.());
    if (audio.interval) window.clearInterval(audio.interval);
    audio.context?.close?.();
  } catch (_) {
    // AudioContext pode ja estar fechado.
  }
  state.level2.audio = null;
  if (ui.level2AudioToggleBtn) {
    ui.level2AudioToggleBtn.disabled = true;
    ui.level2AudioToggleBtn.textContent = "Pausar som";
  }
}

function toggleLevel2Audio() {
  const audio = state.level2.audio;
  if (!audio?.context) return;
  if (audio.context.state === "running") {
    audio.context.suspend();
    if (ui.level2AudioToggleBtn) ui.level2AudioToggleBtn.textContent = "Retomar som";
  } else {
    audio.context.resume();
    if (ui.level2AudioToggleBtn) ui.level2AudioToggleBtn.textContent = "Pausar som";
  }
}

function startLevel2Dictation() {
  if (!INANNA_LEVEL2_DICTATION_ENABLED) {
    setLevel2SessionStatus("Ditado ainda está desligado nesta versão.", "var(--danger)");
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setLevel2SessionStatus("Este navegador não oferece ditado nativo.", "var(--danger)");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join("\n")
      .trim();
    if (transcript && ui.level2OriginalInput) {
      ui.level2OriginalInput.value = transcript;
      setLevel2SessionStatus("Revise a transcrição antes de enviar.", "var(--accent)");
    }
  };
  recognition.onerror = () => setLevel2SessionStatus("Não consegui captar o ditado agora.", "var(--danger)");
  recognition.start();
  state.level2.dictation = recognition;
  setLevel2SessionStatus("Ouvindo... depois revise a transcrição.", "var(--muted)");
}

function canAccessSextilhaWorkspace(email = state.email) {
  return isAdminEmail(email) || SEXTILHA_ALLOWED_EMAILS.has(normalizeEmail(email));
}

function syncSextilhaTrackAccess(options = {}) {
  const hasAccess = canAccessSextilhaWorkspace();

  if (ui.chooseSextilhaTrackBtn) {
    ui.chooseSextilhaTrackBtn.disabled = !hasAccess;
    ui.chooseSextilhaTrackBtn.title = hasAccess ? "" : SEXTILHA_LOCKED_NOTICE;
  }

  if (ui.sextilhaAccessNotice) {
    ui.sextilhaAccessNotice.textContent = hasAccess ? "" : SEXTILHA_LOCKED_NOTICE;
    ui.sextilhaAccessNotice.hidden = hasAccess;
  }

  if (!hasAccess && options.toast) {
    showToast(SEXTILHA_LOCKED_NOTICE, "muted", { duration: 4000 });
  }

  return hasAccess;
}

function setCadernoDashboardVisible(visible) {
  const shouldShow = !!visible;
  if (ui.dashboardCadernoArea) ui.dashboardCadernoArea.hidden = !shouldShow;
  if (ui.btnCreateFolheto) ui.btnCreateFolheto.hidden = !shouldShow;
  if (ui.btnCreateText) ui.btnCreateText.hidden = !shouldShow;
}

function assertSextilhaWorkspaceAccess() {
  if (canAccessSextilhaWorkspace()) return;
  syncSextilhaTrackAccess();
  throw new Error(SEXTILHA_LOCKED_NOTICE);
}

function syncDashboardProfileFormFromState(force = false) {
  if (!state.participantId) return;
  if (!force && state.dashboardProfileFormParticipantId === state.participantId) return;
  syncProfileFormValuesFromState(getDashboardProfileControls());
  state.dashboardProfileFormParticipantId = state.participantId;
}

function renderDashboardProfileSummary() {
  if (!ui.dashboardProfileSummary) return;
  const displayName = getPlayerDisplayName();
  const municipioLabel = state.estadoUF && state.estadoUF !== "EX"
    ? `${state.municipio} - ${state.estadoUF}`
    : (state.municipio || "Município não informado");
  const rows = [
    ["Nome no check-in", state.name || "Participante"],
    ["Nome de jogo", displayName],
    ["Município", municipioLabel],
    ["Oficina Cordel 2.0", state.oficinaCordel20 === true ? "Sim" : state.oficinaCordel20 === false ? "Não" : "Não informado"],
    ["Chatbot de IA", state.usouChatbotIa === true ? "Já usou" : state.usouChatbotIa === false ? "Ainda não usou" : "Não informado"],
  ];
  ui.dashboardProfileSummary.innerHTML = rows.map(([label, value]) => `
    <div class="player-profile-summary__row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");
}

function isLevel2UnlockReady(progress = ensurePlayerProgress()) {
  if (isAdminEmail()) return true;
  return Number(progress.perfectQuadrasCount || 0) >= 5
    || MASTERY_CRITERIA.every((item) => !!progress.mastery?.[item.key]);
}

function renderPlayerLevel1Rewards() {
  if (!ui.playerLevel1Rewards) return;
  const progress = ensurePlayerProgress();
  const masteryCount = countMasteryCriteria(progress);
  const perfectPercent = getProgressPercent(progress.perfectQuadrasCount, 5);
  const unlocked = Number(progress.levelUnlocked || 1) >= 2;
  const ready = isLevel2UnlockReady(progress);
  const checklist = MASTERY_CRITERIA.map((item) => {
    const done = !!progress.mastery?.[item.key];
    return `<span class="player-mark ${done ? "player-mark--done" : ""}">${done ? "✓" : "□"} ${escapeHtml(item.label)}</span>`;
  }).join("");
  ui.playerLevel1Rewards.innerHTML = `
    <div class="player-reward-metrics">
      <div><strong>${Math.min(progress.perfectQuadrasCount, 5)}/5</strong><span>quadras perfeitas</span></div>
      <div><strong>${masteryCount}/${MASTERY_CRITERIA.length}</strong><span>marcas de autoria</span></div>
      <div><strong>${progress.bestScore || 0}</strong><span>melhor pontuação</span></div>
    </div>
    <span class="level2-mini-progress__bar" aria-hidden="true"><i style="width:${perfectPercent}%"></i></span>
    <p class="workspace-meta">${escapeHtml(unlocked ? "Nível 2 liberado no seu percurso." : ready ? "Suas conquistas já permitem pedir a liberação com Inanna." : getLevel2StatusMessage(progress))}</p>
    <div class="player-mark-list">${checklist}</div>
  `;
  if (ui.playerUnlockLevel2Btn) {
    ui.playerUnlockLevel2Btn.disabled = unlocked || !ready;
    ui.playerUnlockLevel2Btn.textContent = unlocked ? "Nível 2 liberado" : "Conversar com Inanna";
  }
}

function sumLevel2Points(profile) {
  const rewards = Array.isArray(profile?.rewards) ? profile.rewards : [];
  const ledgerPoints = rewards
    .filter((item) => item.reward_unit === "peleja_point" || item.rewardUnit === "peleja_point")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const rounds = Array.isArray(profile?.rounds) ? profile.rounds : [];
  const roundPoints = rounds.reduce((sum, item) => sum + Number(item.player_score || item.playerScore || 0), 0);
  return ledgerPoints || roundPoints;
}

function renderPlayerLevel2Rewards() {
  if (!ui.playerLevel2Rewards) return;
  const profile = state.playerLevel2Profile || {};
  const wallet = profile.wallet || {};
  const rounds = Array.isArray(profile.rounds) ? profile.rounds : [];
  const sessions = Array.isArray(profile.sessions) ? profile.sessions : [];
  const pieces = Number(wallet.level2_pieces_count || 0);
  const totalPieces = Number(profile.totalPieces || 30);
  const points = sumLevel2Points(profile);
  const wins = sessions.reduce((sum, item) => sum + Number(item.player_wins || item.playerWins || 0), 0);
  const statusText = state.playerLevel2ProfileStatus === "loading"
    ? "Buscando seus ganhos no Worker..."
    : state.playerLevel2ProfileStatus === "error"
      ? "Não consegui sincronizar os ganhos do Nível 2 agora."
      : rounds.length
        ? "Histórico de pelejas sincronizado."
        : "Ainda sem pelejas registradas no Nível 2.";
  ui.playerLevel2Rewards.innerHTML = `
    <div class="player-reward-metrics">
      <div><strong>${pieces}/${totalPieces}</strong><span>pedacinhos da xilogravura</span></div>
      <div><strong>${points}</strong><span>pontos de peleja</span></div>
      <div><strong>${wins}</strong><span>rounds vencidos</span></div>
    </div>
    <span class="level2-mini-progress__bar" aria-hidden="true"><i style="width:${getProgressPercent(pieces, totalPieces)}%"></i></span>
    <p class="workspace-meta">${escapeHtml(statusText)}</p>
  `;
  if (ui.playerGoLevel2Btn) ui.playerGoLevel2Btn.disabled = !canAccessLevel2Preview();
}

function formatRoundWinner(value) {
  if (value === "player") return "Humano";
  if (value === "inanna") return "Inanna";
  return "Empate";
}

function getLevel2RoundId(round) {
  return String(round?.round_id || round?.roundId || "").trim();
}

function getLevel2RoundById(roundId) {
  const rounds = Array.isArray(state.playerLevel2Profile?.rounds) ? state.playerLevel2Profile.rounds : [];
  return rounds.find((round) => getLevel2RoundId(round) === String(roundId || "").trim()) || null;
}

function buildLevel2ShareText(round) {
  const theme = String(round?.theme || "Tema livre").trim();
  const finalQuadra = String(round?.player_final_quadra || round?.playerFinalQuadra || "").trim();
  const winner = formatRoundWinner(round?.round_winner || round?.roundWinner || "draw");
  return [
    `Peleja com Inanna - ${theme}`,
    "",
    finalQuadra,
    "",
    `Resultado: ${winner} | Humano ${Number(round?.player_score || round?.playerScore || 0)} x ${Number(round?.inanna_score || round?.inannaScore || 0)} Inanna`,
  ].filter(Boolean).join("\n");
}

function renderPlayerLevel2Results() {
  if (!ui.playerLevel2Results) return;
  const rounds = Array.isArray(state.playerLevel2Profile?.rounds) ? state.playerLevel2Profile.rounds : [];
  if (state.playerLevel2ProfileStatus === "loading") {
    ui.playerLevel2Results.innerHTML = `<div class="workspace-empty">Sincronizando resultados das pelejas...</div>`;
    return;
  }
  if (!rounds.length) {
    ui.playerLevel2Results.innerHTML = `<div class="workspace-empty">Quando você jogar o Nível 2, cada resultado aparecerá aqui para copiar ou publicar depois.</div>`;
    return;
  }
  ui.playerLevel2Results.innerHTML = rounds.map((round) => {
    const roundId = getLevel2RoundId(round);
    const finalQuadra = String(round.player_final_quadra || round.playerFinalQuadra || "").trim();
    const inannaQuadra = String(round.inanna_quadra || round.inannaQuadra || "").trim();
    const createdAt = round.created_at || round.createdAt || "";
    return `
      <article class="player-result-card" data-round-id="${escapeHtml(roundId)}">
        <div class="text-card__head">
          <div>
            <h3 class="text-card__title">Round ${Number(round.round_number || round.roundNumber || 1)} · ${escapeHtml(round.theme || "Tema livre")}</h3>
            <p class="text-card__meta">${escapeHtml(createdAt ? formatDateTime(createdAt) : "Data não registrada")}<br>Resultado: ${escapeHtml(formatRoundWinner(round.round_winner || round.roundWinner || "draw"))} · Humano ${Number(round.player_score || round.playerScore || 0)} x ${Number(round.inanna_score || round.inannaScore || 0)} Inanna</p>
          </div>
          <span class="status-badge status-concluida">${escapeHtml(formatRoundWinner(round.round_winner || round.roundWinner || "draw"))}</span>
        </div>
        <div class="player-result-grid">
          <div>
            <span class="level2-label">Sua resposta final</span>
            <pre class="level2-quadra">${escapeHtml(finalQuadra || "Quadra indisponível.")}</pre>
          </div>
          <div>
            <span class="level2-label">Inanna</span>
            <pre class="level2-quadra">${escapeHtml(inannaQuadra || "Quadra indisponível.")}</pre>
          </div>
        </div>
        <div class="text-card__actions">
          <button class="btn btn-secondary" type="button" data-action="copy-level2-result" data-round-id="${escapeHtml(roundId)}">Copiar texto</button>
          <button class="btn btn-primary" type="button" data-action="publish-level2-result" data-round-id="${escapeHtml(roundId)}">Publicar</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderPlayerPanel() {
  if (!ui.userDashboardSection) return;
  if (ui.playerDisplayNameInput) ui.playerDisplayNameInput.value = getPlayerDisplayName();
  if (ui.dashboardProfileEditPanel) ui.dashboardProfileEditPanel.hidden = !state.dashboardProfileEditOpen;
  if (ui.toggleDashboardProfileEditBtn) {
    ui.toggleDashboardProfileEditBtn.textContent = state.dashboardProfileEditOpen ? "Fechar edição" : "Editar dados estatísticos";
  }
  if (ui.saveDashboardProfileBtn) {
    ui.saveDashboardProfileBtn.disabled = state.dashboardProfileSaving;
    ui.saveDashboardProfileBtn.textContent = state.dashboardProfileSaving ? "Salvando..." : "Salvar dados estatísticos";
  }
  syncDashboardProfileFormFromState();
  renderDashboardProfileSummary();
  renderPlayerLevel1Rewards();
  renderPlayerLevel2Rewards();
  renderPlayerLevel2Results();
  syncSextilhaTrackAccess();
}

function renderDashboardRestrictedCaderno() {
  if (ui.dashboardGreeting) ui.dashboardGreeting.textContent = `${getPlayerDisplayName()}, este é seu painel`;
  if (ui.dashboardFolhetoCount) ui.dashboardFolhetoCount.textContent = "0";
  if (ui.dashboardTextCount) ui.dashboardTextCount.textContent = "0";
  if (ui.dashboardCompletedCount) ui.dashboardCompletedCount.textContent = "0";
  if (ui.dashboardLastEdited) ui.dashboardLastEdited.textContent = "Caderno em preparação";
  if (ui.dashboardTextList) {
    ui.dashboardTextList.innerHTML = `<div class="workspace-empty">${escapeHtml(SEXTILHA_LOCKED_NOTICE)}</div>`;
  }
  if (ui.btnCreateFolheto) ui.btnCreateFolheto.disabled = true;
  if (ui.btnCreateText) ui.btnCreateText.disabled = true;
  if (ui.dashboardStatusFilter) ui.dashboardStatusFilter.disabled = true;
}

async function loadLevel2PlayerProfile() {
  if (!INANNA_LEVEL2_AGENT_URL) {
    state.playerLevel2Profile = { wallet: null, rewards: [], sessions: [], rounds: [], pieces: [], source: "local" };
    state.playerLevel2ProfileStatus = "ready";
    return state.playerLevel2Profile;
  }
  const playerId = getLevel2PlayerId();
  if (!playerId) return null;
  state.playerLevel2ProfileStatus = "loading";
  renderPlayerPanel();
  const url = `${INANNA_LEVEL2_AGENT_URL.replace(/\/$/, "")}/v2/player/${encodeURIComponent(playerId)}/profile`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-inanna-player-id": playerId,
      "accept": "application/json",
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.ok === false) throw new Error(data?.message || data?.error || "Falha ao carregar perfil do jogador.");
  state.playerLevel2Profile = data;
  state.playerLevel2ProfileStatus = "ready";
  renderPlayerPanel();
  return data;
}

async function refreshPlayerPanelData(options = {}) {
  renderPlayerPanel();
  try {
    await loadLevel2PlayerProfile();
  } catch (error) {
    console.warn("[player-panel] nao foi possivel carregar ganhos do nivel 2", error);
    state.playerLevel2ProfileStatus = "error";
    if (!state.playerLevel2Profile) state.playerLevel2Profile = { wallet: null, rewards: [], sessions: [], rounds: [], pieces: [] };
    renderPlayerPanel();
    if (options.toast) showToast(error?.message || "Não consegui atualizar o painel agora.", "muted", { duration: 4200 });
  }
}

function openQuadraLevelChooser() {
  state.selectedTrack = "quadras";
  resetSextilhaState();
  hideGameExperience();
  setView("quadraLevels", ui.quadraLevelsSection);
  loadPlayerProgress();
  syncLevel2TrackAccess();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function openPlayerDashboard() {
  state.selectedTrack = "playerPanel";
  hideGameExperience();
  setView("playerDashboard", ui.userDashboardSection);
  loadPlayerProgress();
  setCadernoDashboardVisible(false);
  if (ui.dashboardGreeting) ui.dashboardGreeting.textContent = `${getPlayerDisplayName()}, este é seu painel`;
  renderPlayerPanel();
  refreshPlayerPanelData().catch(() => {});
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function unlockLevel2FromPlayerPanel() {
  const progress = ensurePlayerProgress();
  if (Number(progress.levelUnlocked || 1) >= 2) {
    showToast("O Nível 2 já está liberado no seu painel.", "success");
    renderPlayerPanel();
    return;
  }
  if (!isLevel2UnlockReady(progress)) {
    showToast(getLevel2StatusMessage(progress), "muted", { duration: 4600 });
    renderPlayerPanel();
    return;
  }
  savePlayerProgress({ ...progress, levelUnlocked: 2 });
  showToast("Inanna reconheceu suas marcas: Nível 2 liberado.", "success", { duration: 4600 });
  renderPlayerPanel();
}

async function handlePlayerResultAction(event) {
  const button = event.target.closest("button[data-action][data-round-id]");
  if (!button) return;
  const round = getLevel2RoundById(button.dataset.roundId);
  if (!round) return;
  const text = buildLevel2ShareText(round);
  if (button.dataset.action === "publish-level2-result" && navigator.share) {
    try {
      await navigator.share({ title: "Peleja com Inanna", text });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast(button.dataset.action === "publish-level2-result" ? "Texto copiado para publicar." : "Texto copiado.", "success");
  } catch (error) {
    console.error(error);
    showToast("Não consegui copiar automaticamente.", "muted");
  }
}

function normalizeLooseIdentityText(value) {
  return norm(String(value || "")).replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizePersonIdentityText(value) {
  return normalizeLooseIdentityText(value).replace(/\s+/g, " ").trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalizeUFOrInternational(value) {
  const ufs = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];
  const text = String(value || "").trim().toUpperCase();
  if (!text) return "";
  if (text.includes("INTERNAC") || text === "INT" || text === "INTL") return "INTERNACIONAL";
  const letters = text.replace(/[^A-Z]/g, "").slice(0, 2);
  if (ufs.includes(letters)) return letters;
  if (ufs.includes(text)) return text;
  return "INTERNACIONAL";
}

function normalizeOrigem(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (text.includes("oficina") || text.includes("cordel")) return "Oficina Cordel 2.0";
  if (text.includes("part") || text.includes("priv")) return "Particular";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDateTime(value) {
  if (!value) return "Ainda sem registro";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function setElementDisplay(el, shouldShow, displayValue = "") {
  if (!el) return;
  el.style.display = shouldShow ? displayValue : "none";
}

function getWorkspacePanels() {
  return [
    ui.trackChooserSection,
    ui.quadraLevelsSection,
    ui.level2PreviewSection,
    ui.userDashboardSection,
    ui.folhetoWorkspaceSection,
    ui.sextilhaEditorSection,
    ui.versionHistorySection,
  ];
}

function getSextilhaVerseInputs() {
  return [
    ui.editorVerse1,
    ui.editorVerse2,
    ui.editorVerse3,
    ui.editorVerse4,
    ui.editorVerse5,
    ui.editorVerse6,
  ];
}

function getSextilhaVerseFields() {
  return Array.from(document.querySelectorAll(".verse-field"));
}

function getSextilhaVerseMeterButtons() {
  return Array.from(document.querySelectorAll(".verse-meter"));
}

function getSextilhaRhymeBadges() {
  return Array.from(document.querySelectorAll(".verse-rhyme-badge[data-rhyme-target='b']"));
}

function setEditorInannaState(nextState, options = {}) {
  const avatarConfig = INANNA_AVATAR_STATES[nextState] || INANNA_AVATAR_STATES.observing;
  state.editorAvatarState = nextState in INANNA_AVATAR_STATES ? nextState : "observing";
  state.editorAvatarLockedUntil = options.lockForMs ? Date.now() + Number(options.lockForMs) : 0;

  if (ui.editorInannaAvatar) {
    ui.editorInannaAvatar.src = avatarConfig.src;
    ui.editorInannaAvatar.alt = `Inanna, gata siamesa de olhos azuis, em estado ${avatarConfig.title.toLowerCase()}`;
  }
  if (ui.editorInannaStateTitle) {
    ui.editorInannaStateTitle.textContent = avatarConfig.title;
  }
  if (ui.editorInannaStateText) {
    ui.editorInannaStateText.textContent = avatarConfig.text;
  }
}

function syncEditorInannaPresence() {
  if (state.aiFeedbackLoading) return;
  if (Date.now() < Number(state.editorAvatarLockedUntil || 0)) return;
  setEditorInannaState("observing");
}

function playInannaFeedbackSound() {
  const audio = ui.inannaFeedbackSound;
  if (!audio) return;

  try {
    audio.currentTime = 0;
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }
  } catch (error) {
    console.debug("Nao foi possivel tocar o miado suave.", error);
  }
}

function showToast(message, tone = "muted", options = {}) {
  if (!ui.toastRegion || !message) return;
  const duration = Number(options.duration || TOAST_AUTO_CLOSE_MS);
  const toastId = `toast_${Date.now()}_${toastSequence += 1}`;
  const toast = document.createElement("div");
  toast.className = `toast toast--${tone}`.trim();
  toast.dataset.toastId = toastId;
  toast.textContent = message;
  ui.toastRegion.appendChild(toast);

  const closeToast = () => {
    if (!toast.isConnected) return;
    toast.classList.add("toast--closing");
    window.setTimeout(() => {
      if (toast.isConnected) toast.remove();
    }, 180);
  };

  window.setTimeout(closeToast, duration);
}

function setActiveWorkspacePanel(activePanel) {
  getWorkspacePanels().forEach((panel) => {
    if (!panel) return;
    panel.classList.toggle("active", panel === activePanel);
  });
}

function hideGameExperience() {
  [ui.step0, ui.step1, ui.step2, ui.step3].forEach((section) => {
    if (section) section.classList.remove("active");
  });
  if (ui.poemSection) ui.poemSection.classList.remove("visible");
}

function syncExperienceChrome() {
  const isGameView = state.view === "game" || state.view === "gameResult";
  setElementDisplay(ui.stepsBar, isGameView, "");
  setElementDisplay(ui.headerRight, isGameView, "flex");
  setElementDisplay(ui.rankingArea, isGameView, "block");
}

function setView(nextView, activePanel = null) {
  state.view = nextView;
  setActiveWorkspacePanel(activePanel);
  syncExperienceChrome();
  if (nextView === "sextilhaEditor") {
    syncEditorInannaPresence();
  }
}

function buildIdentityPayload() {
  return {
    participantId: state.participantId,
    checkinUserId: state.checkinUserId,
    email: state.email,
    name: state.name,
    municipio: state.municipio,
    estado: state.estadoUF,
    origem: state.origem,
    teacherGroup: state.teacherGroup,
    appVariant: APP_VARIANT,
  };
}

function recordIdentityDebugSnapshot(context, details = {}) {
  const snapshot = {
    context: String(context || "").trim() || "identity",
    at: new Date().toISOString(),
    participantId: String(details.participantId || state.participantId || "").trim(),
    rebuiltParticipantId: String(details.rebuiltParticipantId || "").trim(),
    checkinUserId: String(details.checkinUserId || state.checkinUserId || "").trim(),
    checkinUserIdSource: String(details.checkinUserIdSource || "").trim(),
    participantIdSource: String(details.participantIdSource || "").trim(),
    email: String(details.email || state.email || "").trim(),
    checkinRowNumber: Number(details.checkinRowNumber || 0),
  };
  const debugLog = Array.isArray(window.__INANNA_IDENTITY_DEBUG_LOG)
    ? window.__INANNA_IDENTITY_DEBUG_LOG
    : [];
  debugLog.push(snapshot);
  window.__INANNA_IDENTITY_DEBUG_LOG = debugLog.slice(-20);
  window.__INANNA_IDENTITY_DEBUG = snapshot;
  console.info("[identity]", snapshot);
}

function reconcileAuthoritativeIdentity(source = {}) {
  const nextParticipantId = String(source?.participantId || "").trim();
  const nextCheckinUserId = String(source?.checkinUserId || "").trim();
  const nextTeacherGroup = String(source?.teacherGroup || "").trim();
  const nextParticipantIdSource = String(source?.participantIdSource || "").trim();
  const nextRebuiltParticipantId = String(source?.rebuiltParticipantId || "").trim();
  let didChange = false;

  if (nextParticipantId && nextParticipantId !== state.participantId) {
    state.participantId = nextParticipantId;
    didChange = true;
  }
  if (nextCheckinUserId && nextCheckinUserId !== state.checkinUserId) {
    state.checkinUserId = nextCheckinUserId;
    didChange = true;
  }
  if (nextTeacherGroup && nextTeacherGroup !== state.teacherGroup) {
    state.teacherGroup = nextTeacherGroup;
    didChange = true;
  }

  if (state.playerData) {
    if (nextParticipantId) {
      state.playerData.participantId = nextParticipantId;
    }
    if (nextCheckinUserId) {
      state.playerData.checkinUserId = nextCheckinUserId;
    }
    if (nextTeacherGroup) {
      state.playerData.teacherGroup = nextTeacherGroup;
    }
  }

  if (didChange) {
    recordIdentityDebugSnapshot("identity_reconciled", {
      participantId: nextParticipantId || state.participantId,
      rebuiltParticipantId: nextRebuiltParticipantId,
      checkinUserId: nextCheckinUserId || state.checkinUserId,
      checkinUserIdSource: String(source?.checkinUserIdSource || "").trim(),
      participantIdSource: nextParticipantIdSource,
    });
  }
}

function buildLoadingSkeletonCard() {
  return `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-card__line skeleton-card__line--title"></div>
      <div class="skeleton-card__line skeleton-card__line--mid"></div>
      <div class="skeleton-card__line skeleton-card__line--short"></div>
      <div class="skeleton-card__chips">
        <span class="skeleton-card__chip"></span>
        <span class="skeleton-card__chip"></span>
        <span class="skeleton-card__chip"></span>
      </div>
      <div class="skeleton-card__actions">
        <span class="skeleton-card__button"></span>
        <span class="skeleton-card__button"></span>
      </div>
    </div>
  `;
}

function renderDashboardLoadingSkeleton() {
  if (ui.dashboardFolhetoCount) ui.dashboardFolhetoCount.textContent = "...";
  if (ui.dashboardTextCount) ui.dashboardTextCount.textContent = "...";
  if (ui.dashboardCompletedCount) ui.dashboardCompletedCount.textContent = "...";
  if (ui.dashboardLastEdited) ui.dashboardLastEdited.textContent = "Carregando seu caderno...";
  if (ui.dashboardTextList) {
    ui.dashboardTextList.innerHTML = `
      <div class="workspace-empty workspace-empty--skeleton">
        ${buildLoadingSkeletonCard()}
        ${buildLoadingSkeletonCard()}
        ${buildLoadingSkeletonCard()}
      </div>
    `;
  }
}

function renderDashboardLoadError(message) {
  if (ui.dashboardFolhetoCount) ui.dashboardFolhetoCount.textContent = "0";
  if (ui.dashboardTextCount) ui.dashboardTextCount.textContent = "0";
  if (ui.dashboardCompletedCount) ui.dashboardCompletedCount.textContent = "0";
  if (ui.dashboardLastEdited) ui.dashboardLastEdited.textContent = "Não foi possível carregar agora";
  if (ui.dashboardTextList) {
    ui.dashboardTextList.innerHTML = `
      <div class="workspace-empty">
        ${escapeHtml(message || "Não foi possível abrir seu caderno agora.")}
      </div>
    `;
  }
}

function renderDashboardSyncNotice(message) {
  if (ui.dashboardFolhetoCount) ui.dashboardFolhetoCount.textContent = "...";
  if (ui.dashboardTextCount) ui.dashboardTextCount.textContent = "...";
  if (ui.dashboardCompletedCount) ui.dashboardCompletedCount.textContent = "...";
  if (ui.dashboardLastEdited) ui.dashboardLastEdited.textContent = "Sincronizando o caderno...";
  if (ui.dashboardTextList) {
    ui.dashboardTextList.innerHTML = `
      <div class="workspace-empty">
        ${escapeHtml(message || "Seu caderno está demorando um pouco mais para responder. Seguimos tentando recuperar o acervo em segundo plano.")}
      </div>
    `;
  }
}

function renderVersionHistoryLoadingSkeleton() {
  if (ui.versionComparePanel) {
    ui.versionComparePanel.innerHTML = "";
  }
  if (!ui.versionHistoryList) return;
  ui.versionHistoryList.innerHTML = `
    <div class="workspace-empty workspace-empty--skeleton">
      ${buildLoadingSkeletonCard()}
      ${buildLoadingSkeletonCard()}
    </div>
  `;
}

function renderEditorAiFeedback(feedback, options = {}) {
  if (!ui.editorAiFeedback) return;

  if (!feedback || !feedback.message) {
    state.aiFeedbackLoading = false;
    ui.editorAiFeedback.className = "ai-feedback-card ai-feedback-card--idle";
    ui.editorAiFeedback.innerHTML = `
      <strong>Feedback breve</strong>
      <p>Salve uma versão para receber uma devolutiva curta e encorajadora da Inanna.</p>
    `;
    if (state.view === "sextilhaEditor") {
      syncEditorInannaPresence();
    }
    return;
  }

  const toneClass = feedback.tone === "error"
    ? "ai-feedback-card--error"
    : feedback.tone === "loading"
      ? "ai-feedback-card--loading"
      : "";
  const label = feedback.tone === "loading"
    ? "Inanna está lendo"
    : "Inanna acompanha";
  ui.editorAiFeedback.className = `ai-feedback-card ${toneClass}`.trim();
  ui.editorAiFeedback.innerHTML = `
    <strong>${escapeHtml(label)}</strong>
    <p>${escapeHtml(feedback.message)}</p>
  `;

  if (feedback.tone === "loading") {
    state.aiFeedbackLoading = true;
    setEditorInannaState("reading");
    return;
  }

  state.aiFeedbackLoading = false;
  if (feedback.tone === "error") {
    syncEditorInannaPresence();
    return;
  }

  if (options.celebrate) {
    setEditorInannaState("celebrating", { lockForMs: 4200 });
    playInannaFeedbackSound();
    window.setTimeout(syncEditorInannaPresence, 4300);
    return;
  }

  syncEditorInannaPresence();
}

function buildFolhetoCollection(texts = [], folhetos = []) {
  const registry = new Map();
  const sourceTexts = Array.isArray(texts) ? texts : [];
  const sourceFolhetos = Array.isArray(folhetos) ? folhetos : [];

  sourceFolhetos.forEach((folheto) => {
    const folhetoId = String(folheto?.folhetoId || "").trim();
    if (!folhetoId) return;
    registry.set(folhetoId, {
      folhetoId,
      title: String(folheto?.title || "Folheto sem título").trim() || "Folheto sem título",
      createdAt: folheto?.createdAt || "",
      updatedAt: folheto?.updatedAt || "",
      textCount: Number(folheto?.textCount || 0),
      completedCount: Number(folheto?.completedCount || 0),
      texts: [],
      isLegacyBucket: false,
    });
  });

  sourceTexts.forEach((text) => {
    const folhetoId = String(text?.folhetoId || "").trim() || SYNTHETIC_LEGACY_FOLHETO_ID;
    const existing = registry.get(folhetoId) || {
      folhetoId,
      title: folhetoId === SYNTHETIC_LEGACY_FOLHETO_ID
        ? "Acervo anterior"
        : String(text?.folhetoTitle || "Folheto sem título").trim() || "Folheto sem título",
      createdAt: text?.createdAt || "",
      updatedAt: text?.updatedAt || "",
      textCount: 0,
      completedCount: 0,
      texts: [],
      isLegacyBucket: folhetoId === SYNTHETIC_LEGACY_FOLHETO_ID,
    };
    existing.texts.push(text);
    existing.textCount = existing.texts.length;
    existing.completedCount = existing.texts.filter((item) => normalizeStatusValue(item.status) === "concluida").length;
    existing.updatedAt = [existing.updatedAt, text?.updatedAt, text?.createdAt]
      .filter(Boolean)
      .sort((left, right) => new Date(right || 0).getTime() - new Date(left || 0).getTime())[0] || existing.updatedAt;
    registry.set(folhetoId, existing);
  });

  return Array.from(registry.values())
    .map((folheto) => ({
      ...folheto,
      texts: [...folheto.texts].sort((a, b) => {
        const leftOrder = Number(a?.folhetoOrder || 0);
        const rightOrder = Number(b?.folhetoOrder || 0);
        if (leftOrder && rightOrder && leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }
        return new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime();
      }),
    }))
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
}

function sortDashboardRecordsByDate(records = [], fields = ["updatedAt", "createdAt"]) {
  return [...(Array.isArray(records) ? records : [])].sort((left, right) => {
    const leftDate = fields.map((field) => left?.[field]).find(Boolean);
    const rightDate = fields.map((field) => right?.[field]).find(Boolean);
    return new Date(rightDate || 0).getTime() - new Date(leftDate || 0).getTime();
  });
}

function mergeDashboardRecordsByKey(primaryRecords = [], secondaryRecords = [], keyName) {
  const merged = new Map();
  [primaryRecords, secondaryRecords].forEach((group) => {
    (Array.isArray(group) ? group : []).forEach((record) => {
      const key = String(record?.[keyName] || "").trim();
      if (!key || merged.has(key)) return;
      merged.set(key, record);
    });
  });
  return Array.from(merged.values());
}

function buildDashboardPayloadFromCollections(texts = [], folhetos = [], basePayload = {}) {
  const sortedTexts = sortDashboardRecordsByDate(texts);
  const sortedFolhetos = sortDashboardRecordsByDate(folhetos);
  const groupedFolhetos = buildFolhetoCollection(sortedTexts, sortedFolhetos);

  return {
    status: "success",
    participantId: String(basePayload?.participantId || "").trim(),
    checkinUserId: String(basePayload?.checkinUserId || "").trim(),
    name: String(basePayload?.name || "").trim(),
    email: String(basePayload?.email || "").trim(),
    teacherGroup: String(basePayload?.teacherGroup || "").trim(),
    folhetoCount: groupedFolhetos.length,
    textCount: sortedTexts.length,
    completedCount: sortedTexts.filter((text) => normalizeStatusValue(text.status) === "concluida").length,
    lastEditedAt: sortedTexts[0]?.updatedAt || sortedTexts[0]?.createdAt || "",
    folhetos: groupedFolhetos,
    texts: sortedTexts,
  };
}

function mergeDashboardPayloads(primaryPayload = {}, secondaryPayload = {}) {
  const mergedTexts = mergeDashboardRecordsByKey(primaryPayload?.texts, secondaryPayload?.texts, "textId");
  const mergedFolhetos = mergeDashboardRecordsByKey(primaryPayload?.folhetos, secondaryPayload?.folhetos, "folhetoId");

  return buildDashboardPayloadFromCollections(mergedTexts, mergedFolhetos, {
    participantId: primaryPayload?.participantId || secondaryPayload?.participantId || state.participantId,
    checkinUserId: primaryPayload?.checkinUserId || secondaryPayload?.checkinUserId || state.checkinUserId,
    name: primaryPayload?.name || secondaryPayload?.name || state.name,
    email: primaryPayload?.email || secondaryPayload?.email || state.email,
    teacherGroup: primaryPayload?.teacherGroup || secondaryPayload?.teacherGroup || state.teacherGroup,
  });
}

function buildDashboardCacheKey(identity = buildIdentityPayload()) {
  const participantId = String(identity?.participantId || state.participantId || "").trim();
  return participantId ? `${DASHBOARD_CACHE_KEY_PREFIX}:${participantId}` : "";
}

function payloadHasDashboardContent(payload = {}) {
  return Number(payload?.textCount || 0) > 0
    || Number(payload?.folhetoCount || 0) > 0
    || !!String(payload?.lastEditedAt || "").trim();
}

function readDashboardCache(identity = buildIdentityPayload()) {
  const cacheKey = buildDashboardCacheKey(identity);
  if (!cacheKey || !window.localStorage) return null;

  try {
    const rawValue = window.localStorage.getItem(cacheKey);
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed?.texts) || !Array.isArray(parsed?.folhetos)) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

function persistDashboardCache(identity = buildIdentityPayload(), payload = {}, options = {}) {
  const cacheKey = buildDashboardCacheKey(identity);
  if (!cacheKey || !window.localStorage) return;

  const allowEmpty = !!options.allowEmpty;
  const hasMeaningfulContent = payloadHasDashboardContent(payload);

  if (!allowEmpty && !hasMeaningfulContent) return;

  try {
    window.localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch (_) {
    // Ignora indisponibilidade de storage local sem quebrar o caderno.
  }
}

function withTimeout(promise, timeoutMs, errorMessage) {
  if (!timeoutMs || timeoutMs <= 0) return promise;

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(errorMessage || "A operacao demorou mais do que o esperado."));
    }, timeoutMs);

    Promise.resolve(promise)
      .then((value) => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

async function sha256Hex(value) {
  if (!window.crypto?.subtle || typeof window.TextEncoder === "undefined") {
    throw new Error("Web Crypto indisponivel");
  }

  const encoded = new window.TextEncoder().encode(String(value || ""));
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

async function buildStableDashboardId(prefix, parts = []) {
  const source = parts.map((part) => String(part || "").trim().toLowerCase()).join("|");
  const digest = await sha256Hex(source);
  return `${String(prefix || "id")}_${digest.slice(0, 16)}`;
}

async function buildDashboardIdentityVariants(identity = buildIdentityPayload()) {
  const baseIdentity = {
    ...identity,
    email: String(identity?.email || "").trim(),
  };
  const variants = [baseIdentity];
  const aliasIds = new Set();

  try {
    const normalizedEmail = normalizeEmail(baseIdentity.email);
    if (baseIdentity.checkinUserId) {
      aliasIds.add(await buildStableDashboardId("participant", ["checkin", baseIdentity.checkinUserId]));
    }
    if (normalizedEmail) {
      aliasIds.add(await buildStableDashboardId("participant", ["email", normalizedEmail]));
    }
    if (baseIdentity.name || baseIdentity.municipio || baseIdentity.estado || baseIdentity.origem) {
      aliasIds.add(await buildStableDashboardId("participant", [
        "name",
        normalizePersonIdentityText(baseIdentity.name),
        normalizeLooseIdentityText(baseIdentity.municipio),
        normalizeLooseIdentityText(baseIdentity.estado),
        normalizeLooseIdentityText(baseIdentity.origem),
      ]));
    }
  } catch (_) {
    return variants;
  }

  aliasIds.forEach((participantId) => {
    if (!participantId || participantId === baseIdentity.participantId) return;
    variants.push({
      ...baseIdentity,
      participantId,
      email: "",
    });
  });

  return variants;
}

function assertSupabaseBackendConfigured() {
  if (window.InannaSupabaseBridge?.isConfigured?.()) return;
  throw new Error("Supabase ainda não foi configurado para a Inanna.");
}

async function loadSupabaseDashboardPayload(identity = buildIdentityPayload()) {
  assertSupabaseBackendConfigured();
  await withTimeout(
    ensureSupabaseSextilhaSession(),
    DASHBOARD_SUPABASE_SESSION_TIMEOUT_MS,
    "A sessao do Supabase demorou mais do que o esperado."
  );
  return withTimeout(
    window.InannaSupabaseBridge.getUserDashboard(identity),
    DASHBOARD_BACKGROUND_REQUEST_TIMEOUT_MS,
    "A leitura do Supabase demorou mais do que o esperado."
  );
}

async function refreshDashboardInBackground(requestId, identity, basePayload = null) {
  if (getConfiguredSextilhaDataSource() !== SUPABASE_SEXTILHA_MODE) return;

  try {
    const payload = await loadSupabaseDashboardPayload(identity);
    if (!payload || requestId !== state.dashboardLoadRequestId) return;
    if (!["sextilhaDashboard", "folhetoWorkspace"].includes(state.view)) return;

    const mergedPayload = basePayload ? mergeDashboardPayloads(basePayload, payload) : payload;
    applyDashboardPayload(mergedPayload);
  } catch (error) {
    console.warn("[dashboard] nao foi possivel atualizar o caderno em segundo plano", error);
  }
}

function buildDashboardPayloadFromState() {
  return buildDashboardPayloadFromCollections(state.userTexts, state.userFolhetos, {
    participantId: state.participantId,
    checkinUserId: state.checkinUserId,
    name: state.name,
    email: state.email,
    teacherGroup: state.teacherGroup,
  });
}

function upsertTextInDashboardState(text) {
  if (!text?.textId) return;
  const nextText = {
    ...text,
    indicators: text.indicators || state.activeText?.indicators || {},
  };
  const nextTexts = state.userTexts.filter((item) => item.textId !== nextText.textId);
  nextTexts.unshift(nextText);
  state.userTexts = nextTexts.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  state.userFolhetos = buildFolhetoCollection(state.userTexts, state.userFolhetos);
  state.userDashboard = buildDashboardPayloadFromState();
}

function upsertFolhetoInDashboardState(folheto) {
  if (!folheto?.folhetoId) return;
  const nextFolheto = {
    ...folheto,
    title: String(folheto.title || "Folheto sem título").trim() || "Folheto sem título",
  };
  const nextFolhetos = state.userFolhetos.filter((item) => item.folhetoId !== nextFolheto.folhetoId);
  nextFolhetos.unshift(nextFolheto);
  state.userFolhetos = buildFolhetoCollection(state.userTexts, nextFolhetos);
  state.userDashboard = buildDashboardPayloadFromState();
}

function beginTextPersistProgressiveFeedback(saveMode = "draft") {
  if (!ui.btnSaveTextVersion && !ui.btnFinalizeText) {
    return () => {};
  }

  if (ui.btnSaveTextVersion) {
    ui.btnSaveTextVersion.disabled = true;
    ui.btnSaveTextVersion.textContent = "Salvando rascunho...";
  }

  if (ui.btnFinalizeText) {
    ui.btnFinalizeText.disabled = true;
    ui.btnFinalizeText.textContent = saveMode === "finalize"
      ? (INANNA_SOCIAL_EMAIL_ENABLED ? "Finalizando e preparando e-mail..." : "Finalizando...")
      : (INANNA_SOCIAL_EMAIL_ENABLED ? "Finalizar e receber por e-mail" : "Finalizar sextilha");
  }

  return () => {
    if (ui.btnSaveTextVersion) {
      ui.btnSaveTextVersion.disabled = isEditorLocked();
      ui.btnSaveTextVersion.textContent = "Salvar rascunho";
    }
    if (ui.btnFinalizeText) {
      ui.btnFinalizeText.disabled = isEditorLocked();
      ui.btnFinalizeText.textContent = INANNA_SOCIAL_EMAIL_ENABLED ? "Finalizar e receber por e-mail" : "Finalizar sextilha";
    }
  };
}

function shouldApplyAiFeedbackResponse(requestKey, textId, versionId) {
  return (
    state.aiFeedbackRequestKey === requestKey &&
    state.activeTextId === textId &&
    String(state.activeText?.currentVersionId || "").trim() === String(versionId || "").trim()
  );
}

async function requestAiFeedbackForVersion(textId, versionId, payload = null) {
  if (!textId || !versionId) {
    return;
  }

  if (!INANNA_AI_ENABLED) {
    state.lastAiFeedback = null;
    state.aiFeedbackLoading = false;
    renderEditorAiFeedback({
      source: "inanna",
      tone: "muted",
      message: "A Inanna segue observando. A devolutiva automática de IA fica para uma próxima fase.",
    });
    return;
  }

  const requestKey = `${textId}:${versionId}:${Date.now()}`;
  const versionLabel = buildSextilhaVersionLabel(payload);
  state.aiFeedbackRequestKey = requestKey;
  state.aiFeedbackLoading = true;
  renderEditorAiFeedback({
    source: "inanna",
    tone: "loading",
    message: "Inanna está lendo seu rascunho com calma para deixar um comentário breve e sutil.",
  });

  try {
    const response = await generateSextilhaTextFeedbackRecord(payload || { textId, versionId });
    if (!shouldApplyAiFeedbackResponse(requestKey, textId, versionId)) return;

    state.lastAiFeedback = response?.aiFeedback || null;
    if (state.lastAiFeedback?.message) {
      renderEditorAiFeedback(state.lastAiFeedback, { celebrate: true });
      setEditorFeedback(`${versionLabel} salva e devolutiva recebida.`, "success");
      return;
    }

    state.lastAiFeedback = null;
    renderEditorAiFeedback(null);
  } catch (error) {
    if (!shouldApplyAiFeedbackResponse(requestKey, textId, versionId)) return;
    setEditorFeedback(`${versionLabel} salva. A devolutiva ainda não chegou.`, "muted");
    renderEditorAiFeedback({
      tone: "error",
      message: error?.message || "A Inanna não conseguiu responder agora, mas o rascunho foi salvo.",
    });
  }
}

async function ensureSupabaseSextilhaSession() {
  assertSextilhaWorkspaceAccess();
  assertSupabaseBackendConfigured();

  if (!state.participantId || !state.checkinUserId) {
    throw new Error("Verifique o e-mail de check-in antes de abrir o caderno.");
  }

  state.supabaseSessionReady = true;
  state.sextilhaStoreStatus = SUPABASE_SEXTILHA_MODE;
  return { provider: SUPABASE_SEXTILHA_MODE };
}

function prewarmSupabaseSextilhaSession() {
  if (getConfiguredSextilhaDataSource() !== SUPABASE_SEXTILHA_MODE) return;
  if (!state.participantId || !state.checkinUserId) return;
  if (!canAccessSextilhaWorkspace()) return;

  ensureSupabaseSextilhaSession().catch((error) => {
    console.warn("[supabase] nao foi possivel aquecer a sessao antecipadamente", error);
  });
}

async function runSextilhaStoreOperation(operationName, supabaseFn) {
  assertSextilhaWorkspaceAccess();
  await ensureSupabaseSextilhaSession();

  try {
    return await supabaseFn(window.InannaSupabaseBridge);
  } catch (error) {
    console.warn(`[sextilha-store] falha no Supabase em ${operationName}`, error);
    state.sextilhaStoreStatus = "error";
    state.supabaseSessionReady = false;
    throw error;
  }
}

async function loadUserDashboardData() {
  const identity = buildIdentityPayload();
  const payload = await loadSupabaseDashboardPayload(identity);
  state.sextilhaStoreStatus = SUPABASE_SEXTILHA_MODE;
  state.supabaseSessionReady = true;
  return payload;
}

async function createSextilhaTextRecord(payload) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "create_text",
    (bridge) => bridge.createText(identity, payload)
  );
}

async function createFolhetoRecord(payload) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "create_folheto",
    (bridge) => bridge.createFolheto(identity, payload)
  );
}

async function loadSextilhaTextRecord(textId) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "get_text",
    (bridge) => bridge.getText(identity, textId)
  );
}

async function saveSextilhaTextVersionRecord(payload) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "save_text_version",
    (bridge) => bridge.saveTextVersion(identity, payload)
  );
}

async function generateSextilhaTextFeedbackRecord() {
  return {
    status: INANNA_AI_ENABLED ? "pending" : "disabled",
    aiFeedback: null,
  };
}

async function loadSextilhaTextVersionsRecord(textId) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "get_text_versions",
    (bridge) => bridge.getTextVersions(identity, textId)
  );
}

async function archiveSextilhaTextRecord(textId, payload = {}) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "archive_text",
    (bridge) => bridge.archiveText(identity, { textId, ...payload })
  );
}

async function updateSextilhaTextStatusRecord(textId, payload = {}) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "update_text_status",
    (bridge) => bridge.updateTextStatus(identity, { textId, ...payload })
  );
}

function normalizeStatusValue(value) {
  return String(value || "").trim().toLowerCase() || "rascunho";
}

function statusClassName(status) {
  return `status-${normalizeStatusValue(status).replace(/[^a-z0-9]+/g, "-")}`;
}

function getStatusLabel(status) {
  return SEXTILHA_STATUS_LABELS[normalizeStatusValue(status)] || "Rascunho";
}

function renderStatusBadge(status) {
  return `<span class="status-badge ${statusClassName(status)}">${escapeHtml(getStatusLabel(status))}</span>`;
}

function normalizeProfileGender(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ["feminino", "masculino", "outro", "prefiro_nao_dizer"].includes(normalized) ? normalized : "";
}

function normalizeProfileRace(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["negro", "negra"].includes(normalized)) return "preto";
  return ["branco", "indigena", "pardo", "preto", "outro"].includes(normalized) ? normalized : "";
}

function normalizeProfileAgeRange(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ["menos_de_11", "12_14", "15_17", "18_29", "30_44", "45_59", "maior_de_60"].includes(normalized) ? normalized : "";
}

function normalizeLegacyAgeRange(value) {
  const normalized = norm(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (!normalized) return "";
  if (["menor", "menos_de_11", "ate_11", "0_11"].includes(normalized)) return "menos_de_11";
  if (["12_14", "12_a_14"].includes(normalized)) return "12_14";
  if (["15_17", "15_a_17"].includes(normalized)) return "15_17";
  if (["18_29", "18_a_29", "maior"].includes(normalized)) return "18_29";
  if (["30_44", "30_a_44"].includes(normalized)) return "30_44";
  if (["45_59", "45_a_59"].includes(normalized)) return "45_59";
  if (["maior_de_60", "60_mais", "acima_de_60"].includes(normalized)) return "maior_de_60";
  return "";
}

function normalizeBooleanProfileValue(value) {
  if (value === true || value === false) return value;
  const normalized = String(value || "").trim().toLowerCase();
  if (["sim", "yes", "true", "1"].includes(normalized)) return true;
  if (["nao", "não", "no", "false", "0"].includes(normalized)) return false;
  return null;
}

function needsProfileCompletion() {
  return state.checkinLookupStatus === "matched" && !state.profileComplete;
}

// Convite diferido e opcional ao perfil — depois da 1ª quadra fechada, nunca antes
// do primeiro verso (analise-inanna.md §12; plano-coleta-unificada.md §4, §62).
// Mostra no máximo uma vez por sessão e nunca bloqueia a experiência.
function maybePromptDeferredProfile() {
  if (state.deferredProfilePrompted) return;
  if (!needsProfileCompletion()) return;
  state.deferredProfilePrompted = true;
  showToast(
    "Boa! Respondendo um perfil rapidinho você entra no placar — e é uma vez só para todos os apps do Laboratório.",
    "primary",
    { duration: 6000 }
  );
}

// Modo experimentar: jogar sem check-in. Identidade fica anônima ("visitante"),
// nada é persistido no Supabase; após GUEST_FREE_QUADRAS sugere o cadastro.
function startGuestSession() {
  if (!INANNA_GUEST_MODE_ENABLED) return;
  state.isGuest = true;
  state.guestQuadraCount = 0;
  state.deferredProfilePrompted = true; // não pedir perfil a quem nem se cadastrou
  state.name = "Visitante";
  state.email = "";
  state.participantId = "";
  state.checkinUserId = "";
  state.checkinLookupStatus = "idle";
  state.profileComplete = false;
  state.playerData = {
    nome: "Visitante",
    email: "",
    tipoAcesso: "Experimentar sem cadastro",
    participantId: "",
    checkinUserId: "",
    guest: true
  };
  setStartHint("");
  showTrackChooser();
  showToast(
    "Modo experimentar: jogue à vontade. Para salvar e entrar no placar, faça o check-in com seu e-mail depois.",
    "muted",
    { duration: 5000 }
  );
}

function maybePromptGuestRegister() {
  if (!state.isGuest) return;
  state.guestQuadraCount = (state.guestQuadraCount || 0) + 1;
  if (state.guestQuadraCount < GUEST_FREE_QUADRAS) return;
  showToast(
    "Curtiu? Faça o check-in com seu e-mail para salvar suas quadras, entrar no placar e desbloquear os próximos níveis.",
    "primary",
    { duration: 8000 }
  );
}

// ── Acervo de folhetos (NFT-simulação) ────────────────────────────────
function escapeSvgText(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const FOLHETO_RARITY_STYLE = {
  dourada: { accent: "#f2c14e", label: "✦ Dourada", border: "#f2c14e" },
  rara: { accent: "#cfd8e3", label: "◆ Rara", border: "#cfd8e3" },
  comum: { accent: "#9a8c7a", label: "• Comum", border: "#6b5d4d" }
};

// Folheto colecionável como SVG (xilogravura simbólica + quadra). Barato e portável;
// o card é a "carta" do acervo, raridade ligada à qualidade (analise §101-103).
function buildFolhetoSVG(folheto = {}, autor = "") {
  const meta = folheto.metadata_json || {};
  const rar = FOLHETO_RARITY_STYLE[folheto.raridade] || FOLHETO_RARITY_STYLE.comum;
  const titulo = folheto.titulo || meta.name || "Folheto de Cordel";
  const versos = String(meta.description || "").split(/\r?\n/).filter(Boolean).slice(0, 6);
  const hashShort = String(folheto.content_hash || "").slice(0, 10);
  const data = folheto.minted_at ? new Date(folheto.minted_at).toLocaleDateString("pt-BR") : "";
  const verseLines = versos.map((v, i) => {
    const line = v.length > 38 ? v.slice(0, 37) + "…" : v;
    return `<text x="30" y="${182 + i * 30}" fill="#f4ecdf" font-size="16" font-family="Georgia, serif">${escapeSvgText(line)}</text>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 520" width="360" height="520" role="img" aria-label="Folheto ${escapeSvgText(titulo)}">
  <rect x="6" y="6" width="348" height="508" rx="14" fill="#1c160f" stroke="${rar.border}" stroke-width="3"/>
  <rect x="16" y="16" width="328" height="488" rx="10" fill="none" stroke="${rar.accent}" stroke-width="1" opacity="0.5"/>
  <text x="30" y="50" fill="${rar.accent}" font-size="13" font-family="Georgia, serif" letter-spacing="2">CORDEL 2.0 · INANNA</text>
  <text x="30" y="84" fill="#f4ecdf" font-size="22" font-family="Georgia, serif" font-weight="bold">${escapeSvgText(titulo.slice(0, 26))}</text>
  <line x1="30" y1="100" x2="330" y2="100" stroke="${rar.accent}" stroke-width="1" opacity="0.6"/>
  <text x="30" y="132" fill="${rar.accent}" font-size="13" font-family="Georgia, serif">${escapeSvgText(rar.label)} · ${Number(folheto.pontos || 0)} pts · ${escapeSvgText(folheto.esquema_rima || "—")}</text>
  ${verseLines}
  <line x1="30" y1="430" x2="330" y2="430" stroke="${rar.accent}" stroke-width="1" opacity="0.4"/>
  <text x="30" y="458" fill="#f4ecdf" font-size="15" font-family="Georgia, serif">— ${escapeSvgText((autor || "Poeta Cordelista").slice(0, 24))}</text>
  <text x="30" y="482" fill="#9a8c7a" font-size="11" font-family="monospace">${escapeSvgText(hashShort)} · ${escapeSvgText(data)}</text>
</svg>`;
}

function showFolhetoOverlay(innerHtml, headline) {
  let overlay = document.getElementById("folhetoOverlay");
  if (overlay) overlay.remove();
  overlay = document.createElement("div");
  overlay.id = "folhetoOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:rgba(0,0,0,0.78);padding:20px;overflow:auto;";
  overlay.innerHTML =
    `<h3 style="color:#f4ecdf;font-family:Georgia,serif;margin:0;text-align:center;">${escapeSvgText(headline || "Meu acervo de folhetos")}</h3>`
    + `<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;max-width:100%;">${innerHtml}</div>`
    + `<button type="button" class="btn btn-secondary" id="folhetoOverlayClose">Fechar</button>`;
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  const closeBtn = document.getElementById("folhetoOverlayClose");
  if (closeBtn) closeBtn.addEventListener("click", () => overlay.remove());
}

function showFolhetoCard(folheto) {
  const autor = getPlayerDisplayName ? getPlayerDisplayName() : state.name;
  showFolhetoOverlay(buildFolhetoSVG(folheto, autor), "🎉 Folheto mintado para seu acervo!");
}

async function maybeMintFolheto(quadraId) {
  if (!INANNA_NFT_MINTING_ENABLED) return;
  if (!quadraId || !state.participantId || state.isGuest) return;
  try {
    const res = await window.InannaSupabaseBridge?.mintFolheto?.({ quadraId, participantId: state.participantId });
    if (res?.ok && res.folheto) showFolhetoCard(res.folheto);
  } catch (err) {
    console.debug("mint de folheto falhou (nao bloqueia)", err);
  }
}

async function openAcervoFolhetos() {
  if (!state.participantId) {
    showToast("Faça o check-in para ver seu acervo de folhetos.", "muted", { duration: 4000 });
    return;
  }
  try {
    const res = await window.InannaSupabaseBridge?.listFolhetos?.({ participantId: state.participantId });
    const folhetos = res?.folhetos || [];
    if (!folhetos.length) {
      showToast("Seu acervo está vazio — feche uma quadra para ganhar seu primeiro folheto.", "muted", { duration: 5000 });
      return;
    }
    const autor = getPlayerDisplayName ? getPlayerDisplayName() : state.name;
    const cards = folhetos.map((f) => buildFolhetoSVG(f, autor)).join("");
    showFolhetoOverlay(cards, `Meu acervo · ${folhetos.length} folheto(s)`);
  } catch (err) {
    console.debug("acervo indisponivel", err);
    showToast("Não consegui abrir o acervo agora.", "muted", { duration: 4000 });
  }
}

// Ponto de entrada do acervo (botão "Meu acervo" pode chamar isto). Exposto p/
// permitir um gatilho de UI sem acoplar a um DOM específico ainda.
if (typeof window !== "undefined") {
  window.inannaAbrirAcervo = openAcervoFolhetos;
}

function setProfileStatus(message = "", color = "var(--muted)") {
  if (!ui.profileStatus) return;
  ui.profileStatus.textContent = message;
  ui.profileStatus.style.color = color;
}

function setDashboardProfileStatus(message = "", color = "var(--muted)") {
  if (!ui.dashboardProfileStatus) return;
  ui.dashboardProfileStatus.textContent = message;
  ui.dashboardProfileStatus.style.color = color;
}

function getInitialProfileControls() {
  return {
    workshopYes: ui.profileWorkshopYes,
    workshopNo: ui.profileWorkshopNo,
    aiChatbotYes: ui.profileAiChatbotYes,
    aiChatbotNo: ui.profileAiChatbotNo,
    gender: ui.profileGender,
    race: ui.profileRace,
    ageRange: ui.profileAgeRange,
    municipioInput: ui.profileMunicipioInput,
    municipioOptions: ui.profileMunicipioOptions,
    outsideBrazil: ui.profileOutsideBrazil,
    saveButton: ui.saveProfileBtn,
    setStatus: setProfileStatus,
  };
}

function getDashboardProfileControls() {
  return {
    workshopYes: ui.dashboardProfileWorkshopYes,
    workshopNo: ui.dashboardProfileWorkshopNo,
    aiChatbotYes: ui.dashboardProfileAiChatbotYes,
    aiChatbotNo: ui.dashboardProfileAiChatbotNo,
    gender: ui.dashboardProfileGender,
    race: ui.dashboardProfileRace,
    ageRange: ui.dashboardProfileAgeRange,
    municipioInput: ui.dashboardProfileMunicipioInput,
    municipioOptions: ui.dashboardProfileMunicipioOptions,
    outsideBrazil: ui.dashboardProfileOutsideBrazil,
    saveButton: ui.saveDashboardProfileBtn,
    setStatus: setDashboardProfileStatus,
  };
}

function getSelectedWorkshopValue(controls = getInitialProfileControls()) {
  if (controls.workshopYes?.checked) return true;
  if (controls.workshopNo?.checked) return false;
  return null;
}

function getSelectedAiChatbotValue(controls = getInitialProfileControls()) {
  if (controls.aiChatbotYes?.checked) return true;
  if (controls.aiChatbotNo?.checked) return false;
  return null;
}

function syncProfileFormValuesFromState(controls) {
  if (!controls) return;
  if (controls.workshopYes) controls.workshopYes.checked = state.oficinaCordel20 === true;
  if (controls.workshopNo) controls.workshopNo.checked = state.oficinaCordel20 === false;
  if (controls.aiChatbotYes) controls.aiChatbotYes.checked = state.usouChatbotIa === true;
  if (controls.aiChatbotNo) controls.aiChatbotNo.checked = state.usouChatbotIa === false;
  if (controls.gender) controls.gender.value = normalizeProfileGender(state.genero);
  if (controls.race) controls.race.value = normalizeProfileRace(state.identificacaoRacial);
  if (controls.ageRange) controls.ageRange.value = normalizeProfileAgeRange(state.faixaEtaria) || normalizeLegacyAgeRange(state.faixaEtaria);
  if (controls.municipioInput) {
    const municipioLabel = state.estadoUF && state.estadoUF !== "EX"
      ? `${state.municipio} - ${state.estadoUF}`
      : state.municipio;
    controls.municipioInput.value = municipioLabel.trim();
  }
  if (controls.outsideBrazil) controls.outsideBrazil.checked = state.pais === "FORA_BRASIL" || state.estadoUF === "EX";
}

function syncProfileFormFromState() {
  if (!state.participantId || state.profileFormParticipantId === state.participantId) return;

  syncProfileFormValuesFromState(getInitialProfileControls());
  state.profileFormParticipantId = state.participantId;
}

function renderProfileCompletionPanel() {
  if (!ui.profileCompletionPanel) return;

  const shouldShow = needsProfileCompletion();
  ui.profileCompletionPanel.hidden = !shouldShow;
  if (!shouldShow) {
    setProfileStatus("");
    return;
  }

  syncProfileFormFromState();
  if (ui.saveProfileBtn) {
    ui.saveProfileBtn.disabled = state.profileSaving;
    ui.saveProfileBtn.textContent = state.profileSaving ? "Salvando..." : "Salvar perfil";
  }
}

function renderMunicipioOptions() {
  if (!municipiosBrasil.length) return;
  const optionsHtml = municipiosBrasil
    .map((item) => `<option value="${escapeHtml(item.label)}"></option>`)
    .join("");
  if (ui.profileMunicipioOptions) ui.profileMunicipioOptions.innerHTML = optionsHtml;
  if (ui.dashboardProfileMunicipioOptions) ui.dashboardProfileMunicipioOptions.innerHTML = optionsHtml;
}

async function loadMunicipiosBrasil() {
  if (state.municipiosBrasilLoaded || municipiosBrasil.length) {
    renderMunicipioOptions();
    return municipiosBrasil;
  }
  if (municipiosBrasilPromise) return municipiosBrasilPromise;

  state.municipiosBrasilLoading = true;
  state.municipiosBrasilError = "";
  municipiosBrasilPromise = (async () => {
    try {
      const cached = window.localStorage?.getItem(MUNICIPIOS_BR_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) {
          municipiosBrasil = parsed;
          state.municipiosBrasilLoaded = true;
          renderMunicipioOptions();
          return municipiosBrasil;
        }
      }
    } catch (_) {
      // Cache corrompido nao deve bloquear o cadastro.
    }

    try {
      const response = await fetch(MUNICIPIOS_BR_API_URL, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`IBGE ${response.status}`);
      const data = await response.json();
      municipiosBrasil = (Array.isArray(data) ? data : [])
        .map((item) => {
          const municipio = String(item?.nome || "").trim();
          const estado = String(item?.microrregiao?.mesorregiao?.UF?.sigla || "").trim().toUpperCase();
          if (!municipio || !estado) return null;
          return { municipio, estado, label: `${municipio} - ${estado}` };
        })
        .filter(Boolean)
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
      state.municipiosBrasilLoaded = true;
      try {
        window.localStorage?.setItem(MUNICIPIOS_BR_CACHE_KEY, JSON.stringify(municipiosBrasil));
      } catch (_) {
        // Lista grande demais para cache local em alguns navegadores.
      }
      renderMunicipioOptions();
      return municipiosBrasil;
    } catch (error) {
      console.warn("Nao foi possivel carregar municipios do IBGE.", error);
      state.municipiosBrasilError = "municipios_unavailable";
      return [];
    } finally {
      state.municipiosBrasilLoading = false;
    }
  })();

  return municipiosBrasilPromise;
}

function parseMunicipioProfileInput(controls = getInitialProfileControls()) {
  const rawMunicipio = String(controls.municipioInput?.value || "").trim();
  const outsideBrazil = !!controls.outsideBrazil?.checked;

  if (outsideBrazil) {
    return {
      ok: !!rawMunicipio,
      municipio: rawMunicipio || "Fora do Brasil",
      estado: "EX",
      pais: "FORA_BRASIL",
      error: rawMunicipio ? "" : "Informe o país/cidade fora do Brasil."
    };
  }

  const exact = municipiosBrasil.find((item) => item.label.toLowerCase() === rawMunicipio.toLowerCase());
  if (exact) return { ok: true, municipio: exact.municipio, estado: exact.estado, pais: "BR", error: "" };

  const typedMatch = rawMunicipio.match(/^(.+?)\s+-\s+([a-z]{2})$/i);
  if (typedMatch) {
    return {
      ok: true,
      municipio: typedMatch[1].trim(),
      estado: typedMatch[2].trim().toUpperCase(),
      pais: "BR",
      error: ""
    };
  }

  if (state.municipiosBrasilLoaded) {
    return { ok: false, municipio: rawMunicipio, estado: "", pais: "BR", error: "Selecione um município da lista ou marque Fora do Brasil." };
  }

  return { ok: !!rawMunicipio, municipio: rawMunicipio, estado: "", pais: "BR", error: rawMunicipio ? "" : "Informe seu município." };
}

async function saveProfileFromControls(controls, options = {}) {
  const setStatus = controls.setStatus || setProfileStatus;
  if (!options.allowCompleted && !needsProfileCompletion()) return;
  if (!window.InannaSupabaseBridge?.completeParticipantProfile) {
    setStatus("Atualize a ponte Supabase para salvar o perfil.", "var(--danger)");
    return;
  }

  const oficinaCordel20 = getSelectedWorkshopValue(controls);
  const usouChatbotIa = getSelectedAiChatbotValue(controls);
  const genero = normalizeProfileGender(controls.gender?.value || "");
  const identificacaoRacial = normalizeProfileRace(controls.race?.value || "");
  const faixaEtaria = normalizeProfileAgeRange(controls.ageRange?.value || "");
  const municipio = parseMunicipioProfileInput(controls);

  if (oficinaCordel20 === null) {
    setStatus("Marque se participa das oficinas Cordel 2.0.", "var(--primary)");
    return;
  }
  if (usouChatbotIa === null) {
    setStatus("Marque se já usou algum chatbot de IA.", "var(--primary)");
    return;
  }
  // Sensíveis (gênero, identificação racial) são OPCIONAIS — nunca bloqueiam o
  // perfil (LGPD; plano-coleta-unificada.md §73). Núcleo = faixa + município.
  if (!faixaEtaria) {
    setStatus("Selecione uma faixa etária.", "var(--primary)");
    return;
  }
  if (!municipio.ok) {
    setStatus(municipio.error, "var(--primary)");
    return;
  }

  if (options.panel) state.dashboardProfileSaving = true;
  else state.profileSaving = true;
  setStatus("Salvando perfil...", "var(--muted)");
  renderProfileCompletionPanel();
  renderPlayerPanel();

  try {
    const response = await withTimeout(
      window.InannaSupabaseBridge.completeParticipantProfile({
        participantId: state.participantId,
        email: state.email,
        oficinaCordel20,
        usouChatbotIa,
        genero,
        identificacaoRacial,
        faixaEtaria,
        municipio: municipio.municipio,
        estado: municipio.estado,
        pais: municipio.pais,
      }),
      15000,
      "O salvamento do perfil demorou demais."
    );

    if (!response?.ok) throw new Error(response?.error || "Nao foi possivel salvar o perfil.");
    applyResolvedCheckinIdentity(response);
    setStatus(options.panel ? "Dados estatísticos atualizados." : "", options.panel ? "var(--accent)" : "var(--muted)");
    setStartHint("");
    updateWelcomeIdentityUI();
    syncDashboardProfileFormFromState(true);
    renderPlayerPanel();
    if (!options.panel && ui.btnStart) ui.btnStart.focus();
  } catch (error) {
    console.error(error);
    setStatus(error?.message || "Nao foi possivel salvar o perfil.", "var(--danger)");
  } finally {
    if (options.panel) state.dashboardProfileSaving = false;
    else state.profileSaving = false;
    renderProfileCompletionPanel();
    updateWelcomeIdentityUI();
    renderPlayerPanel();
  }
}

async function saveParticipantProfile() {
  return saveProfileFromControls(getInitialProfileControls(), { allowCompleted: false, panel: false });
}

async function saveDashboardProfile() {
  return saveProfileFromControls(getDashboardProfileControls(), { allowCompleted: true, panel: true });
}

function clearResolvedCheckinIdentity(nextEmail = "") {
  state.email = String(nextEmail || "").trim();
  state.name = "";
  state.municipio = "";
  state.estadoUF = "";
  state.origem = "";
  state.pais = "BR";
  state.oficinaCordel20 = null;
  state.usouChatbotIa = null;
  state.genero = "";
  state.identificacaoRacial = "";
  state.faixaEtaria = "";
  state.profileComplete = false;
  state.profileSaving = false;
  state.dashboardProfileSaving = false;
  state.dashboardProfileEditOpen = false;
  state.profileFormParticipantId = "";
  state.dashboardProfileFormParticipantId = "";
  state.participantId = "";
  state.checkinUserId = "";
  state.checkinMatchStatus = "";
  state.checkinMatchMethod = "";
  state.teacherGroup = "";
  state.checkinLookupStatus = "idle";
  state.checkinLookupMessage = "";
  state.supabaseSessionReady = false;
  state.supabaseSessionPromise = null;
  state.lastAiFeedback = null;
  state.aiFeedbackRequestKey = "";
  state.playerLevel2Profile = null;
  state.playerLevel2ProfileStatus = "idle";
}

function applyResolvedCheckinIdentity(identity) {
  state.name = String(identity?.name || "").trim();
  state.email = String(identity?.email || state.email || "").trim();
  state.municipio = String(identity?.municipio || "").trim();
  state.estadoUF = normalizeUFOrInternational(identity?.estado || "");
  state.origem = normalizeOrigem(identity?.origem || "");
  state.pais = String(identity?.pais || (state.estadoUF === "EX" ? "FORA_BRASIL" : "BR")).trim() || "BR";
  state.oficinaCordel20 = normalizeBooleanProfileValue(identity?.oficinaCordel20 ?? identity?.oficina_cordel20);
  state.usouChatbotIa = normalizeBooleanProfileValue(identity?.usouChatbotIa ?? identity?.usou_chatbot_ia);
  state.genero = normalizeProfileGender(identity?.genero || "");
  state.identificacaoRacial = normalizeProfileRace(identity?.identificacaoRacial || identity?.identificacao_racial || "");
  state.faixaEtaria = normalizeProfileAgeRange(identity?.faixaEtaria || identity?.faixa_etaria || "") || normalizeLegacyAgeRange(identity?.faixaEtaria || identity?.faixa_etaria || "");
  state.profileComplete = !!(identity?.profileComplete ?? identity?.perfil_completo);
  state.participantId = String(identity?.participantId || "").trim();
  state.checkinUserId = String(identity?.checkinUserId || "").trim();
  state.checkinMatchStatus = String(identity?.status || "matched").trim() || "matched";
  state.checkinMatchMethod = String(identity?.matchMethod || "email").trim() || "email";
  state.teacherGroup = String(identity?.teacherGroup || "").trim();
  state.checkinLookupStatus = "matched";
  state.checkinLookupMessage = "";
  loadPlayerProgress();
  syncLevel2TrackAccess();
  recordIdentityDebugSnapshot("checkin_lookup_matched", {
    participantId: identity?.participantId,
    rebuiltParticipantId: identity?.rebuiltParticipantId,
    checkinUserId: identity?.checkinUserId,
    checkinUserIdSource: identity?.checkinUserIdSource,
    participantIdSource: identity?.participantIdSource,
    email: identity?.email,
    checkinRowNumber: identity?.checkinRowNumber,
  });
}

function renderWelcomeIdentityStatus() {
  const status = String(state.checkinLookupStatus || "idle");

  if (status === "loading") {
    return `
      <div class="start-identity__card">
        <strong>Verificando seu e-mail no check-in...</strong>
        <div class="start-identity__meta">Aguarde um instante antes de começar.</div>
      </div>
    `;
  }

  if (status === "matched") {
    const details = [
      state.municipio ? `Município: ${escapeHtml(state.municipio)}` : "",
      state.estadoUF ? `Estado: ${escapeHtml(state.estadoUF)}` : "",
      state.teacherGroup ? `Turma/oficina: ${escapeHtml(state.teacherGroup)}` : "",
      isAdminEmail() ? "Credencial de administrador ativa" : "",
      state.profileComplete ? "Perfil rápido completo" : "Perfil rápido pendente"
    ].filter(Boolean);

    return `
      <div class="start-identity__card start-identity__card--success">
        <strong>Cadastro confirmado.</strong><br>
        ${escapeHtml(state.name || "Participante")}<br>
        <span class="start-identity__meta">${escapeHtml(state.email)}</span>
        ${details.length ? `<div class="start-identity__meta">${details.join(" · ")}</div>` : ""}
      </div>
    `;
  }

  if (status === "unmatched") {
    return `
      <div class="start-identity__card start-identity__card--warning">
        <strong>E-mail não encontrado.</strong>
        <div class="start-identity__meta">Nesta fase, a jornada só é liberada para e-mails já registrados no check-in.</div>
      </div>
    `;
  }

  if (status === "ambiguous") {
    return `
      <div class="start-identity__card start-identity__card--warning">
        <strong>Cadastro ambíguo.</strong>
        <div class="start-identity__meta">Encontrei mais de um registro com esse e-mail. Vale revisar o check-in antes de seguir.</div>
      </div>
    `;
  }

  if (status === "error") {
    return `
      <div class="start-identity__card start-identity__card--warning">
        <strong>Não consegui validar agora.</strong>
        <div class="start-identity__meta">${escapeHtml(state.checkinLookupMessage || "Tente novamente em instantes.")}</div>
      </div>
    `;
  }

  return `
    <div class="start-identity__card">
      <strong>Digite o e-mail do check-in.</strong>
      <div class="start-identity__meta">Seu nome será preenchido automaticamente quando o cadastro for encontrado.</div>
    </div>
  `;
}

function updateWelcomeIdentityUI() {
  if (ui.welcomeIdentity) {
    ui.welcomeIdentity.innerHTML = renderWelcomeIdentityStatus();
  }

  if (ui.verifyCheckinBtn) {
    ui.verifyCheckinBtn.disabled = state.checkinLookupStatus === "loading" || !isValidEmail(ui.playerEmail?.value || "");
    ui.verifyCheckinBtn.textContent = state.checkinLookupStatus === "loading" ? "Verificando..." : "Verificar e-mail";
  }

  if (ui.btnStart) {
    // Perfil NÃO bloqueia o início (diferido/opcional). Basta o check-in casado.
    ui.btnStart.disabled = !(
      state.checkinLookupStatus === "matched"
      && state.name
      && state.participantId
      && state.checkinUserId
      && !state.profileSaving
    );
  }

  renderProfileCompletionPanel();
}

async function requestCheckinIdentityViaSupabase(email) {
  if (!window.InannaSupabaseBridge?.isConfigured?.()) {
    return { ok: false, status: "error", error: "supabase_not_configured" };
  }

  try {
    return await withTimeout(
      window.InannaSupabaseBridge.lookupParticipantByEmail(email),
      15000,
      "A consulta ao check-in demorou demais."
    );
  } catch (error) {
    console.error(error);
    return { ok: false, status: "error", error: error?.message || "supabase_lookup_error" };
  }
}

function requestJsonp(url, params = {}, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    let script = null;
    let didFinish = false;
    const callbackName = `__inannaFirstAccess_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    function cleanup() {
      didFinish = true;
      if (script?.parentNode) script.parentNode.removeChild(script);
      try {
        delete window[callbackName];
      } catch (_) {
        window[callbackName] = undefined;
      }
    }

    const timer = window.setTimeout(() => {
      if (didFinish) return;
      cleanup();
      reject(new Error("timeout"));
    }, timeoutMs);

    window[callbackName] = (payload) => {
      if (didFinish) return;
      window.clearTimeout(timer);
      cleanup();
      resolve(payload);
    };

    try {
      const requestUrl = new URL(url);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && typeof value !== "undefined" && String(value).trim()) {
          requestUrl.searchParams.set(key, String(value).trim());
        }
      });
      requestUrl.searchParams.set("callback", callbackName);

      script = document.createElement("script");
      script.async = true;
      script.src = requestUrl.toString();
      script.onerror = () => {
        if (didFinish) return;
        window.clearTimeout(timer);
        cleanup();
        reject(new Error("network"));
      };
      document.head.appendChild(script);
    } catch (error) {
      window.clearTimeout(timer);
      cleanup();
      reject(error);
    }
  });
}

function normalizeFirstAccessLookupResponse(payload = {}, fallbackEmail = "") {
  if (!payload?.ok || payload?.status !== "matched") {
    return {
      ok: false,
      status: payload?.status || "error",
      error: payload?.error || "first_access_lookup_error",
    };
  }

  const source = payload.participant || payload.data || payload;
  return {
    ok: true,
    status: "matched",
    participantId: source.participantId || source.id || source.participante_id || "",
    checkinUserId: source.checkinUserId || source.checkin_user_id || source.id || "",
    participantIdSource: source.participantIdSource || "first_access_google_sheet",
    checkinUserIdSource: source.checkinUserIdSource || "first_access_google_sheet",
    matchMethod: source.matchMethod || "first_access_google_sheet",
    name: source.name || source.nome || "Participante",
    email: source.email || fallbackEmail,
    tipoParticipante: source.tipoParticipante || source.tipo_participante || "",
    municipio: source.municipio || "",
    estado: source.estado || "",
    pais: source.pais || "BR",
    origem: source.origem || "google-sheets-users",
    teacherGroup: source.teacherGroup || source.teacher_group || "",
    oficinaCordel20: source.oficinaCordel20 ?? source.oficina_cordel20,
    usouChatbotIa: source.usouChatbotIa ?? source.usou_chatbot_ia,
    genero: source.genero || "",
    identificacaoRacial: source.identificacaoRacial || source.identificacao_racial || "",
    faixaEtaria: source.faixaEtaria || source.faixa_etaria || "",
    profileComplete: !!(source.profileComplete ?? source.perfil_completo),
  };
}

async function requestFirstAccessIdentityViaGoogleSheet(email) {
  if (!INANNA_FIRST_ACCESS_LOOKUP_URL) {
    return { ok: false, status: "error", error: "first_access_lookup_not_configured" };
  }

  try {
    const payload = await requestJsonp(
      INANNA_FIRST_ACCESS_LOOKUP_URL,
      {
        action: "first_access_lookup",
        email,
        token: INANNA_FIRST_ACCESS_LOOKUP_TOKEN,
      },
      18000
    );
    return normalizeFirstAccessLookupResponse(payload, email);
  } catch (error) {
    console.error(error);
    return { ok: false, status: "error", error: error?.message || "first_access_lookup_error" };
  }
}

async function verifyCheckinEmail() {
  const typedEmail = ui.playerEmail?.value.trim() || "";

  if (!isValidEmail(typedEmail)) {
    setStartHint("Digite um e-mail válido para consultar o check-in.", "var(--primary)");
    clearResolvedCheckinIdentity(typedEmail);
    updateWelcomeIdentityUI();
    return;
  }

  clearResolvedCheckinIdentity(typedEmail);
  state.checkinLookupStatus = "loading";
  state.checkinLookupMessage = "";
  setStartHint("");
  updateWelcomeIdentityUI();

  let response = await requestCheckinIdentityViaSupabase(typedEmail);

  if (response?.status === "unmatched" && response?.error === "email_not_found" && INANNA_FIRST_ACCESS_LOOKUP_URL) {
    state.checkinLookupMessage = "Consultando cadastro principal do laboratorio...";
    setStartHint("");
    updateWelcomeIdentityUI();
    response = await requestFirstAccessIdentityViaGoogleSheet(typedEmail);
  }

  if (response?.ok && response?.status === "matched") {
    applyResolvedCheckinIdentity(response);
    updateWelcomeIdentityUI();
    if (needsProfileCompletion()) {
      loadMunicipiosBrasil();
      setStartHint("Complete o perfil rápido para liberar a jornada.", "var(--muted)");
      if (ui.profileWorkshopYes) ui.profileWorkshopYes.focus();
    } else if (ui.btnStart) {
      ui.btnStart.focus();
    }
    return;
  }

  clearResolvedCheckinIdentity(typedEmail);
  state.checkinLookupStatus =
    response?.status === "ambiguous"
      ? "ambiguous"
      : response?.status === "unmatched"
        ? "unmatched"
        : "error";

  const lookupMessageMap = {
    invalid_email: "Digite um e-mail válido para consultar o check-in.",
    ambiguous_email: "Encontrei mais de um cadastro com esse e-mail no check-in.",
    email_not_found: "Este e-mail não está registrado no check-in oficial.",
    first_access_lookup_not_configured: "A consulta do primeiro acesso ainda não foi configurada.",
    first_access_lookup_error: "Não consegui consultar o cadastro principal agora. Tente novamente em instantes.",
    unauthorized: "Consulta do cadastro principal não autorizada.",
    supabase_sync_error: "Encontrei o e-mail na planilha, mas não consegui registrar no Supabase.",
    supabase_not_configured: "Supabase ainda não foi configurado para consultar o check-in.",
    timeout: "A consulta demorou demais. Tente novamente.",
    network: "Não consegui acessar o check-in agora. Tente novamente em instantes."
  };
  state.checkinLookupMessage = lookupMessageMap[response?.error] || String(response?.error || "");
  setStartHint(state.checkinLookupStatus === "error" ? state.checkinLookupMessage : "", "var(--primary)");
  updateWelcomeIdentityUI();
}

function handleStartJourney() {
  state.email = ui.playerEmail?.value.trim() || "";

  if (!isValidEmail(state.email)) {
    setStartHint("Digite um e-mail válido para consultar o check-in.", "var(--primary)");
    updateWelcomeIdentityUI();
    return;
  }

  if (state.checkinLookupStatus !== "matched" || !state.name || !state.participantId || !state.checkinUserId) {
    setStartHint("Verifique um e-mail já registrado no check-in antes de começar.", "var(--primary)");
    updateWelcomeIdentityUI();
    return;
  }

  // Perfil é DIFERIDO e OPCIONAL: não bloqueia o início (analise-inanna.md §12,
  // plano-coleta-unificada.md §4). Se incompleto, convidamos após a 1ª quadra.
  state.deferProfilePrompt = needsProfileCompletion();

  setStartHint("");
  state.playerData = {
    nome: state.name,
    email: state.email,
    tipoAcesso: state.origem || state.teacherGroup || "Oficina Cordel 2.0",
    participantId: state.participantId,
    checkinUserId: state.checkinUserId,
    checkinMatchStatus: state.checkinMatchStatus || "matched",
    checkinMatchMethod: state.checkinMatchMethod || "email",
    teacherGroup: state.teacherGroup,
    municipio: state.municipio,
    estado: state.estadoUF,
    origem: state.origem,
    pais: state.pais,
    oficinaCordel20: state.oficinaCordel20,
    usouChatbotIa: state.usouChatbotIa,
    genero: state.genero,
    identificacaoRacial: state.identificacaoRacial,
    faixaEtaria: state.faixaEtaria,
    profileComplete: state.profileComplete
  };
  showTrackChooser();
}

function resetSextilhaState() {
  state.userDashboard = null;
  state.userTexts = [];
  state.activeTextId = "";
  state.activeText = null;
  state.activeTextVersions = [];
  state.versionCompareSelection = [];
  state.draftVersionSource = null;
  state.lastAiFeedback = null;
  state.aiFeedbackRequestKey = "";
  state.sextilhaStoreStatus = "idle";
  state.mutedVerseWarningIndexes = Array.from({ length: 6 }, () => false);
  renderEditorAiFeedback(null);
}

function returnToIdentityStep() {
  resetSextilhaState();
  state.selectedTrack = "";
  setView("identity");
  goToPhase(0);
}

function showTrackChooser() {
  state.selectedTrack = "";
  resetSextilhaState();
  hideGameExperience();
  setView("chooser", ui.trackChooserSection);
  loadPlayerProgress();
  syncSextilhaTrackAccess();
  syncLevel2TrackAccess();
  window.scrollTo({ top: 0, behavior: "smooth" });
  prewarmSupabaseSextilhaSession();
}

function startGameTrack() {
  state.selectedTrack = "game";
  setView("game");
  resetQuadraState({ resetPoints: true, restartTimer: false });
  buildThemeGrid();
  goToPhase(1);
}

function stopGameSessionAndReturnToMenu() {
  const confirmed = window.confirm("Parar a sessao atual de quadras e voltar ao menu principal?");
  if (!confirmed) return;

  state.chosenTheme = null;
  state.scheme = "Livre";

  if (ui.selectedThemeName) ui.selectedThemeName.textContent = "—";
  if (ui.verseInput) {
    ui.verseInput.value = "";
    ui.verseInput.placeholder = "Ex.: No São João eu vi a fogueira";
  }
  if (ui.modeChallenge) {
    ui.modeChallenge.checked = true;
    syncModes();
  }
  if (ui.rulesModal?.open) ui.rulesModal.close();
  if (ui.placarModal?.open) ui.placarModal.close();

  resetQuadraState({ resetPoints: true, restartTimer: false });
  setExplain("");
  buildThemeGrid();
  showTrackChooser();
}

function getSextilhaDraft() {
  const baselineStatus = state.draftVersionSource?.status || state.activeText?.status || "rascunho";
  return {
    title: ui.editorTitleInput?.value.trim() || "",
    theme: ui.editorThemeInput?.value.trim() || "",
    note: ui.editorNoteInput?.value.trim() || "",
    verses: getSextilhaVerseInputs().map((input) => input?.value.trim() || ""),
    status: normalizeStatusValue(baselineStatus),
    sharedWithEducator: !!ui.editorSharedWithEducator?.checked,
  };
}

function normalizeComparableDraftText(value) {
  return String(value || "").trim();
}

function buildComparableSextilhaDraftSnapshot(source) {
  if (!source) return null;

  const verses = Array.isArray(source.verses) ? source.verses : [];
  return {
    title: normalizeComparableDraftText(source.title),
    theme: normalizeComparableDraftText(source.theme),
    note: normalizeComparableDraftText(source.note),
    verses: Array.from({ length: 6 }, (_, index) => normalizeComparableDraftText(verses[index])),
    status: normalizeStatusValue(source.status || "rascunho"),
    sharedWithEducator: !!source.sharedWithEducator,
  };
}

function buildComparableSextilhaDraftFingerprint(source) {
  const snapshot = buildComparableSextilhaDraftSnapshot(source);
  return snapshot ? JSON.stringify(snapshot) : "";
}

function getEditorBaselineVersion() {
  return state.draftVersionSource || state.activeText?.latestVersion || state.activeText || null;
}

function buildSextilhaVersionLabel(versionLike) {
  const versionNumber = Number(versionLike?.versionNumber || versionLike?.versionCount || 0);
  return versionNumber ? `Versão ${versionNumber}` : "Rascunho atual";
}

function describeSextilhaBaselineVersion(versionLike) {
  const versionNumber = Number(versionLike?.versionNumber || versionLike?.versionCount || 0);
  return versionNumber ? `a Versão ${versionNumber}` : "este rascunho";
}

function buildAiFeedbackRequestPayload(text, version) {
  const versionSnapshot = version || text?.latestVersion || null;
  const verses = Array.isArray(versionSnapshot?.verses)
    ? versionSnapshot.verses
    : Array.isArray(text?.verses)
      ? text.verses
      : [];
  const versionNumber = Number(versionSnapshot?.versionNumber || text?.versionCount || 0);
  const title = versionSnapshot?.title || text?.title || "";
  const theme = versionSnapshot?.theme || text?.theme || "";
  const note = versionSnapshot?.note || text?.note || "";
  const sharedWithEducator = versionSnapshot?.sharedWithEducator ?? text?.sharedWithEducator ?? false;
  const status = versionSnapshot?.status || text?.status || "rascunho";

  return {
    textId: text?.textId || versionSnapshot?.textId || "",
    versionId: versionSnapshot?.versionId || "",
    versionNumber,
    title,
    theme,
    note,
    verses,
    status,
    sharedWithEducator,
    indicators: versionSnapshot?.indicators || buildLiveSextilhaIndicators({
      draft: {
        title,
        theme,
        note,
        verses,
        status,
        sharedWithEducator,
      },
      revisionCount: versionNumber,
    }),
    sourceStore: getConfiguredSextilhaDataSource(),
  };
}

function formatTextUpdatedLabel(text) {
  return text?.updatedAt ? formatDateTime(text.updatedAt) : "Ainda sem edições";
}

function setEditorFeedback(message, tone = "muted", options = {}) {
  if (!ui.editorSaveMessage) return;
  ui.editorSaveMessage.textContent = message || "";
  ui.editorSaveMessage.style.color =
    tone === "success" ? "var(--accent)" :
      tone === "error" ? "var(--danger)" :
        "var(--muted)";
  if (message && (options.toast ?? (tone !== "muted"))) {
    showToast(message, tone, options);
  }
}

function setEditorLockNotice(message, tone = "muted") {
  if (!ui.editorLockNotice) return;
  ui.editorLockNotice.textContent = message || "";
  ui.editorLockNotice.style.color =
    tone === "success" ? "var(--accent)" :
      tone === "error" ? "var(--danger)" :
        "var(--muted)";
}

function sanitizeSocialFileName(value) {
  return String(value || "sextilha-inanna")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "sextilha-inanna";
}

function buildSocialPostcardData(text = state.activeText, version = null) {
  const sourceVersion = version || text?.latestVersion || state.activeText?.latestVersion || null;
  const verses = Array.isArray(sourceVersion?.verses) ? sourceVersion.verses.map((item) => String(item || "").trim()).slice(0, 6) : [];

  return {
    textId: text?.textId || state.activeTextId || "",
    versionId: sourceVersion?.versionId || "",
    folhetoId: String(text?.folhetoId || "").trim(),
    folhetoTitle: String(text?.folhetoTitle || state.activeFolheto?.title || "").trim(),
    title: String(sourceVersion?.title || text?.title || "Sextilha sem título").trim() || "Sextilha sem título",
    theme: String(sourceVersion?.theme || text?.theme || "Tema livre").trim() || "Tema livre",
    authorName: String(state.name || state.email || "Estudante").trim() || "Estudante",
    verses,
  };
}

function hydrateSocialPostcard(postcardData) {
  if (!ui.socialPostcard) return;
  if (ui.socialPostcardTitle) ui.socialPostcardTitle.textContent = postcardData.title;
  if (ui.socialPostcardTheme) {
    ui.socialPostcardTheme.textContent = postcardData.folhetoTitle
      ? `Folheto: ${postcardData.folhetoTitle} · Tema: ${postcardData.theme || "Tema livre"}`
      : postcardData.theme || "Tema livre";
  }
  if (ui.socialPostcardAuthor) ui.socialPostcardAuthor.textContent = `Por ${postcardData.authorName}`;
  if (ui.socialPostcardVerses) {
    ui.socialPostcardVerses.textContent = postcardData.verses.filter(Boolean).join("\n") || "Sua sextilha aparecerá aqui.";
  }
}

async function captureSocialPostcardImage(postcardData) {
  if (typeof window.html2canvas !== "function" || !ui.socialPostcard) {
    throw new Error("A captura do cartão-postal ainda não está disponível.");
  }

  hydrateSocialPostcard(postcardData);
  await new Promise((resolve) => window.requestAnimationFrame(resolve));

  const canvas = await window.html2canvas(ui.socialPostcard, {
    backgroundColor: null,
    scale: 1.25,
    useCORS: true,
    logging: false,
  });
  const dataUrl = canvas.toDataURL("image/jpeg", 0.84);
  return {
    dataUrl,
    base64: String(dataUrl.split(",")[1] || ""),
    mimeType: "image/jpeg",
  };
}

async function sendSocialPostcardEmail(postcardData) {
  if (!state.email) {
    throw new Error("Seu e-mail de check-in não foi encontrado para receber o cartão-postal.");
  }

  if (!INANNA_SOCIAL_EMAIL_ENABLED) {
    return { status: "disabled" };
  }

  await captureSocialPostcardImage(postcardData);
  throw new Error("O envio de cartão por e-mail precisa de uma função serverless fora do frontend.");
}

function getFriendlySocialDeliveryErrorMessage(error) {
  const rawMessage = String(error?.message || "").trim();
  if (!rawMessage) {
    return "A sextilha foi finalizada, mas o cartão-postal não conseguiu seguir por e-mail.";
  }

  if (/funcao serverless|serverless fora do frontend/i.test(rawMessage)) {
    return "A sextilha foi finalizada, mas o envio por e-mail ainda precisa de uma função serverless.";
  }

  if (/imagem do cartao postal nao chegou/i.test(rawMessage)) {
    return "O cartão-postal foi preparado, mas a imagem não chegou corretamente ao serviço de e-mail.";
  }

  if (/captura do cartao postal/i.test(rawMessage)) {
    return "O cartão-postal não conseguiu ser renderizado no navegador.";
  }

  return rawMessage;
}

function isTextConcluded(textLike) {
  return normalizeStatusValue(textLike?.status || "") === "concluida";
}

function isEditorLocked(text = state.activeText) {
  return isTextConcluded(text);
}

function getNextDraftStatus(saveMode, sharedWithEducator) {
  if (saveMode === "finalize") return "concluida";
  return sharedWithEducator ? "compartilhada com educador" : "rascunho";
}

function applyEditorLockState(locked, text = state.activeText) {
  const nextLocked = !!locked;
  const inputs = [
    ui.editorTitleInput,
    ui.editorThemeInput,
    ui.editorNoteInput,
    ...getSextilhaVerseInputs(),
  ].filter(Boolean);

  inputs.forEach((input) => {
    input.readOnly = nextLocked;
  });

  if (ui.editorSharedWithEducator) {
    ui.editorSharedWithEducator.disabled = nextLocked;
  }

  if (ui.btnSaveTextVersion) {
    ui.btnSaveTextVersion.disabled = nextLocked;
  }

  if (ui.btnFinalizeText) {
    ui.btnFinalizeText.disabled = nextLocked;
    ui.btnFinalizeText.hidden = nextLocked;
  }

  if (ui.btnResendSocialEmail) {
    ui.btnResendSocialEmail.hidden = !nextLocked;
    ui.btnResendSocialEmail.disabled = !nextLocked;
  }

  if (ui.btnRequestReopen) {
    const reopenRequested = !!text?.reopenRequested;
    ui.btnRequestReopen.hidden = !nextLocked;
    ui.btnRequestReopen.disabled = !nextLocked || reopenRequested;
    ui.btnRequestReopen.textContent = reopenRequested ? "Reabertura solicitada" : "Solicitar reabertura";
  }

  getSextilhaVerseFields().forEach((field) => {
    field.classList.toggle("verse-field--locked", nextLocked);
  });

  if (!nextLocked) {
    setEditorLockNotice("");
    return;
  }

  if (text?.reopenRequested) {
    setEditorLockNotice("Texto finalizado e pedido de reabertura registrado para avaliação futura do educador.", "success");
    return;
  }

  setEditorLockNotice("Texto finalizado. Agora ele fica bloqueado e só pode ser reaberto com avaliação futura do educador.");
}

function normalizeWordEnding(value) {
  return normalizeVerseAnalysisText(value);
}

function getVerseLastWord(value) {
  const tokens = normalizeWordEnding(value).split(/\s+/).filter(Boolean);
  return tokens[tokens.length - 1] || "";
}

function evaluateABCBDBRhyme(verses = []) {
  const targetWords = SEXTILHA_RHYME_VERSE_INDEXES
    .map((index) => getVerseLastWord(verses[index] || ""))
    .filter(Boolean);

  if (!targetWords.length) {
    return { matched: false, complete: false, partialMatch: false, suffix: "", words: targetWords };
  }

  const candidateSizes = [4, 3, 2];
  let sharedSuffix = "";
  for (const size of candidateSizes) {
    const suffixes = targetWords.map((word) => (word.length >= size ? word.slice(-size) : ""));
    if (suffixes.every(Boolean) && suffixes.every((suffix) => suffix === suffixes[0])) {
      sharedSuffix = suffixes[0];
      break;
    }
  }

  const complete = targetWords.length === SEXTILHA_RHYME_VERSE_INDEXES.length;
  return {
    matched: complete && !!sharedSuffix,
    complete,
    partialMatch: !complete && targetWords.length >= 2 && !!sharedSuffix,
    suffix: sharedSuffix,
    words: targetWords,
  };
}

function countGrammaticalSyllableGroups(value) {
  const matches = normalizeVerseForSyllableCount(value).match(/[aeiouáéíóúàâêôãõü]+/ig);
  return matches ? matches.length : 0;
}

function isVerseWarningMuted(index) {
  return !!state.mutedVerseWarningIndexes[index];
}

function toggleVerseWarningMuted(index) {
  if (index < 0 || index >= state.mutedVerseWarningIndexes.length) return;
  const currentVerse = getSextilhaDraft().verses[index] || "";
  if (countGrammaticalSyllableGroups(currentVerse) <= SEXTILHA_GRAMMATICAL_SYLLABLE_WARNING_LIMIT) {
    state.mutedVerseWarningIndexes[index] = false;
    updateSextilhaIndicators();
    return;
  }
  state.mutedVerseWarningIndexes[index] = !state.mutedVerseWarningIndexes[index];
  updateSextilhaIndicators();
}

function applyVerseMeterFeedback(verses = []) {
  const meterButtons = getSextilhaVerseMeterButtons();

  meterButtons.forEach((button, index) => {
    const label = button.querySelector(".verse-meter__label");
    const fill = button.querySelector(".verse-meter__fill");
    const count = countGrammaticalSyllableGroups(verses[index] || "");
    const isWarning = count > SEXTILHA_GRAMMATICAL_SYLLABLE_WARNING_LIMIT;
    const muted = isWarning && isVerseWarningMuted(index);
    const progressRatio = clamp(count / SEXTILHA_GRAMMATICAL_SYLLABLE_WARNING_LIMIT, 0, 1.18);

    if (fill) {
      fill.style.width = `${Math.min(progressRatio, 1) * 100}%`;
    }

    button.classList.toggle("verse-meter--warning", isWarning && !muted);
    button.classList.toggle("verse-meter--muted", muted);
    button.setAttribute("aria-pressed", muted ? "true" : "false");
    button.title = muted
      ? "Clique para reativar este aviso."
      : isWarning
        ? "Clique para desligar este aviso se você discordar da máquina."
        : "A barra acompanha a contagem aproximada de sílabas gramaticais.";

    if (label) {
      if (!count) {
        label.textContent = "0 grupos vocálicos";
      } else if (muted) {
        label.textContent = `${count} grupos vocálicos · aviso desligado`;
      } else if (isWarning) {
        label.textContent = `Opa, verso longo! (${count} grupos)`;
      } else {
        label.textContent = `${count} grupos vocálicos`;
      }
    }
  });
}

function applyRhymeBadgeFeedback(verses = []) {
  const badges = getSextilhaRhymeBadges();
  const rhyme = evaluateABCBDBRhyme(verses);
  const shouldHighlight = rhyme.matched && rhyme.words.length === SEXTILHA_RHYME_VERSE_INDEXES.length;

  badges.forEach((badge) => {
    badge.classList.toggle("verse-rhyme-badge--active", shouldHighlight);
    badge.classList.toggle("verse-rhyme-badge--pending", !shouldHighlight);
    badge.title = shouldHighlight
      ? `Esquema ABCBDB alinhado. A rima B fechou com a terminação "${rhyme.suffix}".`
      : "No esquema ABCBDB, os versos 2, 4 e 6 devem fechar a mesma rima B.";
  });
}

function focusNextVerseInput(currentIndex) {
  const inputs = getSextilhaVerseInputs();
  const nextInput = inputs[currentIndex + 1];
  if (nextInput) {
    nextInput.focus();
    return;
  }

  if (!ui.btnSaveTextVersion?.disabled) {
    ui.btnSaveTextVersion?.focus();
    return;
  }

  ui.btnFinalizeText?.focus();
}

function slugStatus(status) {
  return normalizeStatusValue(status).replace(/[^a-z0-9]+/g, "-");
}

function renderIndicatorChips(indicators = {}) {
  const items = [
    indicators.completude,
    indicators.fechamento,
    indicators.rimaStatus,
    indicators.coerenciaTematica,
    indicators.repeticaoLexical,
    indicators.maturacao,
  ].filter(Boolean);

  if (!items.length) {
    return `<span class="indicator-chip">Texto iniciando</span>`;
  }

  return items.map((item) => `<span class="indicator-chip">${escapeHtml(item)}</span>`).join("");
}

function normalizeSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripTrailingVersePunctuation(value) {
  return String(value || "").replace(/[\p{P}\p{S}]+$/gu, "").trim();
}

function cleanFinalWordToken(value) {
  return String(value || "")
    .replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ-]+$/g, "")
    .trim();
}

function parseVerseStem(rawValue) {
  const raw = normalizeSpaces(rawValue);
  if (!raw) {
    return { ok: false, error: "✋ Escreva o verso completo antes de continuar." };
  }

  const blanks = raw.match(/___/g) || [];
  if (blanks.length > 0) {
    return { ok: false, error: "Escreva o verso completo, sem lacuna. A Inanna analisará a última palavra." };
  }

  const tokens = raw.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) {
    return { ok: false, error: "Escreva ao menos duas palavras para a Inanna comparar o fim do verso." };
  }

  const finalWord = cleanFinalWordToken(tokens[tokens.length - 1]);
  const stem = stripTrailingVersePunctuation(tokens.slice(0, -1).join(" "));
  if (!stem || !normWord(finalWord)) {
    return { ok: false, error: "A última palavra precisa ser uma palavra legível para entrar na rima." };
  }

  return { ok: true, stem, finalWord, originalVerse: raw };
}

function buildRawVerse(stem) {
  return `${normalizeSpaces(stem)} ___`;
}

function updateVerseBlankPreview() {
  if (!ui.verseBlankPreview) return;

  const parsed = parseVerseStem(ui.verseInput.value || "");
  if (!parsed.ok) {
    ui.verseBlankPreview.innerHTML = `
      <span class="preview-muted">Seu verso será analisado assim:</span>
      <span class="preview-stem">...</span>
    `;
    return;
  }

  ui.verseBlankPreview.innerHTML = `
    <span class="preview-muted">Última palavra em disputa:</span>
    <span class="preview-stem">${escapeHtml(parsed.stem)}</span>
    <span class="blank-placeholder fixed">${escapeHtml(parsed.finalWord)}</span>
  `;
}

function updateRoundStatus() {
  const currentVerse = Math.min(4, state.lines.length + 1);
  const remaining = Math.max(0, 4 - state.lines.length);
  const schemeText = state.scheme || "Livre";

  if (ui.step2Progress) {
    if (state.lines.length >= 4) {
      ui.step2Progress.textContent = "Quadra concluída. Escolha se quer começar uma nova quadra ou um novo poema.";
    } else {
      ui.step2Progress.textContent = `Verso ${currentVerse} de 4. Faltam ${remaining} versos para fechar a quadra em ${schemeText}.`;
    }
  }

  if (ui.step3Progress) {
    ui.step3Progress.textContent = `Agora escolha a palavra final do verso ${currentVerse} de 4.`;
  }

  if (ui.currentLine) {
    ui.currentLine.textContent = `Verso ${currentVerse} de 4`;
  }
}

function refreshSuggestedScheme() {
  const schemes = ["AABB", "ABAB", "ABBA"];
  state.scheme = schemes[Math.floor(Math.random() * schemes.length)];
  const schemeSpan = document.getElementById("suggestedScheme");
  if (schemeSpan) schemeSpan.textContent = state.scheme;
}

function resetQuadraState(options) {
  const settings = Object.assign({ resetPoints: true, restartTimer: false }, options);

  state.lines = [];
  state.current = { rawVerse: "", originalVerse: "", originalToken: "", pred: null };
  state.rhyme = null;
  state.scoreBreakdown = null;

  if (settings.resetPoints) {
    state.points = 0;
    ui.points.textContent = "0";
  }

  if (ui.vectorModal && ui.vectorModal.open) {
    ui.vectorModal.close();
  }
  if (ui.pedagogyModal && ui.pedagogyModal.open) {
    ui.pedagogyModal.close();
  }

  resetWritingTimer({ autostart: settings.restartTimer });
  ui.verseInput.value = "";
  ui.customInput.value = "";
  ui.quadra.textContent = "";
  ui.history.innerHTML = "";
  ui.poemSection.classList.remove("visible");
  ui.submitResponse.style.display = "none";
  ui.submitResponse.textContent = "";
  ui.submitResponse.style.color = "var(--text)";
  ui.btnSubmitPoem.disabled = false;
  ui.btnSubmitPoem.textContent = "🚀 Enviar Quadra";

  const feedbackEl = document.getElementById("rhymeFeedback");
  if (feedbackEl) feedbackEl.innerHTML = "";

  setExplain("");
  updateVerseBlankPreview();
  updateRoundStatus();
}

function formatVectorArray(values) {
  return `[${(values || []).map((value) => Number(value || 0).toFixed(2)).join(", ")}]`;
}

function buildWeightedEquation(detail) {
  if (!detail || !Array.isArray(detail.dimensions)) return "—";
  const terms = detail.dimensions.map((dimension) => `${dimension.score.toFixed(2)}×${dimension.weight.toFixed(2)}`);
  return `${terms.join(" + ")} = ${detail.totalScore.toFixed(2)}`;
}

function getSortedPredictionDetails(pred) {
  if (!pred || !Array.isArray(pred.details)) return [];
  return [...pred.details].sort((a, b) => {
    if (b.probability !== a.probability) return b.probability - a.probability;
    return b.totalScore - a.totalScore;
  });
}

function buildStochasticSummary(pred, focusDetail) {
  const sortedDetails = getSortedPredictionDetails(pred);
  if (sortedDetails.length < 2) {
    return "A distribuição estocástica aparece quando o sistema compara várias palavras e distribui chances entre elas.";
  }

  const first = sortedDetails[0];
  const second = sortedDetails[1];
  const gap = Math.abs(first.probability - second.probability);

  if (focusDetail && focusDetail.normalized === first.normalized) {
    return gap < 0.05
      ? `Esta palavra lidera por pouco. A estocástica fica visível porque a segunda opção quase empata na soma dos pesos.`
      : `Esta palavra lidera com folga. A soma ponderada dela ficou mais forte do que a das outras candidatas nesta rodada.`;
  }

  return gap < 0.05
    ? `As duas primeiras candidatas estão quase empatadas. Isso mostra que a IA não “sabe” uma única resposta: ela distribui chances entre opções próximas.`
    : `A melhor candidata abriu vantagem, mas as outras continuam no campo do possível. Probabilidade é graduação de chance, não certeza absoluta.`;
}

function renderStochasticList(container, pred, highlightedWord) {
  if (!container) return;
  container.innerHTML = "";

  const sortedDetails = getSortedPredictionDetails(pred);
  if (!sortedDetails.length) {
    container.innerHTML = `<p class="vector-card-note">As distribuições aparecem quando há uma predição ativa.</p>`;
    return;
  }

  sortedDetails.forEach((detail, index) => {
    const item = document.createElement("article");
    item.className = "stochastic-item";
    if (highlightedWord && detail.normalized === highlightedWord) {
      item.classList.add("is-highlighted");
    }

    item.innerHTML = `
      <div class="stochastic-item-head">
        <strong>${index + 1}. ${escapeHtml(detail.word)}</strong>
        <span>${formatPct(detail.probability)}</span>
      </div>
      <div class="stochastic-bar">
        <span class="stochastic-fill" style="width:${Math.max(8, Math.round(detail.probability * 100))}%"></span>
      </div>
      <div class="stochastic-item-meta">
        <span>Soma ${detail.totalScore.toFixed(2)}</span>
        <span>Vetor ${formatVectorArray(detail.dimensions.map((dimension) => dimension.score))}</span>
      </div>
    `;

    container.appendChild(item);
  });
}

function refreshPedagogyModalContent() {
  const pred = state.current.pred;
  if (!ui.pedagogyLiveDistribution) return;

  const context = pred && pred.contextSummary
    ? `No verso "${pred.contextSummary.beforeBlank} ___", a pista dominante desta rodada foi "${pred.contextSummary.expectationLabel}". Depois da soma dos vetores, a IA distribuiu as chances assim:`
    : "A IA não guarda uma única resposta pronta. Ela distribui chances entre palavras próximas e escolhe a que fica mais forte naquele contexto.";

  ui.pedagogyLiveDistribution.textContent = context;
  renderStochasticList(ui.pedagogyLiveList, pred, null);
}

function openPedagogyModal() {
  if (!ui.pedagogyModal) return;
  if (ui.vectorModal && ui.vectorModal.open) {
    ui.vectorModal.close();
  }
  refreshPedagogyModalContent();
  if (ui.pedagogyModal.open) return;
  ui.pedagogyModal.showModal();
}

function openVectorModal(index) {
  const detail = state.current.pred && state.current.pred.details ? state.current.pred.details[index] : null;
  if (!detail || !ui.vectorModal) return;

  ui.vectorWordTitle.textContent = detail.word;
  ui.vectorProbability.textContent = formatPct(detail.probability);

  const strongest = detail.dimensions.reduce((best, current) => current.contribution > best.contribution ? current : best, detail.dimensions[0]);
  const weakest = detail.dimensions.reduce((best, current) => current.contribution < best.contribution ? current : best, detail.dimensions[0]);

  ui.vectorSummary.textContent =
    `Maior força: ${strongest.label} (${strongest.contribution.toFixed(2)}). ` +
    `Menor força: ${weakest.label} (${weakest.contribution.toFixed(2)}). ` +
    `A soma ponderada foi ${detail.totalScore.toFixed(2)} e depois foi normalizada entre as candidatas para gerar a probabilidade final.`;

  if (ui.vectorContextStory) {
    const context = state.current.pred && state.current.pred.contextSummary ? state.current.pred.contextSummary : null;
    const beforeBlank = context && context.beforeBlank ? context.beforeBlank : "verso em montagem";
    const expectationLabel = context && context.expectationLabel ? context.expectationLabel : "pista de contexto";
    ui.vectorContextStory.textContent =
      `Pergunta atual: "${beforeBlank} ___". A palavra "${detail.word}" vira um vetor pedagógico de 5 números. Nesta rodada, a pista mais forte do contexto foi "${expectationLabel}", e depois a IA comparou essa palavra com as outras candidatas.`;
  }

  if (ui.vectorWordArray) {
    ui.vectorWordArray.textContent = formatVectorArray(detail.dimensions.map((dimension) => dimension.score));
  }

  if (ui.vectorWeightsArray) {
    ui.vectorWeightsArray.textContent = formatVectorArray(detail.dimensions.map((dimension) => dimension.weight));
  }

  if (ui.vectorContributionArray) {
    ui.vectorContributionArray.textContent = formatVectorArray(detail.dimensions.map((dimension) => dimension.contribution));
  }

  if (ui.vectorEquation) {
    ui.vectorEquation.textContent = buildWeightedEquation(detail);
  }

  ui.vectorDimensions.innerHTML = "";
  detail.dimensions.forEach((dimension) => {
    const item = document.createElement("article");
    item.className = "vector-dimension";
    item.innerHTML = `
      <div class="vector-dimension-head">
        <strong>${escapeHtml(dimension.label)}</strong>
        <span>Peso ${dimension.weight.toFixed(2)}</span>
      </div>
      <div class="vector-dimension-bar">
        <span class="vector-dimension-fill" style="width:${Math.max(8, Math.round(dimension.score * 100))}%"></span>
      </div>
      <div class="vector-dimension-meta">
        <span>Nota ${dimension.score.toFixed(2)}</span>
        <span>Contribuição ${dimension.contribution.toFixed(2)}</span>
      </div>
      <p class="vector-dimension-reason">${escapeHtml(dimension.reason)}</p>
    `;
    ui.vectorDimensions.appendChild(item);
  });

  if (ui.stochasticSummary) {
    ui.stochasticSummary.textContent = buildStochasticSummary(state.current.pred, detail);
  }
  renderStochasticList(ui.stochasticList, state.current.pred, detail.normalized);
  refreshPedagogyModalContent();

  ui.vectorModal.showModal();
}

// ── Etapa 1 — montar grade de temas ──────────────────────────────────
function getThemeGridItems() {
  return THEMES;
}

function buildThemeGrid() {
  if (!ui.themeGrid) return;
  ui.themeGrid.innerHTML = "";
  const themes = getThemeGridItems();
  themes.forEach(th => {
    const card = document.createElement("button");
    card.className = "theme-card";
    card.type = "button";
    if (th.context) card.title = th.context;
    card.innerHTML = `
      <div class="theme-emoji">${th.emoji}</div>
      <div class="theme-name">${th.name}</div>
      <div class="theme-desc">${th.desc}</div>
      ${th.source ? `<div class="theme-source">fonte</div>` : ""}
    `;
    card.addEventListener("click", () => selectTheme(th));
    ui.themeGrid.appendChild(card);
  });
}

function selectTheme(theme) {
  state.chosenTheme = theme;
  ui.selectedThemeName.textContent = `${theme.emoji} ${theme.name}`;
  refreshSuggestedScheme();
  resetQuadraState({ resetPoints: true, restartTimer: true });

  ui.verseInput.placeholder = "Ex.: No São João eu vi a fogueira";
  if (theme.context && ui.verseHint) {
    ui.verseHint.textContent = theme.context;
    ui.verseHint.style.color = "var(--muted)";
  }
  updateVerseBlankPreview();

  goToPhase(2);
}

// ── Etapa 2 — entrada do verso completo ──────────────────────────────
function onAnalyze() {
  const parsed = parseVerseStem(ui.verseInput.value || "");
  if (!parsed.ok) {
    ui.verseHint.textContent = parsed.error;
    ui.verseHint.style.color = "#f97316";
    return;
  }

  ui.verseInput.value = parsed.originalVerse;
  ui.verseHint.textContent = `A Inanna vai sugerir alternativas para "${parsed.finalWord}". Manter sua palavra pode render bônus se a rima fechar.`;
  ui.verseHint.style.color = "var(--muted)";
  updateVerseBlankPreview();

  const raw = buildRawVerse(parsed.stem);
  state.current.rawVerse = raw;
  state.current.originalVerse = parsed.originalVerse;
  state.current.originalToken = parsed.finalWord;
  state.current.pred = (typeof buildPredictionsV2 === "function")
    ? buildPredictionsV2(raw, state.chosenTheme, state.lines, state.scheme)
    : buildPredictions(raw, state.chosenTheme);
  renderStep3();
  goToPhase(3);
}

// ── Construção das previsões ──────────────────────────────────────────
function buildPredictions(verse, theme) {
  // Concatena as categorias para formar o pool deste tema
  let pool = [];
  if (theme.tokens) {
    if (Array.isArray(theme.tokens)) {
      pool = [...theme.tokens];
    } else {
      pool = Object.values(theme.tokens).flat();
    }
  }

  // Contexto antes da palavra final em disputa.
  const before = norm(verse.split("___")[0]);

  // Heurística: fim com artigo
  const endsCue = /\b(um|uma|o|a|meu|minha|seu|sua|no|na|numa|num|pra|pro)\s*$/.test(before);

  const soft = ["cuidado", "carinho", "atenção", "presença", "ternura", "calma", "respeito", "memória"];

  let candidates = [];

  // 3 do tema escolhido
  while (candidates.length < 3 && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    candidates.push(pool.splice(idx, 1)[0]);
  }

  // 1 "suave" (conexão com a homenagem)
  if (endsCue || Math.random() < 0.4) {
    const pick = soft[Math.floor(Math.random() * soft.length)];
    if (!candidates.includes(pick)) candidates.push(pick);
  }

  // completar se precisar
  while (candidates.length < 4) {
    const pick = FALLBACK_TOKENS[Math.floor(Math.random() * FALLBACK_TOKENS.length)];
    if (!candidates.includes(pick)) candidates.push(pick);
  }

  // Probabilidades
  const base = 0.70;
  let weights = candidates.map((_, i) => {
    const jitter = (Math.random() * 0.22) - 0.11;
    const bias = (3 - i) * 0.09;
    return Math.max(0.05, base + bias + jitter);
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  const probs = weights.map(w => w / sum);
  const sorted = [...probs].sort((a, b) => b - a);
  const confidence = clamp(0.25 + (sorted[0] - sorted[3]) * 1.8, 0.12, 0.96);

  return { candidates, probs, confidence };
}

// ── Etapa 3 — renderizar previsões ───────────────────────────────────
function renderStep3() {
  const { rawVerse, pred } = state.current;
  const theme = state.chosenTheme;

  // Preview do verso com a palavra final em disputa.
  const highlighted = escapeHtml(rawVerse).replace("___", `<span class="blank-placeholder">___</span>`);
  ui.versePreview.innerHTML = highlighted;
  const rhymeHint = pred && pred.targetRhymeWord ? ` · rima esperada com "${pred.targetRhymeWord}"` : "";
  const contextHint = theme.context ? ` · ${theme.context.slice(0, 120)}${theme.context.length > 120 ? "..." : ""}` : "";
  ui.contextDetected.textContent = `${theme.emoji} ${theme.name}${rhymeHint}${contextHint}`;
  if (ui.customInput) {
    ui.customInput.value = state.current.originalToken || "";
    ui.customInput.placeholder = state.current.originalToken
      ? "Mantenha sua palavra ou digite outra..."
      : "Digite apenas uma palavra...";
  }
  updateRoundStatus();

  // Lista de candidatos
  ui.predList.innerHTML = "";
  pred.candidates.forEach((tok, i) => {
    const p = pred.probs[i];

    const option = document.createElement("div");
    option.className = "predOption";
    option.innerHTML = `
      <button class="predBtn" type="button">
        <span class="pred-token">${escapeHtml(tok)}</span>
        <span class="pred-pct">${formatPct(p)}</span>
      </button>
      <button class="vectorBtn" type="button">Ver vetor</button>
    `;

    const chooseBtn = option.querySelector(".predBtn");
    const vectorBtn = option.querySelector(".vectorBtn");
    chooseBtn.addEventListener("click", () => chooseToken(tok, i, "ia"));
    vectorBtn.addEventListener("click", () => openVectorModal(i));
    ui.predList.appendChild(option);
  });

  // Explicação
  setExplain(
    `As probabilidades aparecem na lista principal. Você pode aceitar uma sugestão ou manter "${state.current.originalToken || "sua palavra"}" como escolha humana.`
  );
  refreshPedagogyModalContent();
}

// ── Escolha do token ──────────────────────────────────────────────────
function chooseToken(token, index, source) {
  const { rawVerse, pred } = state.current;
  const completed = rawVerse.replace("___", token);
  const p = pred ? pred.probs[index] : null;
  const detail = pred && pred.details && index >= 0 ? pred.details[index] : null;
  const wasSuggested = pred && Array.isArray(pred.candidates)
    ? pred.candidates.some((candidate) => normWord(candidate) === normWord(token))
    : false;

  state.lines.push({
    verse: completed,
    token,
    source,       // "ia" | "custom"
    pct: p ? formatPct(p) : "—",
    themeName: state.chosenTheme.name,
    vector: detail ? detail.dimensions : null,
    creative: source === "custom" && !wasSuggested,
  });

  if (ui.vectorModal && ui.vectorModal.open) {
    ui.vectorModal.close();
  }

  if (source === "ia") {
    setExplain(
      `✅ Você escolheu "${token}" (${formatPct(p)}).`
    );
  } else if (source === "custom") {
    setExplain(
      `✍️ Você inventou "${token}". A palavra entrou como escolha humana fora do ranking sugerido.`
    );
  }

  updatePoem();
  updateRoundStatus();

  if (state.lines.length >= 4) {
    finishPoem();
  } else {
    // Volta para etapa 2 para o próximo verso
    ui.verseInput.value = "";
    updateVerseBlankPreview();
    ui.verseHint.textContent = `Verso ${state.lines.length + 1} de 4. Continue a quadra!`;
    ui.verseHint.style.color = "var(--muted)";
    goToPhase(2);
  }
}

function onCustomChoice() {
  const word = normalizeSpaces(ui.customInput.value || "");
  if (!word) {
    setExplain("Digite uma palavra para fechar o verso.");
    ui.customInput.focus();
    return;
  }
  if (/\s/.test(word) || word.includes("___")) {
    setExplain("Use apenas uma palavra como fechamento do verso.");
    ui.customInput.focus();
    return;
  }
  chooseToken(word, -1, "custom");
  ui.customInput.value = "";
}

// ── Atualizar poema em tempo real ─────────────────────────────────────
function updatePoem() {
  ui.history.innerHTML = "";
  state.lines.forEach((item, idx) => {
    const el = document.createElement("div");
    el.className = `histItem ${item.source === "custom" ? "custom" : ""}`;
    el.innerHTML = `
      <div class="hist-meta">
        <span>Verso ${idx + 1} · ${item.themeName}</span>
        <span class="hist-source">${item.source === "custom" ? "✍️ sua palavra" : `🤖 IA — ${item.pct}`}</span>
      </div>
      <div class="hist-line">${escapeHtml(item.verse)}</div>
    `;
    ui.history.appendChild(el);
  });
}

// ── Motor de Rima ─────────────────────────────────────────────────────

// Remove acentuação e retorna apenas letras minúsculas
function normWord(w) {
  return (w || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

// Última palavra de um verso
function lastWordOf(verse) {
  const words = verse.trim().split(/\s+/);
  return normWord(words[words.length - 1]);
}

// Pontuação bruta do par de rima
function rhymePairScore(a, b) {
  if (!a || !b) return -1;
  if (a === b && a.length > 1) return -2;                             // palavra repetida
  if (a.length >= 3 && b.length >= 3 && a.slice(-3) === b.slice(-3)) return 3;  // 3 letras
  if (a.length >= 2 && b.length >= 2 && a.slice(-2) === b.slice(-2)) return 2;  // 2 letras
  if (a.slice(-1) === b.slice(-1)) return 1;                          // 1 letra
  return -1;
}

function analyzeRepeatedEndingPenalty(words) {
  var counts = {};
  var repeatedWords = [];
  var repeatedCount = 0;

  words.forEach(function (word) {
    if (!word || word.length <= 1) return;
    counts[word] = (counts[word] || 0) + 1;
    if (counts[word] > 1) {
      repeatedCount += 1;
      if (!repeatedWords.includes(word)) repeatedWords.push(word);
    }
  });

  return {
    penalty: Math.min(4, repeatedCount),
    words: repeatedWords
  };
}

function extractVerseTokens(verse) {
  return String(verse || "")
    .trim()
    .split(/\s+/)
    .map(function (token) {
      return token.replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ-]+$/g, "");
    })
    .filter(Boolean);
}

function buildScoringLexicon() {
  var words = [];
  if (typeof FALLBACK_TOKENS !== "undefined" && Array.isArray(FALLBACK_TOKENS)) {
    words = words.concat(FALLBACK_TOKENS);
  }
  if (typeof getRhymeBankWords === "function") {
    words = words.concat(getRhymeBankWords());
  }

  var set = new Set();
  words.forEach(function (word) {
    var normalized = normWord(word);
    if (normalized) set.add(normalized);
  });
  return set;
}

function isSuspiciousJoinedToken(token, knownWords) {
  var normalized = normWord(token);
  if (!normalized) return false;
  if (knownWords && knownWords.has(normalized)) return false;
  if (/^(de|da|do|das|dos|na|no|nas|nos|em|com|pra|pro|e|foi|vai|sou|era|sao|estou|esta|ta|comeu)[a-z]{5,}$/.test(normalized)) {
    return true;
  }
  return normalized.length >= 13;
}

function analyzeStructure(lines) {
  var knownWords = buildScoringLexicon();
  var stopwords = new Set(["de", "do", "da", "dos", "das", "e", "em", "com", "pra", "pro", "para", "que", "se", "na", "no", "nas", "nos"]);
  var goodLines = 0;
  var suspiciousLines = 0;

  lines.forEach(function (line) {
    var tokens = extractVerseTokens(line.verse);
    var finalToken = tokens[tokens.length - 1] || "";
    var finalWord = normWord(finalToken);
    var balanced = tokens.length >= 3 && tokens.length <= 8;
    var suspicious = tokens.some(function (token) { return isSuspiciousJoinedToken(token, knownWords); });
    var clearEnding = finalWord.length >= 2 && !stopwords.has(finalWord) && !isSuspiciousJoinedToken(finalToken, knownWords);

    if (suspicious) suspiciousLines += 1;
    if (balanced && clearEnding && !suspicious) goodLines += 1;
  });

  return {
    goodLines: goodLines,
    suspiciousLines: suspiciousLines,
    points: goodLines === 4 ? 1 : 0
  };
}

function getQuadraRhymeSchemes() {
  return [
    { id: "AABB", pairs: [[0, 1], [2, 3]], label: "AABB", desc: "Rima em par — 1º/2º rimam, 3º/4º rimam" },
    { id: "ABAB", pairs: [[0, 2], [1, 3]], label: "ABAB", desc: "Rima alternada — 1º/3º rimam, 2º/4º rimam" },
    { id: "ABBA", pairs: [[0, 3], [1, 2]], label: "ABBA", desc: "Rima abraçada — 1º/4º rimam, 2º/3º rimam" },
  ];
}

function scoreRhymeScheme(scheme, words) {
  var pairScores = scheme.pairs.map(function (pair) { return rhymePairScore(words[pair[0]], words[pair[1]]); });
  return {
    scheme: scheme,
    pairScores: pairScores,
    total: pairScores.reduce(function (a, b) { return a + b; }, 0)
  };
}

// Analisa o esquema sorteado da quadra; se nao houver sorteio, usa o melhor esquema.
function analyzeRhyme(lines, expectedScheme) {
  const words = lines.map(function (l) { return lastWordOf(l.verse); });
  const schemes = getQuadraRhymeSchemes();
  const scoredSchemes = schemes.map(function (scheme) { return scoreRhymeScheme(scheme, words); });
  const bestOverall = scoredSchemes.reduce(function (best, current) {
    return !best || current.total > best.total ? current : best;
  }, null);
  const requested = schemes.find(function (scheme) { return scheme.id === expectedScheme; });
  const selected = requested
    ? scoredSchemes.find(function (item) { return item.scheme.id === requested.id; })
    : bestOverall;
  const best = selected.scheme;
  const bestScore = selected.total;
  const bestPairScores = selected.pairScores;

  var repeatedEnding = analyzeRepeatedEndingPenalty(words);
  var allRhyming = bestPairScores.every(function (s) { return s > 0; });
  var strongScheme = bestPairScores.every(function (s) { return s >= 2; }) && repeatedEnding.penalty === 0;
  var bonus = strongScheme ? 3 : 0;

  return {
    scheme: best.id, label: best.label, desc: best.desc,
    expectedScheme: requested ? requested.id : "",
    bestDetectedScheme: bestOverall ? bestOverall.scheme.id : best.id,
    pairs: best.pairs,
    pairScores: bestPairScores,
    words: words,
    rawPairScoreTotal: bestScore,
    pairScoreTotal: bestScore - repeatedEnding.penalty,
    repeatedEndingPenalty: repeatedEnding.penalty,
    repeatedEndingWords: repeatedEnding.words,
    schemeBonus: bonus,
    allRhyming: allRhyming,
    strongScheme: strongScheme
  };
}

function analyzeIndependence(lines, rhyme) {
  if (!rhyme || !rhyme.pairs) {
    return { bonus: 0, independentIndexes: [] };
  }

  var independentIndexes = [];
  rhyme.pairs.forEach(function (pair, pairIndex) {
    if ((rhyme.pairScores[pairIndex] || 0) < 2) return;

    pair.forEach(function (lineIndex) {
      var line = lines[lineIndex];
      if (!line || !line.creative) return;
      if (!independentIndexes.includes(lineIndex)) independentIndexes.push(lineIndex);
    });
  });

  return {
    bonus: Math.min(2, independentIndexes.length),
    independentIndexes: independentIndexes
  };
}

function analyzeLexicalOriginality(lines, rhyme, independence) {
  var knownWords = buildScoringLexicon();
  var originalIndexes = (independence.independentIndexes || []).filter(function (lineIndex) {
    var word = lastWordOf(lines[lineIndex]?.verse || "");
    return word && !knownWords.has(word);
  });

  return {
    bonus: Math.min(2, originalIndexes.length),
    originalIndexes: originalIndexes
  };
}

function calculateChallengeScore(lines, expectedScheme) {
  var rhyme = analyzeRhyme(lines, expectedScheme);
  var structure = analyzeStructure(lines);
  var independence = analyzeIndependence(lines, rhyme);
  var originality = analyzeLexicalOriginality(lines, rhyme, independence);
  var total = Math.max(0, structure.points + rhyme.pairScoreTotal + rhyme.schemeBonus + independence.bonus + originality.bonus);

  return {
    rhyme: rhyme,
    structure: structure,
    independence: independence,
    originality: originality,
    creativity: {
      bonus: independence.bonus + originality.bonus,
      creativeIndexes: [].concat(independence.independentIndexes || [], originality.originalIndexes || [])
    },
    total: total
  };
}

// Rotula o tipo de rima a partir da pontuação bruta do par — vira aula:
// só a vogal final coincide = toante (imperfeita); 2+ letras finais = consoante.
function rhymePairLabel(score) {
  if (score === -2) return { tag: "🔁 palavra repetida", color: "#ef4444" };
  if (score <= -1) return { tag: "❌ não rima", color: "#ef4444" };
  if (score === 1) return { tag: "👍 toante (imperfeita)", color: "#eab308" };
  if (score === 2) return { tag: "✨ consoante", color: "#22c55e" };
  return { tag: "🔥 consoante rica", color: "#22c55e" }; // score >= 3
}

// Gera o HTML do placar de rima/pontuação.
// Princípio: o detalhamento tem que FECHAR a conta. Os pares de rima são
// sub-itens aninhados sob a categoria "Rima" (e somam no subtotal dela), nunca
// parcelas extras. As três categorias — Rima, Forma e Autoria — particionam
// exatamente a fórmula do total, e a conta aparece somando até o total final.
function rhymeFeedbackHTML(result, challengeMode) {
  var r = result.rhyme;
  function signed(value) { return (value >= 0 ? "+" : "") + value; }
  var colors = { AABB: "#f97316", ABAB: "#a855f7", ABBA: "#06b6d4" };
  var color = colors[r.scheme] || "var(--primary)";

  // Subtotais que particionam a fórmula do total em calculateChallengeScore:
  //   total = max(0, structure.points + pairScoreTotal + schemeBonus
  //                  + independence.bonus + originality.bonus)
  var rimaSubtotal = r.pairScoreTotal + r.schemeBonus;          // pares (−penalidade) + bônus
  var formaSubtotal = result.structure.points;
  var autoriaSubtotal = result.independence.bonus + result.originality.bonus;
  var rawTotal = rimaSubtotal + formaSubtotal + autoriaSubtotal;
  var total = Math.max(0, rawTotal);
  var totalColor = total >= 10 ? "#22c55e" : total >= 5 ? "#f97316" : "#ef4444";

  var sub = "margin:4px 0 4px 16px;font-size:13px;color:var(--muted);";
  var catHead = "display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:12px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;";
  var hint = "display:block;margin:3px 0 0 28px;font-size:11px;color:var(--muted);font-style:italic;line-height:1.4;";

  // ── RIMA: pares aninhados (com tipo de rima) → penalidade → bônus → subtotal ─
  var pairLines = (r.pairs || []).map(function (pair, k) {
    var s = r.pairScores[k];
    var lbl = rhymePairLabel(s);
    return '<div style="' + sub + '">' +
      '<span style="color:var(--text);">&ldquo;' + (r.words[pair[0]] || "—") + '&rdquo; ↔ &ldquo;' + (r.words[pair[1]] || "—") + '&rdquo;</span>' +
      ' — <span style="color:' + lbl.color + ';">' + lbl.tag + '</span>' +
      ' <strong style="color:var(--text);">' + signed(s) + '</strong></div>';
  }).join("");

  var penaltyLine = r.repeatedEndingPenalty > 0
    ? '<div style="' + sub + 'color:#ef4444;">🔁 Penalidade por palavra final repetida: <strong>−' + r.repeatedEndingPenalty + '</strong>' +
      (r.repeatedEndingWords && r.repeatedEndingWords.length ? ' (' + r.repeatedEndingWords.join(", ") + ')' : '') + '</div>'
    : '';

  var schemeBonusLine = r.schemeBonus > 0
    ? '<div style="' + sub + 'color:#22c55e;">✅ Bônus de esquema forte: <strong>+' + r.schemeBonus + '</strong> (os dois pares rimam com 2+ letras finais)</div>'
    : '<div style="' + sub + '">Bônus de esquema forte: <strong>+0</strong>' +
      '<span style="' + hint + '">Como ganhar: faça os <em>dois</em> pares rimarem em consoante (2+ letras finais) e sem repetir palavra no fim → +3.</span></div>';

  var rimaBlock =
    '<div style="' + catHead + 'color:' + color + ';"><span>🎶 Rima</span><span>' + signed(rimaSubtotal) + '</span></div>' +
    pairLines + penaltyLine + schemeBonusLine;

  // ── FORMA ──
  var formaBlock =
    '<div style="' + catHead + 'color:var(--text);"><span>📐 Forma</span><span>' + signed(formaSubtotal) + '</span></div>' +
    (result.structure.points > 0
      ? '<div style="' + sub + '">Forma clara: <strong style="color:var(--text);">+' + result.structure.points + '</strong> (' + result.structure.goodLines + ' de 4 versos bem fechados)</div>'
      : '<div style="' + sub + '">Forma clara: <strong>+0</strong> (' + result.structure.goodLines + ' de 4 versos bem fechados)' +
        '<span style="' + hint + '">Como ganhar: os 4 versos precisam ter de 3 a 8 palavras, terminar em palavra forte (não em “de/que/na…”) e sem palavras grudadas → +1.</span></div>');

  // ── AUTORIA: independência + originalidade ──
  var indLine = result.independence.bonus > 0
    ? '<div style="' + sub + 'color:#06b6d4;">✍️ Independência autoral: <strong>+' + result.independence.bonus + '</strong> (palavra sua, fora das sugestões, dentro de par que rima)</div>'
    : '<div style="' + sub + '">Independência autoral: <strong>+0</strong>' +
      '<span style="' + hint + '">Como ganhar: feche um par que rima usando sua <em>própria</em> palavra (recusando a sugestão da Inanna) → +1 cada, até +2.</span></div>';
  var origLine = result.originality.bonus > 0
    ? '<div style="' + sub + 'color:#38bdf8;">💎 Originalidade lexical: <strong>+' + result.originality.bonus + '</strong> (rima surpresa fora do banco local)</div>'
    : '<div style="' + sub + '">Originalidade lexical: <strong>+0</strong>' +
      '<span style="' + hint + '">Como ganhar: termine um par que rima com uma palavra rara, fora do banco de rimas → +1 cada, até +2.</span></div>';
  var autoriaBlock =
    '<div style="' + catHead + 'color:var(--text);"><span>🪶 Autoria</span><span>' + signed(autoriaSubtotal) + '</span></div>' +
    indLine + origLine;

  // ── A conta fechando: as categorias somam exatamente o total ──
  var clampNote = rawTotal < 0 ? ' <span style="color:var(--muted);font-weight:600;">(piso 0)</span>' : '';
  var tally =
    '<div style="margin-top:14px;padding-top:10px;border-top:1px dashed rgba(255,255,255,0.18);font-size:13px;color:var(--muted);">' +
    'Rima ' + signed(rimaSubtotal) + ' &nbsp;+&nbsp; Forma ' + signed(formaSubtotal) + ' &nbsp;+&nbsp; Autoria ' + signed(autoriaSubtotal) +
    ' &nbsp;=&nbsp; <strong style="color:var(--text);">' + signed(rawTotal) + '</strong>' + clampNote + '</div>';

  var expectedLine = r.expectedScheme
    ? '<div style="font-size:12px;color:var(--muted);margin-bottom:6px;">Esquema sorteado: <strong style="color:' + color + ';">' + r.expectedScheme + '</strong>' + (r.bestDetectedScheme && r.bestDetectedScheme !== r.expectedScheme ? ' · melhor encaixe livre seria ' + r.bestDetectedScheme : '') + '</div>'
    : '';
  var scoreTitle = challengeMode ? 'Pontuação do Desafio' : 'No Modo Desafio, esta quadra valeria';

  return '<div style="margin-top:18px;padding:14px 18px;background:rgba(255,255,255,0.05);border-radius:12px;border-left:4px solid ' + color + ';">' +
    '<div style="font-weight:800;font-size:15px;margin-bottom:4px;">🎶 Esquema de Rima: <span style="color:' + color + ';">' + r.label + '</span></div>' +
    '<div style="font-size:12px;color:var(--muted);margin-bottom:8px;">' + r.desc + '</div>' +
    expectedLine +
    rimaBlock +
    formaBlock +
    autoriaBlock +
    tally +
    '<div style="margin-top:10px;font-size:16px;font-weight:900;color:' + totalColor + ';">' + scoreTitle + ': +' + total + '</div>' +
    '</div>';
}

function detectRhymeScheme(lines){
  if(lines.length < 4) return "Livre";

  const endings = lines.map(l=>{
    let w = typeof getLastWord === 'function' ? getLastWord(l.verse || l) : "";
    return w.slice(-2);
  });

  if(endings[0]===endings[1] && endings[2]===endings[3]){
    return "AABB";
  }

  if(endings[0]===endings[2] && endings[1]===endings[3]){
    return "ABAB";
  }

  if(endings[0]===endings[3] && endings[1]===endings[2]){
    return "ABBA";
  }

  return "Livre";
}

// ── Finalizar quadra ──────────────────────────────────────────────────
function finishPoem() {
  stopWritingTimer();
  var quadraText = state.lines.map(function (l) { return l.verse; }).join("\n");
  ui.quadra.textContent = quadraText;

  // Analisa rimas, forma e rubricas autorais contra o esquema sorteado.
  var expectedScheme = ["AABB", "ABAB", "ABBA"].includes(state.scheme) ? state.scheme : "";
  var scoreBreakdown = calculateChallengeScore(state.lines, expectedScheme);
  var rhyme = scoreBreakdown.rhyme;
  state.rhyme = rhyme;
  state.scoreBreakdown = scoreBreakdown;
  
  if (ui.contextDetected) {
    ui.contextDetected.textContent = "Esquema avaliado: " + rhyme.label;
  }

  // Aplica a nova pontuação estrutural no modo desafio
  var progressUpdate = null;
  if (state.modeChallenge) {
    state.points = scoreBreakdown.total;
    ui.points.textContent = String(state.points);
    progressUpdate = updatePlayerProgressAfterChallengeQuadra(scoreBreakdown);
    // Valor primeiro, perfil depois: convida ao perfil após a quadra fechada.
    maybePromptDeferredProfile();
    maybePromptGuestRegister();
  } else {
    state.points = 0;
    ui.points.textContent = "0";
  }

  // Exibe feedback visual da pontuação abaixo do poema
  var feedbackEl = document.getElementById("rhymeFeedback");
  if (!feedbackEl) {
    feedbackEl = document.createElement("div");
    feedbackEl.id = "rhymeFeedback";
    ui.poemSection.appendChild(feedbackEl);
  }
  feedbackEl.innerHTML = rhymeFeedbackHTML(scoreBreakdown, state.modeChallenge)
    + (state.modeChallenge ? renderMasteryProgressHTML(progressUpdate) : "")
    + (state.modeChallenge ? renderTrajectoryHTML(progressUpdate) : "");

  ui.poemSection.classList.add("visible");
  updateRoundStatus();
  goToPhase(4, { scrollTop: false });
  ui.poemSection.scrollIntoView({ behavior: "smooth" });
}

// ── Navegação entre etapas ────────────────────────────────────────────
function goToPhase(n, options) {
  const settings = Object.assign({ scrollTop: true }, options);
  state.phase = n;
  if (n === 0) {
    setView("identity");
  } else if (n === 4) {
    setView("gameResult");
  } else {
    setView("game");
  }
  if (n !== 4 && ui.poemSection) {
    ui.poemSection.classList.remove("visible");
  }
  [ui.step0, ui.step1, ui.step2, ui.step3].forEach((el, i) => {
    if (!el) return;
    el.classList.toggle("active", i === n);
  });
  document.querySelectorAll(".step-indicator").forEach((ind) => {
    const stepNum = Number(ind.dataset.step || "-1");
    ind.classList.toggle("done", stepNum > -1 && stepNum < n);
    ind.classList.toggle("current", stepNum === n);
  });
  if (settings.scrollTop) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function applyDashboardPayload(payload) {
  state.userDashboard = payload;
  state.userTexts = Array.isArray(payload?.texts) ? payload.texts : [];
  state.userFolhetos = buildFolhetoCollection(state.userTexts, payload?.folhetos || state.userFolhetos);
  window.__INANNA_DEBUG_STORE_STATUS = state.sextilhaStoreStatus;
  if (state.activeFolhetoId) {
    state.activeFolheto = state.userFolhetos.find((item) => item.folhetoId === state.activeFolhetoId) || null;
  }

  if (ui.dashboardGreeting) {
    ui.dashboardGreeting.textContent = `${getPlayerDisplayName()}, este é seu painel`;
  }
  if (ui.dashboardFolhetoCount) {
    ui.dashboardFolhetoCount.textContent = String(state.userFolhetos.length || 0);
  }
  if (ui.dashboardTextCount) {
    ui.dashboardTextCount.textContent = String(payload?.textCount || 0);
  }
  if (ui.dashboardCompletedCount) {
    ui.dashboardCompletedCount.textContent = String(payload?.completedCount || 0);
  }
  if (ui.dashboardLastEdited) {
    ui.dashboardLastEdited.textContent = payload?.lastEditedAt ? formatDateTime(payload.lastEditedAt) : "Ainda sem edições";
  }
  if (ui.dashboardStatusFilter) {
    ui.dashboardStatusFilter.value = state.dashboardFilter || "all";
    ui.dashboardStatusFilter.disabled = false;
  }
  if (ui.btnCreateFolheto) {
    ui.btnCreateFolheto.disabled = false;
  }
  if (ui.btnCreateText) {
    ui.btnCreateText.disabled = false;
  }

  renderPlayerPanel();
  renderDashboardTexts();
  persistDashboardCache(buildIdentityPayload(), payload);
  if (state.view === "folhetoWorkspace") {
    renderFolhetoWorkspace();
  }
}

async function openSextilhaDashboard(options = {}) {
  assertSextilhaWorkspaceAccess();

  const settings = { forceRefresh: false, ...options };
  const requestId = state.dashboardLoadRequestId + 1;
  state.dashboardLoadRequestId = requestId;
  state.selectedTrack = "sextilha";
  state.activeFolhetoId = "";
  state.activeFolheto = null;
  hideGameExperience();
  setView("sextilhaDashboard", ui.userDashboardSection);
  setCadernoDashboardVisible(true);
  renderPlayerPanel();
  const identity = buildIdentityPayload();
  const cachedPayload = settings.forceRefresh ? null : readDashboardCache(identity);
  const inMemoryPayload = state.userTexts.length && !settings.forceRefresh
    ? buildDashboardPayloadFromState()
    : null;

  if (inMemoryPayload) {
    applyDashboardPayload(inMemoryPayload);
  } else if (cachedPayload) {
    applyDashboardPayload(cachedPayload);
    if (ui.dashboardLastEdited) {
      ui.dashboardLastEdited.textContent = "Atualizando seu caderno...";
    }
  } else {
    renderDashboardLoadingSkeleton();
  }

  let fastPayload = null;
  const visibleBasePayload = inMemoryPayload || cachedPayload || null;
  const slowNoticeTimer = window.setTimeout(() => {
    if (requestId !== state.dashboardLoadRequestId) return;
    if (!visibleBasePayload) {
      renderDashboardSyncNotice("Seu caderno está demorando mais do que o normal para responder.");
      return;
    }
    if (ui.dashboardLastEdited) {
      ui.dashboardLastEdited.textContent = "Sincronizando seu caderno...";
    }
  }, DASHBOARD_SLOW_NOTICE_DELAY_MS);

  try {
    fastPayload = await loadUserDashboardData();
    window.clearTimeout(slowNoticeTimer);
    if (requestId !== state.dashboardLoadRequestId) return;
    const mergedFastPayload = visibleBasePayload
      ? mergeDashboardPayloads(visibleBasePayload, fastPayload)
      : fastPayload;
    if (!visibleBasePayload || payloadHasDashboardContent(mergedFastPayload) || !payloadHasDashboardContent(visibleBasePayload)) {
      applyDashboardPayload(mergedFastPayload);
    }
  } catch (error) {
    window.clearTimeout(slowNoticeTimer);
    if (requestId !== state.dashboardLoadRequestId) return;
    if (!visibleBasePayload) {
      renderDashboardSyncNotice(error?.message || "Seu caderno está demorando um pouco mais para responder.");
    } else if (ui.dashboardLastEdited) {
      ui.dashboardLastEdited.textContent = "Sincronizando seu caderno...";
    }
  }

  refreshDashboardInBackground(requestId, identity, fastPayload || visibleBasePayload).catch((error) => {
    console.warn("[dashboard] nao foi possivel concluir a sincronizacao em segundo plano", error);
  });
}

function renderTextCardMarkup(text) {
  return `
    <article class="text-card" data-text-id="${escapeHtml(text.textId)}">
      <div class="text-card__head">
        <div>
          <h3 class="text-card__title">${escapeHtml(text.title || "Sextilha sem título")}</h3>
          <p class="text-card__meta">
            ${escapeHtml(text.theme || "Tema livre")}<br>
            Última edição: ${escapeHtml(formatTextUpdatedLabel(text))}
            ${text.reopenRequested ? "<br>Reabertura solicitada ao educador" : ""}
          </p>
        </div>
        ${renderStatusBadge(text.status)}
      </div>
      <div class="text-card__indicators">${renderIndicatorChips(text.indicators)}${text.reopenRequested ? `<span class="indicator-chip">reabertura solicitada</span>` : ""}</div>
      <div class="text-card__actions">
        <button class="btn btn-primary" type="button" data-action="open-text" data-text-id="${escapeHtml(text.textId)}">${normalizeStatusValue(text.status) === "concluida" ? "Abrir" : "Continuar"}</button>
        <button class="btn btn-secondary" type="button" data-action="view-versions" data-text-id="${escapeHtml(text.textId)}">Versões</button>
        <button class="btn btn-ghost" type="button" data-action="archive-text" data-text-id="${escapeHtml(text.textId)}">Arquivar</button>
      </div>
    </article>
  `;
}

function renderFolhetoCardMarkup(folheto) {
  const latestText = folheto.texts[folheto.texts.length - 1] || null;
  return `
    <article class="folheto-card" data-folheto-id="${escapeHtml(folheto.folhetoId)}">
      <p class="folheto-card__eyebrow">${folheto.isLegacyBucket ? "Acervo legado" : "Folheto"}</p>
      <div class="text-card__head">
        <div>
          <h3 class="text-card__title">${escapeHtml(folheto.title || "Folheto sem título")}</h3>
          <p class="folheto-card__summary">${escapeHtml(folheto.isLegacyBucket ? "Seus textos anteriores continuam acessíveis aqui, sem perder histórico." : "Abra o livrinho e siga adicionando sextilhas como páginas de um mesmo cordel.")}</p>
        </div>
        ${folheto.completedCount ? `<span class="status-badge status-concluida">${escapeHtml(`${folheto.completedCount} concluídas`)}</span>` : `<span class="status-badge status-rascunho">${escapeHtml(`${folheto.textCount} sextilhas`)}</span>`}
      </div>
      <div class="folheto-card__stats">
        <span class="folheto-stat-pill">${escapeHtml(`${folheto.textCount} sextilhas`)}</span>
        <span class="folheto-stat-pill">${escapeHtml(`${folheto.completedCount} concluídas`)}</span>
      </div>
      <p class="folheto-card__meta">
        Última edição: ${escapeHtml(folheto.updatedAt ? formatDateTime(folheto.updatedAt) : "Ainda sem edições")}
        ${latestText ? `<br>Última sextilha: ${escapeHtml(latestText.title || "Sextilha sem título")}` : ""}
      </p>
      <div class="text-card__actions">
        <button class="btn btn-primary" type="button" data-action="open-folheto" data-folheto-id="${escapeHtml(folheto.folhetoId)}">${folheto.isLegacyBucket ? "Abrir acervo" : "Abrir folheto"}</button>
      </div>
    </article>
  `;
}

function renderDashboardTexts() {
  if (!ui.dashboardTextList) return;

  const filterValue = normalizeStatusValue(ui.dashboardStatusFilter?.value || state.dashboardFilter || "all");
  state.dashboardFilter = filterValue;
  const filteredTexts = state.userTexts.filter((text) => {
    if (filterValue === "all") return true;
    return normalizeStatusValue(text.status) === filterValue;
  });
  const filteredFolhetos = buildFolhetoCollection(filteredTexts, state.userFolhetos)
    .filter((folheto) => filterValue === "all" || folheto.textCount > 0);

  if (!filteredFolhetos.length) {
    ui.dashboardTextList.innerHTML = `
      <div class="workspace-empty">
        ${filterValue === "all" ? "Nenhum folheto criado ainda. Comece um novo folheto para abrir seu caderno." : "Nenhum folheto encontrado para este status."}
      </div>
    `;
    return;
  }

  ui.dashboardTextList.innerHTML = filteredFolhetos.map(renderFolhetoCardMarkup).join("");
}

function renderFolhetoWorkspace() {
  if (!state.activeFolheto || !ui.folhetoTextList) return;

  if (ui.folhetoTitleHeading) {
    ui.folhetoTitleHeading.textContent = state.activeFolheto.title || "Folheto sem título";
  }
  if (ui.folhetoSummaryText) {
    ui.folhetoSummaryText.textContent = state.activeFolheto.isLegacyBucket
      ? "Aqui ficam as sextilhas anteriores ao novo fluxo de folhetos. Elas continuam acessíveis e intactas."
      : "Cada sextilha entra como uma nova página do seu cordel em andamento.";
  }
  if (ui.folhetoTextCount) {
    ui.folhetoTextCount.textContent = String(state.activeFolheto.textCount || 0);
  }
  if (ui.folhetoCompletedCount) {
    ui.folhetoCompletedCount.textContent = String(state.activeFolheto.completedCount || 0);
  }
  if (ui.folhetoLastEdited) {
    ui.folhetoLastEdited.textContent = state.activeFolheto.updatedAt ? formatDateTime(state.activeFolheto.updatedAt) : "Ainda sem edições";
  }

  if (ui.btnCreateTextInFolheto) {
    ui.btnCreateTextInFolheto.disabled = !!state.activeFolheto.isLegacyBucket;
    ui.btnCreateTextInFolheto.textContent = state.activeFolheto.isLegacyBucket
      ? "Acervo apenas para leitura"
      : "Nova sextilha neste folheto";
  }

  if (!state.activeFolheto.texts.length) {
    ui.folhetoTextList.innerHTML = `<div class="workspace-empty">Este folheto ainda não tem sextilhas. Abra a primeira página quando quiser.</div>`;
    return;
  }

  ui.folhetoTextList.innerHTML = state.activeFolheto.texts.map(renderTextCardMarkup).join("");
}

async function openFolhetoWorkspace(folhetoId) {
  const folheto = buildFolhetoCollection(state.userTexts, state.userFolhetos)
    .find((item) => item.folhetoId === folhetoId);
  if (!folheto) {
    await openSextilhaDashboard({ forceRefresh: true });
    return;
  }

  state.activeFolhetoId = folheto.folhetoId;
  state.activeFolheto = folheto;
  hideGameExperience();
  setView("folhetoWorkspace", ui.folhetoWorkspaceSection);
  renderFolhetoWorkspace();
}

async function createNewFolheto() {
  const title = window.prompt("Qual título deseja dar ao novo folheto?");
  const normalizedTitle = String(title || "").trim();
  if (!normalizedTitle) return;

  if (ui.btnCreateFolheto) {
    ui.btnCreateFolheto.disabled = true;
    ui.btnCreateFolheto.textContent = "Criando folheto...";
  }

  try {
    const result = await createFolhetoRecord({ title: normalizedTitle });
    if (result?.folheto) {
      upsertFolhetoInDashboardState(result.folheto);
      await openFolhetoWorkspace(result.folheto.folhetoId);
      setEditorFeedback(`Folheto "${normalizedTitle}" criado.`, "success");
    }
  } finally {
    if (ui.btnCreateFolheto) {
      ui.btnCreateFolheto.disabled = false;
      ui.btnCreateFolheto.textContent = "Criar novo folheto";
    }
  }
}

function resolveNextFolhetoOrder(folhetoId) {
  if (!folhetoId) return 0;
  const folhetoTexts = state.userTexts.filter((text) => String(text?.folhetoId || "").trim() === String(folhetoId || "").trim());
  const lastKnownOrder = Math.max(0, ...folhetoTexts.map((text) => Number(text?.folhetoOrder || 0)));
  return lastKnownOrder + 1;
}

async function createNewSextilha(options = {}) {
  const targetFolheto = options.folheto || state.activeFolheto || null;
  const shouldAttachFolheto = !!(targetFolheto?.folhetoId && !targetFolheto?.isLegacyBucket);
  const button = shouldAttachFolheto ? ui.btnCreateTextInFolheto : ui.btnCreateText;
  const idleLabel = shouldAttachFolheto ? "Nova sextilha neste folheto" : "Nova sextilha avulsa";

  if (button) {
    button.disabled = true;
    button.textContent = "Criando...";
  }

  try {
    const result = await createSextilhaTextRecord({
      title: "",
      theme: "",
      note: "",
      status: "rascunho",
      folhetoId: shouldAttachFolheto ? targetFolheto.folhetoId : "",
      folhetoTitle: shouldAttachFolheto ? targetFolheto.title : "",
      folhetoOrder: shouldAttachFolheto ? resolveNextFolhetoOrder(targetFolheto.folhetoId) : 0,
    });
    upsertTextInDashboardState(result?.text);
    if (shouldAttachFolheto) {
      state.activeFolhetoId = targetFolheto.folhetoId;
      state.activeFolheto = buildFolhetoCollection(state.userTexts, state.userFolhetos)
        .find((item) => item.folhetoId === targetFolheto.folhetoId) || targetFolheto;
    }
    state.activeTextId = result?.text?.textId || "";
    await openSextilhaEditor(state.activeTextId);
    setEditorFeedback("Novo rascunho criado. Você já pode escrever e salvar.", "success");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = idleLabel;
    }
  }
}

async function openSextilhaEditor(textId, draftVersion = null) {
  if (!textId) return;

  state.lastAiFeedback = null;
  state.aiFeedbackRequestKey = "";
  state.aiFeedbackLoading = false;
  setEditorFeedback("Carregando texto...", "muted");
  renderEditorAiFeedback(state.lastAiFeedback);

  const payload = await loadSextilhaTextRecord(textId);

  state.activeTextId = textId;
  state.activeText = payload?.text || null;
  const textFolhetoId = String(state.activeText?.folhetoId || "").trim();
  if (textFolhetoId) {
    state.activeFolhetoId = textFolhetoId;
    state.activeFolheto = buildFolhetoCollection(state.userTexts, state.userFolhetos)
      .find((item) => item.folhetoId === textFolhetoId) || state.activeFolheto;
  } else {
    state.activeFolhetoId = "";
    state.activeFolheto = null;
  }
  state.draftVersionSource = draftVersion;
  setView("sextilhaEditor", ui.sextilhaEditorSection);
  fillSextilhaEditor(payload?.text, draftVersion);
}

function fillSextilhaEditor(text, draftVersion = null) {
  const source = draftVersion || text?.latestVersion || text;
  if (!source) return;
  state.mutedVerseWarningIndexes = Array.from({ length: 6 }, () => false);
  state.aiFeedbackLoading = false;

  if (ui.editorTitleHeading) {
    ui.editorTitleHeading.textContent = text?.title || draftVersion?.title || "Nova sextilha";
  }
  if (ui.editorTitleInput) ui.editorTitleInput.value = source.title || "";
  if (ui.editorThemeInput) ui.editorThemeInput.value = source.theme || "";
  if (ui.editorNoteInput) ui.editorNoteInput.value = source.note || "";

  const verses = Array.isArray(source.verses) ? source.verses : [];
  getSextilhaVerseInputs().forEach((input, index) => {
    if (input) input.value = verses[index] || "";
  });

  if (ui.editorSharedWithEducator) {
    ui.editorSharedWithEducator.checked = !!source.sharedWithEducator;
  }
  if (ui.editorVersionMeta) {
    ui.editorVersionMeta.textContent = draftVersion?.versionNumber
      ? `Versão ${draftVersion.versionNumber} carregada no editor.`
      : text?.latestVersion?.versionNumber
        ? `Versão ${text.latestVersion.versionNumber} é a mais recente no editor.`
      : text?.versionCount
        ? `${text.versionCount} versões registradas.`
        : "Versão ainda não salva.";
  }
  if (ui.editorLastSaved) {
    ui.editorLastSaved.textContent = text?.updatedAt
      ? `Última atualização: ${formatDateTime(text.updatedAt)}`
      : "Última atualização: ainda sem registro.";
  }

  applyEditorLockState(isEditorLocked(text || source), text || source);
  renderEditorAiFeedback(state.lastAiFeedback);
  syncEditorInannaPresence();
  updateSextilhaIndicators();
}

async function saveCurrentTextVersion(saveMode = "draft") {
  if (!state.activeTextId) return;
  if (isEditorLocked()) {
    setEditorFeedback("Este texto já foi finalizado e está bloqueado para edição.", "error");
    return;
  }

  const baseDraft = getSextilhaDraft();
  const draft = {
    ...baseDraft,
    status: getNextDraftStatus(saveMode, baseDraft.sharedWithEducator),
  };

  if (!draft.title && !draft.theme && !draft.verses.some(Boolean) && !draft.note) {
    setEditorFeedback("Escreva pelo menos um elemento do texto antes de salvar.", "error");
    return;
  }

  if (saveMode === "finalize") {
    const filledVersesCount = draft.verses.filter(Boolean).length;
    if (filledVersesCount < 6) {
      setEditorFeedback("Preencha os 6 versos antes de finalizar a sextilha.", "error");
      return;
    }

  const confirmed = window.confirm("Tem certeza de que vai finalizar o rascunho? Depois disso, você não poderá modificar o texto sem avaliação futura do educador.");
    if (!confirmed) return;
  }

  const baselineVersion = getEditorBaselineVersion();
  if (
    baselineVersion &&
    buildComparableSextilhaDraftFingerprint(draft) === buildComparableSextilhaDraftFingerprint(baselineVersion)
  ) {
    setEditorFeedback(`Nenhuma alteração nova desde ${describeSextilhaBaselineVersion(baselineVersion)}. Ajuste algo antes de salvar outra etapa.`, "muted");
    return;
  }

  const finishSaveFeedback = beginTextPersistProgressiveFeedback(saveMode);
  state.aiFeedbackRequestKey = "";
  let saveSucceeded = false;

  try {
    const nextRevisionCount = Number(state.activeText?.versionCount || 0) + 1;
    const indicators = buildLiveSextilhaIndicators({
      draft,
      revisionCount: nextRevisionCount,
    });
    const response = await saveSextilhaTextVersionRecord({
      textId: state.activeTextId,
      title: draft.title,
      theme: draft.theme,
      note: draft.note,
      verses: draft.verses,
      status: draft.status,
      sharedWithEducator: draft.sharedWithEducator,
      indicators,
    });

    const savedVersion = response?.version || null;
    saveSucceeded = true;
    state.activeText = response?.text || state.activeText;
    state.lastAiFeedback = null;
    state.draftVersionSource = null;
    fillSextilhaEditor(state.activeText);
    upsertTextInDashboardState(state.activeText);
    if (state.activeText?.folhetoId) {
      state.activeFolheto = buildFolhetoCollection(state.userTexts, state.userFolhetos)
        .find((item) => item.folhetoId === state.activeText.folhetoId) || state.activeFolheto;
    }
    state.activeTextVersions = [savedVersion, ...state.activeTextVersions.filter((version) => version?.versionId !== savedVersion?.versionId)].filter(Boolean);
    if (saveMode === "finalize") {
      setEditorFeedback(
        INANNA_SOCIAL_EMAIL_ENABLED
          ? "Sextilha finalizada. Preparando o cartão-postal para o seu e-mail..."
          : "Sextilha finalizada e salva no caderno.",
        INANNA_SOCIAL_EMAIL_ENABLED ? "muted" : "success"
      );
    } else {
      setEditorFeedback(`${buildSextilhaVersionLabel(savedVersion)} salva com sucesso.`, "success");
    }
    requestAiFeedbackForVersion(
      response?.text?.textId,
      savedVersion?.versionId,
      buildAiFeedbackRequestPayload(state.activeText, savedVersion)
    );
    if (saveMode === "finalize") {
      if (INANNA_SOCIAL_EMAIL_ENABLED) {
        await sendSocialPostcardEmail(buildSocialPostcardData(state.activeText, savedVersion));
        setEditorFeedback("Sextilha finalizada e cartão enviado para o seu e-mail.", "success");
      } else {
        setEditorFeedback("Sextilha finalizada. O envio por e-mail fica suspenso nesta fase.", "success");
      }
    }
  } catch (error) {
    const fallbackMessage = saveMode === "finalize" && saveSucceeded
      ? getFriendlySocialDeliveryErrorMessage(error)
        : "Não foi possível salvar a versão.";
    setEditorFeedback(saveMode === "finalize" && saveSucceeded ? fallbackMessage : (error?.message || fallbackMessage), "error");
    if (!saveSucceeded && INANNA_AI_ENABLED) {
      renderEditorAiFeedback({
        tone: "error",
        message: "O texto não recebeu devolutiva agora. Verifique a configuração da camada de IA.",
      });
    }
  } finally {
    finishSaveFeedback();
  }
}

async function resendSocialPostcardEmail() {
  if (!state.activeText || !isEditorLocked(state.activeText)) return;
  if (!INANNA_SOCIAL_EMAIL_ENABLED) {
    setEditorFeedback("O envio por e-mail está suspenso nesta fase.", "muted");
    return;
  }

  if (ui.btnResendSocialEmail) {
    ui.btnResendSocialEmail.disabled = true;
    ui.btnResendSocialEmail.textContent = "Reenviando...";
  }

  try {
    await sendSocialPostcardEmail(buildSocialPostcardData(state.activeText, state.activeText?.latestVersion));
    setEditorFeedback("Cartão-postal reenviado para o seu e-mail.", "success");
  } catch (error) {
    setEditorFeedback(getFriendlySocialDeliveryErrorMessage(error), "error");
  } finally {
    if (ui.btnResendSocialEmail) {
      ui.btnResendSocialEmail.disabled = false;
      ui.btnResendSocialEmail.textContent = "Reenviar cartão por e-mail";
    }
  }
}

async function archiveCurrentText() {
  if (!state.activeTextId) return;
  const confirmed = window.confirm("Arquivar este texto sem apagar o histórico?");
  if (!confirmed) return;

  const response = await archiveSextilhaTextRecord(state.activeTextId, { status: "arquivada" });
  if (response?.text) {
    upsertTextInDashboardState(response.text);
  }

  if (state.activeFolhetoId) {
    await openFolhetoWorkspace(state.activeFolhetoId);
    return;
  }

  await openSextilhaDashboard();
}

async function requestTextReopen() {
  if (!state.activeTextId || !isEditorLocked()) return;

  if (state.activeText?.reopenRequested) {
    setEditorFeedback("O pedido de reabertura já foi registrado para avaliação futura do educador.", "muted");
    return;
  }

  const confirmed = window.confirm("Deseja solicitar a reabertura deste texto para avaliação futura do educador?");
  if (!confirmed) return;

  const response = await updateSextilhaTextStatusRecord(state.activeTextId, {
    status: state.activeText?.status || "concluida",
    sharedWithEducator: true,
    reopenRequested: true,
  });

  if (response?.text) {
    state.activeText = response.text;
    upsertTextInDashboardState(response.text);
    fillSextilhaEditor(state.activeText);
  }

  setEditorFeedback("Pedido de reabertura registrado para avaliação futura do educador.", "success");
}

async function openVersionHistory(textId = state.activeTextId) {
  if (!textId) return;
  if (textId !== state.activeTextId) {
    state.versionCompareSelection = [];
  }
  renderVersionHistoryLoadingSkeleton();
  setView("versionHistory", ui.versionHistorySection);

  const response = await loadSextilhaTextVersionsRecord(textId);

  state.activeTextId = textId;
  state.activeTextVersions = Array.isArray(response?.versions) ? response.versions : [];
  renderVersionHistory();
}

function getVersionCompareSelection() {
  return state.versionCompareSelection
    .map((versionId) => state.activeTextVersions.find((item) => item.versionId === versionId))
    .filter(Boolean)
    .sort((left, right) => (Number(left.versionNumber) || 0) - (Number(right.versionNumber) || 0));
}

function toggleVersionCompareSelection(versionId) {
  if (!versionId) return;

  if (state.versionCompareSelection.includes(versionId)) {
    state.versionCompareSelection = state.versionCompareSelection.filter((item) => item !== versionId);
    renderVersionHistory();
    return;
  }

  const nextSelection = [...state.versionCompareSelection, versionId];
  state.versionCompareSelection = nextSelection.slice(-2);
  renderVersionHistory();
}

function clearVersionCompareSelection() {
  state.versionCompareSelection = [];
  renderVersionHistory();
}

function renderVersionComparePanel() {
  if (!ui.versionComparePanel) return;

  const selectedVersions = getVersionCompareSelection();
  if (!state.activeTextVersions.length) {
    ui.versionComparePanel.innerHTML = "";
    return;
  }

  if (selectedVersions.length < 2) {
    ui.versionComparePanel.innerHTML = `
      <section class="version-compare version-compare--empty">
        <div>
          <p class="workspace-kicker">Comparação de versões</p>
          <h3>Escolha duas versões para ver a evolução lado a lado</h3>
          <p class="workspace-meta">Selecione duas versões no histórico para comparar versos, status e indicadores.</p>
        </div>
        <div class="version-compare__selection">
          ${selectedVersions.length
      ? selectedVersions.map((version) => `<span class="version-compare__pill">Versão ${escapeHtml(version.versionNumber)}</span>`).join("")
      : `<span class="version-compare__hint">Nenhuma versão selecionada ainda.</span>`}
        </div>
      </section>
    `;
    return;
  }

  const [baseVersion, currentVersion] = selectedVersions;
  const baseVerses = Array.isArray(baseVersion.verses) ? baseVersion.verses : [];
  const currentVerses = Array.isArray(currentVersion.verses) ? currentVersion.verses : [];

  ui.versionComparePanel.innerHTML = `
    <section class="version-compare">
      <div class="version-compare__head">
        <div>
          <p class="workspace-kicker">Comparação de versões</p>
        <h3>Versão ${escapeHtml(baseVersion.versionNumber)} x Versão ${escapeHtml(currentVersion.versionNumber)}</h3>
          <p class="workspace-meta">Veja como a escrita mudou entre duas etapas do mesmo texto.</p>
        </div>
        <div class="workspace-actions">
          <button class="btn btn-ghost" type="button" data-action="clear-compare">Limpar comparação</button>
        </div>
      </div>
      <div class="version-compare__summary">
        <article class="version-compare__summary-card">
          <p class="workspace-kicker">Versão ${escapeHtml(baseVersion.versionNumber)}</p>
          <p class="workspace-meta">${escapeHtml(formatDateTime(baseVersion.createdAt))}</p>
          ${renderStatusBadge(baseVersion.status)}
          <div class="version-card__indicators">${renderIndicatorChips(baseVersion.indicators)}</div>
        </article>
        <article class="version-compare__summary-card">
          <p class="workspace-kicker">Versão ${escapeHtml(currentVersion.versionNumber)}</p>
          <p class="workspace-meta">${escapeHtml(formatDateTime(currentVersion.createdAt))}</p>
          ${renderStatusBadge(currentVersion.status)}
          <div class="version-card__indicators">${renderIndicatorChips(currentVersion.indicators)}</div>
        </article>
      </div>
      <div class="version-compare__verses">
        ${Array.from({ length: 6 }, (_, index) => {
          const leftVerse = String(baseVerses[index] || "").trim();
          const rightVerse = String(currentVerses[index] || "").trim();
          const changed = leftVerse !== rightVerse;
          const changedClass = changed ? "version-compare__cell--changed" : "";
          return `
            <div class="version-compare__cell ${changedClass}">
                <span class="version-compare__label">Versão ${escapeHtml(baseVersion.versionNumber)} · Verso ${index + 1}</span>
              <p>${escapeHtml(leftVerse || "—")}</p>
            </div>
            <div class="version-compare__cell ${changedClass}">
                <span class="version-compare__label">Versão ${escapeHtml(currentVersion.versionNumber)} · Verso ${index + 1}</span>
              <p>${escapeHtml(rightVerse || "—")}</p>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderVersionHistory() {
  if (ui.versionHistoryTitle) {
    ui.versionHistoryTitle.textContent = state.activeText?.title || "Versões da sextilha";
  }
  if (!ui.versionHistoryList) return;

  state.versionCompareSelection = state.versionCompareSelection.filter((versionId) => (
    state.activeTextVersions.some((item) => item.versionId === versionId)
  ));
  renderVersionComparePanel();

  if (!state.activeTextVersions.length) {
    ui.versionHistoryList.innerHTML = `<div class="workspace-empty">Nenhuma versão salva ainda.</div>`;
    return;
  }

  ui.versionHistoryList.innerHTML = state.activeTextVersions.map((version) => `
    <article class="version-card ${state.versionCompareSelection.includes(version.versionId) ? "version-card--selected" : ""}">
      <div class="version-card__head">
        <div>
        <h3 class="version-card__title">Versão ${version.versionNumber}</h3>
          <p class="version-card__meta">${escapeHtml(formatDateTime(version.createdAt))}</p>
        </div>
        ${renderStatusBadge(version.status)}
      </div>
      <div class="version-card__indicators">${renderIndicatorChips(version.indicators)}</div>
        <pre>${escapeHtml((version.verses || []).filter(Boolean).join("\n") || "Sem versos registrados nesta versão.")}</pre>
      <div class="version-card__actions">
        <button class="btn btn-secondary" type="button" data-action="toggle-compare" data-version-id="${escapeHtml(version.versionId)}">
          ${state.versionCompareSelection.includes(version.versionId) ? "Remover da comparação" : "Comparar"}
        </button>
        <button class="btn btn-primary" type="button" data-action="restore-version" data-version-id="${escapeHtml(version.versionId)}">Usar esta versão no editor</button>
      </div>
    </article>
  `).join("");
}

function restoreVersionToEditor(versionId) {
  const version = state.activeTextVersions.find((item) => item.versionId === versionId);
  if (!version) return;
  state.draftVersionSource = version;
  setView("sextilhaEditor", ui.sextilhaEditorSection);
  fillSextilhaEditor(state.activeText, version);
  setEditorFeedback(
    isEditorLocked(state.activeText)
      ? "Versão carregada para leitura. O texto segue bloqueado porque já foi finalizado."
      : "Versão carregada no editor. Salve para criar uma nova etapa do texto.",
    "success"
  );
}

function buildLiveSextilhaIndicators(options = {}) {
  const draft = options.draft || getSextilhaDraft();
  const verses = draft.verses;
  const filledVerses = verses.filter(Boolean);
  const targetRhyme = evaluateABCBDBRhyme(verses);
  const finalWords = filledVerses.map((verse) => getVerseLastWord(verse)).filter(Boolean);

  const meaningfulThemeTokens = tokenizeVerseAnalysisText(`${draft.title} ${draft.theme} ${draft.note}`)
    .filter((token) => token.length > 2);
  const verseTokens = tokenizeVerseAnalysisText(verses.join(" "))
    .filter((token) => token.length > 2);

  const completude = `${filledVerses.length}/6 versos preenchidos`;

  let fechamento = "texto iniciando";
  if (filledVerses.length) {
    const validEndings = finalWords.filter((word) => word.length >= 2).length;
    fechamento = validEndings >= Math.max(1, filledVerses.length - 1)
      ? "versos em fechamento"
      : "revisar finais dos versos";
    if (filledVerses.length === 6 && validEndings === 6) {
      fechamento = "fechamento consistente";
    }
  }

  let rimaStatus = "ABCBDB: aguardando a rima B nos versos 2, 4 e 6";
  if (targetRhyme.matched) {
    rimaStatus = "ABCBDB: rima B confirmada";
  } else if (targetRhyme.complete) {
    rimaStatus = "ABCBDB: revisar versos 2, 4 e 6";
  } else if (targetRhyme.partialMatch || targetRhyme.words.length >= 1) {
    rimaStatus = "ABCBDB: rima B em formação";
  }

  let coerenciaTematica = "tema em formação";
  if (!meaningfulThemeTokens.length) {
    coerenciaTematica = filledVerses.length >= 3 ? "boa unidade do texto" : "tema em aberto";
  } else {
    const overlap = meaningfulThemeTokens.filter((token) => verseTokens.includes(token)).length;
    if (overlap >= 2) coerenciaTematica = "boa unidade temática";
    else if (overlap >= 1) coerenciaTematica = "tema presente";
    else if (filledVerses.length >= 3) coerenciaTematica = "reforçar unidade temática";
  }

  const tokenFrequency = verseTokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});
  const highestFrequency = Math.max(0, ...Object.values(tokenFrequency));
  const repeticaoLexical = highestFrequency >= 4
    ? "repetição alta"
    : highestFrequency === 3
      ? "alguma repetição"
      : "boa variedade lexical";

  const revisionCount = Number(options.revisionCount ?? state.activeText?.versionCount ?? 0);
  const maturacao = revisionCount >= 4
    ? "texto amadurecido"
    : revisionCount >= 2
      ? "texto amadurecendo"
      : revisionCount === 1
        ? "primeira versão registrada"
        : "texto iniciando";

  return {
    completude,
    fechamento,
    rimaStatus,
    coerenciaTematica,
    repeticaoLexical,
    numberOfRevisions: revisionCount,
    maturacao,
  };
}

function updateSextilhaIndicators() {
  const indicators = buildLiveSextilhaIndicators();
  const verses = getSextilhaDraft().verses;
  if (ui.editorIndicatorList) {
    ui.editorIndicatorList.innerHTML = renderIndicatorChips(indicators);
  }
  applyVerseMeterFeedback(verses);
  applyRhymeBadgeFeedback(verses);
}

async function handleDashboardTextAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, textId, folhetoId } = button.dataset;

  if (action === "open-folheto") {
    if (!folhetoId) return;
    await openFolhetoWorkspace(folhetoId);
    return;
  }

  if (!textId) return;

  if (action === "open-text") {
    await openSextilhaEditor(textId);
    return;
  }

  if (action === "view-versions") {
    const match = state.userTexts.find((text) => text.textId === textId);
    if (match) state.activeText = match;
    await openVersionHistory(textId);
    return;
  }

  if (action === "archive-text") {
  const confirmed = window.confirm("Arquivar este texto sem apagar o histórico?");
    if (!confirmed) return;
    const response = await archiveSextilhaTextRecord(textId, { status: "arquivada" });
    if (response?.text) {
      upsertTextInDashboardState(response.text);
      applyDashboardPayload(buildDashboardPayloadFromState());
    }
  }
}

// ── Início (Step 0) ───────────────────────────────────────────────────
if (ui.btnStart) {
  ui.btnStart.addEventListener("click", handleStartJourney);
}

// Modo experimentar: só aparece quando habilitado por config (default OFF).
if (ui.btnGuestStart) {
  if (INANNA_GUEST_MODE_ENABLED) {
    ui.btnGuestStart.hidden = false;
    ui.btnGuestStart.addEventListener("click", startGuestSession);
  } else {
    ui.btnGuestStart.hidden = true;
  }
}

if (ui.verifyCheckinBtn) {
  ui.verifyCheckinBtn.addEventListener("click", verifyCheckinEmail);
}

if (ui.playerEmail) {
  ui.playerEmail.addEventListener("input", () => {
    const typedEmail = ui.playerEmail.value.trim();
    if (normalizeEmail(typedEmail) !== normalizeEmail(state.email)) {
      clearResolvedCheckinIdentity(typedEmail);
    }
    setStartHint("");
    updateWelcomeIdentityUI();
  });

  ui.playerEmail.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      verifyCheckinEmail();
    }
  });
}

if (ui.saveProfileBtn) {
  ui.saveProfileBtn.addEventListener("click", saveParticipantProfile);
}

if (ui.saveDashboardProfileBtn) {
  ui.saveDashboardProfileBtn.addEventListener("click", saveDashboardProfile);
}

if (ui.toggleDashboardProfileEditBtn) {
  ui.toggleDashboardProfileEditBtn.addEventListener("click", () => {
    state.dashboardProfileEditOpen = !state.dashboardProfileEditOpen;
    if (state.dashboardProfileEditOpen) {
      syncDashboardProfileFormFromState(true);
      loadMunicipiosBrasil();
    }
    renderPlayerPanel();
  });
}

if (ui.savePlayerDisplayNameBtn) {
  ui.savePlayerDisplayNameBtn.addEventListener("click", () => {
    const nickname = savePlayerDisplayName(ui.playerDisplayNameInput?.value || "");
    if (ui.playerDisplayNameStatus) {
      ui.playerDisplayNameStatus.textContent = `Inanna vai chamar você de ${nickname}.`;
      ui.playerDisplayNameStatus.style.color = "var(--accent)";
    }
  });
}

[
  ui.profileWorkshopYes,
  ui.profileWorkshopNo,
  ui.profileAiChatbotYes,
  ui.profileAiChatbotNo,
  ui.profileGender,
  ui.profileRace,
  ui.profileAgeRange,
  ui.profileMunicipioInput,
  ui.profileOutsideBrazil
].filter(Boolean).forEach((field) => {
  field.addEventListener("input", () => {
    setProfileStatus("");
    renderProfileCompletionPanel();
    if (field === ui.profileMunicipioInput) loadMunicipiosBrasil();
  });
  field.addEventListener("change", () => {
    setProfileStatus("");
    if (field === ui.profileOutsideBrazil && ui.profileMunicipioInput) {
      ui.profileMunicipioInput.placeholder = ui.profileOutsideBrazil.checked
        ? "Digite cidade/país"
        : "Digite para buscar cidade - UF";
    }
    renderProfileCompletionPanel();
  });
});

[
  ui.dashboardProfileWorkshopYes,
  ui.dashboardProfileWorkshopNo,
  ui.dashboardProfileAiChatbotYes,
  ui.dashboardProfileAiChatbotNo,
  ui.dashboardProfileGender,
  ui.dashboardProfileRace,
  ui.dashboardProfileAgeRange,
  ui.dashboardProfileMunicipioInput,
  ui.dashboardProfileOutsideBrazil
].filter(Boolean).forEach((field) => {
  field.addEventListener("input", () => {
    setDashboardProfileStatus("");
    if (field === ui.dashboardProfileMunicipioInput) loadMunicipiosBrasil();
  });
  field.addEventListener("change", () => {
    setDashboardProfileStatus("");
    if (field === ui.dashboardProfileOutsideBrazil && ui.dashboardProfileMunicipioInput) {
      ui.dashboardProfileMunicipioInput.placeholder = ui.dashboardProfileOutsideBrazil.checked
        ? "Digite cidade/país"
        : "Digite para buscar cidade - UF";
    }
  });
});

if (ui.profileMunicipioInput) {
  ui.profileMunicipioInput.addEventListener("focus", loadMunicipiosBrasil);
}

if (ui.dashboardProfileMunicipioInput) {
  ui.dashboardProfileMunicipioInput.addEventListener("focus", loadMunicipiosBrasil);
}

if (ui.chooseGameTrackBtn) {
  ui.chooseGameTrackBtn.addEventListener("click", openQuadraLevelChooser);
}

if (ui.startLevel1TrackBtn) {
  ui.startLevel1TrackBtn.addEventListener("click", startGameTrack);
}

if (ui.quadraLevelsBackBtn) {
  ui.quadraLevelsBackBtn.addEventListener("click", showTrackChooser);
}

if (ui.choosePlayerPanelBtn) {
  ui.choosePlayerPanelBtn.addEventListener("click", () => {
    openPlayerDashboard().catch((error) => {
      showToast(error?.message || "Não foi possível abrir o painel agora.", "muted");
    });
  });
}

if (ui.chooseSextilhaTrackBtn) {
  ui.chooseSextilhaTrackBtn.addEventListener("click", async () => {
    if (!syncSextilhaTrackAccess({ toast: true })) return;

    const originalLabel = ui.chooseSextilhaTrackBtn.textContent;
    ui.chooseSextilhaTrackBtn.disabled = true;
    ui.chooseSextilhaTrackBtn.textContent = "Abrindo caderno...";
    try {
      await openSextilhaDashboard();
    } catch (error) {
      window.alert(error?.message || "Não foi possível abrir o caderno agora.");
      showTrackChooser();
    } finally {
      ui.chooseSextilhaTrackBtn.disabled = false;
      ui.chooseSextilhaTrackBtn.textContent = originalLabel;
    }
  });
}

if (ui.chooseLevel2TrackBtn) {
  ui.chooseLevel2TrackBtn.addEventListener("click", openLevel2Preview);
}

if (ui.playerUnlockLevel2Btn) {
  ui.playerUnlockLevel2Btn.addEventListener("click", unlockLevel2FromPlayerPanel);
}

if (ui.playerGoLevel1Btn) {
  ui.playerGoLevel1Btn.addEventListener("click", startGameTrack);
}

if (ui.playerGoLevel2Btn) {
  ui.playerGoLevel2Btn.addEventListener("click", openLevel2Preview);
}

if (ui.refreshPlayerPanelBtn) {
  ui.refreshPlayerPanelBtn.addEventListener("click", () => {
    refreshPlayerPanelData({ toast: true });
  });
}

if (ui.playerLevel2Results) {
  ui.playerLevel2Results.addEventListener("click", (event) => {
    handlePlayerResultAction(event).catch((error) => {
      console.error(error);
      showToast(error?.message || "Não foi possível preparar este texto.", "muted");
    });
  });
}

if (ui.level2PreviewBackBtn) {
  ui.level2PreviewBackBtn.addEventListener("click", () => {
    stopLevel2Audio();
    openQuadraLevelChooser();
  });
}

if (ui.level2StartBtn) {
  ui.level2StartBtn.addEventListener("click", startLevel2Match);
}

if (ui.level2SubmitOriginalBtn) {
  ui.level2SubmitOriginalBtn.addEventListener("click", submitLevel2Original);
}

if (ui.level2FinalizeRoundBtn) {
  ui.level2FinalizeRoundBtn.addEventListener("click", finalizeLevel2Round);
}

if (ui.level2NextRoundBtn) {
  ui.level2NextRoundBtn.addEventListener("click", goToNextLevel2Round);
}

if (ui.level2PrimaryActionBtn) {
  ui.level2PrimaryActionBtn.addEventListener("click", handleLevel2PrimaryAction);
}

if (ui.level2OriginalInput) {
  ui.level2OriginalInput.addEventListener("input", () => {
    state.level2.originalQuadra = normalizeLevel2QuadraInput(ui.level2OriginalInput.value);
    saveLevel2SessionSnapshot();
  });
}

if (ui.level2FinalInput) {
  ui.level2FinalInput.addEventListener("input", () => {
    state.level2.finalQuadra = normalizeLevel2QuadraInput(ui.level2FinalInput.value);
    saveLevel2SessionSnapshot();
  });
}

if (ui.level2ResetBtn) {
  ui.level2ResetBtn.addEventListener("click", resetLevel2Match);
}

if (ui.trackChooserBackBtn) {
  ui.trackChooserBackBtn.addEventListener("click", () => {
    returnToIdentityStep();
  });
}

if (ui.btnBackToTrackChooser) {
  ui.btnBackToTrackChooser.addEventListener("click", showTrackChooser);
}

if (ui.btnCreateText) {
  ui.btnCreateText.addEventListener("click", async () => {
    try {
      await createNewSextilha();
    } catch (error) {
      if (ui.dashboardTextList) {
    ui.dashboardTextList.innerHTML = `<div class="workspace-empty">${escapeHtml(error?.message || "Não foi possível criar a sextilha agora.")}</div>`;
      }
    }
  });
}

if (ui.btnCreateFolheto) {
  ui.btnCreateFolheto.addEventListener("click", () => {
    createNewFolheto().catch((error) => {
    setEditorFeedback(error?.message || "Não foi possível criar o folheto agora.", "error");
    });
  });
}

if (ui.btnCreateTextInFolheto) {
  ui.btnCreateTextInFolheto.addEventListener("click", async () => {
    try {
      await createNewSextilha({ folheto: state.activeFolheto });
    } catch (error) {
      if (ui.folhetoTextList) {
    ui.folhetoTextList.innerHTML = `<div class="workspace-empty">${escapeHtml(error?.message || "Não foi possível criar a sextilha neste folheto.")}</div>`;
      }
    }
  });
}

if (ui.dashboardStatusFilter) {
  ui.dashboardStatusFilter.addEventListener("change", renderDashboardTexts);
}

if (ui.dashboardTextList) {
  ui.dashboardTextList.addEventListener("click", (event) => {
    handleDashboardTextAction(event).catch((error) => {
      if (ui.dashboardTextList) {
    ui.dashboardTextList.innerHTML = `<div class="workspace-empty">${escapeHtml(error?.message || "Não foi possível carregar este texto.")}</div>`;
      }
    });
  });
}

if (ui.folhetoTextList) {
  ui.folhetoTextList.addEventListener("click", (event) => {
    handleDashboardTextAction(event).catch((error) => {
      if (ui.folhetoTextList) {
    ui.folhetoTextList.innerHTML = `<div class="workspace-empty">${escapeHtml(error?.message || "Não foi possível carregar esta sextilha.")}</div>`;
      }
    });
  });
}

if (ui.btnBackToDashboardFromFolheto) {
  ui.btnBackToDashboardFromFolheto.addEventListener("click", () => {
    openSextilhaDashboard().catch((error) => {
    setEditorFeedback(error?.message || "Não foi possível voltar ao caderno.", "error");
    });
  });
}

if (ui.btnBackToDashboard) {
  ui.btnBackToDashboard.addEventListener("click", async () => {
    try {
      if (state.activeFolhetoId) {
        await openFolhetoWorkspace(state.activeFolhetoId);
        return;
      }
      await openSextilhaDashboard();
    } catch (error) {
    setEditorFeedback(error?.message || "Não foi possível voltar ao caderno.", "error");
    }
  });
}

if (ui.btnSaveTextVersion) {
  ui.btnSaveTextVersion.addEventListener("click", () => {
    saveCurrentTextVersion("draft");
  });
}

if (ui.btnFinalizeText) {
  ui.btnFinalizeText.addEventListener("click", () => {
    saveCurrentTextVersion("finalize");
  });
}

if (ui.btnResendSocialEmail) {
  ui.btnResendSocialEmail.addEventListener("click", () => {
    resendSocialPostcardEmail();
  });
}

if (ui.btnRequestReopen) {
  ui.btnRequestReopen.addEventListener("click", () => {
    requestTextReopen().catch((error) => {
      setEditorFeedback(error?.message || "Não foi possível registrar o pedido de reabertura.", "error");
    });
  });
}

if (ui.btnArchiveText) {
  ui.btnArchiveText.addEventListener("click", () => {
    archiveCurrentText().catch((error) => {
      setEditorFeedback(error?.message || "Não foi possível arquivar este texto.", "error");
    });
  });
}

if (ui.btnOpenVersionHistory) {
  ui.btnOpenVersionHistory.addEventListener("click", () => {
    openVersionHistory().catch((error) => {
      setEditorFeedback(error?.message || "Não foi possível abrir o histórico.", "error");
    });
  });
}

if (ui.btnBackToEditor) {
  ui.btnBackToEditor.addEventListener("click", async () => {
    if (state.activeTextId) {
      await openSextilhaEditor(state.activeTextId, state.draftVersionSource);
    }
  });
}

if (ui.btnBackToDashboardFromVersions) {
  ui.btnBackToDashboardFromVersions.addEventListener("click", async () => {
    try {
      if (state.activeFolhetoId) {
        await openFolhetoWorkspace(state.activeFolhetoId);
        return;
      }
      await openSextilhaDashboard();
    } catch (error) {
      if (ui.versionHistoryList) {
        ui.versionHistoryList.innerHTML = `<div class="workspace-empty">${escapeHtml(error?.message || "Não foi possível voltar ao caderno.")}</div>`;
      }
    }
  });
}

if (ui.versionHistoryList) {
  ui.versionHistoryList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    if (button.dataset.action === "restore-version") {
      restoreVersionToEditor(button.dataset.versionId || "");
      return;
    }
    if (button.dataset.action === "toggle-compare") {
      toggleVersionCompareSelection(button.dataset.versionId || "");
    }
  });
}

if (ui.versionComparePanel) {
  ui.versionComparePanel.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='clear-compare']");
    if (!button) return;
    clearVersionCompareSelection();
  });
}

getSextilhaVerseInputs().forEach((input) => {
  if (!input) return;
  input.addEventListener("input", () => {
    updateSextilhaIndicators();
    syncEditorInannaPresence();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    const currentIndex = getSextilhaVerseInputs().indexOf(input);
    focusNextVerseInput(currentIndex);
  });
});

[ui.editorTitleInput, ui.editorThemeInput, ui.editorNoteInput, ui.editorSharedWithEducator]
  .filter(Boolean)
  .forEach((input) => {
    input.addEventListener("input", () => {
      updateSextilhaIndicators();
      syncEditorInannaPresence();
    });
    input.addEventListener("change", () => {
      updateSextilhaIndicators();
      syncEditorInannaPresence();
    });
  });

getSextilhaVerseMeterButtons().forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.verseMeter || "-1");
    if (index < 0) return;
    toggleVerseWarningMuted(index);
  });
});

// ── Placar e Envio ───────────────────────────────────────────────────
function normalizePlacarReactionState(item) {
  const counts = item?.reactions || {};
  const viewer = item?.viewerReactions || {};

  return {
    counts: {
      thumb: Number(counts.thumb || 0),
      heart: Number(counts.heart || 0),
      wow: Number(counts.wow || 0),
      total: Number(counts.total || 0),
    },
    viewer: {
      thumb: Number(viewer.thumb || 0),
      heart: Number(viewer.heart || 0),
      wow: Number(viewer.wow || 0),
      total: Number(viewer.total || 0),
    },
  };
}

function renderPlacarReactionControls(item) {
  const entryKey = String(item?.entryKey || "").trim();
  if (!entryKey) return "";

  const reactionState = normalizePlacarReactionState(item);
  const viewerTotal = Math.min(PLACAR_REACTION_LIMIT, reactionState.viewer.total);
  const remaining = Math.max(0, PLACAR_REACTION_LIMIT - viewerTotal);

  const buttons = PLACAR_REACTIONS.map((reaction) => {
    const count = Number(reactionState.counts[reaction.key] || 0);
    const viewerCount = Number(reactionState.viewer[reaction.key] || 0);
    const disabled = remaining <= 0 ? " disabled" : "";
    const usedClass = viewerCount > 0 ? " is-used" : "";
    const reactionWord = count === 1 ? "reação" : "reações";
    const title = remaining > 0
      ? `${reaction.label}: ${count} ${reactionWord}`
      : "Limite de 3 reações atingido nesta quadra";

    return `
      <button class="placar-reaction-btn${usedClass}" type="button"
        data-action="placar-reaction"
        data-entry-key="${escapeHtml(entryKey)}"
        data-reaction="${escapeHtml(reaction.key)}"
        aria-label="${escapeHtml(title)}"
        title="${escapeHtml(title)}"${disabled}>
        <span class="placar-reaction-emoji" aria-hidden="true">${reaction.emoji}</span>
        <span class="placar-reaction-count">${count}</span>
      </button>
    `;
  }).join("");

  return `
    <div class="placar-reactions" data-entry-key="${escapeHtml(entryKey)}">
      <div class="placar-reaction-buttons">${buttons}</div>
      <span class="placar-reaction-quota" title="Reações usadas neste navegador">${viewerTotal}/${PLACAR_REACTION_LIMIT}</span>
    </div>
  `;
}

function renderPlacarItems(data) {
  ui.placarList.innerHTML = "";
  if (ui.fullPlacarList) ui.fullPlacarList.innerHTML = "";

  if (!data || data.length === 0) {
    ui.placarList.innerHTML = "<p style='text-align: center; color: var(--muted); margin-top:20px;'>Ainda não há destaques.</p>";
    if (ui.fullPlacarList) ui.fullPlacarList.innerHTML = "<p style='text-align: center; color: var(--muted); margin-top:20px;'>Ainda não há destaques.</p>";
    return;
  }

  function toTimestamp(value) {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }

  // Ordenar por pontos; em empate, vence o registro mais recente.
  const sortedData = [...data].sort((a, b) => {
    const ptsA = typeof a.pontos === "number" ? a.pontos : parseInt(a.pontos, 10) || 0;
    const ptsB = typeof b.pontos === "number" ? b.pontos : parseInt(b.pontos, 10) || 0;
    if (ptsB !== ptsA) return ptsB - ptsA;
    return toTimestamp(b.timestamp) - toTimestamp(a.timestamp);
  });

  // Reindexar posições baseadas nos pontos
  sortedData.forEach((item, index) => {
    item.posicao = (index + 1) + "º";
  });

  const topVisible = sortedData.slice(0, PLACAR_VISIBLE_LIMIT);
  const topPreview = topVisible.slice(0, PLACAR_PREVIEW_LIMIT);

  const populateList = (list, container) => {
    container.innerHTML = "";
    list.forEach((item, i) => {
      const medal = i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : "";
      const div = document.createElement("div");
      div.className = "placar-item";
      div.innerHTML = `
        <div class="placar-header">
          <span class="placar-pos">${medal}${i + 1}º</span>
          <span class="placar-pontos">${(Number(item.pontos) || 0) + ' pts'}</span>
        </div>
        <div class="placar-autor">${escapeHtml(item.autor)}</div>
        <div class="placar-verso">${renderQuadraVerses(item.verso)}</div>
        ${renderPlacarReactionControls(item)}
      `;
      container.appendChild(div);
    });
  };

  populateList(topPreview, ui.placarList);
  if (ui.fullPlacarList) populateList(topVisible, ui.fullPlacarList);
}

async function loadPlacar() {
  if (!window.InannaSupabaseBridge?.isConfigured?.()) {
    renderPlacarItems(PLACAR_LIBRARY);
    const aviso = document.createElement("p");
    aviso.style.cssText = "text-align:center;color:var(--muted);font-size:12px;margin-top:10px;";
    aviso.textContent = "Modo local. Configure o Supabase para ler o placar de producao.";
    ui.placarList.appendChild(aviso);
    return;
  }

  ui.placarList.innerHTML = "<p style='text-align: center; color: var(--muted); margin-top:20px;'>Carregando placar...</p>";

  try {
    const data = await window.InannaSupabaseBridge.loadPlacar(getPlacarReactionViewerKey());
    renderPlacarItems(data);
  } catch (err) {
    console.error(err);
    const message = err && err.message ? err.message : "Erro ao conectar com o Supabase.";
    ui.placarList.innerHTML = `<p style='text-align: center; color: var(--danger); margin-top:20px;'>${escapeHtml(message)}</p>`;
  }
}
ui.btnRefreshPlacar.addEventListener("click", loadPlacar);

async function handlePlacarReactionClick(button) {
  const entryKey = String(button?.dataset?.entryKey || "").trim();
  const reaction = String(button?.dataset?.reaction || "").trim();
  if (!entryKey || !reaction || button.disabled) return;

  const controls = button.closest(".placar-reactions");
  const allButtons = controls ? Array.from(controls.querySelectorAll("button")) : [button];
  allButtons.forEach((item) => { item.disabled = true; });
  if (controls) controls.classList.add("is-loading");

  try {
    assertSupabaseBackendConfigured();
    const result = await window.InannaSupabaseBridge.reactPlacar({
      entryKey,
      reaction,
      viewerKey: getPlacarReactionViewerKey(),
      participantId: state.participantId || state.playerData?.participantId || "",
      checkinUserId: state.checkinUserId || state.playerData?.checkinUserId || "",
      appVariant: APP_VARIANT,
    });

    if (Array.isArray(result?.placar)) {
      renderPlacarItems(result.placar);
    } else {
      await loadPlacar();
    }
    showToast("Reação registrada no placar.", "success", { duration: 1600 });
  } catch (error) {
    console.error(error);
    showToast(error?.message || "Não foi possível registrar a reação.", "error", { duration: 3200 });
    allButtons.forEach((item) => { item.disabled = false; });
    if (controls) controls.classList.remove("is-loading");
  }
}

[ui.placarList, ui.fullPlacarList].filter(Boolean).forEach((container) => {
  container.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='placar-reaction']");
    if (!button || !container.contains(button)) return;
    event.preventDefault();
    event.stopPropagation();
    handlePlacarReactionClick(button);
  });
});

ui.btnSubmitPoem.addEventListener("click", async () => {
  if (!state.playerData) return;
  // Convidado não persiste no placar (sem identidade): convida ao check-in.
  if (state.isGuest) {
    showToast(
      "Faça o check-in com seu e-mail para enviar ao placar e salvar esta quadra.",
      "primary",
      { duration: 5000 }
    );
    return;
  }
  const textoQuada = ui.quadra.textContent.trim();
  if (!textoQuada) return;

  ui.btnSubmitPoem.disabled = true;
  ui.btnSubmitPoem.textContent = "⏳ Enviando...";
  ui.submitResponse.style.display = "block";
  ui.submitResponse.style.color = "var(--text)";
  ui.submitResponse.textContent = "Processando...";

  const tempoEscritaMs = getWritingElapsedMs();
  const payload = {
    appVariant: APP_VARIANT,
    nome: state.name || state.playerData.nome,
    name: state.name || state.playerData.nome,
    email: state.email || state.playerData.email,
    tipoAcesso: state.playerData.tipoAcesso,
    participantId: state.participantId || state.playerData.participantId || "",
    checkinUserId: state.checkinUserId || state.playerData.checkinUserId || "",
    checkinMatchStatus: state.checkinMatchStatus || state.playerData.checkinMatchStatus || "",
    checkinMatchMethod: state.checkinMatchMethod || state.playerData.checkinMatchMethod || "",
    teacherGroup: state.teacherGroup || state.playerData.teacherGroup || "",
    municipio: state.municipio || state.playerData.municipio || "",
    estado: state.estadoUF || state.playerData.estado || "",
    pais: state.pais || state.playerData.pais || "BR",
    oficinaCordel20: state.oficinaCordel20 ?? state.playerData.oficinaCordel20 ?? null,
    usouChatbotIa: state.usouChatbotIa ?? state.playerData.usouChatbotIa ?? null,
    genero: state.genero || state.playerData.genero || "",
    identificacaoRacial: state.identificacaoRacial || state.playerData.identificacaoRacial || "",
    faixaEtaria: state.faixaEtaria || state.playerData.faixaEtaria || "",
    origem: state.origem || state.playerData.origem || "",
    verso: textoQuada,
    modo: state.modeChallenge ? "Desafio" : "Didático",
    tema: state.chosenTheme ? (state.chosenTheme.id || state.chosenTheme.name || "") : "",
    pontos: state.points,
    esquemaRima: state.rhyme ? state.rhyme.label : "—",
    pontosRima: state.scoreBreakdown ? state.scoreBreakdown.rhyme.pairScoreTotal : 0,
    pontosForma: state.scoreBreakdown ? state.scoreBreakdown.structure.points : 0,
    pontosCriatividade: state.scoreBreakdown ? state.scoreBreakdown.creativity.bonus : 0,
    bonusEsquema: state.scoreBreakdown ? state.scoreBreakdown.rhyme.schemeBonus : 0,
    pontosIndependencia: state.scoreBreakdown ? state.scoreBreakdown.independence.bonus : 0,
    pontosOriginalidade: state.scoreBreakdown ? state.scoreBreakdown.originality.bonus : 0,
    rubricaPontuacao: state.scoreBreakdown ? {
      version: "inanna-prosa-v1",
      level: INANNA_LEVEL,
      expectedScheme: state.scoreBreakdown.rhyme.expectedScheme,
      bestDetectedScheme: state.scoreBreakdown.rhyme.bestDetectedScheme,
      rhymePairScores: state.scoreBreakdown.rhyme.pairScores,
      independence: state.scoreBreakdown.independence,
      originality: state.scoreBreakdown.originality
    } : null,
    tempoEscritaMs,
    tempoEscritaFormatado: formatElapsedClock(tempoEscritaMs)
  };

  try {
    assertSupabaseBackendConfigured();
    const submitResult = await window.InannaSupabaseBridge.submitQuadra(payload);
    ui.submitResponse.style.color = "var(--accent)";
    ui.submitResponse.textContent = "✅ Quadra enviada para o Supabase!";
    ui.btnSubmitPoem.textContent = "🚀 Quadra Enviada";
    await loadPlacar();
    await maybeMintFolheto(submitResult?.quadraId);
  } catch (err) {
    console.error(err);
    ui.submitResponse.style.color = "var(--danger)";
    ui.submitResponse.textContent = "❌ Falha ao enviar, verifique o console.";
    ui.btnSubmitPoem.disabled = false;
    ui.btnSubmitPoem.textContent = "🚀 Tentar Novamente";
  }
});

// ── Copiar quadra ─────────────────────────────────────────────────────
function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }

  document.body.removeChild(textarea);
  return copied;
}

function showCopyFeedback(label, disabledFor) {
  if (!ui.copyQuadra) return;
  const originalLabel = ui.copyQuadra.dataset.originalLabel || ui.copyQuadra.textContent;
  ui.copyQuadra.dataset.originalLabel = originalLabel;
  ui.copyQuadra.textContent = label;
  ui.copyQuadra.disabled = true;

  window.setTimeout(() => {
    ui.copyQuadra.textContent = originalLabel;
    ui.copyQuadra.disabled = false;
  }, disabledFor || 1500);
}

async function onCopyQuadra() {
  const text = (ui.quadra.textContent || "").trim();
  if (!text) {
    setExplain("Escreva a quadra antes de copiar.");
    return;
  }

  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const copied = fallbackCopyText(text);
      if (!copied) throw new Error("Clipboard fallback falhou");
    }

    setExplain("📋 Quadra copiada para a área de transferência!");
    showCopyFeedback("✅ Copiado!", 1400);
  } catch (error) {
    console.error(error);
    setExplain("❌ Não foi possível copiar automaticamente.");
    showCopyFeedback("❌ Falhou", 1600);
  }
}

// ── Novo poema / reiniciar ────────────────────────────────────────────
function onContinueQuadra() {
  refreshSuggestedScheme();
  resetQuadraState({ resetPoints: true, restartTimer: true });
  goToPhase(2);
}

function onNewPoem() {
  state.chosenTheme = null;
  state.scheme = "Livre";
  ui.selectedThemeName.textContent = "—";
  ui.verseInput.placeholder = "Ex.: No São João eu vi a fogueira";
  resetQuadraState({ resetPoints: true, restartTimer: false });
  buildThemeGrid();
  goToPhase(1);
}

// ── Modos ─────────────────────────────────────────────────────────────
function syncModes() {
  state.modeChallenge = !!ui.modeChallenge.checked;
  if (ui.challengeStatus) {
    ui.challengeStatus.textContent = state.modeChallenge ? "[ ON ]" : "[ OFF ]";
    ui.challengeStatus.style.color = state.modeChallenge ? "var(--accent)" : "var(--primary)";
  }
  if (!state.modeChallenge) {
    state.points = 0;
    ui.points.textContent = "0";
  }
}

// ── Eventos ───────────────────────────────────────────────────────────
ui.btnAnalyze.addEventListener("click", onAnalyze);
ui.verseInput.addEventListener("keydown", e => { if (e.key === "Enter") onAnalyze(); });
ui.verseInput.addEventListener("input", updateVerseBlankPreview);
ui.btnCustom.addEventListener("click", onCustomChoice);
ui.customInput.addEventListener("keydown", e => { if (e.key === "Enter") onCustomChoice(); });
ui.btnBack.addEventListener("click", () => goToPhase(2));
if (ui.btnStopGameSession) {
  ui.btnStopGameSession.addEventListener("click", stopGameSessionAndReturnToMenu);
}
ui.copyQuadra.addEventListener("click", onCopyQuadra);
ui.btnContinueQuadra.addEventListener("click", onContinueQuadra);
ui.btnNewPoem.addEventListener("click", onNewPoem);
ui.modeChallenge.addEventListener("change", syncModes);

// Mostrar regras do desafio
if (ui.challengeScore && ui.rulesModal) {
  ui.challengeScore.addEventListener("click", () => {
    ui.rulesModal.showModal();
  });
}
if (ui.closeRules && ui.rulesModal) {
  ui.closeRules.addEventListener("click", () => {
    ui.rulesModal.close();
  });
}

// Modal Placar Top 20
function openPlacarModal() {
  if (ui.placarModal) ui.placarModal.showModal();
}

if (ui.rankingArea && ui.placarModal) {
  ui.rankingArea.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    openPlacarModal();
  });
  ui.rankingArea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      if (event.target.closest("button")) return;
      event.preventDefault();
      openPlacarModal();
    }
  });
}
if (ui.closePlacar && ui.placarModal) {
  ui.closePlacar.addEventListener("click", () => {
    ui.placarModal.close();
  });
}

if (ui.closeVector && ui.vectorModal) {
  ui.closeVector.addEventListener("click", () => {
    ui.vectorModal.close();
  });
  ui.vectorModal.addEventListener("click", (event) => {
    if (event.target === ui.vectorModal) {
      ui.vectorModal.close();
    }
  });
}

if (ui.openPedagogy) {
  ui.openPedagogy.addEventListener("click", () => {
    openPedagogyModal();
  });
}

if (ui.openPedagogyFromVector) {
  ui.openPedagogyFromVector.addEventListener("click", () => {
    openPedagogyModal();
  });
}

if (ui.closePedagogy && ui.pedagogyModal) {
  ui.closePedagogy.addEventListener("click", () => {
    ui.pedagogyModal.close();
  });
  ui.pedagogyModal.addEventListener("click", (event) => {
    if (event.target === ui.pedagogyModal) {
      ui.pedagogyModal.close();
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────────
if (ui.modeChallenge) {
  ui.modeChallenge.checked = state.modeChallenge;
}
syncModes();
buildThemeGrid();
updateVerseBlankPreview();
updateRoundStatus();
refreshWritingTimerUI();
if (!state.playerData) {
  goToPhase(0);
} else {
  showTrackChooser();
}
updateSextilhaIndicators();
updateWelcomeIdentityUI();
loadPlacar();
