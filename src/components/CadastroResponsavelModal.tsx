import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CadastroResponsavelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCadastrado: (novoResp: { id: string; nome: string; cpf: string; whatsapp: string; parentesco: string }) => void;
}

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export default function CadastroResponsavelModal({ open, onOpenChange, onCadastrado }: CadastroResponsavelModalProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [parentesco, setParentesco] = useState('');

  const handleSalvar = () => {
    if (!nome.trim() || !cpf.trim() || !whatsapp.trim() || !parentesco) {
      toast.error('Preencha todos os campos.');
      return;
    }
    const novoId = `novo-${Date.now()}`;
    onCadastrado({ id: novoId, nome, cpf, whatsapp, parentesco });
    toast.success(`Responsável "${nome}" cadastrado e vinculado!`);
    setNome('');
    setCpf('');
    setWhatsapp('');
    setParentesco('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Responsável</DialogTitle>
          <DialogDescription>Preencha os dados do responsável para cadastrá-lo e vinculá-lo ao aluno.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="novoRespNome">Nome Completo</Label>
            <Input id="novoRespNome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="novoRespCpf">CPF</Label>
            <Input id="novoRespCpf" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="novoRespWhatsapp">WhatsApp</Label>
            <Input id="novoRespWhatsapp" value={whatsapp} onChange={e => setWhatsapp(formatPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="novoRespParentesco">Parentesco</Label>
            <select
              id="novoRespParentesco"
              value={parentesco}
              onChange={e => setParentesco(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
            >
              <option value="">Selecione...</option>
              <option value="Mãe">Mãe</option>
              <option value="Pai">Pai</option>
              <option value="Avó/Avô">Avó/Avô</option>
              <option value="Tio(a)">Tio(a)</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSalvar}>Cadastrar e Vincular</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
