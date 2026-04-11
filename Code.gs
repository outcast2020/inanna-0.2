var DEFAULT_REGISTRY_SPREADSHEET_ID = "";
var DEFAULT_REGISTRY_SHEET_NAME = "Página1";
var DEFAULT_CHECKIN_SPREADSHEET_ID = "";
var DEFAULT_CHECKIN_SHEET_NAME = "USERS_checkin";
var DEFAULT_APP_VARIANT = "inanna-main";
var FALLBACK_REGISTRY_SPREADSHEET_ID = "1hDEDkylOBUKDY-s4tqnYaMfZgm6izftB04alLVGe3Rc";
var REGISTRY_SHEET_ALIASES = ["Página1", "PÃ¡gina1", "Pagina1"];
var CHECKIN_SHEET_ALIASES = ["USERS_checkin", "USERS", "Users", "users", "checkin", "CHECKIN"];
var PLACAR_SHEET_NAME = "placar";
var USERS_CACHE_SHEET_NAME = "USERS_CACHE";
var TEXTS_SHEET_NAME = "TEXTS";
var TEXT_VERSIONS_SHEET_NAME = "TEXT_VERSIONS";
var TEXT_FEEDBACK_SHEET_NAME = "TEXT_FEEDBACK";
var TEXT_ACTIVITY_LOG_SHEET_NAME = "TEXT_ACTIVITY_LOG";

var FORM_HEADERS = [
  "Carimbo de data/hora",
  "Nome",
  "Email",
  "Tipo de Participante",
  "Verso",
  "Modo",
  "Pontos",
  "Esquema de Rima",
  "Pts Rima",
  "Pts Forma",
  "Pts Criatividade",
  "Bonus Esquema",
  "PARTICIPANT_ID",
  "CHECKIN_USER_ID",
  "CHECKIN_MATCH_STATUS",
  "CHECKIN_MATCH_METHOD",
  "TEACHER_GROUP",
  "MUNICIPIO",
  "ESTADO",
  "ORIGEM",
  "APP_VARIANT",
  "Tempo Escrita (ms)",
  "Tempo Escrita"
];

var PLACAR_HEADERS = [
  "Posicao",
  "Autor",
  "Verso",
  "Pontos",
  "Pts Rima",
  "Pts Forma",
  "Pts Criatividade",
  "Bonus Esquema",
  "Timestamp"
];

var USERS_CACHE_HEADERS = [
  "PARTICIPANT_ID",
  "CHECKIN_USER_ID",
  "NOME",
  "EMAIL",
  "MUNICIPIO",
  "ESTADO",
  "ORIGEM",
  "TEACHER_GROUP",
  "APP_VARIANT",
  "CREATED_AT",
  "UPDATED_AT"
];

var TEXTS_HEADERS = [
  "TEXT_ID",
  "PARTICIPANT_ID",
  "CHECKIN_USER_ID",
  "TEACHER_GROUP",
  "TITULO",
  "TEMA",
  "OBSERVACAO",
  "STATUS",
  "CREATED_AT",
  "UPDATED_AT",
  "CURRENT_VERSION_ID",
  "COMPARTILHADO_EDUCADOR",
  "SELECIONADO_ANTOLOGIA",
  "APP_VARIANT"
];

var TEXT_VERSIONS_HEADERS = [
  "VERSION_ID",
  "TEXT_ID",
  "PARTICIPANT_ID",
  "CHECKIN_USER_ID",
  "TEACHER_GROUP",
  "VERSION_NUMBER",
  "TITULO",
  "TEMA",
  "OBSERVACAO",
  "VERSO_1",
  "VERSO_2",
  "VERSO_3",
  "VERSO_4",
  "VERSO_5",
  "VERSO_6",
  "COMPLETUDE",
  "FECHAMENTO",
  "RIMA_STATUS",
  "COERENCIA_TEMATICA",
  "REPETICAO_LEXICAL",
  "REVISION_NOTE",
  "STATUS",
  "COMPARTILHADO_EDUCADOR",
  "CREATED_AT"
];

var TEXT_FEEDBACK_HEADERS = [
  "FEEDBACK_ID",
  "TEXT_ID",
  "VERSION_ID",
  "PARTICIPANT_ID",
  "EDUCATOR_ID",
  "COMENTARIO",
  "CATEGORIA",
  "CREATED_AT"
];

var TEXT_ACTIVITY_LOG_HEADERS = [
  "LOG_ID",
  "PARTICIPANT_ID",
  "TEXT_ID",
  "ACAO",
  "DETALHES",
  "CREATED_AT"
];

function doPost(e) {
  var payload = parsePostJson_(e);
  var action = normalizeAction_(payload.action);

  if (!action) {
    return registrarVerso(e);
  }

  try {
    if (action === "create_text") {
      return jsonOutput_(handleCreateText_(payload));
    }
    if (action === "save_text_version") {
      return jsonOutput_(handleSaveTextVersion_(payload));
    }
    if (action === "generate_text_feedback") {
      return jsonOutput_(handleGenerateTextFeedback_(payload));
    }
    if (action === "update_text_status") {
      return jsonOutput_(handleUpdateTextStatus_(payload));
    }
    if (action === "archive_text") {
      return jsonOutput_(handleArchiveText_(payload));
    }

    return jsonOutput_({
      status: "error",
      message: "Acao POST nao suportada: " + action
    });
  } catch (error) {
    return jsonOutput_({
      status: "error",
      message: error && error.message ? error.message : String(error)
    });
  }
}

