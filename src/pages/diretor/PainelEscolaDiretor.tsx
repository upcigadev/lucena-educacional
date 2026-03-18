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
