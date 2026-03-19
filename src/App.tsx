import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, type PerfilUsuario } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Responsável
import PainelDependentes from "./pages/responsavel/PainelDependentes";
import DetalheFilho from "./pages/responsavel/DetalheFilho";
import JustificativasResponsavel from "./pages/responsavel/JustificativasResponsavel";
import MeusDadosResponsavel from "./pages/responsavel/MeusDadosResponsavel";
import NotificacoesResponsavel from "./pages/responsavel/NotificacoesResponsavel";

// Professor
import PainelEscolasProfessor from "./pages/professor/PainelEscolasProfessor";
import TurmasEscola from "./pages/professor/TurmasEscola";
import FrequenciaTurma from "./pages/professor/FrequenciaTurma";
import ListaAlunos from "./pages/professor/ListaAlunos";
import DetalheAlunoProfessor from "./pages/professor/DetalheAlunoProfessor";
import MeusDadosProfessor from "./pages/professor/MeusDadosProfessor";
import RelatoriosProfessor from "./pages/professor/RelatoriosProfessor";

// Diretor
import PainelEscolaDiretor from "./pages/diretor/PainelEscolaDiretor";
import TurmasSerie from "./pages/diretor/TurmasSerie";
import DetalheTurma from "./pages/diretor/DetalheTurma";
import JustificativasDiretor from "./pages/diretor/JustificativasDiretor";
import GestaoAlunosDiretor from "./pages/diretor/GestaoAlunosDiretor";
import DetalheAlunoDiretor from "./pages/diretor/DetalheAlunoDiretor";
import NovoAluno from "./pages/diretor/NovoAluno";
import GestaoTurmas from "./pages/diretor/GestaoTurmas";
import ProfessoresDiretor from "./pages/diretor/ProfessoresDiretor";
import ConfiguracoesEscola from "./pages/diretor/ConfiguracoesEscola";
import MeusDadosDiretor from "./pages/diretor/MeusDadosDiretor";
import ResponsaveisDiretor from "./pages/diretor/ResponsaveisDiretor";
import RelatoriosDiretor from "./pages/diretor/RelatoriosDiretor";

// Secretaria
import PainelEscolasSecretaria from "./pages/secretaria/PainelEscolasSecretaria";
import EscolaDetalheSecretaria from "./pages/secretaria/EscolaDetalheSecretaria";
import GestaoDiretores from "./pages/secretaria/GestaoDiretores";
import GestaoProfessoresSecretaria from "./pages/secretaria/GestaoProfessoresSecretaria";
import GestaoResponsaveis from "./pages/secretaria/GestaoResponsaveis";
import GestaoAlunosSecretaria from "./pages/secretaria/GestaoAlunosSecretaria";
import NovoAlunoSecretaria from "./pages/secretaria/NovoAlunoSecretaria";
import JustificativasGlobais from "./pages/secretaria/JustificativasGlobais";
import DetalheTurmaSecretaria from "./pages/secretaria/DetalheTurmaSecretaria";
import TurmasSerieSecretaria from "./pages/secretaria/TurmasSerieSecretaria";
import DetalheAlunoSecretaria from "./pages/secretaria/DetalheAlunoSecretaria";
import RelatoriosSecretaria from "./pages/secretaria/RelatoriosSecretaria";

const queryClient = new QueryClient();

