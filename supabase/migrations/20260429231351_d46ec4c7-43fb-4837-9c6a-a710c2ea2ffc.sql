-- Track each quota-consuming action (search job creation or email verification)
CREATE TABLE public.usage_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('search_job', 'email_verification')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_usage_events_user_created ON public.usage_events(user_id, created_at DESC);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage" ON public.usage_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all usage" ON public.usage_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Cache verification results so repeats don't re-burn the quota for the same email
CREATE TABLE public.email_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL,
  sub_status TEXT,
  is_valid BOOLEAN NOT NULL DEFAULT false,
  raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, email)
);

CREATE INDEX idx_email_verifications_user ON public.email_verifications(user_id);

ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own verifications" ON public.email_verifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications" ON public.email_verifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verifications" ON public.email_verifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all verifications" ON public.email_verifications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Returns current usage windows + remaining quota for a user.
-- Admins are always reported as having unlimited quota (NULL remaining).
CREATE OR REPLACE FUNCTION public.get_usage_quota(_user_id UUID)
RETURNS TABLE (
  daily_used INT,
  daily_limit INT,
  monthly_used INT,
  monthly_limit INT,
  is_admin BOOLEAN
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin BOOLEAN;
BEGIN
  SELECT public.has_role(_user_id, 'admin'::app_role) INTO _is_admin;

  RETURN QUERY
  SELECT
    COALESCE((SELECT COUNT(*)::INT FROM public.usage_events
      WHERE user_id = _user_id AND created_at >= date_trunc('day', now())), 0),
    350,
    COALESCE((SELECT COUNT(*)::INT FROM public.usage_events
      WHERE user_id = _user_id AND created_at >= date_trunc('month', now())), 0),
    10000,
    COALESCE(_is_admin, false);
END;
$$;

-- Atomically check quota and record an event. Returns true on success, false if quota exceeded.
-- Admins always succeed and are not metered.
CREATE OR REPLACE FUNCTION public.consume_usage(_user_id UUID, _event_type TEXT, _metadata JSONB DEFAULT '{}'::jsonb)
RETURNS TABLE (
  allowed BOOLEAN,
  reason TEXT,
  daily_used INT,
  monthly_used INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin BOOLEAN;
  _daily INT;
  _monthly INT;
BEGIN
  IF _event_type NOT IN ('search_job', 'email_verification') THEN
    RETURN QUERY SELECT false, 'invalid_event_type'::TEXT, 0, 0;
    RETURN;
  END IF;

  SELECT public.has_role(_user_id, 'admin'::app_role) INTO _is_admin;

  IF COALESCE(_is_admin, false) THEN
    INSERT INTO public.usage_events(user_id, event_type, metadata)
    VALUES (_user_id, _event_type, _metadata);
    RETURN QUERY SELECT true, 'admin'::TEXT, 0, 0;
    RETURN;
  END IF;

  SELECT COUNT(*)::INT INTO _daily FROM public.usage_events
    WHERE user_id = _user_id AND created_at >= date_trunc('day', now());
  SELECT COUNT(*)::INT INTO _monthly FROM public.usage_events
    WHERE user_id = _user_id AND created_at >= date_trunc('month', now());

  IF _daily >= 350 THEN
    RETURN QUERY SELECT false, 'daily_limit_reached'::TEXT, _daily, _monthly;
    RETURN;
  END IF;

  IF _monthly >= 10000 THEN
    RETURN QUERY SELECT false, 'monthly_limit_reached'::TEXT, _daily, _monthly;
    RETURN;
  END IF;

  INSERT INTO public.usage_events(user_id, event_type, metadata)
  VALUES (_user_id, _event_type, _metadata);

  RETURN QUERY SELECT true, 'ok'::TEXT, _daily + 1, _monthly + 1;
END;
$$;