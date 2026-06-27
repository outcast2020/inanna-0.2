// VALORES PADRÃO (Fallback caso não estejam salvos no PropertiesService)
// Nao commitar o ID real: preencha no editor do Apps Script (copia privada) ou
// defina a Script Property INANNA_USERS_SPREADSHEET_ID. Vazio = usa a planilha vinculada.
var INANNA_USERS_SPREADSHEET_ID = "";
var INANNA_USERS_SHEET_NAME = "USERS";
var INANNA_SUPABASE_URL = "https://ifhagjcarefdkcmjvknf.supabase.co";
var INANNA_SUPABASE_SERVICE_ROLE_KEY = "";

// NOMES DAS CHAVES (Como serão chamadas dentro do PropertiesService)
var PROP_SPREADSHEET_ID = "INANNA_USERS_SPREADSHEET_ID";
var PROP_SHEET_NAME = "INANNA_USERS_SHEET_NAME";
var PROP_SUPABASE_URL = "INANNA_SUPABASE_URL";
var PROP_SUPABASE_SERVICE_ROLE_KEY = "INANNA_SUPABASE_SERVICE_ROLE_KEY";
var PROP_LOOKUP_TOKEN = "INANNA_FIRST_ACCESS_LOOKUP_TOKEN";

function doGet(e) {
  var params = (e && e.parameter) || {};
  var callback = sanitizeCallback_(params.callback);
  var action = String(params.action || "first_access_lookup").trim();
  var payload;

  try {
    if (!isAuthorized_(params)) {
      payload = { ok: false, status: "error", error: "unauthorized" };
    } else if (action === "first_access_lookup") {
      var emailKey = normalizeEmail_(params.email);
      // Per-email trava enumeracao; global e backstop generoso contra flood (token e publico).
      if (!enforceRateLimit_("email_" + emailKey, 5, 60) || !enforceRateLimit_("global", 600, 60)) {
        payload = { ok: false, status: "error", error: "rate_limited" };
      } else {
        payload = lookupAndSyncFirstAccess_(params.email);
      }
    } else if (action === "health") {
      payload = healthCheck_();
    } else {
      payload = { ok: false, status: "error", error: "unknown_action" };
    }
  } catch (error) {
    // Nao vaze detalhe interno (URL/chaves do Supabase podem aparecer na mensagem).
    Logger.log("first_access_lookup_error: " + (error && error.stack ? error.stack : error));
    payload = {
      ok: false,
      status: "error",
      error: "first_access_lookup_error",
    };
  }

  return output_(callback, payload);
}

function configurarInannaPrimeiroAcesso() {
  var props = PropertiesService.getScriptProperties();
  var toSet = {};
  // Grava apenas valores nao-vazios — nao sobrescreve com "" o que ja foi definido na UI.
  if (INANNA_USERS_SPREADSHEET_ID) toSet.INANNA_USERS_SPREADSHEET_ID = INANNA_USERS_SPREADSHEET_ID;
  if (INANNA_USERS_SHEET_NAME) toSet.INANNA_USERS_SHEET_NAME = INANNA_USERS_SHEET_NAME;
  if (INANNA_SUPABASE_URL) toSet.INANNA_SUPABASE_URL = INANNA_SUPABASE_URL;
  if (INANNA_SUPABASE_SERVICE_ROLE_KEY) toSet.INANNA_SUPABASE_SERVICE_ROLE_KEY = INANNA_SUPABASE_SERVICE_ROLE_KEY;
  if (Object.keys(toSet).length) props.setProperties(toSet, false);
  return healthCheck_();
}

function testarPrimeiroAcessoCeleste() {
  return JSON.stringify(
    lookupAndSyncFirstAccess_("celestemariafarias2020@gmail.com"),
    null,
    2
  );
}

function sincronizarUsersParaSupabase() {
  var rows = readUsersRows_();
  var prepared = [];
  var invalidRows = [];
  var seen = {};

  rows.forEach(function (record) {
    var participant = buildParticipantFromUser_(record);
    if (!participant) {
      invalidRows.push(record.__rowNumber);
      return;
    }
    if (seen[participant.email]) return;
    seen[participant.email] = true;
    prepared.push(participant);
  });

  var synced = upsertParticipants_(prepared);
  return {
    ok: true,
    status: "synced",
    source: getSourceInfo_(),
    rowsRead: rows.length,
    participantsPrepared: prepared.length,
    participantsSynced: synced.length,
    invalidRows: invalidRows,
  };
}

