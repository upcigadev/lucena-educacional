import { useState } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';

export default function ConfiguracoesEscola() {
  const [config, setConfig] = useState({ 
    escolaId: '1', portariaEntradaSaida: true, frequenciaTurma: false, chamadaAppMobile: true, percentualMinimo: 75 
  });
  
  // No device configuration stored yet.
  const disps = [
    { id: '1', nome: 'iDFace Portão Principal', ip: '192.168.0.100', status: 'online' as const }
  ];

  const toggle = (key: keyof typeof config) => {
    if (key === 'percentualMinimo' || key === 'escolaId') return;
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Configuração atualizada!');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Configurações da Escola</h1>

      <div className="bg-card rounded-lg border p-6 mb-6 max-w-lg space-y-5">
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Portaria registra entrada e saída</p><p className="text-xs text-muted-foreground">Controle de entrada/saída pela portaria</p></div>
          <button onClick={() => toggle('portariaEntradaSaida')} className={`w-12 h-6 rounded-full transition-colors ${config.portariaEntradaSaida ? 'bg-primary' : 'bg-muted'}`}>
            <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${config.portariaEntradaSaida ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Frequência por turma habilitada</p><p className="text-xs text-muted-foreground">Registro de frequência em sala de aula</p></div>
          <button onClick={() => toggle('frequenciaTurma')} className={`w-12 h-6 rounded-full transition-colors ${config.frequenciaTurma ? 'bg-primary' : 'bg-muted'}`}>
            <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${config.frequenciaTurma ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div><p className="font-medium">Chamada via app mobile</p><p className="text-xs text-muted-foreground">Permitir chamada pelo aplicativo</p></div>
          <button onClick={() => toggle('chamadaAppMobile')} className={`w-12 h-6 rounded-full transition-colors ${config.chamadaAppMobile ? 'bg-primary' : 'bg-muted'}`}>
            <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${config.chamadaAppMobile ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div>
          <label className="font-medium block mb-1">Percentual mínimo de frequência</label>
          <div className="flex items-center gap-2">
            <input type="number" value={config.percentualMinimo} onChange={e => setConfig(prev => ({ ...prev, percentualMinimo: Number(e.target.value) }))}
              className="w-20 px-3 py-2 border rounded-md bg-background text-sm" min={0} max={100} />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Dispositivos de Reconhecimento Facial</h2>
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full table-striped">
          <thead><tr className="border-b bg-secondary">
            <th className="text-left p-3 text-sm font-medium">Nome</th>
            <th className="text-left p-3 text-sm font-medium">IP</th>
            <th className="text-left p-3 text-sm font-medium">Status</th>
          </tr></thead>
          <tbody>
            {disps.map(d => (
              <tr key={d.id} className="border-b">
                <td className="p-3 text-sm font-medium">{d.nome}</td>
                <td className="p-3 text-sm font-mono">{d.ip}</td>
                <td className="p-3"><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
