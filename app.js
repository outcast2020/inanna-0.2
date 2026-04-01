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

  // app script globals
  btnStart: $("btnStart"),
  playerName: $("playerName"),
  playerEmail: $("playerEmail"),
  playerType: $("playerType"),
  startHint: $("startHint"),
  btnSubmitPoem: $("btnSubmitPoem"),
  submitResponse: $("submitResponse"),
  placarList: $("placarList"),
  btnRefreshPlacar: $("btnRefreshPlacar"),
  rankingArea: $("rankingArea"),

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
  confidence: $("confidence"),
  points: $("points"),

  // modal do vetor
  vectorModal: $("vectorModal"),
  closeVector: $("closeVector"),
  vectorWordTitle: $("vectorWordTitle"),
  vectorProbability: $("vectorProbability"),
  vectorSummary: $("vectorSummary"),
  vectorDimensions: $("vectorDimensions"),
};

// ── Estado do jogo ───────────────────────────────────────────────────
const state = {
  phase: 0,           // 0 | 1 | 2 | 3
  playerData: null,
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
};

// COLOQUE AQUI A URL GERADA NO DEPLOY DO SEU GOOGLE APPS SCRIPT
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxnB1kg0al9Dj79GTwsvvhrNSAK4rFnUPyfRgV8pU_pOUkSrl0z9wlDwXR37ELHKaZC/exec";

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

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}

function setExplain(msg) {
  if (ui.explainBox) ui.explainBox.textContent = msg || "";
}

function setStartHint(msg, color) {
  if (!ui.startHint) return;
  ui.startHint.textContent = msg || "";
  ui.startHint.style.color = color || "var(--muted)";
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
  const settings = Object.assign({ resetPoints: true }, options);

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

  ui.confidence.textContent = "—";
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
  resetQuadraState({ resetPoints: true });

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
  ui.confidence.textContent = formatPct(pred.confidence);
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
    `As probabilidades aparecem na lista principal. Abra o vetor de qualquer palavra para ver as 5 dimensões ponderadas.`
  );
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

// ── Início (Step 0) ───────────────────────────────────────────────────
ui.btnStart.addEventListener("click", () => {
  const nome = ui.playerName.value.trim();
  const email = ui.playerEmail.value.trim();
  const tipoAcesso = ui.playerType.value;

  if (!nome || !email || !tipoAcesso) {
    setStartHint("Preencha nome, email e tipo para iniciar.", "var(--primary)");
    if (!nome) ui.playerName.focus();
    else if (!email) ui.playerEmail.focus();
    else ui.playerType.focus();
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setStartHint("Use um email valido para continuar.", "var(--primary)");
    ui.playerEmail.focus();
    return;
  }

  setStartHint("");
  state.playerData = { nome, email, tipoAcesso };
  goToPhase(1);
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
    const rhymeA = typeof a.pontosRima === "number" ? a.pontosRima : parseInt(a.pontosRima, 10) || 0;
    const rhymeB = typeof b.pontosRima === "number" ? b.pontosRima : parseInt(b.pontosRima, 10) || 0;
    if (rhymeB !== rhymeA) return rhymeB - rhymeA;
    const creativeA = typeof a.pontosCriatividade === "number" ? a.pontosCriatividade : parseInt(a.pontosCriatividade, 10) || 0;
    const creativeB = typeof b.pontosCriatividade === "number" ? b.pontosCriatividade : parseInt(b.pontosCriatividade, 10) || 0;
    if (creativeB !== creativeA) return creativeB - creativeA;
    const formA = typeof a.pontosForma === "number" ? a.pontosForma : parseInt(a.pontosForma, 10) || 0;
    const formB = typeof b.pontosForma === "number" ? b.pontosForma : parseInt(b.pontosForma, 10) || 0;
    if (formB !== formA) return formB - formA;
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
        <div class="placar-header" style="display:flex; justify-content:space-between; align-items:center;">
          <span class="placar-pos" style="font-size:15px; font-weight:bold;">${medal}${i + 1}º</span>
          <span class="placar-pontos" style="font-size:11px; font-weight:800; background:rgba(249,115,22,0.15); color:var(--primary); padding:2px 8px; border-radius:99px;">${(Number(item.pontos) || 0) + ' pts'}</span>
        </div>
        <div class="placar-autor" style="font-weight:600; margin-top:4px;">${escapeHtml(item.autor)}</div>
        <div class="placar-verso" style="font-size:13px; color:var(--muted); font-style:italic; margin-top:2px;">"${escapeHtml(item.verso)}"</div>
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
      renderPlacarItems(data);
    })
    .catch(err => {
      console.error(err);
      ui.placarList.innerHTML = "<p style='text-align: center; color: var(--danger); margin-top:20px;'>Erro ao conectar com a planilha.</p>";
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

  const payload = {
    nome: state.playerData.nome,
    email: state.playerData.email,
    tipoAcesso: state.playerData.tipoAcesso,
    verso: textoQuada,
    modo: state.modeChallenge ? "Desafio" : "Didático",
    pontos: state.points,
    esquemaRima: state.rhyme ? state.rhyme.label : "—",
    pontosRima: state.scoreBreakdown ? state.scoreBreakdown.rhyme.pairScoreTotal : 0,
    pontosForma: state.scoreBreakdown ? state.scoreBreakdown.structure.points : 0,
    pontosCriatividade: state.scoreBreakdown ? state.scoreBreakdown.creativity.bonus : 0,
    bonusEsquema: state.scoreBreakdown ? state.scoreBreakdown.rhyme.schemeBonus : 0
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
  resetQuadraState({ resetPoints: true });
  goToPhase(2);
}

function onNewPoem() {
  state.chosenTheme = null;
  state.scheme = "Livre";
  ui.selectedThemeName.textContent = "—";
  ui.verseInput.placeholder = "Ex.: Escreva o verso sem a última palavra aqui";
  resetQuadraState({ resetPoints: true });
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

// ── Init ──────────────────────────────────────────────────────────────
syncModes();
buildThemeGrid();
updateVerseBlankPreview();
updateRoundStatus();
if (!state.playerData) {
  goToPhase(0);
} else {
  goToPhase(1);
}
loadPlacar();
