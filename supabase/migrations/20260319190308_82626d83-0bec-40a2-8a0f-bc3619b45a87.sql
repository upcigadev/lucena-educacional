
-- Table to store turma change history for students
CREATE TABLE public.aluno_turma_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE SET NULL,
  turma_nome text NOT NULL,
  serie_nome text,
  data_inicio timestamp with time zone NOT NULL DEFAULT now(),
  data_fim timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.aluno_turma_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read aluno_turma_historico"
  ON public.aluno_turma_historico FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "System can insert aluno_turma_historico"
  ON public.aluno_turma_historico FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update aluno_turma_historico"
  ON public.aluno_turma_historico FOR UPDATE TO authenticated
  USING (true);

-- Trigger function: when turma_id changes on alunos, close old record and open new one
CREATE OR REPLACE FUNCTION public.registrar_historico_turma()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_turma_nome text;
  v_serie_nome text;
BEGIN
  -- Skip if turma didn't change
  IF OLD.turma_id IS NOT DISTINCT FROM NEW.turma_id THEN
    RETURN NEW;
  END IF;

  -- Close previous history record
  IF OLD.turma_id IS NOT NULL THEN
    UPDATE public.aluno_turma_historico
    SET data_fim = now()
    WHERE aluno_id = NEW.id
      AND turma_id = OLD.turma_id
      AND data_fim IS NULL;
  END IF;

  -- Open new history record
  IF NEW.turma_id IS NOT NULL THEN
    SELECT t.nome, s.nome INTO v_turma_nome, v_serie_nome
    FROM public.turmas t
    LEFT JOIN public.series s ON s.id = t.serie_id
    WHERE t.id = NEW.turma_id;

    INSERT INTO public.aluno_turma_historico (aluno_id, turma_id, turma_nome, serie_nome)
    VALUES (NEW.id, NEW.turma_id, COALESCE(v_turma_nome, ''), v_serie_nome);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_registrar_historico_turma
  AFTER UPDATE OF turma_id ON public.alunos
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_historico_turma();
