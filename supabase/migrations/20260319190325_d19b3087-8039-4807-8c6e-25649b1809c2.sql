
-- Tighten INSERT/UPDATE policies to match app security pattern
DROP POLICY "System can insert aluno_turma_historico" ON public.aluno_turma_historico;
DROP POLICY "System can update aluno_turma_historico" ON public.aluno_turma_historico;

CREATE POLICY "Secretaria or Diretor can insert aluno_turma_historico"
  ON public.aluno_turma_historico FOR INSERT TO authenticated
  WITH CHECK (has_papel('SECRETARIA') OR has_papel('DIRETOR'));

CREATE POLICY "Secretaria or Diretor can update aluno_turma_historico"
  ON public.aluno_turma_historico FOR UPDATE TO authenticated
  USING (has_papel('SECRETARIA') OR has_papel('DIRETOR'));
