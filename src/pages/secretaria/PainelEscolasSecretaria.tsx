import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { School } from 'lucide-react';

export default function PainelEscolasSecretaria() {
  const [escolas, setEscolas] = useState<any[]>([]);

  useEffect(() => {
    window.api?.escola?.listar?.().then(setEscolas);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Escolas do Município</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {escolas.map(escola => {
          const series = escola.series || [];
          return (
            <Link key={escola.id} to={`/secretaria/escola/${escola.id}`} className="block">
              <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <School className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-card-foreground">{escola.nome}</h3>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  100%
                </div>
                <p className="text-xs text-muted-foreground mb-2">Frequência média</p>
                <p className="text-sm text-muted-foreground">{series.length} série(s)</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {series.map((s: any) => (
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
