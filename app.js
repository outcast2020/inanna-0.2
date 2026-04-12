// =====================================================================
// Inanna — Proto-IA Educativa (Cordel 2.0)
// Novo fluxo de jogo:
//  ETAPA 1: Usuário escolhe um contexto (tema)
//  ETAPA 2: Usuário escreve um verso incompleto usando ___ como lacuna
//  ETAPA 3: Sistema prevê candidatos com probabilidades; usuário escolhe
//            um dos candidatos OU digita a própria palavra
//  O ciclo se repete até completar 4 versos (quadra).
// =====================================================================

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
  playerName: $("playerName"),
  playerEmail: $("playerEmail"),
  playerType: $("playerType"),
  verifyCheckinBtn: $("verifyCheckinBtn"),
  welcomeIdentity: $("welcomeIdentity"),
  startHint: $("startHint"),
  btnSubmitPoem: $("btnSubmitPoem"),
  submitResponse: $("submitResponse"),
  placarList: $("placarList"),
  btnRefreshPlacar: $("btnRefreshPlacar"),
  rankingArea: $("rankingArea"),

  // trilhas
  trackChooserSection: $("trackChooserSection"),
  chooseGameTrackBtn: $("chooseGameTrackBtn"),
  chooseSextilhaTrackBtn: $("chooseSextilhaTrackBtn"),
  trackChooserBackBtn: $("trackChooserBackBtn"),
  userDashboardSection: $("userDashboardSection"),
  dashboardGreeting: $("dashboardGreeting"),
  dashboardTextCount: $("dashboardTextCount"),
  dashboardCompletedCount: $("dashboardCompletedCount"),
  dashboardLastEdited: $("dashboardLastEdited"),
  dashboardStatusFilter: $("dashboardStatusFilter"),
  dashboardTextList: $("dashboardTextList"),
  btnCreateText: $("btnCreateText"),
  btnBackToTrackChooser: $("btnBackToTrackChooser"),
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
  editorStatusSelect: $("editorStatusSelect"),
  editorSharedWithEducator: $("editorSharedWithEducator"),
  btnSaveTextVersion: $("btnSaveTextVersion"),
  btnArchiveText: $("btnArchiveText"),
  btnBackToDashboard: $("btnBackToDashboard"),
  btnOpenVersionHistory: $("btnOpenVersionHistory"),
  editorSaveMessage: $("editorSaveMessage"),
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
    pred: null,       // resultado de buildPredictions
  },
  points: 0,
  scheme: "Livre",
  modeChallenge: false,
  rhyme: null,
  scoreBreakdown: null,
  writingStartedAt: 0,
  writingElapsedMs: 0,
  writingTimerId: null,
  writingTimerRunning: false,
  userDashboard: null,
  userTexts: [],
  dashboardFilter: "all",
  activeTextId: "",
  activeText: null,
  activeTextVersions: [],
  versionCompareSelection: [],
  draftVersionSource: null,
  sextilhaStoreStatus: "idle",
  firebaseSessionReady: false,
  lastAiFeedback: null,
  aiFeedbackRequestKey: "",
};

// COLOQUE AQUI A URL GERADA NO DEPLOY DO SEU GOOGLE APPS SCRIPT
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyXBAC8UM9WhgRzcOBvHZjVx1RIv7zvjiW6GVlWYJroH7igPq30DVtbbhEZ5YWJzIZ9/exec";
const APP_VARIANT = "inanna-main";
const FIREBASE_SEXTILHA_MODE = "firestore";
const SEXTILHA_STATUS_LABELS = {
  "rascunho": "Rascunho",
  "em revisao": "Em revisao",
  "concluida": "Concluida",
  "compartilhada com educador": "Compartilhada com educador",
  "selecionada para antologia": "Selecionada para antologia",
  "arquivada": "Arquivada"
};

function getConfiguredSextilhaDataSource() {
  const configuredMode = String(window.INANNA_FIREBASE_OPTIONS?.mode || "").trim().toLowerCase();
  if (configuredMode === FIREBASE_SEXTILHA_MODE && window.InannaFirebaseBridge?.isConfigured?.()) {
    return FIREBASE_SEXTILHA_MODE;
  }
  return "apps-script";
}

// ── Banco de Curadoria Local (Fallback/Library Pré-Programado) ────────
// Caso a planilha não esteja conectada, o administrador pode adicionar 
// ganhadores diretamente neste Array abaixo, colar Posicao, Nome, Pontos e Verso.
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

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
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
    ui.userDashboardSection,
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

async function fetchAppGet(action, params = {}) {
  const query = new URLSearchParams({
    action,
    t: String(Date.now()),
    ...params,
  });
  const response = await fetch(`${WEB_APP_URL}?${query.toString()}`);
  const payload = await response.json();
  if (payload?.status === "error" || payload?.error) {
    throw new Error(payload?.message || payload?.error || "Erro ao consultar o backend.");
  }
  return payload;
}

async function postAppAction(action, payload = {}) {
  const response = await fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify({
      action,
      ...payload,
    }),
  });
  const result = await response.json();
  if (result?.status === "error" || result?.error) {
    throw new Error(result?.message || result?.error || "Erro ao salvar no backend.");
  }
  return result;
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

function renderEditorAiFeedback(feedback) {
  if (!ui.editorAiFeedback) return;

  if (!feedback || !feedback.message) {
    ui.editorAiFeedback.className = "ai-feedback-card ai-feedback-card--idle";
    ui.editorAiFeedback.innerHTML = `
      <strong>Feedback breve</strong>
      <p>Salve uma versao para receber uma devolutiva curta e encorajadora da Inanna.</p>
    `;
    return;
  }

  const toneClass = feedback.tone === "error"
    ? "ai-feedback-card--error"
    : feedback.tone === "loading"
      ? "ai-feedback-card--loading"
      : "";
  const label = feedback.tone === "loading"
    ? "Inanna esta lendo"
    : feedback.source === "gemini"
      ? "Inanna + Gemini"
      : "Inanna acompanha";
  ui.editorAiFeedback.className = `ai-feedback-card ${toneClass}`.trim();
  ui.editorAiFeedback.innerHTML = `
    <strong>${escapeHtml(label)}</strong>
    <p>${escapeHtml(feedback.message)}</p>
  `;
}

