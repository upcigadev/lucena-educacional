import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const POR_PAGINA = 10;

export default function GestaoAlunosDiretor() {
  const navigate = useNavigate();
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroSerie, setFiltroSerie] = useState('');
  const [pagina, setPagina] = useState(1);

  const [alunosEscola, setAlunosEscola] = useState<any[]>([]);

  useEffect(() => {
    window.api?.aluno?.listar?.()?.then((res) => setAlunosEscola(res)).catch(console.error);
  }, []);

  const seriesUnicas = [...new Set(alunosEscola.map((a: any) => a.turma?.serie?.nome).filter(Boolean))];
  const filtered = alunosEscola.filter((a: any) => {
    if (filtroNome && !a.nomeCompleto?.toLowerCase().includes(filtroNome.toLowerCase())) return false;
    if (filtroSerie && a.turma?.serie?.nome !== filtroSerie) return false;
    return true;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtered.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const paginados = filtered.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const handleFiltroNome = (v: string) => { setFiltroNome(v); setPagina(1); };
  const handleFiltroSerie = (v: string) => { setFiltroSerie(v); setPagina(1); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Alunos</h1>
        <Link to="/diretor/novo-aluno" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
          + Novo Aluno
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Buscar por nome..." value={filtroNome} onChange={e => handleFiltroNome(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background text-sm w-64" />
        <select value={filtroSerie} onChange={e => handleFiltroSerie(e.target.value)} className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="">Todas as séries</option>
          {seriesUnicas.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
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
            {paginados.map((a: any) => (
              <tr key={a.id} className="border-b hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => navigate(`/diretor/aluno/${a.id}`)}>
                <td className="p-3 text-sm font-medium text-primary hover:underline">{a.nomeCompleto}</td>
                <td className="p-3 text-sm">{a.cpf}</td>
                <td className="p-3 text-sm">{a.matricula}</td>
                <td className="p-3 text-sm">{a.turma?.serie?.nome}</td>
                <td className="p-3 text-sm">{a.turma?.nome}</td>
                <td className="p-3 text-sm">
                  <span className="text-primary font-bold">100%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>{filtered.length} aluno(s) encontrado(s)</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={paginaAtual <= 1}
            className="p-1.5 rounded-md border bg-background disabled:opacity-40 hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-medium text-foreground">{paginaAtual} / {totalPaginas}</span>
          <button
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaAtual >= totalPaginas}
            className="p-1.5 rounded-md border bg-background disabled:opacity-40 hover:bg-secondary transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
