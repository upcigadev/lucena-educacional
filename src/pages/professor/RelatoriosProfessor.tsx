import { useMemo } from 'react';
import { alunos, turmas, gerarFrequencia } from '@/data/mockData';
import { ReportFilters, useDefaultFilters } from '@/components/ReportFilters';
import { exportarPdf } from '@/lib/pdfExport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

// Professor id=1 (Carlos Mendes), turmas t1, t2, t7
const PROF_TURMA_IDS = ['t1', 't2', 't7'];

function getPeriodoLabel(filters: ReturnType<typeof useDefaultFilters>[0]) {
  if (filters.periodoInicio && filters.periodoFim) {
    const f = (d: Date) => d.toLocaleDateString('pt-BR');
    return `${f(filters.periodoInicio)} a ${f(filters.periodoFim)}`;
  }
  if (filters.mes) {
    const [a, m] = filters.mes.split('-');
    const meses: Record<string, string> = { '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril', '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto', '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro' };
    return `${meses[m]} ${a}`;
  }
  return 'Todos os períodos';
}

export default function RelatoriosProfessor() {
  const [filters, setFilters] = useDefaultFilters();

  const turmasProf = useMemo(() => turmas.filter(t => PROF_TURMA_IDS.includes(t.id)), []);

  const alunosFiltrados = useMemo(() => {
    let lista = alunos.filter(a => PROF_TURMA_IDS.includes(a.turmaId));
    if (filters.turmaId) lista = lista.filter(a => a.turmaId === filters.turmaId);
    return lista;
  }, [filters.turmaId]);

  // 1. Frequência por turma
  const freqPorTurma = useMemo(() => {
    return turmasProf.map(t => {
      const alunosTurma = alunos.filter(a => a.turmaId === t.id);
      const media = alunosTurma.length > 0 ? Math.round(alunosTurma.reduce((s, a) => s + a.frequenciaEntrada, 0) / alunosTurma.length) : 0;
      return { ...t, media, qtdAlunos: alunosTurma.length };
    });
  }, [turmasProf]);

  // 2. Alunos abaixo de 75%
  const alunosBaixaFreq = useMemo(() => alunosFiltrados.filter(a => a.frequenciaEntrada < 75), [alunosFiltrados]);

  // 3. Faltas por aluno
  const faltasPorAluno = useMemo(() => {
    return alunosFiltrados.map(a => {
      const freq = gerarFrequencia(a.id, a.frequenciaEntrada, a.frequenciaTurma);
      const justificadas = freq.entrada.filter(r => r.status === 'justificado').length;
      const naoJust = freq.entrada.filter(r => r.status === 'ausente').length;
      return { nome: a.nome, turma: a.turmaName, justificadas, naoJustificadas: naoJust, total: justificadas + naoJust };
    });
  }, [alunosFiltrados]);

  const periodo = getPeriodoLabel(filters);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
      </div>

      <ReportFilters values={filters} onChange={setFilters} showEscola={false} showSerie={false} showTurma={false} />

      {/* Filtro por turma do professor */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filters.turmaId} onChange={e => setFilters({ ...filters, turmaId: e.target.value })}
          className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="">Todas as turmas</option>
          {turmasProf.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      </div>

      <Tabs defaultValue="frequencia" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="frequencia" className="text-xs">Frequência por Turma</TabsTrigger>
          <TabsTrigger value="baixa" className="text-xs">Freq. Abaixo 75%</TabsTrigger>
          <TabsTrigger value="faltas" className="text-xs">Faltas por Aluno</TabsTrigger>
        </TabsList>

        {/* Frequência por turma */}
        <TabsContent value="frequencia">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Frequência dos Alunos por Turma</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Frequência dos Alunos por Turma',
              periodo,
              colunas: ['Turma', 'Sala', 'Alunos', 'Freq. Média'],
              linhas: freqPorTurma.map(t => [t.nome, t.sala, t.qtdAlunos, `${t.media}%`]),
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {freqPorTurma.map(t => (
              <div key={t.id} className="bg-card rounded-lg border p-6 text-center">
                <div className="text-sm font-medium mb-1">{t.nome}</div>
                <div className="text-xs text-muted-foreground mb-2">{t.sala} — {t.qtdAlunos} alunos</div>
                <div className={`text-3xl font-bold ${t.media < 75 ? 'text-destructive' : 'text-primary'}`}>{t.media}%</div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Alunos abaixo de 75% */}
        <TabsContent value="baixa">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Alunos com Frequência Abaixo de 75%</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Alunos com Frequência Abaixo de 75%',
              periodo,
              colunas: ['Nome', 'Turma', 'Frequência'],
              linhas: alunosBaixaFreq.map(a => [a.nome, a.turmaName, `${a.frequenciaEntrada}%`]),
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          {alunosBaixaFreq.length === 0 ? (
            <div className="bg-card rounded-lg border p-8 text-center text-muted-foreground">Nenhum aluno com frequência abaixo de 75%</div>
          ) : (
            <div className="bg-card rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b bg-secondary">
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">Turma</th>
                  <th className="text-left p-3 text-sm font-medium">Frequência</th>
                </tr></thead>
                <tbody>
                  {alunosBaixaFreq.map(a => (
                    <tr key={a.id} className="border-b">
                      <td className="p-3 text-sm font-medium">{a.nome}</td>
                      <td className="p-3 text-sm">{a.turmaName}</td>
                      <td className="p-3 text-sm text-destructive font-bold">{a.frequenciaEntrada}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Faltas por aluno */}
        <TabsContent value="faltas">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Faltas Justificadas vs Não Justificadas por Aluno</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Faltas por Aluno',
              periodo,
              colunas: ['Aluno', 'Turma', 'Justificadas', 'Não Justificadas', 'Total'],
              linhas: faltasPorAluno.map(f => [f.nome, f.turma, f.justificadas, f.naoJustificadas, f.total]),
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b bg-secondary">
                <th className="text-left p-3 text-sm font-medium">Aluno</th>
                <th className="text-left p-3 text-sm font-medium">Turma</th>
                <th className="text-left p-3 text-sm font-medium">Justificadas</th>
                <th className="text-left p-3 text-sm font-medium">Não Just.</th>
                <th className="text-left p-3 text-sm font-medium">Total</th>
              </tr></thead>
              <tbody>
                {faltasPorAluno.map((f, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3 text-sm font-medium">{f.nome}</td>
                    <td className="p-3 text-sm">{f.turma}</td>
                    <td className="p-3 text-sm text-amber-600 font-semibold">{f.justificadas}</td>
                    <td className="p-3 text-sm text-destructive font-semibold">{f.naoJustificadas}</td>
                    <td className="p-3 text-sm font-bold">{f.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