function ProtectedLayout({ children, allowedPerfis }: { children: React.ReactNode; allowedPerfis?: PerfilUsuario[] }) {
  const { perfil, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!perfil) return <Navigate to="/login" replace />;
  if (allowedPerfis && !allowedPerfis.includes(perfil)) return <Navigate to={`/${perfil}`} replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { perfil, loading } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        loading ? (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : perfil ? <Navigate to={`/${perfil}`} replace /> : <Login />
      } />
      <Route path="/" element={
        loading ? (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : perfil ? <Navigate to={`/${perfil}`} replace /> : <Navigate to="/login" replace />
      } />

      {/* Responsável */}
      <Route path="/responsavel" element={<ProtectedLayout allowedPerfis={['responsavel']}><PainelDependentes /></ProtectedLayout>} />
      <Route path="/responsavel/filho/:id" element={<ProtectedLayout allowedPerfis={['responsavel']}><DetalheFilho /></ProtectedLayout>} />
      <Route path="/responsavel/notificacoes" element={<ProtectedLayout allowedPerfis={['responsavel']}><NotificacoesResponsavel /></ProtectedLayout>} />
      <Route path="/responsavel/justificativas" element={<ProtectedLayout allowedPerfis={['responsavel']}><JustificativasResponsavel /></ProtectedLayout>} />
      <Route path="/responsavel/meus-dados" element={<ProtectedLayout allowedPerfis={['responsavel']}><MeusDadosResponsavel /></ProtectedLayout>} />

      {/* Professor */}
      <Route path="/professor" element={<ProtectedLayout allowedPerfis={['professor']}><PainelEscolasProfessor /></ProtectedLayout>} />
      <Route path="/professor/escola/:escolaId" element={<ProtectedLayout allowedPerfis={['professor']}><TurmasEscola /></ProtectedLayout>} />
      <Route path="/professor/escola/:escolaId/turma/:turmaId" element={<ProtectedLayout allowedPerfis={['professor']}><FrequenciaTurma /></ProtectedLayout>} />
      <Route path="/professor/alunos" element={<ProtectedLayout allowedPerfis={['professor']}><ListaAlunos /></ProtectedLayout>} />
      <Route path="/professor/aluno/:id" element={<ProtectedLayout allowedPerfis={['professor']}><DetalheAlunoProfessor /></ProtectedLayout>} />
      <Route path="/professor/meus-dados" element={<ProtectedLayout allowedPerfis={['professor']}><MeusDadosProfessor /></ProtectedLayout>} />
      <Route path="/professor/relatorios" element={<ProtectedLayout allowedPerfis={['professor']}><RelatoriosProfessor /></ProtectedLayout>} />

      {/* Diretor */}
      <Route path="/diretor" element={<ProtectedLayout allowedPerfis={['diretor']}><PainelEscolaDiretor /></ProtectedLayout>} />
      <Route path="/diretor/escola/:escolaId" element={<ProtectedLayout allowedPerfis={['diretor']}><PainelEscolaDiretor /></ProtectedLayout>} />
      <Route path="/diretor/serie/:serieId" element={<ProtectedLayout allowedPerfis={['diretor']}><TurmasSerie /></ProtectedLayout>} />
      <Route path="/diretor/turma/:turmaId" element={<ProtectedLayout allowedPerfis={['diretor']}><DetalheTurma /></ProtectedLayout>} />
      <Route path="/diretor/justificativas" element={<ProtectedLayout allowedPerfis={['diretor']}><JustificativasDiretor /></ProtectedLayout>} />
      <Route path="/diretor/alunos" element={<ProtectedLayout allowedPerfis={['diretor']}><GestaoAlunosDiretor /></ProtectedLayout>} />
      <Route path="/diretor/aluno/:id" element={<ProtectedLayout allowedPerfis={['diretor']}><DetalheAlunoDiretor /></ProtectedLayout>} />
      <Route path="/diretor/novo-aluno" element={<ProtectedLayout allowedPerfis={['diretor']}><NovoAluno /></ProtectedLayout>} />
      <Route path="/diretor/turmas" element={<ProtectedLayout allowedPerfis={['diretor']}><GestaoTurmas /></ProtectedLayout>} />
      <Route path="/diretor/professores" element={<ProtectedLayout allowedPerfis={['diretor']}><ProfessoresDiretor /></ProtectedLayout>} />
      <Route path="/diretor/responsaveis" element={<ProtectedLayout allowedPerfis={['diretor']}><ResponsaveisDiretor /></ProtectedLayout>} />
      <Route path="/diretor/configuracoes" element={<ProtectedLayout allowedPerfis={['diretor']}><ConfiguracoesEscola /></ProtectedLayout>} />
      <Route path="/diretor/meus-dados" element={<ProtectedLayout allowedPerfis={['diretor']}><MeusDadosDiretor /></ProtectedLayout>} />
      <Route path="/diretor/relatorios" element={<ProtectedLayout allowedPerfis={['diretor']}><RelatoriosDiretor /></ProtectedLayout>} />

      {/* Secretaria */}
      <Route path="/secretaria" element={<ProtectedLayout allowedPerfis={['secretaria']}><PainelEscolasSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/escola/:escolaId" element={<ProtectedLayout allowedPerfis={['secretaria']}><EscolaDetalheSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/escola/:escolaId/serie/:serieId" element={<ProtectedLayout allowedPerfis={['secretaria']}><TurmasSerieSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/escola/:escolaId/turma/:turmaId" element={<ProtectedLayout allowedPerfis={['secretaria']}><DetalheTurmaSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/diretores" element={<ProtectedLayout allowedPerfis={['secretaria']}><GestaoDiretores /></ProtectedLayout>} />
      <Route path="/secretaria/professores" element={<ProtectedLayout allowedPerfis={['secretaria']}><GestaoProfessoresSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/responsaveis" element={<ProtectedLayout allowedPerfis={['secretaria']}><GestaoResponsaveis /></ProtectedLayout>} />
      <Route path="/secretaria/alunos" element={<ProtectedLayout allowedPerfis={['secretaria']}><GestaoAlunosSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/novo-aluno" element={<ProtectedLayout allowedPerfis={['secretaria']}><NovoAlunoSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/justificativas" element={<ProtectedLayout allowedPerfis={['secretaria']}><JustificativasGlobais /></ProtectedLayout>} />
      <Route path="/secretaria/aluno/:id" element={<ProtectedLayout allowedPerfis={['secretaria']}><DetalheAlunoSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/relatorios" element={<ProtectedLayout allowedPerfis={['secretaria']}><RelatoriosSecretaria /></ProtectedLayout>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  useEffect(() => {
    if (window.api && window.api.onNovaFrequencia) {
      window.api.onNovaFrequencia((data: any) => {
        toast(`Frequência Registrada: ${data.aluno?.nome} - ${data.status}`, {
          description: `Novo acesso no iDFace.`,
        });
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
