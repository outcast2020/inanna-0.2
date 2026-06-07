import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const DEFAULT_SHEET_ID = "1hDEDkylOBUKDY-s4tqnYaMfZgm6izftB04alLVGe3Rc";
const DEFAULT_CHECKIN_SHEET = "USERS_checkin";
const DEFAULT_QUADRAS_SHEETS = ["Página1", "backup_registros_20260401_153714"];
const DEFAULT_TZ_OFFSET = "-03:00";

await loadLocalEnvFiles([".env.local", "not-commit-supabaseInanna.txt"]);

const env = process.env;
const dryRun = /^1|true|yes$/i.test(env.IMPORT_DRY_RUN || "");
const batchSize = Math.max(1, Number(env.IMPORT_BATCH_SIZE || 100));
const supabaseUrl = cleanUrl(env.SUPABASE_URL || env.VITE_SUPABASE_URL || "");
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "";
const timezoneOffset = env.IMPORT_TIMEZONE_OFFSET || DEFAULT_TZ_OFFSET;

if (!supabaseUrl || !serviceKey) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de importar.");
  process.exit(1);
}

const defaultCsvUrl = (sheetName) =>
  `https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

function cleanUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

async function loadLocalEnvFiles(files) {
  for (const file of files) {
    try {
      const text = await readFile(file, "utf8");
      applyLocalEnvText(text);
    } catch (_) {
      // Arquivos locais de segredo sao opcionais.
    }
  }
}

function applyLocalEnvText(text) {
  const jwtCandidates = [];

  for (const line of String(text || "").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const assignment = trimmed.match(/^([^:=]+)\s*[:=]\s*(.+)$/);
    if (assignment) {
      const rawKey = assignment[1].trim();
      const value = assignment[2].trim().replace(/^['"]|['"]$/g, "");
      const key = normalizeEnvKey(rawKey);
      if (key && value && !process.env[key]) process.env[key] = value;
    }

    const jwt = trimmed.match(/(eyJ[\w-]+\.[\w-]+\.[\w-]+)/)?.[1];
    if (jwt) jwtCandidates.push(jwt);
  }

  for (const jwt of jwtCandidates) {
    const role = readJwtRole(jwt);
    if (role === "anon" && !process.env.VITE_SUPABASE_ANON_KEY) process.env.VITE_SUPABASE_ANON_KEY = jwt;
    if (role === "service_role" && !process.env.SUPABASE_SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = jwt;
  }
}

function normalizeEnvKey(rawKey) {
  const key = String(rawKey || "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (!key) return "";
  if (key.includes("SERVICE") && key.includes("ROLE")) return "SUPABASE_SERVICE_ROLE_KEY";
  if (key.includes("ANON")) return "VITE_SUPABASE_ANON_KEY";
  if (key.includes("SUPABASE") && key.includes("URL")) return "SUPABASE_URL";
  if (key === "URL") return "SUPABASE_URL";
  return key;
}

function readJwtRole(jwt) {
  try {
    const payload = jwt.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(base64, "base64").toString("utf8")).role || "";
  } catch (_) {
    return "";
  }
}

function normalizeHeader(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  row.push(field);
  if (row.some((item) => String(item || "").trim())) rows.push(row);
  return rows;
}

function parseCsvObjects(text, sourceName) {
  const rows = parseCsv(text);
  const headers = rows.shift() || [];
  return rows
    .map((row, index) => {
      const record = { __source_sheet: sourceName, __source_row: String(index + 2) };
      headers.forEach((header, columnIndex) => {
        record[normalizeHeader(header)] = row[columnIndex] || "";
      });
      return record;
    })
    .filter((row) => Object.entries(row).some(([key, value]) => !key.startsWith("__") && String(value || "").trim()));
}

function first(row, keys) {
  for (const key of keys) {
    const value = row[normalizeHeader(key)];
    if (String(value || "").trim()) return String(value).trim();
  }
  return "";
}

function parseNumber(value) {
  const normalized = String(value || "").replace(",", ".").replace(/[^\d.-]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? Math.round(number) : 0;
}

function parseBoolean(value) {
  const normalized = normalizeText(value);
  if (["sim", "s", "yes", "true", "1"].includes(normalized)) return true;
  if (["nao", "no", "false", "0"].includes(normalized)) return false;
  return null;
}

function parseRace(value) {
  const normalized = normalizeText(value);
  if (["negro", "branco", "pardo", "indigena", "outro"].includes(normalized)) return normalized;
  return "";
}

function parseAgeRange(value) {
  const normalized = normalizeText(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  if (["menos_de_11", "menor_de_11", "ate_11", "0_11"].includes(normalized)) return "menos_de_11";
  if (["12_14", "12_a_14"].includes(normalized)) return "12_14";
  if (["15_17", "15_a_17"].includes(normalized)) return "15_17";
  if (["18_29", "18_a_29"].includes(normalized)) return "18_29";
  if (["30_44", "30_a_44"].includes(normalized)) return "30_44";
  if (["45_59", "45_a_59"].includes(normalized)) return "45_59";
  if (["maior_de_60", "mais_de_60", "60_mais", "acima_de_60"].includes(normalized)) return "maior_de_60";
  return "";
}

function parseDate(value) {
  const text = String(value || "").trim();
  if (!text) return null;

  const br = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (br) {
    const [, day, month, year, hour = "0", minute = "0", second = "0"] = br;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute}:${second.padStart(2, "0")}${timezoneOffset}`;
  }

  const isoLike = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (isoLike) {
    const [, year, month, day, hour = "0", minute = "0", second = "0"] = isoLike;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute}:${second.padStart(2, "0")}${timezoneOffset}`;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function fingerprintQuadra(record) {
  const base = [
    normalizeText(record.nome),
    normalizeText(record.verso),
    parseDate(record.created_at) || normalizeText(record.created_at),
    String(record.pontos ?? 0),
  ].join("|");
  return createHash("sha256").update(base).digest("hex");
}

async function readCsvInput({ envUrl, envPath, defaultUrl, label }) {
  const path = env[envPath];
  const url = env[envUrl] || defaultUrl;

  if (path) {
    return { source: path, text: await readFile(path, "utf8") };
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao baixar ${label}: ${response.status} ${response.statusText}`);
  return { source: url, text: await response.text() };
}

