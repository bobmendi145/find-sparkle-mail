import { supabase } from "@/integrations/supabase/client";

export interface ScheduledEmail {
  id: string;
  user_id: string;
  recipients: string[];
  subject: string;
  body_html: string;
  send_at: string;
  status: string;
  sent_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export async function getScheduledEmails(): Promise<ScheduledEmail[]> {
  const { data, error } = await supabase
    .from("scheduled_emails")
    .select("*")
    .order("send_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ScheduledEmail[];
}

export async function createScheduledEmail(
  recipients: string[],
  subject: string,
  bodyHtml: string,
  sendAt: string
): Promise<ScheduledEmail> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("scheduled_emails")
    .insert({
      user_id: user.id,
      recipients,
      subject,
      body_html: bodyHtml,
      send_at: sendAt,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as ScheduledEmail;
}

export async function cancelScheduledEmail(id: string): Promise<void> {
  const { error } = await supabase
    .from("scheduled_emails")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
