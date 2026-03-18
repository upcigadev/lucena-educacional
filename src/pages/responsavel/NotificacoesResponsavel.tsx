import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function NotificacoesResponsavel() {
  const notifs: any[] = [];
  const [lidas, setLidas] = useState<string[]>(notifs.filter(n => n.lida).map(n => n.id));

  const marcarLida = (id: string) => {
    setLidas(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const marcarTodas = () => {
    setLidas(notifs.map(n => n.id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
        <button onClick={marcarTodas} className="text-sm text-primary hover:underline">Marcar todas como lidas</button>
      </div>

      <div className="space-y-3">
        {notifs.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma notificação.</p>
        ) : (
          notifs.map(n => (
            <div
              key={n.id}
              onClick={() => marcarLida(n.id)}
              className={cn(
                "bg-card rounded-lg border p-4 cursor-pointer transition-colors",
                !lidas.includes(n.id) && "border-primary/30 bg-primary/5"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-card-foreground">{n.titulo}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{n.mensagem}</p>
                </div>
                {!lidas.includes(n.id) && (
                  <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{n.data}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
