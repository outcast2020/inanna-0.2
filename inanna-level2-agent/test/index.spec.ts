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
		const body = await response.json() as { ok: boolean; challenge: { theme: string; rhymeScheme: string } };
		expect(response.status).toBe(200);
		expect(body.ok).toBe(true);
		expect(body.challenge.theme).toBeTruthy();
		expect(["AABB", "ABAB", "ABCB"]).toContain(body.challenge.rhymeScheme);
	});
});
