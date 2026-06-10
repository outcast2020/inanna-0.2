const FALLBACK_SUPABASE_URL = "https://ifhagjcarefdkcmjvknf.supabase.co";

function jsString(value: string) {
  return JSON.stringify(value || "");
}

Deno.serve((request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || FALLBACK_SUPABASE_URL;
  const supabaseAnonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ||
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ||
    "";
  const level = Deno.env.get("INANNA_LEVEL") || "1";
  const aiEnabled = Deno.env.get("INANNA_AI_ENABLED") || "false";
  const level2Enabled = Deno.env.get("INANNA_LEVEL2_ENABLED") || "false";
  const level2AgentUrl = Deno.env.get("INANNA_LEVEL2_AGENT_URL") || "";
  const level2RequireUnlock = Deno.env.get("INANNA_LEVEL2_REQUIRE_UNLOCK") || "true";
  const level2DictationEnabled = Deno.env.get("INANNA_LEVEL2_DICTATION_ENABLED") || "false";
  const level2AudioEnabled = Deno.env.get("INANNA_LEVEL2_AUDIO_ENABLED") || "false";
  const level2SocialEnabled = Deno.env.get("INANNA_LEVEL2_SOCIAL_ENABLED") || "false";

  const body = `{
  const existingConfig = window.INANNA_APP_CONFIG || {};
  const keep = (key, fallback) => {
    const value = existingConfig[key];
    const text = String(value || "").trim();
    return !text || /^%VITE_[A-Z0-9_]+%$/.test(text) ? fallback : value;
  };
  window.INANNA_APP_CONFIG = {
    ...existingConfig,
    supabaseUrl: keep("supabaseUrl", ${jsString(supabaseUrl)}),
    supabaseAnonKey: keep("supabaseAnonKey", ${jsString(supabaseAnonKey)}),
    level: keep("level", ${jsString(level)}),
    aiEnabled: keep("aiEnabled", ${jsString(aiEnabled)}),
    level2Enabled: keep("level2Enabled", ${jsString(level2Enabled)}),
    level2AgentUrl: keep("level2AgentUrl", ${jsString(level2AgentUrl)}),
    level2RequireUnlock: keep("level2RequireUnlock", ${jsString(level2RequireUnlock)}),
    level2DictationEnabled: keep("level2DictationEnabled", ${jsString(level2DictationEnabled)}),
    level2AudioEnabled: keep("level2AudioEnabled", ${jsString(level2AudioEnabled)}),
    level2SocialEnabled: keep("level2SocialEnabled", ${jsString(level2SocialEnabled)}),
    socialEmailEnabled: keep("socialEmailEnabled", "false")
  };
}`;

  return new Response(body, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
      "Content-Type": "application/javascript; charset=utf-8",
    },
  });
});
