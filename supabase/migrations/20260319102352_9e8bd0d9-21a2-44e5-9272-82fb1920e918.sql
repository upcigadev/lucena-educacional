
-- Escolas
CREATE TABLE public.escolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  inep TEXT UNIQUE,
  endereco TEXT,
  telefone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read escolas" ON public.escolas FOR SELECT USING (true);
CREATE POLICY "Anyone can insert escolas" ON public.escolas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update escolas" ON public.escolas FOR UPDATE USING (true);

-- Usuarios
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  papel TEXT NOT NULL CHECK (papel IN ('SECRETARIA', 'DIRETOR', 'PROFESSOR', 'RESPONSAVEL')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read usuarios" ON public.usuarios FOR SELECT USING (true);
CREATE POLICY "Anyone can insert usuarios" ON public.usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update usuarios" ON public.usuarios FOR UPDATE USING (true);

-- Diretores
CREATE TABLE public.diretores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  escola_id UUID NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  UNIQUE(usuario_id)
);

ALTER TABLE public.diretores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read diretores" ON public.diretores FOR SELECT USING (true);
CREATE POLICY "Anyone can insert diretores" ON public.diretores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update diretores" ON public.diretores FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete diretores" ON public.diretores FOR DELETE USING (true);

-- Professores
CREATE TABLE public.professores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  UNIQUE(usuario_id)
);

ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read professores" ON public.professores FOR SELECT USING (true);
CREATE POLICY "Anyone can insert professores" ON public.professores FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update professores" ON public.professores FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete professores" ON public.professores FOR DELETE USING (true);

-- Professor-Escola link (many-to-many)
CREATE TABLE public.professor_escolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
  escola_id UUID NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  UNIQUE(professor_id, escola_id)
);

ALTER TABLE public.professor_escolas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read professor_escolas" ON public.professor_escolas FOR SELECT USING (true);
CREATE POLICY "Anyone can insert professor_escolas" ON public.professor_escolas FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete professor_escolas" ON public.professor_escolas FOR DELETE USING (true);

-- Responsaveis
CREATE TABLE public.responsaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  telefone TEXT,
  UNIQUE(usuario_id)
);

ALTER TABLE public.responsaveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read responsaveis" ON public.responsaveis FOR SELECT USING (true);
CREATE POLICY "Anyone can insert responsaveis" ON public.responsaveis FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update responsaveis" ON public.responsaveis FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete responsaveis" ON public.responsaveis FOR DELETE USING (true);