function buildDashboardPayloadFromState() {
  const texts = [...state.userTexts].sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  return {
    status: "success",
    textCount: texts.length,
    completedCount: texts.filter((text) => normalizeStatusValue(text.status) === "concluida").length,
    lastEditedAt: texts[0]?.updatedAt || "",
    texts,
  };
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
  state.userDashboard = buildDashboardPayloadFromState();
}

function beginSaveDraftProgressiveFeedback() {
  if (!ui.btnSaveTextVersion) {
    return () => {};
  }

  ui.btnSaveTextVersion.disabled = true;
  ui.btnSaveTextVersion.textContent = "Salvando rascunho...";

  return () => {
    if (ui.btnSaveTextVersion) {
      ui.btnSaveTextVersion.disabled = false;
      ui.btnSaveTextVersion.textContent = "Salvar rascunho";
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

  const requestKey = `${textId}:${versionId}:${Date.now()}`;
  const versionLabel = buildSextilhaVersionLabel(payload);
  state.aiFeedbackRequestKey = requestKey;
  renderEditorAiFeedback({
    source: "inanna",
    tone: "loading",
    message: "Inanna esta lendo seu rascunho com calma para deixar um comentario breve e sutil.",
  });

  try {
    const response = await generateSextilhaTextFeedbackRecord(payload || { textId, versionId });
    if (!shouldApplyAiFeedbackResponse(requestKey, textId, versionId)) return;

    state.lastAiFeedback = response?.aiFeedback || null;
    if (state.lastAiFeedback?.message) {
      renderEditorAiFeedback(state.lastAiFeedback);
      setEditorFeedback(`${versionLabel} salva e devolutiva recebida.`, "success");
      return;
    }

    state.lastAiFeedback = null;
    renderEditorAiFeedback(null);
  } catch (error) {
    if (!shouldApplyAiFeedbackResponse(requestKey, textId, versionId)) return;
    setEditorFeedback(`${versionLabel} salva. A devolutiva ainda nao chegou.`, "muted");
    renderEditorAiFeedback({
      tone: "error",
      message: error?.message || "A Inanna nao conseguiu responder agora, mas o rascunho foi salvo.",
    });
  }
}

async function ensureFirebaseSextilhaSession() {
  if (getConfiguredSextilhaDataSource() !== FIREBASE_SEXTILHA_MODE) {
    return { provider: "apps-script" };
  }

  const identity = buildIdentityPayload();
  if (window.InannaFirebaseBridge?.hasActiveSession?.(identity.participantId)) {
    state.firebaseSessionReady = true;
    state.sextilhaStoreStatus = FIREBASE_SEXTILHA_MODE;
    return { provider: FIREBASE_SEXTILHA_MODE };
  }

  const tokenPayload = await fetchAppGet("get_firebase_custom_token", identity);
  await window.InannaFirebaseBridge.initializeSession({
    customToken: tokenPayload?.customToken,
    identity,
  });

  state.firebaseSessionReady = true;
  state.sextilhaStoreStatus = FIREBASE_SEXTILHA_MODE;

  return tokenPayload;
}

async function runSextilhaStoreOperation(operationName, appsScriptFn, firebaseFn) {
  if (getConfiguredSextilhaDataSource() !== FIREBASE_SEXTILHA_MODE) {
    state.sextilhaStoreStatus = "apps-script";
    return appsScriptFn();
  }

  try {
    await ensureFirebaseSextilhaSession();
    return await firebaseFn(window.InannaFirebaseBridge);
  } catch (error) {
    console.warn(`[sextilha-store] fallback para Apps Script em ${operationName}`, error);
    state.sextilhaStoreStatus = "apps-script";
    state.firebaseSessionReady = false;
    return appsScriptFn();
  }
}

async function loadUserDashboardData() {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "get_user_dashboard",
    () => fetchAppGet("get_user_dashboard", identity),
    (bridge) => bridge.getUserDashboard(identity)
  );
}

async function createSextilhaTextRecord(payload) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "create_text",
    () => postAppAction("create_text", { ...identity, ...payload }),
    (bridge) => bridge.createText(identity, payload)
  );
}

async function loadSextilhaTextRecord(textId) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "get_text",
    () => fetchAppGet("get_text", { ...identity, textId }),
    (bridge) => bridge.getText(identity, textId)
  );
}

async function saveSextilhaTextVersionRecord(payload) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "save_text_version",
    () => postAppAction("save_text_version", { ...identity, ...payload }),
    (bridge) => bridge.saveTextVersion(identity, payload)
  );
}

async function generateSextilhaTextFeedbackRecord(payload) {
  const identity = buildIdentityPayload();
  return postAppAction("generate_text_feedback", {
    ...identity,
    sourceStore: getConfiguredSextilhaDataSource(),
    ...payload,
  });
}

async function loadSextilhaTextVersionsRecord(textId) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "get_text_versions",
    () => fetchAppGet("get_text_versions", { ...identity, textId }),
    (bridge) => bridge.getTextVersions(identity, textId)
  );
}

