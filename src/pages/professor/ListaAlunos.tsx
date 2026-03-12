import { useState } from 'react';
import { Link } from 'react-router-dom';
import { alunos, turmas, professores } from '@/data/mockData';

export default function ListaAlunos() {
  const prof = professores[0]; // Carlos Mendes
  const meusAlunos = alunos.filter(a => prof.turmaIds.includes(a.turmaId));
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');

  const turmasProf = turmas.filter(t => prof.turmaIds.includes(t.id));
  const filtered = meusAlunos.filter(a => {
    if (filtroNome && !a.nome.toLowerCase().includes(filtroNome.toLowerCase())) return false;
    if (filtroTurma && a.turmaId !== filtroTurma) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Meus Alunos</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Buscar por nome..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background text-sm w-64" />
        <select value={filtroTurma} onChange={e => setFiltroTurma(e.target.value)} className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="">Todas as turmas</option>
          {turmasProf.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead>
            <tr className="border-b bg-secondary">
              <th className="text-left p-3 text-sm font-medium">Nome</th>
              <th className="text-left p-3 text-sm font-medium">CPF</th>
              <th className="text-left p-3 text-sm font-medium">Turma</th>
              <th className="text-left p-3 text-sm font-medium">Freq. Entrada</th>
              {/* <th className="text-left p-3 text-sm font-medium">Freq. Turma</th> */}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b cursor-pointer hover:bg-secondary/50">
                <td className="p-3 text-sm">
                  <Link to={`/professor/aluno/${a.id}`} className="text-primary font-medium hover:underline">{a.nome}</Link>
                </td>
                <td className="p-3 text-sm">{a.cpf}</td>
                <td className="p-3 text-sm">{a.turmaName}</td>
                <td className="p-3 text-sm font-medium">
                  <span className={a.frequenciaEntrada < 75 ? 'text-destructive' : 'text-primary'}>{a.frequenciaEntrada}%</span>
                </td>
                <td className="p-3 text-sm font-medium">
                  <span className={a.frequenciaTurma < 75 ? 'text-destructive' : 'text-primary'}>{a.frequenciaTurma}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
