import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AttendanceCalendar } from '@/components/AttendanceCalendar';
import { ArrowLeft, Save, Search, UserPlus, UserMinus, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';

interface DetalheAlunoPanelProps {
  alunoId: string | undefined;
  backLink: string;
  readOnly?: boolean;
}

export function DetalheAlunoPanel({ alunoId, backLink, readOnly = false }: DetalheAlunoPanelProps) {
  const [aluno, setAluno] = useState<any>(null);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [justificativas, setJustificativas] = useState<any[]>([]);
  
  const [turmaId, setTurmaId] = useState('');
  const [responsaveisIds, setResponsaveisIds] = useState<string[]>([]);
  const [vincularModalOpen, setVincularModalOpen] = useState(false);
  const [buscaResp, setBuscaResp] = useState('');

  // Aviso modal (read-only mode)
  const [modalAviso, setModalAviso] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    Promise.all([
      window.api?.aluno?.listar?.() || Promise.resolve([]),
      window.api?.turma?.listar?.() || Promise.resolve([]),
      window.api?.serie?.listar?.() || Promise.resolve([]),
      window.api?.escola?.listar?.() || Promise.resolve([]),
      window.api?.responsavel?.listar?.() || Promise.resolve([]),
      window.api?.justificativa?.listar?.() || Promise.resolve([])
    ]).then(([a, t, s, e, r, j]) => {
      const found = a.find((x: any) => x.id === alunoId);
      setAluno(found);
      setTurmas(t);
      setSeries(s);
      setEscolas(e);
      setResponsaveis(r);
      setJustificativas(j);

      if (found) {
        setTurmaId(found.turmaId || '');
        // Approximate resps ID based on relation
        setResponsaveisIds([found.responsavelId].filter(Boolean) as string[]);
      }
    });
  }, [alunoId]);

  const freq = useMemo(() => ({ entrada: [], turma: [] }), []); // Replace with actual frequencia data when ready
  const respsVinculados = useMemo(() => responsaveis.filter(r => responsaveisIds.includes(r.id)), [responsaveis, responsaveisIds]);
  const justificativasAluno = useMemo(() => aluno ? justificativas.filter(j => j.alunoId === aluno.id) : [], [justificativas, aluno]);

  const turmaAtual = turmas.find(t => t.id === turmaId);
  const seriesEscola = useMemo(() => aluno && aluno.turma?.escolaId ? series.filter(s => s.escolaId === aluno.turma.escolaId) : [], [aluno, series]);
  const turmasDisponiveis = useMemo(() => aluno && aluno.turma?.escolaId ? turmas.filter(t => t.escolaId === aluno.turma.escolaId) : [], [aluno, turmas]);
  const escolaAtual = aluno ? escolas.find(e => e.id === aluno.turma?.escolaId) : null;

  const respsDisponiveis = useMemo(() => {
    return responsaveis.filter(r =>
      !responsaveisIds.includes(r.id) &&
      (buscaResp === '' || (r.usuario?.nome || '').toLowerCase().includes(buscaResp.toLowerCase()) || (r.usuario?.cpf || '').includes(buscaResp))
    );
  }, [responsaveisIds, buscaResp, responsaveis]);

  if (!aluno) return <div className="p-6">Carregando aluno...</div>;

  const handleSalvarTurma = () => {
    toast.success('Turma do aluno atualizada com sucesso!');
  };

  const handleDesvincularResp = (respId: string) => {
    const resp = responsaveis.find(r => r.id === respId);
    setResponsaveisIds(prev => prev.filter(id => id !== respId));
    toast.success(`Responsável desvinculado.`);
  };

  const handleVincularResp = (respId: string) => {
    const resp = responsaveis.find(r => r.id === respId);
    setResponsaveisIds(prev => [...prev, respId]);
    toast.success(`Responsável vinculado com sucesso!`);
    setVincularModalOpen(false);
    setBuscaResp('');
  };

  return (
    <div>
      <Link to={backLink} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{aluno.nomeCompleto}</h1>
          <p className="text-sm text-muted-foreground">
            {escolaAtual?.nome} — {turmaAtual?.nome || aluno.turma?.nome} | Matrícula: {aluno.matricula} | CPF: {aluno.cpf}
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

        <TabsContent value="dados">
          <Card>
            <CardContent className="pt-5 space-y-4 max-w-lg">
              <div>
                <Label>Nome do Aluno</Label>
                <Input value={aluno.nomeCompleto} readOnly className="mt-1 bg-muted" />
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
                {readOnly ? (
                  <Input value={turmaAtual?.nome || aluno.turma?.nome} readOnly className="mt-1 bg-muted" />
                ) : (
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
                )}
              </div>
              {!readOnly && (
                <Button onClick={handleSalvarTurma}>
                  <Save className="w-4 h-4" /> Salvar Alterações
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsaveis">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Responsáveis Vinculados</h2>
            {!readOnly && (
              <Button onClick={() => setVincularModalOpen(true)}>
                <UserPlus className="w-4 h-4" /> Vincular Responsável
              </Button>
            )}
          </div>
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full table-striped">
              <thead>
                <tr className="border-b bg-secondary">
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">CPF</th>
                  <th className="text-left p-3 text-sm font-medium">WhatsApp</th>
                  <th className="text-left p-3 text-sm font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {respsVinculados.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-sm text-muted-foreground text-center">Nenhum responsável vinculado.</td></tr>
                ) : (
                  respsVinculados.map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="p-3 text-sm font-medium">{r.usuario?.nome}</td>
                      <td className="p-3 text-sm">{r.usuario?.cpf}</td>
                      <td className="p-3 text-sm">{r.telefone || ''}</td>
                      <td className="p-3">
                        {readOnly ? (
                          <button
                            onClick={() => setModalAviso(true)}
                            className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded inline-flex items-center gap-1 hover:opacity-90"
                          >
                            <MessageSquare className="w-3 h-3" /> Aviso
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDesvincularResp(r.id)}
                            className="text-xs bg-destructive text-destructive-foreground px-3 py-1 rounded inline-flex items-center gap-1 hover:opacity-80"
                          >
                            <UserMinus className="w-3 h-3" /> Desvincular
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="frequencia">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceCalendar registros={freq.entrada} titulo="Entrada na Escola" percentual={100} />
          </div>
        </TabsContent>

        <TabsContent value="justificativas">
          <h2 className="text-lg font-semibold mb-4">Histórico de Justificativas</h2>
          {justificativasAluno.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma justificativa registrada para este aluno.</p>
          ) : (
            <div className="bg-card rounded-lg border overflow-hidden">
              <table className="w-full table-striped">
                <thead>
                  <tr className="border-b bg-secondary">
                    <th className="text-left p-3 text-sm font-medium">Responsável</th>
                    <th className="text-left p-3 text-sm font-medium">Data Envio</th>
                    <th className="text-left p-3 text-sm font-medium">Documento</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {justificativasAluno.map(j => (
                    <tr key={j.id} className="border-b">
                      <td className="p-3 text-sm">{j.aluno?.responsavel?.usuario?.nome}</td>
                      <td className="p-3 text-sm">{new Date(j.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-sm text-primary">Anexo</td>
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

      {!readOnly && (
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
                        <p className="text-sm font-medium">{r.usuario?.nome}</p>
                        <p className="text-xs text-muted-foreground">{r.usuario?.cpf} — {r.telefone}</p>
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
      )}

      {readOnly && modalAviso && (
        <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4" onClick={() => setModalAviso(false)}>
          <div className="bg-card rounded-lg border shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Enviar Aviso ao Responsável</h3>
            <textarea value={aviso} onChange={e => setAviso(e.target.value)} placeholder="Digite o aviso..." rows={4}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setModalAviso(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-secondary">Cancelar</button>
              <button onClick={() => { toast.success('Aviso enviado!'); setModalAviso(false); setAviso(''); }} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
