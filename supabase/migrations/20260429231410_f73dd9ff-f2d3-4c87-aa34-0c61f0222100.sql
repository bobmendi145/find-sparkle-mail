REVOKE EXECUTE ON FUNCTION public.get_usage_quota(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.consume_usage(UUID, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_usage_quota(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_usage(UUID, TEXT, JSONB) TO authenticated;