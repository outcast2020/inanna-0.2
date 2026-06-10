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
	rhymeScheme?: string;
	playerQuadra?: string;
	playerOriginalQuadra?: string;
	playerFinalQuadra?: string;
	inannaQuadra?: string;
	stolenWords?: string[];
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

const DEFAULT_ALLOWED_ORIGINS = [
	"https://inanna.cordel2pontozero.com",
	"https://inanna-five.vercel.app",
	"http://localhost:5173",
	"http://127.0.0.1:5173",
];

const THEMES = [
	"uma promessa feita na feira",
	"um segredo guardado no terreiro",
	"o susto de uma noite de chuva",
	"a coragem antes da viagem",
	"um conselho dado por uma avó",
	"a disputa entre orgulho e saudade",
	"uma lembrança que voltou cantando",
	"o riso depois de uma queda",
];

const SCHEMES = ["AABB", "ABAB", "ABCB"];
const FALLBACK_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const GENERATION_PROVIDER = "maritaca";
const MARITACA_CHAT_URL = "https://chat.maritaca.ai/api/chat/completions";

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

function normalizeWord(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9ç]/gi, "");
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
	if (rhymeTail(a, 3) && rhymeTail(a, 3) === rhymeTail(b, 3)) return 10;
	if (rhymeTail(a, 2) && rhymeTail(a, 2) === rhymeTail(b, 2)) return 8;
	if (rhymeTail(a, 1) && rhymeTail(a, 1) === rhymeTail(b, 1)) return 4;
	return 0;
}

function expectedPairs(scheme: string): Array<[number, number]> {
	const normalized = String(scheme || "AABB").toUpperCase();
	if (normalized === "ABAB") return [[0, 2], [1, 3]];
	if (normalized === "ABCB") return [[1, 3]];
	return [[0, 1], [2, 3]];
}

function clampScore(value: number, max: number): number {
	return Math.max(0, Math.min(max, Math.round(Number(value) || 0)));
}

