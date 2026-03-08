import { supabase } from "@/integrations/supabase/client";

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body_text: string;
  created_at: string;
  updated_at: string;
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as EmailTemplate[];
}

export async function createEmailTemplate(
  name: string,
  subject: string,
  bodyText: string
): Promise<EmailTemplate> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("email_templates")
    .insert({ user_id: user.id, name, subject, body_text: bodyText })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as EmailTemplate;
}

export async function updateEmailTemplate(
  id: string,
  name: string,
  subject: string,
  bodyText: string
): Promise<EmailTemplate> {
  const { data, error } = await supabase
    .from("email_templates")
    .update({ name, subject, body_text: bodyText })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as EmailTemplate;
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from("email_templates")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
