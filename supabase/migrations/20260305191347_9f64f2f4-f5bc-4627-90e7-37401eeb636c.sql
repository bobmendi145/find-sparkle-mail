
-- Fix domain_patterns policies to be scoped properly
-- Domain patterns are a shared resource but only service role should write them
DROP POLICY "Authenticated can insert domain patterns" ON public.domain_patterns;
DROP POLICY "Authenticated can update domain patterns" ON public.domain_patterns;

-- Only allow inserts/updates via service role (edge functions) by not creating permissive user policies
-- The edge function uses service role key so it bypasses RLS
