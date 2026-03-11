import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getSeriesByEscola, escolas, diretores } from '@/data/mockData';

export default function PainelEscolaDiretor() {
  // Simular diretor vinculado a múltiplas escolas
  const diretor = { ...diretores[0], escolaIds: ['1', '2'] };
  const escolasDiretor = escolas.filter(e => diretor.escolaIds.includes(e.id));
  const [escolaSel, setEscolaSel] = useState(escolasDiretor[0]?.id || '1');

  const escola = escolas.find(e => e.id === escolaSel) || escolas[0];
  const seriesEscola = getSeriesByEscola(escolaSel);

  return (
    <div>
      {escolasDiretor.length > 1 && (
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mr-2">Escola:</label>
          <select
            value={escolaSel}
            onChange={e => setEscolaSel(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            {escolasDiretor.map(e => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
        </div>
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
