import { supabase } from "@/integrations/supabase/client";

export interface VerifyResult {
  email: string;
  status: string;
  sub_status: string | null;
  is_valid: boolean;
  cached: boolean;
}

export async function verifyEmails(emails: string[], force = false): Promise<VerifyResult[]> {
  if (!emails.length) return [];
  const { data, error } = await supabase.functions.invoke("verify-email", {
    body: { emails, force },
  });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return ((data as any)?.results || []) as VerifyResult[];
}

export async function getCachedVerifications(emails: string[]) {
  if (!emails.length) return {};
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
  const { data } = await (supabase as any)
    .from("email_verifications")
    .select("email, status, sub_status, is_valid")
    .eq("user_id", user.id)
    .in("email", emails);
  const map: Record<string, VerifyResult> = {};
  (data || []).forEach((r: any) => {
    map[r.email] = { ...r, cached: true };
  });
  return map;
}
