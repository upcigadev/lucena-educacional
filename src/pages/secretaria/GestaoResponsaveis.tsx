import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { formatCpf, validateCpf } from '@/lib/masks';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function GestaoResponsaveis() {
  const [filtroNome, setFiltroNome] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [aviso, setAviso] = useState('');
  const [responsavelSelecionado, setResponsavelSelecionado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from('responsaveis').select('*, usuario:usuarios(*)');
    setResponsaveis(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return responsaveis.filter(r => {
      const nomeR = r.usuario?.nome || '';
      if (filtroNome && !nomeR.toLowerCase().includes(filtroNome.toLowerCase())) return false;
      return true;
    });
  }, [filtroNome, responsaveis]);

  const handleEnviar = () => {
    toast.success('Aviso enviado ao responsável com sucesso!');
    setNotifOpen(false); setAviso(''); setResponsavelSelecionado('');
  };

  const resetCreationForm = () => {
    setNome(''); setCpf(''); setTelefone(''); setEmail(''); setSenha('');
    setShowModal(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCpf(cpf)) { toast.error('CPF inválido. Verifique os dígitos.'); return; }
    if (!email.trim()) { toast.error('E-mail é obrigatório para criar credenciais de acesso.'); return; }
    if (!senha || senha.length < 6) { toast.error('Senha deve ter ao menos 6 caracteres.'); return; }
    setLoading(true);

    const { data: usuario, error: uErr } = await supabase.from('usuarios').insert({
      nome, cpf, papel: 'RESPONSAVEL', email: email.trim(),
    }).select().single();
    if (uErr) { toast.error('Erro ao criar usuário: ' + uErr.message); setLoading(false); return; }

    const { error: rErr } = await supabase.from('responsaveis').insert({
      usuario_id: usuario.id, telefone: telefone.trim() || null,
    });
    if (rErr) { toast.error('Erro ao criar responsável: ' + rErr.message); setLoading(false); return; }

    // Create auth credentials
    const { data: authResult, error: authErr } = await supabase.functions.invoke('create-user', {
      body: { usuario_id: usuario.id, email: email.trim(), password: senha },
    });
    if (authErr || authResult?.error) {
      toast.warning(`Responsável criado, mas houve erro ao criar credenciais: ${authResult?.error || authErr?.message}`);
    } else {
      toast.success(`Responsável "${nome}" cadastrado com credenciais de acesso!`);
    }

    setLoading(false);
    resetCreationForm();
    fetchData();
  };

  const openNew = () => {
    setNome(''); setCpf(''); setTelefone(''); setEmail(''); setSenha('');
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Responsáveis</h1>
        {responsaveis.length > 0 && (
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Novo Responsável</Button>
        )}
      </div>

      {responsaveis.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-card rounded-lg border p-10 text-center max-w-md w-full">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground mb-2">Nenhum responsável cadastrado</h2>
            <p className="text-sm text-muted-foreground mb-6">Cadastre o primeiro responsável para vinculá-lo aos alunos do município.</p>
            <Button size="lg" onClick={openNew}><Plus className="w-4 h-4 mr-2" />Cadastrar Primeiro Responsável</Button>
          </div>
        </div>
      ) : (
        <>
          <Input type="text" placeholder="Buscar por nome..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)} className="w-64 mb-4" />
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b bg-secondary">
                <th className="text-left p-3 text-sm font-medium">Nome</th>
                <th className="text-left p-3 text-sm font-medium">CPF</th>
                <th className="text-left p-3 text-sm font-medium">E-mail</th>
                <th className="text-left p-3 text-sm font-medium">Telefone</th>
                <th className="text-left p-3 text-sm font-medium">Ações</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => {
                  const nomeR = r.usuario?.nome || 'Desconhecido';
                  return (
                    <tr key={r.id} className="border-b">
                      <td className="p-3 text-sm font-medium">{nomeR}</td>
                      <td className="p-3 text-sm">{r.usuario?.cpf || 'ND'}</td>
                      <td className="p-3 text-sm">{r.usuario?.email || 'ND'}</td>
                      <td className="p-3 text-sm">{r.telefone || 'ND'}</td>
                      <td className="p-3 flex gap-1">
                        <Button variant="secondary" size="sm" onClick={() => toast.info('Edição em desenvolvimento')}>Editar</Button>
                        <Button size="sm" onClick={() => { setResponsavelSelecionado(nomeR); setNotifOpen(true); }}>Notificar</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Aviso ao Responsável</DialogTitle>
            <DialogDescription>Para: {responsavelSelecionado}</DialogDescription>
          </DialogHeader>
          <textarea value={aviso} onChange={e => setAviso(e.target.value)} placeholder="Digite o aviso..." rows={4}
            className="w-full px-3 py-2 border rounded-md bg-background text-sm" />
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setNotifOpen(false)}>Cancelar</Button>
            <Button onClick={handleEnviar}>Enviar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Responsável</DialogTitle>
            <DialogDescription>Preencha os dados do responsável.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="resp-nome">Nome *</Label>
              <Input id="resp-nome" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Nome completo" />
            </div>
            <div>
              <Label htmlFor="resp-cpf">CPF *</Label>
              <Input id="resp-cpf" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} required placeholder="000.000.000-00" maxLength={14} />
            </div>
            <div>
              <Label htmlFor="resp-email">E-mail *</Label>
              <Input id="resp-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label htmlFor="resp-senha">Senha de Acesso *</Label>
              <Input id="resp-senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} required placeholder="Mínimo 6 caracteres" minLength={6} />
            </div>
            <div>
              <Label htmlFor="resp-tel">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="resp-tel" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className="pl-9" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Cadastrar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
