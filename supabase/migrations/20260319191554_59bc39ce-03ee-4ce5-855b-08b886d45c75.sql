
-- Helper: get responsavel ID for current user
CREATE OR REPLACE FUNCTION public.get_meu_responsavel_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id FROM public.responsaveis r
  JOIN public.usuarios u ON u.id = r.usuario_id
  WHERE u.auth_id = auth.uid()
$$;

-- Helper: get professor ID for current user
CREATE OR REPLACE FUNCTION public.get_meu_professor_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id FROM public.professores p
  JOIN public.usuarios u ON u.id = p.usuario_id
  WHERE u.auth_id = auth.uid()
$$;

-- Helper: get escola_id for current diretor
CREATE OR REPLACE FUNCTION public.get_minha_escola_diretor()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT d.escola_id FROM public.diretores d
  JOIN public.usuarios u ON u.id = d.usuario_id
  WHERE u.auth_id = auth.uid()
$$;

-- ========== USUARIOS ==========
-- Remove anon read policy (exposes all user IDs to unauthenticated users)
DROP POLICY IF EXISTS "Anon can read usuarios for login" ON public.usuarios;
-- Replace broad authenticated read
DROP POLICY IF EXISTS "Authenticated can read usuarios" ON public.usuarios;
CREATE POLICY "Users can read own usuario" ON public.usuarios FOR SELECT TO authenticated
  USING (auth_id = auth.uid());
CREATE POLICY "Secretaria can read all usuarios" ON public.usuarios FOR SELECT TO authenticated
  USING (has_papel('SECRETARIA'));
CREATE POLICY "Diretor can read school usuarios" ON public.usuarios FOR SELECT TO authenticated
  USING (
    has_papel('DIRETOR') AND (
      id IN (
        SELECT d2.usuario_id FROM diretores d2 WHERE d2.escola_id = get_minha_escola_diretor()
      )
      OR id IN (
        SELECT p.usuario_id FROM professores p
        JOIN professor_escolas pe ON pe.professor_id = p.id
        WHERE pe.escola_id = get_minha_escola_diretor()
      )
      OR id IN (
        SELECT r.usuario_id FROM responsaveis r
        JOIN aluno_responsaveis ar ON ar.responsavel_id = r.id
        JOIN alunos a ON a.id = ar.aluno_id
        WHERE a.escola_id = get_minha_escola_diretor()
      )
    )
  );

-- ========== ALUNOS ==========
DROP POLICY IF EXISTS "Authenticated can read alunos" ON public.alunos;
CREATE POLICY "Secretaria can read all alunos" ON public.alunos FOR SELECT TO authenticated
  USING (has_papel('SECRETARIA'));
CREATE POLICY "Diretor can read school alunos" ON public.alunos FOR SELECT TO authenticated
  USING (has_papel('DIRETOR') AND escola_id = get_minha_escola_diretor());
CREATE POLICY "Professor can read own turma alunos" ON public.alunos FOR SELECT TO authenticated
  USING (has_papel('PROFESSOR') AND turma_id IN (
    SELECT tp.turma_id FROM turma_professores tp WHERE tp.professor_id = get_meu_professor_id()
  ));
CREATE POLICY "Responsavel can read own alunos" ON public.alunos FOR SELECT TO authenticated
  USING (has_papel('RESPONSAVEL') AND id IN (
    SELECT ar.aluno_id FROM aluno_responsaveis ar WHERE ar.responsavel_id = get_meu_responsavel_id()
  ));

-- ========== RESPONSAVEIS ==========
DROP POLICY IF EXISTS "Authenticated can read responsaveis" ON public.responsaveis;
CREATE POLICY "Secretaria can read all responsaveis" ON public.responsaveis FOR SELECT TO authenticated
  USING (has_papel('SECRETARIA'));
CREATE POLICY "Diretor can read school responsaveis" ON public.responsaveis FOR SELECT TO authenticated
  USING (has_papel('DIRETOR') AND id IN (
    SELECT ar.responsavel_id FROM aluno_responsaveis ar
    JOIN alunos a ON a.id = ar.aluno_id
    WHERE a.escola_id = get_minha_escola_diretor()
  ));
CREATE POLICY "Responsavel can read self" ON public.responsaveis FOR SELECT TO authenticated
  USING (has_papel('RESPONSAVEL') AND usuario_id = get_meu_usuario_id());

-- ========== ALUNO_RESPONSAVEIS ==========
DROP POLICY IF EXISTS "Authenticated can read aluno_responsaveis" ON public.aluno_responsaveis;
CREATE POLICY "Secretaria can read all aluno_responsaveis" ON public.aluno_responsaveis FOR SELECT TO authenticated
  USING (has_papel('SECRETARIA'));
CREATE POLICY "Diretor can read school aluno_responsaveis" ON public.aluno_responsaveis FOR SELECT TO authenticated
  USING (has_papel('DIRETOR') AND aluno_id IN (
    SELECT a.id FROM alunos a WHERE a.escola_id = get_minha_escola_diretor()
  ));
CREATE POLICY "Professor can read own turma aluno_responsaveis" ON public.aluno_responsaveis FOR SELECT TO authenticated
  USING (has_papel('PROFESSOR') AND aluno_id IN (
    SELECT a.id FROM alunos a
    JOIN turma_professores tp ON tp.turma_id = a.turma_id
    WHERE tp.professor_id = get_meu_professor_id()
  ));
CREATE POLICY "Responsavel can read own aluno_responsaveis" ON public.aluno_responsaveis FOR SELECT TO authenticated
  USING (has_papel('RESPONSAVEL') AND responsavel_id = get_meu_responsavel_id());

