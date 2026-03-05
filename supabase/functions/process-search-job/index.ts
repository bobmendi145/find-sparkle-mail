/**
 * Edge Function: process-search-job
 * 
 * Processes a search job (business or people) asynchronously.
 * Uses pluggable provider interfaces so real scraping/search
 * can be swapped in later (n8n webhooks, Apify, etc.).
 * 
 * Called with: { job_id: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Provider Interfaces ─────────────────────────────────────────────
// TODO: Replace stub implementations with real providers (n8n webhooks,
// HTTP scrapers, search APIs) by swapping the functions below.

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

interface Business {
  name: string;
  industry: string;
  location: string;
  website: string;
}

// ─── STUB: Business Search Provider ──────────────────────────────────
// TODO: Replace with real Google Maps API, n8n webhook, or scraper.
// Input: { industry: string, location: string, max_results: number }
// Output: Business[]
function stubBusinessSearch(
  industry: string,
  location: string,
  maxResults: number
): Business[] {
  const businessNames = [
    "Alpha Solutions", "Beta Corp", "Gamma Industries", "Delta Services",
    "Epsilon Tech", "Zeta Group", "Theta Labs", "Iota Partners",
    "Kappa Consulting", "Lambda Digital", "Mu Analytics", "Nu Systems",
    "Xi Ventures", "Omicron Works", "Pi Dynamics", "Rho Engineering",
    "Sigma Finance", "Tau Medical", "Upsilon Energy", "Phi Design",
  ];

  const tlds = [".com", ".io", ".co", ".net", ".org"];
  const count = Math.min(maxResults, businessNames.length);
  const results: Business[] = [];

  for (let i = 0; i < count; i++) {
    const name = businessNames[i];
    const slug = name.toLowerCase().replace(/\s+/g, "");
    const tld = tlds[i % tlds.length];
    results.push({
      name,
      industry,
      location,
      website: `https://${slug}${tld}`,
    });
  }
  return results;
}

// ─── STUB: Website Email Scraper ─────────────────────────────────────
// TODO: Replace with real HTTP scraper (Apify, BrightData, custom).
// Input: website URL
// Output: string[] of emails found on /contact, /about, /team, /impressum pages
function stubScrapeEmails(website: string): string[] {
  const domain = website.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const names = ["info", "contact", "hello", "support", "admin", "sales"];
  const count = 1 + Math.floor(Math.random() * 3);
  const emails: string[] = [];
  for (let i = 0; i < count; i++) {
    emails.push(`${names[i % names.length]}@${domain}`);
  }
  return emails;
}

// ─── STUB: People Search Provider ────────────────────────────────────
// TODO: Replace with real search API call (SerpAPI, n8n webhook, etc.).
// Input: query string (Google-style)
// Output: SearchResult[]
function stubPeopleSearch(query: string, maxProfiles: number): SearchResult[] {
  const mockPeople = [
    { first: "Alice", last: "Chen", title: "VP Engineering", company: "TechCorp" },
    { first: "Bob", last: "Kumar", title: "CTO", company: "DataFlow" },
    { first: "Carol", last: "Smith", title: "Director of Sales", company: "SalesForce" },
    { first: "Dave", last: "Johnson", title: "CEO", company: "StartupXYZ" },
    { first: "Eve", last: "Williams", title: "Head of Marketing", company: "GrowthCo" },
    { first: "Frank", last: "Garcia", title: "VP Product", company: "ProductLabs" },
    { first: "Grace", last: "Lee", title: "Engineering Manager", company: "CodeBase" },
    { first: "Hank", last: "Brown", title: "Sales Director", company: "DealMaker" },
    { first: "Ivy", last: "Taylor", title: "CMO", company: "BrandWorks" },
    { first: "Jack", last: "Wilson", title: "CFO", company: "FinanceHub" },
    { first: "Kate", last: "Martinez", title: "COO", company: "OpsFlow" },
    { first: "Leo", last: "Anderson", title: "VP HR", company: "PeopleCo" },
    { first: "Mia", last: "Thomas", title: "Data Scientist", company: "AILabs" },
    { first: "Nick", last: "Jackson", title: "DevOps Lead", company: "CloudOps" },
    { first: "Olivia", last: "White", title: "UX Director", company: "DesignCo" },
  ];

  const count = Math.min(maxProfiles, mockPeople.length);
  return mockPeople.slice(0, count).map((p) => ({
    title: `${p.first} ${p.last} – ${p.title} | ${p.company} | LinkedIn`,
    snippet: `${p.first} ${p.last} is a ${p.title} at ${p.company}. Experienced professional with strong background.`,
    url: `https://linkedin.com/in/${p.first.toLowerCase()}-${p.last.toLowerCase()}-${Math.floor(Math.random() * 900 + 100)}`,
  }));
}

// ─── STUB: Domain Resolver ───────────────────────────────────────────
// TODO: Replace with Clearbit, Google search, or custom domain lookup.
// Input: company name
// Output: domain string
function stubGetDomain(company: string): string {
  const knownDomains: Record<string, string> = {
    techcorp: "techcorp.com",
    dataflow: "dataflow.io",
    salesforce: "salesforce.com",
    startupxyz: "startupxyz.com",
    growthco: "growthco.io",
    productlabs: "productlabs.com",
    codebase: "codebase.dev",
    dealmaker: "dealmaker.com",
    brandworks: "brandworks.io",
    financehub: "financehub.com",
    opsflow: "opsflow.co",
    peopleco: "peopleco.com",
    ailabs: "ailabs.io",
    cloudops: "cloudops.dev",
    designco: "designco.com",
  };
  const key = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return knownDomains[key] || `${key}.com`;
}

// ─── Name Parsing ────────────────────────────────────────────────────
function parseSearchResult(result: SearchResult) {
  // Title format: "First Last – Title | Company | LinkedIn"
  const titleParts = result.title.split(/\s*[–\-|]\s*/);
  const fullName = (titleParts[0] || "").trim();
  const role = (titleParts[1] || "").trim();
  const company = (titleParts[2] || "").trim();

  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return { fullName, firstName, lastName, role, company };
}

