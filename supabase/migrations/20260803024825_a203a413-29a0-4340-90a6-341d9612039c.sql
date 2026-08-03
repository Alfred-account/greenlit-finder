DROP FUNCTION IF EXISTS public.username_login_email(text);

CREATE OR REPLACE FUNCTION public.username_login_email(_username text, _password text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _email text;
BEGIN
  SELECT u.email::text INTO _email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.username = lower(trim(_username))
    AND u.encrypted_password IS NOT NULL
    AND u.encrypted_password = crypt(_password, u.encrypted_password)
  LIMIT 1;
  RETURN _email;
END;
$$;

REVOKE ALL ON FUNCTION public.username_login_email(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.username_login_email(text, text) TO anon, authenticated, service_role;