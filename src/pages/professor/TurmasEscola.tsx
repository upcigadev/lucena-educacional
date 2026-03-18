import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function TurmasEscola() {
  const { escolaId } = useParams();
  
  const [escolas, setEscolas] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      window.api?.escola?.listar?.() || Promise.resolve([]),
      window.api?.turma?.listar?.() || Promise.resolve([])
    ]).then(([e, t]) => {
      setEscolas(e); setTurmas(t);
    });
  }, []);

  const escola = escolas.find(e => e.id === escolaId);
  const turmasEscola = turmas.filter(t => t.escolaId === escolaId);

  if (!escolas.length) return <div>Carregando...</div>;
  if (!escola) return <div>Escola não encontrada</div>;

  return (
    <div>
      <Link to="/professor" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-2">{escola.nome}</h1>
      <p className="text-muted-foreground mb-6">Turmas que você leciona nesta escola</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {turmasEscola.map(turma => (
          <Link key={turma.id} to={`/professor/escola/${escolaId}/turma/${turma.id}`} className="block">
            <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow text-center">
              <BookOpen className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-card-foreground">{turma.nome}</h3>
              <p className="text-sm text-muted-foreground mt-1">{turma.sala}</p>
              <div className="text-xl font-bold mt-2 text-primary">
                100%
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
