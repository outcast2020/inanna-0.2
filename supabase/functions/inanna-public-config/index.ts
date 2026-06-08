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

  const body = `window.INANNA_APP_CONFIG = {
  ...(window.INANNA_APP_CONFIG || {}),
  supabaseUrl: ${jsString(supabaseUrl)},
  supabaseAnonKey: ${jsString(supabaseAnonKey)},
  level: "1",
  aiEnabled: "false",
  socialEmailEnabled: "false"
};`;

  return new Response(body, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
      "Content-Type": "application/javascript; charset=utf-8",
    },
  });
});
