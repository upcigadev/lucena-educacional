import { useState } from 'react';
import { escolas, series, turmas } from '@/data/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface ReportFilterValues {
  escolaId: string;
  serieId: string;
  turmaId: string;
  periodoInicio: Date | undefined;
  periodoFim: Date | undefined;
  mes: string;
}

interface ReportFiltersProps {
  values: ReportFilterValues;
  onChange: (values: ReportFilterValues) => void;
  showEscola?: boolean;
  showSerie?: boolean;
  showTurma?: boolean;
  fixedEscolaId?: string;
  fixedEscolaIds?: string[];
}

const MESES = [
  { value: '', label: 'Todos os meses' },
  { value: '2026-02', label: 'Fevereiro 2026' },
  { value: '2026-03', label: 'Março 2026' },
];

export function ReportFilters({ values, onChange, showEscola = true, showSerie = true, showTurma = true, fixedEscolaId, fixedEscolaIds }: ReportFiltersProps) {
  const availableEscolas = fixedEscolaIds ? escolas.filter(e => fixedEscolaIds.includes(e.id)) : escolas;
  const activeEscolaId = fixedEscolaId || values.escolaId;
  const seriesFiltradas = activeEscolaId ? series.filter(s => s.escolaId === activeEscolaId) : [];
  const turmasFiltradas = values.serieId ? turmas.filter(t => t.serieId === values.serieId) : [];

  const update = (partial: Partial<ReportFilterValues>) => {
    const next = { ...values, ...partial };
    // cascade reset
    if ('escolaId' in partial) { next.serieId = ''; next.turmaId = ''; }
    if ('serieId' in partial) { next.turmaId = ''; }
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* Mês */}
      <select value={values.mes} onChange={e => update({ mes: e.target.value })}
        className="px-3 py-2 border rounded-md bg-background text-sm">
        {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>

      {/* Intervalo de datas */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("text-sm justify-start", !values.periodoInicio && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {values.periodoInicio ? format(values.periodoInicio, "dd/MM/yyyy") : "Data início"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={values.periodoInicio} onSelect={d => update({ periodoInicio: d })}
            className={cn("p-3 pointer-events-auto")} />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("text-sm justify-start", !values.periodoFim && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {values.periodoFim ? format(values.periodoFim, "dd/MM/yyyy") : "Data fim"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={values.periodoFim} onSelect={d => update({ periodoFim: d })}
            className={cn("p-3 pointer-events-auto")} />
        </PopoverContent>
      </Popover>

      {/* Escola */}
      {showEscola && !fixedEscolaId && (
        <select value={values.escolaId} onChange={e => update({ escolaId: e.target.value })}
          className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="">Todas as escolas</option>
          {availableEscolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
      )}

      {/* Série */}
      {showSerie && activeEscolaId && (
        <select value={values.serieId} onChange={e => update({ serieId: e.target.value })}
          className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="">Todas as séries</option>
          {seriesFiltradas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      )}

      {/* Turma */}
      {showTurma && values.serieId && (
        <select value={values.turmaId} onChange={e => update({ turmaId: e.target.value })}
          className="px-3 py-2 border rounded-md bg-background text-sm">
          <option value="">Todas as turmas</option>
          {turmasFiltradas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
      )}

      {(values.periodoInicio || values.periodoFim || values.mes || values.escolaId || values.serieId || values.turmaId) && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ escolaId: '', serieId: '', turmaId: '', periodoInicio: undefined, periodoFim: undefined, mes: '' })}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

export function useDefaultFilters(): [ReportFilterValues, (v: ReportFilterValues) => void] {
  const [filters, setFilters] = useState<ReportFilterValues>({
    escolaId: '', serieId: '', turmaId: '',
    periodoInicio: undefined, periodoFim: undefined, mes: '',
  });
  return [filters, setFilters];
}
