
-- Grant authenticated role proper table permissions
GRANT SELECT ON public.usuarios TO authenticated;
GRANT INSERT ON public.usuarios TO authenticated;
GRANT UPDATE ON public.usuarios TO authenticated;

GRANT SELECT ON public.escolas TO authenticated;
GRANT INSERT ON public.escolas TO authenticated;
GRANT UPDATE ON public.escolas TO authenticated;
GRANT DELETE ON public.escolas TO authenticated;

GRANT SELECT ON public.diretores TO authenticated;
GRANT INSERT ON public.diretores TO authenticated;
GRANT UPDATE ON public.diretores TO authenticated;
GRANT DELETE ON public.diretores TO authenticated;

GRANT SELECT ON public.professores TO authenticated;
GRANT INSERT ON public.professores TO authenticated;
GRANT UPDATE ON public.professores TO authenticated;
GRANT DELETE ON public.professores TO authenticated;

GRANT SELECT ON public.professor_escolas TO authenticated;
GRANT INSERT ON public.professor_escolas TO authenticated;
GRANT DELETE ON public.professor_escolas TO authenticated;

GRANT SELECT ON public.responsaveis TO authenticated;
GRANT INSERT ON public.responsaveis TO authenticated;
GRANT UPDATE ON public.responsaveis TO authenticated;
GRANT DELETE ON public.responsaveis TO authenticated;
