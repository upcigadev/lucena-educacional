import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSeriesByEscola, escolas, diretores } from '@/data/mockData';
import { School } from 'lucide-react';

export default function PainelEscolaDiretor() {
  const { escolaId } = useParams();
  const diretor = { ...diretores[0], escolaIds: ['1', '2'] };
  const escolasDiretor = escolas.filter(e => diretor.escolaIds.includes(e.id));

  // Se não selecionou escola e tem múltiplas, mostra cards
  if (!escolaId && escolasDiretor.length > 1) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Minhas Escolas</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escolasDiretor.map(escola => {
            const series = getSeriesByEscola(escola.id);
            return (
              <Link key={escola.id} to={`/diretor/escola/${escola.id}`} className="block">
                <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <School className="w-8 h-8 text-primary" />
                    <h3 className="font-semibold text-card-foreground">{escola.nome}</h3>
                  </div>
                  <div className={`text-2xl font-bold ${escola.frequenciaMedia < 75 ? 'text-destructive' : 'text-primary'}`}>
                    {escola.frequenciaMedia}%
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Frequência média</p>
                  <p className="text-sm text-muted-foreground">{series.length} série(s)</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {series.map(s => (
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

  // Painel de uma escola específica
  const id = escolaId || escolasDiretor[0]?.id || '1';
  const escola = escolas.find(e => e.id === id) || escolas[0];
  const seriesEscola = getSeriesByEscola(id);

  return (
    <div>
      {escolasDiretor.length > 1 && (
        <Link to="/diretor" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          ← Voltar às escolas
        </Link>
      )}

      <h1 className="text-2xl font-bold text-foreground mb-2">{escola.nome}</h1>
      <p className="text-muted-foreground mb-6">Frequência média: <span className="font-bold text-primary">{escola.frequenciaMedia}%</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seriesEscola.map(serie => (
          <Link key={serie.id} to={`/diretor/serie/${serie.id}`} className="block">
            <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg text-card-foreground">{serie.nome}</h3>
              <div className={`text-2xl font-bold mt-2 ${serie.frequenciaMedia < 75 ? 'text-destructive' : 'text-primary'}`}>
                {serie.frequenciaMedia}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Frequência média</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
