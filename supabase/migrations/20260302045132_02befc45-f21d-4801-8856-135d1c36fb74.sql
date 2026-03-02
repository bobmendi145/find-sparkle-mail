-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  employee_count INTEGER,
  revenue_usd BIGINT,
  industry TEXT[] DEFAULT '{}',
  location_hq_country TEXT,
  location_hq_state TEXT,
  location_hq_city TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  founded_year INTEGER,
  funding_total BIGINT,
  funding_stage TEXT,
  growth_rate NUMERIC,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- People table
CREATE TABLE public.people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  title TEXT,
  department TEXT,
  seniority TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  keywords TEXT[] DEFAULT '{}',
  location_country TEXT,
  location_city TEXT,
  email_confidence INTEGER DEFAULT 0,
  email_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Search history (per user)
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filters_json JSONB NOT NULL DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved filter sets (per user)
CREATE TABLE public.saved_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  filters_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CSV import jobs (per user)
CREATE TABLE public.csv_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  results_json JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csv_imports ENABLE ROW LEVEL SECURITY;

-- Companies and people are readable by all authenticated users
CREATE POLICY "Anyone can read companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read people" ON public.people FOR SELECT TO authenticated USING (true);

-- User-specific tables
CREATE POLICY "Users can read own search history" ON public.search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own search history" ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own saved filters" ON public.saved_filters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved filters" ON public.saved_filters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved filters" ON public.saved_filters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved filters" ON public.saved_filters FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own csv imports" ON public.csv_imports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own csv imports" ON public.csv_imports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own csv imports" ON public.csv_imports FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_people_company ON public.people(company_id);
CREATE INDEX idx_people_email ON public.people(email);
CREATE INDEX idx_people_name ON public.people(first_name, last_name);
CREATE INDEX idx_companies_domain ON public.companies(domain);
CREATE INDEX idx_companies_industry ON public.companies USING GIN(industry);
CREATE INDEX idx_companies_tech ON public.companies USING GIN(tech_stack);

-- Triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_saved_filters_updated_at BEFORE UPDATE ON public.saved_filters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_csv_imports_updated_at BEFORE UPDATE ON public.csv_imports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();