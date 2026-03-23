import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listarAlunos, listarTurmas } from '@/lib/queries';

export default function ListaAlunos() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');

  useEffect(() => {
    Promise.all([
      listarAlunos(),
      listarTurmas()
    ]).then(([a, t]) => {
      setAlunos(a); setTurmas(t);
    }).catch(console.error);
  }, []);

  const meusAlunos = alunos;
  const turmasProf = turmas;
  
  const filtered = meusAlunos.filter(a => {
    if (filtroNome && !a.nomeCompleto.toLowerCase().includes(filtroNome.toLowerCase())) return false;
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
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b cursor-pointer hover:bg-secondary/50">
                <td className="p-3 text-sm">
                  <Link to={`/professor/aluno/${a.id}`} className="text-primary font-medium hover:underline">{a.nomeCompleto}</Link>
                </td>
                <td className="p-3 text-sm">{a.cpf || '--'}</td>
                <td className="p-3 text-sm">{a.turma?.nome}</td>
                <td className="p-3 text-sm font-medium">
                  <span className="text-primary">100%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
