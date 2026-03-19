
-- Create junction table for many-to-many relationship between alunos and responsaveis
CREATE TABLE public.aluno_responsaveis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  responsavel_id uuid NOT NULL REFERENCES public.responsaveis(id) ON DELETE CASCADE,
  parentesco text DEFAULT 'Responsável',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, responsavel_id)
);

-- Migrate existing data from alunos.responsavel_id to the new table
INSERT INTO public.aluno_responsaveis (aluno_id, responsavel_id)
SELECT id, responsavel_id FROM public.alunos WHERE responsavel_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.aluno_responsaveis ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated can read aluno_responsaveis" ON public.aluno_responsaveis
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Secretaria or Diretor can insert aluno_responsaveis" ON public.aluno_responsaveis
  FOR INSERT TO authenticated WITH CHECK (has_papel('SECRETARIA') OR has_papel('DIRETOR'));

CREATE POLICY "Secretaria or Diretor can update aluno_responsaveis" ON public.aluno_responsaveis
  FOR UPDATE TO authenticated USING (has_papel('SECRETARIA') OR has_papel('DIRETOR'));

CREATE POLICY "Secretaria can delete aluno_responsaveis" ON public.aluno_responsaveis
  FOR DELETE TO authenticated USING (has_papel('SECRETARIA'));
