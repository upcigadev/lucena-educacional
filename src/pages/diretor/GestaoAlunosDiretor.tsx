import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAlunosByEscola } from '@/data/mockData';

export default function GestaoAlunosDiretor() {
  const alunosEscola = getAlunosByEscola('1');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroSerie, setFiltroSerie] = useState('');

  const seriesUnicas = [...new Set(alunosEscola.map(a => a.serieName))];
  const filtered = alunosEscola.filter(a => {
    if (filtroNome && !a.nome.toLowerCase().includes(filtroNome.toLowerCase())) return false;
    if (filtroSerie && a.serieName !== filtroSerie) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Alunos</h1>
        <Link to="/diretor/novo-aluno" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
          + Novo Aluno
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Buscar por nome..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background text-sm w-64" />
        <select value={filtroSerie} onChange={e => setFiltroSerie(e.target.value)} className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="">Todas as séries</option>
          {seriesUnicas.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Nome</th>
            <th className="text-left p-3 text-sm font-medium">CPF</th>
            <th className="text-left p-3 text-sm font-medium">Matrícula</th>
            <th className="text-left p-3 text-sm font-medium">Série</th>
            <th className="text-left p-3 text-sm font-medium">Turma</th>
            <th className="text-left p-3 text-sm font-medium">Freq.</th>
          </tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b">
                <td className="p-3 text-sm">
                  <Link to={`/diretor/aluno/${a.id}`} className="text-primary font-medium hover:underline">{a.nome}</Link>
                </td>
                <td className="p-3 text-sm">{a.cpf}</td>
                <td className="p-3 text-sm">{a.matricula}</td>
                <td className="p-3 text-sm">{a.serieName}</td>
                <td className="p-3 text-sm">{a.turmaName}</td>
                <td className="p-3 text-sm">
                  <span className={a.frequenciaEntrada < 75 ? 'text-destructive font-bold' : 'text-primary font-bold'}>{a.frequenciaEntrada}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
