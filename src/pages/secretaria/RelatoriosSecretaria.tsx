import { useMemo, useRef, useState, useEffect } from 'react';
import { ReportFilters, useDefaultFilters } from '@/components/ReportFilters';
import { exportarPdf } from '@/lib/pdfExport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

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

export default function RelatoriosSecretaria() {
  const [filters, setFilters] = useDefaultFilters();

  const chartRankingRef = useRef<HTMLDivElement>(null);
  const chartFaltasRef = useRef<HTMLDivElement>(null);

  const [escolas, setEscolas] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [justificativas, setJustificativas] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      window.api?.escola?.listar?.() || Promise.resolve([]),
      window.api?.aluno?.listar?.() || Promise.resolve([]),
      window.api?.turma?.listar?.() || Promise.resolve([]),
      window.api?.serie?.listar?.() || Promise.resolve([]),
      window.api?.professor?.listar?.() || Promise.resolve([]),
      window.api?.justificativa?.listar?.() || Promise.resolve([])
    ]).then(([e, a, t, s, p, j]) => {
      setEscolas(e);
      setAlunos(a);
      setTurmas(t);
      setSeries(s);
      setProfessores(p || []);
      setJustificativas(j || []);
    });
  }, []);

  const alunosFiltrados = useMemo(() => {
    let lista = [...alunos];
    if (filters.escolaId) lista = lista.filter(a => a.escolaId === filters.escolaId);
    if (filters.turmaId) lista = lista.filter(a => a.turmaId === filters.turmaId);
    else if (filters.serieId) {
      const turmasDaSerie = turmas.filter(t => t.serieId === filters.serieId).map(t => t.id);
      lista = lista.filter(a => turmasDaSerie.includes(a.turmaId));
    }
    return lista;
  }, [filters]);

  const justFiltradas = useMemo(() => {
    let lista = [...justificativas];
    if (filters.escolaId) lista = lista.filter(j => j.escolaId === filters.escolaId);
    return lista;
  }, [filters]);

  const rankingEscolas = useMemo(() => {
    return escolas.map(e => {
      const alunosEsc = alunos.filter(a => a.escolaId === e.id || a.turma?.escolaId === e.id);
      
      const freqPorAluno = alunosEsc.map(a => {
        const totalReq = a.frequencias?.length || 1; 
        const presencas = a.frequencias?.filter((f: any) => f.status === 'PRESENTE' || f.status === 'ATRASADO').length || 0;
        return (presencas / totalReq) * 100;
      });

      const media = freqPorAluno.length > 0 ? Math.round(freqPorAluno.reduce((s, val) => s + val, 0) / freqPorAluno.length) : 100;

      return { ...e, media, qtdAlunos: alunosEsc.length };
    }).sort((a, b) => b.media - a.media);
  }, [escolas, alunos]);

  const alunosBaixaFreq = useMemo(() => {
    return alunosFiltrados.map(a => {
      const totalReq = a.frequencias?.length || 1; 
      const presencas = a.frequencias?.filter((f: any) => f.status === 'PRESENTE' || f.status === 'ATRASADO').length || 0;
      return { ...a, freqValue: Math.round((presencas / totalReq) * 100) };
    }).filter(a => a.freqValue < 75);
  }, [alunosFiltrados]);

  const faltasPorEscola = useMemo(() => {
    const map = new Map<string, { escola: string; justificadas: number; naoJustificadas: number }>();
    const escolasList = filters.escolaId ? escolas.filter(e => e.id === filters.escolaId) : escolas;
    escolasList.forEach(e => {
      const alunosEsc = alunos.filter(a => a.turma?.escolaId === e.id);
      let justificadas = 0, naoJust = 0;
      alunosEsc.forEach(a => {
        const frequencias = a.frequencias || [];
        frequencias.forEach((r: any) => {
          if (r.status === 'FALTA' && r.justificativa?.status === 'APROVADA') justificadas++;
          if (r.status === 'FALTA' && (!r.justificativa || r.justificativa?.status !== 'APROVADA')) naoJust++;
        });
      });
      map.set(e.id, { escola: e.nome, justificadas, naoJustificadas: naoJust });
    });
    return Array.from(map.values());
  }, [escolas, alunos, filters.escolaId]);

  const justPendentes = useMemo(() => justFiltradas.filter(j => j.status === 'PENDENTE'), [justFiltradas]);

  const profsPorEscola = useMemo(() => {
    const result: { professor: string; disciplinas: string; escola: string; turmas: string }[] = [];
    const escolasList = filters.escolaId ? escolas.filter(e => e.id === filters.escolaId) : escolas;
    // Adaptado para o banco de dados (o professor usa tabela pivô TurmaProfessor)
    escolasList.forEach(e => {
      professores.forEach(p => {
        const professorTurmas = p.turmas || [];
        const turmasNaEscola = professorTurmas.filter((tp: any) => tp.turma?.escolaId === e.id);
        if (turmasNaEscola.length > 0) {
           result.push({ 
             professor: p.usuario?.nome || 'Desconhecido', 
             disciplinas: 'Geral', 
             escola: e.nome, 
             turmas: turmasNaEscola.map((tp: any) => tp.turma?.nome).join(', ') 
           });
        }
      });
    });
    return result;
  }, [escolas, professores, filters.escolaId]);

  const periodo = getPeriodoLabel(filters);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
      </div>

      <ReportFilters values={filters} onChange={setFilters} />

      <Tabs defaultValue="ranking" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="ranking" className="text-xs">Frequência por Escola</TabsTrigger>
          <TabsTrigger value="baixa" className="text-xs">Freq. Abaixo 75%</TabsTrigger>
          <TabsTrigger value="faltas" className="text-xs">Faltas Just. vs Não Just.</TabsTrigger>
          <TabsTrigger value="pendentes" className="text-xs">Just. Pendentes</TabsTrigger>
          <TabsTrigger value="matricula" className="text-xs">Matrícula</TabsTrigger>
          <TabsTrigger value="professores" className="text-xs">Professores</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Frequência Geral por Escola</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Frequência Geral por Escola',
              periodo,
              colunas: ['Pos.', 'Escola', 'Alunos', 'Freq. Média'],
              linhas: rankingEscolas.map((e, i) => [i + 1, e.nome, e.qtdAlunos, `${e.media}%`]),
              chartElement: chartRankingRef.current,
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          <div ref={chartRankingRef} className="bg-card rounded-lg border p-4 mb-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={rankingEscolas.map(e => ({ nome: e.nome.replace('Escola Municipal ', 'E.M. '), media: e.media }))} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`${v}%`, 'Frequência']} />
                <Bar dataKey="media" radius={[6, 6, 0, 0]}>
                  {rankingEscolas.map((e, i) => (
                    <Cell key={i} className={e.media < 75 ? 'fill-destructive' : 'fill-primary'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b bg-secondary">
                <th className="text-left p-3 text-sm font-medium w-16">Pos.</th>
                <th className="text-left p-3 text-sm font-medium">Escola</th>
                <th className="text-left p-3 text-sm font-medium">Alunos</th>
                <th className="text-left p-3 text-sm font-medium">Freq. Média</th>
              </tr></thead>
              <tbody>
                {rankingEscolas.map((e, i) => (
                  <tr key={e.id} className="border-b">
                    <td className="p-3 text-sm font-bold">{i + 1}º</td>
                    <td className="p-3 text-sm">{e.nome}</td>
                    <td className="p-3 text-sm">{e.qtdAlunos}</td>
                    <td className="p-3 text-sm"><span className={e.media < 75 ? 'text-destructive font-bold' : 'text-primary font-bold'}>{e.media}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="baixa">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Alunos com Frequência Abaixo de 75%</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Alunos com Frequência Abaixo de 75%',
              periodo,
              escolaNome: filters.escolaId ? escolas.find(e => e.id === filters.escolaId)?.nome : undefined,
              colunas: ['Nome', 'Escola', 'Série', 'Turma', 'Frequência'],
              linhas: alunosBaixaFreq.map(a => [a.nome, a.escolaNome, a.serieName, a.turmaName, `${a.frequenciaEntrada}%`]),
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          {alunosBaixaFreq.length === 0 ? (
            <div className="bg-card rounded-lg border p-8 text-center text-muted-foreground">Nenhum aluno com frequência abaixo de 75%</div>
          ) : (
            <div className="bg-card rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b bg-secondary">
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">Escola</th>
                  <th className="text-left p-3 text-sm font-medium">Série</th>
                  <th className="text-left p-3 text-sm font-medium">Turma</th>
                  <th className="text-left p-3 text-sm font-medium">Frequência</th>
                </tr></thead>
                <tbody>
                  {alunosBaixaFreq.map(a => (
                    <tr key={a.id} className="border-b">
                      <td className="p-3 text-sm font-medium">{a.nome}</td>
                      <td className="p-3 text-sm">{a.escolaNome}</td>
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

        <TabsContent value="faltas">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Faltas Justificadas vs Não Justificadas</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Faltas Justificadas vs Não Justificadas por Escola',
              periodo,
              colunas: ['Escola', 'Justificadas', 'Não Justificadas', 'Total'],
              linhas: faltasPorEscola.map(f => [f.escola, f.justificadas, f.naoJustificadas, f.justificadas + f.naoJustificadas]),
              chartElement: chartFaltasRef.current,
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          <div ref={chartFaltasRef} className="bg-card rounded-lg border p-4 mb-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={faltasPorEscola.map(f => ({ nome: f.escola.replace('Escola Municipal ', 'E.M. '), justificadas: f.justificadas, naoJustificadas: f.naoJustificadas }))} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="justificadas" name="Justificadas" className="fill-amber-500" radius={[4, 4, 0, 0]} />
                <Bar dataKey="naoJustificadas" name="Não Justificadas" className="fill-destructive" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b bg-secondary">
                <th className="text-left p-3 text-sm font-medium">Escola</th>
                <th className="text-left p-3 text-sm font-medium">Justificadas</th>
                <th className="text-left p-3 text-sm font-medium">Não Justificadas</th>
                <th className="text-left p-3 text-sm font-medium">Total</th>
              </tr></thead>
              <tbody>
                {faltasPorEscola.map(f => (
                  <tr key={f.escola} className="border-b">
                    <td className="p-3 text-sm">{f.escola}</td>
                    <td className="p-3 text-sm text-amber-600 font-semibold">{f.justificadas}</td>
                    <td className="p-3 text-sm text-destructive font-semibold">{f.naoJustificadas}</td>
                    <td className="p-3 text-sm font-bold">{f.justificadas + f.naoJustificadas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="pendentes">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Justificativas Pendentes de Análise</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Justificativas Pendentes de Análise',
              periodo,
              colunas: ['Aluno', 'Escola', 'Responsável', 'Período', 'Data Envio'],
              linhas: justPendentes.map(j => [j.alunoNome, j.escolaNome, j.responsavelNome, `${j.periodoInicio} a ${j.periodoFim}`, j.dataEnvio]),
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          {justPendentes.length === 0 ? (
            <div className="bg-card rounded-lg border p-8 text-center text-muted-foreground">Nenhuma justificativa pendente</div>
          ) : (
            <div className="bg-card rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b bg-secondary">
                  <th className="text-left p-3 text-sm font-medium">Aluno</th>
                  <th className="text-left p-3 text-sm font-medium">Escola</th>
                  <th className="text-left p-3 text-sm font-medium">Responsável</th>
                  <th className="text-left p-3 text-sm font-medium">Período</th>
                  <th className="text-left p-3 text-sm font-medium">Data Envio</th>
                </tr></thead>
                <tbody>
                  {justPendentes.map(j => (
                    <tr key={j.id} className="border-b">
                      <td className="p-3 text-sm font-medium">{j.alunoNome}</td>
                      <td className="p-3 text-sm">{j.escolaNome}</td>
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

        <TabsContent value="matricula">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Relatório de Matrícula</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Relatório de Matrícula',
              periodo,
              escolaNome: filters.escolaId ? escolas.find(e => e.id === filters.escolaId)?.nome : undefined,
              colunas: ['Nome', 'Matrícula', 'CPF', 'Escola', 'Série', 'Turma'],
              linhas: alunosFiltrados.map(a => [a.nome, a.matricula, a.cpf, a.escolaNome, a.serieName, a.turmaName]),
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b bg-secondary">
                <th className="text-left p-3 text-sm font-medium">Nome</th>
                <th className="text-left p-3 text-sm font-medium">Matrícula</th>
                <th className="text-left p-3 text-sm font-medium">CPF</th>
                <th className="text-left p-3 text-sm font-medium">Escola</th>
                <th className="text-left p-3 text-sm font-medium">Série</th>
                <th className="text-left p-3 text-sm font-medium">Turma</th>
              </tr></thead>
              <tbody>
                {alunosFiltrados.map(a => (
                  <tr key={a.id} className="border-b">
                    <td className="p-3 text-sm font-medium">{a.nome}</td>
                    <td className="p-3 text-sm">{a.matricula}</td>
                    <td className="p-3 text-sm">{a.cpf}</td>
                    <td className="p-3 text-sm">{a.escolaNome}</td>
                    <td className="p-3 text-sm">{a.serieName}</td>
                    <td className="p-3 text-sm">{a.turmaName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="professores">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Professores por Escola e Turma</h2>
            <Button size="sm" variant="outline" onClick={() => exportarPdf({
              titulo: 'Professores por Escola e Turma',
              periodo,
              colunas: ['Professor', 'Disciplinas', 'Escola', 'Turmas'],
              linhas: profsPorEscola.map(p => [p.professor, p.disciplinas, p.escola, p.turmas]),
            })}><FileDown className="h-4 w-4 mr-1" />Exportar PDF</Button>
          </div>
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b bg-secondary">
                <th className="text-left p-3 text-sm font-medium">Professor</th>
                <th className="text-left p-3 text-sm font-medium">Disciplinas</th>
                <th className="text-left p-3 text-sm font-medium">Escola</th>
                <th className="text-left p-3 text-sm font-medium">Turmas</th>
              </tr></thead>
              <tbody>
                {profsPorEscola.map((p, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-3 text-sm font-medium">{p.professor}</td>
                    <td className="p-3 text-sm">{p.disciplinas}</td>
                    <td className="p-3 text-sm">{p.escola}</td>
                    <td className="p-3 text-sm">{p.turmas}</td>
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