// ─── Email Generation ────────────────────────────────────────────────
type EmailPattern = "FIRST_LAST" | "FIRST" | "F_LAST" | "FIRSTL" | "LAST";

function generateEmails(
  firstName: string,
  lastName: string,
  domain: string
): { pattern: EmailPattern; email: string }[] {
  const f = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const l = lastName.toLowerCase().replace(/[^a-z]/g, "");
  if (!f || !l || !domain) return [];
  return [
    { pattern: "FIRST_LAST", email: `${f}.${l}@${domain}` },
    { pattern: "FIRST", email: `${f}@${domain}` },
    { pattern: "F_LAST", email: `${f[0]}.${l}@${domain}` },
    { pattern: "FIRSTL", email: `${f}${l[0]}@${domain}` },
    { pattern: "LAST", email: `${l}@${domain}` },
  ];
}

function selectPrimaryEmail(
  emails: { pattern: EmailPattern; email: string }[],
  knownPattern?: EmailPattern
): string {
  if (knownPattern) {
    const match = emails.find((e) => e.pattern === knownPattern);
    if (match) return match.email;
  }
  // Default to first.last pattern
  return emails[0]?.email || "";
}

// ─── STUB: Pattern Discovery ─────────────────────────────────────────
// TODO: Replace with real HTTP fetch + email regex extraction.
// Input: domain
// Output: discovered EmailPattern or null
function stubDiscoverPattern(_domain: string): EmailPattern | null {
  const patterns: EmailPattern[] = ["FIRST_LAST", "F_LAST", "FIRST", "FIRSTL", "LAST"];
  // Randomly pick a pattern to simulate discovery
  return patterns[Math.floor(Math.random() * patterns.length)];
}

// ─── Main Handler ────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { job_id } = await req.json();
    if (!job_id) {
      return new Response(
        JSON.stringify({ error: "job_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS for writing results
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch the job
    const { data: job, error: jobError } = await supabase
      .from("search_jobs")
      .select("*")
      .eq("id", job_id)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as running
    await supabase
      .from("search_jobs")
      .update({ status: "running" })
      .eq("id", job_id);

    const input = job.input_json as Record<string, any>;
    let resultsCount = 0;

    if (job.type === "business") {
      // ─── Business Email Search ───────────────────────────
      const { industry, location, max_results = 10 } = input;

      const businesses = stubBusinessSearch(industry, location, max_results);

      const leadsToInsert = businesses.map((biz) => {
        const emails = stubScrapeEmails(biz.website);
        return {
          job_id: job_id,
          user_id: job.user_id,
          name: biz.name,
          industry: biz.industry,
          location: biz.location,
          website: biz.website,
          emails,
          source: "stub_provider",
          raw_data: biz,
        };
      });

      if (leadsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("business_leads")
          .insert(leadsToInsert);
        if (insertError) throw new Error(`Insert error: ${insertError.message}`);
      }

      resultsCount = leadsToInsert.length;

    } else if (job.type === "people") {
      // ─── People Email Search ─────────────────────────────
      const { role, company, country, max_profiles = 10 } = input;

      // Build query string
      let query = `site:linkedin.com/in "${role}"`;
      if (company) query += ` "${company}"`;
      else if (country) query += ` "${country}"`;

      const searchResults = stubPeopleSearch(query, max_profiles);

      const leadsToInsert = [];

      for (const result of searchResults) {
        const parsed = parseSearchResult(result);
        const companyName = parsed.company || company || "";
        const domain = companyName ? stubGetDomain(companyName) : "";

        let discoveredPattern: EmailPattern | null = null;

        if (domain) {
          // Check if we already have a pattern for this domain
          const { data: existing } = await supabase
            .from("domain_patterns")
            .select("pattern")
            .eq("domain", domain)
            .single();

          if (existing) {
            discoveredPattern = existing.pattern as EmailPattern;
          } else {
            // Try to discover pattern
            discoveredPattern = stubDiscoverPattern(domain);
            if (discoveredPattern) {
              await supabase.from("domain_patterns").upsert({
                domain,
                pattern: discoveredPattern,
                discovered_at: new Date().toISOString(),
              }, { onConflict: "domain" });
            }
          }
        }

        const emails = generateEmails(parsed.firstName, parsed.lastName, domain);
        const primaryEmail = selectPrimaryEmail(emails, discoveredPattern || undefined);

        leadsToInsert.push({
          job_id: job_id,
          user_id: job.user_id,
          full_name: parsed.fullName,
          first_name: parsed.firstName,
          last_name: parsed.lastName,
          role: parsed.role || role,
          company: companyName,
          country: country || null,
          domain,
          primary_email: primaryEmail,
          generated_emails: emails.map((e) => e.email),
          source_query: query,
          source_url: result.url,
          raw_data: { ...result, parsed },
        });
      }

      if (leadsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("people_leads")
          .insert(leadsToInsert);
        if (insertError) throw new Error(`Insert error: ${insertError.message}`);
      }

      resultsCount = leadsToInsert.length;
    }

    // Mark as completed
    await supabase
      .from("search_jobs")
      .update({
        status: "completed",
        results_count: resultsCount,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job_id);

    return new Response(
      JSON.stringify({ success: true, results_count: resultsCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Job processing error:", error);

    // Try to mark job as failed
    try {
      const { job_id } = await (error as any);
    } catch {
      // ignore
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
