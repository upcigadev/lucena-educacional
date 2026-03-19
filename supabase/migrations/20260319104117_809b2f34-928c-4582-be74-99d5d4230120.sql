
-- Helper: get current user's papel without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_meu_papel()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT papel FROM public.usuarios WHERE auth_id = auth.uid()
$$;

-- Helper: check if current user has a specific papel
CREATE OR REPLACE FUNCTION public.has_papel(_papel TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid() AND papel = _papel
  )
$$;

-- Helper: get current usuario id
CREATE OR REPLACE FUNCTION public.get_meu_usuario_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.usuarios WHERE auth_id = auth.uid()
$$;

-- ===================== ESCOLAS =====================
DROP POLICY IF EXISTS "Anyone can read escolas" ON public.escolas;
DROP POLICY IF EXISTS "Anyone can insert escolas" ON public.escolas;
DROP POLICY IF EXISTS "Anyone can update escolas" ON public.escolas;

-- All authenticated can read
CREATE POLICY "Authenticated can read escolas" ON public.escolas
  FOR SELECT TO authenticated USING (true);

-- Only SECRETARIA can insert
CREATE POLICY "Secretaria can insert escolas" ON public.escolas
  FOR INSERT TO authenticated WITH CHECK (public.has_papel('SECRETARIA'));

-- Only SECRETARIA can update
CREATE POLICY "Secretaria can update escolas" ON public.escolas
  FOR UPDATE TO authenticated USING (public.has_papel('SECRETARIA'));

-- Only SECRETARIA can delete
CREATE POLICY "Secretaria can delete escolas" ON public.escolas
  FOR DELETE TO authenticated USING (public.has_papel('SECRETARIA'));

-- ===================== USUARIOS =====================
DROP POLICY IF EXISTS "Anyone can read usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Anyone can insert usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Anyone can update usuarios" ON public.usuarios;

-- All authenticated can read (needed for lookups)
CREATE POLICY "Authenticated can read usuarios" ON public.usuarios
  FOR SELECT TO authenticated USING (true);

-- Anon can read usuarios (needed for CPF lookup during login)
CREATE POLICY "Anon can read usuarios for login" ON public.usuarios
  FOR SELECT TO anon USING (true);

-- Only SECRETARIA can insert
CREATE POLICY "Secretaria can insert usuarios" ON public.usuarios
  FOR INSERT TO authenticated WITH CHECK (public.has_papel('SECRETARIA'));

-- SECRETARIA can update any; others can update own
CREATE POLICY "Secretaria or self can update usuarios" ON public.usuarios
  FOR UPDATE TO authenticated USING (
    public.has_papel('SECRETARIA') OR auth_id = auth.uid()
  );

-- ===================== DIRETORES =====================
DROP POLICY IF EXISTS "Anyone can read diretores" ON public.diretores;
DROP POLICY IF EXISTS "Anyone can insert diretores" ON public.diretores;
DROP POLICY IF EXISTS "Anyone can update diretores" ON public.diretores;
DROP POLICY IF EXISTS "Anyone can delete diretores" ON public.diretores;

CREATE POLICY "Authenticated can read diretores" ON public.diretores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Secretaria can insert diretores" ON public.diretores
  FOR INSERT TO authenticated WITH CHECK (public.has_papel('SECRETARIA'));

CREATE POLICY "Secretaria can update diretores" ON public.diretores
  FOR UPDATE TO authenticated USING (public.has_papel('SECRETARIA'));

CREATE POLICY "Secretaria can delete diretores" ON public.diretores
  FOR DELETE TO authenticated USING (public.has_papel('SECRETARIA'));

-- ===================== PROFESSORES =====================
DROP POLICY IF EXISTS "Anyone can read professores" ON public.professores;
DROP POLICY IF EXISTS "Anyone can insert professores" ON public.professores;
DROP POLICY IF EXISTS "Anyone can update professores" ON public.professores;
DROP POLICY IF EXISTS "Anyone can delete professores" ON public.professores;

CREATE POLICY "Authenticated can read professores" ON public.professores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Secretaria can insert professores" ON public.professores
  FOR INSERT TO authenticated WITH CHECK (public.has_papel('SECRETARIA'));

CREATE POLICY "Secretaria can update professores" ON public.professores
  FOR UPDATE TO authenticated USING (public.has_papel('SECRETARIA'));

CREATE POLICY "Secretaria can delete professores" ON public.professores
  FOR DELETE TO authenticated USING (public.has_papel('SECRETARIA'));

-- ===================== PROFESSOR_ESCOLAS =====================
DROP POLICY IF EXISTS "Anyone can read professor_escolas" ON public.professor_escolas;
DROP POLICY IF EXISTS "Anyone can insert professor_escolas" ON public.professor_escolas;
DROP POLICY IF EXISTS "Anyone can delete professor_escolas" ON public.professor_escolas;

CREATE POLICY "Authenticated can read professor_escolas" ON public.professor_escolas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Secretaria can insert professor_escolas" ON public.professor_escolas
  FOR INSERT TO authenticated WITH CHECK (public.has_papel('SECRETARIA'));

CREATE POLICY "Secretaria can delete professor_escolas" ON public.professor_escolas
  FOR DELETE TO authenticated USING (public.has_papel('SECRETARIA'));

-- ===================== RESPONSAVEIS =====================
DROP POLICY IF EXISTS "Anyone can read responsaveis" ON public.responsaveis;
DROP POLICY IF EXISTS "Anyone can insert responsaveis" ON public.responsaveis;
DROP POLICY IF EXISTS "Anyone can update responsaveis" ON public.responsaveis;
DROP POLICY IF EXISTS "Anyone can delete responsaveis" ON public.responsaveis;

CREATE POLICY "Authenticated can read responsaveis" ON public.responsaveis
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Secretaria can insert responsaveis" ON public.responsaveis
  FOR INSERT TO authenticated WITH CHECK (public.has_papel('SECRETARIA'));

CREATE POLICY "Secretaria or self can update responsaveis" ON public.responsaveis
  FOR UPDATE TO authenticated USING (
    public.has_papel('SECRETARIA') OR usuario_id = public.get_meu_usuario_id()
  );

CREATE POLICY "Secretaria can delete responsaveis" ON public.responsaveis
  FOR DELETE TO authenticated USING (public.has_papel('SECRETARIA'));
