import { useMemo } from 'react';
import { escolas, alunos, turmas, series, justificativas, gerarFrequencia } from '@/data/mockData';
import { ReportFilters, useDefaultFilters } from '@/components/ReportFilters';
import { exportarPdf } from '@/lib/pdfExport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine } from 'recharts';

// Diretor gerencia escola id=1 (mock)
const ESCOLA_ID = '1';

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

export default function RelatoriosDiretor() {
  const [filters, setFilters] = useDefaultFilters();
  const escola = escolas.find(e => e.id === ESCOLA_ID)!;

  const alunosFiltrados = useMemo(() => {
    let lista = alunos.filter(a => a.escolaId === ESCOLA_ID);
    if (filters.turmaId) lista = lista.filter(a => a.turmaId === filters.turmaId);
    else if (filters.serieId) {
      const turmasDaSerie = turmas.filter(t => t.serieId === filters.serieId).map(t => t.id);
      lista = lista.filter(a => turmasDaSerie.includes(a.turmaId));
    }
    return lista;
  }, [filters]);

  const justFiltradas = useMemo(() => justificativas.filter(j => j.escolaId === ESCOLA_ID), []);

  // Frequência geral com evolução
  const freqGeral = useMemo(() => {
    const meses = [{ key: '2026-02', label: 'Fev/2026' }, { key: '2026-03', label: 'Mar/2026' }];
    return meses.map(m => {
      const alunosEsc = alunos.filter(a => a.escolaId === ESCOLA_ID);
      let totalPresentes = 0, totalDias = 0;
      alunosEsc.forEach(a => {
        const freq = gerarFrequencia(a.id, a.frequenciaEntrada, a.frequenciaTurma);
        const doMes = freq.entrada.filter(r => r.data.startsWith(m.key));
        totalDias += doMes.length;
        totalPresentes += doMes.filter(r => r.status === 'presente' || r.status === 'justificado').length;
      });
      return { mes: m.label, frequencia: totalDias > 0 ? Math.round((totalPresentes / totalDias) * 100) : 0 };
    });
  }, []);

  // Alunos abaixo de 75%
  const alunosBaixaFreq = useMemo(() => alunosFiltrados.filter(a => a.frequenciaEntrada < 75), [alunosFiltrados]);

  // Faltas justificadas vs não
  const faltasResumo = useMemo(() => {
    const alunosEsc = alunos.filter(a => a.escolaId === ESCOLA_ID);
    let justificadas = 0, naoJust = 0;
    alunosEsc.forEach(a => {
      const freq = gerarFrequencia(a.id, a.frequenciaEntrada, a.frequenciaTurma);
      freq.entrada.forEach(r => {
        if (r.status === 'justificado') justificadas++;
        if (r.status === 'ausente') naoJust++;
      });
    });
    return { justificadas, naoJustificadas: naoJust };
  }, []);

  // Justificativas pendentes
  const justPendentes = useMemo(() => justFiltradas.filter(j => j.status === 'pendente'), [justFiltradas]);

  // Lista alunos por turma
  const alunosPorTurma = useMemo(() => {
    const turmasEsc = turmas.filter(t => t.escolaId === ESCOLA_ID);
    return turmasEsc.map(t => ({
      turma: t.nome,
      sala: t.sala,
      alunos: alunos.filter(a => a.turmaId === t.id),
    }));
  }, []);

  const periodo = getPeriodoLabel(filters);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Relatórios — {escola.nome}</h1>
      </div>

      <ReportFilters values={filters} onChange={setFilters} showEscola={false} fixedEscolaId={ESCOLA_ID} />

      <Tabs defaultValue="evolucao" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="evolucao" className="text-xs">Frequência Geral</TabsTrigger>
          <TabsTrigger value="baixa" className="text-xs">Freq. Abaixo 75%</TabsTrigger>
          <TabsTrigger value="faltas" className="text-xs">Faltas Just. vs Não Just.</TabsTrigger>
          <TabsTrigger value="pendentes" className="text-xs">Just. Pendentes</TabsTrigger>
          <TabsTrigger value="turmas" className="text-xs">Alunos por Turma</TabsTrigger>
        </TabsList>

        {/* Evolução mensal */}
        <TabsContent value="evolucao">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Frequência Geral — Evolução Mensal</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Frequência Geral — Evolução Mensal',
              escolaNome: escola.nome,
              periodo,
              colunas: ['Mês', 'Frequência (%)'],
              linhas: freqGeral.map(f => [f.mes, `${f.frequencia}%`]),
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          {/* Line chart */}
          <div className="bg-card rounded-lg border p-4 mb-4">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={freqGeral} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Frequência']} />
                <ReferenceLine y={75} stroke="hsl(var(--destructive))" strokeDasharray="5 5" label={{ value: '75%', position: 'right', fontSize: 11 }} />
                <Line type="monotone" dataKey="frequencia" className="stroke-primary" strokeWidth={3} dot={{ r: 6, className: 'fill-primary' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {freqGeral.map(f => (
              <div key={f.mes} className="bg-card rounded-lg border p-6 text-center">
                <div className="text-sm text-muted-foreground mb-1">{f.mes}</div>
                <div className={`text-3xl font-bold ${f.frequencia < 75 ? 'text-destructive' : 'text-primary'}`}>{f.frequencia}%</div>
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
              escolaNome: escola.nome,
              periodo,
              colunas: ['Nome', 'Série', 'Turma', 'Frequência'],
              linhas: alunosBaixaFreq.map(a => [a.nome, a.serieName, a.turmaName, `${a.frequenciaEntrada}%`]),
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          {alunosBaixaFreq.length === 0 ? (
            <div className="bg-card rounded-lg border p-8 text-center text-muted-foreground">Nenhum aluno com frequência abaixo de 75%</div>
          ) : (
            <div className="bg-card rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b bg-secondary">
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">Série</th>
                  <th className="text-left p-3 text-sm font-medium">Turma</th>
                  <th className="text-left p-3 text-sm font-medium">Frequência</th>
                </tr></thead>
                <tbody>
                  {alunosBaixaFreq.map(a => (
                    <tr key={a.id} className="border-b">
                      <td className="p-3 text-sm font-medium">{a.nome}</td>
                      <td className="p-3 text-sm">{a.serieName}</td>
                      <td className="p-3 text-sm">{a.turmaName}</td>
                      <td className="p-3 text-sm text-destructive font-bold">{a.frequenciaEntrada}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Faltas */}
        <TabsContent value="faltas">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Faltas Justificadas vs Não Justificadas</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Faltas Justificadas vs Não Justificadas',
              escolaNome: escola.nome,
              periodo,
              colunas: ['Tipo', 'Quantidade'],
              linhas: [['Justificadas', faltasResumo.justificadas], ['Não Justificadas', faltasResumo.naoJustificadas], ['Total', faltasResumo.justificadas + faltasResumo.naoJustificadas]],
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          {/* Bar chart */}
          <div className="bg-card rounded-lg border p-4 mb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { tipo: 'Justificadas', quantidade: faltasResumo.justificadas },
                { tipo: 'Não Justificadas', quantidade: faltasResumo.naoJustificadas },
              ]} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="quantidade" radius={[6, 6, 0, 0]}>
                  <Cell className="fill-amber-500" />
                  <Cell className="fill-destructive" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg border p-6 text-center">
              <div className="text-sm text-muted-foreground mb-1">Justificadas</div>
              <div className="text-3xl font-bold text-amber-600">{faltasResumo.justificadas}</div>
            </div>
            <div className="bg-card rounded-lg border p-6 text-center">
              <div className="text-sm text-muted-foreground mb-1">Não Justificadas</div>
              <div className="text-3xl font-bold text-destructive">{faltasResumo.naoJustificadas}</div>
            </div>
            <div className="bg-card rounded-lg border p-6 text-center">
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="text-3xl font-bold text-foreground">{faltasResumo.justificadas + faltasResumo.naoJustificadas}</div>
            </div>
          </div>
        </TabsContent>

        {/* Justificativas pendentes */}
        <TabsContent value="pendentes">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Justificativas Pendentes de Análise</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Justificativas Pendentes de Análise',
              escolaNome: escola.nome,
              periodo,
              colunas: ['Aluno', 'Responsável', 'Período', 'Data Envio'],
              linhas: justPendentes.map(j => [j.alunoNome, j.responsavelNome, `${j.periodoInicio} a ${j.periodoFim}`, j.dataEnvio]),
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          {justPendentes.length === 0 ? (
            <div className="bg-card rounded-lg border p-8 text-center text-muted-foreground">Nenhuma justificativa pendente</div>
          ) : (
            <div className="bg-card rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b bg-secondary">
                  <th className="text-left p-3 text-sm font-medium">Aluno</th>
                  <th className="text-left p-3 text-sm font-medium">Responsável</th>
                  <th className="text-left p-3 text-sm font-medium">Período</th>
                  <th className="text-left p-3 text-sm font-medium">Data Envio</th>
                </tr></thead>
                <tbody>
                  {justPendentes.map(j => (
                    <tr key={j.id} className="border-b">
                      <td className="p-3 text-sm font-medium">{j.alunoNome}</td>
                      <td className="p-3 text-sm">{j.responsavelNome}</td>
                      <td className="p-3 text-sm">{j.periodoInicio} a {j.periodoFim}</td>
                      <td className="p-3 text-sm">{j.dataEnvio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Alunos por turma */}
        <TabsContent value="turmas">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Lista de Alunos por Turma</h2>
            <Button size="sm" variant="outline" onClick={() => {
              const linhas: (string | number)[][] = [];
              alunosPorTurma.forEach(t => {
                t.alunos.forEach(a => linhas.push([a.nome, a.matricula, t.turma, t.sala, `${a.frequenciaEntrada}%`]));
              });
              exportarPdf({
                titulo: 'Lista de Alunos por Turma',
                escolaNome: escola.nome,
                periodo,
                colunas: ['Nome', 'Matrícula', 'Turma', 'Sala', 'Frequência'],
                linhas,
              });
            }}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          <div className="space-y-4">
            {alunosPorTurma.map(t => (
              <div key={t.turma} className="bg-card rounded-lg border overflow-hidden">
                <div className="bg-secondary px-4 py-2 font-semibold text-sm">{t.turma} — {t.sala} ({t.alunos.length} alunos)</div>
                <table className="w-full">
                  <thead><tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium">Nome</th>
                    <th className="text-left p-3 text-sm font-medium">Matrícula</th>
                    <th className="text-left p-3 text-sm font-medium">Frequência</th>
                  </tr></thead>
                  <tbody>
                    {t.alunos.map(a => (
                      <tr key={a.id} className="border-b">
                        <td className="p-3 text-sm">{a.nome}</td>
                        <td className="p-3 text-sm">{a.matricula}</td>
                        <td className="p-3 text-sm"><span className={a.frequenciaEntrada < 75 ? 'text-destructive font-bold' : 'text-primary font-bold'}>{a.frequenciaEntrada}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
