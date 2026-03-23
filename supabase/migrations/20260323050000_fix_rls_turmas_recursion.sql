-- ================================================================
-- Fix: Infinite recursion in turmas / turma_professores RLS
-- ================================================================
--
-- ROOT CAUSE (circular reference):
--   turmas        SELECT policy (Professor): subquery → turma_professores
--   turma_professores SELECT policy (Diretor): subquery → turmas
--   → PostgreSQL detects an infinite loop at query time
--
-- FIX STRATEGY:
--   Replace the cross-referencing subqueries with SECURITY DEFINER
--   helper functions. These functions run with the owner's rights,
--   bypassing RLS on the tables they query — breaking the cycle.
--
-- Also adds INSERT / UPDATE / DELETE policies so Secretaria and
-- Diretor can actually mutate turmas and related tables.
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- Helper functions (SECURITY DEFINER = bypass RLS inside them)
-- ────────────────────────────────────────────────────────────────

-- Returns turma IDs that belong to a given escola (bypasses turmas RLS)
CREATE OR REPLACE FUNCTION public.get_turmas_da_escola(p_escola_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.turmas WHERE escola_id = p_escola_id
$$;

-- Returns turma IDs assigned to a given professor (bypasses turma_professores RLS)
CREATE OR REPLACE FUNCTION public.get_turmas_do_professor(p_professor_id uuid)
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT turma_id FROM public.turma_professores WHERE professor_id = p_professor_id
$$;

-- ────────────────────────────────────────────────────────────────
-- TURMAS — rebuild policies without cross-references
-- ────────────────────────────────────────────────────────────────

-- SELECT
DROP POLICY IF EXISTS "Professor can read own turmas"       ON public.turmas;
DROP POLICY IF EXISTS "Diretor can read school turmas"      ON public.turmas;
DROP POLICY IF EXISTS "Secretaria can read all turmas"      ON public.turmas;
DROP POLICY IF EXISTS "Authenticated can read turmas"       ON public.turmas;

CREATE POLICY "Secretaria can read all turmas" ON public.turmas
  FOR SELECT TO authenticated
  USING (public.has_papel('SECRETARIA'));

CREATE POLICY "Diretor can read school turmas" ON public.turmas
  FOR SELECT TO authenticated
  USING (public.has_papel('DIRETOR') AND escola_id = public.get_minha_escola_diretor());

-- ✅ Use SECURITY DEFINER helper — no longer queries turma_professores directly
CREATE POLICY "Professor can read own turmas" ON public.turmas
  FOR SELECT TO authenticated
  USING (
    public.has_papel('PROFESSOR')
    AND id IN (SELECT public.get_turmas_do_professor(public.get_meu_professor_id()))
  );

-- INSERT
DROP POLICY IF EXISTS "Secretaria can insert turmas"  ON public.turmas;
DROP POLICY IF EXISTS "Diretor can insert turmas"     ON public.turmas;

CREATE POLICY "Secretaria can insert turmas" ON public.turmas
  FOR INSERT TO authenticated
  WITH CHECK (public.has_papel('SECRETARIA'));

CREATE POLICY "Diretor can insert turmas" ON public.turmas
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_papel('DIRETOR')
    AND escola_id = public.get_minha_escola_diretor()
  );

-- UPDATE
DROP POLICY IF EXISTS "Secretaria can update turmas" ON public.turmas;
DROP POLICY IF EXISTS "Diretor can update turmas"    ON public.turmas;

CREATE POLICY "Secretaria can update turmas" ON public.turmas
  FOR UPDATE TO authenticated
  USING (public.has_papel('SECRETARIA'))
  WITH CHECK (public.has_papel('SECRETARIA'));

CREATE POLICY "Diretor can update turmas" ON public.turmas
  FOR UPDATE TO authenticated
  USING (public.has_papel('DIRETOR') AND escola_id = public.get_minha_escola_diretor())
  WITH CHECK (public.has_papel('DIRETOR') AND escola_id = public.get_minha_escola_diretor());

-- DELETE
DROP POLICY IF EXISTS "Secretaria can delete turmas" ON public.turmas;
DROP POLICY IF EXISTS "Diretor can delete turmas"    ON public.turmas;

CREATE POLICY "Secretaria can delete turmas" ON public.turmas
  FOR DELETE TO authenticated
  USING (public.has_papel('SECRETARIA'));

CREATE POLICY "Diretor can delete turmas" ON public.turmas
  FOR DELETE TO authenticated
  USING (public.has_papel('DIRETOR') AND escola_id = public.get_minha_escola_diretor());