async function archiveSextilhaTextRecord(textId, payload = {}) {
  const identity = buildIdentityPayload();
  return runSextilhaStoreOperation(
    "archive_text",
    () => postAppAction("archive_text", { ...identity, textId, ...payload }),
    (bridge) => bridge.archiveText(identity, { textId, ...payload })
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

function clearResolvedCheckinIdentity(nextEmail = "") {
  state.email = String(nextEmail || "").trim();
  state.name = "";
  state.municipio = "";
  state.estadoUF = "";
  state.origem = "";
  state.participantId = "";
  state.checkinUserId = "";
  state.checkinMatchStatus = "";
  state.checkinMatchMethod = "";
  state.teacherGroup = "";
  state.checkinLookupStatus = "idle";
  state.checkinLookupMessage = "";
  state.firebaseSessionReady = false;
  state.lastAiFeedback = null;
  state.aiFeedbackRequestKey = "";
}

function applyResolvedCheckinIdentity(identity) {
  state.name = String(identity?.name || "").trim();
  state.email = String(identity?.email || state.email || "").trim();
  state.municipio = String(identity?.municipio || "").trim();
  state.estadoUF = normalizeUFOrInternational(identity?.estado || "");
  state.origem = normalizeOrigem(identity?.origem || "");
  state.participantId = String(identity?.participantId || "").trim();
  state.checkinUserId = String(identity?.checkinUserId || "").trim();
  state.checkinMatchStatus = String(identity?.status || "matched").trim() || "matched";
  state.checkinMatchMethod = String(identity?.matchMethod || "email").trim() || "email";
  state.teacherGroup = String(identity?.teacherGroup || "").trim();
  state.checkinLookupStatus = "matched";
  state.checkinLookupMessage = "";
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
      state.teacherGroup ? `Turma/oficina: ${escapeHtml(state.teacherGroup)}` : ""
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
    ui.btnStart.disabled = !(state.checkinLookupStatus === "matched" && state.name && state.participantId && state.checkinUserId);
  }
}

function requestCheckinIdentityViaJsonp(email) {
  return new Promise((resolve) => {
    const callbackName =
      "__inannaCheckinCb_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    const params = new URLSearchParams({
      action: "checkin_lookup",
      callback: callbackName,
      email: String(email || "").trim()
    });
    const script = document.createElement("script");
    const mountNode = document.body || document.head || document.documentElement;
    let timer = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (script.parentNode) script.parentNode.removeChild(script);
      try {
        delete window[callbackName];
      } catch (_) {
        window[callbackName] = undefined;
      }
    };

    window[callbackName] = (data) => {
      cleanup();
      resolve(data || { ok: false, status: "error", error: "empty_response" });
    };

    script.onerror = () => {
      cleanup();
      resolve({ ok: false, status: "error", error: "network" });
    };

    timer = window.setTimeout(() => {
      cleanup();
      resolve({ ok: false, status: "error", error: "timeout" });
    }, 15000);

    script.src = `${WEB_APP_URL}?${params.toString()}`;
    mountNode.appendChild(script);
  });
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

  const response = await requestCheckinIdentityViaJsonp(typedEmail);

  if (response?.ok && response?.status === "matched") {
    applyResolvedCheckinIdentity(response);
    updateWelcomeIdentityUI();
    if (ui.btnStart) ui.btnStart.focus();
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
    origem: state.origem
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
  window.scrollTo({ top: 0, behavior: "smooth" });
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
    ui.verseInput.placeholder = "Ex.: Escreva o verso sem a última palavra aqui";
  }
  if (ui.modeChallenge) {
    ui.modeChallenge.checked = false;
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
  return {
    title: ui.editorTitleInput?.value.trim() || "",
    theme: ui.editorThemeInput?.value.trim() || "",
    note: ui.editorNoteInput?.value.trim() || "",
    verses: getSextilhaVerseInputs().map((input) => input?.value.trim() || ""),
    status: normalizeStatusValue(ui.editorStatusSelect?.value || "rascunho"),
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
  return versionNumber ? `Versao ${versionNumber}` : "Rascunho atual";
}

function describeSextilhaBaselineVersion(versionLike) {
  const versionNumber = Number(versionLike?.versionNumber || versionLike?.versionCount || 0);
  return versionNumber ? `a Versao ${versionNumber}` : "este rascunho";
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
  return text?.updatedAt ? formatDateTime(text.updatedAt) : "Ainda sem edicoes";
}

function setEditorFeedback(message, tone = "muted") {
  if (!ui.editorSaveMessage) return;
  ui.editorSaveMessage.textContent = message || "";
  ui.editorSaveMessage.style.color =
    tone === "success" ? "var(--accent)" :
      tone === "error" ? "var(--danger)" :
        "var(--muted)";
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
  return String(value || "").replace(/[.,;:!?]+$/g, "").trim();
}

function parseVerseStem(rawValue) {
  const raw = normalizeSpaces(rawValue);
  if (!raw) {
    return { ok: false, error: "✋ Escreva o começo do verso antes de continuar." };
  }

  const blanks = raw.match(/___/g) || [];
  if (blanks.length > 1) {
    return { ok: false, error: "Use apenas uma lacuna, sempre no fim do verso." };
  }

  if (blanks.length === 1 && !/___$/.test(raw)) {
    return { ok: false, error: "A lacuna precisa ficar na última palavra do verso." };
  }

  const cleaned = stripTrailingVersePunctuation(raw.replace(/___$/, ""));
  if (!cleaned) {
    return { ok: false, error: "Escreva algum contexto antes da lacuna final." };
  }

  return { ok: true, stem: cleaned };
}

function buildRawVerse(stem) {
  return `${normalizeSpaces(stem)} ___`;
}

function updateVerseBlankPreview() {
  if (!ui.verseBlankPreview) return;

  const parsed = parseVerseStem(ui.verseInput.value || "");
  if (!parsed.ok) {
    ui.verseBlankPreview.innerHTML = `
      <span class="preview-muted">Seu verso aparecerá assim:</span>
      <span class="preview-stem">...</span>
      <span class="blank-placeholder fixed">___</span>
    `;
    return;
  }

  ui.verseBlankPreview.innerHTML = `
    <span class="preview-muted">Seu verso ficará assim:</span>
    <span class="preview-stem">${escapeHtml(parsed.stem)}</span>
    <span class="blank-placeholder fixed">___</span>
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
  state.scheme = Math.random() < 0.5 ? "AABB" : "ABAB";
  const schemeSpan = document.getElementById("suggestedScheme");
  if (schemeSpan) schemeSpan.textContent = state.scheme;
}

function resetQuadraState(options) {
  const settings = Object.assign({ resetPoints: true, restartTimer: false }, options);

  state.lines = [];
  state.current = { rawVerse: "", pred: null };
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
function buildThemeGrid() {
  ui.themeGrid.innerHTML = "";
  THEMES.forEach(th => {
    const card = document.createElement("button");
    card.className = "theme-card";
    card.type = "button";
    card.innerHTML = `
      <div class="theme-emoji">${th.emoji}</div>
      <div class="theme-name">${th.name}</div>
      <div class="theme-desc">${th.desc}</div>
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

  // Define o placeholder instigante (armadilha) usando o trap example do objeto
  if (theme.trap) {
    ui.verseInput.placeholder = theme.trap.replace(/\s*___\s*$/, "");
  } else {
    ui.verseInput.placeholder = "Ex.: Escreva o verso sem a última palavra aqui";
  }
  updateVerseBlankPreview();

  goToPhase(2);
}

// ── Etapa 2 — entrada do verso incompleto ────────────────────────────
function onAnalyze() {
  const parsed = parseVerseStem(ui.verseInput.value || "");
  if (!parsed.ok) {
    ui.verseHint.textContent = parsed.error;
    ui.verseHint.style.color = "#f97316";
    return;
  }

  ui.verseInput.value = parsed.stem;
  ui.verseHint.textContent = "A lacuna final será prevista pela Inanna a partir desse contexto.";
  ui.verseHint.style.color = "var(--muted)";
  updateVerseBlankPreview();

  const raw = buildRawVerse(parsed.stem);
  state.current.rawVerse = raw;
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

  // Contexto antes da lacuna
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

  // Preview do verso com lacuna destacada
  const highlighted = escapeHtml(rawVerse).replace("___", `<span class="blank-placeholder">___</span>`);
  ui.versePreview.innerHTML = highlighted;
  const rhymeHint = pred && pred.targetRhymeWord ? ` · rima esperada com "${pred.targetRhymeWord}"` : "";
  ui.contextDetected.textContent = `${theme.emoji} ${theme.name}${rhymeHint}`;
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
    `As probabilidades aparecem na lista principal. Abra o vetor de qualquer palavra ou a mini-aula para ver como a IA organiza números, pesos e chances.`
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
    setExplain("Digite uma palavra para fechar a lacuna final.");
    ui.customInput.focus();
    return;
  }
  if (/\s/.test(word) || word.includes("___")) {
    setExplain("Use apenas uma palavra na lacuna final.");
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
  if (a === b && a.length > 1) return 3;                              // idênticas
  if (a.length >= 3 && b.length >= 3 && a.slice(-3) === b.slice(-3)) return 3;  // 3 letras
  if (a.length >= 2 && b.length >= 2 && a.slice(-2) === b.slice(-2)) return 2;  // 2 letras
  if (a.slice(-1) === b.slice(-1)) return 1;                          // 1 letra
  return -1;
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
    points: goodLines === 4 ? 2 : goodLines >= 3 ? 1 : 0
  };
}

