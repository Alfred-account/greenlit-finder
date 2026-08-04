-- Trigger-only functions: nobody should call these via the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Auth helper functions: only needed pre-login (anon role)
REVOKE ALL ON FUNCTION public.username_available(text) FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.username_login_email(text, text) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.username_available(text) TO anon;
GRANT EXECUTE ON FUNCTION public.username_login_email(text, text) TO anon;