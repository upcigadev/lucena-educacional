import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatCpf, validateCpf } from '@/lib/masks';
import { supabase } from '@/integrations/supabase/client';
import { UserCog, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function GestaoDiretores() {
  const [lista, setLista] = useState<any[]>([]);
  const [escolas, setEscolas] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [escolasSel, setEscolasSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const [{ data: diretores }, { data: escolasData }] = await Promise.all([
      supabase.from('diretores').select('*, usuario:usuarios(*), escola:escolas(*)'),
      supabase.from('escolas').select('*').order('nome'),
    ]);
    setLista(diretores || []);
    setEscolas(escolasData || []);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setNome(''); setCpf(''); setEscolasSel([]);
    setShowModal(false); setEditId(null);
  };

  const openEdit = (id: string) => {
    const d = lista.find(x => x.id === id);
    if (!d) return;
    setNome(d.usuario?.nome || '');
    setCpf(d.usuario?.cpf || '');
    setEscolasSel(d.escola_id ? [d.escola_id] : []);
    setEditId(id);
    setShowModal(true);
  };

  const toggleEscola = (id: string) => {
    setEscolasSel(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCpf(cpf)) { toast.error('CPF inválido. Verifique os dígitos.'); return; }
    if (escolasSel.length === 0) { toast.error('Selecione ao menos uma escola.'); return; }
    setLoading(true);

    if (editId) {
      const d = lista.find(x => x.id === editId);
      if (d?.usuario?.id) {
        await supabase.from('usuarios').update({ nome, cpf }).eq('id', d.usuario.id);
        await supabase.from('diretores').update({ escola_id: escolasSel[0] }).eq('id', editId);
      }
      toast.success('Diretor atualizado com sucesso!');
    } else {
      const { data: usuario, error: uErr } = await supabase.from('usuarios').insert({
        nome, cpf, papel: 'DIRETOR', email: `${cpf.replace(/\D/g, '')}@diretor.local`,
      }).select().single();
      if (uErr) { toast.error('Erro ao criar usuário: ' + uErr.message); setLoading(false); return; }

      const { error: dErr } = await supabase.from('diretores').insert({
        usuario_id: usuario.id, escola_id: escolasSel[0],
      });
      if (dErr) { toast.error('Erro ao criar diretor: ' + dErr.message); setLoading(false); return; }
      toast.success(`Diretor "${nome}" cadastrado com sucesso!`);
    }

    setLoading(false);
    resetForm();
    fetchData();
  };

  const openNew = () => {
    setNome(''); setCpf(''); setEscolasSel([]);
    setEditId(null); setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Diretores</h1>
        {lista.length > 0 && (
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Novo Diretor</Button>
        )}
      </div>

      {lista.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-card rounded-lg border p-10 text-center max-w-md w-full">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <UserCog className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground mb-2">Nenhum diretor cadastrado</h2>
            <p className="text-sm text-muted-foreground mb-6">Cadastre o primeiro diretor para vinculá-lo a uma escola do município.</p>
            <Button size="lg" onClick={openNew}><Plus className="w-4 h-4 mr-2" />Cadastrar Primeiro Diretor</Button>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b bg-secondary">
              <th className="text-left p-3 text-sm font-medium">Nome</th>
              <th className="text-left p-3 text-sm font-medium">CPF</th>
              <th className="text-left p-3 text-sm font-medium">Escola</th>
              <th className="text-left p-3 text-sm font-medium">Ações</th>
            </tr></thead>
            <tbody>
              {lista.map(d => (
                <tr key={d.id} className="border-b">
                  <td className="p-3 text-sm font-medium">{d.usuario?.nome}</td>
                  <td className="p-3 text-sm">{d.usuario?.cpf}</td>
                  <td className="p-3 text-sm">{d.escola?.nome || ''}</td>
                  <td className="p-3">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(d.id)}>Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Diretor' : 'Novo Diretor'}</DialogTitle>
            <DialogDescription>Preencha os dados do diretor e vincule a uma escola.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="dir-nome">Nome *</Label>
              <Input id="dir-nome" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Nome completo" />
            </div>
            <div>
              <Label htmlFor="dir-cpf">CPF *</Label>
              <Input id="dir-cpf" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} required placeholder="000.000.000-00" maxLength={14} />
            </div>
            <div>
              <Label>Escola vinculada *</Label>
              <div className="space-y-2 border rounded-md p-3 bg-background max-h-40 overflow-y-auto mt-1">
                {escolas.map((e: any) => (
                  <label key={e.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={escolasSel.includes(e.id)} onCheckedChange={() => toggleEscola(e.id)} />
                    <span>{e.nome}</span>
                  </label>
                ))}
                {escolas.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma escola cadastrada.</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : editId ? 'Salvar' : 'Cadastrar'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
