type AiBinding = {
	run(model: string, input: Record<string, unknown>): Promise<unknown>;
};

type RateLimitBinding = {
	limit(options: { key: string }): Promise<{ success: boolean }>;
};

type Env = {
	AI: AiBinding;
	AI_RATE_LIMITER?: RateLimitBinding;
	VOTE_RATE_LIMITER?: RateLimitBinding;
	INANNA_ENV: string;
	ALLOWED_ORIGINS: string | string[];
	SUPABASE_URL: string;
	SUPABASE_SERVICE_ROLE_KEY?: string;
	MARITACA_API_KEY?: string;
	TURNSTILE_SECRET_KEY?: string;
	INANNA_WORKER_ADMIN_TOKEN?: string;
	LOCAL_LEXICON_ENABLED?: string | boolean;
	SOCIAL_VOTING_ENABLED?: string | boolean;
	GENERATION_MODEL?: string;
	DEFAULT_GENERATION_MODEL?: string;
	DEFAULT_JUDGE_MODEL?: string;
	ROUND_COUNT?: string | number;
	MAX_QUADRA_CHARS?: string | number;
	LEVEL2_RHYME_BANK_ENABLED?: string | boolean;
	LEVEL2_XILO_PUZZLE_ENABLED?: string | boolean;
	LEVEL2_THEMES_CSV_URL?: string;
	BLOCKCHAIN_ENABLED?: string | boolean;
	NFT_MINTING_ENABLED?: string | boolean;
	EXTERNAL_WALLET_ENABLED?: string | boolean;
};

type JsonRecord = Record<string, unknown>;

type SessionPayload = {
	playerId?: string;
	nickname?: string;
	inputMode?: string;
	soundMode?: string;
	levelProgress?: JsonRecord;
};

type RoundPayload = {
	sessionId?: string;
	playerId?: string;
	nickname?: string;
	roundNumber?: number;
	theme?: string;
	themeContext?: string;
	themeSource?: string;
	rhymeScheme?: string;
	playerQuadra?: string;
	playerOriginalQuadra?: string;
	playerFinalQuadra?: string;
	inannaQuadra?: string;
	stolenWords?: string[];
	previousRound?: {
		roundNumber?: number;
		playerQuadra?: string;
		inannaQuadra?: string;
	};
};

type VotePayload = {
	sessionId?: string;
	roundId?: string;
	observerId?: string;
	voteTarget?: string;
	turnstileToken?: string;
};

type MechanicalScore = {
	structure: number;
	rhyme: number;
	creativity: number;
	autonomy: number;
	verisimilitude: number;
	coherence: number;
	response: number;
	total: number;
	rubrics: Record<string, boolean>;
	finalWords: string[];
	rhymeKeys: string[];
};

type AiRubric = {
	coherence: number;
	creativity: number;
	verisimilitude: number;
	response: number;
	autonomy: number;
	flags: Record<string, boolean>;
	feedback: string;
};

type ContentPrivacyIssue = {
	type: string;
};

type ContentPrivacyCheck = {
	ok: boolean;
	piiDetected: boolean;
	issues: ContentPrivacyIssue[];
	sanitizedText: string;
	immutableMetadataAllowed: boolean;
};

type RhymeBankEntry = {
	playerId: string;
	sessionId: string;
	verseNumber: number;
	finalWord: string;
	normalizedFinalWord: string;
	rhymeKey: string;
	rhymeFamily: string;
	fullVerse: string;
	isRepeatedExactWord: boolean;
	isRepeatedRhymeFamily: boolean;
	earnedOriginalityBonus: boolean;
};

type RhymeOriginalityAnalysis = {
	entries: RhymeBankEntry[];
	summary: {
		enabled: boolean;
		newFinalWordCount: number;
		newRhymeFamilyCount: number;
		exactRepeatCount: number;
		rhymeFamilyRepeatCount: number;
		earnedOriginalityBonus: boolean;
		originalityDelta: number;
		repeatedFinalWords: string[];
		repeatedRhymeKeys: string[];
	};
};

type SessionScoreUpdate = {
	playerWins: number;
	inannaWins: number;
	finished: boolean;
};

type RewardGrant = {
	eventType: string;
	amount: number;
	rewardUnit: string;
	reason: string;
	criterionSource: string;
	pieceColor: string;
	metadata?: JsonRecord;
};

type Level2ThematicChallenge = {
	theme: string;
	context: string;
	source: string;
};

const DEFAULT_ALLOWED_ORIGINS = [
	"https://inanna.cordel2pontozero.com",
	"https://inanna-five.vercel.app",
	"http://localhost:5173",
	"http://127.0.0.1:5173",
];

const THEMES = [
	"ônibus lotado e sonho no bolso",
	"caderno aberto e futuro na mão",
	"primeiro emprego sem perder a voz",
	"paz na quebrada sem calar ninguém",
	"bola na rua e praça acesa",
	"internet, verdade e palavra própria",
	"saúde da mente sem vergonha",
	"rio limpo passando pela cidade",
	"tambor, memória e cultura viva",
	"cada rosto com seu lugar",
	"menina na ciência e verso na mão",
	"grêmio, assembleia e fala sem medo",
	"comida no prato antes da promessa",
	"trabalho justo e descanso de gente",
	"amor, respeito e escolha segura",
];

const THEME_STYLE_GUIDANCE = "As temáticas devem ser traduzidas para a linguagem do cordel e do cotidiano juvenil. Evite termos técnicos, burocráticos ou academicistas nas provocações da IA. O foco é a vivência poética do direito, não o texto da lei.";
const DEFAULT_LEVEL2_THEMES_CSV_URL = "https://inanna.cordel2pontozero.com/tematicas_jogo.csv";

const SCHEMES = ["AABB", "ABAB", "ABCB", "ABBA"];
const FALLBACK_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const GENERATION_PROVIDER = "maritaca";
const MARITACA_CHAT_URL = "https://chat.maritaca.ai/api/chat/completions";
const LEVEL2_PUZZLE_SLUG = "xilogravura-peleja";
const LEVEL2_PUZZLE_TOTAL_PIECES = 30;
const LEVEL2_MAX_PIECES_PER_ROUND = 4;
const LEVEL2_MAX_PIECES_PER_MATCH = 10;
let level2ThematicCache: { url: string; loadedAt: number; items: Level2ThematicChallenge[] } | null = null;
const COMMON_RHYME_SUFFIXES = [
	"acao", "icao", "eirao", "eiro", "eira", "ente", "dade", "ade", "aria", "oria",
	"ura", "eza", "oso", "osa", "oes", "aes", "ais", "eis", "ois", "uis",
	"ao", "ia", "or", "ar", "er", "ir", "im", "al", "el", "ol", "ul",
	"az", "as", "ez", "es", "iz", "is", "oz", "os", "uz", "us",
];
const RHYME_SUFFIX_ALIASES: Record<string, string> = {
	az: "as",
	ez: "es",
	iz: "is",
	oz: "os",
	uz: "us",
	aos: "ao",
};
const REWARD_COLORS: Record<string, string> = {
	participacao_round: "barro",
	vitoria_round: "ouro",
	rima_inedita: "azul-rima",
	criatividade_alta: "verde-imagem",
	vitoria_peleja: "vermelho-autoria",
	coerencia_final: "lilas-sentido",
};

