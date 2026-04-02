var DEFAULT_REGISTRY_SPREADSHEET_ID = "1hDEDkylOBUKDY-s4tqnYaMfZgm6izftB04alLVGe3Rc";
var DEFAULT_REGISTRY_SHEET_NAME = "Página1";
var DEFAULT_CHECKIN_SPREADSHEET_ID = "130CvfT6mwv0gzYQgmrylg4Q0T5xRI918dms8A4yzqO8";
var DEFAULT_CHECKIN_SHEET_NAME = "USERS";
var DEFAULT_APP_VARIANT = "inanna-main";
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
  "Bônus Esquema",
  "PARTICIPANT_ID",
  "CHECKIN_USER_ID",
  "CHECKIN_MATCH_STATUS",
  "CHECKIN_MATCH_METHOD",
  "TEACHER_GROUP",
  "MUNICIPIO",
  "ESTADO",
  "ORIGEM",
  "APP_VARIANT"
];
var PLACAR_HEADERS = [
  "Posição",
  "Autor",
  "Verso",
  "Pontos",
  "Pts Rima",
  "Pts Forma",
  "Pts Criatividade",
  "Bônus Esquema",
  "Timestamp"
];

function doPost(e) {
  return registrarVerso(e);
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
      return token.replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ-]+$/g, "");
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
    var modoStr = data.modo || "Didático";
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
    setRowValue_(row, headerMap, "Esquema de Rima", score.scheme || "—");
    setRowValue_(row, headerMap, "Pts Rima", score.pontosRima || 0);
    setRowValue_(row, headerMap, "Pts Forma", score.pontosForma || 0);
    setRowValue_(row, headerMap, "Pts Criatividade", score.pontosCriatividade || 0);
    setRowValue_(row, headerMap, "Bônus Esquema", score.bonusEsquema || 0);
    setRowValue_(row, headerMap, "PARTICIPANT_ID", participantId);
    setRowValue_(row, headerMap, "CHECKIN_USER_ID", checkinUserId);
    setRowValue_(row, headerMap, "CHECKIN_MATCH_STATUS", matchStatus);
    setRowValue_(row, headerMap, "CHECKIN_MATCH_METHOD", matchMethod);
    setRowValue_(row, headerMap, "TEACHER_GROUP", teacherGroup);
    setRowValue_(row, headerMap, "MUNICIPIO", municipio);
    setRowValue_(row, headerMap, "ESTADO", estado);
    setRowValue_(row, headerMap, "ORIGEM", origem);
    setRowValue_(row, headerMap, "APP_VARIANT", String(data.appVariant || DEFAULT_APP_VARIANT).trim() || DEFAULT_APP_VARIANT);

    sheet.appendRow(row);

    var ss = sheet.getParent();
    if (modoStr === "Desafio") {
      atualizarPlacar(ss, sheet);
    }

    garantirTriggersDoPlacar_();

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function atualizarPlacar(ss, mainSheet) {
  var values = mainSheet.getDataRange().getValues();
  var records = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var timestamp = row[0];
    var modo = row[5];
    if (modo !== "Desafio") continue;

    var storedCreativity = Number(row[10]) || 0;
    var score = calculateChallengeScoreFromVerse(row[4], storedCreativity);

    records.push({
      timestamp: timestamp,
      autor: row[1],
      verso: row[4],
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

  var rankedRecords = records.slice(0, 10);

  var placarSheet = ss.getSheetByName("placar");
  if (!placarSheet) {
    placarSheet = ss.insertSheet("placar");
  }

  placarSheet.clear();
  placarSheet.appendRow(PLACAR_HEADERS);
  placarSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#fff2cc");

  for (var j = 0; j < rankedRecords.length; j++) {
    placarSheet.appendRow([
      (j + 1) + "º",
      rankedRecords[j].autor,
      rankedRecords[j].verso,
      rankedRecords[j].pontos,
      rankedRecords[j].pontosRima,
      rankedRecords[j].pontosForma,
      rankedRecords[j].pontosCriatividade,
      rankedRecords[j].bonusEsquema,
      rankedRecords[j].timestamp
    ]);
  }
}

function doGet(e) {
  try {
    var action = String((e && e.parameter && e.parameter.action) || "").trim().toLowerCase();
    if (action === "checkin_lookup") {
      return handleCheckinLookup_(e);
    }

    if (action === "getplacar") {
      var ss = getRegistrySpreadsheet_();
      var formSheet = getRecordsSheet_();
      atualizarPlacar(ss, formSheet);
      var sheet = ss.getSheetByName("placar");

      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify([]))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var rows = sheet.getDataRange().getValues();
      var result = [];

      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        if (row[0]) {
          result.push({
            posicao: row[0],
            autor: row[1],
            verso: row[2],
            pontos: row[3] || 0,
            pontosRima: row[4] || 0,
            pontosForma: row[5] || 0,
            pontosCriatividade: row[6] || 0,
            bonusEsquema: row[7] || 0,
            timestamp: row[8] || ""
          });
        }
      }

      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput("Endpoint GET pronto.")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getRegistrySpreadsheet_() {
  return SpreadsheetApp.openById(DEFAULT_REGISTRY_SPREADSHEET_ID);
}

function getRecordsSheet_() {
  var ss = getRegistrySpreadsheet_();
  return ss.getSheetByName(DEFAULT_REGISTRY_SHEET_NAME) || ss.getSheets()[0];
}

function getCheckinSheet_() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = String(props.getProperty("IZA_CHECKIN_SPREADSHEET_ID") || DEFAULT_CHECKIN_SPREADSHEET_ID).trim();
  var sheetName = String(props.getProperty("IZA_CHECKIN_SHEET_NAME") || DEFAULT_CHECKIN_SHEET_NAME).trim();
  var ss = openSpreadsheetSafely_(spreadsheetId);
  if (!ss) return null;

  if (sheetName) {
    return (
      ss.getSheetByName(sheetName) ||
      ss.getSheetByName("USERS") ||
      ss.getSheetByName("Users") ||
      ss.getSheetByName("users") ||
      ss.getSheets()[0]
    );
  }

  return (
    ss.getSheetByName("USERS") ||
    ss.getSheetByName("Users") ||
    ss.getSheetByName("users") ||
    ss.getSheets()[0]
  );
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
  var email = String(PropertiesService.getScriptProperties().getProperty("IZA_DEBUG_CHECKIN_EMAIL") || "").trim();
  var output = JSON.stringify({
    ok: !!email,
    email: email,
    result: email ? buildCheckinLookupResult_({ email: email }) : { ok: false, error: "missing_IZA_DEBUG_CHECKIN_EMAIL" }
  }, null, 2);
  Logger.log(output);
  return output;
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
    throw new Error("Callback invalido");
  }
  return clean;
}

function setupInicial() {
  var ss = getRegistrySpreadsheet_();

  var formSheet = ss.getSheetByName("Página1");
  if (!formSheet) {
    formSheet = ss.insertSheet("Página1");
  }
  ensureHeaders_(formSheet, FORM_HEADERS);
  formSheet.getRange(1, 1, 1, FORM_HEADERS.length).setFontWeight("bold").setBackground("#d9ead3");

  var placarSheet = ss.getSheetByName("placar");
  if (!placarSheet) {
    placarSheet = ss.insertSheet("placar");
  }
  if (placarSheet.getLastRow() === 0) {
    placarSheet.appendRow(PLACAR_HEADERS);
    placarSheet.getRange("A1:I1").setFontWeight("bold").setBackground("#fff2cc");
  }
  garantirTriggersDoPlacar_();

  Logger.log("Configuração concluída! Suas abas 'Página1' e 'placar' estão prontas.");
}

function reconstruirPlacar() {
  var ss = getRegistrySpreadsheet_();
  var formSheet = getRecordsSheet_();
  atualizarPlacar(ss, formSheet);
  garantirTriggersDoPlacar_();
  Logger.log("Placar reconstruído com a nova regra de pontuação.");
}

function sincronizarPlacar_() {
  var ss = getRegistrySpreadsheet_();
  var formSheet = getRecordsSheet_();
  atualizarPlacar(ss, formSheet);
}

function aoNovoRegistroAtualizarPlacar(e) {
  sincronizarPlacar_();
}

function aoEditarRegistroAtualizarPlacar(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (!sheet || sheet.getName() !== "Página1") return;
  if (e.range.getRow() <= 1) return;
  if (e.range.getColumn() > 12) return;
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

  ScriptApp.newTrigger("aoNovoRegistroAtualizarPlacar")
    .forSpreadsheet(DEFAULT_REGISTRY_SPREADSHEET_ID)
    .onFormSubmit()
    .create();

  ScriptApp.newTrigger("aoEditarRegistroAtualizarPlacar")
    .forSpreadsheet(DEFAULT_REGISTRY_SPREADSHEET_ID)
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
  backupSheet.getRange(1, 1).setNote("Backup automático criado antes do reset em " + stamp + ".");
  return backupName;
}

function resetSheetWithHeaders_(sheet, headers, headerColor) {
  if (!sheet) return;
  sheet.clear();
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground(headerColor || "#ffffff");
}

function resetPlacarERegistrosComBackup() {
  var ss = getRegistrySpreadsheet_();
  var formSheet = ss.getSheetByName("Página1") || ss.getSheets()[0];
  var placarSheet = ss.getSheetByName("placar");
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

  if (!placarSheet) {
    placarSheet = ss.insertSheet("placar");
  }
  resetSheetWithHeaders_(
    placarSheet,
    PLACAR_HEADERS,
    "#fff2cc"
  );

  garantirTriggersDoPlacar_();
  Logger.log("Reset concluído com backup. Abas criadas: " + backups.filter(function(name) { return !!name; }).join(", "));
}
