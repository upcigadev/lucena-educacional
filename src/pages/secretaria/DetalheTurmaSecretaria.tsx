import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { turmas, getAlunosByTurma, getProfessoresByTurma, gerarFrequencia } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft } from 'lucide-react';

export default function DetalheTurmaSecretaria() {
  const { turmaId, escolaId } = useParams();
  const turma = turmas.find(t => t.id === turmaId);
  const alunosTurma = getAlunosByTurma(turmaId || '');
  const profs = getProfessoresByTurma(turmaId || '');
  const [dataSel, setDataSel] = useState('2026-03-07');

  if (!turma) return <div>Turma não encontrada</div>;

  const dadosAlunos = alunosTurma.map(a => {
    const freq = gerarFrequencia(a.id, a.frequenciaEntrada, a.frequenciaTurma);
    return {
      aluno: a,
      entrada: freq.entrada.find(r => r.data === dataSel),
      turma: freq.turma.find(r => r.data === dataSel),
    };
  });

  return (
    <div>
      <Link to={`/secretaria/escola/${escolaId}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-2">{turma.nome}</h1>
      <p className="text-muted-foreground mb-6">{turma.sala} — Frequência: {turma.frequenciaMedia}%</p>

      <h2 className="text-lg font-semibold mb-3">Professores Vinculados</h2>
      <div className="bg-card rounded-lg border overflow-hidden mb-6">
        <table className="w-full table-striped">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Nome</th>
            <th className="text-left p-3 text-sm font-medium">Disciplinas</th>
          </tr></thead>
          <tbody>
            {profs.map(p => (
              <tr key={p.id} className="border-b">
                <td className="p-3 text-sm font-medium">{p.nome}</td>
                <td className="p-3 text-sm">{p.disciplinas.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold mb-3">Frequência</h2>
      <div className="mb-4">
        <label className="text-sm font-medium mr-2">Data:</label>
        <input type="date" value={dataSel} onChange={e => setDataSel(e.target.value)} className="px-3 py-1.5 border rounded-md bg-background text-sm" />
      </div>

      {['Entrada na Escola', 'Frequência por Turma'].map((titulo, idx) => {
        const key = idx === 0 ? 'entrada' : 'turma';
        const presentes = dadosAlunos.filter(d => d[key as 'entrada' | 'turma']?.status === 'presente');
        const ausentes = dadosAlunos.filter(d => d[key as 'entrada' | 'turma']?.status !== 'presente');
        return (
          <div key={titulo} className="mb-6">
            <h3 className="font-medium mb-2">{titulo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold badge-presente px-3 py-1 rounded-full">Presentes ({presentes.length})</span>
                <div className="space-y-1 mt-2">
                  {presentes.map(d => (
                    <div key={d.aluno.id} className="bg-card border rounded p-2 text-sm">{d.aluno.nome}</div>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold badge-ausente px-3 py-1 rounded-full">Ausentes ({ausentes.length})</span>
                <div className="space-y-1 mt-2">
                  {ausentes.map(d => (
                    <div key={d.aluno.id} className="bg-card border rounded p-2 text-sm flex justify-between">
                      <span>{d.aluno.nome}</span>
                      <StatusBadge status={d[key as 'entrada' | 'turma']?.status || 'ausente'} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