// Analisa o melhor esquema de rima da quadra (4 versos)
function analyzeRhyme(lines) {
  const words = lines.map(function (l) { return lastWordOf(l.verse); });

  const schemes = [
    { id: "AABB", pairs: [[0, 1], [2, 3]], label: "AABB", desc: "Rima em parândo — 1º/2º rimam, 3º/4º rimam" },
    { id: "ABAB", pairs: [[0, 2], [1, 3]], label: "ABAB", desc: "Rima alternada — 1º/3º rimam, 2º/4º rimam" },
    { id: "ABBA", pairs: [[0, 3], [1, 2]], label: "ABBA", desc: "Rima abraçada — 1º/4º rimam, 2º/3º rimam" },
  ];

  var best = null, bestScore = -99, bestPairScores = [];
  schemes.forEach(function (s) {
    var ps = s.pairs.map(function (pair) { return rhymePairScore(words[pair[0]], words[pair[1]]); });
    var total = ps.reduce(function (a, b) { return a + b; }, 0);
    if (total > bestScore) { bestScore = total; best = s; bestPairScores = ps; }
  });

  var allRhyming = bestPairScores.every(function (s) { return s > 0; });
  var strongScheme = bestPairScores.every(function (s) { return s >= 2; });
  var bonus = strongScheme ? 2 : 0;

  return {
    scheme: best.id, label: best.label, desc: best.desc,
    pairs: best.pairs,
    pairScores: bestPairScores,
    words: words,
    pairScoreTotal: bestScore,
    schemeBonus: bonus,
    allRhyming: allRhyming,
    strongScheme: strongScheme
  };
}

function analyzeCreativity(lines, rhyme) {
  if (!rhyme || !rhyme.pairs) {
    return { bonus: 0, creativeIndexes: [] };
  }

  var creativeIndexes = [];
  rhyme.pairs.forEach(function (pair, pairIndex) {
    if ((rhyme.pairScores[pairIndex] || 0) < 2) return;

    pair.forEach(function (lineIndex) {
      var line = lines[lineIndex];
      if (!line || !line.creative) return;
      if (!creativeIndexes.includes(lineIndex)) creativeIndexes.push(lineIndex);
    });
  });

  return {
    bonus: Math.min(2, creativeIndexes.length),
    creativeIndexes: creativeIndexes
  };
}

function calculateChallengeScore(lines) {
  var rhyme = analyzeRhyme(lines);
  var structure = analyzeStructure(lines);
  var creativity = analyzeCreativity(lines, rhyme);
  var total = Math.max(0, structure.points + rhyme.pairScoreTotal + rhyme.schemeBonus + creativity.bonus);

  return {
    rhyme: rhyme,
    structure: structure,
    creativity: creativity,
    total: total
  };
}

