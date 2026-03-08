import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// AWS Signature V4 helpers
function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key instanceof ArrayBuffer ? key : key.buffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
}

async function sha256(message: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message));
  return toHex(hash);
}

async function getSignatureKey(key: string, dateStamp: string, region: string, service: string): Promise<ArrayBuffer> {
  const kDate = await hmacSha256(new TextEncoder().encode("AWS4" + key), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

function getAmzDate(): { amzDate: string; dateStamp: string } {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  return { amzDate, dateStamp };
}

async function signedRequest(
  method: string,
  url: string,
  body: string,
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  service: string
): Promise<Response> {
  const { amzDate, dateStamp } = getAmzDate();
  const parsedUrl = new URL(url);
  const host = parsedUrl.hostname;
  const path = parsedUrl.pathname;

  const payloadHash = await sha256(body);

  const canonicalHeaders = `content-type:application/x-www-form-urlencoded\nhost:${host}\nx-amz-date:${amzDate}\n`;
  const signedHeadersList = "content-type;host;x-amz-date";

  const canonicalRequest = [method, path, "", canonicalHeaders, signedHeadersList, payloadHash].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256(canonicalRequest)].join("\n");

  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signatureBuffer = await hmacSha256(signingKey, stringToSign);
  const signature = toHex(signatureBuffer);

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeadersList}, Signature=${signature}`;

  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Amz-Date": amzDate,
      Authorization: authHeader,
    },
    body,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { to, subject, body_html } = await req.json();
    if (!to?.length || !subject || !body_html) {
      throw new Error("Missing required fields: to, subject, body_html");
    }

    // Get user's SES credentials
    const { data: conn, error: connError } = await supabase
      .from("email_provider_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "aws_ses")
      .eq("is_active", true)
      .single();

    if (connError || !conn) {
      throw new Error("No AWS SES connection found. Please configure it in Integrations.");
    }

    const { access_key_id, secret_access_key, region, sender_email } = conn;
    const endpoint = `https://email.${region}.amazonaws.com/`;

    const errors: string[] = [];
    let sent = 0;

    // Send to each recipient individually (SES best practice for lead outreach)
    for (const recipient of to) {
      try {
        const params = new URLSearchParams({
          Action: "SendEmail",
          "Source": sender_email,
          "Destination.ToAddresses.member.1": recipient,
          "Message.Subject.Data": subject,
          "Message.Subject.Charset": "UTF-8",
          "Message.Body.Html.Data": body_html,
          "Message.Body.Html.Charset": "UTF-8",
          Version: "2010-12-01",
        });

        const res = await signedRequest(
          "POST",
          endpoint,
          params.toString(),
          access_key_id,
          secret_access_key,
          region,
          "ses"
        );

        if (!res.ok) {
          const text = await res.text();
          console.error(`SES error for ${recipient}:`, text);
          errors.push(`${recipient}: ${res.status}`);
        } else {
          sent++;
        }
      } catch (e: any) {
        errors.push(`${recipient}: ${e.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: errors.length === 0, sent, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("send-ses-email error:", e);
    return new Response(
      JSON.stringify({ success: false, sent: 0, errors: [e.message] }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
