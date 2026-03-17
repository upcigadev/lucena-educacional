import { useParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { alunos, turmas, series, escolas, responsaveis, justificativas, gerarFrequencia, getResponsaveisByAluno, professores } from '@/data/mockData';
import { AttendanceCalendar } from '@/components/AttendanceCalendar';
import { ArrowLeft, Pencil, Save, X, Search, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';

export default function DetalheAlunoSecretaria() {
  const { id } = useParams();
  const aluno = alunos.find(a => a.id === id);

  // Editable state
  const [turmaId, setTurmaId] = useState(aluno?.turmaId || '');
  const [responsaveisIds, setResponsaveisIds] = useState<string[]>(aluno?.responsavelIds || []);

  // Vincular responsável modal
  const [vincularModalOpen, setVincularModalOpen] = useState(false);
  const [buscaResp, setBuscaResp] = useState('');

  if (!aluno) return <div>Aluno não encontrado</div>;

  const freq = gerarFrequencia(aluno.id, aluno.frequenciaEntrada, aluno.frequenciaTurma);
  const respsVinculados = responsaveis.filter(r => responsaveisIds.includes(r.id));
  const justificativasAluno = justificativas.filter(j => j.alunoId === aluno.id);

  const turmaAtual = turmas.find(t => t.id === turmaId);
  const escolaAtual = escolas.find(e => e.id === aluno.escolaId);
  const seriesEscola = series.filter(s => s.escolaId === aluno.escolaId);
  const turmasDisponiveis = turmas.filter(t => t.escolaId === aluno.escolaId);

  // Responsáveis não vinculados para busca
  const respsDisponiveis = useMemo(() => {
    return responsaveis.filter(r =>
      !responsaveisIds.includes(r.id) &&
      (buscaResp === '' || r.nome.toLowerCase().includes(buscaResp.toLowerCase()) || r.cpf.includes(buscaResp))
    );
  }, [responsaveisIds, buscaResp]);

  const handleSalvarTurma = () => {
    toast.success('Turma do aluno atualizada com sucesso!');
  };

  const handleDesvincularResp = (respId: string) => {
    const resp = responsaveis.find(r => r.id === respId);
    setResponsaveisIds(prev => prev.filter(id => id !== respId));
    toast.success(`Responsável "${resp?.nome}" desvinculado.`);
  };

  const handleVincularResp = (respId: string) => {
    const resp = responsaveis.find(r => r.id === respId);
    setResponsaveisIds(prev => [...prev, respId]);
    toast.success(`Responsável "${resp?.nome}" vinculado com sucesso!`);
    setVincularModalOpen(false);
    setBuscaResp('');
  };

  return (
    <div>
      <Link to="/secretaria/alunos" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{aluno.nome}</h1>
          <p className="text-sm text-muted-foreground">
            {escolaAtual?.nome} — {turmaAtual?.nome || aluno.turmaName} | Matrícula: {aluno.matricula} | CPF: {aluno.cpf}
          </p>
        </div>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dados">Dados & Turma</TabsTrigger>
          <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>
          <TabsTrigger value="frequencia">Frequência</TabsTrigger>
          <TabsTrigger value="justificativas">Justificativas</TabsTrigger>
        </TabsList>

        {/* ===== ABA DADOS & TURMA ===== */}
        <TabsContent value="dados">
          <Card>
            <CardContent className="pt-5 space-y-4 max-w-lg">
              <div>
                <Label>Nome do Aluno</Label>
                <Input value={aluno.nome} readOnly className="mt-1 bg-muted" />
              </div>
              <div>
                <Label>CPF</Label>
                <Input value={aluno.cpf} readOnly className="mt-1 bg-muted" />
              </div>
              <div>
                <Label>Matrícula</Label>
                <Input value={aluno.matricula} readOnly className="mt-1 bg-muted" />
              </div>
              <div>
                <Label>Turma</Label>
                <select
                  value={turmaId}
                  onChange={e => setTurmaId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                >
                  {seriesEscola.map(s => {
                    const turmasSerie = turmasDisponiveis.filter(t => t.serieId === s.id);
                    if (turmasSerie.length === 0) return null;
                    return (
                      <optgroup key={s.id} label={s.nome}>
                        {turmasSerie.map(t => (
                          <option key={t.id} value={t.id}>{t.nome} — {t.sala}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
              <Button onClick={handleSalvarTurma}>
                <Save className="w-4 h-4" /> Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ABA RESPONSÁVEIS ===== */}
        <TabsContent value="responsaveis">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Responsáveis Vinculados</h2>
            <Button onClick={() => setVincularModalOpen(true)}>
              <UserPlus className="w-4 h-4" /> Vincular Responsável
            </Button>
          </div>
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full table-striped">
              <thead>
                <tr className="border-b bg-secondary">
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">CPF</th>
                  <th className="text-left p-3 text-sm font-medium">WhatsApp</th>
                  <th className="text-left p-3 text-sm font-medium">Parentesco</th>
                  <th className="text-left p-3 text-sm font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {respsVinculados.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-sm text-muted-foreground text-center">Nenhum responsável vinculado.</td></tr>
                ) : (
                  respsVinculados.map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="p-3 text-sm font-medium">{r.nome}</td>
                      <td className="p-3 text-sm">{r.cpf}</td>
                      <td className="p-3 text-sm">{r.whatsapp}</td>
                      <td className="p-3 text-sm">{r.parentesco}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDesvincularResp(r.id)}
                          className="text-xs bg-destructive text-destructive-foreground px-3 py-1 rounded inline-flex items-center gap-1 hover:opacity-80"
                        >
                          <UserMinus className="w-3 h-3" /> Desvincular
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ===== ABA FREQUÊNCIA ===== */}
        <TabsContent value="frequencia">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceCalendar registros={freq.entrada} titulo="Entrada na Escola" percentual={aluno.frequenciaEntrada} />
          </div>
        </TabsContent>

        {/* ===== ABA JUSTIFICATIVAS ===== */}
        <TabsContent value="justificativas">
          <h2 className="text-lg font-semibold mb-4">Histórico de Justificativas</h2>
          {justificativasAluno.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma justificativa registrada para este aluno.</p>
          ) : (
            <div className="bg-card rounded-lg border overflow-hidden">
              <table className="w-full table-striped">
                <thead>
                  <tr className="border-b bg-secondary">
                    <th className="text-left p-3 text-sm font-medium">Período</th>
                    <th className="text-left p-3 text-sm font-medium">Responsável</th>
                    <th className="text-left p-3 text-sm font-medium">Data Envio</th>
                    <th className="text-left p-3 text-sm font-medium">Documento</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {justificativasAluno.map(j => (
                    <tr key={j.id} className="border-b">
                      <td className="p-3 text-sm">{j.periodoInicio} a {j.periodoFim}</td>
                      <td className="p-3 text-sm">{j.responsavelNome}</td>
                      <td className="p-3 text-sm">{j.dataEnvio}</td>
                      <td className="p-3 text-sm text-primary">{j.documento}</td>
                      <td className="p-3">
                        <StatusBadge status={j.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== MODAL VINCULAR RESPONSÁVEL ===== */}
      <Dialog open={vincularModalOpen} onOpenChange={setVincularModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Vincular Responsável</DialogTitle>
            <DialogDescription>Busque e selecione um responsável já cadastrado para vincular ao aluno.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={buscaResp}
                onChange={e => setBuscaResp(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {respsDisponiveis.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">Nenhum responsável encontrado.</p>
              ) : (
                respsDisponiveis.map(r => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{r.nome}</p>
                      <p className="text-xs text-muted-foreground">{r.cpf} — {r.whatsapp}</p>
                    </div>
                    <Button size="sm" onClick={() => handleVincularResp(r.id)}>
                      <UserPlus className="w-3 h-3" /> Vincular
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setVincularModalOpen(false); setBuscaResp(''); }}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
