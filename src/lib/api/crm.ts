/**
 * CRM Connections API layer
 */
import { supabase } from "@/integrations/supabase/client";

export type CrmProvider = "hubspot" | "salesforce" | "pipedrive" | "zoho";

export interface CrmConnection {
  id: string;
  user_id: string;
  provider: CrmProvider;
  api_key: string;
  instance_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CRM_PROVIDERS: Record<CrmProvider, { name: string; description: string; requiresInstanceUrl: boolean; apiKeyLabel: string; apiKeyHelp: string }> = {
  hubspot: {
    name: "HubSpot",
    description: "Inbound marketing, sales, and CRM platform",
    requiresInstanceUrl: false,
    apiKeyLabel: "Private App Access Token",
    apiKeyHelp: "Go to HubSpot → Settings → Integrations → Private Apps → Create/select app → copy the access token.",
  },
  salesforce: {
    name: "Salesforce",
    description: "Enterprise CRM for sales and service teams",
    requiresInstanceUrl: true,
    apiKeyLabel: "Access Token",
    apiKeyHelp: "Use your Salesforce connected app OAuth token. Instance URL example: https://yourorg.my.salesforce.com",
  },
  pipedrive: {
    name: "Pipedrive",
    description: "Sales-focused CRM for small and medium teams",
    requiresInstanceUrl: false,
    apiKeyLabel: "API Token",
    apiKeyHelp: "Go to Pipedrive → Settings → Personal Preferences → API → copy your API token.",
  },
  zoho: {
    name: "Zoho CRM",
    description: "Affordable CRM with broad feature set",
    requiresInstanceUrl: true,
    apiKeyLabel: "Access Token",
    apiKeyHelp: "Generate via Zoho API Console. Instance URL example: https://www.zohoapis.com",
  },
};

// ─── CRUD ────────────────────────────────────────────────────────────

export async function getCrmConnections(): Promise<CrmConnection[]> {
  const { data, error } = await supabase
    .from("crm_connections")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as unknown as CrmConnection[];
}

export async function upsertCrmConnection(
  provider: CrmProvider,
  apiKey: string,
  instanceUrl?: string
): Promise<CrmConnection> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("crm_connections")
    .upsert(
      {
        user_id: user.id,
        provider,
        api_key: apiKey,
        instance_url: instanceUrl || null,
        is_active: true,
      },
      { onConflict: "user_id,provider" }
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as CrmConnection;
}

export async function deleteCrmConnection(id: string): Promise<void> {
  const { error } = await supabase
    .from("crm_connections")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Export to CRM ───────────────────────────────────────────────────

export interface ExportLeadPayload {
  provider: CrmProvider;
  leads: Array<{
    email?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    company?: string;
    role?: string;
    website?: string;
    phone?: string;
  }>;
}

export async function exportToCrm(payload: ExportLeadPayload): Promise<{ success: boolean; exported: number; errors: string[] }> {
  const { data, error } = await supabase.functions.invoke("export-to-crm", {
    body: payload,
  });

  if (error) throw new Error(error.message);
  return data;
}
