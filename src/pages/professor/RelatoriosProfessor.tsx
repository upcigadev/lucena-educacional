import { useMemo, useRef, useState, useEffect } from 'react';
import { ReportFilters, useDefaultFilters } from '@/components/ReportFilters';
import { exportarPdf } from '@/lib/pdfExport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { listarTurmas, listarAlunos } from '@/lib/queries';

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

  const chartFreqRef = useRef<HTMLDivElement>(null);
  const chartFaltasRef = useRef<HTMLDivElement>(null);

  const turmasProf = turmas;

  const alunosFiltrados = useMemo(() => {
    let lista = alunos;
    if (filters.turmaId) lista = lista.filter(a => a.turmaId === filters.turmaId);
    return lista;
  }, [filters.turmaId, alunos]);

  const freqPorTurma = useMemo(() => {
    return turmasProf.map(t => {
      const alunosTurma = alunos.filter(a => a.turmaId === t.id);
      const media = 100; // Mock until real freq
      return { ...t, media, qtdAlunos: alunosTurma.length };
    });
  }, [turmasProf, alunos]);

  const alunosBaixaFreq = alunosFiltrados.filter(a => false);

  const faltasPorAluno = useMemo(() => {
    return alunosFiltrados.map(a => {
      const justificadas = 0;
      const naoJust = 0;
      return { nome: a.nomeCompleto, turma: a.turma?.nome, justificadas, naoJustificadas: naoJust, total: justificadas + naoJust };
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

        <TabsContent value="frequencia">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Frequência dos Alunos por Turma</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Frequência dos Alunos por Turma',
              periodo,
              colunas: ['Turma', 'Sala', 'Alunos', 'Freq. Média'],
              linhas: freqPorTurma.map(t => [t.nome, t.sala, t.qtdAlunos, `${t.media}%`]),
              chartElement: chartFreqRef.current,
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          <div ref={chartFreqRef} className="bg-card rounded-lg border p-4 mb-4">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={freqPorTurma.map(t => ({ nome: t.nome, media: t.media }))} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Frequência']} />
                <Bar dataKey="media" radius={[6, 6, 0, 0]}>
                  {freqPorTurma.map((t, i) => (
                    <Cell key={i} className={t.media < 75 ? 'fill-destructive' : 'fill-primary'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {freqPorTurma.map((t, i) => (
              <div key={t.id || i} className="bg-card rounded-lg border p-6 text-center">
                <div className="text-sm font-medium mb-1">{t.nome}</div>
                <div className="text-xs text-muted-foreground mb-2">{t.sala} — {t.qtdAlunos} alunos</div>
                <div className={`text-3xl font-bold ${t.media < 75 ? 'text-destructive' : 'text-primary'}`}>{t.media}%</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="baixa">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Alunos com Frequência Abaixo de 75%</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Alunos com Frequência Abaixo de 75%',
              periodo,
              colunas: ['Nome', 'Turma', 'Frequência'],
              linhas: alunosBaixaFreq.map(a => [a.nomeCompleto, a.turma?.nome, `100%`]),
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
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="faltas">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Faltas Justificadas vs Não Justificadas por Aluno</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Faltas por Aluno',
              periodo,
              colunas: ['Aluno', 'Turma', 'Justificadas', 'Não Justificadas', 'Total'],
              linhas: faltasPorAluno.map(f => [f.nome, f.turma, f.justificadas, f.naoJustificadas, f.total]),
              chartElement: chartFaltasRef.current,
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          <div ref={chartFaltasRef} className="bg-card rounded-lg border p-4 mb-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={faltasPorAluno.map(f => ({ nome: f.nome.split(' ')[0], justificadas: f.justificadas, naoJustificadas: f.naoJustificadas }))} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="justificadas" name="Justificadas" stackId="a" className="fill-amber-500" radius={[0, 0, 0, 0]} />
                <Bar dataKey="naoJustificadas" name="Não Justificadas" stackId="a" className="fill-destructive" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
