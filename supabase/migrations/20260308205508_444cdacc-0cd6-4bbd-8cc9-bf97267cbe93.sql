
CREATE TABLE public.email_provider_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'aws_ses',
  access_key_id text NOT NULL,
  secret_access_key text NOT NULL,
  region text NOT NULL DEFAULT 'us-east-1',
  sender_email text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE public.email_provider_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own email connections"
  ON public.email_provider_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email connections"
  ON public.email_provider_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email connections"
  ON public.email_provider_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email connections"
  ON public.email_provider_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