function mechanicalScore(quadra: string, scheme: string, options: { isFinal?: boolean; inannaQuadra?: string } = {}): MechanicalScore {
	const lines = getLines(quadra);
	const finalWords = lines.slice(0, 4).map(getFinalWord);
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

async function runWorkersAi(env: Env, prompt: string, model?: string): Promise<string> {
	const selected = model || env.DEFAULT_JUDGE_MODEL || FALLBACK_MODEL;
	const result = await env.AI.run(selected, {
		messages: [
			{ role: "system", content: "Responda em português brasileiro. Se o usuário pedir JSON, retorne somente JSON válido." },
			{ role: "user", content: prompt },
		],
	});
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
					content: "Voce e Inanna no Cordel 2.0: uma rival poetica sedutora, provocadora, ludica e respeitosa. Escreva em portugues brasileiro simples, com gosto de oralidade popular, sem humilhar a pessoa jogadora.",
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

function buildInannaPrompt(input: {
	playerQuadra: string;
	theme: string;
	rhymeScheme: string;
	stolenWords: string[];
	roundNumber: number;
}): string {
	return `Gere a resposta da Inanna para uma peleja de quadras.

Tema do round: ${input.theme}
Esquema de rima obrigatório: ${input.rhymeScheme}
Round: ${input.roundNumber}
Palavras/imagens roubadas do jogador: ${input.stolenWords.join(", ") || "nenhuma"}

Quadra do jogador:
${input.playerQuadra}

Regras:
- Responda sempre em uma quadra com exatamente 4 versos.
- A quadra deve dialogar com a quadra do jogador e tentar superá-la.
- Use pelo menos 2 palavras/imagens roubadas quando existirem.
- A provocação deve ser poética, sedutora no jogo verbal, nunca sexual, ofensiva, humilhante ou agressiva.
- Preserve oralidade popular sem caricatura regional.
- Retorne somente JSON válido neste formato:
{
  "quadra": ["verso 1", "verso 2", "verso 3", "verso 4"],
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
	const prompt = buildInannaPrompt({
		playerQuadra,
		theme: cleanText(payload.theme, 120) || randomFrom(THEMES),
		rhymeScheme: cleanText(payload.rhymeScheme, 8) || "AABB",
		stolenWords,
		roundNumber: Number(payload.roundNumber || 1),
	});

	let provider = GENERATION_PROVIDER;
	let text = "";
	try {
		text = await generateWithMaritaca(env, prompt);
	} catch (error) {
		provider = "workers-ai-fallback";
		console.warn("Maritaca generation failed, falling back to Workers AI", String((error as Error)?.message || error));
		text = await runWorkersAi(env, prompt, env.DEFAULT_JUDGE_MODEL || FALLBACK_MODEL);
	}

	const parsed = extractJsonObject(text);
	const lines = normalizeQuadraLines(parsed?.quadra || parsed?.poem || parsed?.resposta || text);
	const safeLines = lines.length === 4 ? lines : buildFallbackInannaQuadra(playerQuadra, stolenWords, payload.rhymeScheme || "AABB");
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
	const wordB = stolen[1] || getFinalWord(getLines(playerQuadra)[1] || "") || "cancao";
	if (String(scheme).toUpperCase() === "ABAB") {
		return [
			`Roubei teu brilho de ${wordA}`,
			`e pus meu passo no chao`,
			`se tua voz pede ${wordA}`,
			`me vence no coracao`,
		];
	}
	if (String(scheme).toUpperCase() === "ABCB") {
		return [
			`Tua palavra me chamou`,
			`mas eu respondo no chao`,
			`se teu verso levantou`,
			`me enfrenta no coracao`,
		];
	}
	return [
		`Roubei do teu verso ${wordA}`,
		`pra ver tua voz em ${wordA}`,
		`se minha rima vira ${wordB}`,
		`me vence fazendo ${wordB}`,
	];
}

function buildJudgePrompt(input: {
	playerQuadra: string;
	inannaQuadra?: string;
	theme: string;
	rhymeScheme: string;
	isFinal: boolean;
}): string {
	return `Avalie uma quadra em português brasileiro para o jogo educacional Inanna.

Tema: ${input.theme}
Esquema esperado: ${input.rhymeScheme}
E final do jogador depois da provocação? ${input.isFinal ? "sim" : "nao"}

Quadra avaliada:
${input.playerQuadra}

Quadra da Inanna, quando houver:
${input.inannaQuadra || "(sem quadra da Inanna)"}

Use rubricas curtas e nao penalize oralidade popular, simplicidade expressiva ou marcas regionais. Penalize falta de sentido interno, copia passiva da Inanna e quebra de quadra.

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
  "feedback": "frase curta e formativa"
}`;
}

async function evaluateRubric(env: Env, input: {
	playerQuadra: string;
	inannaQuadra?: string;
	theme: string;
	rhymeScheme: string;
	isFinal: boolean;
}): Promise<AiRubric> {
	const prompt = buildJudgePrompt(input);
	try {
		const text = await runWorkersAi(env, prompt, env.DEFAULT_JUDGE_MODEL || FALLBACK_MODEL);
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
		feedback: "A avaliação automática usou rubricas locais porque o juiz de IA não respondeu a tempo.",
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
		feedback: cleanText(value.feedback || "Boa peleja: revise rima, imagem e resposta à provocação.", 220),
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

async function scoreQuadra(env: Env, input: {
	quadra: string;
	rhymeScheme: string;
	theme: string;
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

async function updateSessionScore(env: Env, sessionId: string, winner: string, roundNumber: number): Promise<void> {
	if (!sessionId) return;
	const current = await supabaseFetch(env, `inanna_sessions?session_id=eq.${encodeURIComponent(sessionId)}&select=player_wins,inanna_wins`, {
		method: "GET",
		headers: { prefer: "return=representation" },
	});
	const row = Array.isArray(current) ? current[0] as JsonRecord | undefined : undefined;
	const playerWins = Number(row?.player_wins || 0) + (winner === "player" ? 1 : 0);
	const inannaWins = Number(row?.inanna_wins || 0) + (winner === "inanna" ? 1 : 0);
	const finished = roundNumber >= 3 || playerWins >= 2 || inannaWins >= 2;
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

function generateChallenge(): JsonRecord {
	return {
		theme: randomFrom(THEMES),
		rhymeScheme: randomFrom(SCHEMES),
		seedImage: randomFrom(["fogueira", "estrada", "rio", "chapéu", "tambor", "janela", "feira"]),
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
	const theme = cleanText(payload.theme, 160) || randomFrom(THEMES);
	const rhymeScheme = cleanText(payload.rhymeScheme, 8) || randomFrom(SCHEMES);
	const [playerPrelim, inanna] = await Promise.all([
		scoreQuadra(env, { quadra: playerQuadra, rhymeScheme, theme }),
		generateInannaResponse(env, { ...payload, playerQuadra, theme, rhymeScheme }),
	]);
	const inannaScored = await scoreQuadra(env, {
		quadra: inanna.quadra,
		rhymeScheme,
		theme,
	});
	return json({
		ok: true,
		theme,
		rhymeScheme,
		playerPrelim,
		inanna,
		inannaScore: inannaScored.score,
		generationProvider: inanna.provider,
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
	const theme = cleanText(payload.theme, 160) || randomFrom(THEMES);
	const rhymeScheme = cleanText(payload.rhymeScheme, 8) || "AABB";
	const [playerFinal, inannaFinal] = await Promise.all([
		scoreQuadra(env, {
			quadra: playerFinalQuadra,
			rhymeScheme,
			theme,
			isFinal: true,
			inannaQuadra,
		}),
		scoreQuadra(env, {
			quadra: inannaQuadra,
			rhymeScheme,
			theme,
			isFinal: false,
		}),
	]);
	const roundWinner = decideWinner(playerFinal.score, inannaFinal.score);
	const result = {
		ok: true,
		roundWinner,
		playerScore: playerFinal.score,
		playerAiRubric: playerFinal.ai,
		inannaScore: inannaFinal.score,
		inannaAiRubric: inannaFinal.ai,
		playerScoreTotal: playerFinal.score.total,
		inannaScoreTotal: inannaFinal.score.total,
		feedback: buildRoundFeedback(roundWinner, playerFinal.score, inannaFinal.score, playerFinal.ai.feedback),
	};
	const savedRound = await saveRound(env, payload, result);
	await updateSessionScore(env, cleanText(payload.sessionId, 80), roundWinner, Number(payload.roundNumber || 1));
	return json({ ...result, roundId: savedRound?.round_id || null }, { status: 200 }, env, request);
}

function buildRoundFeedback(winner: string, player: MechanicalScore, inanna: MechanicalScore, feedback: string): string {
	const base = winner === "player"
		? "Você venceu o round: sua resposta segurou rima, voz e intenção."
		: winner === "inanna"
			? "Inanna levou o round: revise rima, coesão e resposta à provocação."
			: "Empate técnico: os versos ficaram próximos na peleja.";
	return `${base} ${feedback} Placar: humano ${player.total}, Inanna ${inanna.total}.`;
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
		}, { status: 200 }, env, request);
	}
	if (request.method === "POST" && url.pathname === "/v2/session/start") return startSession(request, env);
	if (request.method === "GET" && url.pathname.startsWith("/v2/session/")) {
		return getSession(request, env, decodeURIComponent(url.pathname.replace("/v2/session/", "")));
	}
	if (request.method === "POST" && url.pathname === "/v2/round/generate") {
		return json({ ok: true, challenge: generateChallenge() }, { status: 200 }, env, request);
	}
	if (request.method === "POST" && url.pathname === "/v2/round/respond") return respondRound(request, env);
	if (request.method === "POST" && url.pathname === "/v2/round/finalize") return finalizeRound(request, env);
	if (request.method === "POST" && url.pathname === "/v2/round/vote") return voteRound(request, env);
	return json({ ok: false, error: "not_found" }, { status: 404 }, env, request);
}

export default {
	async fetch(request, env): Promise<Response> {
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