function instalarSincronizacaoUsers() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === "sincronizarUsersParaSupabase") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("sincronizarUsersParaSupabase")
    .timeBased()
    .everyHours(1)
    .create();

  return "Sincronizacao horaria instalada para a aba USERS.";
}

function lookupAndSyncFirstAccess_(emailInput) {
  var email = normalizeEmail_(emailInput);
  if (!isValidEmail_(email)) {
    return { ok: false, status: "error", error: "invalid_email" };
  }

  var record = findUserByEmail_(email);
  if (!record) {
    return { ok: false, status: "unmatched", error: "email_not_found" };
  }

  var participant = buildParticipantFromUser_(record);
  if (!participant) {
    return { ok: false, status: "error", error: "user_row_invalid" };
  }

  var synced = upsertParticipants_([participant])[0];
  if (!synced || !synced.id) {
    return { ok: false, status: "error", error: "supabase_sync_error" };
  }

  return toPublicParticipant_(synced, record.__rowNumber);
}

function healthCheck_() {
  var sheet = getUsersSheet_();
  // Nao retornar spreadsheetId/sheetName: evita expor o ID da planilha privada USERS.
  return {
    ok: true,
    status: "ok",
    lastRow: sheet.getLastRow(),
    hasSpreadsheet: !!sheet.getParent().getId(),
    hasSupabaseUrl: !!getRequiredProperty_(PROP_SUPABASE_URL, false, INANNA_SUPABASE_URL),
    hasServiceRoleKey: !!getRequiredProperty_(PROP_SUPABASE_SERVICE_ROLE_KEY, false, INANNA_SUPABASE_SERVICE_ROLE_KEY),
    tokenRequired: !!getRequiredProperty_(PROP_LOOKUP_TOKEN, false),
  };
}

function readUsersRows_() {
  var sheet = getUsersSheet_();
  var values = sheet.getDataRange().getDisplayValues();
  if (!values.length) return [];

  var headers = values[0].map(function (header) {
    return normalizeHeader_(header);
  });

  return values.slice(1).map(function (row, index) {
    var record = { __rowNumber: index + 2 };
    headers.forEach(function (header, columnIndex) {
      if (!header) return;
      record[header] = row[columnIndex] || "";
    });
    return record;
  }).filter(function (record) {
    return Object.keys(record).some(function (key) {
      return key.indexOf("__") !== 0 && String(record[key] || "").trim();
    });
  });
}

function findUserByEmail_(email) {
  var rows = readUsersRows_();
  for (var index = 0; index < rows.length; index += 1) {
    var rowEmail = normalizeEmail_(first_(rows[index], [
      "email",
      "e_mail",
      "mail",
      "endereco_de_email",
      "endereco_email",
      "correo",
    ]));
    if (rowEmail === email) return rows[index];
  }
  return null;
}

