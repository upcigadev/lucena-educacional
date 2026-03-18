import { useState, useEffect } from 'react';

export default function MeusDadosDiretor() {
  const [diretor, setDiretor] = useState<any>(null);
  const [escolas, setEscolas] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      window.api?.diretor?.listar?.() || Promise.resolve([]),
      window.api?.escola?.listar?.() || Promise.resolve([])
    ]).then(([d, e]) => {
      setDiretor(d[0]);
      setEscolas(e);
    });
  }, []);

  if (!diretor) return <div>Carregando...</div>;

  const minhasEscolas = escolas.filter(e => e.id === diretor.escolaId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Meus Dados</h1>
      <div className="bg-card rounded-lg border p-6 max-w-lg space-y-4">
        <div><label className="text-sm text-muted-foreground">Nome</label><p className="font-medium">{diretor.usuario?.nome}</p></div>
        <div><label className="text-sm text-muted-foreground">CPF</label><p className="font-medium">{diretor.usuario?.cpf}</p></div>
        <div>
          <label className="text-sm text-muted-foreground">Escola(s)</label>
          <ul className="list-disc list-inside">{minhasEscolas.map(e => <li key={e.id} className="text-sm">{e.nome}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
