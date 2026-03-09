import { Link } from 'react-router-dom';
import { getDependentes } from '@/data/mockData';
import { Users } from 'lucide-react';

export default function PainelDependentes() {
  const dependentes = getDependentes('1'); // Maria da Silva

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Painel de Dependentes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dependentes.map(aluno => (
          <Link key={aluno.id} to={`/responsavel/filho/${aluno.id}`} className="block">
            <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground">{aluno.nome}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{aluno.escolaNome}</p>
                  <p className="text-sm text-muted-foreground">{aluno.serieName} — {aluno.turmaName}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${aluno.frequenciaEntrada < 75 ? 'text-destructive' : 'text-primary'}`}>
                    {aluno.frequenciaEntrada}%
                  </div>
                  <div className="text-xs text-muted-foreground">Frequência</div>
                </div>
              </div>
              {aluno.frequenciaEntrada < 75 && (
                <div className="freq-alert rounded p-2 mt-3 text-xs">
                  ⚠️ Frequência abaixo do mínimo de 75%
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