function buildParticipantFromUser_(record) {
  var email = normalizeEmail_(first_(record, [
    "email",
    "e_mail",
    "mail",
    "endereco_de_email",
    "endereco_email",
    "correo",
  ]));
  if (!isValidEmail_(email)) return null;

  var participant = {
    nome: first_(record, [
      "nome",
      "nome_completo",
      "name",
      "autor",
      "escritor_a",
      "participante",
    ]) || "Participante",
    email: email,
    tipo_participante: first_(record, [
      "tipo_participante",
      "tipo_de_participante",
      "instituicao",
      "perfil",
      "categoria",
    ]) || "Cadastro laboratorio Cordel 2.0",
    municipio: first_(record, ["municipio", "cidade", "city"]),
    estado: normalizeUF_(first_(record, ["estado", "uf", "state"])),
    pais: "BR",
    origem: first_(record, ["origem", "fonte", "source", "source_page"]) || "google-sheets-users",
    teacher_group: first_(record, [
      "oficinas_cordel",
      "oficina",
      "turma",
      "coorte",
      "cohort",
      "grupo",
      "teacher_group",
    ]),
    checkin_user_id: first_(record, [
      "user_id",
      "checkin_user_id",
      "id",
      "identificador",
      "inscricao",
      "matricula",
    ]) || email,
    origem_importacao: "google-sheets-users",
  };

  setIfKnown_(participant, "oficina_cordel20", parseBoolean_(first_(record, [
    "estou_nas_oficinas_cordel_2_0",
    "oficinas_cordel",
    "oficina_cordel20",
    "oficina_cordel_2_0",
  ])));
  setIfKnown_(participant, "usou_chatbot_ia", parseBoolean_(first_(record, [
    "ja_usou_algum_chatbot_de_ia",
    "ja_useu_alugum_chatbot_de_ia",
    "ja_usei_algum_chatbot_de_ia",
    "usou_chatbot_ia",
    "chatbot_ia",
  ])));
  setIfKnown_(participant, "genero", parseGender_(first_(record, [
    "genero",
    "gender",
  ])));
  setIfKnown_(participant, "identificacao_racial", parseRace_(first_(record, [
    "identificacao_racial",
    "raca",
    "cor_raca",
    "racial",
  ])));
  setIfKnown_(participant, "faixa_etaria", parseAgeRange_(first_(record, [
    "faixa_etaria",
    "idade",
    "age_range",
  ])));

  return participant;
}

function upsertParticipants_(participants) {
  if (!participants.length) return [];

  var supabaseUrl = cleanUrl_(getRequiredProperty_(PROP_SUPABASE_URL, true, INANNA_SUPABASE_URL));
  var serviceRoleKey = getRequiredProperty_(PROP_SUPABASE_SERVICE_ROLE_KEY, true, INANNA_SUPABASE_SERVICE_ROLE_KEY);
  var url = supabaseUrl + "/rest/v1/participantes?on_conflict=email&select=" + encodeURIComponent([
    "id",
    "nome",
    "email",
    "tipo_participante",
    "municipio",
    "estado",
    "pais",
    "origem",
    "teacher_group",
    "checkin_user_id",
    "oficina_cordel20",
    "usou_chatbot_ia",
    "genero",
    "identificacao_racial",
    "faixa_etaria",
    "perfil_completo",
  ].join(","));

  var response = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {
      apikey: serviceRoleKey,
      Authorization: "Bearer " + serviceRoleKey,
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    payload: JSON.stringify(participants),
    muteHttpExceptions: true,
  });

  var status = response.getResponseCode();
  var body = response.getContentText();
  if (status < 200 || status >= 300) {
    throw new Error("Supabase " + status + ": " + body);
  }

  return body ? JSON.parse(body) : [];
}

function toPublicParticipant_(participant, rowNumber) {
  return {
    ok: true,
    status: "matched",
    participantId: participant.id,
    checkinUserId: participant.checkin_user_id || participant.id,
    participantIdSource: "supabase_first_access",
    checkinUserIdSource: "google_sheets_users",
    matchMethod: "first_access_google_sheet",
    name: participant.nome || "Participante",
    email: participant.email || "",
    tipoParticipante: participant.tipo_participante || "",
    municipio: participant.municipio || "",
    estado: participant.estado || "",
    pais: participant.pais || "BR",
    origem: participant.origem || "google-sheets-users",
    teacherGroup: participant.teacher_group || "",
    oficinaCordel20: participant.oficina_cordel20,
    usouChatbotIa: participant.usou_chatbot_ia,
    genero: participant.genero || "",
    identificacaoRacial: participant.identificacao_racial || "",
    faixaEtaria: participant.faixa_etaria || "",
    profileComplete: !!participant.perfil_completo,
    checkinRowNumber: rowNumber || 0,
  };
}

function getUsersSheet_() {
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = String(properties.getProperty(PROP_SPREADSHEET_ID) || INANNA_USERS_SPREADSHEET_ID || "").trim();
  var sheetName = String(properties.getProperty(PROP_SHEET_NAME) || INANNA_USERS_SHEET_NAME || "USERS").trim();
  var spreadsheet = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new Error("Aba nao encontrada: " + sheetName);
  return sheet;
}

