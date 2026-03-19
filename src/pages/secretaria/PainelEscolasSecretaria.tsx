import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { School, Plus, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PainelEscolasSecretaria() {
  const [escolas, setEscolas] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: '', inep: '', telefone: '', endereco: '' });

  const fetchEscolas = async () => {
    const { data, error } = await supabase.from('escolas').select('*').order('created_at');
    if (error) { toast.error('Erro ao carregar escolas.'); return; }
    setEscolas(data || []);
  };

  useEffect(() => { fetchEscolas(); }, []);

  const resetForm = () => setForm({ nome: '', inep: '', telefone: '', endereco: '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) { toast.error('Informe o nome da escola.'); return; }
    setLoading(true);
    const { error } = await supabase.from('escolas').insert({
      nome: form.nome.trim(),
      inep: form.inep.trim() || null,
      telefone: form.telefone.trim() || null,
      endereco: form.endereco.trim() || null,
    });
    setLoading(false);
    if (error) { toast.error('Erro ao salvar escola: ' + error.message); return; }
    toast.success(`Escola "${form.nome}" cadastrada com sucesso!`);
    resetForm();
    setShowModal(false);
    fetchEscolas();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Escolas do Município</h1>
        {escolas.length > 0 && (
          <Button onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Escola
          </Button>
        )}
      </div>

      {escolas.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-card rounded-lg border p-10 text-center max-w-md w-full">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <School className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground mb-2">Nenhuma escola cadastrada</h2>
            <p className="text-sm text-muted-foreground mb-6">Comece cadastrando a primeira escola do município para gerenciar turmas, alunos e frequência.</p>
            <Button size="lg" onClick={() => { resetForm(); setShowModal(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeira Escola
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escolas.map(escola => (
            <Link key={escola.id} to={`/secretaria/escola/${escola.id}`} className="block">
              <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <School className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-card-foreground">{escola.nome}</h3>
                    {escola.inep && <p className="text-xs text-muted-foreground">INEP: {escola.inep}</p>}
                  </div>
                </div>
                {escola.telefone && <p className="text-sm text-muted-foreground">{escola.telefone}</p>}
                {escola.endereco && <p className="text-sm text-muted-foreground">{escola.endereco}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Escola</DialogTitle>
            <DialogDescription>Preencha os dados para cadastrar uma nova escola.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="nome">Nome da Escola *</Label>
              <Input id="nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Escola Municipal João da Silva" required />
            </div>
            <div>
              <Label htmlFor="inep">Código INEP</Label>
              <Input id="inep" value={form.inep} onChange={e => setForm(f => ({ ...f, inep: e.target.value }))} placeholder="Opcional" />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="telefone" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" className="pl-9" />
              </div>
            </div>
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="endereco" value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} placeholder="Rua, número, bairro" className="pl-9" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Escola'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
