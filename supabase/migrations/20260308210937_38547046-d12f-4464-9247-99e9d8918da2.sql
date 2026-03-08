
CREATE TABLE public.scheduled_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipients TEXT[] NOT NULL DEFAULT '{}',
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scheduled emails" ON public.scheduled_emails FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scheduled emails" ON public.scheduled_emails FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scheduled emails" ON public.scheduled_emails FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scheduled emails" ON public.scheduled_emails FOR DELETE TO authenticated USING (auth.uid() = user_id);
