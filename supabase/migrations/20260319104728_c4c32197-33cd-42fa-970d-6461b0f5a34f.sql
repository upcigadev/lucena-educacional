
-- Seed: create initial Secretaria user directly
-- First insert the usuario
INSERT INTO public.usuarios (nome, cpf, papel, email)
VALUES ('Administrador Secretaria', '000.000.000-00', 'SECRETARIA', 'secretaria@lucena.edu.br')
ON CONFLICT (cpf) DO NOTHING;
