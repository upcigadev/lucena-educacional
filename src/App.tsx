import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";

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

// Secretaria
import PainelEscolasSecretaria from "./pages/secretaria/PainelEscolasSecretaria";
import EscolaDetalheSecretaria from "./pages/secretaria/EscolaDetalheSecretaria";
import GestaoDiretores from "./pages/secretaria/GestaoDiretores";
import GestaoProfessoresSecretaria from "./pages/secretaria/GestaoProfessoresSecretaria";
import GestaoResponsaveis from "./pages/secretaria/GestaoResponsaveis";
import GestaoAlunosSecretaria from "./pages/secretaria/GestaoAlunosSecretaria";
import JustificativasGlobais from "./pages/secretaria/JustificativasGlobais";
import DetalheTurmaSecretaria from "./pages/secretaria/DetalheTurmaSecretaria";

const queryClient = new QueryClient();

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { perfil } = useAuth();
  if (!perfil) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { perfil } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={perfil ? <Navigate to={`/${perfil}`} replace /> : <Navigate to="/login" replace />} />

      {/* Responsável */}
      <Route path="/responsavel" element={<ProtectedLayout><PainelDependentes /></ProtectedLayout>} />
      <Route path="/responsavel/filho/:id" element={<ProtectedLayout><DetalheFilho /></ProtectedLayout>} />
      <Route path="/responsavel/notificacoes" element={<ProtectedLayout><NotificacoesResponsavel /></ProtectedLayout>} />
      <Route path="/responsavel/justificativas" element={<ProtectedLayout><JustificativasResponsavel /></ProtectedLayout>} />
      <Route path="/responsavel/meus-dados" element={<ProtectedLayout><MeusDadosResponsavel /></ProtectedLayout>} />

      {/* Professor */}
      <Route path="/professor" element={<ProtectedLayout><PainelEscolasProfessor /></ProtectedLayout>} />
      <Route path="/professor/escola/:escolaId" element={<ProtectedLayout><TurmasEscola /></ProtectedLayout>} />
      <Route path="/professor/escola/:escolaId/turma/:turmaId" element={<ProtectedLayout><FrequenciaTurma /></ProtectedLayout>} />
      <Route path="/professor/alunos" element={<ProtectedLayout><ListaAlunos /></ProtectedLayout>} />
      <Route path="/professor/aluno/:id" element={<ProtectedLayout><DetalheAlunoProfessor /></ProtectedLayout>} />
      <Route path="/professor/meus-dados" element={<ProtectedLayout><MeusDadosProfessor /></ProtectedLayout>} />

      {/* Diretor */}
      <Route path="/diretor" element={<ProtectedLayout><PainelEscolaDiretor /></ProtectedLayout>} />
      <Route path="/diretor/escola/:escolaId" element={<ProtectedLayout><PainelEscolaDiretor /></ProtectedLayout>} />
      <Route path="/diretor/serie/:serieId" element={<ProtectedLayout><TurmasSerie /></ProtectedLayout>} />
      <Route path="/diretor/turma/:turmaId" element={<ProtectedLayout><DetalheTurma /></ProtectedLayout>} />
      <Route path="/diretor/justificativas" element={<ProtectedLayout><JustificativasDiretor /></ProtectedLayout>} />
      <Route path="/diretor/alunos" element={<ProtectedLayout><GestaoAlunosDiretor /></ProtectedLayout>} />
      <Route path="/diretor/aluno/:id" element={<ProtectedLayout><DetalheAlunoDiretor /></ProtectedLayout>} />
      <Route path="/diretor/novo-aluno" element={<ProtectedLayout><NovoAluno /></ProtectedLayout>} />
      <Route path="/diretor/turmas" element={<ProtectedLayout><GestaoTurmas /></ProtectedLayout>} />
      <Route path="/diretor/professores" element={<ProtectedLayout><ProfessoresDiretor /></ProtectedLayout>} />
      <Route path="/diretor/responsaveis" element={<ProtectedLayout><ResponsaveisDiretor /></ProtectedLayout>} />
      <Route path="/diretor/configuracoes" element={<ProtectedLayout><ConfiguracoesEscola /></ProtectedLayout>} />
      <Route path="/diretor/meus-dados" element={<ProtectedLayout><MeusDadosDiretor /></ProtectedLayout>} />

      {/* Secretaria */}
      <Route path="/secretaria" element={<ProtectedLayout><PainelEscolasSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/escola/:escolaId" element={<ProtectedLayout><EscolaDetalheSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/escola/:escolaId/turma/:turmaId" element={<ProtectedLayout><DetalheTurmaSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/diretores" element={<ProtectedLayout><GestaoDiretores /></ProtectedLayout>} />
      <Route path="/secretaria/professores" element={<ProtectedLayout><GestaoProfessoresSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/responsaveis" element={<ProtectedLayout><GestaoResponsaveis /></ProtectedLayout>} />
      <Route path="/secretaria/alunos" element={<ProtectedLayout><GestaoAlunosSecretaria /></ProtectedLayout>} />
      <Route path="/secretaria/justificativas" element={<ProtectedLayout><JustificativasGlobais /></ProtectedLayout>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
