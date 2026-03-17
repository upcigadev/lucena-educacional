import { useState } from 'react';
import { professores as professoresData, escolas } from '@/data/mockData';
import { toast } from 'sonner';
import { formatCpf } from '@/lib/masks';
import { X } from 'lucide-react';

export default function GestaoProfessoresSecretaria() {
  const [lista, setLista] = useState(professoresData);
  const [filtroNome, setFiltroNome] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [disciplinas, setDisciplinas] = useState('');
  const [escolasSel, setEscolasSel] = useState<string[]>([]);

  const filtered = lista.filter(p => !filtroNome || p.nome.toLowerCase().includes(filtroNome.toLowerCase()));

  const resetForm = () => {
    setNome(''); setCpf(''); setDisciplinas(''); setEscolasSel([]);
    setShowForm(false); setEditId(null);
  };

  const openEdit = (id: string) => {
    const p = lista.find(x => x.id === id);
    if (!p) return;
    setNome(p.nome);
    setCpf(p.cpf);
    setDisciplinas(p.disciplinas.join(', '));
    setEscolasSel([...p.escolaIds]);
    setEditId(id);
    setShowForm(true);
  };

  const toggleEscola = (id: string) => {
    setEscolasSel(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (escolasSel.length === 0) { toast.error('Selecione ao menos uma escola.'); return; }

    const discs = disciplinas.split(',').map(d => d.trim()).filter(Boolean);
    if (editId) {
      setLista(prev => prev.map(p => p.id === editId ? { ...p, nome, cpf, disciplinas: discs, escolaIds: escolasSel } : p));
      toast.success('Professor atualizado!');
    } else {
      const novo = { id: `p${Date.now()}`, nome, cpf, disciplinas: discs, escolaIds: escolasSel, turmaIds: [] };
      setLista(prev => [...prev, novo]);
      toast.success('Professor cadastrado!');
    }
    resetForm();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Professores</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
          + Novo Professor
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-lg border p-6 mb-6 max-w-lg relative">
          <button onClick={resetForm} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          <h3 className="font-semibold mb-4">{editId ? 'Editar Professor' : 'Novo Professor'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input type="text" value={cpf} onChange={e => setCpf(e.target.value)} required placeholder="000.000.000-00" className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Disciplinas (separadas por vírgula)</label>
              <input type="text" value={disciplinas} onChange={e => setDisciplinas(e.target.value)} required placeholder="Matemática, Ciências" className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Escola(s) vinculada(s)</label>
              <div className="space-y-2 border rounded-md p-3 bg-background max-h-40 overflow-y-auto">
                {escolas.map(e => (
                  <label key={e.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={escolasSel.includes(e.id)} onChange={() => toggleEscola(e.id)} className="rounded border-input" />
                    <span>{e.nome}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90">
              {editId ? 'Salvar' : 'Cadastrar'}
            </button>
          </form>
        </div>
      )}

      <input type="text" placeholder="Buscar por nome..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)}
        className="px-3 py-2 border rounded-md bg-background text-sm w-64 mb-4" />

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Nome</th>
            <th className="text-left p-3 text-sm font-medium">CPF</th>
            <th className="text-left p-3 text-sm font-medium">Disciplinas</th>
            <th className="text-left p-3 text-sm font-medium">Escolas</th>
            <th className="text-left p-3 text-sm font-medium">Ações</th>
          </tr></thead>
          <tbody>
            {filtered.map(p => {
              const escolasProf = escolas.filter(e => p.escolaIds.includes(e.id));
              return (
                <tr key={p.id} className="border-b">
                  <td className="p-3 text-sm font-medium">{p.nome}</td>
                  <td className="p-3 text-sm">{p.cpf}</td>
                  <td className="p-3 text-sm">{p.disciplinas.join(', ')}</td>
                  <td className="p-3 text-sm">{escolasProf.map(e => e.nome).join(', ')}</td>
                  <td className="p-3">
                    <button onClick={() => openEdit(p.id)} className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded">Editar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