function json(data: unknown, init: ResponseInit = {}, env?: Env, request?: Request): Response {
	const headers = new Headers(init.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	applyCors(headers, env, request);
	return new Response(JSON.stringify(data), { ...init, headers });
}

function applyCors(headers: Headers, env?: Env, request?: Request): void {
	const origin = request?.headers.get("origin") || "";
	const allowed = getAllowedOrigins(env);
	if (origin && allowed.has(origin)) {
		headers.set("access-control-allow-origin", origin);
		headers.set("vary", "Origin");
	}
	headers.set("access-control-allow-methods", "GET,POST,OPTIONS");
	headers.set("access-control-allow-headers", "content-type,authorization,x-inanna-player-id");
	headers.set("access-control-max-age", "86400");
}

function getAllowedOrigins(env?: Env): Set<string> {
	const raw = env?.ALLOWED_ORIGINS;
	const list = Array.isArray(raw)
		? raw
		: String(raw || "")
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	return new Set(list.length ? list : DEFAULT_ALLOWED_ORIGINS);
}

function cleanText(value: unknown, max = 900): string {
	return String(value || "")
		.replace(/\r/g, "")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim()
		.slice(0, max);
}

function parseCsvText(text: string): string[][] {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = "";
	let inQuotes = false;
	const source = String(text || "").replace(/^\uFEFF/, "");
	for (let index = 0; index < source.length; index += 1) {
		const char = source[index];
		const next = source[index + 1];
		if (char === "\"") {
			if (inQuotes && next === "\"") {
				cell += "\"";
				index += 1;
			} else {
				inQuotes = !inQuotes;
			}
			continue;
		}
		if (char === "," && !inQuotes) {
			row.push(cell);
			cell = "";
			continue;
		}
		if ((char === "\n" || char === "\r") && !inQuotes) {
			if (char === "\r" && next === "\n") index += 1;
			row.push(cell);
			if (row.some((item) => cleanText(item, 200))) rows.push(row);
			row = [];
			cell = "";
			continue;
		}
		cell += char;
	}
	row.push(cell);
	if (row.some((item) => cleanText(item, 200))) rows.push(row);
	return rows;
}

function normalizeCsvHeader(value: string): string {
	return String(value || "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");
}

function parseLevel2ThematicCsv(text: string): Level2ThematicChallenge[] {
	const rows = parseCsvText(text);
	if (rows.length < 2) return [];
	const headers = rows[0].map((item) => normalizeCsvHeader(item));
	return rows.slice(1).map((row) => {
		const raw = headers.reduce<Record<string, string>>((acc, header, index) => {
			acc[header || `col_${index}`] = row[index] || "";
			return acc;
		}, {});
		const context = cleanText(raw.contexto || raw.o_que_acontenceu || raw.o_que_aconteceu, 1400);
		const theme = cleanText(raw.tematica || raw.tema, 180);
		// Fonte editor-friendly: veiculo + data + titulo + url, com status. Enquanto
		// "fonte a definir", a fonte fica vazia (nao mostra placeholder ao jogador).
		// Retrocompativel com a coluna antiga `fonte`/`source`.
		const fonteStatus = cleanText(raw.fonte_status, 40).toLowerCase();
		const fonteUrl = cleanText(raw.fonte_url || raw.fonte || raw.source, 500);
		const fonteVeiculo = cleanText(raw.fonte_veiculo, 120);
		const fonteData = cleanText(raw.fonte_data, 40);
		const fonteTitulo = cleanText(raw.fonte_titulo, 240);
		const aDefinir = fonteStatus.includes("definir");
		const hasStructured = "fonte_status" in raw || "fonte_url" in raw || "fonte_veiculo" in raw;
		let source = "";
		if (!hasStructured) {
			// CSV antigo (so coluna `fonte`): usa direto.
			source = cleanText(raw.fonte || raw.source, 500);
		} else if (!aDefinir) {
			const head = [fonteVeiculo, fonteData].filter(Boolean).join(", ");
			source = [fonteTitulo, head ? `(${head})` : "", fonteUrl].filter(Boolean).join(" ").trim();
			if (!source) source = fonteUrl;
		}
		return theme && context ? { theme, context, source } : null;
	}).filter((item): item is Level2ThematicChallenge => !!item);
}

async function loadLevel2ThematicChallenges(env: Env): Promise<Level2ThematicChallenge[]> {
	const url = cleanText(env.LEVEL2_THEMES_CSV_URL, 500) || DEFAULT_LEVEL2_THEMES_CSV_URL;
	const now = Date.now();
	if (level2ThematicCache && level2ThematicCache.url === url && now - level2ThematicCache.loadedAt < 10 * 60_000) {
		return level2ThematicCache.items;
	}
	try {
		const response = await fetch(url, { headers: { accept: "text/csv,text/plain,*/*" } });
		if (!response.ok) throw new Error(`csv_${response.status}`);
		const items = parseLevel2ThematicCsv(await response.text());
		if (!items.length) throw new Error("csv_empty");
		level2ThematicCache = { url, loadedAt: now, items };
		return items;
	} catch (error) {
		console.warn("Level 2 thematic CSV unavailable; using fallback themes", String((error as Error)?.message || error));
		return level2ThematicCache?.items || [];
	}
}

function inspectContentPrivacy(value: unknown): ContentPrivacyCheck {
	const text = cleanText(value, 1400);
	const patterns: Array<[ContentPrivacyIssue["type"], RegExp]> = [
		["email", /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi],
		["phone", /(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-.\s]?\d{4}/g],
		["social_handle", /(^|[\s([{])@[a-z0-9._-]{3,}/gi],
		["url", /\b(?:https?:\/\/|www\.)\S+/gi],
		["cpf_like_number", /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g],
	];
	const issueTypes = new Set<string>();
	let sanitizedText = text;
	for (const [type, pattern] of patterns) {
		if (pattern.test(text)) {
			issueTypes.add(type);
			sanitizedText = sanitizedText.replace(pattern, "[dado protegido]");
		}
		pattern.lastIndex = 0;
	}
	return {
		ok: issueTypes.size === 0,
		piiDetected: issueTypes.size > 0,
		issues: [...issueTypes].map((type) => ({ type })),
		sanitizedText,
		immutableMetadataAllowed: issueTypes.size === 0,
	};
}

function privacyErrorResponse(check: ContentPrivacyCheck, env: Env, request: Request): Response {
	return json({
		ok: false,
		error: "privacy_pii_detected",
		message: "Proteja seus dados: retire e-mail, telefone, arroba, link ou documento dos versos antes de enviar.",
		privacy: {
			piiDetected: check.piiDetected,
			issues: check.issues,
			immutableMetadataAllowed: false,
		},
	}, { status: 400 }, env, request);
}

function normalizeWord(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9ç]/gi, "");
}

function normalizeRhymeSuffix(value: string): string {
	let key = normalizeWord(value).replace(/ç/g, "c");
	if (!key) return "";
	if (key.endsWith("z") || key.endsWith("x")) key = `${key.slice(0, -1)}s`;
	if (key.endsWith("aos")) return "ao";
	return RHYME_SUFFIX_ALIASES[key] || key;
}

function accentedVowelTail(value: string): string {
	const source = String(value || "").toLowerCase().normalize("NFC");
	const matches = [...source.matchAll(/[áàâãéêíóôõúü]/g)];
	const last = matches[matches.length - 1];
	if (!last || typeof last.index !== "number") return "";
	const key = normalizeRhymeSuffix(source.slice(last.index));
	return key.length <= 5 ? key : "";
}

function phoneticRhymeKey(word: string): string {
	const normalized = normalizeWord(word).replace(/ç/g, "c");
	if (!normalized) return "";
	const accentedTail = accentedVowelTail(word);
	if (accentedTail) return accentedTail;
	for (const suffix of COMMON_RHYME_SUFFIXES) {
		if (normalized.endsWith(suffix)) return normalizeRhymeSuffix(suffix);
	}
	const finalSyllable = normalized.match(/[aeiou][^aeiou]*$/)?.[0] || normalized.slice(-2);
	return normalizeRhymeSuffix(finalSyllable);
}

function getLines(quadra: string): string[] {
	return cleanText(quadra)
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.slice(0, 8);
}

function getFinalWord(line: string): string {
	const words = line.match(/[\p{L}\p{M}0-9'-]+/gu) || [];
	return normalizeWord(words[words.length - 1] || "");
}

function rhymeTail(word: string, size = 2): string {
	const normalized = normalizeWord(word);
	return normalized.slice(Math.max(0, normalized.length - size));
}

function scorePair(a: string, b: string): number {
	if (!a || !b) return 0;
	if (a === b) return 0;
	const keyA = phoneticRhymeKey(a);
	const keyB = phoneticRhymeKey(b);
	if (keyA && keyA === keyB) return keyA.length >= 2 ? 10 : 6;
	if (rhymeTail(a, 3) && rhymeTail(a, 3) === rhymeTail(b, 3)) return 10;
	if (rhymeTail(a, 2) && rhymeTail(a, 2) === rhymeTail(b, 2)) return 8;
	if (rhymeTail(a, 1) && rhymeTail(a, 1) === rhymeTail(b, 1)) return 4;
	return 0;
}

function expectedPairs(scheme: string): Array<[number, number]> {
	const normalized = String(scheme || "AABB").toUpperCase();
	if (normalized === "ABAB") return [[0, 2], [1, 3]];
	if (normalized === "ABCB") return [[1, 3]];
	if (normalized === "ABBA") return [[0, 3], [1, 2]];
	return [[0, 1], [2, 3]];
}

function clampScore(value: number, max: number): number {
	return Math.max(0, Math.min(max, Math.round(Number(value) || 0)));
}

function mechanicalScore(quadra: string, scheme: string, options: { isFinal?: boolean; inannaQuadra?: string } = {}): MechanicalScore {
	const lines = getLines(quadra);
	const finalWords = lines.slice(0, 4).map(getFinalWord);
	const rhymeKeys = finalWords.map(phoneticRhymeKey);
	const structure = lines.length === 4 ? 10 : lines.length >= 3 ? 5 : 0;
	const pairs = expectedPairs(scheme);
	const pairScores = pairs.map(([a, b]) => scorePair(finalWords[a], finalWords[b]));
	const rhymeBase = pairs.length ? pairScores.reduce((sum, item) => sum + item, 0) / pairs.length : 0;
	const noRepeatedFinals = new Set(finalWords.filter(Boolean)).size === finalWords.filter(Boolean).length;
	const rhyme = clampScore(rhymeBase + (noRepeatedFinals && rhymeBase >= 8 ? 10 : 0), 20);
	const uniqueTokens = new Set(
		cleanText(quadra)
			.toLowerCase()
			.split(/[^\p{L}\p{M}0-9]+/u)
			.filter((token) => token.length > 3)
	);
	const creativity = clampScore(Math.min(20, uniqueTokens.size * 1.4), 20);
	const autonomy = options.inannaQuadra ? scoreAutonomy(quadra, options.inannaQuadra) : 15;
	const verisimilitude = structure >= 5 && uniqueTokens.size >= 5 ? 10 : 5;
	const coherence = structure === 10 ? 10 : 5;
	const response = options.isFinal ? 8 : 0;
	const total = structure + rhyme + creativity + autonomy + verisimilitude + coherence + response;
	return {
		structure,
		rhyme,
		creativity,
		autonomy,
		verisimilitude,
		coherence,
		response,
		total,
		finalWords,
		rhymeKeys,
		rubrics: {
			hasFourVerses: lines.length === 4,
			matchesRhymeScheme: rhyme >= 12,
			noRepeatedFinalWords: noRepeatedFinals,
			hasLexicalVariety: uniqueTokens.size >= 8,
			hasReadableLanguage: cleanText(quadra).length >= 40,
		},
	};
}

function scoreAutonomy(player: string, inanna: string): number {
	const playerTokens = tokenSet(player);
	const inannaTokens = tokenSet(inanna);
	if (!playerTokens.size || !inannaTokens.size) return 15;
	let overlap = 0;
	for (const token of playerTokens) if (inannaTokens.has(token)) overlap += 1;
	const overlapRatio = overlap / playerTokens.size;
	if (overlapRatio > 0.55) return 3;
	if (overlapRatio > 0.38) return 8;
	if (overlapRatio > 0.25) return 12;
	return 15;
}

function tokenSet(text: string): Set<string> {
	return new Set(
		cleanText(text)
			.toLowerCase()
			.split(/[^\p{L}\p{M}0-9]+/u)
			.map(normalizeWord)
			.filter((token) => token.length > 3)
	);
}

function stealWords(quadra: string): string[] {
	const stop = new Set(["para", "como", "mais", "pela", "pelo", "essa", "esse", "numa", "num", "com", "que", "por", "uma", "dos", "das", "seu", "sua"]);
	const counts = new Map<string, number>();
	for (const token of tokenSet(quadra)) {
		if (!stop.has(token)) counts.set(token, (counts.get(token) || 0) + 1);
	}
	return [...counts.keys()].sort((a, b) => b.length - a.length).slice(0, 4);
}

function randomFrom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)] || items[0];
}

function extractTextFromAi(response: unknown): string {
	if (typeof response === "string") return response;
	if (!response || typeof response !== "object") return "";
	const data = response as JsonRecord;
	if (typeof data.response === "string") return data.response;
	if (typeof data.result === "string") return data.result;
	if (Array.isArray(data.choices)) {
		const first = data.choices[0] as JsonRecord | undefined;
		const message = first?.message as JsonRecord | undefined;
		return String(message?.content || first?.text || "");
	}
	return JSON.stringify(response);
}

function extractJsonObject(text: string): JsonRecord | null {
	const source = String(text || "").trim();
	const fenced = source.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
	const candidate = fenced || source.match(/\{[\s\S]*\}/)?.[0] || source;
	try {
		const parsed = JSON.parse(candidate);
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as JsonRecord : null;
	} catch {
		return null;
	}
}

function normalizeQuadraLines(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map((line) => cleanText(line, 160)).filter(Boolean).slice(0, 4);
	}
	return getLines(String(value || "")).slice(0, 4);
}

