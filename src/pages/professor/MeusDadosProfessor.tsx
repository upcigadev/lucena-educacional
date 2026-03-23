import { useState, useEffect } from 'react';
import { listarProfessores } from '@/lib/queries';

export default function MeusDadosProfessor() {
  const [professores, setProfessores] = useState<any[]>([]);

  useEffect(() => {
    listarProfessores().then(setProfessores).catch(console.error);
  }, []);

  const prof = professores[0];

  if (!professores.length) return <div>Carregando...</div>;
  if (!prof) return <div>Professor não encontrado</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Meus Dados</h1>
      <div className="bg-card rounded-lg border p-6 max-w-lg">
        <div className="space-y-4">
          <div><label className="text-sm text-muted-foreground">Nome</label><p className="font-medium">{prof.usuario?.nome}</p></div>
          <div><label className="text-sm text-muted-foreground">CPF</label><p className="font-medium">{prof.usuario?.cpf}</p></div>
          <div>
            <label className="text-sm text-muted-foreground">Turmas</label>
            <ul className="list-disc list-inside">
              {prof.turmas?.map((t: any) => <li key={t.turmaId} className="text-sm">{t.turma?.nome}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