// Gera HTML do feedback de rima e pontuação
function rhymeFeedbackHTML(result, challengeMode) {
  var r = result.rhyme;
  function icon(s) { return s >= 3 ? "🔥 +3" : s === 2 ? "✨ +2" : s === 1 ? "👍 +1" : "❌ −1"; }
  var colors = { AABB: "#f97316", ABAB: "#a855f7", ABBA: "#06b6d4" };
  var color = colors[r.scheme] || "var(--primary)";
  var pairsIdx = { AABB: [[0, 1], [2, 3]], ABAB: [[0, 2], [1, 3]], ABBA: [[0, 3], [1, 2]] }[r.scheme];
  var totalColor = result.total >= 9 ? "#22c55e" : result.total >= 5 ? "#f97316" : "#ef4444";

  var pairLines = pairsIdx.map(function (pair, k) {
    return '<div style="margin:4px 0;font-size:13px;">' +
      '<span style="color:var(--muted);">&ldquo;' + r.words[pair[0]] + '&rdquo; ↔ &ldquo;' + r.words[pair[1]] + '&rdquo;</span>' +
      '<strong style="margin-left:8px;">' + icon(r.pairScores[k]) + '</strong></div>';
  }).join("");

  var structureLine = '<div style="margin-top:10px;font-size:13px;color:var(--muted);">Forma da quadra: <strong style="color:var(--text);">+' + result.structure.points + '</strong> (' + result.structure.goodLines + ' versos bem fechados de 4)</div>';
  var schemeLine = r.strongScheme
    ? '<div style="margin-top:8px;font-size:13px;color:#22c55e;">✅ Bônus de esquema forte: <strong>+2</strong> (os dois pares rimam com pelo menos 2 letras finais)</div>'
    : '<div style="margin-top:8px;font-size:13px;color:var(--muted);">Bônus de esquema forte: <strong>+0</strong></div>';
  var creativityLine = result.creativity.bonus > 0
    ? '<div style="margin-top:8px;font-size:13px;color:#06b6d4;">✨ Criatividade autoral: <strong>+' + result.creativity.bonus + '</strong> (palavra fora das sugestões e ainda sustentando a rima)</div>'
    : '<div style="margin-top:8px;font-size:13px;color:var(--muted);">Criatividade autoral: <strong>+0</strong></div>';
  var scoreTitle = challengeMode ? 'Pontuação do Desafio' : 'No Modo Desafio, esta quadra valeria';

  return '<div style="margin-top:18px;padding:14px 18px;background:rgba(255,255,255,0.05);border-radius:12px;border-left:4px solid ' + color + ';">' +
    '<div style="font-weight:800;font-size:15px;margin-bottom:8px;">🎶 Esquema de Rima: <span style="color:' + color + ';">' + r.label + '</span></div>' +
    '<div style="font-size:12px;color:var(--muted);margin-bottom:10px;">' + r.desc + '</div>' +
    pairLines +
    structureLine +
    '<div style="margin-top:8px;font-size:13px;color:var(--muted);">Rima final: <strong style="color:var(--text);">' + (r.pairScoreTotal >= 0 ? "+" : "") + r.pairScoreTotal + '</strong></div>' +
    schemeLine +
    creativityLine +
    '<div style="margin-top:12px;font-size:16px;font-weight:900;color:' + totalColor + ';">' + scoreTitle + ': +' + result.total + '</div>' +
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

  // Analisa rimas, forma e criatividade
  var scoreBreakdown = calculateChallengeScore(state.lines);
  var rhyme = scoreBreakdown.rhyme;
  state.rhyme = rhyme;
  state.scoreBreakdown = scoreBreakdown;
  
  // Detecção de rima (V2)
  state.scheme = detectRhymeScheme(state.lines);
  if (ui.contextDetected) {
    ui.contextDetected.textContent = "Esquema detectado: " + state.scheme;
  }

  // Aplica a nova pontuação estrutural no modo desafio
  if (state.modeChallenge) {
    state.points = scoreBreakdown.total;
    ui.points.textContent = String(state.points);
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
  feedbackEl.innerHTML = rhymeFeedbackHTML(scoreBreakdown, state.modeChallenge);

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

  if (ui.dashboardGreeting) {
    ui.dashboardGreeting.textContent = state.name ? `${state.name}, este e seu caderno` : "Minhas sextilhas";
  }
  if (ui.dashboardTextCount) {
    ui.dashboardTextCount.textContent = String(payload?.textCount || 0);
  }
  if (ui.dashboardCompletedCount) {
    ui.dashboardCompletedCount.textContent = String(payload?.completedCount || 0);
  }
  if (ui.dashboardLastEdited) {
    ui.dashboardLastEdited.textContent = payload?.lastEditedAt ? formatDateTime(payload.lastEditedAt) : "Ainda sem edicoes";
  }
  if (ui.dashboardStatusFilter) {
    ui.dashboardStatusFilter.value = state.dashboardFilter || "all";
  }

  renderDashboardTexts();
}

async function openSextilhaDashboard(options = {}) {
  const settings = { forceRefresh: false, ...options };
  state.selectedTrack = "sextilha";
  hideGameExperience();
  setView("sextilhaDashboard", ui.userDashboardSection);

  if (state.userTexts.length && !settings.forceRefresh) {
    applyDashboardPayload(buildDashboardPayloadFromState());
  } else {
    renderDashboardLoadingSkeleton();
  }

  const payload = await loadUserDashboardData();
  applyDashboardPayload(payload);
}

function renderDashboardTexts() {
  if (!ui.dashboardTextList) return;

  const filterValue = normalizeStatusValue(ui.dashboardStatusFilter?.value || state.dashboardFilter || "all");
  state.dashboardFilter = filterValue;
  const filteredTexts = state.userTexts.filter((text) => {
    if (filterValue === "all") return true;
    return normalizeStatusValue(text.status) === filterValue;
  });

  if (!filteredTexts.length) {
    ui.dashboardTextList.innerHTML = `
      <div class="workspace-empty">
        ${filterValue === "all" ? "Nenhuma sextilha criada ainda. Comece um novo texto para abrir seu caderno." : "Nenhum texto encontrado para este status."}
      </div>
    `;
    return;
  }

  ui.dashboardTextList.innerHTML = filteredTexts.map((text) => `
    <article class="text-card" data-text-id="${escapeHtml(text.textId)}">
      <div class="text-card__head">
        <div>
          <h3 class="text-card__title">${escapeHtml(text.title || "Sextilha sem titulo")}</h3>
          <p class="text-card__meta">
            ${escapeHtml(text.theme || "Tema livre")}<br>
            Ultima edicao: ${escapeHtml(formatTextUpdatedLabel(text))}
          </p>
        </div>
        ${renderStatusBadge(text.status)}
      </div>
      <div class="text-card__indicators">${renderIndicatorChips(text.indicators)}</div>
      <div class="text-card__actions">
        <button class="btn btn-primary" type="button" data-action="open-text" data-text-id="${escapeHtml(text.textId)}">Continuar</button>
        <button class="btn btn-secondary" type="button" data-action="view-versions" data-text-id="${escapeHtml(text.textId)}">Versoes</button>
        <button class="btn btn-ghost" type="button" data-action="archive-text" data-text-id="${escapeHtml(text.textId)}">Arquivar</button>
      </div>
    </article>
  `).join("");
}

async function createNewSextilha() {
  if (ui.btnCreateText) {
    ui.btnCreateText.disabled = true;
    ui.btnCreateText.textContent = "Criando...";
  }

  try {
    const result = await createSextilhaTextRecord({
      title: "",
      theme: "",
      note: "",
      status: "rascunho",
    });
    upsertTextInDashboardState(result?.text);
    state.activeTextId = result?.text?.textId || "";
    await openSextilhaEditor(state.activeTextId);
    setEditorFeedback("Novo rascunho criado. Voce ja pode escrever e salvar.", "success");
  } finally {
    if (ui.btnCreateText) {
      ui.btnCreateText.disabled = false;
      ui.btnCreateText.textContent = "Nova sextilha";
    }
  }
}

async function openSextilhaEditor(textId, draftVersion = null) {
  if (!textId) return;

  state.lastAiFeedback = null;
  state.aiFeedbackRequestKey = "";
  setEditorFeedback("Carregando texto...", "muted");
  renderEditorAiFeedback(state.lastAiFeedback);

  const payload = await loadSextilhaTextRecord(textId);

  state.activeTextId = textId;
  state.activeText = payload?.text || null;
  state.draftVersionSource = draftVersion;
  setView("sextilhaEditor", ui.sextilhaEditorSection);
  fillSextilhaEditor(payload?.text, draftVersion);
}

function fillSextilhaEditor(text, draftVersion = null) {
  const source = draftVersion || text?.latestVersion || text;
  if (!source) return;

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

  if (ui.editorStatusSelect) {
    ui.editorStatusSelect.value = normalizeStatusValue(text?.status || source.status || "rascunho");
  }
  if (ui.editorSharedWithEducator) {
    ui.editorSharedWithEducator.checked = !!source.sharedWithEducator;
  }
  if (ui.editorVersionMeta) {
    ui.editorVersionMeta.textContent = draftVersion?.versionNumber
      ? `Versao ${draftVersion.versionNumber} carregada no editor.`
      : text?.latestVersion?.versionNumber
        ? `Versao ${text.latestVersion.versionNumber} e a mais recente no editor.`
      : text?.versionCount
        ? `${text.versionCount} versoes registradas.`
        : "Versao ainda nao salva.";
  }
  if (ui.editorLastSaved) {
    ui.editorLastSaved.textContent = text?.updatedAt
      ? `Ultima atualizacao: ${formatDateTime(text.updatedAt)}`
      : "Ultima atualizacao: ainda sem registro.";
  }

  renderEditorAiFeedback(state.lastAiFeedback);
  updateSextilhaIndicators();
}

async function saveCurrentTextVersion() {
  if (!state.activeTextId) return;
  const draft = getSextilhaDraft();

  if (!draft.title && !draft.theme && !draft.verses.some(Boolean) && !draft.note) {
    setEditorFeedback("Escreva pelo menos um elemento do texto antes de salvar.", "error");
    return;
  }

  const baselineVersion = getEditorBaselineVersion();
  if (
    baselineVersion &&
    buildComparableSextilhaDraftFingerprint(draft) === buildComparableSextilhaDraftFingerprint(baselineVersion)
  ) {
    setEditorFeedback(`Nenhuma alteracao nova desde ${describeSextilhaBaselineVersion(baselineVersion)}. Ajuste algo antes de salvar outra etapa.`, "muted");
    return;
  }

  const finishSaveFeedback = beginSaveDraftProgressiveFeedback();
  state.aiFeedbackRequestKey = "";

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
    state.activeText = response?.text || state.activeText;
    state.lastAiFeedback = null;
    state.draftVersionSource = null;
    fillSextilhaEditor(state.activeText);
    upsertTextInDashboardState(state.activeText);
    state.activeTextVersions = [savedVersion, ...state.activeTextVersions.filter((version) => version?.versionId !== savedVersion?.versionId)].filter(Boolean);
    setEditorFeedback(`${buildSextilhaVersionLabel(savedVersion)} salva com sucesso.`, "success");
    requestAiFeedbackForVersion(
      response?.text?.textId,
      savedVersion?.versionId,
      buildAiFeedbackRequestPayload(state.activeText, savedVersion)
    );
  } catch (error) {
    setEditorFeedback(error?.message || "Nao foi possivel salvar a versao.", "error");
    if (getConfiguredSextilhaDataSource() !== FIREBASE_SEXTILHA_MODE) {
      renderEditorAiFeedback({
        tone: "error",
        message: "O texto nao recebeu devolutiva agora. Verifique a configuracao da IA no Apps Script.",
      });
    }
  } finally {
    finishSaveFeedback();
  }
}

