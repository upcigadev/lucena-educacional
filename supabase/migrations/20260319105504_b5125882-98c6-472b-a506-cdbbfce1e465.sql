
-- Grant service_role full access to all tables (needed for edge functions)
GRANT ALL ON public.usuarios TO service_role;
GRANT ALL ON public.escolas TO service_role;
GRANT ALL ON public.diretores TO service_role;
GRANT ALL ON public.professores TO service_role;
GRANT ALL ON public.professor_escolas TO service_role;
GRANT ALL ON public.responsaveis TO service_role;
