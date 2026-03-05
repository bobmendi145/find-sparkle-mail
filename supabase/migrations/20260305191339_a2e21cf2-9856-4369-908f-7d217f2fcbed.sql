
-- Search Jobs table
CREATE TABLE public.search_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('business', 'people')),
  input_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.search_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own jobs" ON public.search_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.search_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.search_jobs FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Business Leads table
CREATE TABLE public.business_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.search_jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  website TEXT,
  emails TEXT[] DEFAULT '{}',
  source TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own business leads" ON public.business_leads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own business leads" ON public.business_leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Domain Patterns table
CREATE TABLE public.domain_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  pattern TEXT NOT NULL CHECK (pattern IN ('FIRST_LAST', 'FIRST', 'F_LAST', 'FIRSTL', 'LAST')),
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.domain_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read domain patterns" ON public.domain_patterns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert domain patterns" ON public.domain_patterns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update domain patterns" ON public.domain_patterns FOR UPDATE TO authenticated USING (true);

-- People Leads table
CREATE TABLE public.people_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.search_jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  company TEXT,
  country TEXT,
  domain TEXT,
  primary_email TEXT,
  generated_emails TEXT[] DEFAULT '{}',
  source_query TEXT,
  source_url TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.people_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own people leads" ON public.people_leads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own people leads" ON public.people_leads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Enable realtime for search_jobs so we can poll status
ALTER PUBLICATION supabase_realtime ADD TABLE public.search_jobs;