async function archiveCurrentText() {
  if (!state.activeTextId) return;
  const confirmed = window.confirm("Arquivar este texto sem apagar o historico?");
  if (!confirmed) return;

  const response = await archiveSextilhaTextRecord(state.activeTextId, { status: "arquivada" });
  if (response?.text) {
    upsertTextInDashboardState(response.text);
  }

  await openSextilhaDashboard();
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
          <p class="workspace-kicker">Comparacao de versoes</p>
          <h3>Escolha duas versoes para ver a evolucao lado a lado</h3>
          <p class="workspace-meta">Selecione duas versoes no historico para comparar versos, status e indicadores.</p>
        </div>
        <div class="version-compare__selection">
          ${selectedVersions.length
            ? selectedVersions.map((version) => `<span class="version-compare__pill">Versao ${escapeHtml(version.versionNumber)}</span>`).join("")
            : `<span class="version-compare__hint">Nenhuma versao selecionada ainda.</span>`}
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
          <p class="workspace-kicker">Comparacao de versoes</p>
          <h3>Versao ${escapeHtml(baseVersion.versionNumber)} x Versao ${escapeHtml(currentVersion.versionNumber)}</h3>
          <p class="workspace-meta">Veja como a escrita mudou entre duas etapas do mesmo texto.</p>
        </div>
        <div class="workspace-actions">
          <button class="btn btn-ghost" type="button" data-action="clear-compare">Limpar comparacao</button>
        </div>
      </div>
      <div class="version-compare__summary">
        <article class="version-compare__summary-card">
          <p class="workspace-kicker">Versao ${escapeHtml(baseVersion.versionNumber)}</p>
          <p class="workspace-meta">${escapeHtml(formatDateTime(baseVersion.createdAt))}</p>
          ${renderStatusBadge(baseVersion.status)}
          <div class="version-card__indicators">${renderIndicatorChips(baseVersion.indicators)}</div>
        </article>
        <article class="version-compare__summary-card">
          <p class="workspace-kicker">Versao ${escapeHtml(currentVersion.versionNumber)}</p>
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
              <span class="version-compare__label">Versao ${escapeHtml(baseVersion.versionNumber)} · Verso ${index + 1}</span>
              <p>${escapeHtml(leftVerse || "—")}</p>
            </div>
            <div class="version-compare__cell ${changedClass}">
              <span class="version-compare__label">Versao ${escapeHtml(currentVersion.versionNumber)} · Verso ${index + 1}</span>
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
    ui.versionHistoryTitle.textContent = state.activeText?.title || "Versoes da sextilha";
  }
  if (!ui.versionHistoryList) return;

  state.versionCompareSelection = state.versionCompareSelection.filter((versionId) => (
    state.activeTextVersions.some((item) => item.versionId === versionId)
  ));
  renderVersionComparePanel();

  if (!state.activeTextVersions.length) {
    ui.versionHistoryList.innerHTML = `<div class="workspace-empty">Nenhuma versao salva ainda.</div>`;
    return;
  }

  ui.versionHistoryList.innerHTML = state.activeTextVersions.map((version) => `
    <article class="version-card ${state.versionCompareSelection.includes(version.versionId) ? "version-card--selected" : ""}">
      <div class="version-card__head">
        <div>
          <h3 class="version-card__title">Versao ${version.versionNumber}</h3>
          <p class="version-card__meta">${escapeHtml(formatDateTime(version.createdAt))}</p>
        </div>
        ${renderStatusBadge(version.status)}
      </div>
      <div class="version-card__indicators">${renderIndicatorChips(version.indicators)}</div>
      <pre>${escapeHtml((version.verses || []).filter(Boolean).join("\n") || "Sem versos registrados nesta versao.")}</pre>
      <div class="version-card__actions">
        <button class="btn btn-secondary" type="button" data-action="toggle-compare" data-version-id="${escapeHtml(version.versionId)}">
          ${state.versionCompareSelection.includes(version.versionId) ? "Remover da comparacao" : "Comparar"}
        </button>
        <button class="btn btn-primary" type="button" data-action="restore-version" data-version-id="${escapeHtml(version.versionId)}">Usar esta versao no editor</button>
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
  setEditorFeedback("Versao carregada no editor. Salve para criar uma nova etapa do texto.", "success");
}

function buildLiveSextilhaIndicators(options = {}) {
  const draft = options.draft || getSextilhaDraft();
  const verses = draft.verses;
  const filledVerses = verses.filter(Boolean);
  const finalWords = filledVerses.map((verse) => {
    const tokens = norm(verse).split(/\s+/).filter(Boolean);
    return tokens[tokens.length - 1] || "";
  }).filter(Boolean);

  const meaningfulThemeTokens = norm(`${draft.title} ${draft.theme} ${draft.note}`)
    .split(/\s+/)
    .filter((token) => token.length > 2);
  const verseTokens = norm(verses.join(" "))
    .split(/\s+/)
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

  let rimaStatus = "rima em formacao";
  if (finalWords.length >= 2) {
    const suffixGroups = [3, 2, 1].map((size) => {
      const counts = {};
      finalWords.forEach((word) => {
        if (word.length < size) return;
        const suffix = word.slice(-size);
        counts[suffix] = (counts[suffix] || 0) + 1;
      });
      return Math.max(0, ...Object.values(counts));
    });
    if (suffixGroups[0] >= 3) rimaStatus = "rima consistente";
    else if (suffixGroups[1] >= 2) rimaStatus = "rima em consolidacao";
    else if (suffixGroups[2] >= 2) rimaStatus = "rima leve aparecendo";
    else rimaStatus = "rima livre em desenvolvimento";
  }

  let coerenciaTematica = "tema em formacao";
  if (!meaningfulThemeTokens.length) {
    coerenciaTematica = filledVerses.length >= 3 ? "boa unidade do texto" : "tema em aberto";
  } else {
    const overlap = meaningfulThemeTokens.filter((token) => verseTokens.includes(token)).length;
    if (overlap >= 2) coerenciaTematica = "boa unidade tematica";
    else if (overlap >= 1) coerenciaTematica = "tema presente";
    else if (filledVerses.length >= 3) coerenciaTematica = "reforcar unidade tematica";
  }

  const tokenFrequency = verseTokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});
  const highestFrequency = Math.max(0, ...Object.values(tokenFrequency));
  const repeticaoLexical = highestFrequency >= 4
    ? "repeticao alta"
    : highestFrequency === 3
      ? "alguma repeticao"
      : "boa variedade lexical";

  const revisionCount = Number(options.revisionCount ?? state.activeText?.versionCount ?? 0);
  const maturacao = revisionCount >= 4
    ? "texto amadurecido"
    : revisionCount >= 2
      ? "texto amadurecendo"
      : revisionCount === 1
        ? "primeira versao registrada"
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
  if (ui.editorIndicatorList) {
    ui.editorIndicatorList.innerHTML = renderIndicatorChips(indicators);
  }
}

async function handleDashboardTextAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, textId } = button.dataset;
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
    const confirmed = window.confirm("Arquivar este texto sem apagar o historico?");
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

if (ui.chooseGameTrackBtn) {
  ui.chooseGameTrackBtn.addEventListener("click", startGameTrack);
}

if (ui.chooseSextilhaTrackBtn) {
  ui.chooseSextilhaTrackBtn.addEventListener("click", async () => {
    try {
      await openSextilhaDashboard();
    } catch (error) {
      window.alert(error?.message || "Nao foi possivel abrir o caderno agora.");
      showTrackChooser();
    }
  });
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
        ui.dashboardTextList.innerHTML = `<div class="workspace-empty">${escapeHtml(error?.message || "Nao foi possivel criar a sextilha agora.")}</div>`;
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
        ui.dashboardTextList.innerHTML = `<div class="workspace-empty">${escapeHtml(error?.message || "Nao foi possivel carregar este texto.")}</div>`;
      }
    });
  });
}

if (ui.btnBackToDashboard) {
  ui.btnBackToDashboard.addEventListener("click", async () => {
    try {
      await openSextilhaDashboard();
    } catch (error) {
      setEditorFeedback(error?.message || "Nao foi possivel voltar ao caderno.", "error");
    }
  });
}

if (ui.btnSaveTextVersion) {
  ui.btnSaveTextVersion.addEventListener("click", () => {
    saveCurrentTextVersion();
  });
}

if (ui.btnArchiveText) {
  ui.btnArchiveText.addEventListener("click", () => {
    archiveCurrentText().catch((error) => {
      setEditorFeedback(error?.message || "Nao foi possivel arquivar este texto.", "error");
    });
  });
}

if (ui.btnOpenVersionHistory) {
  ui.btnOpenVersionHistory.addEventListener("click", () => {
    openVersionHistory().catch((error) => {
      setEditorFeedback(error?.message || "Nao foi possivel abrir o historico.", "error");
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
      await openSextilhaDashboard();
    } catch (error) {
      if (ui.versionHistoryList) {
        ui.versionHistoryList.innerHTML = `<div class="workspace-empty">${escapeHtml(error?.message || "Nao foi possivel voltar ao caderno.")}</div>`;
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
  input.addEventListener("input", updateSextilhaIndicators);
});

[ui.editorTitleInput, ui.editorThemeInput, ui.editorNoteInput, ui.editorStatusSelect, ui.editorSharedWithEducator]
  .filter(Boolean)
  .forEach((input) => {
    input.addEventListener("input", updateSextilhaIndicators);
    input.addEventListener("change", updateSextilhaIndicators);
  });

// ── Placar e Envio ───────────────────────────────────────────────────
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

  const top10 = sortedData.slice(0, 10);
  const top3 = top10.slice(0, 3);

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
      `;
      container.appendChild(div);
    });
  };

  populateList(top3, ui.placarList);
  if (ui.fullPlacarList) populateList(top10, ui.fullPlacarList);
}

