import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { listarTurmas, listarAlunos } from '@/lib/queries';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft } from 'lucide-react';

export default function FrequenciaTurma() {
  const { turmaId, escolaId } = useParams();
  const [dataSel, setDataSel] = useState('2026-03-07');

  const [turmas, setTurmas] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      listarTurmas(),
      listarAlunos()
    ]).then(([t, a]) => {
      setTurmas(t); setAlunos(a);
    }).catch(console.error);
  }, []);

  const turma = turmas.find(t => t.id === turmaId);
  const alunosTurma = alunos.filter(a => a.turmaId === turmaId);

  if (!turmas.length) return <div>Carregando...</div>;
  if (!turma) return <div>Turma não encontrada</div>;

  const getFreqDia = () => {
    return { entrada: { status: 'presente' }, turma: { status: 'presente' } }; // mock async behavior for now
  };

  const dadosAlunos = alunosTurma.map(a => ({ aluno: a, ...getFreqDia() }));

  const presentesEntrada = dadosAlunos.filter(d => true);
  const ausentesEntrada = dadosAlunos.filter(d => false);
  const presentesTurma = presentesEntrada;
  const ausentesTurma = ausentesEntrada;

  const renderLista = (presentes: typeof dadosAlunos, ausentes: typeof dadosAlunos, tipo: 'entrada' | 'turma') => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-semibold mb-2 badge-presente inline-block px-3 py-1 rounded-full">Presentes ({presentes.length})</h4>
        <div className="space-y-1 mt-2">
          {presentes.map(d => (
            <div key={d.aluno.id} className="bg-card border rounded p-2 text-sm flex justify-between items-center">
              <span>{d.aluno.nomeCompleto}</span>
              <StatusBadge status="PRESENTE" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2 badge-ausente inline-block px-3 py-1 rounded-full">Ausentes ({ausentes.length})</h4>
        <div className="space-y-1 mt-2">
          {ausentes.map(d => (
            <div key={d.aluno.id} className="bg-card border rounded p-2 text-sm flex justify-between items-center">
              <span>{d.aluno.nomeCompleto}</span>
              <StatusBadge status={'AUSENTE'} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Link to={`/professor/escola/${escolaId}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-2">Frequência — {turma.nome}</h1>

      <div className="mb-6">
        <label className="text-sm font-medium mr-2">Data:</label>
        <input type="date" value={dataSel} onChange={e => setDataSel(e.target.value)} className="px-3 py-1.5 border rounded-md bg-background text-sm" />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Entrada na Escola (Portaria)</h3>
          {renderLista(presentesEntrada, ausentesEntrada, 'entrada')}
        </div>
      </div>
    </div>
  );
}
