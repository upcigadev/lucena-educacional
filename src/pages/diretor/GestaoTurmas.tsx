import { useState, useMemo } from 'react';
import { getTurmasByEscola, series, professores, alunos, turmas as turmasData, Turma } from '@/data/mockData';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function GestaoTurmas() {
  const [lista, setLista] = useState<Turma[]>(() => getTurmasByEscola('1'));
  const [showForm, setShowForm] = useState(false);
  const [serieSel, setSerieSel] = useState('');
  const [sala, setSala] = useState('');
  const [profsSel, setProfsSel] = useState<string[]>([]);

  // Edit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editSala, setEditSala] = useState('');
  const [editProfsSel, setEditProfsSel] = useState<string[]>([]);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const seriesEscola = series.filter(s => s.escolaId === '1');
  const profsEscola = professores.filter(p => p.escolaIds.includes('1'));

  // Gerar próxima letra automaticamente
  const proximaLetra = useMemo(() => {
    if (!serieSel) return '';
    const turmasSerie = lista.filter(t => t.serieId === serieSel);
    const letras = turmasSerie.map(t => {
      const match = t.nome.match(/\s([A-Z])$/);
      return match ? match[1] : '';
    }).filter(Boolean).sort();
    if (letras.length === 0) return 'A';
    const ultimaLetra = letras[letras.length - 1];
    return String.fromCharCode(ultimaLetra.charCodeAt(0) + 1);
  }, [serieSel, lista]);

  const nomeTurma = useMemo(() => {
    if (!serieSel) return '';
    const serie = series.find(s => s.id === serieSel);
    return serie ? `${serie.nome} ${proximaLetra}` : '';
  }, [serieSel, proximaLetra]);

  const toggleProf = (id: string) => {
    setProfsSel(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleEditProf = (id: string) => {
    setEditProfsSel(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleCriar = (e: React.FormEvent) => {
    e.preventDefault();
    if (profsSel.length === 0) {
      toast.error('Selecione ao menos um professor.');
      return;
    }
    const nova: Turma = {
      id: `t-novo-${Date.now()}`,
      nome: nomeTurma,
      serieId: serieSel,
      escolaId: '1',
      sala: `Sala ${sala}`,
      professorIds: profsSel,
      frequenciaMedia: 0,
    };
    setLista(prev => [...prev, nova]);
    toast.success(`Turma "${nomeTurma}" criada com sucesso!`);
    setShowForm(false);
    setSerieSel('');
    setSala('');
    setProfsSel([]);
  };

  const openEdit = (turma: Turma) => {
    setEditId(turma.id);
    const salaNum = turma.sala.replace(/\D/g, '');
    setEditSala(salaNum || turma.sala);
    setEditProfsSel([...turma.professorIds]);
    setEditModalOpen(true);
  };

  const handleSalvarEdit = () => {
    if (editProfsSel.length === 0) {
      toast.error('Selecione ao menos um professor.');
      return;
    }
    setLista(prev => prev.map(t =>
      t.id === editId ? { ...t, sala: `Sala ${editSala}`, professorIds: editProfsSel } : t
    ));
    toast.success('Turma atualizada com sucesso!');
    setEditModalOpen(false);
    setEditId(null);
  };

  const alunosNaTurmaDelete = deleteId ? alunos.filter(a => a.turmaId === deleteId).length : 0;

  const handleDelete = () => {
    if (!deleteId) return;
    if (alunosNaTurmaDelete > 0) {
      toast.error(`Não é possível excluir: esta turma possui ${alunosNaTurmaDelete} aluno(s) vinculado(s).`);
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      return;
    }
    const turma = lista.find(t => t.id === deleteId);
    setLista(prev => prev.filter(t => t.id !== deleteId));
    toast.success(`Turma "${turma?.nome}" excluída.`);
    setDeleteConfirmOpen(false);
    setDeleteId(null);
  };

  const editingTurma = lista.find(t => t.id === editId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Turmas</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
          {showForm ? 'Cancelar' : '+ Nova Turma'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-lg border p-6 mb-6 max-w-lg">
          <h3 className="font-semibold mb-4">Nova Turma</h3>
          <form onSubmit={handleCriar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Série</label>
              <select value={serieSel} onChange={e => setSerieSel(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background text-sm">
                <option value="">Selecione...</option>
                {seriesEscola.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>

            {serieSel && (
              <div>
                <label className="block text-sm font-medium mb-1">Nome da Turma (gerado)</label>
                <input type="text" value={nomeTurma} readOnly className="w-full px-3 py-2 border rounded-md bg-muted text-sm" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Sala (número)</label>
              <input type="number" value={sala} onChange={e => setSala(e.target.value)} placeholder="Ex: 10" required min={1} className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Professor(es)</label>
              <div className="space-y-2 border rounded-md p-3 bg-background max-h-40 overflow-y-auto">
                {profsEscola.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={profsSel.includes(p.id)} onChange={() => toggleProf(p.id)} className="rounded border-input" />
                    <span>{p.nome}</span>
                    <span className="text-xs text-muted-foreground">({p.disciplinas.join(', ')})</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90">Criar Turma</button>
          </form>
        </div>
      )}

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Turma</th>
            <th className="text-left p-3 text-sm font-medium">Sala</th>
            <th className="text-left p-3 text-sm font-medium">Alunos</th>
            <th className="text-left p-3 text-sm font-medium">Freq. Média</th>
            <th className="text-left p-3 text-sm font-medium">Ações</th>
          </tr></thead>
          <tbody>
            {lista.map(t => (
              <tr key={t.id} className="border-b">
                <td className="p-3 text-sm font-medium">{t.nome}</td>
                <td className="p-3 text-sm">{t.sala}</td>
                <td className="p-3 text-sm">{alunos.filter(a => a.turmaId === t.id).length}</td>
                <td className="p-3 text-sm">
                  <span className={t.frequenciaMedia < 75 ? 'text-destructive font-bold' : 'text-primary font-bold'}>{t.frequenciaMedia}%</span>
                </td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Editar Turma */}
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
                {profsEscola.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editProfsSel.includes(p.id)} onChange={() => toggleEditProf(p.id)} className="rounded border-input" />
                    <span>{p.nome}</span>
                    <span className="text-xs text-muted-foreground">({p.disciplinas.join(', ')})</span>
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

      {/* Modal Confirmar Exclusão */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Turma"
        description={`Tem certeza que deseja excluir a turma "${lista.find(t => t.id === deleteId)?.nome}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </div>
  );
}