function parsePostJson_(e) {
  try {
    return JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (error) {
    throw new Error("Payload JSON invalido.");
  }
}

function normalizeAction_(value) {
  return String(value || "").trim().toLowerCase();
}

function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function normWordScore(word) {
  return String(word || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

function extractWordTokensScore(verse) {
  return String(verse || "")
    .trim()
    .split(/\s+/)
    .map(function (token) {
      return token.replace(/^[^A-Za-z\u00C0-\u00FF]+|[^A-Za-z\u00C0-\u00FF-]+$/g, "");
    })
    .filter(function (token) { return !!token; });
}

function getLastWordScore(verse) {
  var tokens = extractWordTokensScore(verse);
  return normWordScore(tokens.length ? tokens[tokens.length - 1] : "");
}

function isSuspiciousJoinedTokenScore(token) {
  var normalized = normWordScore(token);
  if (!normalized) return false;
  if (/^(de|da|do|das|dos|na|no|nas|nos|em|com|pra|pro|e|foi|vai|sou|era|sao|estou|esta|ta|comeu)[a-z]{5,}$/.test(normalized)) {
    return true;
  }
  return normalized.length >= 13;
}

function rhymePairScoreScore(a, b) {
  if (!a || !b) return -1;
  if (a === b && a.length > 1) return 3;
  if (a.length >= 3 && b.length >= 3 && a.slice(-3) === b.slice(-3)) return 3;
  if (a.length >= 2 && b.length >= 2 && a.slice(-2) === b.slice(-2)) return 2;
  if (a.slice(-1) === b.slice(-1)) return 1;
  return -1;
}

function getQuadraLines(verseText) {
  return String(verseText || "")
    .split(/\r?\n/)
    .map(function (line) { return String(line || "").trim(); })
    .filter(function (line) { return !!line; })
    .slice(0, 4);
}

function analyzeStructureScore(lines) {
  var stopwords = {
    de: true, do: true, da: true, dos: true, das: true,
    e: true, em: true, com: true, pra: true, pro: true,
    para: true, que: true, se: true, na: true, no: true,
    nas: true, nos: true
  };
  var goodLines = 0;
  var suspiciousLines = 0;

  lines.forEach(function (line) {
    var tokens = extractWordTokensScore(line);
    var finalToken = tokens.length ? tokens[tokens.length - 1] : "";
    var finalWord = normWordScore(finalToken);
    var balanced = tokens.length >= 3 && tokens.length <= 8;
    var suspicious = tokens.some(function (token) {
      return isSuspiciousJoinedTokenScore(token);
    });
    var clearEnding = finalWord.length >= 2 && !stopwords[finalWord] && !isSuspiciousJoinedTokenScore(finalToken);

    if (suspicious) suspiciousLines += 1;
    if (balanced && clearEnding && !suspicious) goodLines += 1;
  });

  return {
    goodLines: goodLines,
    suspiciousLines: suspiciousLines,
    points: goodLines === 4 ? 2 : goodLines >= 3 ? 1 : 0
  };
}

function analyzeRhymeScore(lines) {
  var words = lines.map(function (line) { return getLastWordScore(line); });
  var schemes = [
    { id: "AABB", pairs: [[0, 1], [2, 3]], label: "AABB" },
    { id: "ABAB", pairs: [[0, 2], [1, 3]], label: "ABAB" },
    { id: "ABBA", pairs: [[0, 3], [1, 2]], label: "ABBA" }
  ];

  var best = schemes[0];
  var bestPairScores = [-1, -1];
  var bestScore = -99;

  schemes.forEach(function (scheme) {
    var pairScores = scheme.pairs.map(function (pair) {
      return rhymePairScoreScore(words[pair[0]], words[pair[1]]);
    });
    var total = pairScores.reduce(function (sum, score) { return sum + score; }, 0);
    if (total > bestScore) {
      bestScore = total;
      best = scheme;
      bestPairScores = pairScores;
    }
  });

  var strongScheme = bestPairScores.every(function (score) { return score >= 2; });

  return {
    scheme: best.label,
    pairScores: bestPairScores,
    pairScoreTotal: bestScore,
    bonusEsquema: strongScheme ? 2 : 0
  };
}

function calculateChallengeScoreFromVerse(verseText, creativityBonus) {
  var lines = getQuadraLines(verseText);
  var structure = analyzeStructureScore(lines);
  var rhyme = analyzeRhymeScore(lines);
  var creativity = Math.max(0, Math.min(2, Number(creativityBonus) || 0));
  var total = Math.max(0, structure.points + rhyme.pairScoreTotal + rhyme.bonusEsquema + creativity);

  return {
    total: total,
    scheme: rhyme.scheme,
    pontosRima: rhyme.pairScoreTotal,
    pontosForma: structure.points,
    pontosCriatividade: creativity,
    bonusEsquema: rhyme.bonusEsquema
  };
}

function registrarVerso(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var sheet = getRecordsSheet_();
    var headerMap = ensureHeaders_(sheet, FORM_HEADERS);

    var nomeRaw = String(data.nome || data.name || "").trim();
    var emailRaw = String(data.email || "").trim();
    var municipioRaw = String(data.municipio || data.city || "").trim();
    var estadoRaw = String(data.estado || data.state || data.stateUF || "").trim();
    var origemRaw = String(data.origem || data.source || data.tipoAcesso || "").trim();
    var teacherGroupRaw = String(data.teacherGroup || data.cohort || data.workshop || "").trim();
    var tempoEscritaMs = Math.max(0, Number(data.tempoEscritaMs) || 0);
    var tempoEscritaFormatado = String(data.tempoEscritaFormatado || "").trim();
    var checkinMatch = resolveCheckinMatch_({
      name: nomeRaw,
      email: emailRaw,
      municipio: municipioRaw,
      estado: estadoRaw,
      origem: origemRaw,
      cohort: teacherGroupRaw
    });

    var nome = String(nomeRaw || checkinMatch.name || "").trim();
    var email = String(emailRaw || checkinMatch.email || "").trim();
    var municipio = String(municipioRaw || checkinMatch.city || "").trim();
    var estado = normalizeUFOrInternational_(estadoRaw || checkinMatch.estado || "");
    var origem = normalizeOrigem_(origemRaw || checkinMatch.origem || "");
    var teacherGroup = String(teacherGroupRaw || checkinMatch.teacherGroup || "").trim();
    var checkinUserId = String(data.checkinUserId || checkinMatch.checkinUserId || "").trim();
    var matchStatus = String(data.checkinMatchStatus || checkinMatch.status || "").trim() || (checkinUserId ? "matched" : "unmatched");
    var matchMethod = String(data.checkinMatchMethod || checkinMatch.method || "").trim() || (checkinUserId ? "email" : "none");
    var participantId = String(
      data.participantId ||
      buildParticipantId_({
        name: nome,
        email: email,
        municipio: municipio,
        estado: estado,
        origem: origem,
        checkinMatch: {
          status: matchStatus,
          checkinUserId: checkinUserId
        }
      })
    ).trim();
    var tipoParticipante = String(data.tipoAcesso || teacherGroup || origem || "").trim();
    var modoStr = normalizeLooseText_(data.modo) === "desafio" ? "Desafio" : "Didatico";
    var score = calculateChallengeScoreFromVerse(data.verso, data.pontosCriatividade);
    var pontosNum = modoStr === "Desafio" ? score.total : 0;
    var width = Math.max(sheet.getLastColumn(), FORM_HEADERS.length);
    var row = buildBlankRow_(width);

    setRowValue_(row, headerMap, "Carimbo de data/hora", new Date());
    setRowValue_(row, headerMap, "Nome", nome);
    setRowValue_(row, headerMap, "Email", email);
    setRowValue_(row, headerMap, "Tipo de Participante", tipoParticipante);
    setRowValue_(row, headerMap, "Verso", data.verso || "");
    setRowValue_(row, headerMap, "Modo", modoStr);
    setRowValue_(row, headerMap, "Pontos", pontosNum);
    setRowValue_(row, headerMap, "Esquema de Rima", score.scheme || "-");
    setRowValue_(row, headerMap, "Pts Rima", score.pontosRima || 0);
    setRowValue_(row, headerMap, "Pts Forma", score.pontosForma || 0);
    setRowValue_(row, headerMap, "Pts Criatividade", score.pontosCriatividade || 0);
    setRowValue_(row, headerMap, "Bonus Esquema", score.bonusEsquema || 0);
    setRowValue_(row, headerMap, "PARTICIPANT_ID", participantId);
    setRowValue_(row, headerMap, "CHECKIN_USER_ID", checkinUserId);
    setRowValue_(row, headerMap, "CHECKIN_MATCH_STATUS", matchStatus);
    setRowValue_(row, headerMap, "CHECKIN_MATCH_METHOD", matchMethod);
    setRowValue_(row, headerMap, "TEACHER_GROUP", teacherGroup);
    setRowValue_(row, headerMap, "MUNICIPIO", municipio);
    setRowValue_(row, headerMap, "ESTADO", estado);
    setRowValue_(row, headerMap, "ORIGEM", origem);
    setRowValue_(row, headerMap, "APP_VARIANT", String(data.appVariant || DEFAULT_APP_VARIANT).trim() || DEFAULT_APP_VARIANT);
    setRowValue_(row, headerMap, "Tempo Escrita (ms)", tempoEscritaMs);
    setRowValue_(row, headerMap, "Tempo Escrita", tempoEscritaFormatado);

    sheet.appendRow(row);

    var ss = sheet.getParent();
    if (modoStr === "Desafio") {
      atualizarPlacar(ss, sheet);
    }

    garantirTriggersDoPlacar_();

    return jsonOutput_({ status: "success" });
  } catch (error) {
    return jsonOutput_({ status: "error", message: error.toString() });
  }
}

function atualizarPlacar(ss, mainSheet) {
  var table = getSheetTable_(mainSheet);
  var records = [];

  for (var i = 0; i < table.rows.length; i++) {
    var record = table.rows[i].record;
    if (normalizeLooseText_(record.Modo) !== "desafio") continue;

    var score = calculateChallengeScoreFromVerse(record.Verso, coerceNumericCell_(record["Pts Criatividade"]));
    records.push({
      timestamp: record["Carimbo de data/hora"],
      autor: record.Nome,
      verso: record.Verso,
      pontos: score.total,
      pontosRima: score.pontosRima,
      pontosForma: score.pontosForma,
      pontosCriatividade: score.pontosCriatividade,
      bonusEsquema: score.bonusEsquema
    });
  }

  records.sort(function (a, b) {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  var placarSheet = ensureSheetConfigured_(ss, PLACAR_SHEET_NAME, [PLACAR_SHEET_NAME], PLACAR_HEADERS, "#fff2cc");
  resetSheetWithHeaders_(placarSheet, PLACAR_HEADERS, "#fff2cc");

  for (var j = 0; j < records.slice(0, 10).length; j++) {
    placarSheet.appendRow([
      (j + 1) + "o",
      records[j].autor,
      records[j].verso,
      records[j].pontos,
      records[j].pontosRima,
      records[j].pontosForma,
      records[j].pontosCriatividade,
      records[j].bonusEsquema,
      records[j].timestamp
    ]);
  }

  if (placarSheet.getLastRow() > 1) {
    placarSheet.getRange(2, 4, placarSheet.getLastRow() - 1, 5).setNumberFormat("0");
    placarSheet.getRange(2, 9, placarSheet.getLastRow() - 1, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
  }
}

function doGet(e) {
  try {
    var action = normalizeAction_((e && e.parameter && e.parameter.action) || "");

    if (action === "checkin_lookup") {
      return handleCheckinLookup_(e);
    }
    if (action === "getplacar") {
      return jsonOutput_(buildPlacarResponse_());
    }
    if (action === "get_user_dashboard") {
      return jsonOutput_(handleGetUserDashboard_((e && e.parameter) || {}));
    }
    if (action === "get_user_texts") {
      return jsonOutput_(handleGetUserTexts_((e && e.parameter) || {}));
    }
    if (action === "get_text") {
      return jsonOutput_(handleGetText_((e && e.parameter) || {}));
    }
    if (action === "get_text_versions") {
      return jsonOutput_(handleGetTextVersions_((e && e.parameter) || {}));
    }
    if (action === "get_firebase_custom_token") {
      return jsonOutput_(handleGetFirebaseCustomToken_((e && e.parameter) || {}));
    }

    return ContentService.createTextOutput("Endpoint GET pronto.")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return jsonOutput_({
      status: "error",
      message: error && error.message ? error.message : String(error)
    });
  }
}

function buildPlacarResponse_() {
  var ss = getRegistrySpreadsheet_();
  atualizarPlacar(ss, getRecordsSheet_());

  var table = getSheetTable_(getPlacarSheet_());
  var result = [];

  for (var i = 0; i < table.rows.length; i++) {
    var record = table.rows[i].record;
    if (!record.Posicao) continue;
    result.push({
      posicao: record.Posicao,
      autor: record.Autor,
      verso: record.Verso,
      pontos: coerceNumericCell_(record.Pontos),
      pontosRima: coerceNumericCell_(record["Pts Rima"]),
      pontosForma: coerceNumericCell_(record["Pts Forma"]),
      pontosCriatividade: coerceNumericCell_(record["Pts Criatividade"]),
      bonusEsquema: coerceNumericCell_(record["Bonus Esquema"]),
      timestamp: toIsoString_(record.Timestamp)
    });
  }

  return result;
}

function getRegistrySpreadsheetId_() {
  var props = PropertiesService.getScriptProperties();
  return String(
    props.getProperty("INANNA_REGISTRY_SPREADSHEET_ID") ||
    props.getProperty("IZA_REGISTRY_SPREADSHEET_ID") ||
    DEFAULT_REGISTRY_SPREADSHEET_ID ||
    FALLBACK_REGISTRY_SPREADSHEET_ID ||
    ""
  ).trim();
}

function getRegistrySpreadsheet_() {
  var spreadsheetId = getRegistrySpreadsheetId_();
  if (spreadsheetId) {
    var directSpreadsheet = openSpreadsheetSafely_(spreadsheetId);
    if (directSpreadsheet) return directSpreadsheet;
    throw new Error("Nao foi possivel abrir a planilha de registro pelo ID configurado: " + spreadsheetId);
  }

  try {
    var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSpreadsheet) return activeSpreadsheet;
  } catch (error) {
    // Segue para a mensagem clara abaixo quando o projeto nao estiver vinculado a uma planilha.
  }

  throw new Error("Planilha de registro nao configurada. Defina INANNA_REGISTRY_SPREADSHEET_ID nas propriedades do script.");
}

function getRecordsSheet_() {
  return ensureSheetConfigured_(getRegistrySpreadsheet_(), DEFAULT_REGISTRY_SHEET_NAME, REGISTRY_SHEET_ALIASES, FORM_HEADERS, "#d9ead3");
}

function getPlacarSheet_() {
  return ensureSheetConfigured_(getRegistrySpreadsheet_(), PLACAR_SHEET_NAME, [PLACAR_SHEET_NAME], PLACAR_HEADERS, "#fff2cc");
}

function getSextilhaSheet_(sheetName) {
  if (sheetName === USERS_CACHE_SHEET_NAME) {
    return ensureSheetConfigured_(getRegistrySpreadsheet_(), USERS_CACHE_SHEET_NAME, [USERS_CACHE_SHEET_NAME], USERS_CACHE_HEADERS, "#d9edf7");
  }
  if (sheetName === TEXTS_SHEET_NAME) {
    return ensureSheetConfigured_(getRegistrySpreadsheet_(), TEXTS_SHEET_NAME, [TEXTS_SHEET_NAME], TEXTS_HEADERS, "#fce5cd");
  }
  if (sheetName === TEXT_VERSIONS_SHEET_NAME) {
    return ensureSheetConfigured_(getRegistrySpreadsheet_(), TEXT_VERSIONS_SHEET_NAME, [TEXT_VERSIONS_SHEET_NAME], TEXT_VERSIONS_HEADERS, "#fff2cc");
  }
  if (sheetName === TEXT_FEEDBACK_SHEET_NAME) {
    return ensureSheetConfigured_(getRegistrySpreadsheet_(), TEXT_FEEDBACK_SHEET_NAME, [TEXT_FEEDBACK_SHEET_NAME], TEXT_FEEDBACK_HEADERS, "#ead1dc");
  }
  if (sheetName === TEXT_ACTIVITY_LOG_SHEET_NAME) {
    return ensureSheetConfigured_(getRegistrySpreadsheet_(), TEXT_ACTIVITY_LOG_SHEET_NAME, [TEXT_ACTIVITY_LOG_SHEET_NAME], TEXT_ACTIVITY_LOG_HEADERS, "#d9d2e9");
  }
  throw new Error("Aba de sextilhas nao reconhecida: " + sheetName);
}

function getCheckinSheet_() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = String(
    props.getProperty("INANNA_CHECKIN_SPREADSHEET_ID") ||
    props.getProperty("IZA_CHECKIN_SPREADSHEET_ID") ||
    DEFAULT_CHECKIN_SPREADSHEET_ID
  ).trim();
  var sheetName = String(
    props.getProperty("INANNA_CHECKIN_SHEET_NAME") ||
    props.getProperty("IZA_CHECKIN_SHEET_NAME") ||
    DEFAULT_CHECKIN_SHEET_NAME
  ).trim();
  var ss = openSpreadsheetSafely_(spreadsheetId);

  if (!ss) {
    try {
      ss = getRegistrySpreadsheet_();
    } catch (error) {
      ss = null;
    }
  }
  if (!ss) return null;

  var aliases = [sheetName].concat(CHECKIN_SHEET_ALIASES);
  return getSheetByAliases_(ss, aliases) || ss.getSheets()[0];
}

function openSpreadsheetSafely_(spreadsheetId) {
  if (!spreadsheetId) return null;
  try {
    return SpreadsheetApp.openById(spreadsheetId);
  } catch (error) {
    return null;
  }
}

function handleCheckinLookup_(e) {
  var callback = sanitizeJsonpCallback_((e && e.parameter && e.parameter.callback) || "");
  var payload = JSON.stringify(buildCheckinLookupResult_({
    email: (e && e.parameter && e.parameter.email) || ""
  }));

  return ContentService
    .createTextOutput(callback + "(" + payload + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function buildCheckinLookupResult_(input) {
  var email = normalizeEmail_(input && input.email);
  if (!email || email.indexOf("@") === -1) {
    return {
      ok: false,
      status: "error",
      error: "invalid_email"
    };
  }

  var match = resolveCheckinMatch_({ email: email });
  if (match.status !== "matched") {
    return {
      ok: false,
      status: match.status || "unmatched",
      error: match.status === "ambiguous" ? "ambiguous_email" : "email_not_found"
    };
  }

  return {
    ok: true,
    status: "matched",
    email: match.email || email,
    name: match.name || "",
    municipio: match.city || "",
    estado: match.estado || "",
    origem: normalizeOrigem_(match.origem || ""),
    teacherGroup: match.teacherGroup || "",
    checkinUserId: match.checkinUserId || "",
    matchMethod: match.method || "email",
    participantId: buildParticipantId_({
      email: match.email || email,
      name: match.name || "",
      municipio: match.city || "",
      estado: match.estado || "",
      origem: match.origem || "",
      checkinMatch: match
    })
  };
}

function resolveCheckinMatch_(input) {
  var sheet = getCheckinSheet_();
  if (!sheet) {
    return { status: "unmatched", method: "none", checkinUserId: "", rowNumber: 0 };
  }

  var values = sheet.getDataRange().getDisplayValues();
  if (!values || values.length < 2) {
    return { status: "unmatched", method: "none", checkinUserId: "", rowNumber: 0 };
  }

  var headerMap = buildHeaderMapFromRow_(values[0]);
  var emailNorm = normalizeEmail_(input && input.email);
  var nameNorm = normalizePersonName_(input && input.name);
  var cityNorm = normalizeLooseText_(input && input.municipio);
  var cohortNorm = normalizeLooseText_(input && input.cohort);
  var records = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var record = extractCheckinRecord_(headerMap, row, i + 1);
    if (record.emailNorm || record.nameNorm) records.push(record);
  }

  if (emailNorm) {
    var emailMatches = records.filter(function (record) {
      return record.emailNorm && record.emailNorm === emailNorm;
    });
    var emailResult = buildCheckinMatchResult_(emailMatches, "email");
    if (emailResult.status !== "unmatched") return emailResult;
  }

  if (nameNorm && cohortNorm) {
    var cohortMatches = records.filter(function (record) {
      return record.nameNorm === nameNorm && record.cohortNorm && record.cohortNorm === cohortNorm;
    });
    var cohortResult = buildCheckinMatchResult_(cohortMatches, "name_cohort");
    if (cohortResult.status !== "unmatched") return cohortResult;
  }

  if (nameNorm && cityNorm) {
    var cityMatches = records.filter(function (record) {
      return record.nameNorm === nameNorm && record.cityNorm && record.cityNorm === cityNorm;
    });
    var cityResult = buildCheckinMatchResult_(cityMatches, "name_city");
    if (cityResult.status !== "unmatched") return cityResult;
  }

  return { status: "unmatched", method: "none", checkinUserId: "", rowNumber: 0 };
}

function extractCheckinRecord_(headerMap, row, rowNumber) {
  var email = readRowValueByHeaders_(headerMap, row, ["EMAIL", "E-MAIL", "MAIL"]);
  var name = readRowValueByHeaders_(headerMap, row, ["NOME", "NOME COMPLETO", "NOME DO ALUNO", "ESCRITOR/A"]);
  var city = readRowValueByHeaders_(headerMap, row, ["MUNICIPIO", "CIDADE", "CITY"]);
  var cohort = readRowValueByHeaders_(headerMap, row, ["OFICINAS_CORDEL", "COORTE", "COHORT", "TURMA", "OFICINA", "WORKSHOP", "GRUPO"]);
  var estado = readRowValueByHeaders_(headerMap, row, ["ESTADO", "UF", "STATE"]);
  var origem = readRowValueByHeaders_(headerMap, row, ["ORIGEM", "FONTE", "SOURCE", "TIPO"]);
  var rawId = readRowValueByHeaders_(headerMap, row, ["USER_ID", "CHECKIN_USER_ID", "ID", "IDENTIFICADOR", "INSCRICAO", "MATRICULA"]);

  return {
    rowNumber: rowNumber,
    checkinUserId: String(rawId || "").trim() || ("row-" + rowNumber),
    email: email,
    emailNorm: normalizeEmail_(email),
    name: name,
    nameNorm: normalizePersonName_(name),
    city: city,
    cityNorm: normalizeLooseText_(city),
    cohort: cohort,
    cohortNorm: normalizeLooseText_(cohort),
    estado: estado,
    origem: origem,
    teacherGroup: cohort
  };
}

function buildCheckinMatchResult_(matches, method) {
  if (!matches || !matches.length) {
    return { status: "unmatched", method: "none", checkinUserId: "", rowNumber: 0 };
  }
  if (matches.length > 1) {
    return { status: "ambiguous", method: method, checkinUserId: "", rowNumber: 0 };
  }

  return {
    status: "matched",
    method: method,
    checkinUserId: matches[0].checkinUserId,
    rowNumber: matches[0].rowNumber,
    name: matches[0].name || "",
    email: matches[0].email || "",
    city: matches[0].city || "",
    estado: matches[0].estado || "",
    origem: matches[0].origem || "",
    teacherGroup: matches[0].teacherGroup || ""
  };
}

function buildParticipantId_(input) {
  var match = input && input.checkinMatch;
  if (match && match.status === "matched" && match.checkinUserId) {
    return buildStableId_("participant", ["checkin", match.checkinUserId]);
  }

  var emailNorm = normalizeEmail_(input && input.email);
  if (emailNorm) {
    return buildStableId_("participant", ["email", emailNorm]);
  }

  return buildStableId_("participant", [
    "name",
    normalizePersonName_(input && input.name),
    normalizeLooseText_(input && input.municipio),
    normalizeLooseText_(input && input.estado),
    normalizeLooseText_(input && input.origem)
  ]);
}

function buildStableId_(prefix, parts) {
  var source = (parts || []).map(function (part) {
    return String(part || "").trim().toLowerCase();
  }).join("|");
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, source);
  return String(prefix || "id") + "_" + bytesToHex_(bytes).slice(0, 16);
}

function bytesToHex_(bytes) {
  return (bytes || []).map(function (value) {
    var hex = (value < 0 ? value + 256 : value).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function debugCheckinSheetInfo() {
  var sheet = getCheckinSheet_();
  if (!sheet) {
    var missingOutput = JSON.stringify({ ok: false, error: "checkin_sheet_not_found" }, null, 2);
    Logger.log(missingOutput);
    return missingOutput;
  }

  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  var output = JSON.stringify({
    ok: true,
    spreadsheetId: sheet.getParent().getId(),
    sheetName: sheet.getName(),
    headers: headers
  }, null, 2);
  Logger.log(output);
  return output;
}

function debugCheckinLookupByEmail() {
  var email = String(PropertiesService.getScriptProperties().getProperty("IZA_DEBUG_CHECKIN_EMAIL") || "cjaviervidalg@gmail.com").trim();
  var output = JSON.stringify({
    ok: !!email,
    email: email,
    result: email ? buildCheckinLookupResult_({ email: email }) : { ok: false, error: "missing_IZA_DEBUG_CHECKIN_EMAIL" }
  }, null, 2);
  Logger.log(output);
  return output;
}

function buildEntityId_(prefix) {
  return String(prefix || "id") + "_" + Utilities.getUuid().replace(/-/g, "").slice(0, 20);
}

function handleGetUserDashboard_(params) {
  ensureSextilhaInfrastructure_();
  var identity = resolveAuthorizedParticipant_(params);
  upsertUsersCacheRecord_(identity);
  var texts = getParticipantTextSummaries_(identity.participantId);

  return {
    ok: true,
    status: "success",
    participantId: identity.participantId,
    checkinUserId: identity.checkinUserId,
    name: identity.name || "",
    email: identity.email || "",
    teacherGroup: identity.teacherGroup || "",
    textCount: texts.length,
    completedCount: texts.filter(function (text) {
      return normalizeTextStatus_(text.status) === "concluida";
    }).length,
    lastEditedAt: texts.length ? texts[0].updatedAt : "",
    texts: texts
  };
}

function handleGetUserTexts_(params) {
  ensureSextilhaInfrastructure_();
  var identity = resolveAuthorizedParticipant_(params);
  upsertUsersCacheRecord_(identity);

  return {
    ok: true,
    status: "success",
    participantId: identity.participantId,
    texts: getParticipantTextSummaries_(identity.participantId)
  };
}

function handleGetText_(params) {
  ensureSextilhaInfrastructure_();
  var identity = resolveAuthorizedParticipant_(params);
  var textId = String(params.textId || "").trim();
  if (!textId) throw new Error("textId obrigatorio.");

  var textEntry = getOwnedTextEntry_(identity.participantId, textId);
  var versions = getParticipantVersionsForText_(identity.participantId, textId);
  var currentVersion = getCurrentVersionEntry_(textEntry.record, versions);

  return {
    ok: true,
    status: "success",
    participantId: identity.participantId,
    text: mapTextDetail_(textEntry.record, currentVersion ? currentVersion.record : null, versions.length),
    latestVersion: currentVersion ? mapVersionRecord_(currentVersion.record) : null
  };
}

function handleGetTextVersions_(params) {
  ensureSextilhaInfrastructure_();
  var identity = resolveAuthorizedParticipant_(params);
  var textId = String(params.textId || "").trim();
  if (!textId) throw new Error("textId obrigatorio.");

  getOwnedTextEntry_(identity.participantId, textId);
  var versions = getParticipantVersionsForText_(identity.participantId, textId)
    .map(function (entry) {
      return mapVersionRecord_(entry.record);
    });

  versions.sort(function (a, b) {
    return (b.versionNumber || 0) - (a.versionNumber || 0);
  });

  return {
    ok: true,
    status: "success",
    participantId: identity.participantId,
    textId: textId,
    versions: versions
  };
}

function handleCreateText_(payload) {
  ensureSextilhaInfrastructure_();
  var identity = resolveAuthorizedParticipant_(payload);
  var textsSheet = getSextilhaSheet_(TEXTS_SHEET_NAME);
  var textTable = getSheetTable_(textsSheet);
  var now = new Date();

  upsertUsersCacheRecord_(identity);

  var textRecord = {
    TEXT_ID: buildEntityId_("text"),
    PARTICIPANT_ID: identity.participantId,
    CHECKIN_USER_ID: identity.checkinUserId,
    TEACHER_GROUP: identity.teacherGroup || "",
    TITULO: String(payload.title || "").trim(),
    TEMA: String(payload.theme || "").trim(),
    OBSERVACAO: String(payload.note || payload.observation || "").trim(),
    STATUS: normalizeTextStatus_(payload.status || "rascunho"),
    CREATED_AT: now,
    UPDATED_AT: now,
    CURRENT_VERSION_ID: "",
    COMPARTILHADO_EDUCADOR: false,
    SELECIONADO_ANTOLOGIA: false,
    APP_VARIANT: String(payload.appVariant || DEFAULT_APP_VARIANT).trim() || DEFAULT_APP_VARIANT
  };

  appendRecordToSheet_(textsSheet, textTable.headers, textRecord);
  logTextActivity_(identity.participantId, textRecord.TEXT_ID, "create_text", {
    title: textRecord.TITULO,
    theme: textRecord.TEMA
  });

  return {
    ok: true,
    status: "success",
    text: mapTextDetail_(textRecord, null, 0)
  };
}

function handleSaveTextVersion_(payload) {
  ensureSextilhaInfrastructure_();
  var identity = resolveAuthorizedParticipant_(payload);
  var textId = String(payload.textId || "").trim();
  if (!textId) throw new Error("textId obrigatorio.");

  upsertUsersCacheRecord_(identity);

  var textEntry = getOwnedTextEntry_(identity.participantId, textId);
  var versions = getParticipantVersionsForText_(identity.participantId, textId);
  var textRecord = cloneRecord_(textEntry.record);
  var versionNumber = versions.length + 1;
  var verses = normalizeVersesArray_(payload.verses);
  var sharedWithEducator = toBoolean_(payload.sharedWithEducator);
  var status = normalizeTextStatus_(payload.status || textRecord.STATUS || "rascunho", sharedWithEducator);
  var now = new Date();
  var indicators = calculateSextilhaIndicators_({
    title: payload.title || textRecord.TITULO || "",
    theme: payload.theme || textRecord.TEMA || "",
    note: payload.note || payload.observation || textRecord.OBSERVACAO || "",
    verses: verses,
    revisionCount: versionNumber
  });

  var versionRecord = {
    VERSION_ID: buildEntityId_("version"),
    TEXT_ID: textId,
    PARTICIPANT_ID: identity.participantId,
    CHECKIN_USER_ID: identity.checkinUserId,
    TEACHER_GROUP: identity.teacherGroup || "",
    VERSION_NUMBER: versionNumber,
    TITULO: String(payload.title || textRecord.TITULO || "").trim(),
    TEMA: String(payload.theme || textRecord.TEMA || "").trim(),
    OBSERVACAO: String(payload.note || payload.observation || textRecord.OBSERVACAO || "").trim(),
    VERSO_1: verses[0],
    VERSO_2: verses[1],
    VERSO_3: verses[2],
    VERSO_4: verses[3],
    VERSO_5: verses[4],
    VERSO_6: verses[5],
    COMPLETUDE: indicators.completude,
    FECHAMENTO: indicators.fechamento,
    RIMA_STATUS: indicators.rimaStatus,
    COERENCIA_TEMATICA: indicators.coerenciaTematica,
    REPETICAO_LEXICAL: indicators.repeticaoLexical,
    REVISION_NOTE: String(payload.revisionNote || "").trim(),
    STATUS: status,
    COMPARTILHADO_EDUCADOR: sharedWithEducator,
    CREATED_AT: now
  };

  var versionsSheet = getSextilhaSheet_(TEXT_VERSIONS_SHEET_NAME);
  var versionsTable = getSheetTable_(versionsSheet);
  appendRecordToSheet_(versionsSheet, versionsTable.headers, versionRecord);

  textRecord.TITULO = versionRecord.TITULO;
  textRecord.TEMA = versionRecord.TEMA;
  textRecord.OBSERVACAO = versionRecord.OBSERVACAO;
  textRecord.STATUS = status;
  textRecord.UPDATED_AT = now;
  textRecord.CURRENT_VERSION_ID = versionRecord.VERSION_ID;
  textRecord.COMPARTILHADO_EDUCADOR = sharedWithEducator;

  var textsSheet = getSextilhaSheet_(TEXTS_SHEET_NAME);
  var textsTable = getSheetTable_(textsSheet);
  updateRecordInSheet_(textsSheet, textsTable.headers, textEntry.rowNumber, textRecord);
  logTextActivity_(identity.participantId, textId, "save_text_version", {
    versionId: versionRecord.VERSION_ID,
    versionNumber: versionNumber,
    status: status
  });
  var aiFeedback = toBoolean_(payload.includeAiFeedback)
    ? generateInannaFeedbackIfEnabled_(identity, textRecord, versionRecord, indicators)
    : null;

  return {
    ok: true,
    status: "success",
    text: mapTextDetail_(textRecord, versionRecord, versionNumber),
    version: mapVersionRecord_(versionRecord),
    aiFeedback: aiFeedback
  };
}

function handleGenerateTextFeedback_(payload) {
  ensureSextilhaInfrastructure_();
  var identity = resolveAuthorizedParticipant_(payload);
  var textId = String(payload.textId || "").trim();
  var versionId = String(payload.versionId || "").trim();
  if (!textId) throw new Error("textId obrigatorio.");

  var textEntry = getOwnedTextEntry_(identity.participantId, textId);
  var versions = getParticipantVersionsForText_(identity.participantId, textId);
  var versionEntry = versionId
    ? getOwnedVersionEntry_(identity.participantId, textId, versionId)
    : getCurrentVersionEntry_(textEntry.record, versions);

  if (!versionEntry) {
    throw new Error("Versao nao encontrada para gerar devolutiva.");
  }

  var existingFeedback = getAiFeedbackForVersion_(identity.participantId, versionId || versionEntry.record.VERSION_ID);
  if (existingFeedback) {
    return {
      ok: true,
      status: "success",
      reused: true,
      version: mapVersionRecord_(versionEntry.record),
      aiFeedback: {
        source: String(existingFeedback.EDUCATOR_ID || "").trim() === "INANNA_GEMINI" ? "gemini" : "inanna",
        tone: "success",
        message: String(existingFeedback.COMENTARIO || "").trim()
      }
    };
  }

  var versionIndicators = buildVersionIndicatorsPayload_(versionEntry.record);
  var aiFeedback = generateInannaFeedbackIfEnabled_(identity, textEntry.record, versionEntry.record, versionIndicators);

  return {
    ok: true,
    status: "success",
    version: mapVersionRecord_(versionEntry.record),
    aiFeedback: aiFeedback
  };
}

function handleUpdateTextStatus_(payload) {
  ensureSextilhaInfrastructure_();
  var identity = resolveAuthorizedParticipant_(payload);
  var textId = String(payload.textId || "").trim();
  if (!textId) throw new Error("textId obrigatorio.");

  var textEntry = getOwnedTextEntry_(identity.participantId, textId);
  var textRecord = cloneRecord_(textEntry.record);
  var sharedWithEducator = payload.sharedWithEducator === undefined ? toBoolean_(textRecord.COMPARTILHADO_EDUCADOR) : toBoolean_(payload.sharedWithEducator);
  var selectedForAnthology = payload.selectedForAnthology === undefined ? toBoolean_(textRecord.SELECIONADO_ANTOLOGIA) : toBoolean_(payload.selectedForAnthology);
  var status = normalizeTextStatus_(payload.status || textRecord.STATUS || "rascunho", sharedWithEducator);

  textRecord.STATUS = status;
  textRecord.COMPARTILHADO_EDUCADOR = sharedWithEducator;
  textRecord.SELECIONADO_ANTOLOGIA = selectedForAnthology;
  textRecord.UPDATED_AT = new Date();

  var textsSheet = getSextilhaSheet_(TEXTS_SHEET_NAME);
  var textsTable = getSheetTable_(textsSheet);
  updateRecordInSheet_(textsSheet, textsTable.headers, textEntry.rowNumber, textRecord);
  syncCurrentVersionStatus_(textRecord);

  logTextActivity_(identity.participantId, textId, "update_text_status", {
    status: status,
    sharedWithEducator: sharedWithEducator,
    selectedForAnthology: selectedForAnthology
  });

  var versions = getParticipantVersionsForText_(identity.participantId, textId);
  var currentVersion = getCurrentVersionEntry_(textRecord, versions);

  return {
    ok: true,
    status: "success",
    text: mapTextDetail_(textRecord, currentVersion ? currentVersion.record : null, versions.length)
  };
}

function handleArchiveText_(payload) {
  payload = payload || {};
  payload.status = "arquivada";
  return handleUpdateTextStatus_(payload);
}

function ensureSextilhaInfrastructure_() {
  getSextilhaSheet_(USERS_CACHE_SHEET_NAME);
  getSextilhaSheet_(TEXTS_SHEET_NAME);
  getSextilhaSheet_(TEXT_VERSIONS_SHEET_NAME);
  getSextilhaSheet_(TEXT_FEEDBACK_SHEET_NAME);
  getSextilhaSheet_(TEXT_ACTIVITY_LOG_SHEET_NAME);
}

function handleGetFirebaseCustomToken_(payload) {
  ensureSextilhaInfrastructure_();
  var identity = resolveAuthorizedParticipant_(payload);
  upsertUsersCacheRecord_(identity);

  return createFirebaseCustomToken_(identity);
}

function createFirebaseCustomToken_(identity) {
  var props = PropertiesService.getScriptProperties();
  var serviceAccountEmail = String(
    props.getProperty("INANNA_FIREBASE_SERVICE_ACCOUNT_EMAIL") ||
    props.getProperty("FIREBASE_SERVICE_ACCOUNT_EMAIL") ||
    ""
  ).trim();
  var serviceAccountPrivateKey = normalizePrivateKey_(
    props.getProperty("INANNA_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY") ||
    props.getProperty("FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY") ||
    ""
  );
  var projectId = String(
    props.getProperty("INANNA_FIREBASE_PROJECT_ID") ||
    props.getProperty("FIREBASE_PROJECT_ID") ||
    ""
  ).trim();

  if (!serviceAccountEmail || !serviceAccountPrivateKey || !projectId) {
    throw new Error("Firebase ainda nao foi configurado no Apps Script. Defina SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY e PROJECT_ID.");
  }

  var nowInSeconds = Math.floor(Date.now() / 1000);
  var expiresAtSeconds = nowInSeconds + 3600;
  var header = {
    alg: "RS256",
    typ: "JWT"
  };
  var payload = {
    iss: serviceAccountEmail,
    sub: serviceAccountEmail,
    aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
    iat: nowInSeconds,
    exp: expiresAtSeconds,
    uid: String(identity.checkinUserId || identity.participantId || "").trim(),
    claims: {
      participantId: identity.participantId,
      checkinUserId: identity.checkinUserId,
      teacherGroup: identity.teacherGroup || "",
      appVariant: identity.appVariant || DEFAULT_APP_VARIANT
    }
  };

  var encodedHeader = Utilities.base64EncodeWebSafe(JSON.stringify(header), Utilities.Charset.UTF_8).replace(/=+$/g, "");
  var encodedPayload = Utilities.base64EncodeWebSafe(JSON.stringify(payload), Utilities.Charset.UTF_8).replace(/=+$/g, "");
  var unsignedToken = encodedHeader + "." + encodedPayload;
  var signatureBytes = Utilities.computeRsaSha256Signature(unsignedToken, serviceAccountPrivateKey);
  var encodedSignature = Utilities.base64EncodeWebSafe(signatureBytes).replace(/=+$/g, "");

  return {
    status: "success",
    provider: "firestore",
    customToken: unsignedToken + "." + encodedSignature,
    expiresAt: new Date(expiresAtSeconds * 1000).toISOString(),
    projectId: projectId,
    uid: payload.uid
  };
}

function normalizePrivateKey_(value) {
  return String(value || "").replace(/\\n/g, "\n").trim();
}

function generateInannaFeedbackIfEnabled_(identity, textRecord, versionRecord, indicators) {
  var props = PropertiesService.getScriptProperties();
  var enabled = normalizeLooseText_(props.getProperty("INANNA_AI_FEEDBACK_ENABLED") || "");
  if (enabled !== "true" && enabled !== "1" && enabled !== "sim") {
    return null;
  }

  var apiKey = String(
    props.getProperty("INANNA_GEMINI_API_KEY") ||
    props.getProperty("GEMINI_API_KEY") ||
    ""
  ).trim();
  if (!apiKey) {
    return null;
  }

  try {
    var prompt = buildInannaFeedbackPrompt_(identity, textRecord, versionRecord, indicators);
    var feedbackText = requestUsefulGeminiFeedback_(apiKey, prompt, props);
    var source = "gemini";
    var educatorId = "INANNA_GEMINI";
    var category = "auto_ai_feedback";

    if (!isUsefulInannaFeedback_(feedbackText)) {
      feedbackText = buildFallbackInannaFeedback_(textRecord, versionRecord, indicators);
      source = "inanna";
      educatorId = "INANNA_RULES";
      category = "auto_ai_feedback_fallback";
    }

    persistInannaFeedback_(identity.participantId, versionRecord, feedbackText, educatorId, category);

    return {
      source: source,
      tone: "success",
      message: feedbackText
    };
  } catch (error) {
    logTextActivity_(identity.participantId, String(versionRecord.TEXT_ID || "").trim(), "ai_feedback_error", {
      message: error && error.message ? error.message : String(error)
    });
    var fallbackText = buildFallbackInannaFeedback_(textRecord, versionRecord, indicators);
    persistInannaFeedback_(identity.participantId, versionRecord, fallbackText, "INANNA_RULES", "auto_ai_feedback_fallback");
    return {
      source: "inanna",
      tone: "success",
      message: fallbackText
    };
  }
}

function testarInannaAi() {
  var props = PropertiesService.getScriptProperties();
  var enabled = normalizeLooseText_(props.getProperty("INANNA_AI_FEEDBACK_ENABLED") || "");
  var apiKey = String(
    props.getProperty("INANNA_GEMINI_API_KEY") ||
    props.getProperty("GEMINI_API_KEY") ||
    ""
  ).trim();
  var modelName = String(props.getProperty("INANNA_GEMINI_MODEL") || "gemini-2.5-flash").trim();
  var diagnostics = {
    ok: false,
    enabled: enabled === "true" || enabled === "1" || enabled === "sim",
    apiKeyConfigured: !!apiKey,
    model: modelName,
    timestamp: new Date().toISOString()
  };

  if (!diagnostics.enabled) {
    diagnostics.message = "Ative INANNA_AI_FEEDBACK_ENABLED=true antes do teste.";
    Logger.log(JSON.stringify(diagnostics, null, 2));
    return diagnostics;
  }

  if (!diagnostics.apiKeyConfigured) {
    diagnostics.message = "Defina INANNA_GEMINI_API_KEY nas propriedades do script.";
    Logger.log(JSON.stringify(diagnostics, null, 2));
    return diagnostics;
  }

  try {
    var prompt = buildInannaFeedbackPrompt_(
      {
        name: "Aluno de teste",
        participantId: "participant_demo"
      },
      {
        TITULO: "Noite no sertao",
        TEMA: "sertao",
        OBSERVACAO: "Rascunho inicial"
      },
      {
        TEXT_ID: "text_demo",
        VERSION_ID: "version_demo",
        TITULO: "Noite no sertao",
        TEMA: "sertao",
        OBSERVACAO: "Rascunho inicial",
        VERSO_1: "A lua clareou meu chao",
        VERSO_2: "No terreiro do meu viver",
        VERSO_3: "O vento cantou no portao",
        VERSO_4: "Chamando a rima pra nascer",
        VERSO_5: "Meu verso procura a canção",
        VERSO_6: "Pra no cordel amanhecer"
      },
      {
        completude: "6/6 versos preenchidos",
        fechamento: "versos completos",
        rimaStatus: "rima em formacao",
        coerenciaTematica: "boa unidade tematica",
        repeticaoLexical: "boa variedade",
        maturacao: "texto amadurecendo"
      }
    );

    var feedbackText = requestUsefulGeminiFeedback_(apiKey, prompt, props);
    if (!isUsefulInannaFeedback_(feedbackText)) {
      feedbackText = buildFallbackInannaFeedback_(
        {
          TITULO: "Noite no sertao",
          TEMA: "sertao",
          OBSERVACAO: "Rascunho inicial"
        },
        {
          TEXT_ID: "text_demo",
          VERSION_ID: "version_demo",
          TITULO: "Noite no sertao",
          TEMA: "sertao",
          OBSERVACAO: "Rascunho inicial",
          VERSO_1: "A lua clareou meu chao",
          VERSO_2: "No terreiro do meu viver",
          VERSO_3: "O vento cantou no portao",
          VERSO_4: "Chamando a rima pra nascer",
          VERSO_5: "Meu verso procura a canção",
          VERSO_6: "Pra no cordel amanhecer"
        },
        {
          completude: "6/6 versos preenchidos",
          fechamento: "versos completos",
          rimaStatus: "rima em formacao",
          coerenciaTematica: "boa unidade tematica",
          repeticaoLexical: "boa variedade",
          maturacao: "texto amadurecendo"
        }
      );
    }
    diagnostics.ok = !!feedbackText;
    diagnostics.sampleFeedback = feedbackText || "";
    diagnostics.message = feedbackText
      ? "Gemini respondeu com sucesso."
      : "A requisicao foi concluida, mas o Gemini nao devolveu texto.";
  } catch (error) {
    diagnostics.ok = false;
    diagnostics.message = error && error.message ? error.message : String(error);
  }

  Logger.log(JSON.stringify(diagnostics, null, 2));
  return diagnostics;
}

function buildInannaFeedbackPrompt_(identity, textRecord, versionRecord, indicators) {
  var verses = extractVersesFromVersionRecord_(versionRecord).filter(function (item) {
    return !!String(item || "").trim();
  });
  var theme = String(versionRecord.TEMA || textRecord.TEMA || "").trim();
  var title = String(versionRecord.TITULO || textRecord.TITULO || "").trim();
  var note = String(versionRecord.OBSERVACAO || textRecord.OBSERVACAO || "").trim();

  return [
    "Atue como Inanna, a presenca felina e delicada que acompanha a escrita no Laboratorio Cordel 2.0.",
    "Sua presenca lembra uma gata que passa entre as pernas com leveza: proxima, afetuosa, atenta e nunca invasiva.",
    "Escreva em portugues do Brasil.",
    "Dê uma devolutiva em 2 frases completas, calorosas e praticas, com 22 a 55 palavras no total.",
    "Comece direto pela leitura do texto. Nao use saudacoes como 'Ola', 'Oi' ou o nome do aluno isolado no inicio.",
    "Nunca escreva versos novos para o aluno e nunca reescreva o poema por ele.",
    "Valorize a autoria humana e use tom encorajador.",
    "Se houver algum ponto a revisar, indique apenas um proximo passo simples e realizavel.",
    "Evite elogios vazios. Cite uma qualidade concreta do texto antes da sugestao.",
    "Nao use bullets, aspas, emojis, titulos nem assinatura.",
    "",
    "Dados do aluno:",
    "Nome: " + String(identity.name || "").trim(),
    "Tema: " + theme,
    "Titulo: " + title,
    "Observacao inicial: " + note,
    "",
    "Sextilha atual:",
    verses.length ? verses.join("\n") : "Sem versos preenchidos.",
    "",
    "Indicadores heurísticos do sistema:",
    "- Completude: " + String(indicators.completude || ""),
    "- Fechamento: " + String(indicators.fechamento || ""),
    "- Rima: " + String(indicators.rimaStatus || ""),
    "- Coerencia tematica: " + String(indicators.coerenciaTematica || ""),
    "- Repeticao lexical: " + String(indicators.repeticaoLexical || ""),
    "- Maturacao: " + String(indicators.maturacao || ""),
    "",
    "Objetivo do retorno:",
    "1. Comece reconhecendo uma qualidade real do texto.",
    "2. Se necessario, aponte um unico ajuste de forma simples.",
    "3. Nao use linguagem competitiva nem fale em pontuacao.",
    "4. Mencione rima ou variacao lexical somente se isso realmente aparecer nos indicadores.",
    "5. A devolutiva final precisa soar como presenca sutil, nao como professora dando sermão."
  ].join("\n");
}

function requestGeminiFeedback_(apiKey, prompt, props) {
  var modelName = String(props.getProperty("INANNA_GEMINI_MODEL") || "gemini-2.5-flash").trim();
  var url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(modelName) + ":generateContent";
  var response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-goog-api-key": apiKey
    },
    muteHttpExceptions: true,
    payload: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 120
      }
    })
  });

  var responseCode = response.getResponseCode();
  var body = response.getContentText() || "{}";
  if (responseCode >= 400) {
    throw new Error("Gemini respondeu com erro " + responseCode + ": " + body);
  }

  return JSON.parse(body);
}