async function supabaseFetch(path, options = {}) {
  const url = `${supabaseUrl}/rest/v1/${path.replace(/^\/+/, "")}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase ${response.status}: ${body}`);
  }

  if (options.headers?.Prefer?.includes("return=minimal")) return null;
  if (response.status === 204) return null;
  return response.json();
}

async function upsertRows(table, rows, conflictColumn) {
  if (!rows.length || dryRun) return [];
  const inserted = [];
  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const data = await supabaseFetch(`${table}?on_conflict=${conflictColumn}`, {
      method: "POST",
      body: JSON.stringify(batch),
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    });
    inserted.push(...(data || []));
  }
  return inserted;
}

async function selectExistingFingerprints(fingerprints) {
  const existing = new Set();
  for (let index = 0; index < fingerprints.length; index += batchSize) {
    const batch = fingerprints.slice(index, index + batchSize);
    if (!batch.length) continue;
    const inList = batch.map((item) => `"${item}"`).join(",");
    const rows = await supabaseFetch(`quadras?select=legacy_fingerprint&legacy_fingerprint=in.(${encodeURIComponent(inList)})`);
    for (const row of rows || []) existing.add(row.legacy_fingerprint);
  }
  return existing;
}

async function countLegacyQuadras() {
  const response = await fetch(`${supabaseUrl}/rest/v1/quadras?select=id&legacy_fingerprint=not.is.null`, {
    method: "HEAD",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: "count=exact",
    },
  });
  if (!response.ok) return null;
  return Number(response.headers.get("content-range")?.split("/").pop() || 0);
}

function buildParticipant(row) {
  const email = first(row, ["email"]);
  if (!email) return null;

  return {
    nome: first(row, ["nome", "autor"]) || "Participante",
    email: email.toLowerCase(),
    tipo_participante: first(row, ["instituicao", "tipo_participante", "tipo de participante"]) || "Check-in Cordel 2.0",
    origem: first(row, ["source_page", "origem"]) || "google-sheets",
    teacher_group: first(row, ["oficinas_cordel", "teacher_group", "turma"]),
    checkin_user_id: first(row, ["user_id", "checkin_user_id"]) || email.toLowerCase(),
    origem_importacao: "google-sheets",
    oficina_cordel20: parseBoolean(first(row, ["oficinas_cordel", "estou nas oficinas cordel 2.0"])),
    usou_chatbot_ia: parseBoolean(first(row, ["usou_chatbot_ia", "ja usei algum chatbot de ia", "já usei algum chatbot de ia"])),
    genero: first(row, ["genero", "gênero"]),
    identificacao_racial: parseRace(first(row, ["identificacao_racial", "identificação racial", "raca", "raça"])),
    faixa_etaria: parseAgeRange(first(row, ["faixa_etaria", "faixa etaria", "faixa etária"])),
    perfil_completo: false,
    created_at: parseDate(first(row, ["created_at", "signup_at", "carimbo de data/hora"])) || undefined,
  };
}

