
CREATE TABLE public.crm_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL CHECK (provider IN ('hubspot', 'salesforce', 'pipedrive', 'zoho')),
  api_key text NOT NULL,
  instance_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

ALTER TABLE public.crm_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own crm connections"
  ON public.crm_connections FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crm connections"
  ON public.crm_connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crm connections"
  ON public.crm_connections FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own crm connections"
  ON public.crm_connections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_crm_connections_updated_at
  BEFORE UPDATE ON public.crm_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