-- ========== DIRETORES ==========
DROP POLICY IF EXISTS "Authenticated can read diretores" ON public.diretores;
CREATE POLICY "Secretaria can read all diretores" ON public.diretores FOR SELECT TO authenticated
  USING (has_papel('SECRETARIA'));
CREATE POLICY "Diretor can read self" ON public.diretores FOR SELECT TO authenticated
  USING (has_papel('DIRETOR') AND usuario_id = get_meu_usuario_id());

-- ========== PROFESSORES ==========
DROP POLICY IF EXISTS "Authenticated can read professores" ON public.professores;
CREATE POLICY "Secretaria can read all professores" ON public.professores FOR SELECT TO authenticated
  USING (has_papel('SECRETARIA'));
CREATE POLICY "Diretor can read school professores" ON public.professores FOR SELECT TO authenticated
  USING (has_papel('DIRETOR') AND id IN (
    SELECT pe.professor_id FROM professor_escolas pe WHERE pe.escola_id = get_minha_escola_diretor()
  ));
CREATE POLICY "Professor can read self" ON public.professores FOR SELECT TO authenticated
  USING (has_papel('PROFESSOR') AND usuario_id = get_meu_usuario_id());

-- ========== PROFESSOR_ESCOLAS ==========
DROP POLICY IF EXISTS "Authenticated can read professor_escolas" ON public.professor_escolas;
CREATE POLICY "Secretaria can read all professor_escolas" ON public.professor_escolas FOR SELECT TO authenticated
  USING (has_papel('SECRETARIA'));
CREATE POLICY "Diretor can read school professor_escolas" ON public.professor_escolas FOR SELECT TO authenticated
  USING (has_papel('DIRETOR') AND escola_id = get_minha_escola_diretor());
CREATE POLICY "Professor can read own professor_escolas" ON public.professor_escolas FOR SELECT TO authenticated
  USING (has_papel('PROFESSOR') AND professor_id = get_meu_professor_id());

-- ========== SERIES ==========
DROP POLICY IF EXISTS "Authenticated can read series" ON public.series;
CREATE POLICY "Secretaria can read all series" ON public.series FOR SELECT TO authenticated
  USING (has_papel('SECRETARIA'));
CREATE POLICY "Diretor can read school series" ON public.series FOR SELECT TO authenticated
  USING (has_papel('DIRETOR') AND escola_id = get_minha_escola_diretor());
CREATE POLICY "Professor can read school series" ON public.series FOR SELECT TO authenticated
  USING (has_papel('PROFESSOR') AND escola_id IN (
    SELECT pe.escola_id FROM professor_escolas pe WHERE pe.professor_id = get_meu_professor_id()
  ));

-- ========== TURMAS ==========
DROP POLICY IF EXISTS "Authenticated can read turmas" ON public.turmas;
CREATE POLICY "Secretaria can read all turmas" ON public.turmas FOR SELECT TO authenticated
  USING (has_papel('SECRETARIA'));
CREATE POLICY "Diretor can read school turmas" ON public.turmas FOR SELECT TO authenticated
  USING (has_papel('DIRETOR') AND escola_id = get_minha_escola_diretor());
CREATE POLICY "Professor can read own turmas" ON public.turmas FOR SELECT TO authenticated
  USING (has_papel('PROFESSOR') AND id IN (
    SELECT tp.turma_id FROM turma_professores tp WHERE tp.professor_id = get_meu_professor_id()
  ));

-- ========== TURMA_PROFESSORES ==========
DROP POLICY IF EXISTS "Authenticated can read turma_professores" ON public.turma_professores;
CREATE POLICY "Secretaria can read all turma_professores" ON public.turma_professores FOR SELECT TO authenticated
  USING (has_papel('SECRETARIA'));
CREATE POLICY "Diretor can read school turma_professores" ON public.turma_professores FOR SELECT TO authenticated
  USING (has_papel('DIRETOR') AND turma_id IN (
    SELECT t.id FROM turmas t WHERE t.escola_id = get_minha_escola_diretor()
  ));
CREATE POLICY "Professor can read own turma_professores" ON public.turma_professores FOR SELECT TO authenticated
  USING (has_papel('PROFESSOR') AND professor_id = get_meu_professor_id());

-- ========== ALUNO_TURMA_HISTORICO ==========
DROP POLICY IF EXISTS "Authenticated can read aluno_turma_historico" ON public.aluno_turma_historico;
CREATE POLICY "Secretaria can read all aluno_turma_historico" ON public.aluno_turma_historico FOR SELECT TO authenticated
  USING (has_papel('SECRETARIA'));
CREATE POLICY "Diretor can read school aluno_turma_historico" ON public.aluno_turma_historico FOR SELECT TO authenticated
  USING (has_papel('DIRETOR') AND aluno_id IN (
    SELECT a.id FROM alunos a WHERE a.escola_id = get_minha_escola_diretor()
  ));
CREATE POLICY "Professor can read own turma aluno_turma_historico" ON public.aluno_turma_historico FOR SELECT TO authenticated
  USING (has_papel('PROFESSOR') AND aluno_id IN (
    SELECT a.id FROM alunos a
    JOIN turma_professores tp ON tp.turma_id = a.turma_id
    WHERE tp.professor_id = get_meu_professor_id()
  ));
CREATE POLICY "Responsavel can read own aluno_turma_historico" ON public.aluno_turma_historico FOR SELECT TO authenticated
  USING (has_papel('RESPONSAVEL') AND aluno_id IN (
    SELECT ar.aluno_id FROM aluno_responsaveis ar WHERE ar.responsavel_id = get_meu_responsavel_id()
  ));

-- ========== ESCOLAS (keep broad - non-sensitive) ==========
-- Escolas stay readable by all authenticated users (school names/addresses are not sensitive)