function quadraToText(value: unknown): string {
	const lines = normalizeQuadraLines(value);
	return lines.length ? lines.join("\n") : cleanText(value, 900);
}

function extractGeneratedVerseLines(parsed: JsonRecord | null, rawText: string): { lines: string[]; hasEmbeddedBreaks: boolean } {
	const candidate = parsed?.verses || parsed?.quadra || parsed?.poem || parsed?.resposta || rawText;
	if (Array.isArray(candidate)) {
		const hasEmbeddedBreaks = candidate.some((item) => /[\r\n]/.test(String(item || "")));
		const lines = candidate
			.flatMap((item) => String(item || "").split(/\r?\n/))
			.map((line) => cleanText(line, 180))
			.filter(Boolean);
		return { lines, hasEmbeddedBreaks };
	}
	return { lines: getLines(String(candidate || rawText)), hasEmbeddedBreaks: false };
}

function estimateVerseSyllables(line: string): number {
	const normalized = String(line || "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/qu/g, "k")
		.replace(/gu([ei])/g, "g$1");
	return (normalized.match(/[aeiou]+/g) || []).length;
}

function validateGeneratedInanna(parsed: JsonRecord | null, rawText: string, scheme: string): { ok: boolean; lines: string[]; errors: string[] } {
	const { lines, hasEmbeddedBreaks } = extractGeneratedVerseLines(parsed, rawText);
	const errors: string[] = [];
	if (hasEmbeddedBreaks) errors.push("verse_array_contains_line_breaks");
	if (lines.length !== 4) errors.push(`expected_4_verses_got_${lines.length}`);
	if (lines.some((line) => line.length < 8 || line.length > 120)) errors.push("verse_length_out_of_bounds");
	const syllables = lines.slice(0, 4).map(estimateVerseSyllables);
	if (syllables.some((count) => count < 5 || count > 16)) errors.push("meter_out_of_tolerance");
	const finalWords = lines.slice(0, 4).map(getFinalWord);
	const rhymeMatches = expectedPairs(scheme).map(([a, b]) => scorePair(finalWords[a], finalWords[b]) >= 6);
	if (rhymeMatches.length && rhymeMatches.some((matched) => !matched)) errors.push("rhyme_scheme_not_met");
	return { ok: errors.length === 0, lines: lines.slice(0, 4), errors };
}

function buildInannaRepairPrompt(input: {
	playerQuadra: string;
	rawResponse: string;
	theme: string;
	themeContext?: string;
	rhymeScheme: string;
	stolenWords: string[];
	errors: string[];
}): string {
	return `Repare a resposta da Inanna para uma peleja de quadras.

Tema: ${input.theme}
Contexto cultural do tema: ${input.themeContext || "(sem contexto adicional)"}
Esquema obrigatório: ${input.rhymeScheme}
Erros detectados: ${input.errors.join(", ")}
Palavras/imagens roubadas: ${input.stolenWords.join(", ") || "nenhuma"}

Quadra do jogador:
${input.playerQuadra}

Resposta anterior da Inanna:
${input.rawResponse}

Retorne somente JSON válido com exatamente este formato:
{
  "verses": ["verso 1", "verso 2", "verso 3", "verso 4"],
  "stolenWords": ["palavra1", "palavra2"],
  "provocation": "uma frase curta chamando o jogador para melhorar"
}

Cada item de "verses" deve ser um verso único, sem quebra de linha interna. Preserve oralidade popular, sem humilhar a pessoa jogadora.`;
}

async function runWorkersAi(
	env: Env,
	prompt: string,
	model?: string,
	options: { temperature?: number; seed?: number } = {},
): Promise<string> {
	const selected = model || env.DEFAULT_JUDGE_MODEL || FALLBACK_MODEL;
	const input: Record<string, unknown> = {
		messages: [
			{ role: "system", content: "Responda em português brasileiro. Se o usuário pedir JSON, retorne somente JSON válido." },
			{ role: "user", content: prompt },
		],
	};
	// Determinismo só quando pedido (julgamento). Geração mantém criatividade.
	if (typeof options.temperature === "number") input.temperature = options.temperature;
	if (typeof options.seed === "number") input.seed = options.seed;
	const result = await env.AI.run(selected, input);
	return extractTextFromAi(result);
}

async function generateWithMaritaca(env: Env, prompt: string): Promise<string> {
	if (!env.MARITACA_API_KEY) throw new Error("maritaca_key_missing");
	const response = await fetch(MARITACA_CHAT_URL, {
		method: "POST",
		headers: {
			"authorization": `Bearer ${env.MARITACA_API_KEY}`,
			"content-type": "application/json",
		},
		body: JSON.stringify({
			model: env.GENERATION_MODEL || env.DEFAULT_GENERATION_MODEL || "sabia-4",
			messages: [
				{
					role: "system",
					content: "Voce e Inanna no Cordel 2.0: uma repentista espirituosa, rapida e acolhedora. Provoque pelo desafio poetico, com rima e oralidade brasileira, sem humilhar a pessoa jogadora e sem soar professoral.",
				},
				{ role: "user", content: prompt },
			],
			temperature: 0.82,
			max_tokens: 650,
		}),
	});
	if (!response.ok) throw new Error(`maritaca_${response.status}`);
	const data = await response.json();
	return extractTextFromAi(data);
}

// Calibra a dificuldade da Inanna à zona de desenvolvimento proximal: um degrau
// acima do que o jogador demonstrou (esquema, qualidade de rima, criatividade),
// nunca esmagando nem bajulando. Determinístico (deriva do score mecânico).
function assessDemonstratedLevel(playerQuadra: string, scheme: string, roundNumber: number): { band: string; guidance: string } {
	const m = mechanicalScore(playerQuadra, scheme, { isFinal: false });
	// A rima pesa mais (esquema + qualidade), com um empurrão da criatividade.
	const craft = m.rhyme + Math.min(6, m.creativity * 0.3);
	let tier = craft >= 16 ? 2 : craft >= 8 ? 1 : 0;
	if (roundNumber >= 3 && tier < 2) tier += 1; // a peleja escala nos rounds finais
	const bands = ["iniciante", "intermediário", "avançado"];
	const guidance = [
		"Desafie com gentileza, um degrau acima: faça UMA rima clara e mostre, pelo próprio exemplo, como fechar os dois pares do esquema. Convide a pessoa a subir, sem esmagar.",
		"Suba a régua: traga rima mais rica (consoante, 2+ letras finais) e uma imagem inesperada; provoque a pessoa a fechar o esquema com palavra própria (independência autoral).",
		"De igual para igual: rima rica, métrica apertada e um trocadilho afiado. Provoque com respeito e sem bajular — a pessoa aguenta (e merece) um bom desafio.",
	];
	return { band: bands[tier], guidance: guidance[tier] };
}

function buildInannaPrompt(input: {
	playerQuadra: string;
	theme: string;
	themeContext?: string;
	rhymeScheme: string;
	stolenWords: string[];
	roundNumber: number;
	challenge: { band: string; guidance: string };
	previousExchange?: string;
}): string {
	return `Gere a resposta da Inanna para uma peleja de quadras.

Esta é uma PELEJA DE TEMA ÚNICO: as 3 rodadas tratam do MESMO tema, formando um diálogo/duelo contínuo entre o jogador e a Inanna.

Tema do round: ${input.theme}
Contexto cultural do tema: ${input.themeContext || "(sem contexto adicional)"}
Esquema de rima obrigatório: ${input.rhymeScheme}
Round: ${input.roundNumber}
Palavras/imagens roubadas do jogador: ${input.stolenWords.join(", ") || "nenhuma"}

Quadra do jogador:
${input.playerQuadra}
${input.previousExchange ? `
Rodada ANTERIOR desta mesma peleja (mesmo tema):
${input.previousExchange}
- Mantenha o FIO do duelo: responda à quadra ATUAL retomando ou superando uma imagem/ideia da rodada anterior.
- Traga RIMAS NOVAS: NÃO repita as palavras finais nem as rimas já usadas (repetir rima é penalizado; a criatividade premia o inédito). A continuidade é no tema e na imagem, nunca em repetir o som da rima.
` : ""}
Calibragem do desafio (zona de desenvolvimento proximal):
- Nível demonstrado pelo jogador até aqui: ${input.challenge.band}.
- Desafie UM DEGRAU ACIMA desse nível: ${input.challenge.guidance}
- Nunca esmague (dureza desproporcional) nem bajule (elogio vazio/conivência): as duas tiram a chance de aprender.

Regras:
- Responda sempre em uma quadra com exatamente 4 versos.
- A quadra deve dialogar com a quadra do jogador e desafiá-la na medida da calibragem acima.
- Use pelo menos 2 palavras/imagens roubadas quando existirem.
- Inanna deve adotar a persona de uma repentista espirituosa, rápida e acolhedora.
- Suas provocações devem focar no desafio poético (por exemplo, pedir rima mais rica ou brincar com a métrica do jogador), e nunca no nível de conhecimento formal do usuário.
- ${THEME_STYLE_GUIDANCE}
- A provocação deve ser poética, sedutora no jogo verbal, nunca sexual, ofensiva, humilhante ou agressiva.
- Preserve oralidade popular sem caricatura regional.
- Retorne somente JSON válido neste formato:
{
  "verses": ["verso 1", "verso 2", "verso 3", "verso 4"],
  "stolenWords": ["palavra1", "palavra2"],
  "provocation": "uma frase curta chamando o jogador para melhorar"
}`;
}

async function generateInannaResponse(env: Env, payload: RoundPayload): Promise<{
	quadra: string;
	stolenWords: string[];
	provocation: string;
	provider: string;
}> {
	const playerQuadra = cleanText(payload.playerQuadra || payload.playerOriginalQuadra, maxQuadraChars(env));
	const stolenWords = stealWords(playerQuadra);
	const theme = cleanText(payload.theme, 120) || randomFrom(THEMES);
	const themeContext = cleanText(payload.themeContext, 1400);
	const rhymeScheme = cleanText(payload.rhymeScheme, 8) || "AABB";
	const roundNumber = Number(payload.roundNumber || 1);
	const challenge = assessDemonstratedLevel(playerQuadra, rhymeScheme, roundNumber);
	// Memória da rodada anterior (mesmo tema) para a Inanna manter o fio do duelo.
	const prev = payload.previousRound;
	const previousExchange = prev && (prev.playerQuadra || prev.inannaQuadra)
		? `Jogador (rodada ${Number(prev.roundNumber || 0)}):\n${cleanText(prev.playerQuadra, 600)}\nInanna (rodada ${Number(prev.roundNumber || 0)}):\n${cleanText(prev.inannaQuadra, 600)}`
		: "";
	const prompt = buildInannaPrompt({
		playerQuadra,
		theme,
		themeContext,
		rhymeScheme,
		stolenWords,
		roundNumber,
		challenge,
		previousExchange,
	});

	let provider = GENERATION_PROVIDER;
	let text = "";
	let parsed: JsonRecord | null = null;
	let validation: { ok: boolean; lines: string[]; errors: string[] } | null = null;
	try {
		text = await generateWithMaritaca(env, prompt);
	} catch (error) {
		provider = "workers-ai-fallback";
		console.warn("Maritaca generation failed, falling back to Workers AI", String((error as Error)?.message || error));
		text = await runWorkersAi(env, prompt, env.DEFAULT_JUDGE_MODEL || FALLBACK_MODEL);
	}

	parsed = extractJsonObject(text);
	validation = validateGeneratedInanna(parsed, text, payload.rhymeScheme || "AABB");
	if (!validation.ok) {
		const repairPrompt = buildInannaRepairPrompt({
			playerQuadra,
			rawResponse: text,
			theme,
			themeContext,
			rhymeScheme: cleanText(payload.rhymeScheme, 8) || "AABB",
			stolenWords,
			errors: validation.errors,
		});
		try {
			const repairedText = provider === GENERATION_PROVIDER
				? await generateWithMaritaca(env, repairPrompt)
				: await runWorkersAi(env, repairPrompt, env.DEFAULT_JUDGE_MODEL || FALLBACK_MODEL);
			const repairedParsed = extractJsonObject(repairedText);
			const repairedValidation = validateGeneratedInanna(repairedParsed, repairedText, payload.rhymeScheme || "AABB");
			if (repairedValidation.ok) {
				text = repairedText;
				parsed = repairedParsed;
				validation = repairedValidation;
				provider = `${provider}+repair`;
			}
		} catch (error) {
			console.warn("Inanna generation repair failed, using validated fallback", String((error as Error)?.message || error));
		}
	}

	const safeLines = validation?.ok ? validation.lines : buildFallbackInannaQuadra(playerQuadra, stolenWords, payload.rhymeScheme || "AABB");
	if (!validation?.ok) provider = "validated-fallback";
	return {
		quadra: safeLines.join("\n"),
		stolenWords: normalizeStringArray(parsed?.stolenWords || parsed?.palavras_roubadas || stolenWords).slice(0, 4),
		provocation: cleanText(parsed?.provocation || parsed?.provocacao || "Agora me diga: sua voz humana ainda sobe mais alto?", 180),
		provider,
	};
}

function normalizeStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.map((item) => cleanText(item, 40)).filter(Boolean);
}