function requestUsefulGeminiFeedback_(apiKey, prompt, props) {
  var primaryResponse = requestGeminiFeedback_(apiKey, prompt, props);
  var primaryText = normalizeInannaFeedbackText_(extractGeminiText_(primaryResponse));
  if (isUsefulInannaFeedback_(primaryText)) {
    return primaryText;
  }

  var retryPrompt = [
    prompt,
    "",
    "Tente novamente seguindo todas as regras.",
    "Entregue exatamente 2 frases completas.",
    "Nao use saudacao.",
    "Fale de uma qualidade concreta do texto e proponha um unico proximo passo claro."
  ].join("\n");
  var retryResponse = requestGeminiFeedback_(apiKey, retryPrompt, props);
  return normalizeInannaFeedbackText_(extractGeminiText_(retryResponse));
}

function extractGeminiText_(response) {
  var candidates = response && response.candidates;
  if (!candidates || !candidates.length) return "";
  var parts = candidates[0].content && candidates[0].content.parts;
  if (!parts || !parts.length) return "";

  var text = parts.map(function (part) {
    return String(part && part.text || "").trim();
  }).join(" ").replace(/\s+/g, " ").trim();

  return text;
}

function normalizeInannaFeedbackText_(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/^["'“”‘’\s]+|["'“”‘’\s]+$/g, "")
    .trim();
}

function isUsefulInannaFeedback_(text) {
  var normalized = normalizeInannaFeedbackText_(text);
  if (!normalized || normalized.length < 48) return false;
  if (!/[.!?]/.test(normalized)) return false;

  var lower = normalized.toLowerCase();
  if (/^(ola|olá|oi|carlos[,!]?|aluno[,!]?)\b/.test(lower) && normalized.length < 80) {
    return false;
  }

  return true;
}

function persistInannaFeedback_(participantId, versionRecord, feedbackText, educatorId, category) {
  var message = normalizeInannaFeedbackText_(feedbackText);
  if (!message) return;

  appendRecordToSheet_(getSextilhaSheet_(TEXT_FEEDBACK_SHEET_NAME), TEXT_FEEDBACK_HEADERS, {
    FEEDBACK_ID: buildEntityId_("feedback"),
    TEXT_ID: String(versionRecord.TEXT_ID || "").trim(),
    VERSION_ID: String(versionRecord.VERSION_ID || "").trim(),
    PARTICIPANT_ID: participantId,
    EDUCATOR_ID: educatorId || "INANNA_RULES",
    COMENTARIO: message,
    CATEGORIA: category || "auto_ai_feedback",
    CREATED_AT: new Date()
  });
}

function buildFallbackInannaFeedback_(textRecord, versionRecord, indicators) {
  var verses = extractVersesFromVersionRecord_(versionRecord).filter(function (item) {
    return !!String(item || "").trim();
  });
  var theme = String(versionRecord.TEMA || textRecord.TEMA || "").trim();
  var firstSentence = "";
  var secondSentence = "";
  var rima = normalizeLooseText_(indicators.rimaStatus || "");
  var coerencia = normalizeLooseText_(indicators.coerenciaTematica || "");
  var repeticao = normalizeLooseText_(indicators.repeticaoLexical || "");
  var fechamento = normalizeLooseText_(indicators.fechamento || "");
  var completude = String(indicators.completude || "").trim();

  if (completude.indexOf("6/6") === 0 && rima.indexOf("consistente") !== -1) {
    firstSentence = "Sua sextilha ja sustenta um pulso bonito: os seis versos estao de pe e a rima ajuda o texto a caminhar com unidade.";
  } else if (coerencia.indexOf("boa unidade") !== -1 || coerencia.indexOf("tema presente") !== -1) {
    firstSentence = theme
      ? "O tema de " + theme + " ja aparece com nitidez, e isso da corpo ao caminho que seu texto esta escolhendo."
      : "Seu texto ja tem uma imagem central aparecendo com clareza, e isso ajuda a sextilha a ganhar identidade.";
  } else if (verses.length >= 4) {
    firstSentence = "Seu rascunho ja mostra materia poetica de verdade, com imagens que comecam a puxar o leitor para dentro do texto.";
  } else {
    firstSentence = "Ja existe um nucleo sensivel no que voce escreveu, e ele merece ser escutado com calma antes de crescer mais.";
  }

  if (repeticao.indexOf("alta") !== -1) {
    secondSentence = "No proximo retorno, vale variar uma ou duas palavras que se repetem para a musica dos versos respirar melhor.";
  } else if (rima.indexOf("formacao") !== -1 || rima.indexOf("consolidacao") !== -1) {
    secondSentence = "No proximo retorno, experimente aproximar mais os finais dos versos para a rima aparecer com mais naturalidade.";
  } else if (fechamento.indexOf("iniciando") !== -1 || fechamento.indexOf("fechamento") === -1) {
    secondSentence = "No proximo retorno, tente fechar cada verso com uma palavra mais inteira e sonora, para o conjunto pousar com mais firmeza.";
  } else if (coerencia.indexOf("reforcar") !== -1 || coerencia.indexOf("formacao") !== -1) {
    secondSentence = "No proximo retorno, escolha uma imagem ou sentimento central e deixe os seis versos girarem mais perto dele.";
  } else {
    secondSentence = "No proximo retorno, lapide o verso que mais te agrada e use esse tom como guia para os demais.";
  }

  return normalizeInannaFeedbackText_(firstSentence + " " + secondSentence);
}

function resolveAuthorizedParticipant_(input) {
  var participantId = String(input && input.participantId || "").trim();
  var checkinUserId = String(input && input.checkinUserId || "").trim();
  var email = normalizeEmail_(input && input.email);

  if (!participantId || !checkinUserId) {
    throw new Error("participantId e checkinUserId sao obrigatorios.");
  }

  if (email) {
    var match = resolveCheckinMatch_({ email: email });
    if (match.status !== "matched") {
      throw new Error("Usuario nao autorizado para a area de sextilhas.");
    }

    var rebuiltParticipantId = buildParticipantId_({
      email: match.email || email,
      name: match.name || "",
      municipio: match.city || "",
      estado: match.estado || "",
      origem: match.origem || "",
      checkinMatch: match
    });

    if (String(match.checkinUserId || "").trim() !== checkinUserId) {
      throw new Error("checkinUserId nao confere com o e-mail informado.");
    }
    if (rebuiltParticipantId !== participantId) {
      throw new Error("participantId nao confere com o check-in informado.");
    }

    return {
      participantId: participantId,
      checkinUserId: checkinUserId,
      email: match.email || email,
      name: match.name || String(input.name || "").trim(),
      municipio: match.city || String(input.municipio || "").trim(),
      estado: normalizeUFOrInternational_(match.estado || input.estado || ""),
      origem: normalizeOrigem_(match.origem || input.origem || ""),
      teacherGroup: match.teacherGroup || String(input.teacherGroup || "").trim(),
      appVariant: String(input.appVariant || DEFAULT_APP_VARIANT).trim() || DEFAULT_APP_VARIANT
    };
  }

  var cachedUser = getUserCacheByParticipantId_(participantId);
  if (!cachedUser || String(cachedUser.CHECKIN_USER_ID || "").trim() !== checkinUserId) {
    throw new Error("Nao foi possivel validar a identidade do participante.");
  }

  return {
    participantId: participantId,
    checkinUserId: checkinUserId,
    email: String(cachedUser.EMAIL || "").trim(),
    name: String(cachedUser.NOME || "").trim(),
    municipio: String(cachedUser.MUNICIPIO || "").trim(),
    estado: normalizeUFOrInternational_(cachedUser.ESTADO || ""),
    origem: normalizeOrigem_(cachedUser.ORIGEM || ""),
    teacherGroup: String(cachedUser.TEACHER_GROUP || "").trim(),
    appVariant: String(input && input.appVariant || cachedUser.APP_VARIANT || DEFAULT_APP_VARIANT).trim() || DEFAULT_APP_VARIANT
  };
}

function upsertUsersCacheRecord_(identity) {
  var sheet = getSextilhaSheet_(USERS_CACHE_SHEET_NAME);
  var table = getSheetTable_(sheet);
  var existing = null;

  for (var i = 0; i < table.rows.length; i++) {
    if (String(table.rows[i].record.PARTICIPANT_ID || "").trim() === identity.participantId) {
      existing = table.rows[i];
      break;
    }
  }

  var now = new Date();
  var record = existing ? cloneRecord_(existing.record) : {};
  record.PARTICIPANT_ID = identity.participantId;
  record.CHECKIN_USER_ID = identity.checkinUserId;
  record.NOME = identity.name || "";
  record.EMAIL = identity.email || "";
  record.MUNICIPIO = identity.municipio || "";
  record.ESTADO = identity.estado || "";
  record.ORIGEM = identity.origem || "";
  record.TEACHER_GROUP = identity.teacherGroup || "";
  record.APP_VARIANT = identity.appVariant || DEFAULT_APP_VARIANT;
  record.CREATED_AT = existing ? existing.record.CREATED_AT : now;
  record.UPDATED_AT = now;

  if (existing) {
    updateRecordInSheet_(sheet, table.headers, existing.rowNumber, record);
  } else {
    appendRecordToSheet_(sheet, table.headers, record);
  }
}

function getUserCacheByParticipantId_(participantId) {
  ensureSextilhaInfrastructure_();
  var table = getSheetTable_(getSextilhaSheet_(USERS_CACHE_SHEET_NAME));

  for (var i = 0; i < table.rows.length; i++) {
    if (String(table.rows[i].record.PARTICIPANT_ID || "").trim() === String(participantId || "").trim()) {
      return table.rows[i].record;
    }
  }

  return null;
}

function getParticipantTextSummaries_(participantId) {
  ensureSextilhaInfrastructure_();
  var textsTable = getSheetTable_(getSextilhaSheet_(TEXTS_SHEET_NAME));
  var versionsTable = getSheetTable_(getSextilhaSheet_(TEXT_VERSIONS_SHEET_NAME));
  var versionsByTextId = {};

  for (var i = 0; i < versionsTable.rows.length; i++) {
    var versionRecord = versionsTable.rows[i].record;
    if (String(versionRecord.PARTICIPANT_ID || "").trim() !== String(participantId || "").trim()) continue;
    var versionTextId = String(versionRecord.TEXT_ID || "").trim();
    if (!versionsByTextId[versionTextId]) versionsByTextId[versionTextId] = [];
    versionsByTextId[versionTextId].push(versionRecord);
  }

  Object.keys(versionsByTextId).forEach(function (textId) {
    versionsByTextId[textId].sort(function (a, b) {
      return (Number(a.VERSION_NUMBER) || 0) - (Number(b.VERSION_NUMBER) || 0);
    });
  });

  var texts = [];
  for (var j = 0; j < textsTable.rows.length; j++) {
    var textRecord = textsTable.rows[j].record;
    if (String(textRecord.PARTICIPANT_ID || "").trim() !== String(participantId || "").trim()) continue;
    var versions = versionsByTextId[String(textRecord.TEXT_ID || "").trim()] || [];
    var currentVersion = getCurrentVersionRecord_(textRecord, versions);
    texts.push(mapTextSummary_(textRecord, currentVersion, versions.length));
  }

  texts.sort(function (a, b) {
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
  });

  return texts;
}

function getOwnedTextEntry_(participantId, textId) {
  var table = getSheetTable_(getSextilhaSheet_(TEXTS_SHEET_NAME));

  for (var i = 0; i < table.rows.length; i++) {
    var record = table.rows[i].record;
    if (String(record.TEXT_ID || "").trim() !== String(textId || "").trim()) continue;
    if (String(record.PARTICIPANT_ID || "").trim() !== String(participantId || "").trim()) {
      throw new Error("O participante nao tem acesso a este texto.");
    }
    return table.rows[i];
  }

  throw new Error("Texto nao encontrado.");
}

function getOwnedVersionEntry_(participantId, textId, versionId) {
  var versionEntries = getParticipantVersionsForText_(participantId, textId);

  for (var i = 0; i < versionEntries.length; i++) {
    if (String(versionEntries[i].record.VERSION_ID || "").trim() === String(versionId || "").trim()) {
      return versionEntries[i];
    }
  }

  return null;
}

function getParticipantVersionsForText_(participantId, textId) {
  var table = getSheetTable_(getSextilhaSheet_(TEXT_VERSIONS_SHEET_NAME));
  var result = [];

  for (var i = 0; i < table.rows.length; i++) {
    var record = table.rows[i].record;
    if (String(record.TEXT_ID || "").trim() !== String(textId || "").trim()) continue;
    if (String(record.PARTICIPANT_ID || "").trim() !== String(participantId || "").trim()) continue;
    result.push(table.rows[i]);
  }

  result.sort(function (a, b) {
    return (Number(a.record.VERSION_NUMBER) || 0) - (Number(b.record.VERSION_NUMBER) || 0);
  });

  return result;
}

function getCurrentVersionEntry_(textRecord, versionEntries) {
  if (!versionEntries || !versionEntries.length) return null;
  var currentVersionId = String(textRecord.CURRENT_VERSION_ID || "").trim();

  if (currentVersionId) {
    for (var i = 0; i < versionEntries.length; i++) {
      if (String(versionEntries[i].record.VERSION_ID || "").trim() === currentVersionId) {
        return versionEntries[i];
      }
    }
  }

  return versionEntries[versionEntries.length - 1];
}

function getAiFeedbackForVersion_(participantId, versionId) {
  var table = getSheetTable_(getSextilhaSheet_(TEXT_FEEDBACK_SHEET_NAME));

  for (var i = table.rows.length - 1; i >= 0; i--) {
    var record = table.rows[i].record;
    if (String(record.PARTICIPANT_ID || "").trim() !== String(participantId || "").trim()) continue;
    if (String(record.VERSION_ID || "").trim() !== String(versionId || "").trim()) continue;
    return record;
  }

  return null;
}

function getCurrentVersionRecord_(textRecord, versionRecords) {
  if (!versionRecords || !versionRecords.length) return null;
  var currentVersionId = String(textRecord.CURRENT_VERSION_ID || "").trim();

  if (currentVersionId) {
    for (var i = 0; i < versionRecords.length; i++) {
      if (String(versionRecords[i].VERSION_ID || "").trim() === currentVersionId) {
        return versionRecords[i];
      }
    }
  }

  return versionRecords[versionRecords.length - 1];
}

function syncCurrentVersionStatus_(textRecord) {
  var currentVersionId = String(textRecord.CURRENT_VERSION_ID || "").trim();
  if (!currentVersionId) return;

  var sheet = getSextilhaSheet_(TEXT_VERSIONS_SHEET_NAME);
  var table = getSheetTable_(sheet);

  for (var i = 0; i < table.rows.length; i++) {
    if (String(table.rows[i].record.VERSION_ID || "").trim() !== currentVersionId) continue;
    var versionRecord = cloneRecord_(table.rows[i].record);
    versionRecord.STATUS = textRecord.STATUS || versionRecord.STATUS || "rascunho";
    versionRecord.COMPARTILHADO_EDUCADOR = toBoolean_(textRecord.COMPARTILHADO_EDUCADOR);
    updateRecordInSheet_(sheet, table.headers, table.rows[i].rowNumber, versionRecord);
    return;
  }
}

function mapTextSummary_(textRecord, currentVersionRecord, versionCount) {
  return {
    textId: String(textRecord.TEXT_ID || "").trim(),
    title: String(textRecord.TITULO || "").trim(),
    theme: String(textRecord.TEMA || "").trim(),
    note: String(textRecord.OBSERVACAO || "").trim(),
    status: normalizeTextStatus_(textRecord.STATUS || "rascunho"),
    createdAt: toIsoString_(textRecord.CREATED_AT),
    updatedAt: toIsoString_(textRecord.UPDATED_AT || textRecord.CREATED_AT),
    currentVersionId: String(textRecord.CURRENT_VERSION_ID || "").trim(),
    versionCount: Number(versionCount) || 0,
    sharedWithEducator: toBoolean_(textRecord.COMPARTILHADO_EDUCADOR),
    selectedForAnthology: toBoolean_(textRecord.SELECIONADO_ANTOLOGIA),
    indicators: buildTextIndicatorsPayload_(currentVersionRecord, versionCount)
  };
}

function mapTextDetail_(textRecord, currentVersionRecord, versionCount) {
  var summary = mapTextSummary_(textRecord, currentVersionRecord, versionCount);
  summary.participantId = String(textRecord.PARTICIPANT_ID || "").trim();
  summary.checkinUserId = String(textRecord.CHECKIN_USER_ID || "").trim();
  summary.teacherGroup = String(textRecord.TEACHER_GROUP || "").trim();
  summary.verses = currentVersionRecord ? extractVersesFromVersionRecord_(currentVersionRecord) : normalizeVersesArray_([]);
  summary.latestVersion = currentVersionRecord ? mapVersionRecord_(currentVersionRecord) : null;
  return summary;
}

function mapVersionRecord_(record) {
  return {
    versionId: String(record.VERSION_ID || "").trim(),
    textId: String(record.TEXT_ID || "").trim(),
    participantId: String(record.PARTICIPANT_ID || "").trim(),
    versionNumber: Number(record.VERSION_NUMBER) || 0,
    title: String(record.TITULO || "").trim(),
    theme: String(record.TEMA || "").trim(),
    note: String(record.OBSERVACAO || "").trim(),
    verses: extractVersesFromVersionRecord_(record),
    status: normalizeTextStatus_(record.STATUS || "rascunho"),
    sharedWithEducator: toBoolean_(record.COMPARTILHADO_EDUCADOR),
    createdAt: toIsoString_(record.CREATED_AT),
    indicators: {
      completude: String(record.COMPLETUDE || ""),
      fechamento: String(record.FECHAMENTO || ""),
      rimaStatus: String(record.RIMA_STATUS || ""),
      coerenciaTematica: String(record.COERENCIA_TEMATICA || ""),
      repeticaoLexical: String(record.REPETICAO_LEXICAL || ""),
      numberOfRevisions: Number(record.VERSION_NUMBER) || 0,
      maturacao: buildMaturationLabel_(Number(record.VERSION_NUMBER) || 0)
    },
    revisionNote: String(record.REVISION_NOTE || "").trim()
  };
}

function buildTextIndicatorsPayload_(currentVersionRecord, versionCount) {
  if (!currentVersionRecord) {
    return {
      completude: "0/6 versos preenchidos",
      fechamento: "texto iniciando",
      rimaStatus: "rima em formacao",
      coerenciaTematica: "tema em formacao",
      repeticaoLexical: "boa variedade lexical",
      numberOfRevisions: Number(versionCount) || 0,
      maturacao: buildMaturationLabel_(Number(versionCount) || 0)
    };
  }

  return {
    completude: String(currentVersionRecord.COMPLETUDE || ""),
    fechamento: String(currentVersionRecord.FECHAMENTO || ""),
    rimaStatus: String(currentVersionRecord.RIMA_STATUS || ""),
    coerenciaTematica: String(currentVersionRecord.COERENCIA_TEMATICA || ""),
    repeticaoLexical: String(currentVersionRecord.REPETICAO_LEXICAL || ""),
    numberOfRevisions: Number(currentVersionRecord.VERSION_NUMBER) || Number(versionCount) || 0,
    maturacao: buildMaturationLabel_(Number(currentVersionRecord.VERSION_NUMBER) || Number(versionCount) || 0)
  };
}

function buildVersionIndicatorsPayload_(versionRecord) {
  return buildTextIndicatorsPayload_(versionRecord, Number(versionRecord && versionRecord.VERSION_NUMBER) || 0);
}

function extractVersesFromVersionRecord_(record) {
  return [
    String(record.VERSO_1 || "").trim(),
    String(record.VERSO_2 || "").trim(),
    String(record.VERSO_3 || "").trim(),
    String(record.VERSO_4 || "").trim(),
    String(record.VERSO_5 || "").trim(),
    String(record.VERSO_6 || "").trim()
  ];
}

function normalizeVersesArray_(verses) {
  var input = Array.isArray(verses) ? verses : [];
  var result = [];

  for (var i = 0; i < 6; i++) {
    result.push(String(input[i] || "").trim());
  }

  return result;
}

function calculateSextilhaIndicators_(input) {
  var verses = normalizeVersesArray_(input.verses);
  var filledVerses = verses.filter(function (verse) { return !!verse; });
  var filledCount = filledVerses.length;
  var finalWords = filledVerses.map(function (verse) {
    return getLastWordScore(verse);
  }).filter(function (word) {
    return !!word;
  });

  var completude = filledCount + "/6 versos preenchidos";
  var fechamento = "texto iniciando";

  if (filledCount) {
    var goodEndings = finalWords.filter(function (word) {
      return word.length >= 2 && !isSuspiciousJoinedTokenScore(word);
    }).length;
    if (goodEndings === filledCount && filledCount === 6) {
      fechamento = "fechamento consistente";
    } else if (goodEndings >= Math.max(1, filledCount - 1)) {
      fechamento = "versos em fechamento";
    } else {
      fechamento = "revisar finais dos versos";
    }
  }

  var rimaStatus = "rima em formacao";
  if (finalWords.length >= 2) {
    var bestSuffixScore = findBestRepeatedSuffixScore_(finalWords);
    if (bestSuffixScore >= 3) {
      rimaStatus = "rima consistente";
    } else if (bestSuffixScore === 2) {
      rimaStatus = "rima em consolidacao";
    } else if (bestSuffixScore === 1) {
      rimaStatus = "rima leve aparecendo";
    } else {
      rimaStatus = "rima livre em desenvolvimento";
    }
  }

  var temaTokens = extractMeaningfulTokens_([
    input.title || "",
    input.theme || "",
    input.note || ""
  ].join(" "));
  var verseTokens = extractMeaningfulTokens_(verses.join(" "));
  var overlap = countTokenOverlap_(temaTokens, verseTokens);
  var coerenciaTematica = "tema em formacao";

  if (temaTokens.length === 0) {
    coerenciaTematica = filledCount >= 3 ? "boa unidade do texto" : "tema em aberto";
  } else if (overlap >= Math.min(2, temaTokens.length)) {
    coerenciaTematica = "boa unidade tematica";
  } else if (overlap >= 1) {
    coerenciaTematica = "tema presente";
  } else if (filledCount >= 3) {
    coerenciaTematica = "reforcar unidade tematica";
  }

  var repetitionData = analyzeLexicalRepetition_(verseTokens, finalWords);

  return {
    completude: completude,
    fechamento: fechamento,
    rimaStatus: rimaStatus,
    coerenciaTematica: coerenciaTematica,
    repeticaoLexical: repetitionData.label,
    numberOfRevisions: Number(input.revisionCount) || 0,
    maturacao: buildMaturationLabel_(Number(input.revisionCount) || 0)
  };
}

function findBestRepeatedSuffixScore_(finalWords) {
  var best = 0;
  var lengths = [3, 2, 1];

  for (var i = 0; i < lengths.length; i++) {
    var counts = {};
    for (var j = 0; j < finalWords.length; j++) {
      if (finalWords[j].length < lengths[i]) continue;
      var suffix = finalWords[j].slice(-lengths[i]);
      counts[suffix] = (counts[suffix] || 0) + 1;
    }

    var maxRepeat = 0;
    Object.keys(counts).forEach(function (suffix) {
      maxRepeat = Math.max(maxRepeat, counts[suffix]);
    });

    if (maxRepeat >= 3) return lengths[i];
    if (maxRepeat >= 2) best = Math.max(best, lengths[i]);
  }

  return best;
}

function extractMeaningfulTokens_(text) {
  var stopwords = {
    a: true, o: true, as: true, os: true, e: true, de: true, da: true, do: true, das: true, dos: true,
    em: true, no: true, na: true, nos: true, nas: true, com: true, por: true, para: true, pra: true,
    pro: true, que: true, se: true, um: true, uma: true, uns: true, umas: true, meu: true, minha: true,
    teu: true, tua: true, seu: true, sua: true, eu: true, tu: true, ele: true, ela: true, nos: true,
    vos: true, eles: true, elas: true
  };

  return normalizeLooseText_(text)
    .split(/\s+/)
    .filter(function (token) {
      return token && token.length > 2 && !stopwords[token];
    });
}

function countTokenOverlap_(sourceTokens, targetTokens) {
  var sourceMap = {};
  var overlap = 0;

  for (var i = 0; i < sourceTokens.length; i++) {
    sourceMap[sourceTokens[i]] = true;
  }

  for (var j = 0; j < targetTokens.length; j++) {
    if (sourceMap[targetTokens[j]]) {
      overlap += 1;
      delete sourceMap[targetTokens[j]];
    }
  }

  return overlap;
}

function analyzeLexicalRepetition_(tokens, finalWords) {
  var counts = {};
  var highest = 0;

  for (var i = 0; i < tokens.length; i++) {
    counts[tokens[i]] = (counts[tokens[i]] || 0) + 1;
    highest = Math.max(highest, counts[tokens[i]]);
  }

  for (var j = 0; j < finalWords.length; j++) {
    counts[finalWords[j]] = (counts[finalWords[j]] || 0) + 1;
    highest = Math.max(highest, counts[finalWords[j]]);
  }

  if (highest >= 4) return { label: "repeticao alta" };
  if (highest === 3) return { label: "alguma repeticao" };
  return { label: "boa variedade lexical" };
}

function buildMaturationLabel_(revisionCount) {
  if (revisionCount >= 4) return "texto amadurecido";
  if (revisionCount >= 2) return "texto amadurecendo";
  if (revisionCount === 1) return "primeira versao registrada";
  return "texto iniciando";
}

function normalizeTextStatus_(value, sharedWithEducator) {
  var normalized = normalizeLooseText_(value).replace(/\s+/g, " ").trim();

  if (!normalized) {
    return sharedWithEducator ? "compartilhada com educador" : "rascunho";
  }
  if (normalized.indexOf("selecion") === 0) return "selecionada para antologia";
  if (normalized.indexOf("compart") === 0) return "compartilhada com educador";
  if (normalized.indexOf("concl") === 0) return "concluida";
  if (normalized.indexOf("revis") !== -1) return "em revisao";
  if (normalized.indexOf("arquiv") === 0) return "arquivada";
  return "rascunho";
}

function logTextActivity_(participantId, textId, action, details) {
  var sheet = getSextilhaSheet_(TEXT_ACTIVITY_LOG_SHEET_NAME);
  var table = getSheetTable_(sheet);

  appendRecordToSheet_(sheet, table.headers, {
    LOG_ID: buildEntityId_("log"),
    PARTICIPANT_ID: participantId,
    TEXT_ID: textId || "",
    ACAO: String(action || "").trim(),
    DETALHES: safeJsonStringify_(details || {}),
    CREATED_AT: new Date()
  });
}

function safeJsonStringify_(value) {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function getSheetByAliases_(ss, names) {
  var cleanNames = (names || []).filter(function (name) {
    return !!String(name || "").trim();
  });

  for (var i = 0; i < cleanNames.length; i++) {
    var found = ss.getSheetByName(cleanNames[i]);
    if (found) return found;
  }

  var normalizedAliases = cleanNames.map(function (name) {
    return normalizeLooseText_(name);
  });
  var sheets = ss.getSheets();

  for (var j = 0; j < sheets.length; j++) {
    if (normalizedAliases.indexOf(normalizeLooseText_(sheets[j].getName())) !== -1) {
      return sheets[j];
    }
  }

  return null;
}

function ensureSheetConfigured_(ss, canonicalName, aliases, headers, headerColor) {
  var searchNames = [canonicalName].concat(aliases || []);
  var sheet = getSheetByAliases_(ss, searchNames);

  if (!sheet) {
    sheet = ss.insertSheet(canonicalName);
  } else if (sheet.getName() !== canonicalName && !ss.getSheetByName(canonicalName)) {
    sheet.setName(canonicalName);
  }

  ensureHeaders_(sheet, headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground(headerColor || "#ffffff");
  sheet.setFrozenRows(1);
  return sheet;
}

function isRecordsSheet_(sheet) {
  if (!sheet) return false;
  return REGISTRY_SHEET_ALIASES.concat([DEFAULT_REGISTRY_SHEET_NAME]).map(function (name) {
    return normalizeLooseText_(name);
  }).indexOf(normalizeLooseText_(sheet.getName())) !== -1;
}

function getSheetTable_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (!values || !values.length) {
    return { headers: [], rows: [] };
  }

  var headers = values[0].map(function (header) {
    return String(header || "").trim();
  });
  var rows = [];

  for (var i = 1; i < values.length; i++) {
    rows.push({
      rowNumber: i + 1,
      values: values[i],
      record: buildRecordFromRow_(headers, values[i])
    });
  }

  return {
    headers: headers,
    rows: rows
  };
}

function buildRecordFromRow_(headers, row) {
  var record = {};
  for (var i = 0; i < headers.length; i++) {
    record[headers[i]] = row[i];
  }
  return record;
}

function appendRecordToSheet_(sheet, headers, record) {
  sheet.appendRow(buildRowFromRecord_(headers, record));
}

function updateRecordInSheet_(sheet, headers, rowNumber, record) {
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([
    buildRowFromRecord_(headers, record)
  ]);
}

function buildRowFromRecord_(headers, record) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    row.push(Object.prototype.hasOwnProperty.call(record, headers[i]) ? record[headers[i]] : "");
  }
  return row;
}

