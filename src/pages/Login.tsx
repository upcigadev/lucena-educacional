import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, PerfilUsuario } from '@/contexts/AuthContext';
import { School } from 'lucide-react';
import logo from '@/assets/logo-educacional.png';
import { formatCpf } from '@/lib/masks';

const perfis: { value: PerfilUsuario; label: string; desc: string }[] = [
  { value: 'responsavel', label: 'Responsável', desc: 'Acompanhe a frequência dos seus filhos' },
  { value: 'professor', label: 'Professor', desc: 'Gerencie turmas e alunos' },
  { value: 'diretor', label: 'Diretor', desc: 'Administre sua escola' },
  { value: 'secretaria', label: 'Secretaria', desc: 'Gestão municipal de educação' },
];

export default function Login() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [perfilSelecionado, setPerfilSelecionado] = useState<PerfilUsuario>('responsavel');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(perfilSelecionado);
    navigate('/' + perfilSelecionado);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="Logo Educacional" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h1 className="text-xl font-bold text-primary">Prefeitura Municipal de Lucena</h1>
          <p className="text-sm text-muted-foreground mt-1">Sistema Educacional</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-lg shadow-lg border p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-card-foreground mb-1.5">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={e => setCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-card-foreground mb-1.5">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Profile Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Perfil de Acesso <span className="text-xs text-muted-foreground">(demonstração)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {perfis.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPerfilSelecionado(p.value)}
                    className={`p-3 rounded-md border text-left transition-all ${
                      perfilSelecionado === p.value
                        ? 'border-primary bg-secondary ring-2 ring-ring'
                        : 'border-border hover:bg-secondary/50'
                    }`}
                  >
                    <div className="text-sm font-medium text-card-foreground">{p.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
               type="submit"
               className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Entrar
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          © 2026 Prefeitura Municipal de Lucena — Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
