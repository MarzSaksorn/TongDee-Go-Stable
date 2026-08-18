-- The harden_admin_role migration redefined is_admin() but the anon role
-- lost EXECUTE on it. RLS policies call is_admin() as the requesting role,
-- so anon queries against any policy that references it failed with
-- "permission denied for function is_admin" (surfaced as HTTP 401).
grant execute on function public.is_admin() to anon, authenticated, service_role;