function cloneRecord_(record) {
  var clone = {};
  Object.keys(record || {}).forEach(function (key) {
    clone[key] = record[key];
  });
  return clone;
}

function toIsoString_(value) {
  if (!value) return "";
  var date = value instanceof Date ? value : new Date(value);
  if (!date || !date.getTime || isNaN(date.getTime())) {
    return String(value);
  }
  return date.toISOString();
}

function coerceNumericCell_(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (value instanceof Date) return 0;
  if (typeof value === "number") {
    return isNaN(value) ? 0 : value;
  }

  var normalized = String(value)
    .replace(/\s+/g, "")
    .replace(",", ".");
  var parsed = Number(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

function toBoolean_(value) {
  if (value === true || value === false) return value;
  var normalized = normalizeLooseText_(value);
  return normalized === "true" || normalized === "1" || normalized === "sim" || normalized === "yes";
}

function ensureHeaders_(sheet, headers) {
  var width = Math.max(sheet.getLastColumn(), headers.length, 1);
  var currentHeaders = sheet.getRange(1, 1, 1, width).getValues()[0];
  var existingMap = buildHeaderMapFromRow_(currentHeaders);
  var changed = sheet.getLastRow() === 0;

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var key = normalizeHeaderKey_(header);
    if (!existingMap[key]) {
      currentHeaders[i] = header;
      existingMap[key] = i + 1;
      changed = true;
    } else if (!currentHeaders[existingMap[key] - 1]) {
      currentHeaders[existingMap[key] - 1] = header;
      changed = true;
    }
  }

  while (currentHeaders.length < width) currentHeaders.push("");

  if (changed || !String(currentHeaders[0] || "").trim()) {
    sheet.getRange(1, 1, 1, width).setValues([currentHeaders]);
  }

  sheet.setFrozenRows(1);
  return buildHeaderMapFromRow_(sheet.getRange(1, 1, 1, width).getValues()[0]);
}

function buildHeaderMapFromRow_(headers) {
  var map = {};
  for (var i = 0; i < headers.length; i++) {
    var key = normalizeHeaderKey_(headers[i]);
    if (key) map[key] = i + 1;
  }
  return map;
}

function findHeaderIndex_(headerMap, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var key = normalizeHeaderKey_(candidates[i]);
    if (headerMap[key]) return headerMap[key];
  }
  return 0;
}

