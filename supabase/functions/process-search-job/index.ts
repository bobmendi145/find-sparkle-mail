/**
 * Edge Function: process-search-job
 *
 * Processes a search job (business or people) using Firecrawl for
 * real web search and scraping. Called with: { job_id: string }
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Firecrawl helpers ───────────────────────────────────────────────

async function firecrawlSearch(
  apiKey: string,
  query: string,
  limit: number
): Promise<{ url: string; title: string; description: string; markdown?: string }[]> {
  const res = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit,
      scrapeOptions: { formats: ["markdown"] },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Firecrawl search failed [${res.status}]: ${JSON.stringify(json)}`);
  }

  return (json.data || []).map((r: any) => ({
    url: r.url || "",
    title: r.title || "",
    description: r.description || "",
    markdown: r.markdown || "",
  }));
}

async function firecrawlScrape(
  apiKey: string,
  url: string
): Promise<{ markdown: string; html: string; links: string[] }> {
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "links"],
      onlyMainContent: true,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Firecrawl scrape failed [${res.status}]: ${JSON.stringify(json)}`);
  }

  const data = json.data || json;
  return {
    markdown: data.markdown || "",
    html: data.html || "",
    links: data.links || [],
  };
}

// ─── Email extraction from scraped content ───────────────────────────

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_REGEX) || [];
  // Deduplicate and filter out common false positives
  const unique = [...new Set(matches.map((e) => e.toLowerCase()))];
  return unique.filter(
    (e) =>
      !e.endsWith(".png") &&
      !e.endsWith(".jpg") &&
      !e.endsWith(".gif") &&
      !e.includes("example.com") &&
      !e.includes("sentry.io") &&
      !e.includes("wixpress.com")
  );
}

// ─── Email generation for people leads ───────────────────────────────

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

// ─── Parse LinkedIn-style search result (fallback only) ─────────────

function parseSearchResult(result: { title: string; description: string; url: string }) {
  const titleParts = result.title.split(/\s*[–\-|]\s*/);
  const fullName = (titleParts[0] || "").trim();
  const role = (titleParts[1] || "").trim();
  const company = (titleParts[2] || "").replace(/LinkedIn/i, "").trim();

  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return { fullName, firstName, lastName, role, company };
}

// ─── Parse LinkedIn profile markdown for current job ────────────────

