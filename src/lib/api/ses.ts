/**
 * AWS SES Email Sending API layer
 */
import { supabase } from "@/integrations/supabase/client";

export interface SesConnection {
  id: string;
  user_id: string;
  provider: string;
  access_key_id: string;
  secret_access_key: string;
  region: string;
  sender_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const SES_REGIONS = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-central-1",
  "ap-south-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ca-central-1",
  "sa-east-1",
  "me-south-1",
  "af-south-1",
] as const;

// ─── CRUD ────────────────────────────────────────────────────────────

export async function getSesConnection(): Promise<SesConnection | null> {
  const { data, error } = await supabase
    .from("email_provider_connections")
    .select("*")
    .eq("provider", "aws_ses")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as unknown as SesConnection | null;
}

export async function upsertSesConnection(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  senderEmail: string
): Promise<SesConnection> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Try update first, then insert
  const existing = await getSesConnection();

  if (existing) {
    const { data, error } = await supabase
      .from("email_provider_connections")
      .update({
        access_key_id: accessKeyId,
        secret_access_key: secretAccessKey,
        region,
        sender_email: senderEmail,
        is_active: true,
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as unknown as SesConnection;
  }

  const { data, error } = await supabase
    .from("email_provider_connections")
    .insert({
      user_id: user.id,
      provider: "aws_ses",
      access_key_id: accessKeyId,
      secret_access_key: secretAccessKey,
      region,
      sender_email: senderEmail,
      is_active: true,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as SesConnection;
}

export async function deleteSesConnection(id: string): Promise<void> {
  const { error } = await supabase
    .from("email_provider_connections")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ─── Send Email ──────────────────────────────────────────────────────

export interface SendEmailPayload {
  to: string[];
  subject: string;
  body_html: string;
}

export async function sendSesEmail(payload: SendEmailPayload): Promise<{ success: boolean; sent: number; errors: string[] }> {
  const { data, error } = await supabase.functions.invoke("send-ses-email", {
    body: payload,
  });
  if (error) throw new Error(error.message);
  return data;
}