function buildFallbackInannaQuadra(playerQuadra: string, stolen: string[], scheme: string): string[] {
	const wordA = stolen[0] || getFinalWord(getLines(playerQuadra)[0] || "") || "claridade";
	if (String(scheme).toUpperCase() === "ABAB") {
		return [
			`Levei teu ${wordA} no clarao`,
			`e pisei firme no terreiro`,
			`se tua voz busca o sertao`,
			`me vence no verso ligeiro`,
		];
	}
	if (String(scheme).toUpperCase() === "ABCB") {
		return [
			`Tua palavra me chamou`,
			`eu respondo no terreiro`,
			`se teu verso levantou`,
			`me enfrenta no verso ligeiro`,
		];
	}
	if (String(scheme).toUpperCase() === "ABBA") {
		return [
			`Levei teu ${wordA} pro clarao`,
			`e fiz meu passo no terreiro`,
			`quem afia verso ligeiro`,
			`me vence agora no sertao`,
		];
	}
	return [
		`Roubei teu ${wordA} no clarao`,
		`e fiz resposta no sertao`,
		`se tua rima vem certeira`,
		`me vence de mao ligeira`,
	];
}

function buildJudgePrompt(input: {
	playerQuadra: string;
	inannaQuadra?: string;
	theme: string;
	themeContext?: string;
	rhymeScheme: string;
	isFinal: boolean;
}): string {
	return `Avalie uma quadra em português brasileiro para o jogo educacional Inanna.

Tema: ${input.theme}
Contexto cultural do tema: ${input.themeContext || "(sem contexto adicional)"}
Esquema esperado: ${input.rhymeScheme}
E final do jogador depois da provocação? ${input.isFinal ? "sim" : "nao"}

Quadra avaliada:
${input.playerQuadra}

Quadra da Inanna, quando houver:
${input.inannaQuadra || "(sem quadra da Inanna)"}

Use rubricas curtas e nao penalize oralidade popular, simplicidade expressiva ou marcas regionais. Penalize falta de sentido interno, copia passiva da Inanna e quebra de quadra. A rima deve pesar muito: uma quadra sem rima no esquema esperado dificilmente vence.

Retorne somente JSON valido:
{
  "coherence": 0-15,
  "creativity": 0-20,
  "verisimilitude": 0-15,
  "response": 0-15,
  "autonomy": 0-15,
  "flags": {
    "hasInternalSense": true,
    "hasPoeticImage": true,
    "answersProvocation": true,
    "avoidsCopyingInanna": true,
    "languageIsUnderstandable": true,
    "keepsHumanVoice": true
  },
  "short_explanation": "Na voz da Inanna (gata cordelista que torce pela pessoa e provoca): nomeie UMA coisa boa concreta do verso, citando a palavra/rima/imagem específica que a pessoa usou, e UM próximo passo concreto e acionável para a próxima quadra (ex.: fechar o 2º par em rima consoante, trocar a palavra final repetida). Nada de elogio vazio ('muito bem!') nem dureza.",
  "feedback": "a mesma devolutiva curta em 1-2 frases: 1 acerto concreto + 1 próximo passo, sempre na voz da Inanna"
}`;
}

async function evaluateRubric(env: Env, input: {
	playerQuadra: string;
	inannaQuadra?: string;
	theme: string;
	themeContext?: string;
	rhymeScheme: string;
	isFinal: boolean;
}): Promise<AiRubric> {
	const prompt = buildJudgePrompt(input);
	try {
		// Rubrica determinística: mesma quadra -> mesma nota (analise-inanna.md §63-64),
		// pré-requisito para medir PROGRESSÃO sem ruído. temperatura 0 + seed fixa.
		const text = await runWorkersAi(env, prompt, env.DEFAULT_JUDGE_MODEL || FALLBACK_MODEL, {
			temperature: 0,
			seed: 42,
		});
		const parsed = extractJsonObject(text);
		if (parsed) return normalizeAiRubric(parsed);
	} catch (error) {
		console.warn("Workers AI rubric failed, using heuristic", String((error as Error)?.message || error));
	}
	const mechanical = mechanicalScore(input.playerQuadra, input.rhymeScheme, {
		isFinal: input.isFinal,
		inannaQuadra: input.inannaQuadra,
	});
	return {
		coherence: Math.min(15, mechanical.coherence + 3),
		creativity: mechanical.creativity,
		verisimilitude: Math.min(15, mechanical.verisimilitude + 3),
		response: input.isFinal ? 8 : 0,
		autonomy: mechanical.autonomy,
		flags: {
			hasInternalSense: mechanical.rubrics.hasReadableLanguage,
			hasPoeticImage: mechanical.creativity >= 10,
			answersProvocation: input.isFinal,
			avoidsCopyingInanna: mechanical.autonomy >= 10,
			languageIsUnderstandable: mechanical.rubrics.hasReadableLanguage,
			keepsHumanVoice: true,
		},
		feedback: "Avaliei no modo rápido desta vez: tua forma segura a quadra. Na próxima, fecha bem os dois pares do esquema e ousa uma imagem mais tua pra ganhar autoria.",
	};
}

function normalizeAiRubric(value: JsonRecord): AiRubric {
	const flags = value.flags && typeof value.flags === "object" ? value.flags as Record<string, boolean> : {};
	return {
		coherence: clampScore(Number(value.coherence), 15),
		creativity: clampScore(Number(value.creativity), 20),
		verisimilitude: clampScore(Number(value.verisimilitude), 15),
		response: clampScore(Number(value.response), 15),
		autonomy: clampScore(Number(value.autonomy), 15),
		flags: {
			hasInternalSense: !!flags.hasInternalSense,
			hasPoeticImage: !!flags.hasPoeticImage,
			answersProvocation: !!flags.answersProvocation,
			avoidsCopyingInanna: flags.avoidsCopyingInanna !== false,
			languageIsUnderstandable: flags.languageIsUnderstandable !== false,
			keepsHumanVoice: flags.keepsHumanVoice !== false,
		},
		feedback: cleanText(value.short_explanation || value.shortExplanation || value.feedback || "Boa peleja: revise rima, imagem e resposta à provocação.", 220),
	};
}

