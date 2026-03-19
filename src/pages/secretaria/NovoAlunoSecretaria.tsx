import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserPlus, Fingerprint, CheckCircle2, Loader2, Search, X, Plus } from 'lucide-react';
import CadastroResponsavelModal from '@/components/CadastroResponsavelModal';
import { supabase } from '@/integrations/supabase/client';

export default function NovoAlunoSecretaria() {
  const navigate = useNavigate();

  // Dados do Aluno
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [escolaSel, setEscolaSel] = useState('');
  const [serieSel, setSerieSel] = useState('');
  const [turmaSel, setTurmaSel] = useState('');

  // Responsáveis vinculados
  const [buscaResp, setBuscaResp] = useState('');
  const [responsaveisVinculados, setResponsaveisVinculados] = useState<string[]>([]);
  const [novosResps, setNovosResps] = useState<{ id: string; nome: string; cpf: string; whatsapp: string; parentesco: string }[]>([]);
  const [modalNovoResp, setModalNovoResp] = useState(false);

  // Biometria
  const [bioCapturando, setBioCapturando] = useState(false);
  const [bioRegistrada, setBioRegistrada] = useState(false);

  const [escolas, setEscolas] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [escolasRes, seriesRes, turmasRes, respsRes] = await Promise.all([
      supabase.from('escolas').select('*').order('nome'),
      supabase.from('series').select('*').order('nome'),
      supabase.from('turmas').select('*').order('nome'),
      supabase.from('responsaveis').select('*, usuario:usuarios(*)'),
    ]);
    setEscolas(escolasRes.data || []);
    setSeries(seriesRes.data || []);
    setTurmas(turmasRes.data || []);
    setResponsaveis(respsRes.data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const seriesFiltradas = useMemo(() => escolaSel ? series.filter(s => s.escola_id === escolaSel) : [], [escolaSel, series]);
  const turmasFiltradas = useMemo(() => serieSel ? turmas.filter(t => t.serie_id === serieSel) : [], [serieSel, turmas]);

  const resultadosBusca = useMemo(() => {
    if (!buscaResp.trim()) return [];
    const termo = buscaResp.toLowerCase();
    return responsaveis.filter((r: any) =>
      !responsaveisVinculados.includes(r.id) &&
      ((r.usuario?.nome || '').toLowerCase().includes(termo) || (r.usuario?.cpf || '').includes(termo))
    );
  }, [buscaResp, responsaveisVinculados, responsaveis]);

  const vincularResponsavel = (id: string) => {
    setResponsaveisVinculados(prev => [...prev, id]);
    setBuscaResp('');
  };

  const desvincularResponsavel = (id: string) => {
    setResponsaveisVinculados(prev => prev.filter(r => r !== id));
    setNovosResps(prev => prev.filter(r => r.id !== id));
  };

  const handleNovoRespCadastrado = (novoResp: { id: string; nome: string; cpf: string; whatsapp: string; parentesco: string }) => {
    setNovosResps(prev => [...prev, novoResp]);
    setResponsaveisVinculados(prev => [...prev, novoResp.id]);
    // Refresh responsaveis list to include the newly created one
    fetchData();
  };

  const handleCapturarBiometria = () => {
    setBioCapturando(true);
    setTimeout(() => {
      setBioCapturando(false);
      setBioRegistrada(true);
      toast.success('Padrão facial registrado com sucesso!');
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !matricula.trim() || !dataNascimento || !escolaSel) {
      toast.error('Preencha todos os dados obrigatórios do aluno.');
      return;
    }
    if (responsaveisVinculados.length === 0) {
      toast.error('Vincule ao menos um responsável ao aluno.');
      return;
    }

    setSaving(true);

    // Use the first linked responsavel as the primary
    const responsavelPrincipal = responsaveisVinculados[0];

    const { error } = await supabase.from('alunos').insert({
      nome_completo: nome,
      matricula,
      data_nascimento: dataNascimento,
      escola_id: escolaSel,
      turma_id: turmaSel || null,
      responsavel_id: responsavelPrincipal,
    });

    if (error) {
      toast.error('Erro ao cadastrar aluno: ' + error.message);
      setSaving(false);
      return;
    }

    toast.success('Aluno cadastrado com sucesso!');
    setSaving(false);
    navigate('/secretaria/alunos');
  };

  return (
    <div>
      <button
        onClick={() => navigate('/secretaria/alunos')}
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Gestão de Alunos
      </button>

      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Cadastrar Novo Aluno</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <Tabs defaultValue="dados" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="dados">Dados do Aluno</TabsTrigger>
                <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>
                <TabsTrigger value="biometria">Biometria</TabsTrigger>
              </TabsList>

              {/* ===== ABA 1: DADOS DO ALUNO ===== */}
              <TabsContent value="dados">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo do aluno" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="matricula">Matrícula *</Label>
                    <Input id="matricula" value={matricula} onChange={e => setMatricula(e.target.value)} placeholder="Ex: 2026022" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="dataNasc">Data de Nascimento *</Label>
                    <Input id="dataNasc" type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="escola">Escola *</Label>
                    <select
                      id="escola"
                      value={escolaSel}
                      onChange={e => { setEscolaSel(e.target.value); setSerieSel(''); setTurmaSel(''); }}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                    >
                      <option value="">Selecione a escola...</option>
                      {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>
                  </div>
                  {escolaSel && (
                    <div>
                      <Label htmlFor="serie">Série</Label>
                      <select
                        id="serie"
                        value={serieSel}
                        onChange={e => { setSerieSel(e.target.value); setTurmaSel(''); }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                      >
                        <option value="">Selecione a série...</option>
                        {seriesFiltradas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                      </select>
                    </div>
                  )}
                  {serieSel && (
                    <div>
                      <Label htmlFor="turma">Turma</Label>
                      <select
                        id="turma"
                        value={turmaSel}
                        onChange={e => setTurmaSel(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                      >
                        <option value="">Selecione a turma...</option>
                        {turmasFiltradas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ===== ABA 2: RESPONSÁVEIS ===== */}
              <TabsContent value="responsaveis">
                <div className="space-y-4">
                  <div>
                    <Label>Buscar Responsável Cadastrado</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={buscaResp}
                        onChange={e => setBuscaResp(e.target.value)}
                        placeholder="Buscar por nome ou CPF..."
                        className="pl-9"
                      />
                    </div>
                    {resultadosBusca.length > 0 && (
                      <div className="border rounded-md mt-1 max-h-40 overflow-y-auto bg-background shadow-sm">
                        {resultadosBusca.map((r: any) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => vincularResponsavel(r.id)}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-accent text-left"
                          >
                            <div>
                              <span className="font-medium">{r.usuario?.nome}</span>
                              <span className="text-muted-foreground ml-2">{r.usuario?.cpf}</span>
                            </div>
                            <Plus className="w-4 h-4 text-primary" />
                          </button>
                        ))}
                      </div>
                    )}
                    {buscaResp.trim() && resultadosBusca.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1">Nenhum responsável encontrado.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Responsáveis Vinculados</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => setModalNovoResp(true)}>
                      <UserPlus className="w-4 h-4 mr-1" /> Cadastrar Novo Responsável
                    </Button>
                  </div>
                  {responsaveisVinculados.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum responsável vinculado. Use a busca acima para adicionar ou cadastre um novo.</p>
                  ) : (
                    <div className="space-y-2">
                      {responsaveisVinculados.map(id => {
                        const resp = responsaveis.find(r => r.id === id) || novosResps.find(n => n.id === id);
                        if (!resp) return null;
                        const nomeResp = resp.usuario?.nome || resp.nome;
                        const cpfResp = resp.usuario?.cpf || resp.cpf;
                        return (
                          <div key={id} className="flex items-center justify-between border rounded-md px-3 py-2 bg-muted/30">
                            <div>
                              <span className="text-sm font-medium">{nomeResp}</span>
                              <span className="text-xs text-muted-foreground ml-2">{cpfResp}</span>
                            </div>
                            <button type="button" onClick={() => desvincularResponsavel(id)} className="text-destructive hover:opacity-70">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ===== ABA 3: BIOMETRIA ===== */}
              <TabsContent value="biometria">
                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                  <Fingerprint className="w-16 h-16 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Capture o padrão facial do aluno utilizando o dispositivo de reconhecimento conectado.
                  </p>
                  {bioRegistrada ? (
                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-3 rounded-lg font-medium">
                      <CheckCircle2 className="w-5 h-5" />
                      Padrão Facial Registrado
                    </div>
                  ) : (
                    <Button type="button" onClick={handleCapturarBiometria} disabled={bioCapturando} size="lg">
                      {bioCapturando ? (<><Loader2 className="w-4 h-4 animate-spin" /> Capturando...</>) : 'Capturar Biometria no Aparelho'}
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-6 mt-6 border-t">
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Aluno'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/secretaria/alunos')}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <CadastroResponsavelModal
        open={modalNovoResp}
        onOpenChange={setModalNovoResp}
        onCadastrado={handleNovoRespCadastrado}
      />
    </div>
  );
}
