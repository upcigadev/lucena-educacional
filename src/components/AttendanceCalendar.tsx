import { useState } from 'react';
import { RegistroFrequencia } from '@/data/mockData';

interface AttendanceCalendarProps {
  registros: RegistroFrequencia[];
  titulo: string;
  percentual: number;
  minimoPercentual?: number;
}

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const meses = [
  { label: 'Fevereiro 2026', ano: 2026, mes: 2 },
  { label: 'Março 2026', ano: 2026, mes: 3 },
];

export function AttendanceCalendar({ registros, titulo, percentual, minimoPercentual = 75 }: AttendanceCalendarProps) {
  const [mesIdx, setMesIdx] = useState(1);
  const { ano, mes } = meses[mesIdx];

  const primeiroDia = new Date(ano, mes - 1, 1).getDay();
  const diasNoMes = new Date(ano, mes, 0).getDate();

  const getStatus = (dia: number) => {
    const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const reg = registros.find(r => r.data === dataStr);
    return reg?.status || null;
  };

  const cells = [];
  for (let i = 0; i < primeiroDia; i++) {
    cells.push(<div key={`empty-${i}`} className="h-9 w-9" />);
  }
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const status = getStatus(dia);
    const dow = new Date(ano, mes - 1, dia).getDay();
    const isWeekend = dow === 0 || dow === 6;
    let cellClass = 'h-9 w-9 flex items-center justify-center rounded text-sm font-medium';

    if (status === 'presente') cellClass += ' cal-presente';
    else if (status === 'ausente') cellClass += ' cal-ausente';
    else if (status === 'justificado') cellClass += ' cal-justificado';
    else if (isWeekend) cellClass += ' bg-muted text-muted-foreground';
    else cellClass += ' bg-card text-muted-foreground';

    cells.push(<div key={dia} className={cellClass}>{dia}</div>);
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-card-foreground">{titulo}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${percentual < minimoPercentual ? 'text-destructive' : 'text-primary'}`}>
            {percentual}%
          </span>
        </div>
      </div>

      {percentual < minimoPercentual && (
        <div className="freq-alert rounded p-2 mb-3 text-sm">
          ⚠️ Frequência abaixo do mínimo de {minimoPercentual}%
        </div>
      )}

      <div className="flex gap-1 mb-3">
        {meses.map((m, i) => (
          <button
            key={i}
            onClick={() => setMesIdx(i)}
            className={`px-3 py-1 text-sm rounded ${i === mesIdx ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {diasSemana.map(d => (
          <div key={d} className="h-7 w-9 flex items-center justify-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{cells}</div>

      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cal-presente" /> Presente</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cal-ausente" /> Ausente</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cal-justificado" /> Justificado</span>
      </div>
    </div>
  );
}