function mergeScore(mechanical: MechanicalScore, ai: AiRubric): MechanicalScore {
	const structure = mechanical.structure;
	const rhyme = mechanical.rhyme;
	const creativity = clampScore(Math.round((mechanical.creativity + ai.creativity) / 2), 20);
	const autonomy = clampScore(ai.autonomy || mechanical.autonomy, 15);
	const verisimilitude = clampScore(ai.verisimilitude || mechanical.verisimilitude, 15);
	const coherence = clampScore(ai.coherence || mechanical.coherence, 15);
	const response = clampScore(ai.response || mechanical.response, 15);
	return {
		...mechanical,
		structure,
		rhyme,
		creativity,
		autonomy,
		verisimilitude,
		coherence,
		response,
		total: structure + rhyme + creativity + autonomy + verisimilitude + coherence + response,
		rubrics: { ...mechanical.rubrics, ...ai.flags },
	};
}

function decideWinner(player: MechanicalScore, inanna: MechanicalScore): "player" | "inanna" | "draw" {
	const playerEligible = player.structure >= 10 && player.rhyme >= 10 && player.coherence >= 8;
	if (!playerEligible && inanna.total >= player.total) return "inanna";
	if (player.total - inanna.total >= 3) return "player";
	if (inanna.total - player.total >= 3) return "inanna";
	return "draw";
}

function decideTiebreakWinner(player: MechanicalScore, inanna: MechanicalScore): "player" | "inanna" {
	const priority: Array<keyof MechanicalScore> = ["total", "response", "rhyme", "creativity", "coherence", "autonomy", "structure"];
	for (const key of priority) {
		const playerValue = Number(player[key] || 0);
		const inannaValue = Number(inanna[key] || 0);
		if (playerValue > inannaValue) return "player";
		if (inannaValue > playerValue) return "inanna";
	}
	return player.structure >= 10 && player.rhyme >= 10 && player.coherence >= 8 ? "player" : "inanna";
}

async function scoreQuadra(env: Env, input: {
	quadra: string;
	rhymeScheme: string;
	theme: string;
	themeContext?: string;
	isFinal?: boolean;
	inannaQuadra?: string;
}): Promise<{ score: MechanicalScore; ai: AiRubric }> {
	const mechanical = mechanicalScore(input.quadra, input.rhymeScheme, {
		isFinal: input.isFinal,
		inannaQuadra: input.inannaQuadra,
	});
	const ai = await evaluateRubric(env, {
		playerQuadra: input.quadra,
		inannaQuadra: input.inannaQuadra,
		theme: input.theme,
		themeContext: input.themeContext,
		rhymeScheme: input.rhymeScheme,
		isFinal: !!input.isFinal,
	});
	return { score: mergeScore(mechanical, ai), ai };
}

function maxQuadraChars(env: Env): number {
	return Number(env.MAX_QUADRA_CHARS || 900) || 900;
}

async function rateLimit(binding: RateLimitBinding | undefined, key: string): Promise<boolean> {
	if (!binding) return true;
	const result = await binding.limit({ key });
	return !!result.success;
}

async function readJson<T>(request: Request): Promise<T> {
	const text = await request.text();
	if (!text) return {} as T;
	return JSON.parse(text) as T;
}

async function supabaseFetch(env: Env, path: string, init: RequestInit): Promise<unknown> {
	if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
	const url = `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path.replace(/^\//, "")}`;
	const headers = new Headers(init.headers);
	headers.set("apikey", env.SUPABASE_SERVICE_ROLE_KEY);
	headers.set("authorization", `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`);
	headers.set("content-type", "application/json");
	if (!headers.has("prefer")) headers.set("prefer", "return=representation");
	const response = await fetch(url, { ...init, headers });
	if (!response.ok) {
		const body = await response.text();
		console.warn("Supabase write failed", response.status, body.slice(0, 260));
		return null;
	}
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

function enabledByDefault(value: unknown, fallback = true): boolean {
	if (typeof value === "undefined" || value === null || value === "") return fallback;
	return truthy(value);
}

async function fetchExistingRhymeRows(env: Env, sessionId: string, playerId: string): Promise<JsonRecord[]> {
	if (!enabledByDefault(env.LEVEL2_RHYME_BANK_ENABLED, true) || !sessionId || !playerId) return [];
	const data = await supabaseFetch(
		env,
		`level2_rhyme_bank?session_id=eq.${encodeURIComponent(sessionId)}&player_id=eq.${encodeURIComponent(playerId)}&select=normalized_final_word,rhyme_key`,
		{ method: "GET" },
	);
	return Array.isArray(data) ? data as JsonRecord[] : [];
}

async function analyzeLevel2RhymeOriginality(env: Env, payload: RoundPayload, quadra: string): Promise<RhymeOriginalityAnalysis> {
	const enabled = enabledByDefault(env.LEVEL2_RHYME_BANK_ENABLED, true);
	const playerId = cleanText(payload.playerId, 120);
	const sessionId = cleanText(payload.sessionId, 80);
	const existingRows = enabled ? await fetchExistingRhymeRows(env, sessionId, playerId) : [];
	const existingWords = new Set(existingRows.map((row) => cleanText(row.normalized_final_word, 80)).filter(Boolean));
	const existingKeys = new Set(existingRows.map((row) => cleanText(row.rhyme_key, 40)).filter(Boolean));
	const currentWords = new Set<string>();
	const currentKeys = new Set<string>();
	const entries = getLines(quadra).slice(0, 4).map((line, index) => {
		const finalWord = getFinalWord(line);
		const normalizedFinalWord = normalizeWord(finalWord);
		const rhymeKey = phoneticRhymeKey(finalWord);
		const isRepeatedExactWord = !!normalizedFinalWord && (existingWords.has(normalizedFinalWord) || currentWords.has(normalizedFinalWord));
		const isRepeatedRhymeFamily = !!rhymeKey && (existingKeys.has(rhymeKey) || currentKeys.has(rhymeKey));
		if (normalizedFinalWord) currentWords.add(normalizedFinalWord);
		if (rhymeKey) currentKeys.add(rhymeKey);
		return {
			playerId,
			sessionId,
			verseNumber: index + 1,
			finalWord,
			normalizedFinalWord,
			rhymeKey,
			rhymeFamily: rhymeKey,
			fullVerse: cleanText(line, 260),
			isRepeatedExactWord,
			isRepeatedRhymeFamily,
			earnedOriginalityBonus: !!rhymeKey && !isRepeatedExactWord && !isRepeatedRhymeFamily,
		};
	});
	const newFinalWordCount = entries.filter((entry) => entry.normalizedFinalWord && !entry.isRepeatedExactWord).length;
	const newRhymeFamilyCount = entries.filter((entry) => entry.rhymeKey && !entry.isRepeatedRhymeFamily).length;
	const exactRepeatCount = entries.filter((entry) => entry.isRepeatedExactWord).length;
	const rhymeFamilyRepeatCount = entries.filter((entry) => entry.isRepeatedRhymeFamily).length;
	const positiveDelta = (newFinalWordCount > 0 ? 2 : 0) + (newRhymeFamilyCount > 0 ? 3 : 0);
	const originalityDelta = Math.max(-6, Math.min(5, positiveDelta - exactRepeatCount * 2));
	return {
		entries,
		summary: {
			enabled,
			newFinalWordCount,
			newRhymeFamilyCount,
			exactRepeatCount,
			rhymeFamilyRepeatCount,
			earnedOriginalityBonus: entries.some((entry) => entry.earnedOriginalityBonus),
			originalityDelta,
			repeatedFinalWords: entries.filter((entry) => entry.isRepeatedExactWord).map((entry) => entry.finalWord),
			repeatedRhymeKeys: [...new Set(entries.filter((entry) => entry.isRepeatedRhymeFamily).map((entry) => entry.rhymeKey).filter(Boolean))],
		},
	};
}

function applyRhymeOriginality(score: MechanicalScore, analysis: RhymeOriginalityAnalysis): MechanicalScore {
	const next: MechanicalScore = {
		...score,
		finalWords: [...score.finalWords],
		rhymeKeys: [...score.rhymeKeys],
		rubrics: {
			...score.rubrics,
			hasNewRhymeFamily: analysis.summary.newRhymeFamilyCount > 0,
			avoidsExactFinalWordRepeat: analysis.summary.exactRepeatCount === 0,
		},
	};
	const delta = analysis.summary.originalityDelta;
	if (delta > 0) {
		let remaining = delta;
		const rhymeBonus = Math.min(20 - next.rhyme, remaining);
		next.rhyme += rhymeBonus;
		remaining -= rhymeBonus;
		if (remaining > 0) next.creativity = clampScore(next.creativity + remaining, 20);
	} else if (delta < 0) {
		next.rhyme = clampScore(next.rhyme + delta, 20);
	}
	next.total = next.structure + next.rhyme + next.creativity + next.autonomy + next.verisimilitude + next.coherence + next.response;
	return next;
}

async function saveRhymeBankEntries(env: Env, entries: RhymeBankEntry[], roundId: string): Promise<void> {
	if (!enabledByDefault(env.LEVEL2_RHYME_BANK_ENABLED, true) || !entries.length) return;
	const sessionId = entries[0]?.sessionId;
	const playerId = entries[0]?.playerId;
	if (!sessionId || !playerId) return;
	await supabaseFetch(env, "level2_rhyme_bank", {
		method: "POST",
		body: JSON.stringify(entries.map((entry) => ({
			player_id: entry.playerId,
			session_id: entry.sessionId,
			round_id: roundId || null,
			quadra_id: roundId || null,
			verse_number: entry.verseNumber,
			final_word: entry.finalWord,
			normalized_final_word: entry.normalizedFinalWord,
			rhyme_key: entry.rhymeKey,
			rhyme_family: entry.rhymeFamily,
			full_verse: entry.fullVerse,
			is_repeated_exact_word: entry.isRepeatedExactWord,
			is_repeated_rhyme_family: entry.isRepeatedRhymeFamily,
			earned_originality_bonus: entry.earnedOriginalityBonus,
		}))),
	});
}

async function ensurePlayerWallet(env: Env, playerId: string): Promise<JsonRecord | null> {
	const cleanPlayerId = cleanText(playerId, 120);
	if (!cleanPlayerId) return null;
	await supabaseFetch(env, "player_wallets?on_conflict=player_id", {
		method: "POST",
		headers: { prefer: "resolution=ignore-duplicates,return=minimal" },
		body: JSON.stringify({ player_id: cleanPlayerId }),
	});
	const data = await supabaseFetch(
		env,
		`player_wallets?player_id=eq.${encodeURIComponent(cleanPlayerId)}&select=*`,
		{ method: "GET" },
	);
	return Array.isArray(data) ? data[0] as JsonRecord || null : null;
}

async function getLevel2Puzzle(env: Env): Promise<JsonRecord | null> {
	const data = await supabaseFetch(
		env,
		`puzzles?slug=eq.${encodeURIComponent(LEVEL2_PUZZLE_SLUG)}&select=puzzle_id,total_pieces`,
		{ method: "GET" },
	);
	return Array.isArray(data) ? data[0] as JsonRecord || null : null;
}

async function getSessionRewardTotal(env: Env, sessionId: string, playerId: string): Promise<number> {
  if (!sessionId || !playerId) return 0;
  const data = await supabaseFetch(
    env,
    `reward_ledger?session_id=eq.${encodeURIComponent(sessionId)}&player_id=eq.${encodeURIComponent(playerId)}&reward_unit=eq.xilo_piece&select=amount`,
		{ method: "GET" },
	);
  if (!Array.isArray(data)) return 0;
  return Math.max(0, data.reduce((sum, row) => sum + Number((row as JsonRecord).amount || 0), 0));
}

function asRows(data: unknown): JsonRecord[] {
	if (!Array.isArray(data)) return [];
	return data.filter((row) => row && typeof row === "object") as JsonRecord[];
}

async function getPlayerProfile(request: Request, env: Env, playerId: string): Promise<Response> {
	const cleanPlayerId = cleanText(playerId, 120);
	if (!cleanPlayerId) return json({ ok: false, error: "missing_player_id" }, { status: 400 }, env, request);
	const headerPlayerId = cleanText(request.headers.get("x-inanna-player-id"), 120);
	if (headerPlayerId && headerPlayerId !== cleanPlayerId) {
		return json({ ok: false, error: "player_id_mismatch" }, { status: 403 }, env, request);
	}
	if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
		return json({
			ok: true,
			playerId: cleanPlayerId,
			source: "ephemeral",
			wallet: null,
			rewards: [],
			sessions: [],
			rounds: [],
			pieces: [],
			totalPieces: LEVEL2_PUZZLE_TOTAL_PIECES,
		}, { status: 200 }, env, request);
	}

	const encodedPlayerId = encodeURIComponent(cleanPlayerId);
	const [walletRows, rewardRows, sessionRows, roundRows, pieceRows, puzzle] = await Promise.all([
		supabaseFetch(env, `player_wallets?player_id=eq.${encodedPlayerId}&select=wallet_id,player_id,internal_balance_pieces,internal_balance_peleja_points,level1_pieces_count,level2_pieces_count,completed_puzzles_count,updated_at`, { method: "GET" }),
		supabaseFetch(env, `reward_ledger?player_id=eq.${encodedPlayerId}&select=ledger_id,session_id,level,event_type,amount,reward_unit,reason,related_round_id,metadata_json,created_at&order=created_at.desc&limit=80`, { method: "GET" }),
		supabaseFetch(env, `inanna_sessions?player_id=eq.${encodedPlayerId}&select=session_id,nickname,current_round,player_wins,inanna_wins,status,created_at,finished_at&order=created_at.desc&limit=12`, { method: "GET" }),
		supabaseFetch(env, `inanna_rounds?player_id=eq.${encodedPlayerId}&select=round_id,session_id,round_number,theme,rhyme_scheme,player_original_quadra,player_final_quadra,inanna_quadra,player_score,inanna_score,round_winner,created_at,ai_evaluation_json&order=created_at.desc&limit=30`, { method: "GET" }),
		supabaseFetch(env, `puzzle_pieces?player_id=eq.${encodedPlayerId}&select=piece_id,puzzle_id,level,session_id,round_id,piece_index,piece_color,criterion_source,status,earned_at,metadata_json&order=earned_at.desc&limit=120`, { method: "GET" }),
		getLevel2Puzzle(env),
	]);

	return json({
		ok: true,
		playerId: cleanPlayerId,
		source: "supabase",
		wallet: asRows(walletRows)[0] || null,
		rewards: asRows(rewardRows),
		sessions: asRows(sessionRows),
		rounds: asRows(roundRows),
		pieces: asRows(pieceRows),
		totalPieces: Number(puzzle?.total_pieces || LEVEL2_PUZZLE_TOTAL_PIECES),
	}, { status: 200 }, env, request);
}

