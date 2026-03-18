import { useState, useEffect } from 'react';

export default function ProfessoresDiretor() {
  const [professores, setProfessores] = useState<any[]>([]);

  useEffect(() => {
    window.api?.professor?.listar?.()?.then(setProfessores).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Professores</h1>
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Nome</th>
            <th className="text-left p-3 text-sm font-medium">CPF</th>
            <th className="text-left p-3 text-sm font-medium">Turmas</th>
          </tr></thead>
          <tbody>
            {professores.map(p => {
              const turmasProf = p.turmas || [];
              return (
                <tr key={p.id} className="border-b">
                  <td className="p-3 text-sm font-medium">{p.usuario?.nome}</td>
                  <td className="p-3 text-sm">{p.usuario?.cpf}</td>
                  <td className="p-3 text-sm">{turmasProf.map((t: any) => t.turma?.nome).join(', ')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
