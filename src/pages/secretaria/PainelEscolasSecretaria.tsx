import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { School, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function PainelEscolasSecretaria() {
  const [escolas, setEscolas] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [nome, setNome] = useState('');
  const [inep, setInep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');

  const fetchEscolas = async () => {
    try {
      const data = await window.api?.escola?.listar?.();
      setEscolas(data || []);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao carregar escolas.');
    }
  };

  useEffect(() => {
    fetchEscolas();
  }, []);

  const handleCreateEscola = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      toast.error('O nome da escola é obrigatório.');
      return;
    }

    try {
      await window.api?.escola?.criar?.({
        nome,
        inep,
        telefone,
        endereco
      });

      toast.success('Escola cadastrada com sucesso!');
      setIsModalOpen(false);
      
      // Reset form
      setNome('');
      setInep('');
      setTelefone('');
      setEndereco('');

      // Refresh data
      fetchEscolas();
    } catch (error) {
      console.error(error);
      toast.error('Falha ao criar a escola.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Escolas do Município</h1>
        {escolas.length > 0 && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Escola
          </Button>
        )}
      </div>
      
      {escolas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-lg shadow-sm">
          <School className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold text-card-foreground mb-2">Nenhuma escola cadastrada</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-sm">
            O sistema ainda não possui nenhuma escola registrada. Comece adicionando a primeira escola do município.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            Cadastrar Primeira Escola
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escolas.map(escola => {
            const series = escola.series || [];
            return (
              <Link key={escola.id} to={`/secretaria/escola/${escola.id}`} className="block">
                <div className="bg-card rounded-lg border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <School className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-card-foreground">{escola.nome}</h3>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    100%
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Frequência média</p>
                  <p className="text-sm text-muted-foreground">{series.length} série(s)</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {series.map((s: any) => (
                      <span key={s.id} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">{s.nome}</span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Escola</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEscola}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome da Escola</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: E.M. João e Maria"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inep">INEP</Label>
                <Input
                  id="inep"
                  value={inep}
                  onChange={(e) => setInep(e.target.value)}
                  placeholder="Ex: 12345678"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Ex: (00) 0000-0000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