function capRewardGrants(grants: RewardGrant[], maxPieces: number): RewardGrant[] {
  let remaining = Math.max(0, maxPieces);
  const capped: RewardGrant[] = [];
	for (const grant of grants) {
		if (remaining <= 0) break;
		const amount = Math.min(Math.max(0, Math.round(grant.amount)), remaining);
		if (amount > 0) {
			capped.push({ ...grant, amount });
			remaining -= amount;
		}
	}
	return capped;
}

function buildRoundRewardGrants(result: JsonRecord, analysis: RhymeOriginalityAnalysis): RewardGrant[] {
	const playerScore = result.playerScore as MechanicalScore | undefined;
	const grants: RewardGrant[] = [
		{
			eventType: "piece_earned",
			amount: 1,
			rewardUnit: "xilo_piece",
			reason: "participacao_round",
			criterionSource: "participacao_round",
			pieceColor: REWARD_COLORS.participacao_round,
		},
	];
	if (result.roundWinner === "player") {
		grants.push({
			eventType: "piece_earned",
			amount: 1,
			rewardUnit: "xilo_piece",
			reason: "vitoria_round",
			criterionSource: "vitoria_round",
			pieceColor: REWARD_COLORS.vitoria_round,
		});
	}
	if (analysis.summary.earnedOriginalityBonus) {
		grants.push({
			eventType: "rhyme_bonus",
			amount: 1,
			rewardUnit: "xilo_piece",
			reason: "rima_inedita",
			criterionSource: "rima_inedita",
			pieceColor: REWARD_COLORS.rima_inedita,
			metadata: { rhymeOriginality: analysis.summary },
		});
	}
	if (Number(playerScore?.creativity || 0) >= 16) {
		grants.push({
			eventType: "creativity_bonus",
			amount: 1,
			rewardUnit: "xilo_piece",
			reason: "criatividade_alta",
			criterionSource: "criatividade_alta",
			pieceColor: REWARD_COLORS.criatividade_alta,
		});
	}
	return capRewardGrants(grants, LEVEL2_MAX_PIECES_PER_ROUND);
}

function buildMatchRewardGrants(result: JsonRecord, sessionUpdate: SessionScoreUpdate): RewardGrant[] {
	if (!sessionUpdate.finished) return [];
	const playerScore = result.playerScore as MechanicalScore | undefined;
	const grants: RewardGrant[] = [];
	if (sessionUpdate.playerWins > sessionUpdate.inannaWins) {
		grants.push({
			eventType: "piece_earned",
			amount: 2,
			rewardUnit: "xilo_piece",
			reason: "vitoria_peleja",
			criterionSource: "vitoria_peleja",
			pieceColor: REWARD_COLORS.vitoria_peleja,
		});
	}
	if (Number(playerScore?.coherence || 0) >= 12) {
		grants.push({
			eventType: "piece_earned",
			amount: 1,
			rewardUnit: "xilo_piece",
			reason: "coerencia_final",
			criterionSource: "coerencia_final",
			pieceColor: REWARD_COLORS.coerencia_final,
		});
	}
	return grants;
}

