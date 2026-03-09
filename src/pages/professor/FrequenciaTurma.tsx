import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { turmas, getAlunosByTurma, gerarFrequencia } from '@/data/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft } from 'lucide-react';

export default function FrequenciaTurma() {
  const { turmaId, escolaId } = useParams();
  const turma = turmas.find(t => t.id === turmaId);
  const alunosTurma = getAlunosByTurma(turmaId || '');
  const [dataSel, setDataSel] = useState('2026-03-07');

  if (!turma) return <div>Turma não encontrada</div>;

  const presentesEntrada: typeof alunosTurma = [];
  const ausentesEntrada: typeof alunosTurma = [];
  const presentesTurma: typeof alunosTurma = [];
  const ausentesTurma: typeof alunosTurma = [];

  alunosTurma.forEach(a => {
    const freq = gerarFrequencia(a.id, a.frequenciaEntrada, a.frequenciaTurma);
    const diaE = freq.entrada.find(r => r.data === dataSel);
    const diaT = freq.turma.find(r => r.data === dataSel);
    if (diaE?.status === 'presente') presentesEntrada.push(a);
    else ausentesEntrada.push(a);
    if (diaT?.status === 'presente') presentesTurma.push(a);
    else ausentesTurma.push(a);
  });

  const renderLista = (presentes: typeof alunosTurma, ausentes: typeof alunosTurma, freqGetter: (a: typeof alunosTurma[0]) => any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-semibold mb-2 badge-presente inline-block px-3 py-1 rounded-full">Presentes ({presentes.length})</h4>
        <div className="space-y-1 mt-2">
          {presentes.map(a => (
            <div key={a.id} className="bg-card border rounded p-2 text-sm flex justify-between items-center">
              <span>{a.nome}</span>
              <StatusBadge status="presente" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2 badge-ausente inline-block px-3 py-1 rounded-full">Ausentes ({ausentes.length})</h4>
        <div className="space-y-1 mt-2">
          {ausentes.map(a => {
            const freq = gerarFrequencia(a.id, a.frequenciaEntrada, a.frequenciaTurma);
            const dia = freqGetter(freq);
            return (
              <div key={a.id} className="bg-card border rounded p-2 text-sm flex justify-between items-center">
                <span>{a.nome}</span>
                <StatusBadge status={dia?.status || 'ausente'} />
              </div>
            );
          })}
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
          {renderLista(presentesEntrada, ausentesEntrada, (f) => f.entrada.find((r: any) => r.data === dataSel))}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Frequência por Turma/Aula</h3>
          {renderLista(presentesTurma, ausentesTurma, (f) => f.turma.find((r: any) => r.data === dataSel))}
        </div>
      </div>
    </div>
  );
}