function getSourceInfo_() {
  var sheet = getUsersSheet_();
  return {
    spreadsheetId: sheet.getParent().getId(),
    sheetName: sheet.getName(),
  };
}

function first_(record, aliases) {
  for (var index = 0; index < aliases.length; index += 1) {
    var value = record[normalizeHeader_(aliases[index])];
    if (String(value || "").trim()) return String(value).trim();
  }
  return "";
}

function setIfKnown_(target, key, value) {
  if (value === null || typeof value === "undefined" || value === "") return;
  target[key] = value;
}

function parseBoolean_(value) {
  var normalized = normalizeText_(value);
  if (["sim", "s", "yes", "true", "1"].indexOf(normalized) >= 0) return true;
  if (["nao", "n", "no", "false", "0"].indexOf(normalized) >= 0) return false;
  return null;
}

function parseGender_(value) {
  var normalized = normalizeText_(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (["masculino", "feminino", "outro", "prefiro_nao_dizer"].indexOf(normalized) >= 0) return normalized;
  return "";
}

function parseRace_(value) {
  var normalized = normalizeText_(value);
  if (normalized === "preto" || normalized === "preta") return "negro";
  if (["negro", "negra", "branco", "branca", "pardo", "parda", "indigena", "outro"].indexOf(normalized) < 0) return "";
  if (normalized === "negra") return "negro";
  if (normalized === "branca") return "branco";
  if (normalized === "parda") return "pardo";
  return normalized;
}

function parseAgeRange_(value) {
  var normalized = normalizeText_(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (["menos_de_11", "menor_de_11", "ate_11", "0_11"].indexOf(normalized) >= 0) return "menos_de_11";
  if (["12_14", "12_a_14"].indexOf(normalized) >= 0) return "12_14";
  if (["15_17", "15_a_17"].indexOf(normalized) >= 0) return "15_17";
  if (["18_29", "18_a_29"].indexOf(normalized) >= 0) return "18_29";
  if (["30_44", "30_a_44"].indexOf(normalized) >= 0) return "30_44";
  if (["45_59", "45_a_59"].indexOf(normalized) >= 0) return "45_59";
  if (["maior_de_60", "mais_de_60", "60_mais", "acima_de_60"].indexOf(normalized) >= 0) return "maior_de_60";
  return "";
}

function normalizeEmail_(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalizeUF_(value) {
  var text = String(value || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(text) ? text : "";
}

function normalizeHeader_(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeText_(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanUrl_(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function getRequiredProperty_(key, required, defaultValue) {
  var value = String(PropertiesService.getScriptProperties().getProperty(key) || defaultValue || "").trim();
  if (required && !value) throw new Error("Propriedade obrigatoria ausente: " + key);
  return value;
}

function isAuthorized_(params) {
  var expected = getRequiredProperty_(PROP_LOOKUP_TOKEN, false);
  // Fail-closed: sem token configurado em Script Properties, o endpoint nega tudo.
  // (Versao anterior retornava true aqui — endpoint publico aberto. Ver README.)
  if (!expected) return false;
  var provided = String(params.token || params.access_token || "").trim();
  return constantTimeEquals_(provided, expected);
}

// Comparacao em tempo (quase) constante para reduzir vazamento por timing.
function constantTimeEquals_(a, b) {
  a = String(a || "");
  b = String(b || "");
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// Throttle best-effort via CacheService (Apps Script nao oferece contador atomico
// nem IP do cliente; o limite por e-mail trava enumeracao com o token publico).
function enforceRateLimit_(bucketKey, maxHits, windowSeconds) {
  var cache = CacheService.getScriptCache();
  var key = "rl_" + bucketKey;
  var current = Number(cache.get(key) || 0);
  if (current >= maxHits) return false;
  cache.put(key, String(current + 1), windowSeconds);
  return true;
}

function sanitizeCallback_(callback) {
  var text = String(callback || "").trim();
  return /^[A-Za-z_$][0-9A-Za-z_$]*(?:\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(text) ? text : "";
}

function output_(callback, payload) {
  var json = JSON.stringify(payload || {});
  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
