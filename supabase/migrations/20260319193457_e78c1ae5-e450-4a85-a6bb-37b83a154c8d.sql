
-- Helper function to get all usuario_ids belonging to a director's school
-- Uses SECURITY DEFINER to bypass RLS and avoid infinite recursion
CREATE OR REPLACE FUNCTION public.get_usuarios_da_escola_diretor()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT d2.usuario_id FROM diretores d2
  WHERE d2.escola_id = (SELECT d.escola_id FROM diretores d JOIN usuarios u ON u.id = d.usuario_id WHERE u.auth_id = auth.uid())
  UNION
  SELECT p.usuario_id FROM professores p
  JOIN professor_escolas pe ON pe.professor_id = p.id
  WHERE pe.escola_id = (SELECT d.escola_id FROM diretores d JOIN usuarios u ON u.id = d.usuario_id WHERE u.auth_id = auth.uid())
  UNION
  SELECT r.usuario_id FROM responsaveis r
  JOIN aluno_responsaveis ar ON ar.responsavel_id = r.id
  JOIN alunos a ON a.id = ar.aluno_id
  WHERE a.escola_id = (SELECT d.escola_id FROM diretores d JOIN usuarios u ON u.id = d.usuario_id WHERE u.auth_id = auth.uid())
$$;

-- Drop and recreate the problematic policy
DROP POLICY IF EXISTS "Diretor can read school usuarios" ON public.usuarios;

CREATE POLICY "Diretor can read school usuarios"
  ON public.usuarios FOR SELECT
  TO authenticated
  USING (
    has_papel('DIRETOR'::text) AND id IN (SELECT get_usuarios_da_escola_diretor())
  );
