import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function TurmasSerie() {
  const { serieId } = useParams();
  const [serie, setSerie] = useState<any>(null);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [serieRes, turmasRes] = await Promise.all([
        supabase.from('series').select('*').eq('id', serieId!).single(),
        supabase.from('turmas').select('*').eq('serie_id', serieId!).order('nome'),
      ]);
      if (serieRes.data) setSerie(serieRes.data);
      if (turmasRes.data) setTurmas(turmasRes.data);
      setLoading(false);
    };
    fetch();
  }, [serieId]);

  if (loading) return <div>Carregando...</div>;
  if (!serie) return <div>Série não encontrada</div>;

  return (
    <div>
      <Link to="/diretor" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">{serie.nome} — Turmas</h1>

      {turmas.length === 0 ? (
        <div className="bg-card rounded-lg border p-8 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma turma nesta série.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {turmas.map((turma: any) => (
            <Link key={turma.id} to={`/diretor/turma/${turma.id}`} className="block">
              <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow text-center">
                <BookOpen className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-card-foreground">{turma.nome}</h3>
                <p className="text-sm text-muted-foreground mt-1">{turma.sala}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