-- ────────────────────────────────────────────────────────────────
-- TURMA_PROFESSORES — rebuild policies without cross-references
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Secretaria can read all turma_professores"  ON public.turma_professores;
DROP POLICY IF EXISTS "Diretor can read school turma_professores"  ON public.turma_professores;
DROP POLICY IF EXISTS "Professor can read own turma_professores"   ON public.turma_professores;
DROP POLICY IF EXISTS "Authenticated can read turma_professores"   ON public.turma_professores;

CREATE POLICY "Secretaria can read all turma_professores" ON public.turma_professores
  FOR SELECT TO authenticated
  USING (public.has_papel('SECRETARIA'));

-- ✅ Use SECURITY DEFINER helper — no longer queries turmas directly
CREATE POLICY "Diretor can read school turma_professores" ON public.turma_professores
  FOR SELECT TO authenticated
  USING (
    public.has_papel('DIRETOR')
    AND turma_id IN (SELECT public.get_turmas_da_escola(public.get_minha_escola_diretor()))
  );

CREATE POLICY "Professor can read own turma_professores" ON public.turma_professores
  FOR SELECT TO authenticated
  USING (public.has_papel('PROFESSOR') AND professor_id = public.get_meu_professor_id());

-- INSERT / UPDATE / DELETE for Secretaria and Diretor
DROP POLICY IF EXISTS "Secretaria can manage turma_professores" ON public.turma_professores;
DROP POLICY IF EXISTS "Diretor can manage turma_professores"    ON public.turma_professores;

CREATE POLICY "Secretaria can manage turma_professores" ON public.turma_professores
  FOR ALL TO authenticated
  USING (public.has_papel('SECRETARIA'))
  WITH CHECK (public.has_papel('SECRETARIA'));

CREATE POLICY "Diretor can manage turma_professores" ON public.turma_professores
  FOR ALL TO authenticated
  USING (
    public.has_papel('DIRETOR')
    AND turma_id IN (SELECT public.get_turmas_da_escola(public.get_minha_escola_diretor()))
  )
  WITH CHECK (
    public.has_papel('DIRETOR')
    AND turma_id IN (SELECT public.get_turmas_da_escola(public.get_minha_escola_diretor()))
  );

-- ────────────────────────────────────────────────────────────────
-- SERIES — also needs INSERT/UPDATE so Secretaria can create series
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Secretaria can insert series" ON public.series;
DROP POLICY IF EXISTS "Secretaria can update series" ON public.series;
DROP POLICY IF EXISTS "Secretaria can delete series" ON public.series;
DROP POLICY IF EXISTS "Diretor can insert series"    ON public.series;
DROP POLICY IF EXISTS "Diretor can update series"    ON public.series;

CREATE POLICY "Secretaria can insert series" ON public.series
  FOR INSERT TO authenticated WITH CHECK (public.has_papel('SECRETARIA'));

CREATE POLICY "Secretaria can update series" ON public.series
  FOR UPDATE TO authenticated
  USING (public.has_papel('SECRETARIA'))
  WITH CHECK (public.has_papel('SECRETARIA'));

CREATE POLICY "Secretaria can delete series" ON public.series
  FOR DELETE TO authenticated USING (public.has_papel('SECRETARIA'));

CREATE POLICY "Diretor can insert series" ON public.series
  FOR INSERT TO authenticated
  WITH CHECK (public.has_papel('DIRETOR') AND escola_id = public.get_minha_escola_diretor());

CREATE POLICY "Diretor can update series" ON public.series
  FOR UPDATE TO authenticated
  USING (public.has_papel('DIRETOR') AND escola_id = public.get_minha_escola_diretor())
  WITH CHECK (public.has_papel('DIRETOR') AND escola_id = public.get_minha_escola_diretor());

-- ────────────────────────────────────────────────────────────────
-- ALUNOS — ensure Secretaria / Diretor can INSERT too
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Secretaria can insert alunos" ON public.alunos;
DROP POLICY IF EXISTS "Diretor can insert alunos"    ON public.alunos;

CREATE POLICY "Secretaria can insert alunos" ON public.alunos
  FOR INSERT TO authenticated WITH CHECK (public.has_papel('SECRETARIA'));

CREATE POLICY "Diretor can insert alunos" ON public.alunos
  FOR INSERT TO authenticated
  WITH CHECK (public.has_papel('DIRETOR') AND escola_id = public.get_minha_escola_diretor());

CREATE POLICY "Diretor can update alunos" ON public.alunos
  FOR UPDATE TO authenticated
  USING (public.has_papel('DIRETOR') AND escola_id = public.get_minha_escola_diretor())
  WITH CHECK (public.has_papel('DIRETOR') AND escola_id = public.get_minha_escola_diretor());
