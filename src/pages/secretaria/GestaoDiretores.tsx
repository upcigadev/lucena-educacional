import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatCpf, validateCpf } from '@/lib/masks';
import { X, Users } from 'lucide-react';

export default function GestaoDiretores() {
  const [lista, setLista] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [escolasSel, setEscolasSel] = useState<string[]>([]);

  const carregarDados = async () => {
    const [d, e] = await Promise.all([
      window.api?.diretor?.listar?.() || Promise.resolve([]),
      window.api?.escola?.listar?.() || Promise.resolve([]),
    ]);
    setLista(d);
    setEscolas(e);
  };

  useEffect(() => { carregarDados(); }, []);

  const resetForm = () => {
    setNome(''); setEmail(''); setCpf(''); setEscolasSel([]);
    setShowForm(false); setEditId(null);
  };

  const openEdit = (id: string) => {
    const d = lista.find(x => x.id === id);
    if (!d) return;
    setNome(d.usuario?.nome || '');
    setEmail(d.usuario?.email || '');
    setCpf(d.usuario?.cpf || '');
    setEscolasSel(d.escolaId ? [d.escolaId] : []);
    setEditId(id);
    setShowForm(true);
  };

  const toggleEscola = (id: string) => {
    // Diretor tem uma escola no schema; allow toggle but keep single selection
    setEscolasSel(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCpf(cpf)) { toast.error('CPF inválido. Verifique os dígitos.'); return; }
    if (!email.trim()) { toast.error('O e-mail é obrigatório.'); return; }
    if (escolasSel.length === 0) { toast.error('Selecione ao menos uma escola.'); return; }

    setIsLoading(true);
    try {
      const result = await window.api?.diretor?.criar?.({
        nome,
        email,
        cpf,
        escolaId: escolasSel[0],
      });
      if (result?.success === false) throw new Error(result.error);
      toast.success('Diretor cadastrado com sucesso!');
      resetForm();
      await carregarDados();
    } catch (err: any) {
      toast.error(`Erro ao cadastrar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="diretor@escola.edu.br" className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input type="text" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} required placeholder="000.000.000-00" maxLength={14} className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
              <p className="text-xs text-muted-foreground mt-1">A senha inicial será os 6 primeiros dígitos do CPF.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Escola vinculada</label>
              <div className="space-y-2 border rounded-md p-3 bg-background max-h-40 overflow-y-auto">
                {escolas.map((e: any) => (
                  <label key={e.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={escolasSel.includes(e.id)} onChange={() => toggleEscola(e.id)} className="rounded border-input" />
                    <span>{e.nome}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50">
              {isLoading ? 'Salvando...' : (editId ? 'Salvar' : 'Cadastrar')}
            </button>
          </form>
        </div>
      )}

      {lista.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-lg">
          <Users className="w-12 h-12 text-muted-foreground mb-3" />
          <h2 className="text-lg font-bold text-card-foreground mb-1">Nenhum diretor cadastrado</h2>
          <p className="text-muted-foreground text-sm text-center mb-4">Adicione o primeiro diretor clicando em "+ Novo Diretor".</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full table-striped">
            <thead><tr className="border-b bg-secondary">
              <th className="text-left p-3 text-sm font-medium">Nome</th>
              <th className="text-left p-3 text-sm font-medium">E-mail</th>
              <th className="text-left p-3 text-sm font-medium">CPF</th>
              <th className="text-left p-3 text-sm font-medium">Escola</th>
              <th className="text-left p-3 text-sm font-medium">Ações</th>
            </tr></thead>
            <tbody>
              {lista.map(d => (
                <tr key={d.id} className="border-b">
                  <td className="p-3 text-sm font-medium">{d.usuario?.nome}</td>
                  <td className="p-3 text-sm">{d.usuario?.email}</td>
                  <td className="p-3 text-sm">{d.usuario?.cpf}</td>
                  <td className="p-3 text-sm">{d.escola?.nome || '—'}</td>
                  <td className="p-3">
                    <button onClick={() => openEdit(d.id)} className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
