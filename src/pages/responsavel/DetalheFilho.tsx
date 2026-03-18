import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AttendanceCalendar } from '@/components/AttendanceCalendar';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function DetalheFilho() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'frequencia' | 'justificar' | 'historico'>('frequencia');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const [alunos, setAlunos] = useState<any[]>([]);
  const [justificativas, setJustificativas] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      window.api?.aluno?.listar?.() || Promise.resolve([]),
      window.api?.justificativa?.listar?.() || Promise.resolve([])
    ]).then(([a, j]) => {
      setAlunos(a); setJustificativas(j);
    });
  }, []);

  const aluno = alunos.find(a => a.id === id);

  if (!alunos.length) return <div>Carregando...</div>;
  if (!aluno) return <div className="text-muted-foreground">Aluno não encontrado</div>;

  const freq = { entrada: [] }; // mocked async frequencia until implemented
  const justificativasDoFilho = justificativas; // just keeping it general for now

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Justificativa enviada com sucesso! Status: Pendente de Avaliação');
    setDataInicio('');
    setDataFim('');
  };

  return (
    <div>
      <Link to="/responsavel" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{aluno.nomeCompleto}</h1>
          <p className="text-sm text-muted-foreground">{aluno.turma?.escola?.nome} — {aluno.turma?.nome}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        {(['frequencia', 'justificar', 'historico'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab === 'frequencia' ? 'Frequência' : tab === 'justificar' ? 'Enviar Justificativa' : 'Justificativas'}
          </button>
        ))}
      </div>

      {activeTab === 'frequencia' && (
        <div className="space-y-4">
          <AttendanceCalendar registros={freq.entrada} titulo="Entrada na Escola (Portaria)" percentual={100} />
        </div>
      )}

      {activeTab === 'justificar' && (
        <div className="bg-card rounded-lg border p-6 max-w-lg">
          <h3 className="font-semibold mb-4">Enviar Justificativa de Falta</h3>
          <form onSubmit={handleEnviar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data Início</label>
                <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Fim</label>
                <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} required className="w-full px-3 py-2 border rounded-md bg-background" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Documento (imagem ou PDF)</label>
              <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-secondary/50">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para selecionar arquivo</p>
              </div>
            </div>
            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:opacity-90">
              Enviar Justificativa
            </button>
          </form>
        </div>
      )}

      {activeTab === 'historico' && (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full table-striped">
            <thead>
              <tr className="border-b bg-secondary">
                <th className="text-left p-3 text-sm font-medium">Período</th>
                <th className="text-left p-3 text-sm font-medium">Data Envio</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {justificativasDoFilho.map(j => (
                <tr key={j.id} className="border-b">
                  <td className="p-3 text-sm">--</td>
                  <td className="p-3 text-sm">{new Date(j.createdAt).toLocaleDateString()}</td>
                  <td className="p-3"><StatusBadge status={j.status} /></td>
                </tr>
              ))}
              {justificativasDoFilho.length === 0 && (
                <tr><td colSpan={3} className="p-4 text-center text-muted-foreground">Nenhuma justificativa enviada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
