-- ================================================================
-- COMPREHENSIVE RLS FIX: break all circular references
-- aluno_responsaveis ↔ alunos ↔ responsaveis
-- ================================================================
--
-- CYCLES DETECTED:
--   aluno_responsaveis (Diretor policy) → alunos
--   alunos (Responsavel policy)         → aluno_responsaveis   ← LOOP
--
--   responsaveis (Diretor policy)       → aluno_responsaveis + alunos
--   aluno_responsaveis (...)            → alunos               ← LOOP
--
-- FIX: SECURITY DEFINER helper functions bypass RLS on subqueries.
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- Additional SECURITY DEFINER helpers
-- ────────────────────────────────────────────────────────────────

-- Aluno IDs belonging to current responsavel (bypasses aluno_responsaveis RLS)
CREATE OR REPLACE FUNCTION public.get_alunos_do_responsavel(p_responsavel_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT aluno_id FROM public.aluno_responsaveis WHERE responsavel_id = p_responsavel_id
$$;

-- Aluno IDs in a school (bypasses alunos RLS)
CREATE OR REPLACE FUNCTION public.get_alunos_da_escola(p_escola_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.alunos WHERE escola_id = p_escola_id
$$;

-- Aluno IDs in a turma (bypasses alunos RLS)
CREATE OR REPLACE FUNCTION public.get_alunos_da_turma_professor(p_professor_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id FROM public.alunos a
  JOIN public.turma_professores tp ON tp.turma_id = a.turma_id
  WHERE tp.professor_id = p_professor_id
$$;

-- Responsavel IDs in a school (bypasses aluno_responsaveis + alunos RLS)
CREATE OR REPLACE FUNCTION public.get_responsaveis_da_escola(p_escola_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT ar.responsavel_id
  FROM public.aluno_responsaveis ar
  JOIN public.alunos a ON a.id = ar.aluno_id
  WHERE a.escola_id = p_escola_id
$$;

-- ────────────────────────────────────────────────────────────────
-- ALUNOS — fix Responsavel policy (was querying aluno_responsaveis)
-- ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Responsavel can read own alunos" ON public.alunos;

CREATE POLICY "Responsavel can read own alunos" ON public.alunos
  FOR SELECT TO authenticated
  USING (
    public.has_papel('RESPONSAVEL')
    AND id IN (SELECT public.get_alunos_do_responsavel(public.get_meu_responsavel_id()))
  );

-- ────────────────────────────────────────────────────────────────
-- ALUNO_RESPONSAVEIS — fix Diretor + Professor policies
-- ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Secretaria can read all aluno_responsaveis"         ON public.aluno_responsaveis;
DROP POLICY IF EXISTS "Diretor can read school aluno_responsaveis"         ON public.aluno_responsaveis;
DROP POLICY IF EXISTS "Professor can read own turma aluno_responsaveis"    ON public.aluno_responsaveis;
DROP POLICY IF EXISTS "Responsavel can read own aluno_responsaveis"        ON public.aluno_responsaveis;
DROP POLICY IF EXISTS "Authenticated can read aluno_responsaveis"          ON public.aluno_responsaveis;
DROP POLICY IF EXISTS "Secretaria can manage aluno_responsaveis"           ON public.aluno_responsaveis;
DROP POLICY IF EXISTS "Diretor can manage aluno_responsaveis"              ON public.aluno_responsaveis;

CREATE POLICY "Secretaria can read all aluno_responsaveis" ON public.aluno_responsaveis
  FOR SELECT TO authenticated USING (public.has_papel('SECRETARIA'));

-- ✅ No longer queries alunos directly
CREATE POLICY "Diretor can read school aluno_responsaveis" ON public.aluno_responsaveis
  FOR SELECT TO authenticated
  USING (
    public.has_papel('DIRETOR')
    AND aluno_id IN (SELECT public.get_alunos_da_escola(public.get_minha_escola_diretor()))
  );

-- ✅ No longer queries alunos/turma_professores directly
CREATE POLICY "Professor can read own turma aluno_responsaveis" ON public.aluno_responsaveis
  FOR SELECT TO authenticated
  USING (
    public.has_papel('PROFESSOR')
    AND aluno_id IN (SELECT public.get_alunos_da_turma_professor(public.get_meu_professor_id()))
  );

CREATE POLICY "Responsavel can read own aluno_responsaveis" ON public.aluno_responsaveis
  FOR SELECT TO authenticated
  USING (public.has_papel('RESPONSAVEL') AND responsavel_id = public.get_meu_responsavel_id());

-- INSERT / UPDATE / DELETE
CREATE POLICY "Secretaria can manage aluno_responsaveis" ON public.aluno_responsaveis
  FOR ALL TO authenticated
  USING (public.has_papel('SECRETARIA'))
  WITH CHECK (public.has_papel('SECRETARIA'));

CREATE POLICY "Diretor can manage aluno_responsaveis" ON public.aluno_responsaveis
  FOR ALL TO authenticated
  USING (
    public.has_papel('DIRETOR')
    AND aluno_id IN (SELECT public.get_alunos_da_escola(public.get_minha_escola_diretor()))
  )
  WITH CHECK (
    public.has_papel('DIRETOR')
    AND aluno_id IN (SELECT public.get_alunos_da_escola(public.get_minha_escola_diretor()))
  );

-- ────────────────────────────────────────────────────────────────
-- RESPONSAVEIS — fix Diretor policy (was querying aluno_responsaveis + alunos)
-- ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Secretaria can read all responsaveis"   ON public.responsaveis;
DROP POLICY IF EXISTS "Diretor can read school responsaveis"   ON public.responsaveis;
DROP POLICY IF EXISTS "Responsavel can read self"              ON public.responsaveis;
DROP POLICY IF EXISTS "Authenticated can read responsaveis"    ON public.responsaveis;
DROP POLICY IF EXISTS "Secretaria can manage responsaveis"     ON public.responsaveis;

CREATE POLICY "Secretaria can read all responsaveis" ON public.responsaveis
  FOR SELECT TO authenticated USING (public.has_papel('SECRETARIA'));

-- ✅ Uses SECURITY DEFINER helper — no longer queries aluno_responsaveis + alunos directly
CREATE POLICY "Diretor can read school responsaveis" ON public.responsaveis
  FOR SELECT TO authenticated
  USING (
    public.has_papel('DIRETOR')
    AND id IN (SELECT public.get_responsaveis_da_escola(public.get_minha_escola_diretor()))
  );

CREATE POLICY "Responsavel can read self" ON public.responsaveis
  FOR SELECT TO authenticated
  USING (public.has_papel('RESPONSAVEL') AND usuario_id = public.get_meu_usuario_id());

-- Secretaria full management
CREATE POLICY "Secretaria can manage responsaveis" ON public.responsaveis
  FOR ALL TO authenticated
  USING (public.has_papel('SECRETARIA'))
  WITH CHECK (public.has_papel('SECRETARIA'));

-- ────────────────────────────────────────────────────────────────
-- ALUNO_TURMA_HISTORICO — fix Professor policy (joins turma_professores)
-- ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Professor can read own turma aluno_turma_historico" ON public.aluno_turma_historico;
DROP POLICY IF EXISTS "Diretor can read school aluno_turma_historico"      ON public.aluno_turma_historico;
DROP POLICY IF EXISTS "Responsavel can read own aluno_turma_historico"     ON public.aluno_turma_historico;

CREATE POLICY "Diretor can read school aluno_turma_historico" ON public.aluno_turma_historico
  FOR SELECT TO authenticated
  USING (
    public.has_papel('DIRETOR')
    AND aluno_id IN (SELECT public.get_alunos_da_escola(public.get_minha_escola_diretor()))
  );

CREATE POLICY "Professor can read own turma aluno_turma_historico" ON public.aluno_turma_historico
  FOR SELECT TO authenticated
  USING (
    public.has_papel('PROFESSOR')
    AND aluno_id IN (SELECT public.get_alunos_da_turma_professor(public.get_meu_professor_id()))
  );

CREATE POLICY "Responsavel can read own aluno_turma_historico" ON public.aluno_turma_historico
  FOR SELECT TO authenticated
  USING (
    public.has_papel('RESPONSAVEL')
    AND aluno_id IN (SELECT public.get_alunos_do_responsavel(public.get_meu_responsavel_id()))
  );

-- Secretaria / Diretor can also write historico
DROP POLICY IF EXISTS "Secretaria can manage aluno_turma_historico" ON public.aluno_turma_historico;
CREATE POLICY "Secretaria can manage aluno_turma_historico" ON public.aluno_turma_historico
  FOR ALL TO authenticated
  USING (public.has_papel('SECRETARIA'))
  WITH CHECK (public.has_papel('SECRETARIA'));

-- ────────────────────────────────────────────────────────────────
-- USUARIOS — add write access for Secretaria
-- ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Secretaria can manage usuarios" ON public.usuarios;
CREATE POLICY "Secretaria can manage usuarios" ON public.usuarios
  FOR ALL TO authenticated
  USING (public.has_papel('SECRETARIA'))
  WITH CHECK (public.has_papel('SECRETARIA'));
