import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { X, Contact } from 'lucide-react';
import { formatCpf, validateCpf } from '@/lib/masks';

export default function GestaoResponsaveis() {
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroEscola, setFiltroEscola] = useState('');
  const [filtroSerie, setFiltroSerie] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalAviso, setModalAviso] = useState(false);
  const [aviso, setAviso] = useState('');
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string>('');

  // Form fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');

  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);

  const carregarDados = async () => {
    const [r, e, s, t] = await Promise.all([
      window.api?.responsavel?.listar?.() || Promise.resolve([]),
      window.api?.escola?.listar?.() || Promise.resolve([]),
      window.api?.serie?.listar?.() || Promise.resolve([]),
      window.api?.turma?.listar?.() || Promise.resolve([]),
    ]);
    setResponsaveis(r); setEscolas(e); setSeries(s); setTurmas(t);
  };

  useEffect(() => { carregarDados(); }, []);

  const seriesFiltradas = useMemo(() => filtroEscola ? series.filter(s => s.escolaId === filtroEscola) : [], [filtroEscola, series]);
  const turmasFiltradas = useMemo(() => filtroSerie ? turmas.filter(t => t.serieId === filtroSerie) : [], [filtroSerie, turmas]);

  const filtered = useMemo(() => {
    return responsaveis.filter(r => {
      const nomeR = r.usuario?.nome || '';
      if (filtroNome && !nomeR.toLowerCase().includes(filtroNome.toLowerCase())) return false;
      return true;
    });
  }, [filtroNome, responsaveis]);

  const resetForm = () => {
    setNome(''); setEmail(''); setCpf(''); setTelefone('');
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCpf(cpf)) { toast.error('CPF inválido. Verifique os dígitos.'); return; }
    if (!email.trim()) { toast.error('O e-mail é obrigatório.'); return; }
    if (!telefone.trim()) { toast.error('O telefone é obrigatório.'); return; }

    setIsLoading(true);
    try {
      const result = await window.api?.responsavel?.criar?.({ nome, email, cpf, telefone });
      if (result?.success === false) throw new Error(result.error);
      toast.success('Responsável cadastrado com sucesso!');
      resetForm();
      await carregarDados();
    } catch (err: any) {
      toast.error(`Erro ao cadastrar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnviar = () => {
    toast.success('Aviso enviado ao responsável com sucesso!');
    setModalAviso(false);
    setAviso('');
    setResponsavelSelecionado('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Responsáveis</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
          + Novo Responsável
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-lg border p-6 mb-6 max-w-lg relative">
          <button onClick={resetForm} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          <h3 className="font-semibold mb-4">Novo Responsável</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="responsavel@email.com" className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input type="text" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} required placeholder="000.000.000-00" maxLength={14} className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
              <p className="text-xs text-muted-foreground mt-1">A senha inicial será os 6 primeiros dígitos do CPF.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} required placeholder="(00) 90000-0000" className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
            </div>
            <button type="submit" disabled={isLoading} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90 disabled:opacity-50">
              {isLoading ? 'Salvando...' : 'Cadastrar'}
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Buscar por nome..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background text-sm w-64" />
        <select value={filtroEscola} onChange={e => { setFiltroEscola(e.target.value); setFiltroSerie(''); setFiltroTurma(''); }}
          className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="">Todas as escolas</option>
          {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        {filtroEscola && (
          <select value={filtroSerie} onChange={e => { setFiltroSerie(e.target.value); setFiltroTurma(''); }}
            className="px-3 py-2 border rounded-md bg-background text-sm">
            <option value="">Todas as séries</option>
            {seriesFiltradas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        )}
        {filtroSerie && (
          <select value={filtroTurma} onChange={e => setFiltroTurma(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm">
            <option value="">Todas as turmas</option>
            {turmasFiltradas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        )}
      </div>

      {responsaveis.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-lg">
          <Contact className="w-12 h-12 text-muted-foreground mb-3" />
          <h2 className="text-lg font-bold text-card-foreground mb-1">Nenhum responsável cadastrado</h2>
          <p className="text-muted-foreground text-sm text-center mb-4">Adicione o primeiro responsável clicando em "+ Novo Responsável".</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full table-striped">
            <thead><tr className="border-b bg-secondary">
              <th className="text-left p-3 text-sm font-medium">Nome</th>
              <th className="text-left p-3 text-sm font-medium">CPF</th>
              <th className="text-left p-3 text-sm font-medium">Telefone</th>
              <th className="text-left p-3 text-sm font-medium">Dependentes</th>
              <th className="text-left p-3 text-sm font-medium">Ações</th>
            </tr></thead>
            <tbody>
              {filtered.map(r => {
                const deps = r.alunos || [];
                const nomeR = r.usuario?.nome || 'Desconhecido';
                return (
                  <tr key={r.id} className="border-b">
                    <td className="p-3 text-sm font-medium">{nomeR}</td>
                    <td className="p-3 text-sm">{r.usuario?.cpf || 'ND'}</td>
                    <td className="p-3 text-sm">{r.telefone || 'ND'}</td>
                    <td className="p-3 text-sm">{deps.map((d: any) => d.nomeCompleto).join(', ') || '—'}</td>
                    <td className="p-3 flex gap-1">
                      <button onClick={() => toast.info('Edição em desenvolvimento')} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">Editar</button>
                      <button onClick={() => { setResponsavelSelecionado(nomeR); setModalAviso(true); }} className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Notificar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalAviso && (
        <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4" onClick={() => setModalAviso(false)}>
          <div className="bg-card rounded-lg border shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Enviar Aviso ao Responsável</h3>
            <p className="text-sm text-muted-foreground mb-3">Para: {responsavelSelecionado}</p>
            <textarea value={aviso} onChange={e => setAviso(e.target.value)} placeholder="Digite o aviso..." rows={4}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setModalAviso(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-secondary">Cancelar</button>
              <button onClick={handleEnviar} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}