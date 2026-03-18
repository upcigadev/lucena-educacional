import { useState, useEffect } from 'react';

export default function MeusDadosResponsavel() {
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      window.api?.responsavel?.listar?.() || Promise.resolve([]),
      window.api?.aluno?.listar?.() || Promise.resolve([])
    ]).then(([r, a]) => {
      setResponsaveis(r); setAlunos(a);
    });
  }, []);

  const resp = responsaveis[0];
  const deps = alunos;

  if (!responsaveis.length) return <div>Carregando...</div>;
  if (!resp) return <div>Responsável não encontrado</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Meus Dados</h1>
      <div className="bg-card rounded-lg border p-6 max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Nome</label>
            <p className="font-medium">{resp.usuario?.nome}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">CPF</label>
            <p className="font-medium">{resp.usuario?.cpf}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">WhatsApp</label>
            <p className="font-medium">{resp.telefone || '--'}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-4">Dependentes Vinculados</h2>
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead>
            <tr className="border-b bg-secondary">
              <th className="text-left p-3 text-sm font-medium">Nome</th>
              <th className="text-left p-3 text-sm font-medium">Escola</th>
              <th className="text-left p-3 text-sm font-medium">Turma</th>
            </tr>
          </thead>
          <tbody>
            {deps.map(d => (
              <tr key={d.id} className="border-b">
                <td className="p-3 text-sm font-medium">{d.nomeCompleto}</td>
                <td className="p-3 text-sm">{d.turma?.escola?.nome}</td>
                <td className="p-3 text-sm">{d.turma?.nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
