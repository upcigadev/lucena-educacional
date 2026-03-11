import { useState, useMemo } from 'react';
import { responsaveis, getDependentes, escolas, series, turmas, alunos } from '@/data/mockData';
import { toast } from 'sonner';

export default function GestaoResponsaveis() {
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroEscola, setFiltroEscola] = useState('');
  const [filtroSerie, setFiltroSerie] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');

  const seriesFiltradas = useMemo(() => filtroEscola ? series.filter(s => s.escolaId === filtroEscola) : [], [filtroEscola]);
  const turmasFiltradas = useMemo(() => filtroSerie ? turmas.filter(t => t.serieId === filtroSerie) : [], [filtroSerie]);

  // Filtrar responsáveis baseado na hierarquia
  const filtered = useMemo(() => {
    return responsaveis.filter(r => {
      if (filtroNome && !r.nome.toLowerCase().includes(filtroNome.toLowerCase())) return false;

      if (filtroEscola) {
        const deps = getDependentes(r.id);
        let depsFiltered = deps.filter(d => d.escolaId === filtroEscola);
        if (filtroSerie) {
          const turmasDaSerie = turmas.filter(t => t.serieId === filtroSerie).map(t => t.id);
          depsFiltered = depsFiltered.filter(d => turmasDaSerie.includes(d.turmaId));
        }
        if (filtroTurma) {
          depsFiltered = depsFiltered.filter(d => d.turmaId === filtroTurma);
        }
        if (depsFiltered.length === 0) return false;
      }

      return true;
    });
  }, [filtroNome, filtroEscola, filtroSerie, filtroTurma]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Gestão de Responsáveis</h1>

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
              const deps = getDependentes(r.id);
              return (
                <tr key={r.id} className="border-b">
                  <td className="p-3 text-sm font-medium">{r.nome}</td>
                  <td className="p-3 text-sm">{r.cpf}</td>
                  <td className="p-3 text-sm">{r.whatsapp}</td>
                  <td className="p-3 text-sm">{deps.map(d => d.nome).join(', ')}</td>
                  <td className="p-3 flex gap-1">
                    <button onClick={() => toast.info('Edição em desenvolvimento')} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">Editar</button>
                    <button onClick={() => toast.success('Notificação enviada!')} className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Notificar</button>
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