function normalizeHeaderKey_(value) {
  return normalizeText_(value).replace(/[^a-z0-9]+/g, " ").trim().toUpperCase();
}

function buildBlankRow_(width) {
  var row = [];
  for (var i = 0; i < width; i++) row.push("");
  return row;
}

function setRowValue_(row, headerMap, header, value) {
  var index = headerMap[normalizeHeaderKey_(header)];
  if (!index) return;
  row[index - 1] = value;
}

function readRowValueByHeaders_(headerMap, row, headers) {
  var index = findHeaderIndex_(headerMap, headers);
  if (!index) return "";
  return String(row[index - 1] || "").trim();
}

function normalizeEmail_(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePersonName_(value) {
  return normalizeLooseText_(value).replace(/\s+/g, " ").trim();
}

function normalizeLooseText_(value) {
  return normalizeText_(value).replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeText_(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeUFOrInternational_(value) {
  var ufs = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];
  var text = String(value || "").trim().toUpperCase();
  if (!text) return "";
  if (text.indexOf("INTERNAC") !== -1 || text === "INT" || text === "INTL") return "INTERNACIONAL";

  var letters = text.replace(/[^A-Z]/g, "").slice(0, 2);
  if (ufs.indexOf(letters) !== -1) return letters;
  if (ufs.indexOf(text) !== -1) return text;
  return "INTERNACIONAL";
}

function normalizeOrigem_(value) {
  var text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (text.indexOf("oficina") !== -1 || text.indexOf("cordel") !== -1) return "Oficina Cordel 2.0";
  if (text.indexOf("part") !== -1 || text.indexOf("priv") !== -1) return "Particular";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function sanitizeJsonpCallback_(callback) {
  var clean = String(callback || "").trim();
  if (!/^[A-Za-z0-9_.$]+$/.test(clean)) {
    throw new Error("Callback invalido.");
  }
  return clean;
}

function setupInicial() {
  return reconfigurarPlanilhaInanna();
}

function reconfigurarPlanilhaInanna() {
  var ss = getRegistrySpreadsheet_();
  var summary = {
    ok: true,
    spreadsheetId: ss.getId(),
    appVariant: DEFAULT_APP_VARIANT,
    sheets: {}
  };

  summary.sheets.records = ensureSheetConfigured_(ss, DEFAULT_REGISTRY_SHEET_NAME, REGISTRY_SHEET_ALIASES, FORM_HEADERS, "#d9ead3").getName();
  summary.sheets.placar = ensureSheetConfigured_(ss, PLACAR_SHEET_NAME, [PLACAR_SHEET_NAME], PLACAR_HEADERS, "#fff2cc").getName();
  summary.sheets.usersCache = ensureSheetConfigured_(ss, USERS_CACHE_SHEET_NAME, [USERS_CACHE_SHEET_NAME], USERS_CACHE_HEADERS, "#d9edf7").getName();
  summary.sheets.texts = ensureSheetConfigured_(ss, TEXTS_SHEET_NAME, [TEXTS_SHEET_NAME], TEXTS_HEADERS, "#fce5cd").getName();
  summary.sheets.textVersions = ensureSheetConfigured_(ss, TEXT_VERSIONS_SHEET_NAME, [TEXT_VERSIONS_SHEET_NAME], TEXT_VERSIONS_HEADERS, "#fff2cc").getName();
  summary.sheets.textFeedback = ensureSheetConfigured_(ss, TEXT_FEEDBACK_SHEET_NAME, [TEXT_FEEDBACK_SHEET_NAME], TEXT_FEEDBACK_HEADERS, "#ead1dc").getName();
  summary.sheets.textActivityLog = ensureSheetConfigured_(ss, TEXT_ACTIVITY_LOG_SHEET_NAME, [TEXT_ACTIVITY_LOG_SHEET_NAME], TEXT_ACTIVITY_LOG_HEADERS, "#d9d2e9").getName();

  atualizarPlacar(ss, getRecordsSheet_());
  garantirTriggersDoPlacar_();

  Logger.log(JSON.stringify(summary, null, 2));
  return summary;
}

function reconstruirPlacar() {
  atualizarPlacar(getRegistrySpreadsheet_(), getRecordsSheet_());
  garantirTriggersDoPlacar_();
  Logger.log("Placar reconstruido com sucesso.");
}

function sincronizarPlacar_() {
  atualizarPlacar(getRegistrySpreadsheet_(), getRecordsSheet_());
}

function aoNovoRegistroAtualizarPlacar(e) {
  sincronizarPlacar_();
}

function aoEditarRegistroAtualizarPlacar(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (!isRecordsSheet_(sheet)) return;
  if (e.range.getRow() <= 1) return;
  sincronizarPlacar_();
}

function limparTriggersDoPlacar() {
  var handlers = {
    aoNovoRegistroAtualizarPlacar: true,
    aoEditarRegistroAtualizarPlacar: true
  };

  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    var handler = trigger.getHandlerFunction();
    if (handlers[handler]) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function garantirTriggersDoPlacar_() {
  var requiredHandlers = {
    aoNovoRegistroAtualizarPlacar: false,
    aoEditarRegistroAtualizarPlacar: false
  };

  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    var handler = trigger.getHandlerFunction();
    if (Object.prototype.hasOwnProperty.call(requiredHandlers, handler)) {
      requiredHandlers[handler] = true;
    }
  });

  if (requiredHandlers.aoNovoRegistroAtualizarPlacar && requiredHandlers.aoEditarRegistroAtualizarPlacar) {
    return false;
  }

  instalarTriggersDoPlacar();
  return true;
}

function instalarTriggersDoPlacar() {
  limparTriggersDoPlacar();
  var registrySpreadsheetId = getRegistrySpreadsheet_().getId();

  ScriptApp.newTrigger("aoNovoRegistroAtualizarPlacar")
    .forSpreadsheet(registrySpreadsheetId)
    .onFormSubmit()
    .create();

  ScriptApp.newTrigger("aoEditarRegistroAtualizarPlacar")
    .forSpreadsheet(registrySpreadsheetId)
    .onEdit()
    .create();

  Logger.log("Triggers do placar instalados com sucesso.");
}

function buildBackupTimestamp_() {
  var tz = Session.getScriptTimeZone() || "America/Sao_Paulo";
  return Utilities.formatDate(new Date(), tz, "yyyyMMdd_HHmmss");
}

function buildUniqueBackupSheetName_(ss, baseName) {
  var safeBase = String(baseName || "backup").slice(0, 85);
  var candidate = safeBase;
  var suffix = 1;

  while (ss.getSheetByName(candidate)) {
    candidate = safeBase.slice(0, 80) + "_" + suffix;
    suffix += 1;
  }

  return candidate;
}

function backupSheetBeforeReset_(ss, sourceSheet, backupPrefix) {
  if (!sourceSheet) return null;
  var stamp = buildBackupTimestamp_();
  var backupName = buildUniqueBackupSheetName_(ss, backupPrefix + "_" + stamp);
  var backupSheet = sourceSheet.copyTo(ss).setName(backupName);
  backupSheet.activate();
  ss.moveActiveSheet(ss.getNumSheets());
  backupSheet.getRange(1, 1).setNote("Backup automatico criado antes do reset em " + stamp + ".");
  return backupName;
}

function resetSheetWithHeaders_(sheet, headers, headerColor) {
  if (!sheet) return;
  sheet.clear();
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground(headerColor || "#ffffff");
  sheet.setFrozenRows(1);
}

function resetPlacarERegistrosComBackup() {
  var ss = getRegistrySpreadsheet_();
  var formSheet = getRecordsSheet_();
  var placarSheet = getPlacarSheet_();
  var backups = [];

  if (formSheet && formSheet.getLastRow() > 0) {
    backups.push(backupSheetBeforeReset_(ss, formSheet, "backup_registros"));
  }
  if (placarSheet && placarSheet.getLastRow() > 0) {
    backups.push(backupSheetBeforeReset_(ss, placarSheet, "backup_placar"));
  }

  resetSheetWithHeaders_(
    formSheet,
    FORM_HEADERS,
    "#d9ead3"
  );

  resetSheetWithHeaders_(
    placarSheet,
    PLACAR_HEADERS,
    "#fff2cc"
  );

  garantirTriggersDoPlacar_();
  Logger.log("Reset concluido com backup. Abas criadas: " + backups.filter(function (name) { return !!name; }).join(", "));
}

