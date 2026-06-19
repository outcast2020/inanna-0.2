import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

const mockEnv = {
	INANNA_ENV: "test",
	ALLOWED_ORIGINS: ["http://localhost:5173"],
	SUPABASE_URL: "",
	GENERATION_MODEL: "sabia-4",
	DEFAULT_GENERATION_MODEL: "sabia-4",
	DEFAULT_JUDGE_MODEL: "@cf/meta/llama-3.1-8b-instruct",
	ROUND_COUNT: 3,
	MAX_QUADRA_CHARS: 900,
	LEVEL2_THEMES_CSV_URL: "data:text/csv,o_que_acontenceu,tematica,fonte%0AContexto%20do%20juiz,tema%20do%20juiz,fonte%20do%20juiz",
	AI: {
		async run() {
			return {
				response: JSON.stringify({
					coherence: 12,
					creativity: 12,
					verisimilitude: 12,
					response: 10,
					autonomy: 12,
					flags: {
						hasInternalSense: true,
						hasPoeticImage: true,
						answersProvocation: true,
						avoidsCopyingInanna: true,
						languageIsUnderstandable: true,
						keepsHumanVoice: true,
					},
					feedback: "A quadra tem sentido e sustenta a resposta.",
				}),
			};
		},
	},
};

describe("Inanna Level 2 worker", () => {
	it("responds to health checks", async () => {
		const request = new IncomingRequest("http://example.com/health", {
			headers: { origin: "http://localhost:5173" },
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv, ctx);
		await waitOnExecutionContext(ctx);
		const body = await response.json() as { ok: boolean; service: string };
		expect(response.status).toBe(200);
		expect(body.ok).toBe(true);
		expect(body.service).toBe("inanna-level2-agent");
		expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
	});

	it("starts an ephemeral session without Supabase", async () => {
		const request = new IncomingRequest("http://example.com/v2/session/start", {
			method: "POST",
			body: JSON.stringify({ playerId: "player-1", nickname: "Celeste" }),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv, ctx);
		await waitOnExecutionContext(ctx);
		const body = await response.json() as { ok: boolean; session: { source: string; roundCount: number } };
		expect(response.status).toBe(201);
		expect(body.ok).toBe(true);
		expect(body.session.source).toBe("ephemeral");
		expect(body.session.roundCount).toBe(3);
	});

	it("generates a challenge", async () => {
		const request = new IncomingRequest("http://example.com/v2/round/generate", { method: "POST" });
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv, ctx);
		await waitOnExecutionContext(ctx);
		const body = await response.json() as {
			ok: boolean;
			challenge: { theme: string; context: string; source: string; thematicSource: string; rhymeScheme: string };
		};
		expect(response.status).toBe(200);
		expect(body.ok).toBe(true);
		expect(body.challenge.theme).toBe("tema do juiz");
		expect(body.challenge.context).toBe("Contexto do juiz");
		expect(body.challenge.source).toBe("fonte do juiz");
		expect(body.challenge.thematicSource).toBe("worker_csv");
		expect(["AABB", "ABAB", "ABCB", "ABBA"]).toContain(body.challenge.rhymeScheme);
	});

	it("returns an empty player profile without Supabase", async () => {
		const request = new IncomingRequest("http://example.com/v2/player/player-1/profile", {
			method: "GET",
			headers: { "x-inanna-player-id": "player-1" },
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv, ctx);
		await waitOnExecutionContext(ctx);
		const body = await response.json() as { ok: boolean; source: string; rounds: unknown[] };
		expect(response.status).toBe(200);
		expect(body.ok).toBe(true);
		expect(body.source).toBe("ephemeral");
		expect(body.rounds).toEqual([]);
	});

	it("blocks obvious personal data before AI processing", async () => {
		const request = new IncomingRequest("http://example.com/v2/round/respond", {
			method: "POST",
			body: JSON.stringify({
				playerId: "player-1",
				sessionId: "session-1",
				playerQuadra: "Meu email e jovem@example.com\nna rua vou cantar\nretiro esse dado agora\npra peleja continuar",
			}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv, ctx);
		await waitOnExecutionContext(ctx);
		const body = await response.json() as { ok: boolean; error: string; privacy: { piiDetected: boolean } };
		expect(response.status).toBe(400);
		expect(body.ok).toBe(false);
		expect(body.error).toBe("privacy_pii_detected");
		expect(body.privacy.piiDetected).toBe(true);
	});

	it("treats phonetic rhyme families as repeated within the current peleja session", async () => {
		const request = new IncomingRequest("http://example.com/v2/round/finalize", {
			method: "POST",
			body: JSON.stringify({
				playerId: "player-1",
				sessionId: "session-1",
				roundNumber: 1,
				theme: "paz na quebrada sem calar a voz",
				rhymeScheme: "AABB",
				playerOriginalQuadra: "Eu planto sonho pela paz\nna praça volto a cantar\nminha voz corre atrás\ndo direito de sonhar",
				playerFinalQuadra: "Eu planto sonho pela paz\nna praça volto a cantar\nminha voz corre atrás\ndo direito de sonhar",
				inannaQuadra: "Tua palavra pede chao\neu respondo no terreiro\nse quiser ganhar sertao\ncuida mais do verso inteiro",
			}),
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, mockEnv, ctx);
		await waitOnExecutionContext(ctx);
		const body = await response.json() as {
			ok: boolean;
			rhymeOriginality: { rhymeFamilyRepeatCount: number; repeatedRhymeKeys: string[] };
		};
		expect(response.status).toBe(200);
		expect(body.ok).toBe(true);
		expect(body.rhymeOriginality.rhymeFamilyRepeatCount).toBeGreaterThan(0);
		expect(body.rhymeOriginality.repeatedRhymeKeys).toContain("as");
	});
});
