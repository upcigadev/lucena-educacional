import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { School } from 'lucide-react';

export default function PainelEscolaDiretor() {
  const { escolaId } = useParams();
  const [escolas, setEscolas] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      window.api?.escola?.listar?.() || Promise.resolve([]),
      window.api?.serie?.listar?.() || Promise.resolve([])
    ]).then(([e, s]) => {
      setEscolas(e); setSeries(s);
    });
  }, []);

  const escolasDiretor = escolas; // Para simplificar o Diretor simulado verá todas ou as dele

  if (!escolaId && escolasDiretor.length > 1) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Minhas Escolas</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escolasDiretor.map((escola: any) => {
            const seriesDaEscola = series.filter((s: any) => s.escolaId === escola.id);
            return (
              <Link key={escola.id} to={`/diretor/escola/${escola.id}`} className="block">
                <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <School className="w-8 h-8 text-primary" />
                    <h3 className="font-semibold text-card-foreground">{escola.nome}</h3>
                  </div>
                  <div className={`text-2xl font-bold text-primary`}>
                    100%
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Frequência média</p>
                  <p className="text-sm text-muted-foreground">{seriesDaEscola.length} série(s)</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {seriesDaEscola.map((s: any) => (
                      <span key={s.id} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">{s.nome}</span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  const id = escolaId || escolasDiretor[0]?.id || '1';
  const escola = escolas.find(e => e.id === id) || escolas[0];
  const seriesEscola = series.filter((s: any) => s.escolaId === id);

  if (!escola) return <div>Carregando escola...</div>;

  if (seriesEscola.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{escola.nome}</h1>
        <p className="text-muted-foreground mb-6">Frequência média: <span className="font-bold text-primary">—</span></p>
        <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-lg shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
          <h2 className="text-xl font-bold text-card-foreground mb-2">Nenhuma série cadastrada</h2>
          <p className="text-muted-foreground text-center max-w-sm">
            Esta escola ainda não possui séries registradas. Peça à Secretaria que cadastre as séries e turmas antes de prosseguir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {escolasDiretor.length > 1 && (
        <Link to="/diretor" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          ← Voltar às escolas
        </Link>
      )}

      <h1 className="text-2xl font-bold text-foreground mb-2">{escola.nome}</h1>
      <p className="text-muted-foreground mb-6">Frequência média: <span className="font-bold text-primary">100%</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seriesEscola.map((serie: any) => (
          <Link key={serie.id} to={`/diretor/serie/${serie.id}`} className="block">
            <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg text-card-foreground">{serie.nome}</h3>
              <div className={`text-2xl font-bold mt-2 text-primary`}>
                100%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Frequência média</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
