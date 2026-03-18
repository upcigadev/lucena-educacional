import { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmModal } from '@/components/ConfirmModal';
import { toast } from 'sonner';

export default function JustificativasGlobais() {
  const [justs, setJusts] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<'aprovar' | 'rejeitar' | null>(null);

  useEffect(() => {
    window.api?.justificativa?.listar?.()?.then((res) => {
      const pends = res.filter((j: any) => j.status === 'PENDENTE');
      setJusts(pends);
    }).catch(console.error);
  }, []);

  const handleConfirm = () => {
    if (!selectedId || !action) return;
    setJusts(prev => prev.filter(j => j.id !== selectedId));
    toast.success(action === 'aprovar' ? 'Justificativa aprovada!' : 'Justificativa rejeitada!');
    setSelectedId(null);
    setAction(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Justificativas Globais</h1>
      <p className="text-muted-foreground mb-6">Justificativas pendentes de validação de todas as escolas</p>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Aluno</th>
            <th className="text-left p-3 text-sm font-medium">Escola</th>
            <th className="text-left p-3 text-sm font-medium">Período</th>
            <th className="text-left p-3 text-sm font-medium">Responsável</th>
            <th className="text-left p-3 text-sm font-medium">Envio</th>
            <th className="text-left p-3 text-sm font-medium">Status</th>
            <th className="text-left p-3 text-sm font-medium">Ações</th>
          </tr></thead>
          <tbody>
            {justs.map((j: any) => {
              const objDate = j.dataReferencia ? new Date(j.dataReferencia) : new Date();
              return (
                <tr key={j.id} className="border-b">
                  <td className="p-3 text-sm font-medium">{j.aluno?.nomeCompleto}</td>
                  <td className="p-3 text-sm">{j.aluno?.turma?.escola?.nome}</td>
                  <td className="p-3 text-sm">{objDate.toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 text-sm">{j.aluno?.responsavel?.usuario?.nome || ''}</td>
                  <td className="p-3 text-sm">{new Date(j.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3"><StatusBadge status={j.status} /></td>
                  <td className="p-3">
                    {j.status === 'PENDENTE' && (
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedId(j.id); setAction('aprovar'); }} className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Aprovar</button>
                        <button onClick={() => { setSelectedId(j.id); setAction('rejeitar'); }} className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">Rejeitar</button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!selectedId && !!action}
        onOpenChange={() => { setSelectedId(null); setAction(null); }}
        title={action === 'aprovar' ? 'Aprovar Justificativa' : 'Rejeitar Justificativa'}
        description={`Tem certeza que deseja ${action === 'aprovar' ? 'aprovar' : 'rejeitar'} esta justificativa?`}
        onConfirm={handleConfirm}
        confirmLabel={action === 'aprovar' ? 'Aprovar' : 'Rejeitar'}
        variant={action === 'rejeitar' ? 'destructive' : 'default'}
      />
    </div>
  );
}
