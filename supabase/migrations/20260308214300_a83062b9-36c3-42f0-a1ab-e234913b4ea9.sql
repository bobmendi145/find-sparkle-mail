
-- Table for tracking individual email sends with unique tracking IDs
CREATE TABLE public.email_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message_id TEXT,
  tracking_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opens INTEGER NOT NULL DEFAULT 0,
  first_opened_at TIMESTAMP WITH TIME ZONE,
  last_opened_at TIMESTAMP WITH TIME ZONE,
  clicks INTEGER NOT NULL DEFAULT 0,
  first_clicked_at TIMESTAMP WITH TIME ZONE,
  last_clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for individual tracking events (each open/click)
CREATE TABLE public.email_tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id UUID NOT NULL REFERENCES public.email_tracking(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'open' or 'click'
  url TEXT, -- only for clicks
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tracking" ON public.email_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tracking" ON public.email_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tracking" ON public.email_tracking FOR UPDATE USING (auth.uid() = user_id);

-- Events need service role access from edge function, plus user read access via join
CREATE POLICY "Users can read own tracking events" ON public.email_tracking_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.email_tracking t WHERE t.id = tracking_id AND t.user_id = auth.uid()));

CREATE INDEX idx_email_tracking_user_id ON public.email_tracking(user_id);
CREATE INDEX idx_email_tracking_tracking_id ON public.email_tracking(tracking_id);
CREATE INDEX idx_email_tracking_events_tracking_id ON public.email_tracking_events(tracking_id);
