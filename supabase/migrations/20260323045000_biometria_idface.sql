-- ============================================================
-- Migration: iDFace Biometric Support
-- Adds biometric fields to alunos + frequencia_catraca table
-- ============================================================

-- 1. Add biometric columns to alunos
ALTER TABLE public.alunos
  ADD COLUMN IF NOT EXISTS biometria_cadastrada boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS idface_user_id bigint UNIQUE;

-- 2. Create frequencia_catraca table
CREATE TABLE IF NOT EXISTS public.frequencia_catraca (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id      uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  data_hora     timestamptz NOT NULL DEFAULT now(),
  dispositivo_ip text,
  processado    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by aluno and time
CREATE INDEX IF NOT EXISTS idx_frequencia_catraca_aluno_id
  ON public.frequencia_catraca(aluno_id);
CREATE INDEX IF NOT EXISTS idx_frequencia_catraca_data_hora
  ON public.frequencia_catraca(data_hora DESC);

-- 3. Enable RLS
ALTER TABLE public.frequencia_catraca ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Service role (used by Edge Functions with service_role key) bypasses RLS automatically.
-- Grant INSERT to service_role explicitly (belt-and-suspenders):
GRANT INSERT ON public.frequencia_catraca TO service_role;
GRANT SELECT ON public.frequencia_catraca TO service_role;

-- Secretaria can read all
CREATE POLICY "Secretaria can read all frequencia_catraca"
  ON public.frequencia_catraca FOR SELECT TO authenticated
  USING (public.has_papel('SECRETARIA'));

-- Diretor can read school records
CREATE POLICY "Diretor can read school frequencia_catraca"
  ON public.frequencia_catraca FOR SELECT TO authenticated
  USING (
    public.has_papel('DIRETOR') AND aluno_id IN (
      SELECT a.id FROM public.alunos a
      WHERE a.escola_id = public.get_minha_escola_diretor()
    )
  );

-- Professor can read own turma records
CREATE POLICY "Professor can read own turma frequencia_catraca"
  ON public.frequencia_catraca FOR SELECT TO authenticated
  USING (
    public.has_papel('PROFESSOR') AND aluno_id IN (
      SELECT a.id FROM public.alunos a
      JOIN public.turma_professores tp ON tp.turma_id = a.turma_id
      WHERE tp.professor_id = public.get_meu_professor_id()
    )
  );

-- Responsavel can read own aluno records
CREATE POLICY "Responsavel can read own frequencia_catraca"
  ON public.frequencia_catraca FOR SELECT TO authenticated
  USING (
    public.has_papel('RESPONSAVEL') AND aluno_id IN (
      SELECT ar.aluno_id FROM public.aluno_responsaveis ar
      WHERE ar.responsavel_id = public.get_meu_responsavel_id()
    )
  );

-- 5. Update alunos RLS to allow secretaria/diretor to update biometric fields
-- (Secretaria already should have full access — add update policies if not present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'alunos' AND policyname = 'Secretaria can update alunos'
  ) THEN
    EXECUTE 'CREATE POLICY "Secretaria can update alunos" ON public.alunos
      FOR UPDATE TO authenticated USING (public.has_papel(''SECRETARIA''))
      WITH CHECK (public.has_papel(''SECRETARIA''))';
  END IF;
END;
$$;

-- Grant read access on new columns for all existing alunos policies (views use existing SELECT)
GRANT SELECT (biometria_cadastrada, idface_user_id) ON public.alunos TO authenticated;
GRANT UPDATE (biometria_cadastrada, idface_user_id) ON public.alunos TO authenticated;
