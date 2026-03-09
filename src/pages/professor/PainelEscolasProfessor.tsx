import { Link } from 'react-router-dom';
import { getEscolasByProfessor, getTurmasByProfessorEscola } from '@/data/mockData';
import { School } from 'lucide-react';

export default function PainelEscolasProfessor() {
  const escolas = getEscolasByProfessor('1'); // Carlos Mendes

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Minhas Escolas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {escolas.map(escola => {
          const turmasEscola = getTurmasByProfessorEscola('1', escola.id);
          return (
            <Link key={escola.id} to={`/professor/escola/${escola.id}`} className="block">
              <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <School className="w-8 h-8 text-primary" />
                  <h3 className="font-semibold text-card-foreground">{escola.nome}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{turmasEscola.length} turma(s)</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {turmasEscola.map(t => (
                    <span key={t.id} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">{t.nome}</span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
