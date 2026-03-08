import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { provider, leads } = await req.json();
    if (!provider || !leads?.length) throw new Error("Missing provider or leads");

    // Get user's CRM connection
    const { data: conn, error: connError } = await supabase
      .from("crm_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .eq("is_active", true)
      .single();

    if (connError || !conn) throw new Error("No active connection for " + provider);

    const results = { exported: 0, errors: [] as string[] };

    for (const lead of leads) {
      try {
        await pushLeadToCrm(provider, conn.api_key, conn.instance_url, lead);
        results.exported++;
      } catch (e: any) {
        results.errors.push(`${lead.email || lead.full_name}: ${e.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: results.errors.length === 0, ...results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─── CRM-specific push logic ─────────────────────────────────────────

async function pushLeadToCrm(
  provider: string,
  apiKey: string,
  instanceUrl: string | null,
  lead: Record<string, any>
) {
  switch (provider) {
    case "hubspot":
      return pushToHubSpot(apiKey, lead);
    case "salesforce":
      return pushToSalesforce(apiKey, instanceUrl!, lead);
    case "pipedrive":
      return pushToPipedrive(apiKey, lead);
    case "zoho":
      return pushToZoho(apiKey, instanceUrl!, lead);
    default:
      throw new Error("Unsupported provider: " + provider);
  }
}

async function pushToHubSpot(token: string, lead: Record<string, any>) {
  const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        email: lead.email || "",
        firstname: lead.first_name || "",
        lastname: lead.last_name || "",
        company: lead.company || "",
        jobtitle: lead.role || "",
        website: lead.website || "",
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HubSpot ${res.status}: ${body}`);
  }
}

async function pushToSalesforce(token: string, instanceUrl: string, lead: Record<string, any>) {
  const res = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/Lead`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Email: lead.email || "",
      FirstName: lead.first_name || "",
      LastName: lead.last_name || lead.full_name || "Unknown",
      Company: lead.company || "Unknown",
      Title: lead.role || "",
      Website: lead.website || "",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Salesforce ${res.status}: ${body}`);
  }
}

async function pushToPipedrive(token: string, lead: Record<string, any>) {
  const res = await fetch(`https://api.pipedrive.com/v1/persons?api_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: lead.full_name || `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "Unknown",
      email: lead.email ? [{ value: lead.email, primary: true }] : [],
      org_id: null,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pipedrive ${res.status}: ${body}`);
  }
}

async function pushToZoho(token: string, instanceUrl: string, lead: Record<string, any>) {
  const res = await fetch(`${instanceUrl}/crm/v5/Leads`, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [
        {
          Email: lead.email || "",
          First_Name: lead.first_name || "",
          Last_Name: lead.last_name || lead.full_name || "Unknown",
          Company: lead.company || "Unknown",
          Designation: lead.role || "",
          Website: lead.website || "",
        },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Zoho ${res.status}: ${body}`);
  }
}
