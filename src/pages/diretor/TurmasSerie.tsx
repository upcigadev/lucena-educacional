import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function TurmasSerie() {
  const { serieId } = useParams();
  
  const [series, setSeries] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      window.api?.serie?.listar?.() || Promise.resolve([]),
      window.api?.turma?.listar?.() || Promise.resolve([])
    ]).then(([s, t]) => {
      setSeries(s);
      setTurmas(t);
    });
  }, []);

  const serie = series.find(s => s.id === serieId);
  const turmasSerie = turmas.filter(t => t.serieId === serieId);

  if (!series.length) return <div>Carregando...</div>;
  if (!serie) return <div>Série não encontrada</div>;

  return (
    <div>
      <Link to="/diretor" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">{serie.nome} — Turmas</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {turmasSerie.map((turma: any) => (
          <Link key={turma.id} to={`/diretor/turma/${turma.id}`} className="block">
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
