import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';
import { toast } from 'sonner';
import { formatCpf, validateCpf } from '@/lib/masks';
import { supabase } from '@/integrations/supabase/client';

interface CadastroResponsavelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCadastrado: (novoResp: { id: string; nome: string; cpf: string; whatsapp: string; parentesco: string }) => void;
}

export default function CadastroResponsavelModal({ open, onOpenChange, onCadastrado }: CadastroResponsavelModalProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNome(''); setCpf(''); setEmail(''); setSenha(''); setTelefone(''); setParentesco('');
  };

  const handleSalvar = async () => {
    if (!nome.trim() || !cpf.trim() || !parentesco) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!validateCpf(cpf)) {
      toast.error('CPF inválido. Verifique os dígitos.');
      return;
    }
    if (!email.trim()) {
      toast.error('E-mail é obrigatório para criar credenciais de acesso.');
      return;
    }
    if (!senha || senha.length < 6) {
      toast.error('Senha deve ter ao menos 6 caracteres.');
      return;
    }

    setLoading(true);

    // Create usuario
    const { data: usuario, error: uErr } = await supabase.from('usuarios').insert({
      nome, cpf, papel: 'RESPONSAVEL', email: email.trim(),
    }).select().single();

    if (uErr) {
      toast.error('Erro ao criar usuário: ' + uErr.message);
      setLoading(false);
      return;
    }

    // Create responsavel
    const { data: resp, error: rErr } = await supabase.from('responsaveis').insert({
      usuario_id: usuario.id, telefone: telefone.trim() || null,
    }).select().single();

    if (rErr) {
      toast.error('Erro ao criar responsável: ' + rErr.message);
      setLoading(false);
      return;
    }

    // Create auth credentials
    const { data: authResult, error: authErr } = await supabase.functions.invoke('create-user', {
      body: { usuario_id: usuario.id, email: email.trim(), password: senha },
    });

    if (authErr || authResult?.error) {
      toast.warning(`Responsável criado, mas houve erro ao criar credenciais: ${authResult?.error || authErr?.message}`);
    } else {
      toast.success(`Responsável "${nome}" cadastrado e vinculado!`);
    }

    onCadastrado({ id: resp.id, nome, cpf, whatsapp: telefone, parentesco });
    resetForm();
    setLoading(false);
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
            <Label>Nome Completo *</Label>
            <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" className="mt-1" />
          </div>
          <div>
            <Label>CPF *</Label>
            <Input value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} className="mt-1" />
          </div>
          <div>
            <Label>E-mail *</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" className="mt-1" />
          </div>
          <div>
            <Label>Senha de Acesso *</Label>
            <Input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} className="mt-1" />
          </div>
          <div>
            <Label>Telefone / WhatsApp</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="pl-9" />
            </div>
          </div>
          <div>
            <Label>Parentesco *</Label>
            <select
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
          <Button onClick={handleSalvar} disabled={loading}>
            {loading ? 'Salvando...' : 'Cadastrar e Vincular'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