async function recordLevel2Rewards(
	env: Env,
	payload: RoundPayload,
	result: JsonRecord,
	roundId: string,
	analysis: RhymeOriginalityAnalysis,
	sessionUpdate: SessionScoreUpdate,
): Promise<JsonRecord> {
	const playerId = cleanText(payload.playerId, 120);
	const sessionId = cleanText(payload.sessionId, 80);
	if (!enabledByDefault(env.LEVEL2_XILO_PUZZLE_ENABLED, true) || !playerId || !sessionId) {
		return { enabled: false, piecesEarned: 0 };
	}
	const [wallet, puzzle, sessionAlreadyEarned] = await Promise.all([
		ensurePlayerWallet(env, playerId),
		getLevel2Puzzle(env),
		getSessionRewardTotal(env, sessionId, playerId),
	]);
	if (!wallet || !puzzle?.puzzle_id) return { enabled: false, piecesEarned: 0 };
	const totalPieces = Number(puzzle.total_pieces || LEVEL2_PUZZLE_TOTAL_PIECES);
	const currentLevel2Pieces = Number(wallet.level2_pieces_count || 0);
	const candidateGrants = [
		...buildRoundRewardGrants(result, analysis),
		...buildMatchRewardGrants(result, sessionUpdate),
	];
	const maxByMatch = Math.max(0, LEVEL2_MAX_PIECES_PER_MATCH - sessionAlreadyEarned);
	const maxByPuzzle = Math.max(0, totalPieces - currentLevel2Pieces);
	const grants = capRewardGrants(candidateGrants, Math.min(maxByMatch, maxByPuzzle));
	const piecesEarned = grants.reduce((sum, grant) => sum + grant.amount, 0);
	if (!piecesEarned) {
		return {
			enabled: true,
			piecesEarned: 0,
			level2PiecesCount: currentLevel2Pieces,
			totalPieces,
			reasons: [],
		};
	}

	const piecePayload: JsonRecord[] = [];
	let nextPieceIndex = currentLevel2Pieces + 1;
	for (const grant of grants) {
		for (let index = 0; index < grant.amount; index += 1) {
			piecePayload.push({
				player_id: playerId,
				puzzle_id: puzzle.puzzle_id,
				level: 2,
				session_id: sessionId,
				round_id: roundId || null,
				piece_index: nextPieceIndex,
				piece_color: grant.pieceColor,
				criterion_source: grant.criterionSource,
				status: "earned",
				metadata_json: {
					reason: grant.reason,
					...(grant.metadata || {}),
				},
			});
			nextPieceIndex += 1;
		}
	}

	const inserted = await supabaseFetch(env, "puzzle_pieces", {
		method: "POST",
		body: JSON.stringify(piecePayload),
	});
	const insertedPieces = Array.isArray(inserted) ? inserted as JsonRecord[] : [];
	const ledgerRows: JsonRecord[] = [];
	let pieceCursor = 0;
	for (const grant of grants) {
		for (let index = 0; index < grant.amount; index += 1) {
			const piece = insertedPieces[pieceCursor] || {};
			ledgerRows.push({
				player_id: playerId,
				session_id: sessionId,
				level: 2,
				event_type: grant.eventType,
				amount: 1,
				reward_unit: grant.rewardUnit,
				reason: grant.reason,
				related_piece_id: piece.piece_id || null,
				related_round_id: roundId || null,
				metadata_json: {
					criterionSource: grant.criterionSource,
					blockchainEnabled: false,
					nftMintingEnabled: false,
					externalWalletEnabled: false,
					...(grant.metadata || {}),
				},
			});
			pieceCursor += 1;
		}
	}
	await supabaseFetch(env, "reward_ledger", {
		method: "POST",
		body: JSON.stringify(ledgerRows),
	});

	const updatedLevel2Pieces = currentLevel2Pieces + piecesEarned;
	const completedPuzzle = currentLevel2Pieces < totalPieces && updatedLevel2Pieces >= totalPieces;
	if (completedPuzzle) {
		await supabaseFetch(env, "reward_ledger", {
			method: "POST",
			body: JSON.stringify({
				player_id: playerId,
				session_id: sessionId,
				level: 2,
				event_type: "puzzle_completed",
				amount: 1,
				reward_unit: "authorship_mark",
				reason: "xilogravura_completa",
				related_round_id: roundId || null,
				metadata_json: {
					puzzleSlug: LEVEL2_PUZZLE_SLUG,
					totalPieces,
					futureNftEligible: true,
					blockchainEnabled: false,
					nftMintingEnabled: false,
				},
			}),
		});
	}
	await supabaseFetch(env, `player_wallets?player_id=eq.${encodeURIComponent(playerId)}`, {
		method: "PATCH",
		body: JSON.stringify({
			internal_balance_pieces: Number(wallet.internal_balance_pieces || 0) + piecesEarned,
			level2_pieces_count: updatedLevel2Pieces,
			completed_puzzles_count: Number(wallet.completed_puzzles_count || 0) + (completedPuzzle ? 1 : 0),
		}),
	});

	return {
		enabled: true,
		piecesEarned,
		level2PiecesCount: updatedLevel2Pieces,
		totalPieces,
		completedPuzzle,
		reasons: grants.map((grant) => grant.reason),
	};
}

async function upsertPlayer(env: Env, payload: SessionPayload): Promise<void> {
	const playerId = cleanText(payload.playerId, 120);
	if (!playerId) return;
	await supabaseFetch(env, "inanna_players?on_conflict=player_id", {
		method: "POST",
		headers: { prefer: "resolution=merge-duplicates,return=minimal" },
		body: JSON.stringify({
			player_id: playerId,
			nickname: cleanText(payload.nickname, 80) || "Jogador",
			updated_at: new Date().toISOString(),
		}),
	});
	await ensurePlayerWallet(env, playerId);
}

async function createSession(env: Env, payload: SessionPayload): Promise<JsonRecord | null> {
	await upsertPlayer(env, payload);
	const data = await supabaseFetch(env, "inanna_sessions", {
		method: "POST",
		body: JSON.stringify({
			player_id: cleanText(payload.playerId, 120),
			nickname: cleanText(payload.nickname, 80) || "Jogador",
			level: 2,
			status: "active",
			input_mode: cleanText(payload.inputMode, 40) || "written",
			sound_mode: cleanText(payload.soundMode, 40) || "none",
			current_round: 1,
			level_progress: payload.levelProgress || {},
		}),
	});
	return Array.isArray(data) ? data[0] as JsonRecord : null;
}

async function updateSessionScore(env: Env, sessionId: string, winner: string, roundNumber: number): Promise<SessionScoreUpdate> {
	if (!sessionId) return { playerWins: 0, inannaWins: 0, finished: roundNumber >= 3 };
	const current = await supabaseFetch(env, `inanna_sessions?session_id=eq.${encodeURIComponent(sessionId)}&select=player_wins,inanna_wins`, {
		method: "GET",
		headers: { prefer: "return=representation" },
	});
	const row = Array.isArray(current) ? current[0] as JsonRecord | undefined : undefined;
	const playerWins = Number(row?.player_wins || 0) + (winner === "player" ? 1 : 0);
	const inannaWins = Number(row?.inanna_wins || 0) + (winner === "inanna" ? 1 : 0);
	const finished = roundNumber >= 3 || playerWins >= 2 || inannaWins >= 2 || (roundNumber >= 2 && playerWins !== inannaWins);
	await supabaseFetch(env, `inanna_sessions?session_id=eq.${encodeURIComponent(sessionId)}`, {
		method: "PATCH",
		body: JSON.stringify({
			player_wins: playerWins,
			inanna_wins: inannaWins,
			current_round: finished ? roundNumber : roundNumber + 1,
			status: finished ? "finished" : "active",
			finished_at: finished ? new Date().toISOString() : null,
		}),
	});
	return { playerWins, inannaWins, finished };
}

async function saveRound(env: Env, payload: RoundPayload, result: JsonRecord): Promise<JsonRecord | null> {
	const data = await supabaseFetch(env, "inanna_rounds", {
		method: "POST",
		body: JSON.stringify({
			session_id: cleanText(payload.sessionId, 80) || null,
			player_id: cleanText(payload.playerId, 120),
			round_number: Number(payload.roundNumber || 1),
			theme: cleanText(payload.theme, 160),
			rhyme_scheme: cleanText(payload.rhymeScheme, 8),
			player_original_quadra: cleanText(payload.playerOriginalQuadra || payload.playerQuadra, 1200),
			player_final_quadra: cleanText(payload.playerFinalQuadra, 1200),
			inanna_quadra: cleanText(payload.inannaQuadra, 1200),
			stolen_words: payload.stolenWords || [],
			player_score: Number(result.playerScoreTotal || 0),
			inanna_score: Number(result.inannaScoreTotal || 0),
			round_winner: cleanText(result.roundWinner, 20),
			content_privacy_json: result.contentPrivacy || {},
			ai_evaluation_json: result,
		}),
	});
	return Array.isArray(data) ? data[0] as JsonRecord : null;
}

async function startSession(request: Request, env: Env): Promise<Response> {
	const payload = await readJson<SessionPayload>(request);
	const playerId = cleanText(payload.playerId, 120);
	if (!playerId) return json({ ok: false, error: "missing_player_id" }, { status: 400 }, env, request);
	const saved = await createSession(env, payload);
	const sessionId = cleanText(saved?.session_id, 80) || crypto.randomUUID();
	return json({
		ok: true,
		session: {
			sessionId,
			playerId,
			nickname: cleanText(payload.nickname, 80) || "Jogador",
			roundCount: Number(env.ROUND_COUNT || 3) || 3,
			currentRound: 1,
			status: "active",
			source: saved ? "supabase" : "ephemeral",
		},
	}, { status: 201 }, env, request);
}

async function generateChallenge(env: Env): Promise<JsonRecord> {
	const catalog = await loadLevel2ThematicChallenges(env);
	const selected = catalog.length ? randomFrom(catalog) : null;
	return {
		theme: selected?.theme || randomFrom(THEMES),
		context: selected?.context || "",
		source: selected?.source || "",
		thematicSource: selected ? "worker_csv" : "worker_fallback",
		rhymeScheme: randomFrom(SCHEMES),
		seedImage: randomFrom(["ônibus", "caderno", "praça", "rio", "tambor", "celular", "bola", "feira"]),
	};
}

async function respondRound(request: Request, env: Env): Promise<Response> {
	const key = request.headers.get("x-inanna-player-id") || request.headers.get("cf-connecting-ip") || "anonymous";
	if (!(await rateLimit(env.AI_RATE_LIMITER, `ai:${key}`))) {
		return json({ ok: false, error: "rate_limited" }, { status: 429 }, env, request);
	}
	const payload = await readJson<RoundPayload>(request);
	const playerQuadra = cleanText(payload.playerQuadra || payload.playerOriginalQuadra, maxQuadraChars(env));
	if (!playerQuadra) return json({ ok: false, error: "missing_quadra" }, { status: 400 }, env, request);
	const privacy = inspectContentPrivacy(playerQuadra);
	if (!privacy.ok) return privacyErrorResponse(privacy, env, request);
	const theme = cleanText(payload.theme, 160) || randomFrom(THEMES);
	const themeContext = cleanText(payload.themeContext, 1400);
	const rhymeScheme = cleanText(payload.rhymeScheme, 8) || randomFrom(SCHEMES);
	const [playerPrelim, inanna] = await Promise.all([
		scoreQuadra(env, { quadra: playerQuadra, rhymeScheme, theme, themeContext }),
		generateInannaResponse(env, { ...payload, playerQuadra, theme, themeContext, rhymeScheme }),
	]);
	const inannaScored = await scoreQuadra(env, {
		quadra: inanna.quadra,
		rhymeScheme,
		theme,
		themeContext,
	});
	return json({
		ok: true,
		theme,
		themeContext,
		themeSource: cleanText(payload.themeSource, 500),
		rhymeScheme,
		playerPrelim,
		inanna,
		inannaScore: inannaScored.score,
		generationProvider: inanna.provider,
		contentPrivacy: {
			piiDetected: privacy.piiDetected,
			issues: privacy.issues,
			immutableMetadataAllowed: privacy.immutableMetadataAllowed,
		},
	}, { status: 200 }, env, request);
}

