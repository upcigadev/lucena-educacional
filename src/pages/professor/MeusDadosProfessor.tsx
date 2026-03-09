import { professores, escolas, turmas } from '@/data/mockData';

export default function MeusDadosProfessor() {
  const prof = professores[0];
  const minhasEscolas = escolas.filter(e => prof.escolaIds.includes(e.id));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Meus Dados</h1>
      <div className="bg-card rounded-lg border p-6 max-w-lg">
        <div className="space-y-4">
          <div><label className="text-sm text-muted-foreground">Nome</label><p className="font-medium">{prof.nome}</p></div>
          <div><label className="text-sm text-muted-foreground">CPF</label><p className="font-medium">{prof.cpf}</p></div>
          <div><label className="text-sm text-muted-foreground">Disciplinas</label><p className="font-medium">{prof.disciplinas.join(', ')}</p></div>
          <div>
            <label className="text-sm text-muted-foreground">Escolas</label>
            <ul className="list-disc list-inside">
              {minhasEscolas.map(e => <li key={e.id} className="text-sm">{e.nome}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