function buildQuadra(row, participantByEmail) {
  const nome = first(row, ["nome", "autor"]);
  const email = first(row, ["email"]).toLowerCase();
  const verso = first(row, ["verso"]);
  const createdAt = parseDate(first(row, ["carimbo de data/hora", "timestamp", "created_at"]));
  if (!verso) return null;

  const participant = email ? participantByEmail.get(email) : null;
  const externalParticipantId = first(row, ["participant_id", "external_participant_id"]);
  const record = {
    participante_id: participant?.id || null,
    external_participant_id: participant?.id ? null : externalParticipantId || null,
    checkin_user_id: first(row, ["checkin_user_id"]) || participant?.checkin_user_id || null,
    checkin_match_status: first(row, ["checkin_match_status"]) || (email ? "matched" : ""),
    checkin_match_method: first(row, ["checkin_match_method"]) || (email ? "email" : ""),
    nome: nome || participant?.nome || "Autor anonimo",
    email: email || null,
    tipo_participante: first(row, ["tipo de participante", "tipo_participante"]) || participant?.tipo_participante || "",
    municipio: first(row, ["municipio"]) || participant?.municipio || "",
    estado: first(row, ["estado"]) || participant?.estado || "",
    pais: participant?.pais || "BR",
    oficina_cordel20: participant?.oficina_cordel20 ?? null,
    usou_chatbot_ia: participant?.usou_chatbot_ia ?? null,
    genero: participant?.genero || "",
    identificacao_racial: participant?.identificacao_racial || "",
    faixa_etaria: participant?.faixa_etaria || "",
    origem: first(row, ["origem"]) || "google-sheets",
    teacher_group: first(row, ["teacher_group"]) || participant?.teacher_group || "",
    verso,
    modo: first(row, ["modo"]) || "Desafio",
    tema: first(row, ["tema"]),
    pontos: parseNumber(first(row, ["pontos"])),
    esquema_rima: first(row, ["esquema de rima", "esquema_rima"]),
    pontos_rima: parseNumber(first(row, ["pts rima", "pontos_rima"])),
    pontos_forma: parseNumber(first(row, ["pts forma", "pontos_forma"])),
    pontos_criatividade: parseNumber(first(row, ["pts criatividade", "pontos_criatividade"])),
    bonus_esquema: parseNumber(first(row, ["bonus esquema", "bônus esquema", "bonus_esquema"])),
    tempo_escrita_ms: parseNumber(first(row, ["tempo escrita ms", "tempo escrita (ms)"])) || null,
    tempo_escrita_formatado: first(row, ["tempo escrita", "tempo_escrita_formatado"]),
    app_variant: first(row, ["app_variant"]) || "inanna-main",
    origem_importacao: "google-sheets",
    legado_google_sheet: true,
    created_at: createdAt || undefined,
    imported_at: new Date().toISOString(),
    legacy_source_row: row.__source_row,
    legacy_sheet_name: row.__source_sheet,
  };
  record.legacy_fingerprint = fingerprintQuadra(record);
  return record;
}

async function main() {
  const checkinInput = await readCsvInput({
    envUrl: "LEGACY_CHECKIN_CSV_URL",
    envPath: "LEGACY_CHECKIN_CSV_PATH",
    defaultUrl: defaultCsvUrl(DEFAULT_CHECKIN_SHEET),
    label: "USERS_checkin",
  });

  const checkinRows = parseCsvObjects(checkinInput.text, DEFAULT_CHECKIN_SHEET);
  const participantMap = new Map();
  for (const row of checkinRows) {
    const participant = buildParticipant(row);
    if (!participant) continue;
    participantMap.set(participant.email, { ...(participantMap.get(participant.email) || {}), ...participant });
  }

  const participantRows = [...participantMap.values()];
  const upsertedParticipants = await upsertRows("participantes", participantRows, "email");
  const emails = [...participantMap.keys()];
  const participantByEmail = new Map();
  if (emails.length) {
    const inList = emails.map((item) => `"${item}"`).join(",");
    const rows = await supabaseFetch(`participantes?select=*&email=in.(${encodeURIComponent(inList)})`);
    for (const row of rows || []) participantByEmail.set(String(row.email || "").toLowerCase(), row);
  }

  const quadraSheets = (env.LEGACY_QUADRAS_SHEETS || DEFAULT_QUADRAS_SHEETS.join(","))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const quadraRows = [];
  for (const sheetName of quadraSheets) {
    const input = await readCsvInput({
      envUrl: "",
      envPath: `LEGACY_${normalizeHeader(sheetName).toUpperCase()}_CSV_PATH`,
      defaultUrl: defaultCsvUrl(sheetName),
      label: sheetName,
    });
    quadraRows.push(...parseCsvObjects(input.text, sheetName));
  }

  const localFingerprints = new Set();
  const quadras = [];
  let localDuplicates = 0;
  let malformed = 0;
  for (const row of quadraRows) {
    const quadra = buildQuadra(row, participantByEmail);
    if (!quadra) {
      malformed += 1;
      continue;
    }
    if (localFingerprints.has(quadra.legacy_fingerprint)) {
      localDuplicates += 1;
      continue;
    }
    localFingerprints.add(quadra.legacy_fingerprint);
    quadras.push(quadra);
  }

  const existing = await selectExistingFingerprints([...localFingerprints]);
  const toInsert = quadras.filter((item) => !existing.has(item.legacy_fingerprint));
  const inserted = await upsertRows("quadras", toInsert, "legacy_fingerprint");
  const finalLegacyCount = await countLegacyQuadras();

  const report = {
    dryRun,
    checkin: {
      source: checkinInput.source,
      csvRows: checkinRows.length,
      participantsPrepared: participantRows.length,
      participantsUpsertedOrMatched: dryRun ? 0 : upsertedParticipants.length,
    },
    quadras: {
      sheets: quadraSheets,
      csvRows: quadraRows.length,
      prepared: quadras.length,
      imported: dryRun ? 0 : inserted.length,
      ignoredExistingDuplicate: existing.size,
      ignoredLocalDuplicate: localDuplicates,
      malformed,
      finalLegacyCount,
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
