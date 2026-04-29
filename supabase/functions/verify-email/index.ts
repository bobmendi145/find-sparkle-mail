import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface VerifyResult {
  email: string;
  status: string;
  sub_status: string | null;
  is_valid: boolean;
  cached: boolean;
  raw?: any;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ZB_KEY = Deno.env.get("ZEROBOUNCE_API_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization" }, 401);
    }

    // Validate user via JWT
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const emails: string[] = Array.isArray(body.emails)
      ? body.emails.filter((e: any) => typeof e === "string" && e.includes("@")).slice(0, 50)
      : [];
    const force = !!body.force;

    if (emails.length === 0) {
      return json({ error: "No valid emails provided" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const results: VerifyResult[] = [];

    for (const rawEmail of emails) {
      const email = rawEmail.toLowerCase().trim();

      // 1. Check cache (unless force re-verify)
      if (!force) {
        const { data: cached } = await admin
          .from("email_verifications")
          .select("status, sub_status, is_valid, raw_response")
          .eq("user_id", user.id)
          .eq("email", email)
          .maybeSingle();
        if (cached) {
          results.push({
            email,
            status: cached.status,
            sub_status: cached.sub_status,
            is_valid: cached.is_valid,
            cached: true,
          });
          continue;
        }
      }

      // 2. Consume quota
      const { data: quota, error: qErr } = await admin.rpc("consume_usage", {
        _user_id: user.id,
        _event_type: "email_verification",
        _metadata: { email },
      });
      if (qErr) {
        return json({ error: "Quota check failed", details: qErr.message }, 500);
      }
      const allowed = quota?.[0]?.allowed;
      if (!allowed) {
        return json({
          error: "quota_exceeded",
          reason: quota?.[0]?.reason,
          partial: results,
        }, 429);
      }

      // 3. Call ZeroBounce (or mark unconfigured)
      if (!ZB_KEY) {
        const fallback = {
          email,
          status: "unknown",
          sub_status: "provider_not_configured",
          is_valid: false,
          cached: false,
        };
        await admin.from("email_verifications").upsert({
          user_id: user.id,
          email,
          status: fallback.status,
          sub_status: fallback.sub_status,
          is_valid: false,
          raw_response: { note: "ZEROBOUNCE_API_KEY not set" },
          verified_at: new Date().toISOString(),
        }, { onConflict: "user_id,email" });
        results.push(fallback);
        continue;
      }

      try {
        const url = `https://api.zerobounce.net/v2/validate?api_key=${encodeURIComponent(ZB_KEY)}&email=${encodeURIComponent(email)}`;
        const resp = await fetch(url);
        const data = await resp.json();
        const status = data.status || "unknown";
        const sub = data.sub_status || null;
        const isValid = status === "valid";

        await admin.from("email_verifications").upsert({
          user_id: user.id,
          email,
          status,
          sub_status: sub,
          is_valid: isValid,
          raw_response: data,
          verified_at: new Date().toISOString(),
        }, { onConflict: "user_id,email" });

        results.push({ email, status, sub_status: sub, is_valid: isValid, cached: false });
      } catch (err) {
        console.error("ZeroBounce error", err);
        results.push({ email, status: "error", sub_status: "provider_error", is_valid: false, cached: false });
      }
    }

    return json({ results });
  } catch (err) {
    console.error(err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