function loadPlacar() {
  if (WEB_APP_URL.includes("URL_DO_SEU_APPS_SCRIPT_AQUI")) {
    // Modo local / Fallback para usar o Library pré-programado em arquivo
    renderPlacarItems(PLACAR_LIBRARY);
    const aviso = document.createElement("p");
    aviso.style.cssText = "text-align:center;color:var(--muted);font-size:12px;margin-top:10px;";
    aviso.textContent = "Modo estático. Atualize a WEB_APP_URL para ler do Sheets.";
    ui.placarList.appendChild(aviso);
    return;
  }

  ui.placarList.innerHTML = "<p style='text-align: center; color: var(--muted); margin-top:20px;'>Carregando placar...</p>";

  // Adicionando timestamp para evitar problemas de cache rigoroso no GitHub Pages
  fetch(WEB_APP_URL + "?action=getPlacar&t=" + new Date().getTime())
    .then(r => r.json())
    .then(data => {
      if (data && typeof data === "object" && !Array.isArray(data)) {
        if (data.status === "error") {
          throw new Error(data.message || "Erro no backend do placar.");
        }
        if (data.error) {
          throw new Error(data.error);
        }
      }
      renderPlacarItems(data);
    })
    .catch(err => {
      console.error(err);
      const message = err && err.message ? err.message : "Erro ao conectar com a planilha.";
      ui.placarList.innerHTML = `<p style='text-align: center; color: var(--danger); margin-top:20px;'>${escapeHtml(message)}</p>`;
    });
}
ui.btnRefreshPlacar.addEventListener("click", loadPlacar);

