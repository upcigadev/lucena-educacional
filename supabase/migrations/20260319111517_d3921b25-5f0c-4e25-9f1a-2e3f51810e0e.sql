
-- Series table
CREATE TABLE public.series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  escola_id uuid NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  horario_inicio time DEFAULT '07:00',
  tolerancia_min integer DEFAULT 15,
  limite_max time DEFAULT '07:30',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read series" ON public.series
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Secretaria or Diretor can insert series" ON public.series
  FOR INSERT TO authenticated WITH CHECK (
    has_papel('SECRETARIA') OR has_papel('DIRETOR')
  );

CREATE POLICY "Secretaria or Diretor can update series" ON public.series
  FOR UPDATE TO authenticated USING (
    has_papel('SECRETARIA') OR has_papel('DIRETOR')
  );

CREATE POLICY "Secretaria can delete series" ON public.series
  FOR DELETE TO authenticated USING (has_papel('SECRETARIA'));

-- Turmas table
CREATE TABLE public.turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  serie_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  escola_id uuid NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  sala text,
  horario_inicio time,
  tolerancia_min integer,
  limite_max time,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read turmas" ON public.turmas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Secretaria or Diretor can insert turmas" ON public.turmas
  FOR INSERT TO authenticated WITH CHECK (
    has_papel('SECRETARIA') OR has_papel('DIRETOR')
  );

CREATE POLICY "Secretaria or Diretor can update turmas" ON public.turmas
  FOR UPDATE TO authenticated USING (
    has_papel('SECRETARIA') OR has_papel('DIRETOR')
  );

CREATE POLICY "Secretaria or Diretor can delete turmas" ON public.turmas
  FOR DELETE TO authenticated USING (
    has_papel('SECRETARIA') OR has_papel('DIRETOR')
  );

-- Turma-Professor junction
CREATE TABLE public.turma_professores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  professor_id uuid NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
  UNIQUE (turma_id, professor_id)
);

ALTER TABLE public.turma_professores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read turma_professores" ON public.turma_professores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Secretaria or Diretor can insert turma_professores" ON public.turma_professores
  FOR INSERT TO authenticated WITH CHECK (
    has_papel('SECRETARIA') OR has_papel('DIRETOR')
  );

CREATE POLICY "Secretaria or Diretor can delete turma_professores" ON public.turma_professores
  FOR DELETE TO authenticated USING (
    has_papel('SECRETARIA') OR has_papel('DIRETOR')
  );

-- Alunos table
CREATE TABLE public.alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo text NOT NULL,
  matricula text NOT NULL UNIQUE,
  data_nascimento date,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE SET NULL,
  escola_id uuid NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  responsavel_id uuid REFERENCES public.responsaveis(id) ON DELETE SET NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read alunos" ON public.alunos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Secretaria or Diretor can insert alunos" ON public.alunos
  FOR INSERT TO authenticated WITH CHECK (
    has_papel('SECRETARIA') OR has_papel('DIRETOR')
  );

CREATE POLICY "Secretaria or Diretor can update alunos" ON public.alunos
  FOR UPDATE TO authenticated USING (
    has_papel('SECRETARIA') OR has_papel('DIRETOR')
  );

CREATE POLICY "Secretaria can delete alunos" ON public.alunos
  FOR DELETE TO authenticated USING (has_papel('SECRETARIA'));

-- Grants
GRANT ALL ON public.series TO authenticated;
GRANT ALL ON public.turmas TO authenticated;
GRANT ALL ON public.turma_professores TO authenticated;
GRANT ALL ON public.alunos TO authenticated;

GRANT ALL ON public.series TO service_role;
GRANT ALL ON public.turmas TO service_role;
GRANT ALL ON public.turma_professores TO service_role;
GRANT ALL ON public.alunos TO service_role;
