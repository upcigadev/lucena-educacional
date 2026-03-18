import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function PainelDependentes() {
  const [alunos, setAlunos] = useState<any[]>([]);

  useEffect(() => {
    window.api?.aluno?.listar?.()?.then(setAlunos).catch(console.error);
  }, []);

  const dependentes = alunos;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Painel de Dependentes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dependentes.map(aluno => (
          <Link key={aluno.id} to={`/responsavel/filho/${aluno.id}`} className="block">
            <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-card-foreground">{aluno.nomeCompleto}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{aluno.turma?.escola?.nome}</p>
                  <p className="text-sm text-muted-foreground">{aluno.turma?.serie?.nome} — {aluno.turma?.nome}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold text-primary`}>
                    100%
                  </div>
                  <div className="text-xs text-muted-foreground">Frequência</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
