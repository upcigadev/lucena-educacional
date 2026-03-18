import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

export default function ResponsaveisDiretor() {
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroEscola, setFiltroEscola] = useState('');
  const [filtroSerie, setFiltroSerie] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [aviso, setAviso] = useState('');
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string>('');

  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      window.api?.responsavel?.listar?.() || Promise.resolve([]),
      window.api?.escola?.listar?.() || Promise.resolve([]),
      window.api?.serie?.listar?.() || Promise.resolve([]),
      window.api?.turma?.listar?.() || Promise.resolve([])
    ]).then(([r, e, s, t]) => {
      setResponsaveis(r); setEscolas(e); setSeries(s); setTurmas(t);
    });
  }, []);

  const escolasDiretor = escolas; // Simulando escola vinculada

  const seriesFiltradas = useMemo(() => filtroEscola ? series.filter(s => s.escolaId === filtroEscola) : [], [filtroEscola, series]);
  const turmasFiltradas = useMemo(() => filtroSerie ? turmas.filter(t => t.serieId === filtroSerie) : [], [filtroSerie, turmas]);

  const filtered = useMemo(() => {
    return responsaveis.filter(r => {
      const nomeR = r.usuario?.nome || 'Desconhecido';
      if (filtroNome && !nomeR.toLowerCase().includes(filtroNome.toLowerCase())) return false;
      return true;
    });
  }, [filtroNome, filtroEscola, filtroSerie, filtroTurma, responsaveis]);

  const handleEnviar = () => {
    toast.success('Aviso enviado ao responsável com sucesso!');
    setModalOpen(false);
    setAviso('');
    setResponsavelSelecionado('');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Responsáveis</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Buscar por nome..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background text-sm w-64" />
        <select value={filtroEscola} onChange={e => { setFiltroEscola(e.target.value); setFiltroSerie(''); setFiltroTurma(''); }}
          className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="">Todas as escolas</option>
          {escolasDiretor.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
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

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Nome</th>
            <th className="text-left p-3 text-sm font-medium">CPF</th>
            <th className="text-left p-3 text-sm font-medium">WhatsApp</th>
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
                  <td className="p-3 text-sm">{deps.map((d: any) => d.nomeCompleto).join(', ')}</td>
                  <td className="p-3">
                    <button onClick={() => { setResponsavelSelecionado(nomeR); setModalOpen(true); }} className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Notificar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-card rounded-lg border shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Enviar Aviso ao Responsável</h3>
            <p className="text-sm text-muted-foreground mb-3">Para: {responsavelSelecionado}</p>
            <textarea value={aviso} onChange={e => setAviso(e.target.value)} placeholder="Digite o aviso..." rows={4}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-secondary">Cancelar</button>
              <button onClick={handleEnviar} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}