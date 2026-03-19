import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmModal } from '@/components/ConfirmModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function GestaoTurmas() {
  const { usuario } = useAuth();
  const [turmas, setTurmas] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [escolaId, setEscolaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!usuario) return;
    const { data: diretor } = await supabase.from('diretores').select('escola_id').eq('usuario_id', usuario.id).single();
    if (!diretor) { setLoading(false); return; }
    setEscolaId(diretor.escola_id);

    const [seriesRes, turmasRes, profsRes, alunosRes] = await Promise.all([
      supabase.from('series').select('*').eq('escola_id', diretor.escola_id).order('nome'),
      supabase.from('turmas').select('*, turma_professores(*, professores(*, usuarios(*)))').eq('escola_id', diretor.escola_id).order('nome'),
      supabase.from('professores').select('*, usuarios(*), professor_escolas!inner(escola_id)').eq('professor_escolas.escola_id', diretor.escola_id),
      supabase.from('alunos').select('*').eq('escola_id', diretor.escola_id),
    ]);

    if (seriesRes.data) setSeries(seriesRes.data);
    if (turmasRes.data) setTurmas(turmasRes.data);
    if (profsRes.data) setProfessores(profsRes.data);
    if (alunosRes.data) setAlunos(alunosRes.data);
    setLoading(false);
  }, [usuario]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // New turma
  const [showForm, setShowForm] = useState(false);
  const [serieSel, setSerieSel] = useState('');
  const [sala, setSala] = useState('');
  const [profsSel, setProfsSel] = useState<string[]>([]);

  const proximaLetra = useMemo(() => {
    if (!serieSel) return '';
    const turmasSerie = turmas.filter(t => t.serie_id === serieSel);
    const letras = turmasSerie.map(t => { const m = t.nome.match(/\s([A-Z])$/); return m ? m[1] : ''; }).filter(Boolean).sort();
    if (letras.length === 0) return 'A';
    return String.fromCharCode(letras[letras.length - 1].charCodeAt(0) + 1);
  }, [serieSel, turmas]);

  const nomeTurma = useMemo(() => {
    if (!serieSel) return '';
    const serie = series.find(s => s.id === serieSel);
    return serie ? `${serie.nome} ${proximaLetra}` : '';
  }, [serieSel, proximaLetra, series]);

  // Edit turma
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editSala, setEditSala] = useState('');
  const [editProfsSel, setEditProfsSel] = useState<string[]>([]);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  if (loading) return <div>Carregando...</div>;

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serieSel || !sala) { toast.error('Preencha todos os campos.'); return; }

    const { data: turmaData, error } = await supabase.from('turmas').insert({
      nome: nomeTurma,
      serie_id: serieSel,
      escola_id: escolaId!,
      sala: `Sala ${sala}`,
    }).select().single();

    if (error) { toast.error('Erro ao criar turma.'); return; }

    if (profsSel.length > 0 && turmaData) {
      await supabase.from('turma_professores').insert(
        profsSel.map(pId => ({ turma_id: turmaData.id, professor_id: pId }))
      );
    }

    toast.success(`Turma "${nomeTurma}" criada!`);
    setShowForm(false); setSerieSel(''); setSala(''); setProfsSel([]);
    fetchData();
  };

  const openEdit = (turma: any) => {
    setEditId(turma.id);
    setEditSala(turma.sala?.replace(/\D/g, '') || '');
    setEditProfsSel((turma.turma_professores || []).map((tp: any) => tp.professor_id));
    setEditModalOpen(true);
  };

  const handleSalvarEdit = async () => {
    if (!editId) return;
    await supabase.from('turmas').update({ sala: `Sala ${editSala}` }).eq('id', editId);
    await supabase.from('turma_professores').delete().eq('turma_id', editId);
    if (editProfsSel.length > 0) {
      await supabase.from('turma_professores').insert(
        editProfsSel.map(pId => ({ turma_id: editId!, professor_id: pId }))
      );
    }
    toast.success('Turma atualizada!');
    setEditModalOpen(false); setEditId(null);
    fetchData();
  };

  const alunosNaTurmaDelete = deleteId ? alunos.filter(a => a.turma_id === deleteId).length : 0;

  const handleDelete = async () => {
    if (!deleteId) return;
    if (alunosNaTurmaDelete > 0) {
      toast.error('Não é possível excluir: turma possui alunos.');
      setDeleteConfirmOpen(false); return;
    }
    await supabase.from('turmas').delete().eq('id', deleteId);
    toast.success('Turma excluída!');
    setDeleteConfirmOpen(false); setDeleteId(null);
    fetchData();
  };

  const editingTurma = turmas.find(t => t.id === editId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Turmas</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : <><Plus className="w-4 h-4" /> Nova Turma</>}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-lg border p-6 mb-6 max-w-lg">
          <h3 className="font-semibold mb-4">Nova Turma</h3>
          <form onSubmit={handleCriar} className="space-y-4">
            <div>
              <Label>Série</Label>
              <select value={serieSel} onChange={e => setSerieSel(e.target.value)} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                <option value="">Selecione...</option>
                {series.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            {serieSel && (
              <div>
                <Label>Nome da Turma (gerado)</Label>
                <Input value={nomeTurma} readOnly className="mt-1 bg-muted" />
              </div>
            )}
            <div>
              <Label>Sala (número)</Label>
              <Input type="number" value={sala} onChange={e => setSala(e.target.value)} placeholder="Ex: 10" required min={1} className="mt-1" />
            </div>
            <div>
              <Label>Professor(es)</Label>
              <div className="space-y-2 border rounded-md p-3 bg-background max-h-40 overflow-y-auto mt-1">
                {professores.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum professor nesta escola.</p>
                ) : (
                  professores.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={profsSel.includes(p.id)} onChange={() => setProfsSel(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className="rounded border-input" />
                      <span>{p.usuarios?.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <Button type="submit">Criar Turma</Button>
          </form>
        </div>
      )}

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Turma</th>
            <th className="text-left p-3 text-sm font-medium">Sala</th>
            <th className="text-left p-3 text-sm font-medium">Professores</th>
            <th className="text-left p-3 text-sm font-medium">Alunos</th>
            <th className="text-left p-3 text-sm font-medium">Ações</th>
          </tr></thead>
          <tbody>
            {turmas.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Nenhuma turma cadastrada.</td></tr>
            ) : (
              turmas.map(t => {
                const profs = (t.turma_professores || []).map((tp: any) => tp.professores?.usuarios?.nome).filter(Boolean);
                const qtdAlunos = alunos.filter(a => a.turma_id === t.id).length;
                return (
                  <tr key={t.id} className="border-b">
                    <td className="p-3 text-sm font-medium">{t.nome}</td>
                    <td className="p-3 text-sm">{t.sala}</td>
                    <td className="p-3 text-sm">{profs.join(', ') || '—'}</td>
                    <td className="p-3 text-sm">{qtdAlunos}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(t)} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded inline-flex items-center gap-1 hover:opacity-80">
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                        <button onClick={() => { setDeleteId(t.id); setDeleteConfirmOpen(true); }} className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded inline-flex items-center gap-1 hover:opacity-80">
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
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
              <Input type="number" value={editSala} onChange={e => setEditSala(e.target.value)} min={1} className="mt-1" />
            </div>
            <div>
              <Label>Professor(es)</Label>
              <div className="space-y-2 border rounded-md p-3 bg-background max-h-40 overflow-y-auto mt-1">
                {professores.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editProfsSel.includes(p.id)} onChange={() => setEditProfsSel(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className="rounded border-input" />
                    <span>{p.usuarios?.nome}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvarEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Turma"
        description={alunosNaTurmaDelete > 0
          ? `Esta turma possui ${alunosNaTurmaDelete} aluno(s).`
          : `Excluir turma "${turmas.find(t => t.id === deleteId)?.nome}"?`}
        onConfirm={handleDelete}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </div>
  );
}
