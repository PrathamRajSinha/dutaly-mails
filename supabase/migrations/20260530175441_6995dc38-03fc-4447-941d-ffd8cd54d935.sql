
REVOKE EXECUTE ON FUNCTION public.check_usage_limit(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.increment_usage(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privilege_escalation() FROM anon, authenticated, public;
