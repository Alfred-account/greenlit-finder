CREATE OR REPLACE FUNCTION public.username_available(_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE username = lower(trim(_username))
  );
$$;

CREATE OR REPLACE FUNCTION public.username_login_email(_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email::text
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.username = lower(trim(_username))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.username_available(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.username_login_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.username_available(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.username_login_email(text) TO anon, authenticated, service_role;