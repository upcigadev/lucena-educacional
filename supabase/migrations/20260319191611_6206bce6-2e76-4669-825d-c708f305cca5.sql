
-- Create a secure function for CPF-to-email lookup (for login)
-- This avoids exposing all usuario data to anon users
CREATE OR REPLACE FUNCTION public.lookup_email_by_cpf(_cpf text)
RETURNS TABLE(email text, has_auth boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email, (u.auth_id IS NOT NULL) AS has_auth
  FROM public.usuarios u
  WHERE u.cpf = _cpf AND u.ativo = true
  LIMIT 1;
$$;

-- Grant execute to anon so unauthenticated users can login
GRANT EXECUTE ON FUNCTION public.lookup_email_by_cpf(text) TO anon;
GRANT EXECUTE ON FUNCTION public.lookup_email_by_cpf(text) TO authenticated;
