import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { escolas, getSeriesByEscola, getTurmasBySerie, series, turmas, alunos, professores, Turma } from '@/data/mockData';
import { ArrowLeft, Plus, Clock, GraduationCap, Pencil, Trash2, Search, UserPlus, UserMinus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function EscolaDetalheSecretaria() {
  const { escolaId } = useParams();
  const escola = escolas.find(e => e.id === escolaId);
  const seriesEscola = getSeriesByEscola(escolaId || '');

  // Modal Nova Série
  const [serieModalOpen, setSerieModalOpen] = useState(false);
  const [novaSerie, setNovaSerie] = useState('');
  const [serieHorarioInicio, setSerieHorarioInicio] = useState('07:00');
  const [serieTolerancia, setSerieTolerancia] = useState('15');
  const [serieLimiteMax, setSerieLimiteMax] = useState('07:30');
  const [serieAplicarTodas, setSerieAplicarTodas] = useState(true);

  // Modal Nova Turma
  const [turmaModalOpen, setTurmaModalOpen] = useState(false);
  const [novaTurmaSerie, setNovaTurmaSerie] = useState('');
  const [novaTurmaSala, setNovaTurmaSala] = useState('');
  const [turmaSobrescrever, setTurmaSobrescrever] = useState(false);
  const [turmaHorarioInicio, setTurmaHorarioInicio] = useState('07:00');
  const [turmaTolerancia, setTurmaTolerancia] = useState('15');
  const [turmaLimiteMax, setTurmaLimiteMax] = useState('07:30');

  // Auto-generate turma name
  const proximaLetraTurma = useMemo(() => {
    if (!novaTurmaSerie) return '';
    const turmasSerie = turmas.filter(t => t.serieId === novaTurmaSerie);
    const letras = turmasSerie.map(t => {
      const match = t.nome.match(/\s([A-Z])$/);
      return match ? match[1] : '';
    }).filter(Boolean).sort();
    if (letras.length === 0) return 'A';
    const ultimaLetra = letras[letras.length - 1];
    return String.fromCharCode(ultimaLetra.charCodeAt(0) + 1);
  }, [novaTurmaSerie]);

  const nomeTurmaGerado = useMemo(() => {
    if (!novaTurmaSerie) return '';
    const serie = series.find(s => s.id === novaTurmaSerie);
    return serie ? `${serie.nome} ${proximaLetraTurma}` : '';
  }, [novaTurmaSerie, proximaLetraTurma]);
  // Edit turma
  const [editTurmaModalOpen, setEditTurmaModalOpen] = useState(false);
  const [editTurmaId, setEditTurmaId] = useState<string | null>(null);
  const [editTurmaSala, setEditTurmaSala] = useState('');
  const [editProfsSel, setEditProfsSel] = useState<string[]>([]);
  const [editAlunosBusca, setEditAlunosBusca] = useState('');

  const profsEscola = useMemo(() => professores.filter(p => p.escolaIds.includes(escolaId || '')), [escolaId]);
  const alunosEscola = useMemo(() => alunos.filter(a => a.escolaId === escolaId), [escolaId]);

  const alunosDaTurmaEdit = useMemo(() => {
    if (!editTurmaId) return [];
    return alunos.filter(a => a.turmaId === editTurmaId);
  }, [editTurmaId]);

  const alunosDisponiveisEdit = useMemo(() => {
    if (!editTurmaId) return [];
    return alunosEscola.filter(a =>
      a.turmaId !== editTurmaId &&
      (editAlunosBusca === '' || a.nome.toLowerCase().includes(editAlunosBusca.toLowerCase()) || a.matricula.includes(editAlunosBusca))
    );
  }, [editTurmaId, alunosEscola, editAlunosBusca]);

  // Delete turma
  const [deleteTurmaId, setDeleteTurmaId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Local turma list for mutations
  const [turmasLocais, setTurmasLocais] = useState<Turma[]>(() => turmas.filter(t => t.escolaId === escolaId));

  const getTurmasLocalBySerie = (serieId: string) => turmasLocais.filter(t => t.serieId === serieId);

  if (!escola) return <div>Escola não encontrada</div>;

  const handleSalvarSerie = () => {
    toast.success(`Série "${novaSerie}" criada com sucesso!`);
    setSerieModalOpen(false);
    setNovaSerie('');
    setSerieHorarioInicio('07:00');
    setSerieTolerancia('15');
    setSerieLimiteMax('07:30');
    setSerieAplicarTodas(true);
  };

  const handleSalvarTurma = () => {
    const nova: Turma = {
      id: `t-novo-${Date.now()}`,
      nome: nomeTurmaGerado,
      serieId: novaTurmaSerie,
      escolaId: escolaId || '1',
      sala: `Sala ${novaTurmaSala}`,
      professorIds: [],
      frequenciaMedia: 0,
    };
    setTurmasLocais(prev => [...prev, nova]);
    toast.success(`Turma "${nomeTurmaGerado}" criada com sucesso!`);
    setTurmaModalOpen(false);
    setNovaTurmaSerie('');
    setNovaTurmaSala('');
    setTurmaSobrescrever(false);
  };

  const openEditTurma = (turma: Turma) => {
    setEditTurmaId(turma.id);
    setEditTurmaSala(turma.sala.replace(/\D/g, '') || turma.sala);
    setEditTurmaModalOpen(true);
  };

  const handleSalvarEditTurma = () => {
    setTurmasLocais(prev => prev.map(t =>
      t.id === editTurmaId ? { ...t, sala: `Sala ${editTurmaSala}` } : t
    ));
    toast.success('Turma atualizada com sucesso!');
    setEditTurmaModalOpen(false);
    setEditTurmaId(null);
  };

  const alunosNaTurmaDelete = deleteTurmaId ? alunos.filter(a => a.turmaId === deleteTurmaId).length : 0;

  const handleDeleteTurma = () => {
    if (!deleteTurmaId) return;
    if (alunosNaTurmaDelete > 0) {
      toast.error(`Não é possível excluir: esta turma possui ${alunosNaTurmaDelete} aluno(s) vinculado(s).`);
      setDeleteConfirmOpen(false);
      setDeleteTurmaId(null);
      return;
    }
    const turma = turmasLocais.find(t => t.id === deleteTurmaId);
    setTurmasLocais(prev => prev.filter(t => t.id !== deleteTurmaId));
    toast.success(`Turma "${turma?.nome}" excluída.`);
    setDeleteConfirmOpen(false);
    setDeleteTurmaId(null);
  };

  const editingTurma = turmasLocais.find(t => t.id === editTurmaId);

  // Regras padrão da série selecionada (simulação)
  const regrasHerdadas = { horario: '07:00', tolerancia: '15', limite: '07:30' };

  return (
    <div>
      <Link to="/secretaria" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-2">{escola.nome}</h1>
      <p className="text-muted-foreground mb-6">
        Diretor: {escola.diretorNome} | Frequência média: <span className="font-bold text-primary">{escola.frequenciaMedia}%</span>
      </p>

      <Tabs defaultValue="series" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="series">Séries</TabsTrigger>
          <TabsTrigger value="estrutura">Estrutura Acadêmica</TabsTrigger>
        </TabsList>

        {/* ===== ABA SÉRIES (original) ===== */}
        <TabsContent value="series">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seriesEscola.map(serie => (
              <Link key={serie.id} to={`/secretaria/escola/${escolaId}/serie/${serie.id}`} className="block">
                <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg text-card-foreground">{serie.nome}</h3>
                  <div className={`text-2xl font-bold mt-2 ${serie.frequenciaMedia < 75 ? 'text-destructive' : 'text-primary'}`}>
                    {serie.frequenciaMedia}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Frequência média</p>
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>

        {/* ===== ABA ESTRUTURA ACADÊMICA ===== */}
        <TabsContent value="estrutura">
          <div className="flex gap-3 mb-6">
            <Button onClick={() => setSerieModalOpen(true)}>
              <Plus className="w-4 h-4" /> Nova Série
            </Button>
            <Button variant="outline" onClick={() => setTurmaModalOpen(true)}>
              <Plus className="w-4 h-4" /> Nova Turma
            </Button>
          </div>

          <div className="space-y-6">
            {seriesEscola.map(serie => {
              const turmasDaSerie = getTurmasLocalBySerie(serie.id);
              return (
                <Card key={serie.id}>
                  <CardContent className="pt-5">
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg text-card-foreground">{serie.nome}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 07:00 – Tolerância: 15min – Limite: 07:30</span>
                    </div>
                    {turmasDaSerie.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {turmasDaSerie.map(turma => (
                          <div key={turma.id} className="border rounded-md p-3 bg-muted/30">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-sm text-card-foreground">{turma.nome}</p>
                                <p className="text-xs text-muted-foreground">{turma.sala}</p>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => openEditTurma(turma)} className="text-muted-foreground hover:text-primary transition-colors">
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => { setDeleteTurmaId(turma.id); setDeleteConfirmOpen(true); }} className="text-muted-foreground hover:text-destructive transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className={`text-sm font-bold mt-1 ${turma.frequenciaMedia < 75 ? 'text-destructive' : 'text-primary'}`}>
                              {turma.frequenciaMedia}%
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma turma cadastrada nesta série.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ===== MODAL NOVA SÉRIE ===== */}
      <Dialog open={serieModalOpen} onOpenChange={setSerieModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Série</DialogTitle>
            <DialogDescription>Cadastre uma nova série e defina as regras de entrada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="nomeSerie">Nome da Série</Label>
              <Input id="nomeSerie" value={novaSerie} onChange={e => setNovaSerie(e.target.value)} placeholder="Ex: 6º Ano" className="mt-1" />
            </div>

            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Regras de Entrada (Reconhecimento Facial)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="serieHorario" className="text-xs">Horário de Início</Label>
                  <Input id="serieHorario" type="time" value={serieHorarioInicio} onChange={e => setSerieHorarioInicio(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="serieTolerancia" className="text-xs">Tolerância (min)</Label>
                  <Input id="serieTolerancia" type="number" value={serieTolerancia} onChange={e => setSerieTolerancia(e.target.value)} min={0} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="serieLimite" className="text-xs">Limite Máximo</Label>
                  <Input id="serieLimite" type="time" value={serieLimiteMax} onChange={e => setSerieLimiteMax(e.target.value)} className="mt-1" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Após a tolerância, o status será "Chegou Atrasado". Após o limite máximo, o acesso será "Bloqueado".
              </p>

              <div className="flex items-center gap-3 pt-2 border-t">
                <Switch id="aplicarTodas" checked={serieAplicarTodas} onCheckedChange={setSerieAplicarTodas} />
                <Label htmlFor="aplicarTodas" className="text-sm font-normal cursor-pointer">
                  Aplicar estas regras de horário a todas as turmas desta série
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSerieModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvarSerie}>Salvar Série</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== MODAL NOVA TURMA ===== */}
      <Dialog open={turmaModalOpen} onOpenChange={setTurmaModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Turma</DialogTitle>
            <DialogDescription>Cadastre uma nova turma vinculada a uma série existente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="turmaSerie">Série</Label>
              <select
                id="turmaSerie"
                value={novaTurmaSerie}
                onChange={e => setNovaTurmaSerie(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
              >
                <option value="">Selecione a série...</option>
                {seriesEscola.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            {novaTurmaSerie && (
              <div>
                <Label htmlFor="turmaNome">Nome da Turma (gerado)</Label>
                <Input id="turmaNome" value={nomeTurmaGerado} readOnly className="mt-1 bg-muted" />
              </div>
            )}
            <div>
              <Label htmlFor="turmaSala">Sala (número)</Label>
              <Input id="turmaSala" type="number" value={novaTurmaSala} onChange={e => setNovaTurmaSala(e.target.value)} placeholder="Ex: 10" min={1} className="mt-1" />
            </div>

            {/* Regras de horário herdadas */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Regras de Horário da Série
              </h4>

              {!turmaSobrescrever ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Horário de Início</Label>
                    <Input value={regrasHerdadas.horario} disabled className="mt-1 bg-muted" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tolerância (min)</Label>
                    <Input value={regrasHerdadas.tolerancia} disabled className="mt-1 bg-muted" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Limite Máximo</Label>
                    <Input value={regrasHerdadas.limite} disabled className="mt-1 bg-muted" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Horário de Início</Label>
                    <Input type="time" value={turmaHorarioInicio} onChange={e => setTurmaHorarioInicio(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Tolerância (min)</Label>
                    <Input type="number" value={turmaTolerancia} onChange={e => setTurmaTolerancia(e.target.value)} min={0} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Limite Máximo</Label>
                    <Input type="time" value={turmaLimiteMax} onChange={e => setTurmaLimiteMax(e.target.value)} className="mt-1" />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 border-t">
                <Switch id="sobrescrever" checked={turmaSobrescrever} onCheckedChange={setTurmaSobrescrever} />
                <Label htmlFor="sobrescrever" className="text-sm font-normal cursor-pointer">
                  Sobrescrever regras de horário para esta turma
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTurmaModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvarTurma}>Salvar Turma</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ===== MODAL EDITAR TURMA ===== */}
      <Dialog open={editTurmaModalOpen} onOpenChange={setEditTurmaModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Turma</DialogTitle>
            <DialogDescription>{editingTurma ? `Editando: ${editingTurma.nome}` : ''}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome da Turma</Label>
              <Input value={editingTurma?.nome || ''} readOnly className="mt-1 bg-muted" />
            </div>
            <div>
              <Label>Sala (número)</Label>
              <Input type="number" value={editTurmaSala} onChange={e => setEditTurmaSala(e.target.value)} min={1} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTurmaModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvarEditTurma}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== CONFIRMAR EXCLUSÃO TURMA ===== */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Turma"
        description={alunosNaTurmaDelete > 0
          ? `A turma "${turmasLocais.find(t => t.id === deleteTurmaId)?.nome}" possui ${alunosNaTurmaDelete} aluno(s) vinculado(s). Remova os alunos antes de excluir.`
          : `Tem certeza que deseja excluir a turma "${turmasLocais.find(t => t.id === deleteTurmaId)?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteTurma}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </div>
  );
}
