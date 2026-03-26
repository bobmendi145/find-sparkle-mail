/**
 * Fonatica API layer — all Supabase interactions for the lead generation features.
 */
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────
export interface BusinessSearchInput {
  industry: string;
  location: string;
  max_results: number;
}

export interface PeopleSearchInput {
  role: string;
  company?: string;
  country?: string;
  max_profiles: number;
}

export interface SearchJob {
  id: string;
  type: "business" | "people";
  input_json: Record<string, any>;
  status: "pending" | "running" | "completed" | "failed";
  error_message: string | null;
  results_count: number;
  created_at: string;
  completed_at: string | null;
}

export interface BusinessLead {
  id: string;
  job_id: string;
  name: string;
  industry: string | null;
  location: string | null;
  website: string | null;
  emails: string[];
  source: string | null;
  raw_data: Record<string, any>;
  created_at: string;
}

export interface PeopleLead {
  id: string;
  job_id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  company: string | null;
  country: string | null;
  domain: string | null;
  primary_email: string | null;
  generated_emails: string[];
  source_query: string | null;
  source_url: string | null;
  raw_data: Record<string, any>;
  created_at: string;
}

// ─── Job Creation & Triggering ───────────────────────────────────────

export async function createBusinessSearchJob(input: BusinessSearchInput): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("search_jobs")
    .insert({
      user_id: user.id,
      type: "business" as const,
      input_json: input as any,
      status: "pending" as const,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Fire and forget — trigger the edge function
  supabase.functions.invoke("process-search-job", {
    body: { job_id: data.id },
  }).catch(console.error);

  return data.id;
}

export async function createPeopleSearchJob(input: PeopleSearchInput): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("search_jobs")
    .insert({
      user_id: user.id,
      type: "people" as const,
      input_json: input as any,
      status: "pending" as const,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  supabase.functions.invoke("process-search-job", {
    body: { job_id: data.id },
  }).catch(console.error);

  return data.id;
}

// ─── Job Queries ─────────────────────────────────────────────────────

export async function getJob(jobId: string): Promise<SearchJob | null> {
  const { data, error } = await supabase
    .from("search_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) return null;
  return data as unknown as SearchJob;
}

export async function getJobs(type?: "business" | "people"): Promise<SearchJob[]> {
  let query = supabase
    .from("search_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as unknown as SearchJob[];
}

// ─── Results Queries ─────────────────────────────────────────────────

export async function getBusinessLeads(
  jobId?: string,
  filters?: { industry?: string; location?: string }
): Promise<BusinessLead[]> {
  let query = supabase
    .from("business_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (jobId) query = query.eq("job_id", jobId);
  if (filters?.industry) query = query.ilike("industry", `%${filters.industry}%`);
  if (filters?.location) query = query.ilike("location", `%${filters.location}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as unknown as BusinessLead[];
}

export async function getPeopleLeads(jobId?: string): Promise<PeopleLead[]> {
  let query = supabase
    .from("people_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (jobId) query = query.eq("job_id", jobId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as unknown as PeopleLead[];
}

// ─── Realtime subscription for job status ────────────────────────────

export function subscribeToJob(
  jobId: string,
  callback: (job: SearchJob) => void
) {
  const channel = supabase
    .channel(`job-${jobId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "search_jobs",
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        callback(payload.new as unknown as SearchJob);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
