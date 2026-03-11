import { useState } from 'react';
import { responsaveis, getDependentes, alunos } from '@/data/mockData';

export default function ResponsaveisDiretor() {
  const [filtroNome, setFiltroNome] = useState('');

  // Responsáveis cujos dependentes estão na escola do diretor (escola 1 ou 2)
  const escolaIds = ['1', '2'];
  const alunosEscola = alunos.filter(a => escolaIds.includes(a.escolaId));
  const responsaveisIds = [...new Set(alunosEscola.flatMap(a => a.responsavelIds))];
  const responsaveisEscola = responsaveis.filter(r => responsaveisIds.includes(r.id));

  const filtered = responsaveisEscola.filter(r =>
    !filtroNome || r.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Responsáveis</h1>

      <input
        type="text"
        placeholder="Buscar por nome..."
        value={filtroNome}
        onChange={e => setFiltroNome(e.target.value)}
        className="px-3 py-2 border rounded-md bg-background text-sm w-64 mb-4"
      />

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead>
            <tr className="border-b bg-secondary">
              <th className="text-left p-3 text-sm font-medium">Nome</th>
              <th className="text-left p-3 text-sm font-medium">CPF</th>
              <th className="text-left p-3 text-sm font-medium">WhatsApp</th>
              <th className="text-left p-3 text-sm font-medium">Parentesco</th>
              <th className="text-left p-3 text-sm font-medium">Dependentes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const deps = getDependentes(r.id).filter(d => escolaIds.includes(d.escolaId));
              return (
                <tr key={r.id} className="border-b">
                  <td className="p-3 text-sm font-medium">{r.nome}</td>
                  <td className="p-3 text-sm">{r.cpf}</td>
                  <td className="p-3 text-sm">{r.whatsapp}</td>
                  <td className="p-3 text-sm">{r.parentesco}</td>
                  <td className="p-3 text-sm">{deps.map(d => d.nome).join(', ')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
