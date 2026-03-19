
-- Add auth_id column to usuarios table
ALTER TABLE public.usuarios ADD COLUMN auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_usuarios_auth_id ON public.usuarios(auth_id);
CREATE INDEX idx_usuarios_cpf ON public.usuarios(cpf);
