import { cn } from '@/lib/utils';

const statusClasses: Record<string, string> = {
  pendente: 'badge-pendente',
  aprovada: 'badge-presente',
  aprovado: 'badge-presente',
  presente: 'badge-presente',
  online: 'badge-presente',
  rejeitada: 'badge-ausente',
  rejeitado: 'badge-ausente',
  ausente: 'badge-ausente',
  offline: 'badge-ausente',
  justificado: 'badge-justificado',
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  aprovado: 'Aprovado',
  presente: 'Presente',
  online: 'Online',
  rejeitada: 'Rejeitada',
  rejeitado: 'Rejeitado',
  ausente: 'Ausente',
  offline: 'Offline',
  justificado: 'Justificado',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusClasses[status] || 'badge-pendente',
      className
    )}>
      {label || statusLabels[status] || status}
    </span>
  );
}