async function finalizeRound(request: Request, env: Env): Promise<Response> {
	const key = request.headers.get("x-inanna-player-id") || request.headers.get("cf-connecting-ip") || "anonymous";
	if (!(await rateLimit(env.AI_RATE_LIMITER, `judge:${key}`))) {
		return json({ ok: false, error: "rate_limited" }, { status: 429 }, env, request);
	}
	const payload = await readJson<RoundPayload>(request);
	const playerFinalQuadra = cleanText(payload.playerFinalQuadra || payload.playerQuadra, maxQuadraChars(env));
	const inannaQuadra = cleanText(payload.inannaQuadra, maxQuadraChars(env));
	if (!playerFinalQuadra || !inannaQuadra) return json({ ok: false, error: "missing_final_or_inanna_quadra" }, { status: 400 }, env, request);
	const privacy = inspectContentPrivacy(`${payload.playerOriginalQuadra || ""}\n${playerFinalQuadra}`);
	if (!privacy.ok) return privacyErrorResponse(privacy, env, request);
	const theme = cleanText(payload.theme, 160) || randomFrom(THEMES);
	const themeContext = cleanText(payload.themeContext, 1400);
	const rhymeScheme = cleanText(payload.rhymeScheme, 8) || "AABB";
	const [playerFinal, inannaFinal] = await Promise.all([
		scoreQuadra(env, {
			quadra: playerFinalQuadra,
			rhymeScheme,
			theme,
			themeContext,
			isFinal: true,
			inannaQuadra,
		}),
		scoreQuadra(env, {
			quadra: inannaQuadra,
			rhymeScheme,
			theme,
			themeContext,
			isFinal: false,
		}),
	]);
	const rhymeOriginality = await analyzeLevel2RhymeOriginality(env, payload, playerFinalQuadra);
	const adjustedPlayerScore = applyRhymeOriginality(playerFinal.score, rhymeOriginality);
	let roundWinner = decideWinner(adjustedPlayerScore, inannaFinal.score);
	if (roundWinner === "draw" && Number(payload.roundNumber || 1) >= 3) {
		roundWinner = decideTiebreakWinner(adjustedPlayerScore, inannaFinal.score);
	}
	const result: JsonRecord = {
		ok: true,
		theme,
		themeContext,
		themeSource: cleanText(payload.themeSource, 500),
		roundWinner,
		playerScore: adjustedPlayerScore,
		playerAiRubric: playerFinal.ai,
		inannaScore: inannaFinal.score,
		inannaAiRubric: inannaFinal.ai,
		playerScoreTotal: adjustedPlayerScore.total,
		inannaScoreTotal: inannaFinal.score.total,
		shortExplanation: buildRoundShortExplanation(roundWinner, adjustedPlayerScore, inannaFinal.score, playerFinal.ai.feedback),
		feedback: buildRoundFeedback(roundWinner, adjustedPlayerScore, inannaFinal.score, playerFinal.ai.feedback),
		rhymeOriginality: rhymeOriginality.summary,
		contentPrivacy: {
			piiDetected: privacy.piiDetected,
			issues: privacy.issues,
			immutableMetadataAllowed: privacy.immutableMetadataAllowed,
		},
	};
	const savedRound = await saveRound(env, payload, result);
	const roundId = cleanText(savedRound?.round_id, 80);
	await saveRhymeBankEntries(env, rhymeOriginality.entries, roundId);
	const sessionUpdate = await updateSessionScore(env, cleanText(payload.sessionId, 80), roundWinner, Number(payload.roundNumber || 1));
	const rewardSummary = await recordLevel2Rewards(env, payload, result, roundId, rhymeOriginality, sessionUpdate);
	return json({ ...result, roundId: roundId || null, sessionUpdate, rewardSummary }, { status: 200 }, env, request);
}

function buildRoundFeedback(winner: string, player: MechanicalScore, inanna: MechanicalScore, feedback: string): string {
	return `${buildRoundShortExplanation(winner, player, inanna, feedback)} Placar: humano ${player.total}, Inanna ${inanna.total}.`;
}

function buildRoundShortExplanation(winner: string, player: MechanicalScore, inanna: MechanicalScore, feedback: string): string {
	const base = winner === "player"
		? "Você venceu o round: sua resposta segurou rima, voz e intenção."
		: winner === "inanna"
			? "Inanna levou o round: revise rima, coesão e resposta à provocação."
			: "Empate técnico: os versos ficaram próximos na peleja.";
	return `${base} ${feedback}`;
}

async function voteRound(request: Request, env: Env): Promise<Response> {
	if (!truthy(env.SOCIAL_VOTING_ENABLED)) return json({ ok: false, error: "social_voting_disabled" }, { status: 403 }, env, request);
	const payload = await readJson<VotePayload>(request);
	const observerId = cleanText(payload.observerId, 120) || request.headers.get("cf-connecting-ip") || "anonymous";
	if (!(await rateLimit(env.VOTE_RATE_LIMITER, `vote:${observerId}`))) {
		return json({ ok: false, error: "rate_limited" }, { status: 429 }, env, request);
	}
	if (env.TURNSTILE_SECRET_KEY && payload.turnstileToken) {
		const ok = await verifyTurnstile(env, payload.turnstileToken, request.headers.get("cf-connecting-ip") || "");
		if (!ok) return json({ ok: false, error: "turnstile_failed" }, { status: 403 }, env, request);
	}
	const target = cleanText(payload.voteTarget, 20);
	if (!["player", "inanna"].includes(target)) return json({ ok: false, error: "invalid_vote_target" }, { status: 400 }, env, request);
	const saved = await supabaseFetch(env, "inanna_votes?on_conflict=round_id,observer_id", {
		method: "POST",
		headers: { prefer: "resolution=ignore-duplicates,return=representation" },
		body: JSON.stringify({
			session_id: cleanText(payload.sessionId, 80) || null,
			round_id: cleanText(payload.roundId, 80) || null,
			observer_id: observerId,
			vote_target: target,
		}),
	});
	return json({ ok: true, vote: Array.isArray(saved) ? saved[0] || null : null }, { status: 201 }, env, request);
}

async function verifyTurnstile(env: Env, token: string, remoteIp: string): Promise<boolean> {
	const form = new FormData();
	form.set("secret", env.TURNSTILE_SECRET_KEY || "");
	form.set("response", token);
	if (remoteIp) form.set("remoteip", remoteIp);
	const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		body: form,
	});
	if (!response.ok) return false;
	const data = await response.json() as { success?: boolean };
	return !!data.success;
}

function truthy(value: unknown): boolean {
	if (value === true) return true;
	return ["1", "true", "yes", "sim", "on"].includes(String(value || "").toLowerCase());
}

async function getSession(request: Request, env: Env, sessionId: string): Promise<Response> {
	const data = await supabaseFetch(env, `inanna_sessions?session_id=eq.${encodeURIComponent(sessionId)}&select=*`, {
		method: "GET",
		headers: { prefer: "return=representation" },
	});
	const session = Array.isArray(data) ? data[0] || null : null;
	return json({ ok: true, session }, { status: 200 }, env, request);
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	if (request.method === "OPTIONS") {
		const headers = new Headers();
		applyCors(headers, env, request);
		return new Response(null, { status: 204, headers });
	}
	if (url.pathname === "/" || url.pathname === "/health") {
		return json({
			ok: true,
			service: "inanna-level2-agent",
			env: env.INANNA_ENV || "production",
			generationModel: env.GENERATION_MODEL || env.DEFAULT_GENERATION_MODEL || "sabia-4",
			judgeModel: env.DEFAULT_JUDGE_MODEL || FALLBACK_MODEL,
			maritacaConfigured: !!env.MARITACA_API_KEY,
			supabaseConfigured: !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
			level2RhymeBankEnabled: enabledByDefault(env.LEVEL2_RHYME_BANK_ENABLED, true),
			level2XiloPuzzleEnabled: enabledByDefault(env.LEVEL2_XILO_PUZZLE_ENABLED, true),
			blockchainEnabled: false,
			nftMintingEnabled: false,
			externalWalletEnabled: false,
		}, { status: 200 }, env, request);
	}
	if (request.method === "GET" && url.pathname.startsWith("/v2/player/") && url.pathname.endsWith("/profile")) {
		const playerId = url.pathname.replace(/^\/v2\/player\//, "").replace(/\/profile$/, "");
		return getPlayerProfile(request, env, decodeURIComponent(playerId));
	}
	if (request.method === "POST" && url.pathname === "/v2/session/start") return startSession(request, env);
	if (request.method === "GET" && url.pathname.startsWith("/v2/session/")) {
		return getSession(request, env, decodeURIComponent(url.pathname.replace("/v2/session/", "")));
	}
	if (request.method === "POST" && url.pathname === "/v2/round/generate") {
		return json({ ok: true, challenge: await generateChallenge(env) }, { status: 200 }, env, request);
	}
	if (request.method === "POST" && url.pathname === "/v2/round/respond") return respondRound(request, env);
	if (request.method === "POST" && url.pathname === "/v2/round/finalize") return finalizeRound(request, env);
	if (request.method === "POST" && url.pathname === "/v2/round/vote") return voteRound(request, env);
	return json({ ok: false, error: "not_found" }, { status: 404 }, env, request);
}

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		try {
			return await handleRequest(request, env as Env);
		} catch (error) {
			console.error(error);
			return json({
				ok: false,
				error: "internal_error",
				message: cleanText((error as Error)?.message || error, 180),
			}, { status: 500 }, env as Env, request);
		}
	},
} satisfies ExportedHandler<Env>;
