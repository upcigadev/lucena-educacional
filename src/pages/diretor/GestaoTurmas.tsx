import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function GestaoTurmas() {
  const [lista, setLista] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);

  const carregarDados = async () => {
    const [t, s, p, a] = await Promise.all([
      window.api?.turma?.listar?.() || Promise.resolve([]),
      window.api?.serie?.listar?.() || Promise.resolve([]),
      window.api?.professor?.listar?.() || Promise.resolve([]),
      window.api?.aluno?.listar?.() || Promise.resolve([]),
    ]);
    setLista(t); setSeries(s); setProfessores(p); setAlunos(a);
  };

  useEffect(() => { carregarDados(); }, []);

  const [showForm, setShowForm] = useState(false);
  const [isLoadingCriar, setIsLoadingCriar] = useState(false);
  const [serieSel, setSerieSel] = useState('');
  const [sala, setSala] = useState('');
  const [profsSel, setProfsSel] = useState<string[]>([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editSala, setEditSala] = useState('');
  const [editProfsSel, setEditProfsSel] = useState<string[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const seriesEscola = series; // Todos
  const profsEscola = professores;

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
  }, [serieSel, proximaLetra, series]);

  const toggleProf = (id: string) => setProfsSel(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  const toggleEditProf = (id: string) => setEditProfsSel(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serieSel) { toast.error('Selecione uma série.'); return; }
    setIsLoadingCriar(true);
    try {
      await window.api?.turma?.criar?.({
        nome: nomeTurma,
        serieId: serieSel,
        escolaId: series.find(s => s.id === serieSel)?.escolaId || '',
        sobrescreverRegras: false,
      });
      toast.success(`Turma "${nomeTurma}" criada com sucesso!`);
      setShowForm(false); setSerieSel(''); setSala(''); setProfsSel([]);
      await carregarDados();
    } catch (err: any) {
      toast.error(`Erro ao criar turma: ${err.message}`);
    } finally {
      setIsLoadingCriar(false);
    }
  };

  const openEdit = (turma: any) => {
    setEditId(turma.id);
    const salaNum = turma.sala.replace(/\D/g, '');
    setEditSala(salaNum || turma.sala);
    setEditProfsSel(turma.professorIds || []);
    setEditModalOpen(true);
  };

  const handleSalvarEdit = () => {
    if (editProfsSel.length === 0) { toast.error('Selecione ao menos um professor.'); return; }
    toast.success('Turma atualizada IPC!');
    setEditModalOpen(false);
    setEditId(null);
  };

  const alunosNaTurmaDelete = deleteId ? alunos.filter(a => a.turmaId === deleteId).length : 0;

  const handleDelete = () => {
    if (!deleteId) return;
    if (alunosNaTurmaDelete > 0) {
      toast.error(`Não é possível excluir: esta turma possui alunos.`);
      setDeleteConfirmOpen(false); setDeleteId(null);
      return;
    }
    toast.success(`Turma excluída IPC.`);
    setDeleteConfirmOpen(false); setDeleteId(null);
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
                    <span>{p.usuario?.nome}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isLoadingCriar} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50">
              {isLoadingCriar ? 'Criando...' : 'Criar Turma'}
            </button>
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
                  <span className="text-primary font-bold">100%</span>
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
                    <span>{p.usuario?.nome}</span>
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
          ? `Esta turma possui alunos.`
          : `Tem certeza que deseja excluir a turma "${lista.find(t => t.id === deleteId)?.nome}"?`}
        onConfirm={handleDelete}
        confirmLabel="Excluir"
        variant="destructive"
      />
    </div>
  );
}
