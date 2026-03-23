import { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/StatusBadge';

export default function JustificativasResponsavel() {
  const [justificativas, setJustificativas] = useState<any[]>([]);

  useEffect(() => {
    Promise.resolve([]).then(setJustificativas);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Justificativas Enviadas</h1>
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead>
            <tr className="border-b bg-secondary">
              <th className="text-left p-3 text-sm font-medium">Aluno</th>
              <th className="text-left p-3 text-sm font-medium">Período</th>
              <th className="text-left p-3 text-sm font-medium">Data Envio</th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {justificativas.map(j => (
              <tr key={j.id} className="border-b">
                <td className="p-3 text-sm font-medium">{j.frequencia?.aluno?.nomeCompleto}</td>
                <td className="p-3 text-sm">--</td>
                <td className="p-3 text-sm">{new Date(j.createdAt).toLocaleDateString()}</td>
                <td className="p-3"><StatusBadge status={j.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
