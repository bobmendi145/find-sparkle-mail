DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can read all subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read all search jobs" ON public.search_jobs;
CREATE POLICY "Admins can read all search jobs"
ON public.search_jobs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read all business leads" ON public.business_leads;
CREATE POLICY "Admins can read all business leads"
ON public.business_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read all people leads" ON public.people_leads;
CREATE POLICY "Admins can read all people leads"
ON public.people_leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read all email tracking" ON public.email_tracking;
CREATE POLICY "Admins can read all email tracking"
ON public.email_tracking
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can read own tracking events" ON public.email_tracking_events;
CREATE POLICY "Users can read own tracking events"
ON public.email_tracking_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.email_tracking t
    WHERE t.tracking_id = email_tracking_events.tracking_id
      AND t.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can read all tracking events" ON public.email_tracking_events;
CREATE POLICY "Admins can read all tracking events"
ON public.email_tracking_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Subscribed users and admins can read people" ON public.people;
DROP POLICY IF EXISTS "Anyone can read people" ON public.people;
CREATE POLICY "Subscribed users and admins can read people"
ON public.people
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
      AND s.status = 'active'
  )
);