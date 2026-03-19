import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo-educacional.png';
import { formatCpf } from '@/lib/masks';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setErro('CPF inválido.');
      return;
    }
    if (!senha) {
      setErro('Informe a senha.');
      return;
    }

    setLoading(true);
    const result = await login(cpf, senha);
    setLoading(false);

    if (result.error) {
      setErro(result.error);
    }
    // Navigation happens via useEffect in App when perfil changes
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
            {erro && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
                {erro}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-card-foreground mb-1.5">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={e => { setCpf(formatCpf(e.target.value)); setErro(''); }}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-card-foreground mb-1.5">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => { setSenha(e.target.value); setErro(''); }}
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Entrando...' : 'Entrar'}
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
