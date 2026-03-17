import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { alunos, escolas, series, turmas } from '@/data/mockData';
import { toast } from 'sonner';

const cadastrosPendentes = [
  { id: 'p1', nome: 'Felipe Araújo', cpf: '112.233.445-56', escola: 'E.M. Padre Cícero', serie: '2º Ano', criadoPor: 'João Ferreira' },
  { id: 'p2', nome: 'Camila Torres', cpf: '223.344.556-67', escola: 'E.M. Castro Alves', serie: '3º Ano', criadoPor: 'Ana Santos' },
];

export default function GestaoAlunosSecretaria() {
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroEscola, setFiltroEscola] = useState('');
  const [filtroSerie, setFiltroSerie] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [pendentes, setPendentes] = useState(cadastrosPendentes);

  const seriesFiltradas = useMemo(() => filtroEscola ? series.filter(s => s.escolaId === filtroEscola) : [], [filtroEscola]);
  const turmasFiltradas = useMemo(() => filtroSerie ? turmas.filter(t => t.serieId === filtroSerie) : [], [filtroSerie]);

  const filtered = useMemo(() => {
    return alunos.filter(a => {
      if (filtroNome && !a.nome.toLowerCase().includes(filtroNome.toLowerCase())) return false;
      if (filtroEscola && a.escolaId !== filtroEscola) return false;
      if (filtroSerie) {
        const turmasDaSerie = turmas.filter(t => t.serieId === filtroSerie).map(t => t.id);
        if (!turmasDaSerie.includes(a.turmaId)) return false;
      }
      if (filtroTurma && a.turmaId !== filtroTurma) return false;
      return true;
    });
  }, [filtroNome, filtroEscola, filtroSerie, filtroTurma]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Alunos — Global</h1>
        <button onClick={() => toast.info('Formulário de novo aluno em desenvolvimento')} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">+ Novo Aluno</button>
      </div>

      {pendentes.length > 0 && (
        <div className="bg-card rounded-lg border p-4 mb-6">
          <h2 className="font-semibold mb-3">Cadastros Pendentes de Aprovação</h2>
          <div className="space-y-2">
            {pendentes.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-secondary/50 rounded p-3">
                <div>
                  <span className="font-medium text-sm">{p.nome}</span>
                  <span className="text-xs text-muted-foreground ml-2">{p.escola} — {p.serie}</span>
                  <span className="text-xs text-muted-foreground ml-2">por {p.criadoPor}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setPendentes(prev => prev.filter(x => x.id !== p.id)); toast.success('Cadastro aprovado!'); }}
                    className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded">Aprovar</button>
                  <button onClick={() => { setPendentes(prev => prev.filter(x => x.id !== p.id)); toast.info('Cadastro rejeitado'); }}
                    className="text-xs bg-destructive text-destructive-foreground px-3 py-1 rounded">Rejeitar</button>
                </div>
              </div>
            ))}
          </div>
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

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Nome</th>
            <th className="text-left p-3 text-sm font-medium">CPF</th>
            <th className="text-left p-3 text-sm font-medium">Escola</th>
            <th className="text-left p-3 text-sm font-medium">Série</th>
            <th className="text-left p-3 text-sm font-medium">Turma</th>
            <th className="text-left p-3 text-sm font-medium">Freq.</th>
          </tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b">
                <td className="p-3 text-sm font-medium">{a.nome}</td>
                <td className="p-3 text-sm">{a.cpf}</td>
                <td className="p-3 text-sm">{a.escolaNome}</td>
                <td className="p-3 text-sm">{a.serieName}</td>
                <td className="p-3 text-sm">{a.turmaName}</td>
                <td className="p-3 text-sm"><span className={a.frequenciaEntrada < 75 ? 'text-destructive font-bold' : 'text-primary font-bold'}>{a.frequenciaEntrada}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