ui.btnSubmitPoem.addEventListener("click", () => {
  if (!state.playerData) return;
  const textoQuada = ui.quadra.textContent.trim();
  if (!textoQuada) return;

  ui.btnSubmitPoem.disabled = true;
  ui.btnSubmitPoem.textContent = "⏳ Enviando...";
  ui.submitResponse.style.display = "block";
  ui.submitResponse.style.color = "var(--text)";
  ui.submitResponse.textContent = "Processando...";

  if (WEB_APP_URL.includes("URL_DO_SEU_APPS_SCRIPT_AQUI")) {
    setTimeout(() => {
      ui.submitResponse.style.color = "var(--primary)";
      ui.submitResponse.textContent = "Simulado: quadra enviada com sucesso! (Configure Apps Script para registrar).";
      ui.btnSubmitPoem.textContent = "🚀 Enviar Quadra";
    }, 1000);
    return;
  }

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
    origem: state.origem || state.playerData.origem || "",
    verso: textoQuada,
    modo: state.modeChallenge ? "Desafio" : "Didático",
    pontos: state.points,
    esquemaRima: state.rhyme ? state.rhyme.label : "—",
    pontosRima: state.scoreBreakdown ? state.scoreBreakdown.rhyme.pairScoreTotal : 0,
    pontosForma: state.scoreBreakdown ? state.scoreBreakdown.structure.points : 0,
    pontosCriatividade: state.scoreBreakdown ? state.scoreBreakdown.creativity.bonus : 0,
    bonusEsquema: state.scoreBreakdown ? state.scoreBreakdown.rhyme.schemeBonus : 0,
    tempoEscritaMs,
    tempoEscritaFormatado: formatElapsedClock(tempoEscritaMs)
  };

  fetch(WEB_APP_URL, {
    method: "POST",
    // Para GitHub Pages e Google Apps Script:
    // Omitimos explicitamente headers (Content-Type) e o modo no-cors para que a requisição
    // seja tratada como 'simple request' com text/plain. Isso evita o preflight OPTIONS (CORS error) e 
    // ainda permite ler a resposta JSON devidamente redicionada pelo Google Web App!
    body: JSON.stringify(payload)
  })
    .then(r => r.json())
    .then((res) => {
      if (res && res.status === "error") throw new Error(res.message);
      ui.submitResponse.style.color = "var(--accent)";
      ui.submitResponse.textContent = "✅ Quadra enviada para a planilha!";
      ui.btnSubmitPoem.textContent = "🚀 Quadra Enviada";
      loadPlacar();
    }).catch((err) => {
      console.error(err);
      ui.submitResponse.style.color = "var(--danger)";
      ui.submitResponse.textContent = "❌ Falha ao enviar, verifique o console.";
      ui.btnSubmitPoem.disabled = false;
      ui.btnSubmitPoem.textContent = "🚀 Tentar Novamente";
    });
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
  ui.verseInput.placeholder = "Ex.: Escreva o verso sem a última palavra aqui";
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

// Modal Placar Top 10
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