function parseLinkedInProfile(markdown: string, fallback: { fullName: string; role: string; company: string }) {
  let fullName = fallback.fullName;
  let role = fallback.role;
  let company = fallback.company;

  if (!markdown) return { fullName, role, company };

  // Name: usually first H1 or first non-empty line
  const h1Match = markdown.match(/^#\s+([^\n]+)/m);
  if (h1Match) {
    const candidate = h1Match[1].trim().replace(/\|.*$/, "").trim();
    if (candidate.length > 1 && candidate.length < 80) fullName = candidate;
  }

  // Headline: line right after name often "Title at Company" or "Title @ Company"
  const headlineMatch = markdown.match(/(?:^|\n)([^\n]+?\s+(?:at|@)\s+[^\n]+)/i);
  if (headlineMatch) {
    const m = headlineMatch[1].match(/^(.+?)\s+(?:at|@)\s+(.+?)$/i);
    if (m) {
      role = m[1].trim().slice(0, 120);
      company = m[2].trim().replace(/[·|].*$/, "").trim().slice(0, 120);
    }
  }

  // Experience section: find first entry with "Present"
  const expSection = markdown.split(/##?\s*Experience/i)[1];
  if (expSection) {
    // Look for pattern like: Title\nCompany · Full-time\n... Present
    const presentBlock = expSection.match(/([^\n]+)\n([^\n·\-]+)(?:[·\-][^\n]*)?\n[\s\S]{0,400}?Present/i);
    if (presentBlock) {
      const t = presentBlock[1].trim();
      const c = presentBlock[2].trim();
      if (t && t.length < 120) role = t;
      if (c && c.length < 120) company = c.replace(/\s*·.*$/, "").trim();
    }
  }

  return { fullName, role, company };
}

// ─── Domain resolution from company name ─────────────────────────────

function guessDomain(company: string): string {
  if (!company) return "";
  const slug = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${slug}.com`;
}

// ─── Detect email pattern from sample emails ────────────────────────

function detectPattern(emails: string[], firstName: string, lastName: string, domain: string): EmailPattern | null {
  const f = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const l = lastName.toLowerCase().replace(/[^a-z]/g, "");
  const domainEmails = emails
    .map((e) => e.toLowerCase())
    .filter((e) => e.endsWith(`@${domain}`))
    .filter((e) => !/^(info|hello|contact|support|sales|admin|hr|press|noreply|no-reply|team|jobs|careers)@/.test(e));

  if (domainEmails.length === 0) return null;

  const sample = domainEmails[0];
  const local = sample.split("@")[0];

  if (f && l) {
    if (local === `${f}.${l}`) return "FIRST_LAST";
    if (local === `${f[0]}.${l}`) return "F_LAST";
    if (local === `${f}${l[0]}`) return "FIRSTL";
    if (local === f) return "FIRST";
    if (local === l) return "LAST";
  }
  // Generic structural detection
  if (local.includes(".")) return "FIRST_LAST";
  if (local.length <= 6) return "FIRST";
  return "FIRST_LAST";
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

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      throw new Error("FIRECRAWL_API_KEY not configured");
    }

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
      const query = `${industry} businesses in ${location} contact email`;

      console.log("Firecrawl business search:", query);
      const searchResults = await firecrawlSearch(firecrawlKey, query, max_results);

      const leadsToInsert = [];

      for (const result of searchResults) {
        // Try to scrape each result URL for emails
        let emails: string[] = [];
        let scrapedData: any = {};

        try {
          const scraped = await firecrawlScrape(firecrawlKey, result.url);
          emails = extractEmails(scraped.markdown);
          scrapedData = { markdown_preview: scraped.markdown.slice(0, 500) };
        } catch (err) {
          console.warn(`Failed to scrape ${result.url}:`, err);
          // Also try extracting emails from the search result description
          emails = extractEmails(result.description + " " + (result.markdown || ""));
        }

        // Extract business name from title
        const name = result.title.split(/\s*[–\-|:]\s*/)[0]?.trim() || result.url;

        leadsToInsert.push({
          job_id: job_id,
          user_id: job.user_id,
          name,
          industry,
          location,
          website: result.url,
          emails,
          source: "firecrawl",
          raw_data: { ...result, ...scrapedData },
        });
      }

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

      let query = `site:linkedin.com/in "${role}"`;
      if (company) query += ` "${company}"`;
      if (country) query += ` "${country}"`;

      console.log("Firecrawl people search:", query);
      const searchResults = await firecrawlSearch(firecrawlKey, query, max_profiles);

      const leadsToInsert = [];

      for (const result of searchResults) {
        // Step 1: snippet-based fallback parse
        const snippetParsed = parseSearchResult(result);

        // Step 2: scrape the LinkedIn profile to get the REAL current job
        let profileMarkdown = "";
        try {
          console.log(`Scraping LinkedIn profile: ${result.url}`);
          const scraped = await firecrawlScrape(firecrawlKey, result.url);
          profileMarkdown = scraped.markdown || "";
        } catch (err) {
          console.warn(`LinkedIn profile scrape failed for ${result.url}:`, err);
        }

        const profile = parseLinkedInProfile(profileMarkdown, {
          fullName: snippetParsed.fullName,
          role: snippetParsed.role,
          company: snippetParsed.company,
        });

        const nameParts = profile.fullName.split(/\s+/);
        const firstName = nameParts[0] || snippetParsed.firstName;
        const lastName = nameParts.slice(1).join(" ") || snippetParsed.lastName;
        const companyName = profile.company || company || "";

        let domain = "";
        let discoveredPattern: EmailPattern | null = null;

        // Step 3: find the real company domain via web search
        if (companyName) {
          try {
            const companySearch = await firecrawlSearch(
              firecrawlKey,
              `${companyName} official website`,
              1
            );
            if (companySearch.length > 0) {
              try {
                const url = new URL(companySearch[0].url);
                domain = url.hostname.replace(/^www\./, "");
              } catch {
                domain = guessDomain(companyName);
              }
            }
          } catch (err) {
            console.warn(`Company domain search failed for ${companyName}:`, err);
          }
        }
        if (!domain) domain = guessDomain(companyName);

        // Step 4: check cached pattern for this domain
        if (domain) {
          const { data: existing } = await supabase
            .from("domain_patterns")
            .select("pattern")
            .eq("domain", domain)
            .maybeSingle();
          if (existing) discoveredPattern = existing.pattern as EmailPattern;
        }

        // Step 5: scrape company website to detect real pattern
        if (domain && !discoveredPattern) {
          try {
            const scraped = await firecrawlScrape(firecrawlKey, `https://${domain}`);
            let foundEmails = extractEmails(scraped.markdown);
            if (foundEmails.filter((e) => e.endsWith(`@${domain}`)).length === 0) {
              try {
                const contactScraped = await firecrawlScrape(firecrawlKey, `https://${domain}/contact`);
                foundEmails = [...foundEmails, ...extractEmails(contactScraped.markdown)];
              } catch { /* ignore */ }
            }
            discoveredPattern = detectPattern(foundEmails, firstName, lastName, domain);
            if (discoveredPattern) {
              await supabase.from("domain_patterns").upsert(
                { domain, pattern: discoveredPattern, discovered_at: new Date().toISOString() },
                { onConflict: "domain" }
              );
            }
          } catch (err) {
            console.warn(`Pattern discovery failed for ${domain}:`, err);
          }
        }

        const emails = generateEmails(firstName, lastName, domain);
        const primaryEmail = discoveredPattern
          ? emails.find((e) => e.pattern === discoveredPattern)?.email || emails[0]?.email || ""
          : emails[0]?.email || "";

        leadsToInsert.push({
          job_id: job_id,
          user_id: job.user_id,
          full_name: profile.fullName,
          first_name: firstName,
          last_name: lastName,
          role: profile.role || role,
          company: companyName,
          country: country || null,
          domain,
          primary_email: primaryEmail,
          generated_emails: emails.map((e) => e.email),
          source_query: query,
          source_url: result.url,
          raw_data: {
            snippet: result,
            profile_parsed: profile,
            pattern_detected: discoveredPattern,
            profile_markdown_preview: profileMarkdown.slice(0, 800),
          },
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
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      // Re-parse to get job_id for error marking
      // Note: we can't re-read the body, so just log the error
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
