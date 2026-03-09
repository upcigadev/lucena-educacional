import { responsaveis, getDependentes } from '@/data/mockData';

export default function MeusDadosResponsavel() {
  const resp = responsaveis[0]; // Maria da Silva
  const deps = getDependentes('1');

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Meus Dados</h1>
      <div className="bg-card rounded-lg border p-6 max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Nome</label>
            <p className="font-medium">{resp.nome}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">CPF</label>
            <p className="font-medium">{resp.cpf}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">WhatsApp</label>
            <p className="font-medium">{resp.whatsapp}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Parentesco</label>
            <p className="font-medium">{resp.parentesco}</p>
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
                <td className="p-3 text-sm font-medium">{d.nome}</td>
                <td className="p-3 text-sm">{d.escolaNome}</td>
                <td className="p-3 text-sm">{d.turmaName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
