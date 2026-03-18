import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AttendanceCalendar } from '@/components/AttendanceCalendar';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function DetalheAlunoProfessor() {
  const { id } = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [aviso, setAviso] = useState('');

  const [alunos, setAlunos] = useState<any[]>([]);

  useEffect(() => {
    window.api?.aluno?.listar?.()?.then(setAlunos).catch(console.error);
  }, []);

  const aluno = alunos.find(a => a.id === id);

  if (!alunos.length) return <div>Carregando...</div>;
  if (!aluno) return <div>Aluno não encontrado</div>;

  const freq = { entrada: [], turma: [] }; // Mock async frequency
  const resps = aluno.responsavel ? [aluno.responsavel] : [];

  const handleEnviar = () => {
    toast.success('Aviso enviado ao responsável com sucesso!');
    setModalOpen(false);
    setAviso('');
  };

  return (
    <div>
      <Link to="/professor/alunos" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-1">{aluno.nomeCompleto}</h1>
      <p className="text-muted-foreground mb-6">{aluno.turma?.escola?.nome} — {aluno.turma?.nome}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AttendanceCalendar registros={freq.entrada} titulo="Entrada na Escola" percentual={100} />
      </div>

      <h2 className="text-lg font-semibold mb-3">Responsáveis Vinculados</h2>
      <div className="bg-card rounded-lg border overflow-hidden mb-6">
        <table className="w-full table-striped">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Nome</th>
            <th className="text-left p-3 text-sm font-medium">WhatsApp</th>
            <th className="text-left p-3 text-sm font-medium">Ação</th>
          </tr></thead>
          <tbody>
            {resps.map((r: any) => (
              <tr key={r.id} className="border-b">
                <td className="p-3 text-sm font-medium">{r.usuario?.nome}</td>
                <td className="p-3 text-sm">{r.telefone || '--'}</td>
                <td className="p-3">
                  <button onClick={() => setModalOpen(true)} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90">
                    <MessageSquare className="w-3 h-3 inline mr-1" />Enviar Aviso
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-card rounded-lg border shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Enviar Aviso ao Responsável</h3>
            <textarea value={aviso} onChange={e => setAviso(e.target.value)} placeholder="Digite o aviso..." rows={4}
              className="w-full px-3 py-2 border rounded-md bg-background text-sm mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm border rounded-md hover:bg-secondary">Cancelar</button>
              <button onClick={handleEnviar} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
