import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { turmas, series, responsaveis } from '@/data/mockData';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserPlus, Fingerprint, CheckCircle2, Loader2 } from 'lucide-react';

export default function NovoAluno() {
  const navigate = useNavigate();

  // Aba Dados do Aluno
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [serieSel, setSerieSel] = useState('');
  const [turmaSel, setTurmaSel] = useState('');

  // Aba Responsável
  const [nomeResp, setNomeResp] = useState('');
  const [cpfResp, setCpfResp] = useState('');
  const [telefoneResp, setTelefoneResp] = useState('');

  // Aba Biometria
  const [bioCapturando, setBioCapturando] = useState(false);
  const [bioRegistrada, setBioRegistrada] = useState(false);

  const seriesEscola = series.filter(s => s.escolaId === '1');
  const turmasFiltradas = turmas.filter(t => t.serieId === serieSel);

  const handleCapturarBiometria = () => {
    setBioCapturando(true);
    setTimeout(() => {
      setBioCapturando(false);
      setBioRegistrada(true);
      toast.success('Padrão facial registrado com sucesso!');
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Aluno cadastrado com sucesso!');
    navigate('/diretor/alunos');
  };

  return (
    <div>
      <button
        onClick={() => navigate('/diretor/alunos')}
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
                <TabsTrigger value="responsavel">Responsável</TabsTrigger>
                <TabsTrigger value="biometria">Biometria</TabsTrigger>
              </TabsList>

              {/* ===== ABA 1: DADOS DO ALUNO ===== */}
              <TabsContent value="dados">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      placeholder="Nome completo do aluno"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="matricula">Matrícula</Label>
                    <Input
                      id="matricula"
                      value={matricula}
                      onChange={e => setMatricula(e.target.value)}
                      placeholder="Ex: 2026022"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataNasc">Data de Nascimento</Label>
                    <Input
                      id="dataNasc"
                      type="date"
                      value={dataNascimento}
                      onChange={e => setDataNascimento(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serie">Série</Label>
                    <select
                      id="serie"
                      value={serieSel}
                      onChange={e => { setSerieSel(e.target.value); setTurmaSel(''); }}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                    >
                      <option value="">Selecione a série...</option>
                      {seriesEscola.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                  </div>
                  {serieSel && (
                    <div>
                      <Label htmlFor="turma">Turma</Label>
                      <select
                        id="turma"
                        value={turmaSel}
                        onChange={e => setTurmaSel(e.target.value)}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                      >
                        <option value="">Selecione a turma...</option>
                        {turmasFiltradas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ===== ABA 2: RESPONSÁVEL ===== */}
              <TabsContent value="responsavel">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nomeResp">Nome do Responsável</Label>
                    <Input
                      id="nomeResp"
                      value={nomeResp}
                      onChange={e => setNomeResp(e.target.value)}
                      placeholder="Nome completo do responsável"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpfResp">CPF</Label>
                    <Input
                      id="cpfResp"
                      value={cpfResp}
                      onChange={e => setCpfResp(e.target.value)}
                      placeholder="000.000.000-00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefoneResp">Telefone de Contato</Label>
                    <Input
                      id="telefoneResp"
                      value={telefoneResp}
                      onChange={e => setTelefoneResp(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="mt-1"
                    />
                  </div>
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
                    <Button
                      type="button"
                      onClick={handleCapturarBiometria}
                      disabled={bioCapturando}
                      size="lg"
                    >
                      {bioCapturando ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Capturando...
                        </>
                      ) : (
                        'Capturar Biometria no Aparelho'
                      )}
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Botões de ação */}
            <div className="flex gap-3 pt-6 mt-6 border-t">
              <Button type="submit">Salvar Aluno</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/diretor/alunos')}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
