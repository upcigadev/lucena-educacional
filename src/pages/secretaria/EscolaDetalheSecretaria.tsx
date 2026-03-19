import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { supabase } from '@/integrations/supabase/client';

export default function EscolaDetalheSecretaria() {
  const { escolaId } = useParams();

  const [escola, setEscola] = useState<any>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!escolaId) return;
    const [escolaRes, seriesRes, turmasRes, alunosRes, profsRes] = await Promise.all([
      supabase.from('escolas').select('*').eq('id', escolaId).single(),
      supabase.from('series').select('*').eq('escola_id', escolaId).order('nome'),
      supabase.from('turmas').select('*, turma_professores(*, professores(*, usuarios(*)))').eq('escola_id', escolaId).order('nome'),
      supabase.from('alunos').select('*').eq('escola_id', escolaId).order('nome_completo'),
      supabase.from('professores').select('*, usuarios(*), professor_escolas!inner(escola_id)').eq('professor_escolas.escola_id', escolaId),
    ]);
    if (escolaRes.data) setEscola(escolaRes.data);
    if (seriesRes.data) setSeries(seriesRes.data);
    if (turmasRes.data) setTurmas(turmasRes.data);
    if (alunosRes.data) setAlunos(alunosRes.data);
    if (profsRes.data) setProfessores(profsRes.data);
    setLoading(false);
  }, [escolaId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // New Serie modal
  const [serieModalOpen, setSerieModalOpen] = useState(false);
  const [novaSerie, setNovaSerie] = useState('');
  const [serieHorarioInicio, setSerieHorarioInicio] = useState('07:00');
  const [serieTolerancia, setSerieTolerancia] = useState('15');
  const [serieLimiteMax, setSerieLimiteMax] = useState('07:30');

  // New Turma modal
  const [turmaModalOpen, setTurmaModalOpen] = useState(false);
  const [novaTurmaSerie, setNovaTurmaSerie] = useState('');
  const [novaTurmaSala, setNovaTurmaSala] = useState('');
  const [turmaProfsSel, setTurmaProfsSel] = useState<string[]>([]);

  // Auto-generate turma name
  const proximaLetraTurma = useMemo(() => {
    if (!novaTurmaSerie) return '';
    const turmasSerie = turmas.filter(t => t.serie_id === novaTurmaSerie);
    const letras = turmasSerie.map(t => {
      const match = t.nome.match(/\s([A-Z])$/);
      return match ? match[1] : '';
    }).filter(Boolean).sort();
    if (letras.length === 0) return 'A';
    return String.fromCharCode(letras[letras.length - 1].charCodeAt(0) + 1);
  }, [novaTurmaSerie, turmas]);

  const nomeTurmaGerado = useMemo(() => {
    if (!novaTurmaSerie) return '';
    const serie = series.find(s => s.id === novaTurmaSerie);
    return serie ? `${serie.nome} ${proximaLetraTurma}` : '';
  }, [novaTurmaSerie, proximaLetraTurma, series]);

  // Edit turma
  const [editTurmaModalOpen, setEditTurmaModalOpen] = useState(false);
  const [editTurmaId, setEditTurmaId] = useState<string | null>(null);
  const [editTurmaSala, setEditTurmaSala] = useState('');
  const [editProfsSel, setEditProfsSel] = useState<string[]>([]);
  const [editAlunosBusca, setEditAlunosBusca] = useState('');

  // Delete turma
  const [deleteTurmaId, setDeleteTurmaId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const alunosDaTurmaEdit = useMemo(() => editTurmaId ? alunos.filter(a => a.turma_id === editTurmaId) : [], [editTurmaId, alunos]);
  const alunosDisponiveisEdit = useMemo(() => {
    if (!editTurmaId) return [];
    return alunos.filter(a =>
      a.turma_id !== editTurmaId &&
      (editAlunosBusca === '' || a.nome_completo.toLowerCase().includes(editAlunosBusca.toLowerCase()) || a.matricula.includes(editAlunosBusca))
    );
  }, [editTurmaId, alunos, editAlunosBusca]);

  const getTurmasBySerie = (serieId: string) => turmas.filter(t => t.serie_id === serieId);

  if (loading) return <div>Carregando...</div>;
  if (!escola) return <div>Escola não encontrada</div>;

  const handleSalvarSerie = async () => {
    if (!novaSerie.trim()) { toast.error('Informe o nome da série.'); return; }
    const { error } = await supabase.from('series').insert({
      nome: novaSerie,
      escola_id: escolaId!,
      horario_inicio: serieHorarioInicio,
      tolerancia_min: parseInt(serieTolerancia) || 15,
      limite_max: serieLimiteMax,
    });
    if (error) { toast.error('Erro ao criar série: ' + error.message); return; }
    toast.success(`Série "${novaSerie}" criada!`);
    setSerieModalOpen(false);
    setNovaSerie('');
    fetchData();
  };

  const handleSalvarTurma = async () => {
    if (!novaTurmaSerie) { toast.error('Selecione uma série.'); return; }
    if (!novaTurmaSala) { toast.error('Informe a sala.'); return; }

    const { data: turmaData, error: turmaError } = await supabase.from('turmas').insert({
      nome: nomeTurmaGerado,
      serie_id: novaTurmaSerie,
      escola_id: escolaId!,
      sala: `Sala ${novaTurmaSala}`,
    }).select().single();

    if (turmaError) { toast.error('Erro ao criar turma: ' + turmaError.message); return; }

    // Link professors
    if (turmaProfsSel.length > 0 && turmaData) {
      await supabase.from('turma_professores').insert(
        turmaProfsSel.map(profId => ({ turma_id: turmaData.id, professor_id: profId }))
      );
    }

    toast.success(`Turma "${nomeTurmaGerado}" criada!`);
    setTurmaModalOpen(false);
    setNovaTurmaSerie('');
    setNovaTurmaSala('');
    setTurmaProfsSel([]);
    fetchData();
  };

  const openEditTurma = (turma: any) => {
    setEditTurmaId(turma.id);
    setEditTurmaSala(turma.sala?.replace(/\D/g, '') || '');
    setEditProfsSel((turma.turma_professores || []).map((tp: any) => tp.professor_id));
    setEditAlunosBusca('');
    setEditTurmaModalOpen(true);
  };

  const handleSalvarEditTurma = async () => {
    if (!editTurmaId) return;
    await supabase.from('turmas').update({ sala: `Sala ${editTurmaSala}` }).eq('id', editTurmaId);

    // Sync professors: delete all, re-insert
    await supabase.from('turma_professores').delete().eq('turma_id', editTurmaId);
    if (editProfsSel.length > 0) {
      await supabase.from('turma_professores').insert(
        editProfsSel.map(profId => ({ turma_id: editTurmaId!, professor_id: profId }))
      );
    }

    toast.success('Turma atualizada!');
    setEditTurmaModalOpen(false);
    setEditTurmaId(null);
    fetchData();
  };

  const handleRemoverAlunoTurma = async (alunoId: string) => {
    await supabase.from('alunos').update({ turma_id: null }).eq('id', alunoId);
    toast.success('Aluno removido da turma.');
    fetchData();
  };

  const handleAdicionarAlunoTurma = async (alunoId: string) => {
    if (!editTurmaId) return;
    await supabase.from('alunos').update({ turma_id: editTurmaId }).eq('id', alunoId);
    toast.success('Aluno adicionado à turma.');
    setEditAlunosBusca('');
    fetchData();
  };

  const alunosNaTurmaDelete = deleteTurmaId ? alunos.filter(a => a.turma_id === deleteTurmaId).length : 0;

  const handleDeleteTurma = async () => {
    if (!deleteTurmaId) return;
    if (alunosNaTurmaDelete > 0) {
      toast.error('Não é possível excluir: turma possui alunos vinculados.');
      setDeleteConfirmOpen(false);
      return;
    }
    const { error } = await supabase.from('turmas').delete().eq('id', deleteTurmaId);
    if (error) { toast.error('Erro ao excluir turma.'); return; }
    toast.success('Turma excluída!');
    setDeleteConfirmOpen(false);
    setDeleteTurmaId(null);
    fetchData();
  };

  const editingTurma = turmas.find(t => t.id === editTurmaId);

  return (
    <div>
      <Link to="/secretaria" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-2">{escola.nome}</h1>
      <p className="text-muted-foreground mb-6">
        {escola.endereco && `${escola.endereco} | `}
        {escola.telefone && `Tel: ${escola.telefone}`}
      </p>

      <Tabs defaultValue="estrutura" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="estrutura">Estrutura Acadêmica</TabsTrigger>
          <TabsTrigger value="series">Séries</TabsTrigger>
        </TabsList>

        {/* ===== ABA SÉRIES ===== */}
        <TabsContent value="series">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {series.map(serie => {
              const turmasDaSerie = getTurmasBySerie(serie.id);
              const qtdAlunos = alunos.filter(a => turmasDaSerie.some(t => t.id === a.turma_id)).length;
              return (
                <Link key={serie.id} to={`/secretaria/escola/${escolaId}/serie/${serie.id}`} className="block">
                  <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg text-card-foreground">{serie.nome}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{turmasDaSerie.length} turma(s) · {qtdAlunos} aluno(s)</p>
                  </div>
                </Link>
              );
            })}
            {series.length === 0 && (
              <p className="text-muted-foreground col-span-3">Nenhuma série cadastrada. Use a aba "Estrutura Acadêmica" para criar.</p>
            )}
          </div>
        </TabsContent>

        {/* ===== ABA ESTRUTURA ACADÊMICA ===== */}
        <TabsContent value="estrutura">
          <div className="flex gap-3 mb-6">
            <Button onClick={() => setSerieModalOpen(true)}>
              <Plus className="w-4 h-4" /> Nova Série
            </Button>
            <Button variant="outline" onClick={() => setTurmaModalOpen(true)} disabled={series.length === 0}>
              <Plus className="w-4 h-4" /> Nova Turma
            </Button>
          </div>

          {series.length === 0 ? (
            <div className="bg-card rounded-lg border p-8 text-center">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">Nenhuma série cadastrada</p>
              <p className="text-sm text-muted-foreground mt-1">Crie a primeira série para começar a estruturar as turmas.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {series.map(serie => {
                const turmasDaSerie = getTurmasBySerie(serie.id);
                return (
                  <Card key={serie.id}>
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-2 mb-1">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg text-card-foreground">{serie.nome}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {serie.horario_inicio?.slice(0,5) || '07:00'} – Tolerância: {serie.tolerancia_min || 15}min – Limite: {serie.limite_max?.slice(0,5) || '07:30'}
                        </span>
                      </div>
                      {turmasDaSerie.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {turmasDaSerie.map(turma => {
                            const qtdAlunos = alunos.filter(a => a.turma_id === turma.id).length;
                            const profs = (turma.turma_professores || []).map((tp: any) => tp.professores?.usuarios?.nome).filter(Boolean);
                            return (
                              <div key={turma.id} className="border rounded-md p-3 bg-muted/30">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-sm text-card-foreground">{turma.nome}</p>
                                    <p className="text-xs text-muted-foreground">{turma.sala} · {qtdAlunos} aluno(s)</p>
                                    {profs.length > 0 && (
                                      <p className="text-xs text-muted-foreground mt-0.5">Prof: {profs.join(', ')}</p>
                                    )}
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
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma turma cadastrada nesta série.</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
              <Label>Nome da Série</Label>
              <Input value={novaSerie} onChange={e => setNovaSerie(e.target.value)} placeholder="Ex: 6º Ano" className="mt-1" />
            </div>
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Regras de Entrada
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Horário de Início</Label>
                  <Input type="time" value={serieHorarioInicio} onChange={e => setSerieHorarioInicio(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Tolerância (min)</Label>
                  <Input type="number" value={serieTolerancia} onChange={e => setSerieTolerancia(e.target.value)} min={0} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Limite Máximo</Label>
                  <Input type="time" value={serieLimiteMax} onChange={e => setSerieLimiteMax(e.target.value)} className="mt-1" />
                </div>
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
            <DialogDescription>Cadastre uma nova turma vinculada a uma série.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Série</Label>
              <select
                value={novaTurmaSerie}
                onChange={e => setNovaTurmaSerie(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
              >
                <option value="">Selecione a série...</option>
                {series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            {novaTurmaSerie && (
              <div>
                <Label>Nome da Turma (gerado)</Label>
                <Input value={nomeTurmaGerado} readOnly className="mt-1 bg-muted" />
              </div>
            )}
            <div>
              <Label>Sala (número)</Label>
              <Input type="number" value={novaTurmaSala} onChange={e => setNovaTurmaSala(e.target.value)} placeholder="Ex: 10" min={1} className="mt-1" />
            </div>
            <div>
              <Label>Professor(es)</Label>
              <div className="space-y-2 border rounded-md p-3 bg-background max-h-40 overflow-y-auto mt-1">
                {professores.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum professor vinculado a esta escola.</p>
                ) : (
                  professores.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={turmaProfsSel.includes(p.id)} onChange={() => setTurmaProfsSel(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className="rounded border-input" />
                      <span>{p.usuarios?.nome}</span>
                    </label>
                  ))
                )}
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
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Turma</DialogTitle>
            <DialogDescription>{editingTurma ? `Editando: ${editingTurma.nome}` : ''}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome da Turma</Label>
                <Input value={editingTurma?.nome || ''} readOnly className="mt-1 bg-muted" />
              </div>
              <div>
                <Label>Sala (número)</Label>
                <Input type="number" value={editTurmaSala} onChange={e => setEditTurmaSala(e.target.value)} min={1} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Professores Vinculados</Label>
              <div className="space-y-2 border rounded-md p-3 bg-background max-h-40 overflow-y-auto mt-2">
                {professores.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editProfsSel.includes(p.id)} onChange={() => setEditProfsSel(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className="rounded border-input" />
                    <span>{p.usuarios?.nome}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Alunos da Turma ({alunosDaTurmaEdit.length})</Label>
              <div className="border rounded-md mt-2 max-h-48 overflow-y-auto">
                {alunosDaTurmaEdit.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground text-center">Nenhum aluno nesta turma.</p>
                ) : (
                  alunosDaTurmaEdit.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                      <div>
                        <span className="text-sm font-medium">{a.nome_completo}</span>
                        <span className="text-xs text-muted-foreground ml-2">Mat: {a.matricula}</span>
                      </div>
                      <button onClick={() => handleRemoverAlunoTurma(a.id)} className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded inline-flex items-center gap-1 hover:opacity-80">
                        <UserMinus className="w-3 h-3" /> Remover
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Adicionar Aluno à Turma</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar aluno por nome ou matrícula..." value={editAlunosBusca} onChange={e => setEditAlunosBusca(e.target.value)} className="pl-9" />
              </div>
              {editAlunosBusca && (
                <div className="border rounded-md mt-1 max-h-36 overflow-y-auto">
                  {alunosDisponiveisEdit.length === 0 ? (
                    <p className="p-3 text-sm text-muted-foreground text-center">Nenhum aluno encontrado.</p>
                  ) : (
                    alunosDisponiveisEdit.slice(0, 10).map(a => (
                      <div key={a.id} className="flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-secondary/50">
                        <div>
                          <span className="text-sm font-medium">{a.nome_completo}</span>
                          <span className="text-xs text-muted-foreground ml-2">Mat: {a.matricula}</span>
                        </div>
                        <button onClick={() => handleAdicionarAlunoTurma(a.id)} className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded inline-flex items-center gap-1 hover:opacity-80">
                          <UserPlus className="w-3 h-3" /> Adicionar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTurmaModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvarEditTurma}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Turma"
        description={alunosNaTurmaDelete > 0
          ? `A turma possui ${alunosNaTurmaDelete} aluno(s). Remova os alunos antes de excluir.`
          : `Tem certeza que deseja excluir a turma "${turmas.find(t => t.id === deleteTurmaId)?.nome}"?`}
        onConfirm={handleDeleteTurma}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </div>
  );
}
