import { useState } from 'react';
import { diretores as diretoresData, escolas } from '@/data/mockData';
import { toast } from 'sonner';
import { formatCpf } from '@/lib/masks';
import { X } from 'lucide-react';

export default function GestaoDiretores() {
  const [lista, setLista] = useState(diretoresData);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [escolasSel, setEscolasSel] = useState<string[]>([]);

  const resetForm = () => {
    setNome(''); setCpf(''); setEscolasSel([]);
    setShowForm(false); setEditId(null);
  };

  const openEdit = (id: string) => {
    const d = lista.find(x => x.id === id);
    if (!d) return;
    setNome(d.nome);
    setCpf(d.cpf);
    setEscolasSel([...d.escolaIds]);
    setEditId(id);
    setShowForm(true);
  };

  const toggleEscola = (id: string) => {
    setEscolasSel(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (escolasSel.length === 0) { toast.error('Selecione ao menos uma escola.'); return; }

    if (editId) {
      setLista(prev => prev.map(d => d.id === editId ? { ...d, nome, cpf, escolaIds: escolasSel } : d));
      toast.success('Diretor atualizado!');
    } else {
      const novo = { id: `d${Date.now()}`, nome, cpf, escolaIds: escolasSel };
      setLista(prev => [...prev, novo]);
      toast.success('Diretor cadastrado!');
    }
    resetForm();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Diretores</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
          + Novo Diretor
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-lg border p-6 mb-6 max-w-lg relative">
          <button onClick={resetForm} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          <h3 className="font-semibold mb-4">{editId ? 'Editar Diretor' : 'Novo Diretor'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input type="text" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} required placeholder="000.000.000-00" maxLength={14} className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
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

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Nome</th>
            <th className="text-left p-3 text-sm font-medium">CPF</th>
            <th className="text-left p-3 text-sm font-medium">Escola(s)</th>
            <th className="text-left p-3 text-sm font-medium">Ações</th>
          </tr></thead>
          <tbody>
            {lista.map(d => {
              const escolasDir = escolas.filter(e => d.escolaIds.includes(e.id));
              return (
                <tr key={d.id} className="border-b">
                  <td className="p-3 text-sm font-medium">{d.nome}</td>
                  <td className="p-3 text-sm">{d.cpf}</td>
                  <td className="p-3 text-sm">{escolasDir.map(e => e.nome).join(', ')}</td>
                  <td className="p-3">
                    <button onClick={() => openEdit(d.id)} className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded">Editar</button>
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
