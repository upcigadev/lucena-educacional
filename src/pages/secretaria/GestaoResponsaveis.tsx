import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { formatCpf, validateCpf } from '@/lib/masks';
import { supabase } from '@/integrations/supabase/client';
import { Users, Plus, Phone, ArrowLeft, User } from 'lucide-react';
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
  const [alunoResponsaveis, setAlunoResponsaveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Detail view
  const [detalheId, setDetalheId] = useState<string | null>(null);

  const fetchData = async () => {
    const [{ data: resps }, { data: arData }] = await Promise.all([
      supabase.from('responsaveis').select('*, usuario:usuarios(*)'),
      supabase.from('aluno_responsaveis').select('*, aluno:alunos(*, turma:turmas(nome, serie:series(nome)))'),
    ]);
    setResponsaveis(resps || []);
    setAlunoResponsaveis(arData || []);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return responsaveis.filter(r => {
      const nomeR = r.usuario?.nome || '';
      if (filtroNome && !nomeR.toLowerCase().includes(filtroNome.toLowerCase())) return false;
      return true;
    });
  }, [filtroNome, responsaveis]);

  const detalheResp = useMemo(() => detalheId ? responsaveis.find(r => r.id === detalheId) : null, [detalheId, responsaveis]);
  const alunosDoResp = useMemo(() => detalheId ? alunoResponsaveis.filter((ar: any) => ar.responsavel_id === detalheId).map((ar: any) => ({ ...ar.aluno, parentesco: ar.parentesco || 'Responsável' })) : [], [detalheId, alunoResponsaveis]);

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

  // Detail view
  if (detalheResp) {
    return (
      <div>
        <button onClick={() => setDetalheId(null)} className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar para Responsáveis
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{detalheResp.usuario?.nome}</h1>
            <p className="text-sm text-muted-foreground">
              CPF: {detalheResp.usuario?.cpf} · Tel: {detalheResp.telefone || 'ND'} · E-mail: {detalheResp.usuario?.email || 'ND'}
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-3">Alunos Associados ({alunosDoResp.length})</h2>
        {alunosDoResp.length === 0 ? (
          <div className="bg-card rounded-lg border p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum aluno vinculado a este responsável.</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary">
                  <th className="text-left p-3 text-sm font-medium">Nome</th>
                  <th className="text-left p-3 text-sm font-medium">Parentesco</th>
                  <th className="text-left p-3 text-sm font-medium">Matrícula</th>
                  <th className="text-left p-3 text-sm font-medium">Série / Turma</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {alunosDoResp.map(a => (
                  <tr key={a.id} className="border-b">
                    <td className="p-3 text-sm font-medium">{a.nome_completo}</td>
                    <td className="p-3 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                        {a.parentesco}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{a.matricula}</td>
                    <td className="p-3 text-sm">
                      {a.turma ? `${a.turma.serie?.nome || ''} – ${a.turma.nome}` : 'Sem turma'}
                    </td>
                    <td className="p-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${a.ativo ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                        {a.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

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
                <th className="text-left p-3 text-sm font-medium">Dependentes</th>
                <th className="text-left p-3 text-sm font-medium">Ações</th>
              </tr></thead>
              <tbody>
                {filtered.map(r => {
                  const nomeR = r.usuario?.nome || 'Desconhecido';
                  const qtdAlunos = alunoResponsaveis.filter((ar: any) => ar.responsavel_id === r.id).length;
                  return (
                    <tr key={r.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => setDetalheId(r.id)}>
                      <td className="p-3 text-sm font-medium text-primary hover:underline">{nomeR}</td>
                      <td className="p-3 text-sm">{r.usuario?.cpf || 'ND'}</td>
                      <td className="p-3 text-sm">{r.usuario?.email || 'ND'}</td>
                      <td className="p-3 text-sm">{r.telefone || 'ND'}</td>
                      <td className="p-3 text-sm">{qtdAlunos} aluno(s)</td>
                      <td className="p-3 flex gap-1" onClick={e => e.stopPropagation()}>
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
