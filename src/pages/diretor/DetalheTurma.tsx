import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function DetalheTurma() {
  const { turmaId } = useParams();
  const [turma, setTurma] = useState<any>(null);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [turmaRes, alunosRes, profsRes] = await Promise.all([
        supabase.from('turmas').select('*').eq('id', turmaId!).single(),
        supabase.from('alunos').select('*').eq('turma_id', turmaId!).order('nome_completo'),
        supabase.from('turma_professores').select('*, professores(*, usuarios(*))').eq('turma_id', turmaId!),
      ]);
      if (turmaRes.data) setTurma(turmaRes.data);
      if (alunosRes.data) setAlunos(alunosRes.data);
      if (profsRes.data) setProfessores(profsRes.data);
      setLoading(false);
    };
    fetch();
  }, [turmaId]);

  if (loading) return <div>Carregando...</div>;
  if (!turma) return <div>Turma não encontrada</div>;

  return (
    <div>
      <Link to="/diretor" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-2">{turma.nome}</h1>
      <p className="text-muted-foreground mb-6">{turma.sala}</p>

      {/* Professores */}
      <h2 className="text-lg font-semibold mb-3">Professores Vinculados</h2>
      <div className="bg-card rounded-lg border overflow-hidden mb-6">
        <table className="w-full">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Nome</th>
          </tr></thead>
          <tbody>
            {professores.length === 0 ? (
              <tr><td className="p-3 text-sm text-muted-foreground">Nenhum professor vinculado.</td></tr>
            ) : (
              professores.map(tp => (
                <tr key={tp.id} className="border-b">
                  <td className="p-3 text-sm font-medium">{tp.professores?.usuarios?.nome}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Alunos */}
      <h2 className="text-lg font-semibold mb-3">Alunos ({alunos.length})</h2>
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Nome</th>
            <th className="text-left p-3 text-sm font-medium">Matrícula</th>
          </tr></thead>
          <tbody>
            {alunos.length === 0 ? (
              <tr><td colSpan={2} className="p-3 text-sm text-muted-foreground">Nenhum aluno nesta turma.</td></tr>
            ) : (
              alunos.map(a => (
                <tr key={a.id} className="border-b">
                  <td className="p-3 text-sm font-medium">{a.nome_completo}</td>
                  <td className="p-3 text-sm">{a.matricula}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
